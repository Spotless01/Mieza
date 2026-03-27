// ================================
// MIEZA — SHOP REGISTRATION PAYMENT
// ================================

const REGISTRATION_FEE = 200; // GHS (easy to change later)
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxx"; // <-- replace

document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.getElementById("payAndRegisterBtn");

  if (!payBtn) return;

  payBtn.addEventListener("click", () => {
    const shopName = document.getElementById("shop_name")?.value.trim();
    const ownerName = document.getElementById("owner_name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();

    if (!shopName || !ownerName || !email || !phone) {
      alert("Please fill all required fields before payment.");
      return;
    }

    // Prevent multiple clicks
    payBtn.disabled = true;
    payBtn.textContent = "Processing payment...";

    payWithPaystack({ shopName, ownerName, email, phone });
  });
});

function payWithPaystack(data) {
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: data.email,
    amount: REGISTRATION_FEE * 100, // Paystack uses pesewas
    currency: "GHS",
    ref: "MIEZA_" + Date.now(),

    metadata: {
      custom_fields: [
        { display_name: "Shop Name", value: data.shopName },
        { display_name: "Owner Name", value: data.ownerName },
        { display_name: "Phone", value: data.phone }
      ]
    },

    callback: function (response) {
      saveShopRegistration(data, response.reference);
    },

    onClose: function () {
      alert("Payment cancelled.");

      const payBtn = document.getElementById("payAndRegisterBtn");
      payBtn.disabled = false;
      payBtn.textContent = "Pay ₵200 & Register Shop";
    }
  });

  handler.openIframe();
}

async function saveShopRegistration(data, reference) {
  try {
    const res = await fetch("http://localhost:5000/api/shops/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        reference
      })
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Registration failed");
      resetButton();
      return;
    }

    alert("🎉 Shop registered successfully!");
    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert("Server error. Please try again.");
    resetButton();
  }
}

function resetButton() {
  const payBtn = document.getElementById("payAndRegisterBtn");
  payBtn.disabled = false;
  payBtn.textContent = "Pay ₵200 & Register Shop";
}
