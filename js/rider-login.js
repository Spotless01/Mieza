async function loginRider() {

  const emailInput =
    document.getElementById("email");

  const passwordInput =
    document.getElementById("password");

  const loginBtn =
    document.getElementById(
      "riderLoginBtn"
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
        "https://mieza.onrender.com/api/rider-auth/login",
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
      !data.rider
    ) {
      alert(
        "The server returned incomplete login information."
      );

      return;
    }

    localStorage.setItem(
      "riderToken",
      data.token
    );

    localStorage.setItem(
      "rider",
      JSON.stringify(
        data.rider
      )
    );

    window.location.replace(
      "rider-dashboard.html"
    );

  } catch (err) {

    console.log(
      "Rider login error:",
      err
    );

    alert(
      "Login failed. Please try again."
    );

  } finally {

    if (loginBtn) {
      loginBtn.disabled = false;

      loginBtn.textContent =
        "Login";
    }

  }

}

// Allow Enter-key login
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

            loginRider();

          }

        }
      );

  }
);