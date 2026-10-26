(() => {
  "use strict";

  const API_URL = (["localhost", "127.0.0.1"].includes(window.location.hostname))
    ? "http://localhost:5001/api"
    : "https://mieza.onrender.com/api";
  const form = document.getElementById("customerRegisterForm");
  const notice = document.getElementById("registerNotice");
  const button = document.getElementById("registerButton");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  function showNotice(message, type) {
    notice.textContent = message;
    notice.className = `login-notice ${type}`;
    notice.hidden = false;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!fullName || !email || !phone || !password) {
      showNotice("Please complete all required fields.", "error");
      return;
    }
    if (password.length < 6) {
      showNotice("Your password must be at least 6 characters long.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showNotice("The passwords do not match.", "error");
      return;
    }

    button.disabled = true;
    button.textContent = "Creating account…";

    try {
      const response = await fetch(`${API_URL}/customers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password })
      });
      let data = {};
      try { data = await response.json(); } catch { /* handled below */ }
      if (!response.ok) throw new Error(data.message || `Registration failed (${response.status}).`);
      if (!data.token || !data.customer) {
        throw new Error("The server did not return the expected account details. Please sign in.");
      }

      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerAuthToken", data.token);
      localStorage.setItem("miezaCustomer", JSON.stringify(data.customer));
      showNotice("Account created successfully. Opening ride booking…", "success");
      window.location.href = "ride-booking.html";
    } catch (error) {
      showNotice(error.message || "Unable to create your account. Please try again.", "error");
      button.disabled = false;
      button.innerHTML = 'Create account <span aria-hidden="true">→</span>';
    }
  });
})();
