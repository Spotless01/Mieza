const API_URL = "http://localhost:5000/api";

// GET ALL SHOPS
async function fetchShops() {
  const res = await fetch(`${API_URL}/shops`);
  return await res.json();
}