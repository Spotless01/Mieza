// ================================
// MIEZA — CHECKOUT SYSTEM
// ================================

const API_URL = "http://localhost:5000/api";

const PAYSTACK_PUBLIC_KEY =
  "pk_test_ae5cd01bf961398b8a0a932344da0c215ba02c04";

document.addEventListener("DOMContentLoaded", () => {

  const form =
    document.getElementById("checkout-form");

  const btn =
    document.getElementById("placeOrderBtn");

  const success =
    document.getElementById("order-success");

  const section =
    document.getElementById("checkout-section");

  if (!form) return;

  // =====================================
  // PLACE ORDER
  // =====================================

  form.addEventListener("submit", async e => {

    e.preventDefault();

    const cart =
      JSON.parse(
        localStorage.getItem("miezaCart")
      ) || [];

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    btn.textContent = "Placing order...";
    btn.disabled = true;

    try {

      const data = new FormData(form);

      // =====================================
      // GROUP CART BY SHOP
      // =====================================

      const groupedByShop = {};

      cart.forEach(item => {

        if (!groupedByShop[item.shopId]) {
          groupedByShop[item.shopId] = [];
        }

        groupedByShop[item.shopId].push(item);
      });

      
      // =====================================
// TOTAL AMOUNT
// =====================================

const grandTotal = cart.reduce(
  (sum, item) =>
    sum + item.price * item.qty,
  0
);

// =====================================
// PAYSTACK PAYMENT
// =====================================
const handler = PaystackPop.setup({

  key: PAYSTACK_PUBLIC_KEY,

  email: data.get("email"),

  amount: grandTotal * 100,

  currency: "GHS",

  ref: "MIEZA_" + Date.now(),

 callback: function(response) {

  (async () => {

    try {

      // =============================
      // VERIFY PAYMENT
      // =============================

      const verifyRes = await fetch(
        `${API_URL}/payment/verify/${response.reference}`
      );

      const verifyData =
        await verifyRes.json();

      // =============================
      // CHECK PAYMENT STATUS
      // =============================

      if (
        verifyData.data.status !==
        "success"
      ) {

        alert("Payment verification failed");

        return;
      }

      // =============================
      // CREATE ORDERS
      // =============================

      for (const shopId in groupedByShop) {

        const items =
          groupedByShop[shopId];

        const totalAmount =
          items.reduce(
            (sum, item) =>
              sum + item.price * item.qty,
            0
          );

        await fetch(
          `${API_URL}/orders`,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              customerName:
                data.get("name"),

              customerPhone:
                data.get("phone"),

              customerAddress:
                data.get("location"),

              shopId,

              paymentReference:
                response.reference,

              items: items.map(item => ({

                productId:
                  item._id || item.id,

                name: item.name,

                price: item.price,

                image: item.image,

                quantity: item.qty
              })),

              totalAmount
            })
          }
        );
      }

      // =============================
      // CLEAR CART
      // =============================

      localStorage.removeItem(
        "miezaCart"
      );

      // =============================
      // RESET FORM
      // =============================

      form.reset();

      // =============================
      // SHOW SUCCESS
      // =============================

      section.style.display =
        "none";

      success.style.display =
        "block";

      success.classList.remove(
        "hidden"
      );

      alert("Payment successful!");

    } catch (err) {

      console.log(err);

      alert("Order failed");

    }

  })();

},

  onClose: function() {

    alert("Payment cancelled");

  }

});

handler.openIframe();

  } catch (err) {

      console.log(err);

      alert("Order failed");

    } finally {

      btn.textContent = "Place Order";

      btn.disabled = false;
    }
  });
});