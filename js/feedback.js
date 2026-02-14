// ================================
// MIEZA — SHOP FEEDBACK SYSTEM
// ================================

// STORAGE KEY
const FEEDBACK_KEY = "miezaShopFeedback";

// LOAD SAVED FEEDBACK
let feedbackStore = JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || {};

/* ================================
   SAVE FEEDBACK
================================ */
function saveFeedback(shopId, rating, comment) {
  if (!feedbackStore[shopId]) {
    feedbackStore[shopId] = [];
  }

  feedbackStore[shopId].push({
    rating,
    comment,
    date: new Date().toISOString()
  });

  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackStore));
}

/* ================================
   LOAD FEEDBACK
================================ */
function loadFeedback(shopId) {
  const container = document.querySelector(
    `.shop-feedback[data-shop="${shopId}"] .feedback-list`
  );

  if (!container) return;

  const feedbacks = feedbackStore[shopId] || [];

  if (feedbacks.length === 0) {
    container.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  const avg =
    feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

  container.innerHTML = `
    <p><strong>Average Rating:</strong> ⭐ ${avg.toFixed(1)} / 5</p>
    ${feedbacks
      .map(
        f => `
        <div class="feedback-item">
          <p>⭐ ${f.rating}</p>
          <p>${f.comment}</p>
          <small>${new Date(f.date).toLocaleDateString()}</small>
        </div>
      `
      )
      .join("")}
  `;
}

/* ================================
   HANDLE SUBMIT
================================ */
document.addEventListener("submit", e => {
  if (!e.target.classList.contains("feedback-form")) return;

  e.preventDefault();

  const form = e.target;
  const shopId = form.dataset.shop;

  const rating = parseInt(form.rating.value);
  const comment = form.comment.value.trim();

  if (!rating || !comment) {
    alert("Please provide a rating and feedback.");
    return;
  }

  saveFeedback(shopId, rating, comment);
  loadFeedback(shopId);

  form.reset();
  alert("Thank you for your feedback! ⭐");
});

/* ================================
   AUTO-LOAD WHEN SHOP IS OPENED
================================ */
document.addEventListener("shopLoaded", e => {
  const shopId = e.detail.shopId;
  loadFeedback(shopId);
});
