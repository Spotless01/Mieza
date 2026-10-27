(() => {
  "use strict";

  // =====================================================
  // 1. CONFIGURATION
  // =====================================================

  const API_URL = (["localhost", "127.0.0.1"].includes(window.location.hostname))
    ? "http://localhost:5001/api"
    : "https://mieza.onrender.com/api";

  const $ = (id) => document.getElementById(id);

  const money = (amount) =>
    `GH₵${Number(amount || 0).toFixed(2)}`;

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  // Use the storage key that is compatible with the
  // existing booking page and future customer login page.
  function getToken() {
    return (
      localStorage.getItem("customerToken") ||
      localStorage.getItem("customerAuthToken")
    );
  }

  // =====================================================
  // 2. PAGE ELEMENTS
  // =====================================================

  const fields = {
    pickup: $("pickup"),
    destination: $("destination"),
    pickupLat: $("pickupLat"),
    pickupLng: $("pickupLng"),
    destinationLat: $("destinationLat"),
    destinationLng: $("destinationLng")
  };

  const notice = $("notice");
  const requestButton = $("requestRide");
  const rideForm = $("rideForm");
  const rideMapElement = $("rideMap");

  // =====================================================
  // 3. RIDE AND MAP STATE
  // =====================================================

  let map = null;
  let pickupMarker = null;
  let destinationMarker = null;
  let routeLine = null;
  let liveRouteLine = null;
  let liveDriverMarker = null;
  let livePickupMarker = null;
  let liveDestinationMarker = null;
  let lastLiveRouteKey = "";

  let routeDistanceKm = null;
  let routeDurationMin = null;
  let activeRideId = localStorage.getItem("activeMiezaCustomerRideId") || null;
  let rideStatusPollHandle = null;
  let statusPollBusy = false;
  let isSubmitting = false;

  // =====================================================
  // 4. NOTIFICATIONS
  // =====================================================

  function setNotice(message, type = "") {
    if (!notice) return;

    notice.textContent = message;
    notice.className = `notice ${type}`.trim();
  }

  // Customer session controls: customer auth is kept separate from shop/driver auth.
  function renderCustomerAuthControls() {
    const nav = document.getElementById("customerAuthNav");
    if (!nav) return;

    const token = getToken();
    let customer = null;
    try {
      customer = JSON.parse(localStorage.getItem("miezaCustomer") || "null");
    } catch {
      customer = null;
    }

    if (token) {
      const name = customer?.fullName ? `Hi, ${customer.fullName}` : "My account";
      nav.innerHTML = `
        <span class="customer-greeting">${escapeHtml(name)}</span>
        <button type="button" class="customer-logout" id="customerLogout">Log out</button>
      `;
      document.getElementById("customerLogout")?.addEventListener("click", () => {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerAuthToken");
        localStorage.removeItem("miezaCustomer");
        activeRideId = null;
        localStorage.removeItem("activeMiezaCustomerRideId");
        if (rideStatusPollHandle) clearInterval(rideStatusPollHandle);
        rideStatusPollHandle = null;
        const activePanel = document.getElementById("activeRide");
        if (activePanel) { activePanel.hidden = true; activePanel.innerHTML = ""; }

  // =====================================================
  // Mieza location autocomplete and compact map picker
  // =====================================================
  const mapPanel = $("mapPanel");
  let activeMapPoint = "pickup";
  function openMapPicker(which) {
    activeMapPoint = which || "pickup";
    if (mapPanel) mapPanel.classList.add("map-picker-open");
    document.body.classList.add("map-picker-active");
    if (map) {
      // Recalculate Leaflet dimensions after the expanded panel finishes laying out.
      [120, 320].forEach(delay => setTimeout(() => {
        map.invalidateSize({ pan: false, animate: false });
        const point = coordinates(activeMapPoint);
        const fallbackPoint = activeMapPoint === "destination" ? coordinates("pickup") : null;
        if (validPoint(point)) {
          map.setView([point.lat, point.lng], 16, { animate: false });
        } else if (validPoint(fallbackPoint)) {
          map.setView([fallbackPoint.lat, fallbackPoint.lng], 15, { animate: false });
        } else if (activeMapPoint === "pickup" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const here = [position.coords.latitude, position.coords.longitude];
            map.setView(here, 16, { animate: false });
          }, () => map.setView([5.6037, -0.1870], 12, { animate: false }), { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 });
        } else {
          map.setView([5.6037, -0.1870], 12, { animate: false });
        }
      }, delay));
    }
  }
  function closeMapPicker() {
    mapPanel?.classList.remove("map-picker-open");
    document.body.classList.remove("map-picker-active");
    if (map) setTimeout(() => map.invalidateSize(), 120);
  }
  document.querySelectorAll("[data-map-point]").forEach(button => {
    button.addEventListener("click", () => openMapPicker(button.dataset.mapPoint));
  });
  $("closeMapPicker")?.addEventListener("click", closeMapPicker);
  if (mapPanel) {
    const oldMapClick = mapPanel.querySelector("#rideMap");
    // Clicking a map point while picker is open selects the currently requested field.
    if (oldMapClick && typeof L !== "undefined") {
      // The existing map click handler is wrapped by the map's own event below.
      // This handler only updates which field is targeted; normal map clicks stay functional.
    }
  }

  function selectPlace(which, place) {
    const point = { lat: Number(place.lat), lng: Number(place.lng) };
    if (!validPoint(point)) return;
    setPoint(which, point, place.address || place.name || "");
    const box = $(which + "Suggestions");
    if (box) { box.hidden = true; box.innerHTML = ""; }
    setNotice(`${which === "pickup" ? "Pickup" : "Destination"} location selected.`, "success");
  }
  function showPlaceSuggestions(which, places) {
    const box = $(which + "Suggestions");
    if (!box) return;
    box.innerHTML = "";
    places.slice(0, 5).forEach(place => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      button.textContent = place.address || place.name;
      button.addEventListener("click", () => selectPlace(which, place));
      box.appendChild(button);
    });
    box.hidden = places.length === 0;
  }
  // Without a Google key, provide a no-key OpenStreetMap search fallback.
  // Respect the public Nominatim service's usage limits; for high traffic, proxy/cache via backend.
  ["pickup", "destination"].forEach(which => {
    const input = fields[which];
    if (!input) return;
    let debounce;
    input.addEventListener("input", () => {
      clearTimeout(debounce);
      fields[which + "Lat"].value = "";
      fields[which + "Lng"].value = "";
      clearRoute();
      const query = input.value.trim();
      if (query.length < 3 || window.google?.maps?.places) {
        const box = $(which + "Suggestions");
        if (box) box.hidden = true;
        return;
      }
      debounce = setTimeout(async () => {
        try {
          const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=gh&q=" + encodeURIComponent(query);
          const response = await fetch(url, { headers: { "Accept": "application/json" } });
          if (!response.ok) return;
          const results = await response.json();
          showPlaceSuggestions(which, results.map(item => ({
            lat: item.lat, lng: item.lon, name: item.name, address: item.display_name
          })));
        } catch { /* Keep typing available if search is temporarily unavailable. */ }
      }, 450);
    });
  });

  function initGooglePlacesAutocomplete() {
    if (!window.google?.maps?.places?.Autocomplete) return;
    ["pickup", "destination"].forEach(which => {
      const input = fields[which];
      if (!input || input.dataset.googleAutocomplete === "true") return;
      input.dataset.googleAutocomplete = "true";
      const autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "geometry", "name"],
        componentRestrictions: { country: "gh" }
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const location = place.geometry?.location;
        if (!location) {
          setNotice("Choose one of the suggested addresses to set its map location.", "error");
          return;
        }
        const box = $(which + "Suggestions");
        if (box) box.hidden = true;
        selectPlace(which, {
          lat: location.lat(), lng: location.lng(),
          address: place.formatted_address || place.name
        });
      });
    });
  }
  window.initMiezaGooglePlaces = initGooglePlacesAutocomplete;
  const mapsKey = window.MIEZA_GOOGLE_MAPS_API_KEY || "";
  if (mapsKey && !mapsKey.includes("PASTE_")) {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(mapsKey) + "&libraries=places&callback=initMiezaGooglePlaces";
    script.async = true; script.defer = true;
    script.onerror = () => setNotice("Google address search could not load. Basic address search remains available.", "error");
    document.head.appendChild(script);
  }

  renderCustomerAuthControls();
        setNotice("You have been logged out. Sign in to request a ride.", "success");
        if (requestButton) { requestButton.disabled = false; requestButton.textContent = "Find my ride →"; }
      });
    } else {
      nav.innerHTML = `
        <a href="ride-customer-login.html">Sign in</a>
        <a class="customer-register-link" href="ride-customer-register.html">Create account</a>
      `;
    }
  }

  // =====================================================
  // 5. LOCATION HELPERS
  // =====================================================

  function coordinates(which) {
    const latitude = fields[`${which}Lat`];
    const longitude = fields[`${which}Lng`];

    return {
      lat: Number(latitude?.value),
      lng: Number(longitude?.value)
    };
  }

  function validPoint(point) {
    return (
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lng) <= 180
    );
  }

  function hasCoordinates(which) {
    const lat = fields[`${which}Lat`]?.value.trim();
    const lng = fields[`${which}Lng`]?.value.trim();

    return lat !== "" && lng !== "" && validPoint(coordinates(which));
  }

  // Mirrors the backend default fare formula for an immediate customer estimate.
  // The backend remains authoritative and may apply updated admin rates.
  const DEFAULT_RIDE_FLAT_FEE = 10;
  const DEFAULT_RIDE_PER_KM_RATE = 2;

  function updateEstimatedFare() {
    const fareElement = $("fareText");
    if (!fareElement) return;
    if (!Number.isFinite(routeDistanceKm) || routeDistanceKm <= 0) {
      fareElement.textContent = "Enter both locations";
      return;
    }
    const estimate = DEFAULT_RIDE_FLAT_FEE + routeDistanceKm * DEFAULT_RIDE_PER_KM_RATE;
    fareElement.textContent = `Approx. ${money(estimate)}`;
  }

  function clearRoute() {
    routeDistanceKm = null;
    routeDurationMin = null;

    if (routeLine && map) {
      routeLine.remove();
      routeLine = null;
    }

    if ($("distanceText")) $("distanceText").textContent = "—";
    if ($("durationText")) $("durationText").textContent = "—";
    if ($("fareText")) $("fareText").textContent = "Enter both locations";
  }

  function invalidateRoute() {
    clearRoute();
    setNotice(
      "A location changed. Calculate the route again before requesting your ride."
    );
  }

  // =====================================================
  // 6. MAP MARKERS AND LOCATION SELECTION
  // =====================================================

  function setPoint(which, latlng, address = "") {
    if (!map || !fields[`${which}Lat`] || !fields[`${which}Lng`]) {
      throw new Error("The map or location fields are not ready.");
    }

    const point = {
      lat: Number(latlng.lat),
      lng: Number(latlng.lng)
    };

    if (!validPoint(point)) {
      throw new Error("Please select a valid location.");
    }

    fields[`${which}Lat`].value = point.lat.toFixed(6);
    fields[`${which}Lng`].value = point.lng.toFixed(6);

    if (address && fields[which]) {
      fields[which].value = address;
    }

    const markerIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          width:18px;
          height:18px;
          border:4px solid white;
          border-radius:50%;
          background:${which === "pickup" ? "#0d7654" : "#e5a13b"};
          box-shadow:0 2px 8px #0004;
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    const markerPosition = [point.lat, point.lng];

    if (which === "pickup") {
      if (pickupMarker) {
        pickupMarker.setLatLng(markerPosition);
      } else {
        pickupMarker = L.marker(markerPosition, {
          icon: markerIcon
        }).addTo(map).bindPopup("Pickup");
      }
    } else {
      if (destinationMarker) {
        destinationMarker.setLatLng(markerPosition);
      } else {
        destinationMarker = L.marker(markerPosition, {
          icon: markerIcon
        }).addTo(map).bindPopup("Destination");
      }
    }

    if (pickupMarker && destinationMarker) {
      map.fitBounds(
        L.latLngBounds(
          pickupMarker.getLatLng(),
          destinationMarker.getLatLng()
        ).pad(0.2)
      );
    } else {
      map.setView(markerPosition, 14);
    }

    clearRoute();

    if (hasCoordinates("pickup") && hasCoordinates("destination")) {
      updateRoute().catch((error) => {
        console.error("Route calculation failed:", error);
      });
    }
  }

  // =====================================================
  // 7. ADDRESS SEARCH
  // =====================================================

  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );

      if (!response.ok) return "";

      const data = await response.json();
      return data.display_name || "";
    } catch {
      return "";
    }
  }

  async function geocode(query) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=gh&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Map search is temporarily unavailable.");
    }

    const results = await response.json();

    if (!results.length) {
      throw new Error(
        `Couldn't find "${query}". Try a more specific address or select it on the map.`
      );
    }

    return {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
      address: results[0].display_name
    };
  }

  // =====================================================
  // 8. ROUTE CALCULATION
  // =====================================================

  async function updateRoute() {

    const pickup = coordinates("pickup");
    const destination = coordinates("destination");

    if (!validPoint(pickup) || !validPoint(destination)) {
      clearRoute();
      return;
    }

    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}` +
        "?overview=full&geometries=geojson";

      const response = await fetch(url);
      const data = await response.json();

      if (
        !response.ok ||
        data.code !== "Ok" ||
        !data.routes?.length
      ) {
        throw new Error("No driving route was found.");
      }

      const route = data.routes[0];

      routeDistanceKm = Number((route.distance / 1000).toFixed(1));
      routeDurationMin = Math.max(1, Math.round(route.duration / 60));

      if ($("distanceText")) {
        $("distanceText").textContent = `${routeDistanceKm} km`;
      }

      if ($("durationText")) {
        $("durationText").textContent = `${routeDurationMin} min`;
      }

      if (routeLine) routeLine.remove();

      routeLine = L.geoJSON(
        {
          type: "Feature",
          geometry: route.geometry
        },
        {
          style: {
            color: "#0d7654",
            weight: 5,
            opacity: 0.8
          }
        }
      ).addTo(map);

      map.fitBounds(routeLine.getBounds().pad(0.15));

      updateEstimatedFare();
    } catch (error) {
      clearRoute();
      setNotice(
        error.message || "Route calculation failed. Please try again.",
        "error"
      );
      throw error;
    }
  }

  async function resolveTypedLocations() {
    for (const which of ["pickup", "destination"]) {
      if (hasCoordinates(which)) continue;

      const address = fields[which]?.value.trim();

      if (!address) {
        throw new Error(
          `Enter a ${which === "pickup" ? "pickup" : "destination"} address.`
        );
      }

      const point = await geocode(address);

      setPoint(which, point, point.address);
      fields[which].value = point.address;
    }

    const pickup = coordinates("pickup");
    const destination = coordinates("destination");

    if (!validPoint(pickup) || !validPoint(destination)) {
      throw new Error("Please select valid pickup and destination points.");
    }

    // Always calculate a fresh route for the selected locations.
    await updateRoute();

    if (!routeDistanceKm || !routeDurationMin) {
      throw new Error("A valid route could not be calculated.");
    }
  }

  // =====================================================
  // 9. AUTHENTICATED API REQUESTS
  // =====================================================

  async function api(path, options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Please sign in to your Mieza customer account before requesting a ride."
      );
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      // The server may return an empty response.
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status}).`
      );
    }

    return data;
  }

  // =====================================================
  // 10. DISPLAY RIDE STATUS
  // =====================================================

  function ridePoint(location) {
    const lat = Number(location?.latitude ?? location?.lat);
    const lng = Number(location?.longitude ?? location?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
      ? { lat, lng } : null;
  }

  function markerIcon(emoji, label, color) {
    return L.divIcon({
      className: "mieza-live-marker-wrap",
      html: `<div class="mieza-live-marker ${color}" title="${escapeHtml(label)}"><span>${emoji}</span><small>${escapeHtml(label)}</small></div>`,
      iconSize: [86, 48], iconAnchor: [43, 24]
    });
  }

  async function drawLiveRoute(from, to, key) {
    if (!map || !from || !to || typeof L === "undefined") return;
    if (key === lastLiveRouteKey && liveRouteLine) return;
    lastLiveRouteKey = key;
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Route service unavailable");
      const data = await response.json();
      const route = data.routes?.[0];
      if (!route?.geometry?.coordinates?.length) throw new Error("No route returned");
      const points = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      if (liveRouteLine) liveRouteLine.remove();
      liveRouteLine = L.polyline(points, { color: "#1769d2", weight: 5, opacity: 0.85, dashArray: "8 7" }).addTo(map);
      if (data.routes[0].duration && activeRideId) {
        const mins = Math.max(1, Math.round(route.duration / 60));
        const label = document.getElementById("liveMapEta");
        if (label) label.textContent = `Estimated ${mins} min to ${key.startsWith("pickup") ? "pickup" : "destination"}`;
      }
      map.fitBounds(liveRouteLine.getBounds().pad(0.18), { maxZoom: 15 });
    } catch (error) {
      // Still show all known locations even if the public routing service is unavailable.
      const points = [[from.lat, from.lng], [to.lat, to.lng]];
      if (liveRouteLine) liveRouteLine.remove();
      liveRouteLine = L.polyline(points, { color: "#1769d2", weight: 4, opacity: 0.7, dashArray: "8 7" }).addTo(map);
      map.fitBounds(L.latLngBounds(points).pad(0.18));
    }
  }

  function updateLiveRideMap(ride) {
    if (!map || !ride || !activeRideId || typeof L === "undefined") return;
    const pickup = ridePoint(ride.pickupLocation);
    const destination = ridePoint(ride.destinationLocation);
    const driverLocation = ridePoint(ride.driverId?.currentLocation);
    const status = String(ride.status || "searching");

    if (pickup) {
      if (!livePickupMarker) livePickupMarker = L.marker([pickup.lat, pickup.lng], { icon: markerIcon("Pickup", "Your pickup", "customer") }).addTo(map);
      else livePickupMarker.setLatLng([pickup.lat, pickup.lng]);
      livePickupMarker.bindPopup("Pickup Your pickup location");
    }
    if (destination) {
      if (!liveDestinationMarker) liveDestinationMarker = L.marker([destination.lat, destination.lng], { icon: markerIcon("Destination", "Destination", "destination") }).addTo(map);
      else liveDestinationMarker.setLatLng([destination.lat, destination.lng]);
      liveDestinationMarker.bindPopup("Destination Your destination");
    }
    if (driverLocation) {
      const emoji = ["taxi"].includes(String(ride.vehicleType).toLowerCase()) ? "Taxi" : "Okada";
      const vehicle = String(ride.vehicleType || "vehicle").toLowerCase() === "taxi" ? "Taxi driver" : "Okada driver";
      if (!liveDriverMarker) liveDriverMarker = L.marker([driverLocation.lat, driverLocation.lng], { icon: markerIcon(emoji, vehicle, "vehicle") }).addTo(map);
      else {
        liveDriverMarker.setLatLng([driverLocation.lat, driverLocation.lng]);
        liveDriverMarker.setIcon(markerIcon(emoji, vehicle, "vehicle"));
      }
      liveDriverMarker.bindPopup(`${emoji} ${escapeHtml(vehicle)} — live location`);
    }

    const pickedUp = status === "ongoing";
    const target = pickedUp ? destination : pickup;
    const from = driverLocation;
    const targetLabel = pickedUp ? "destination" : "pickup";
    const eta = document.getElementById("liveMapEta");
    if (eta) eta.textContent = driverLocation ? (pickedUp ? "Driver is navigating to your destination" : "Driver is on the way to your pickup") : "Waiting for the driver's live GPS location…";
    if (from && target) drawLiveRoute(from, target, `${targetLabel}:${from.lat.toFixed(3)},${from.lng.toFixed(3)}:${target.lat.toFixed(5)},${target.lng.toFixed(5)}`);
    else {
      const bounds = [pickup, destination].filter(Boolean).map(p => [p.lat, p.lng]);
      if (bounds.length) map.fitBounds(L.latLngBounds(bounds).pad(0.18));
    }
  }

  function clearLiveRideMap() {
    for (const marker of [liveDriverMarker, livePickupMarker, liveDestinationMarker]) if (marker) marker.remove();
    if (liveRouteLine) liveRouteLine.remove();
    liveDriverMarker = livePickupMarker = liveDestinationMarker = liveRouteLine = null;
    lastLiveRouteKey = "";
  }

  function renderRide(ride) {
    const panel = $("activeRide");

    if (!panel) return;

    panel.hidden = false;

    const status = String(ride.status || "searching");

    panel.innerHTML = `
      <span class="ride-status">${escapeHtml(status)}</span>
      <h3>Your ride</h3>
      <p>
        <strong>Pickup:</strong>
        ${escapeHtml(ride.pickupLocation?.address || fields.pickup.value)}
        <br>
        <strong>Destination:</strong>
        ${escapeHtml(ride.destinationLocation?.address || fields.destination.value)}
        <br>
        <strong>Fare:</strong>
        ${money(ride.rideFare ?? ride.fare ?? 0)}
        <br>
        <strong>Ride type:</strong>
        ${escapeHtml(ride.vehicleType || "—")}
        <br>
        <strong>Ride ID:</strong>
        ${escapeHtml(ride._id || "—")}
      </p>
      <section class="live-ride-map-card">
        <h4>Live ride map</h4>
        <p id="liveMapEta" class="live-map-eta">Waiting for the driver's live GPS location…</p>
        <div class="live-map-legend"><span>Pickup</span><span>Driver</span><span>Destination</span></div>
      </section>
      ${ride.driverId && typeof ride.driverId === "object" ? `
        <section class="assigned-driver-details">
          <h4>Your driver</h4>
          <p><strong>Name:</strong> ${escapeHtml(ride.driverId.fullName || "Driver assigned")}</p>
          <p><strong>Vehicle:</strong> ${escapeHtml([ride.driverId.vehicleColor, ride.driverId.vehicleBrand, ride.driverId.vehicleModel].filter(Boolean).join(" ") || ride.driverId.vehicleType || "Not provided")}</p>
          ${ride.driverId.plateNumber ? `<p><strong>Plate:</strong> ${escapeHtml(ride.driverId.plateNumber)}</p>` : ""}
          ${ride.driverId.phone ? `<p><strong>Phone:</strong> <a href="tel:${escapeHtml(ride.driverId.phone)}">${escapeHtml(ride.driverId.phone)}</a></p>` : ""}
        </section>
      ` : status === "searching" ? "<p>Your request is being matched with an available driver.</p>" : ""}
      ${
        ["searching", "accepted", "arrived"].includes(status)
          ? '<button class="secondary-button" id="cancelRide">Cancel ride</button>'
          : ""
      }
    `;

    updateLiveRideMap(ride);

    const cancelButton = $("cancelRide");

    if (cancelButton) {
      cancelButton.addEventListener("click", cancelRide);
    }

    if (activeRideId && !["cancelled", "completed", "expired"].includes(status)) {
      startRideStatusPolling();
    } else {
      stopRideStatusPolling();
    }
  }

  // Poll the authenticated status endpoint so Taxi, Okada and other supported
  // ride types all reflect the same backend ride lifecycle.
  function stopRideStatusPolling() {
    if (rideStatusPollHandle) clearInterval(rideStatusPollHandle);
    rideStatusPollHandle = null;
    statusPollBusy = false;
  }

  async function refreshRideStatus() {
    if (!activeRideId || statusPollBusy || !getToken()) return;
    statusPollBusy = true;
    try {
      const data = await api(`/rides/${encodeURIComponent(activeRideId)}/status`);
      const ride = data.ride || data;
      renderRide(ride);
      if (["cancelled", "completed", "expired"].includes(ride.status)) {
        activeRideId = null;
        localStorage.removeItem("activeMiezaCustomerRideId");
        stopRideStatusPolling();
        clearLiveRideMap();
        setNotice(ride.status === "cancelled" ? "This ride has been cancelled." : `Ride ${ride.status}.`, ride.status === "cancelled" ? "error" : "success");
      }
    } catch (error) {
      if (/401|sign in|customer/i.test(error.message)) setNotice(error.message, "error");
    } finally {
      statusPollBusy = false;
    }
  }

  function startRideStatusPolling() {
    if (rideStatusPollHandle) return;
    rideStatusPollHandle = setInterval(refreshRideStatus, 4000);
    refreshRideStatus();
  }

  // =====================================================
  // 11. CANCEL RIDE
  // =====================================================

  async function cancelRide() {
    if (!activeRideId) return;

    if (!confirm("Cancel this ride request?")) return;

    const cancelButton = $("cancelRide");

    if (cancelButton) cancelButton.disabled = true;

    try {
      const data = await api(
        `/rides/customer/${encodeURIComponent(activeRideId)}/cancel`,
        { method: "PUT" }
      );

      const ride = data.ride || {
        _id: activeRideId,
        status: "cancelled"
      };

      renderRide(ride);

      if (["cancelled", "completed", "expired"].includes(ride.status)) {
        activeRideId = null;
        localStorage.removeItem("activeMiezaCustomerRideId");
        stopRideStatusPolling();
      }

      setNotice(data.message || "Ride cancellation processed.", "success");
    } catch (error) {
      setNotice(error.message, "error");

      if (cancelButton) cancelButton.disabled = false;
    }
  }

  // =====================================================
  // 12. REQUEST A RIDE
  // =====================================================

  async function submitRide(event) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!getToken()) {
      setNotice(
        "Please sign in or create a customer account before requesting your ride.",
        "error"
      );
      const loginLink = document.querySelector('#customerAuthNav a[href="ride-customer-login.html"]');
      if (loginLink) loginLink.focus();
      return;
    }

    const vehicle = document.querySelector(
      'input[name="vehicleType"]:checked'
    );

    if (!vehicle) {
      setNotice("Please select a vehicle type.", "error");
      return;
    }

    isSubmitting = true;
    requestButton.disabled = true;
    requestButton.textContent = "Calculating route…";

    try {
      await resolveTypedLocations();

      const pickup = coordinates("pickup");
      const destination = coordinates("destination");

      if (!validPoint(pickup) || !validPoint(destination)) {
        throw new Error("Choose a pickup location and destination from the suggestions or map before requesting a ride.");
      }

      const pickupAddress =
        fields.pickup.value.trim() ||
        await reverseGeocode(pickup.lat, pickup.lng) ||
        "Selected pickup point";

      const destinationAddress =
        fields.destination.value.trim() ||
        await reverseGeocode(destination.lat, destination.lng) ||
        "Selected destination point";

      const body = {
        pickupLocation: {
          address: pickupAddress,
          latitude: pickup.lat,
          longitude: pickup.lng
        },
        destinationLocation: {
          address: destinationAddress,
          latitude: destination.lat,
          longitude: destination.lng
        },
        vehicleType: vehicle.value,
        estimatedDistance: routeDistanceKm,
        estimatedDuration: routeDurationMin
      };

      requestButton.textContent = "Requesting ride…";

      const data = await api("/rides/request", {
        method: "POST",
        body: JSON.stringify(body)
      });

      const ride = data.ride || data;

      activeRideId = ride._id || null;
      if (activeRideId) localStorage.setItem("activeMiezaCustomerRideId", activeRideId);

      renderRide(ride);
      if (activeRideId) startRideStatusPolling();

      if ($("fareText") && ride.rideFare != null) {
        $("fareText").textContent = money(ride.rideFare);
      }

      setNotice(
        data.message || "Your ride request was submitted.",
        "success"
      );

      requestButton.textContent = "Ride requested";
    } catch (error) {
      setNotice(error.message || "Unable to request a ride.", "error");

      requestButton.textContent = "Find my ride →";
      requestButton.disabled = false;
    } finally {
      isSubmitting = false;
    }
  }

  // =====================================================
  // 13. INITIALIZE MAP
  // =====================================================

  function initMap() {
    if (!rideMapElement) {
      console.error("Missing #rideMap element.");
      return;
    }

    if (typeof L === "undefined") {
      setNotice("The map library could not load. Refresh the page.", "error");
      return;
    }

    // Start in Ghana with a neutral basemap; recenter to a selected pickup when available.
    map = L.map("rideMap", { zoomControl: true }).setView([5.6037, -0.1870], 12);

    const cartoTiles = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 20, attribution: "&copy; OpenStreetMap contributors &copy; CARTO", subdomains: "abcd", crossOrigin: true }
    );
    const osmTiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors", crossOrigin: true }
    );
    let tileFallbackUsed = false;
    cartoTiles.on("tileerror", () => {
      if (tileFallbackUsed) return;
      tileFallbackUsed = true;
      if (map.hasLayer(cartoTiles)) map.removeLayer(cartoTiles);
      osmTiles.addTo(map);
    });
    cartoTiles.addTo(map);

    map.on("click", async (event) => {
      try {
        let which;

        if (!hasCoordinates("pickup")) {
          which = "pickup";
        } else if (!hasCoordinates("destination")) {
          which = "destination";
        } else {
          // Once both points exist, clicks update the destination.
          which = "destination";
        }

        setPoint(which, event.latlng);

        const address = await reverseGeocode(
          event.latlng.lat,
          event.latlng.lng
        );

        if (address && fields[which]) {
          fields[which].value = address;
        }

        setNotice(
          `${which === "pickup" ? "Pickup" : "Destination"} selected.`
        );
      } catch (error) {
        setNotice(error.message, "error");
      }
    });
  }

  // =====================================================
  // 14. USE CURRENT LOCATION
  // =====================================================

  document.querySelectorAll('input[name="vehicleType"]').forEach(input => {
    input.addEventListener("change", () => {
      if (routeDistanceKm != null) updateEstimatedFare();
    });
  });

  const locationButton = $("useLocation");

  if (locationButton) {
    locationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        setNotice("Location access is not supported by this browser.", "error");
        return;
      }

      locationButton.disabled = true;
      locationButton.textContent = "Locating…";

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const point = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            const address = await reverseGeocode(point.lat, point.lng);

            setPoint("pickup", point, address || "Current location");

            setNotice("Pickup location set.", "success");
          } catch (error) {
            setNotice(error.message, "error");
          } finally {
            locationButton.disabled = false;
            locationButton.textContent = "Use my location";
          }
        },
        (error) => {
          setNotice(
            error.code === 1
              ? "Allow location access or select your pickup on the map."
              : "Couldn't get your location. Select it on the map instead.",
            "error"
          );

          locationButton.disabled = false;
          locationButton.textContent = "Use my location";
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000
        }
      );
    });
  }

  // =====================================================
  // 15. FORM EVENTS
  // =====================================================

  for (const which of ["pickup", "destination"]) {
    const field = fields[which];

    if (!field) continue;

    field.addEventListener("change", () => {
      fields[`${which}Lat`].value = "";
      fields[`${which}Lng`].value = "";
      clearRoute();
    });
  }

  if (rideForm) {
    rideForm.addEventListener("submit", submitRide);
  }

  const yearElement = $("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }


  // =====================================================
  // Mieza location autocomplete and compact map picker
  // =====================================================
  const mapPanel = $("mapPanel");
  let activeMapPoint = "pickup";
  function openMapPicker(which) {
    activeMapPoint = which || "pickup";
    if (mapPanel) mapPanel.classList.add("map-picker-open");
    document.body.classList.add("map-picker-active");
    if (map) {
      // Recalculate Leaflet dimensions after the expanded panel finishes laying out.
      [120, 320].forEach(delay => setTimeout(() => {
        map.invalidateSize({ pan: false, animate: false });
        const point = coordinates(activeMapPoint);
        const fallbackPoint = activeMapPoint === "destination" ? coordinates("pickup") : null;
        if (validPoint(point)) {
          map.setView([point.lat, point.lng], 16, { animate: false });
        } else if (validPoint(fallbackPoint)) {
          map.setView([fallbackPoint.lat, fallbackPoint.lng], 15, { animate: false });
        } else if (activeMapPoint === "pickup" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const here = [position.coords.latitude, position.coords.longitude];
            map.setView(here, 16, { animate: false });
          }, () => map.setView([5.6037, -0.1870], 12, { animate: false }), { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 });
        } else {
          map.setView([5.6037, -0.1870], 12, { animate: false });
        }
      }, delay));
    }
  }
  function closeMapPicker() {
    mapPanel?.classList.remove("map-picker-open");
    document.body.classList.remove("map-picker-active");
    if (map) setTimeout(() => map.invalidateSize(), 120);
  }
  document.querySelectorAll("[data-map-point]").forEach(button => {
    button.addEventListener("click", () => openMapPicker(button.dataset.mapPoint));
  });
  $("closeMapPicker")?.addEventListener("click", closeMapPicker);
  if (mapPanel) {
    const oldMapClick = mapPanel.querySelector("#rideMap");
    // Clicking a map point while picker is open selects the currently requested field.
    if (oldMapClick && typeof L !== "undefined") {
      // The existing map click handler is wrapped by the map's own event below.
      // This handler only updates which field is targeted; normal map clicks stay functional.
    }
  }

  function selectPlace(which, place) {
    const point = { lat: Number(place.lat), lng: Number(place.lng) };
    if (!validPoint(point)) return;
    setPoint(which, point, place.address || place.name || "");
    const box = $(which + "Suggestions");
    if (box) { box.hidden = true; box.innerHTML = ""; }
    setNotice(`${which === "pickup" ? "Pickup" : "Destination"} location selected.`, "success");
  }
  function showPlaceSuggestions(which, places) {
    const box = $(which + "Suggestions");
    if (!box) return;
    box.innerHTML = "";
    places.slice(0, 5).forEach(place => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      button.textContent = place.address || place.name;
      button.addEventListener("click", () => selectPlace(which, place));
      box.appendChild(button);
    });
    box.hidden = places.length === 0;
  }
  // Without a Google key, provide a no-key OpenStreetMap search fallback.
  // Respect the public Nominatim service's usage limits; for high traffic, proxy/cache via backend.
  ["pickup", "destination"].forEach(which => {
    const input = fields[which];
    if (!input) return;
    let debounce;
    input.addEventListener("input", () => {
      clearTimeout(debounce);
      fields[which + "Lat"].value = "";
      fields[which + "Lng"].value = "";
      clearRoute();
      const query = input.value.trim();
      if (query.length < 3 || window.google?.maps?.places) {
        const box = $(which + "Suggestions");
        if (box) box.hidden = true;
        return;
      }
      debounce = setTimeout(async () => {
        try {
          const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=gh&q=" + encodeURIComponent(query);
          const response = await fetch(url, { headers: { "Accept": "application/json" } });
          if (!response.ok) return;
          const results = await response.json();
          showPlaceSuggestions(which, results.map(item => ({
            lat: item.lat, lng: item.lon, name: item.name, address: item.display_name
          })));
        } catch { /* Keep typing available if search is temporarily unavailable. */ }
      }, 450);
    });
  });

  function initGooglePlacesAutocomplete() {
    if (!window.google?.maps?.places?.Autocomplete) return;
    ["pickup", "destination"].forEach(which => {
      const input = fields[which];
      if (!input || input.dataset.googleAutocomplete === "true") return;
      input.dataset.googleAutocomplete = "true";
      const autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "geometry", "name"],
        componentRestrictions: { country: "gh" }
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const location = place.geometry?.location;
        if (!location) {
          setNotice("Choose one of the suggested addresses to set its map location.", "error");
          return;
        }
        const box = $(which + "Suggestions");
        if (box) box.hidden = true;
        selectPlace(which, {
          lat: location.lat(), lng: location.lng(),
          address: place.formatted_address || place.name
        });
      });
    });
  }
  window.initMiezaGooglePlaces = initGooglePlacesAutocomplete;
  const mapsKey = window.MIEZA_GOOGLE_MAPS_API_KEY || "";
  if (mapsKey && !mapsKey.includes("PASTE_")) {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(mapsKey) + "&libraries=places&callback=initMiezaGooglePlaces";
    script.async = true; script.defer = true;
    script.onerror = () => setNotice("Google address search could not load. Basic address search remains available.", "error");
    document.head.appendChild(script);
  }

  renderCustomerAuthControls();
  if (activeRideId && getToken()) startRideStatusPolling();

  // =====================================================
  // 16. START PAGE
  // =====================================================

  initMap();

  if (!getToken()) {
    setNotice(
      "You can plan a route now. Sign in to your Mieza customer account before requesting a ride.",
      "error"
    );
  } else {
    setNotice("Connected to Mieza Ride. Set your pickup and destination.", "success");
  }
})();
