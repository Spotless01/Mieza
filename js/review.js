const API_URL = "https://mieza.onrender.com/api";

const params =
  new URLSearchParams(window.location.search);

const orderId =
  params.get("orderId");

let shopRating = 0;
let riderRating = 0;

document.querySelectorAll(".stars").forEach(starBox => {
  const target = starBox.dataset.target;

  starBox.querySelectorAll("span").forEach(star => {
    star.addEventListener("click", () => {
      const value = Number(star.dataset.value);

      if (target === "shopRating") {
        shopRating = value;
      }

      if (target === "riderRating") {
        riderRating = value;
      }

      starBox.querySelectorAll("span").forEach(s => {
        s.classList.toggle(
          "active",
          Number(s.dataset.value) <= value
        );
      });
    });
  });
});

document
  .getElementById("submitReviewBtn")
  .addEventListener("click", submitReview);

async function submitReview() {
  if (!orderId) {
    alert("Order ID missing");
    return;
  }

  if (!shopRating) {
    alert("Please rate the shop.");
    return;
  }

  if (!riderRating) {
    alert("Please rate the rider.");
    return;
  }

  const res =
    await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId,
        shopRating,
        riderRating,
        shopReview:
          document.getElementById("shopReview").value.trim(),
        riderReview:
          document.getElementById("riderReview").value.trim()
      })
    });

  const data =
    await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to submit review");
    return;
  }

  alert("Thank you for your review!");

  window.location.href = "index.html";
}