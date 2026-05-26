const API_URL = "https://mieza.onrender.com/api";

// GET ALL SHOPS
async function fetchShops() {
  const res = await fetch(`${API_URL}/shops`);
  return await res.json();
}