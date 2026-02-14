// ================================
// MIEZA — CART LOGIC (SAFE + IMPROVED)
// ================================

const CART_KEY = "miezaCart";

// ---------- HELPERS ----------
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateAllCartCounts();
}

// ---------- ADD TO CART ----------
function addToCart(shopId, product, btn) {
  const cart = getCart();

  const existing = cart.find(
    item => item.id === product.id && item.shopId === shopId
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      shopId,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  saveCart(cart);

  if (btn) {
    btn.textContent = "Added ✓";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "Add to Cart";
      btn.classList.remove("added");
    }, 1000);
  }
}

// ---------- UPDATE CART COUNTS ----------
function updateAllCartCounts() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Header cart count
  document.querySelectorAll("#cartCount").forEach(el => {
    el.textContent = totalItems;
  });

  // Floating cart count
  document.querySelectorAll("#cartCountFloat").forEach(el => {
    el.textContent = totalItems;
  });
}

// ---------- CART PAGE ----------
function renderCartItems() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <strong>${item.name}</strong>
        <p>₵${item.price}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.shopId}','${item.id}', -1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.shopId}','${item.id}', 1)">+</button>
        <button class="qty-btn" onclick="removeItem('${item.shopId}','${item.id}')">✕</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ---------- QTY ----------
function changeQty(shopId, id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === parseInt(id) && i.shopId === shopId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeItem(shopId, id);
    return;
  }

  saveCart(cart);
  renderCartItems();
}

function removeItem(shopId, id) {
  let cart = getCart();
  cart = cart.filter(item => !(item.id === parseInt(id) && item.shopId === shopId));
  saveCart(cart);
  renderCartItems();
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  updateAllCartCounts();
  renderCartItems();
});
