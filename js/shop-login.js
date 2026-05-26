async function login() {

  const email =
    document
      .getElementById("email")
      .value
      .trim()
      .toLowerCase();

  const password =
    document
      .getElementById("password")
      .value
      .trim();

  try {

    const res = await fetch(
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

    // SAVE TOKEN
    localStorage.setItem(
      "shopToken",
      data.token
    );

    // SAVE SHOP DATA
    localStorage.setItem(
  "shop",
  JSON.stringify(data.shop)
);

    alert("Login successful");

    window.location.href =
      "shop-dashboard.html";

  } catch (err) {

    console.log(err);

    alert("Server error");

  }

}