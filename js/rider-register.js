async function registerRider() {

  const fullName =
    document.getElementById("fullName").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const email =
    document.getElementById("email").value.trim().toLowerCase();

  const password =
    document.getElementById("password").value.trim();

  const vehicleType =
    document.getElementById("vehicleType").value;

  if (
    !fullName ||
    !phone ||
    !email ||
    !password
  ) {
    alert("Please fill all required fields");
    return;
  }

  try {

    const res = await fetch(
      "https://mieza.onrender.com/api/rider-auth/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          fullName,
          phone,
          email,
          password,
          vehicleType
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Rider registered successfully");

    window.location.href =
      "rider-login.html";

  } catch (err) {

    console.log(err);

    alert("Server error");

  }

}