// ================================
// MIEZA — CHECKOUT + WHATSAPP (FINAL)
// ================================

const SHOPS = {
  "nana-odo-mmra": "Nana Odo Mmra",
  "bestcobb": "BestCobb Bar and Restaurant",
  "shop-3": "Adwoa Supermarket"
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");
  const btn = document.getElementById("placeOrderBtn");
  const success = document.getElementById("order-success");
  const section = document.getElementById("checkout-section");

  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem("miezaCart")) || [];

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Button loading state
    btn.textContent = "Placing order...";
    btn.classList.add("loading");
    btn.disabled = true;

    const data = new FormData(form);

    let message = `🛒 *New Mieza Order*\n\n`;
    message += `👤 Name: ${data.get("name")}\n`;
    message += `📞 Phone: ${data.get("phone")}\n`;
    message += `📍 Location: ${data.get("location")}\n\n`;

    // Group cart by shop
    const groupedByShop = {};
    cart.forEach(item => {
      if (!groupedByShop[item.shopId]) {
        groupedByShop[item.shopId] = [];
      }
      groupedByShop[item.shopId].push(item);
    });

    // Build message
    Object.keys(groupedByShop).forEach(shopId => {
      const shopName = SHOPS[shopId] || shopId;
      message += `🏪 *Shop:* ${shopName}\n`;

      groupedByShop[shopId].forEach(item => {
        const lineTotal = item.price * item.qty;
        message += `• ${item.name} x${item.qty} — ₵${lineTotal}\n`;
      });

      message += `\n`;
    });

    // Total
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    message += `💰 *Total:* ₵${total}\n`;
    message += `📝 Notes: ${data.get("notes") || "None"}`;

    const phone = "233551836194";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      window.open(url, "_blank");

      localStorage.removeItem("miezaCart");
      form.reset();

      // Show success screen
      section.style.display = "none";
      success.style.display = "block";
      success.classList.remove("hidden");

    }, 1000);
  });
});
