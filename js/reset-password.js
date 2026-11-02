(() => {
  const params = new URLSearchParams(window.location.search);
  const accountType = params.get("type");
  const token = params.get("token");
  const validTypes = ["shop", "rider", "rideDriver"];
  const apiBase = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5001/api"
    : "https://mieza.onrender.com/api";
  const requestForm = document.getElementById("requestForm");
  const confirmForm = document.getElementById("confirmForm");
  const message = document.getElementById("message");
  const title = document.getElementById("pageTitle");
  const intro = document.getElementById("pageIntro");
  const back = document.getElementById("backToLogin");
  const loginPages = { shop: "shop-login.html", rider: "rider-login.html", rideDriver: "ride-login.html" };

  function showMessage(text, kind) {
    message.textContent = text;
    message.className = `reset-message ${kind}`;
  }
  function setBusy(button, busy, text, original) {
    button.disabled = busy;
    button.textContent = busy ? text : original;
  }

  if (!validTypes.includes(accountType)) {
    requestForm.hidden = true;
    confirmForm.hidden = true;
    title.textContent = "Invalid password reset page";
    intro.textContent = "Please return to your account login page and select Forgot password again.";
    back.href = "index.html";
  } else {
    back.href = loginPages[accountType];
    if (token) {
      requestForm.hidden = true;
      confirmForm.hidden = false;
      title.textContent = "Create a new password";
      intro.textContent = "Choose a new password for your Mieza account. This reset link can only be used once.";
    }
  }

  requestForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!validTypes.includes(accountType)) return;
    const button = document.getElementById("requestBtn");
    setBusy(button, true, "Sending...", "Send reset link");
    message.className = "reset-message";
    try {
      const response = await fetch(`${apiBase}/password-reset/request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, email: document.getElementById("email").value.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send reset link.");
      showMessage(data.message || "If an account with that email exists, a reset link has been sent.", "success");
    } catch (error) {
      showMessage(error.message || "Unable to contact Mieza. Please try again.", "error");
    } finally { setBusy(button, false, "", "Send reset link"); }
  });

  confirmForm.addEventListener("submit", async event => {
    event.preventDefault();
    const password = document.getElementById("newPassword").value;
    const confirmation = document.getElementById("confirmPassword").value;
    if (password !== confirmation) return showMessage("The passwords do not match.", "error");
    if (password.length < 8) return showMessage("Use at least 8 characters for your new password.", "error");
    const button = document.getElementById("confirmBtn");
    setBusy(button, true, "Saving...", "Save new password");
    message.className = "reset-message";
    try {
      const response = await fetch(`${apiBase}/password-reset/confirm`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, token, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Password reset failed.");
      showMessage(data.message, "success");
      confirmForm.hidden = true;
      back.textContent = "Log in with your new password";
    } catch (error) {
      showMessage(error.message || "Unable to reset password. Request a new link.", "error");
    } finally { setBusy(button, false, "", "Save new password"); }
  });
})();
