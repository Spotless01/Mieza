async function loginRider() {

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  try {

    const res = await fetch(
      "https://mieza.onrender.com/api/rider-auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
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
      "riderToken",
      data.token
    );

    localStorage.setItem(
      "rider",
      JSON.stringify(data.rider)
    );

    window.location.href =
      "rider-dashboard.html";

  }

  catch (err) {

    console.log(err);

    alert("Login failed");

  }

}