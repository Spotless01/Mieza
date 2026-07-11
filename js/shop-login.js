async function login() {

  const emailInput =
    document.getElementById("email");

  const passwordInput =
    document.getElementById("password");

  const loginBtn =
    document.getElementById(
      "shopLoginBtn"
    );

  const email =
    emailInput.value
      .trim()
      .toLowerCase();

  const password =
    passwordInput.value;

  if (!email || !password) {
    alert(
      "Please enter your email and password."
    );

    return;
  }

  if (loginBtn?.disabled) return;

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent =
      "Logging in...";
  }

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data.message ||
        "Login failed"
      );

      return;
    }

    if (
      !data.token ||
      !data.shop
    ) {
      alert(
        "The server returned incomplete login information."
      );

      return;
    }

    localStorage.setItem(
      "shopToken",
      data.token
    );

    localStorage.setItem(
      "shop",
      JSON.stringify(
        data.shop
      )
    );

    window.location.replace(
      "shop-dashboard.html"
    );

  } catch (err) {

    console.log(
      "Shop login error:",
      err
    );

    alert(
      "Server error. Please try again."
    );

  } finally {

    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent =
        "Login";
    }

  }

}

// Allow Enter key login
document.addEventListener(
  "DOMContentLoaded",
  () => {

    document
      .getElementById("password")
      ?.addEventListener(
        "keydown",
        event => {

          if (event.key === "Enter") {
            event.preventDefault();
            login();
          }

        }
      );

  }
);