(() => {
"use strict";
const API_URL = (["localhost", "127.0.0.1"].includes(window.location.hostname))
    ? "http://localhost:5001/api"
    : "https://mieza.onrender.com/api";
const $=id=>document.getElementById(id);
const token=localStorage.getItem("rideDriverToken");
let driver;
try{driver=JSON.parse(localStorage.getItem("rideDriver")||"null");}catch{driver=null;}
if(!token||!driver){window.location.href="ride-login.html";return;}
let requests=[],pollHandle=null,activeRide=null,requestBusy=false,driverMap=null,driverVehicleMarker=null,driverPickupMarker=null,driverDestinationMarker=null,driverRouteLine=null,locationWatchId=null,lastRouteKey="",lastLocationSentAt=0;
const money=n=>`GH₵${Number(n||0).toFixed(2)}`;
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function notice(message,type=""){const el=$("dashboardNotice");el.textContent=message;el.className=`dashboard-notice ${type}`.trim();el.hidden=!message;}
async function api(path,opts={}){
 const res=await fetch(`${API_URL}${path}`,{...opts,headers:{Authorization:`Bearer ${token}`,...(opts.body?{"Content-Type":"application/json"}:{}),...(opts.headers||{})}});
 let data={};try{data=await res.json();}catch{}
 if(!res.ok){if(res.status===401){logout();}throw new Error(data.message||`Request failed (${res.status})`);}
 return data;
}
function paintStatus(){
 const online=Boolean(driver.isOnline);
 $("driverStatus").textContent=online?"ONLINE":"OFFLINE";
 $("statusText").textContent=online?"You're online and eligible for ride requests when available.":"You're offline and won't receive new ride requests.";
 $("statusDot").className=`status-dot ${online?"online":"offline"}`;
 $("toggleAvailability").textContent=online?"Go offline":"Go online";
 $("toggleAvailability").classList.toggle("is-online",online);
}


function paintProfile() {
  const setText = (id, value) => {
    const element = $(id);
    if (element) {
      element.textContent = value;
    }
  };

  setText("driverName", `Welcome back, ${driver.fullName || "Driver"} 👋`);
  setText("driverRating", `★ ${Number(driver.averageRating ?? 5).toFixed(1)}`);
  setText("walletBalance", money(driver.walletBalance ?? 0));
  setText("todayEarnings", money(driver.todayEarnings ?? 0));
  setText("todayTrips", Number(driver.todayTrips ?? 0));
  setText("totalTrips", Number(driver.totalTrips ?? 0));
  setText("totalTripsPerformance", Number(driver.totalTrips ?? 0));

  setText(
    "acceptanceRate",
    driver.acceptanceRate != null
      ? `${Math.round(driver.acceptanceRate)}%`
      : "—"
  );

  setText(
    "completionRate",
    driver.completionRate != null
      ? `${Math.round(driver.completionRate)}%`
      : "—"
  );
}


function saveDriver(){localStorage.setItem("rideDriver",JSON.stringify(driver));}
function renderRequests(){
 const root=$("rideRequests");
 if(!driver.isOnline){root.className="empty-state";root.innerHTML='<i class="fas fa-moon"></i><p>Go online to receive nearby ride requests.</p>';return;}
 if(!requests.length){root.className="empty-state";root.innerHTML='<i class="fas fa-car-side"></i><p>No ride requests right now. We’ll keep checking.</p>';return;}
 root.className="ride-request-list";
 root.innerHTML=requests.map(r=>`<article class="request-card"><div class="request-top"><span class="ride-pill">New request · ${escapeHtml(r.vehicleType||driver.vehicleType||"Ride")}</span><strong>${money(r.rideFare)}</strong></div>${r.customerId?.fullName?`<p class="request-customer"><strong>Customer:</strong> ${escapeHtml(r.customerId.fullName)}</p>`:""}<div class="request-route"><div><i class="route-dot pickup"></i><span><small>Pickup</small><strong>${escapeHtml(r.pickupLocation?.address||"Pickup location")}</strong></span></div><div><i class="route-dot destination"></i><span><small>Destination</small><strong>${escapeHtml(r.destinationLocation?.address||"Destination")}</strong></span></div></div><div class="request-meta"><span><i class="fas fa-road"></i> ${Number(r.estimatedDistance||0).toFixed(1)} km</span><span><i class="fas fa-clock"></i> ${Number(r.estimatedDuration||0)} min</span></div><button class="accept-btn" data-accept="${escapeHtml(r._id)}">Accept ride <span>→</span></button></article>`).join("");
 root.querySelectorAll("[data-accept]").forEach(b=>b.addEventListener("click",()=>acceptRide(b.dataset.accept,b)));
}
async function loadRequests(){
 if(!driver.isOnline||requestBusy||activeRide)return;
 try{const data=await api("/ride-drivers/available-rides");requests=Array.isArray(data)?data:(data.rides||[]);renderRequests();}
 catch(e){if(e.message.includes("online and available")){requests=[];renderRequests();}else notice(e.message,"error");}
}
async function refreshProfile(){
 try{const data=await api("/ride-drivers/me");const latest=data.driver||data;if(latest&&latest._id){driver={...driver,...latest};saveDriver();paintProfile();paintStatus();}}
 catch(e){/* This endpoint is not guaranteed by older backend versions; cached login profile remains usable. */}
}
function pointFromLocation(location){
 const lat=Number(location?.latitude??location?.lat),lng=Number(location?.longitude??location?.lng);
 return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?{lat,lng}:null;
}
function liveIcon(emoji,label,kind){return L.divIcon({className:"mieza-live-marker-wrap",html:`<div class="mieza-live-marker ${kind}"><span>${emoji}</span><small>${escapeHtml(label)}</small></div>`,iconSize:[86,48],iconAnchor:[43,24]});}
function initDriverMap(){
 const el=$("driverLiveMap");if(!el||typeof L==="undefined")return;
 if(driverMap){setTimeout(()=>driverMap.invalidateSize(),100);return;}
 driverMap=L.map(el).setView([6.2028,-1.6675],13);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(driverMap);
}
async function routeDriverToTarget(from,to,key){
 if(!driverMap||!from||!to)return;
 if(key===lastRouteKey&&driverRouteLine)return;lastRouteKey=key;
 try{
  const url=`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const response=await fetch(url);if(!response.ok)throw new Error("Route service unavailable");
  const data=await response.json();const route=data.routes?.[0];if(!route?.geometry?.coordinates?.length)throw new Error("No route");
  const points=route.geometry.coordinates.map(([lng,lat])=>[lat,lng]);if(driverRouteLine)driverRouteLine.remove();
  driverRouteLine=L.polyline(points,{color:"#1769d2",weight:5,opacity:.88}).addTo(driverMap);
  const eta=$("driverMapEta");if(eta)eta.textContent=`Navigation active · approximately ${Math.max(1,Math.round(route.duration/60))} min`;
  driverMap.fitBounds(driverRouteLine.getBounds().pad(.18),{maxZoom:16});
 }catch(e){const points=[[from.lat,from.lng],[to.lat,to.lng]];if(driverRouteLine)driverRouteLine.remove();driverRouteLine=L.polyline(points,{color:"#1769d2",weight:4,dashArray:"8 7"}).addTo(driverMap);driverMap.fitBounds(L.latLngBounds(points).pad(.18));const eta=$("driverMapEta");if(eta)eta.textContent="Route service unavailable; showing locations only.";}
}
function updateDriverMap(){
 if(!activeRide||!driverMap||typeof L==="undefined")return;
 const pickup=pointFromLocation(activeRide.pickupLocation),destination=pointFromLocation(activeRide.destinationLocation);
 const current=driver.currentLocation?pointFromLocation(driver.currentLocation):null;
 if(pickup){if(!driverPickupMarker)driverPickupMarker=L.marker([pickup.lat,pickup.lng],{icon:liveIcon("🧍","Customer pickup","customer")}).addTo(driverMap);else driverPickupMarker.setLatLng([pickup.lat,pickup.lng]);driverPickupMarker.bindPopup("🧍 Customer pickup location");}
 if(destination){if(!driverDestinationMarker)driverDestinationMarker=L.marker([destination.lat,destination.lng],{icon:liveIcon("🏁","Destination","destination")}).addTo(driverMap);else driverDestinationMarker.setLatLng([destination.lat,destination.lng]);driverDestinationMarker.bindPopup("🏁 Customer destination");}
 if(current){const emoji=String(activeRide.vehicleType||driver.vehicleType).toLowerCase()==="taxi"?"🚕":"🏍️";const label=emoji==="🚕"?"Your taxi":"Your Okada";if(!driverVehicleMarker)driverVehicleMarker=L.marker([current.lat,current.lng],{icon:liveIcon(emoji,label,"vehicle")}).addTo(driverMap);else{driverVehicleMarker.setLatLng([current.lat,current.lng]);driverVehicleMarker.setIcon(liveIcon(emoji,label,"vehicle"));}driverVehicleMarker.bindPopup(`${emoji} Your current location`);}
 const pickedUp=activeRide.status==="ongoing",target=pickedUp?destination:pickup;
 const eta=$("driverMapEta");if(eta&&!current)eta.textContent="Allow location access to start live navigation.";else if(eta&&current)eta.textContent=pickedUp?"Navigate to the customer's destination":"Navigate to the customer's pickup";
 if(current&&target)routeDriverToTarget(current,target,`${pickedUp?"dest":"pickup"}:${current.lat.toFixed(3)},${current.lng.toFixed(3)}:${target.lat.toFixed(5)},${target.lng.toFixed(5)}`);
 else{const points=[pickup,destination,current].filter(Boolean).map(p=>[p.lat,p.lng]);if(points.length)driverMap.fitBounds(L.latLngBounds(points).pad(.18));}
}
function clearDriverMap(){for(const marker of [driverVehicleMarker,driverPickupMarker,driverDestinationMarker])if(marker)marker.remove();if(driverRouteLine)driverRouteLine.remove();driverVehicleMarker=driverPickupMarker=driverDestinationMarker=driverRouteLine=null;lastRouteKey="";if(locationWatchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(locationWatchId);locationWatchId=null;}}
function startLiveLocation(){
 if(locationWatchId!==null||!navigator.geolocation||!activeRide)return;
 locationWatchId=navigator.geolocation.watchPosition(async pos=>{
  const latitude=pos.coords.latitude,longitude=pos.coords.longitude;
  driver.currentLocation={...(driver.currentLocation||{}),latitude,longitude};saveDriver();updateDriverMap();
  const now=Date.now();if(now-lastLocationSentAt<4000)return;lastLocationSentAt=now;
  try{await api("/ride-drivers/location",{method:"PUT",body:JSON.stringify({latitude,longitude})});}catch(e){/* Retry on next GPS reading; don't interrupt ride controls. */}
 },err=>{const eta=$("driverMapEta");if(eta)eta.textContent=err.code===1?"Location permission is required for live navigation.":"Waiting for a reliable GPS signal…";},{enableHighAccuracy:true,maximumAge:3000,timeout:15000});
}

function renderActiveRide(){
 const root=$("activeRidePanel");
 if(!activeRide){root.hidden=true;return;}
 root.hidden=false;
 const status=activeRide.status||"accepted";
 // Polling updates the active ride every few seconds. Preserve the Leaflet DOM
 // when status is unchanged; rebuild the map only when the phase changes.
 if(root.querySelector("#driverLiveMap") && root.dataset.rideStatus===status){ updateDriverMap(); return; }
 if(driverMap){driverMap.remove();driverMap=null;driverVehicleMarker=driverPickupMarker=driverDestinationMarker=driverRouteLine=null;lastRouteKey="";}
 root.dataset.rideStatus=status;
 const next={accepted:{label:"Mark arrived",status:"arrived",path:"arrive"},arrived:{label:"Start trip",status:"ongoing",path:"start"},ongoing:{label:"Complete trip",status:"completed",path:"complete"}}[status];
 const customer=activeRide.customerId||{};
 root.innerHTML=`<div class="active-ride-heading"><div><span class="eyebrow">CURRENT TRIP · ${escapeHtml(activeRide.vehicleType||driver.vehicleType||"Ride")}</span><h2>${escapeHtml(status.replace("_"," "))}</h2></div><span class="ride-pill current">In progress</span></div>${customer.fullName||customer.phone?`<section class="active-customer-details"><h3>Customer details</h3><p><strong>Name:</strong> ${escapeHtml(customer.fullName||"Not provided")}</p>${customer.phone?`<p><strong>Phone:</strong> <a href="tel:${escapeHtml(customer.phone)}">${escapeHtml(customer.phone)}</a></p>`:""}</section>`:""}<div class="request-route"><div><i class="route-dot pickup"></i><span><small>Pickup</small><strong>${escapeHtml(activeRide.pickupLocation?.address||"Pickup location")}</strong></span></div><div><i class="route-dot destination"></i><span><small>Destination</small><strong>${escapeHtml(activeRide.destinationLocation?.address||"Destination")}</strong></span></div></div><div class="active-ride-meta"><span>Fare <strong>${money(activeRide.rideFare)}</strong></span><span>Est. distance <strong>${Number(activeRide.estimatedDistance||0).toFixed(1)} km</strong></span></div><section class="driver-live-navigation"><div class="driver-live-navigation-heading"><h3>Live navigation</h3><span>🧍 Customer · 🚕 / 🏍️ You · 🏁 Destination</span></div><p id="driverMapEta" class="driver-map-eta">Getting the map ready…</p><div id="driverLiveMap" aria-label="Live navigation map to customer pickup and destination"></div></section><div class="active-actions">${next?`<button class="accept-btn" id="advanceRide">${next.label} →</button>`:""}${["accepted","arrived"].includes(status)?'<button class="cancel-btn" id="driverCancelRide">Cancel ride</button>':""}</div>`;
 initDriverMap();setTimeout(()=>{if(driverMap){driverMap.invalidateSize();updateDriverMap();}},120);startLiveLocation();
 if(next)$("advanceRide").onclick=()=>advanceRide(next.path,next.status);
 const cancel=$("driverCancelRide");if(cancel)cancel.onclick=cancelRide;
}
async function acceptRide(id,button){
 if(requestBusy)return;requestBusy=true;button.disabled=true;button.textContent="Accepting…";
 try{const data=await api(`/rides/${encodeURIComponent(id)}/accept`,{method:"PUT"});activeRide=data.ride||data;localStorage.setItem("activeMiezaRide",JSON.stringify(activeRide));requests=[];renderRequests();renderActiveRide();notice(data.message||"Ride accepted. Follow the trip steps below.","success");await syncAvailability();}
 catch(e){notice(e.message,"error");button.disabled=false;button.innerHTML='Accept ride <span>→</span>';await loadRequests();}
 finally{requestBusy=false;}
}
async function advanceRide(path,status){
 try{const data=await api(`/rides/${encodeURIComponent(activeRide._id)}/${path}`,{method:"PUT"});activeRide=data.ride||{...activeRide,status};activeRide.status=activeRide.status||status;localStorage.setItem("activeMiezaRide",JSON.stringify(activeRide));renderActiveRide();notice(data.message||`Ride marked ${status}.`,"success");
 if(status==="completed"){activeRide=null;localStorage.removeItem("activeMiezaRide");clearDriverMap();renderActiveRide();await syncAvailability();await refreshProfile();await loadRequests();}
 }catch(e){notice(e.message,"error");}
}
async function cancelRide(){
 if(!activeRide||!confirm("Cancel this ride?"))return;
 try{const data=await api(`/rides/${encodeURIComponent(activeRide._id)}/cancel`,{method:"PUT"});activeRide=null;localStorage.removeItem("activeMiezaRide");clearDriverMap();renderActiveRide();notice(data.message||"Ride cancelled.","success");await syncAvailability();await loadRequests();}
 catch(e){notice(e.message,"error");}
}
async function syncAvailability(){
 try{const data=await api("/ride-drivers/availability",{method:"PUT"});driver.isOnline=data.isOnline;driver.isAvailable=data.isAvailable;saveDriver();paintStatus();if(driver.isOnline)await loadRequests();else{requests=[];renderRequests();}}
 catch(e){notice(e.message,"error");}
}
$("toggleAvailability").addEventListener("click",async()=>{
 const button=$("toggleAvailability");button.disabled=true;
 try{await syncAvailability();notice(driver.isOnline?"You're online. Looking for requests…":"You're offline.","success");}
 finally{button.disabled=false;}
});
$("logoutBtn").addEventListener("click",logout);
function logout(){localStorage.removeItem("rideDriverToken");localStorage.removeItem("rideDriver");window.location.href="ride-login.html";}
$("notificationBtn").addEventListener("click",()=>notice("Ride requests refresh automatically while you are online."));
$("updateLocationBtn").addEventListener("click",()=>{
 if(!navigator.geolocation){notice("Location is not supported by this browser.","error");return;}
 navigator.geolocation.getCurrentPosition(async pos=>{
  try{await api("/ride-drivers/location",{method:"PUT",body:JSON.stringify({latitude:pos.coords.latitude,longitude:pos.coords.longitude})});notice("Current GPS coordinates saved. The saved address label has not been changed.","success");}
  catch(e){notice("Your browser location was received, but the backend location endpoint is not confirmed. We haven't changed your saved location. "+e.message,"error");}
 },()=>notice("Location permission was denied or unavailable.","error"),{enableHighAccuracy:true,timeout:10000});
});
try{const saved=JSON.parse(localStorage.getItem("activeMiezaRide")||"null");if(saved&&["accepted","arrived","ongoing"].includes(saved.status))activeRide=saved;}catch{}
paintProfile();paintStatus();renderRequests();renderActiveRide();
loadRequests();
pollHandle=setInterval(async()=>{
 if (activeRide?._id) {
   try {
     const data = await api(`/ride-drivers/active-ride/${encodeURIComponent(activeRide._id)}`);
     const latest = data.ride || data;
     if (["cancelled", "completed", "expired"].includes(latest.status)) {
       const previousStatus = latest.status;
       activeRide = null;
       localStorage.removeItem("activeMiezaRide");
       clearDriverMap();
       renderActiveRide();
       notice(previousStatus === "cancelled" ? "This ride was cancelled by the customer or driver." : `Ride ${previousStatus}.`, previousStatus === "cancelled" ? "error" : "success");
       await refreshProfile();
       await loadRequests();
     } else {
       activeRide = latest;
       localStorage.setItem("activeMiezaRide", JSON.stringify(activeRide));
       renderActiveRide();
     }
   } catch (error) {
     // Keep the current card visible during temporary network failures.
     if (error.message.includes("Ride not found for this driver")) {
       activeRide = null;
       localStorage.removeItem("activeMiezaRide");
       renderActiveRide();
       await loadRequests();
     }
   }
 } else if (driver.isOnline) {
   await loadRequests();
 }
},5000);
refreshProfile();
})();