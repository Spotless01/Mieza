async function loginAdmin() {

  const emailInput =
    document.getElementById(
      "email"
    );

  const passwordInput =
    document.getElementById(
      "password"
    );

  const loginBtn =
    document.getElementById(
      "adminLoginBtn"
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

  // Prevent repeated login requests
  if (loginBtn.disabled) return;

  loginBtn.disabled = true;

  loginBtn.textContent =
    "Logging in...";

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/admin-auth/login",
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
        "Invalid login credentials"
      );

      return;
    }

    if (
      !data.token ||
      !data.admin
    ) {

      alert(
        "The server returned incomplete login information."
      );

      return;
    }

    localStorage.setItem(
      "adminToken",
      data.token
    );

    localStorage.setItem(
      "adminUser",
      JSON.stringify(
        data.admin
      )
    );

    if (
      data.admin.mustChangePassword ===
      true
    ) {

      window.location.replace(
        "change-admin-password.html"
      );

    } else {

      window.location.replace(
        "admin-dashboard.html"
      );

    }

  } catch (err) {

    console.log(
      "Admin login error:",
      err
    );

    alert(
      "Login failed. Please check your internet connection and try again."
    );

  } finally {

    loginBtn.disabled = false;

    loginBtn.textContent =
      "Login";

  }

}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const passwordInput =
      document.getElementById(
        "password"
      );

    passwordInput?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          event.preventDefault();
          loginAdmin();
        }

      }
    );

  }
);