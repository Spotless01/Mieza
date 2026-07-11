async function loginAdmin() {

  const email =
    document.getElementById(
      "email"
    ).value
      .trim()
      .toLowerCase();

  const password =
    document.getElementById(
      "password"
    ).value;

  if (!email || !password) {
    alert(
      "Please enter your email and password."
    );
    return;
  }

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

    location.href =
      "admin-dashboard.html";

  } catch (err) {

    console.log(
      "Admin login error:",
      err
    );

    alert(
      "Login failed. Please try again."
    );

  }

}