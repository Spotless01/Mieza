const token = localStorage.getItem("shopToken");
if (!token) location.href = "shop-login.html";

document.getElementById("shopName").textContent =
  JSON.parse(localStorage.getItem("shop")).shopName;

async function addProduct() {
  const name = productName.value;
  const price = productPrice.value;

  await fetch("http://localhost:5000/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, price })
  });

  alert("Product added");
}
