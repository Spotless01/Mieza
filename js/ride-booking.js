
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
    `GHΓé╡${Number(amount || 0).toFixed(2)}`;

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
        renderCustomerAuthControls();
        setNotice("You have been logged out. Sign in to request a ride.", "success");
        if (requestButton) { requestButton.disabled = false; requestButton.textContent = "Find my ride ΓåÆ"; }
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

  function clearRoute() {
    routeDistanceKm = null;
    routeDurationMin = null;

    if (routeLine && map) {
      routeLine.remove();
      routeLine = null;
    }

    if ($("distanceText")) $("distanceText").textContent = "ΓÇö";
    if ($("durationText")) $("durationText").textContent = "ΓÇö";
    if ($("fareText")) $("fareText").textContent = "Calculated by Mieza";
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

      if ($("fareText")) {
        $("fareText").textContent = "Confirmed when requested";
      }
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
      if (!livePickupMarker) livePickupMarker = L.marker([pickup.lat, pickup.lng], { icon: markerIcon("≡ƒºì", "Your pickup", "customer") }).addTo(map);
      else livePickupMarker.setLatLng([pickup.lat, pickup.lng]);
      livePickupMarker.bindPopup("≡ƒºì Your pickup location");
    }
    if (destination) {
      if (!liveDestinationMarker) liveDestinationMarker = L.marker([destination.lat, destination.lng], { icon: markerIcon("≡ƒÅü", "Destination", "destination") }).addTo(map);
      else liveDestinationMarker.setLatLng([destination.lat, destination.lng]);
      liveDestinationMarker.bindPopup("≡ƒÅü Your destination");
    }
    if (driverLocation) {
      const emoji = ["taxi"].includes(String(ride.vehicleType).toLowerCase()) ? "≡ƒÜò" : "≡ƒÅì∩╕Å";
      const vehicle = String(ride.vehicleType || "vehicle").toLowerCase() === "taxi" ? "Taxi driver" : "Okada driver";
      if (!liveDriverMarker) liveDriverMarker = L.marker([driverLocation.lat, driverLocation.lng], { icon: markerIcon(emoji, vehicle, "vehicle") }).addTo(map);
      else {
        liveDriverMarker.setLatLng([driverLocation.lat, driverLocation.lng]);
        liveDriverMarker.setIcon(markerIcon(emoji, vehicle, "vehicle"));
      }
      liveDriverMarker.bindPopup(`${emoji} ${escapeHtml(vehicle)} ΓÇö live location`);
    }

    const pickedUp = status === "ongoing";
    const target = pickedUp ? destination : pickup;
    const from = driverLocation;
    const targetLabel = pickedUp ? "destination" : "pickup";
    const eta = document.getElementById("liveMapEta");
    if (eta) eta.textContent = driverLocation ? (pickedUp ? "Driver is navigating to your destination" : "Driver is on the way to your pickup") : "Waiting for the driver's live GPS locationΓÇª";
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
        ${escapeHtml(ride.vehicleType || "ΓÇö")}
        <br>
        <strong>Ride ID:</strong>
        ${escapeHtml(ride._id || "ΓÇö")}
      </p>
      <section class="live-ride-map-card">
        <h4>Live ride map</h4>
        <p id="liveMapEta" class="live-map-eta">Waiting for the driver's live GPS locationΓÇª</p>
        <div class="live-map-legend"><span>≡ƒºì Pickup</span><span>≡ƒÜò / ≡ƒÅì∩╕Å Driver</span><span>≡ƒÅü Destination</span></div>
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
        "Please sign in to your Mieza customer account before requesting a ride.",
        "error"
      );
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
    requestButton.textContent = "Calculating routeΓÇª";

    try {
      await resolveTypedLocations();

      const pickup = coordinates("pickup");
      const destination = coordinates("destination");

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

      requestButton.textContent = "Requesting rideΓÇª";

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

      requestButton.textContent = "Find my ride ΓåÆ";
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

    map = L.map("rideMap").setView([6.2028, -1.6675], 13);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }
    ).addTo(map);

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

  const locationButton = $("useLocation");

  if (locationButton) {
    locationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        setNotice("Location access is not supported by this browser.", "error");
        return;
      }

      locationButton.disabled = true;
      locationButton.textContent = "LocatingΓÇª";

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
