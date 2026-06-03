  async function loginAdmin() {

  const email =
    document.getElementById(
      "email"
    ).value;

  const password =
    document.getElementById(
      "password"
    ).value;

  try {

    const res = await fetch(
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

      alert(data.message);
      return;

    }

    localStorage.setItem(
      "adminToken",
      data.token
    );

    location.href =
      "admin-dashboard.html";

  } catch (err) {

    console.log(err);

    alert(
      "Login failed"
    );

  }

}