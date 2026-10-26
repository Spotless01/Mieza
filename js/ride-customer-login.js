
(() => {
  "use strict";

  const API_URL = (["localhost", "127.0.0.1"].includes(window.location.hostname))
    ? "http://localhost:5001/api"
    : "https://mieza.onrender.com/api";
  const LOGIN_URL = `${API_URL}/customers/login`;

  const form = document.getElementById("customerLoginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("loginButton");
  const notice = document.getElementById("loginNotice");
  const togglePassword = document.getElementById("togglePassword");

  function showNotice(message, type) {
    notice.textContent = message;
    notice.className = `login-notice ${type}`;
    notice.hidden = false;
  }

  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const showing = passwordInput.type === "text";

      passwordInput.type = showing ? "password" : "text";
      togglePassword.textContent = showing ? "Show" : "Hide";
      togglePassword.setAttribute(
        "aria-label",
        showing ? "Show password" : "Hide password"
      );
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      showNotice("Enter your email address and password.", "error");
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Signing in…";

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        // Handle an empty or non-JSON server response below.
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Sign-in failed (${response.status}).`
        );
      }

      if (!data.token || !data.customer) {
        throw new Error(
          "The server response did not include the expected customer token and details."
        );
      }

      // Use the storage keys recognized by ride-booking.js.
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerAuthToken", data.token);
      localStorage.setItem("miezaCustomer", JSON.stringify(data.customer));

      showNotice("Sign-in successful. Opening ride booking…", "success");

      window.location.href = "ride-booking.html";
    } catch (error) {
      showNotice(
        error.message || "Unable to sign in. Please try again.",
        "error"
      );

      loginButton.disabled = false;
      loginButton.innerHTML = 'Sign in to Mieza <span aria-hidden="true">→</span>';
    }
  });
})();
