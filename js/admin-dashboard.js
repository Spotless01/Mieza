const adminToken =
  localStorage.getItem(
    "adminToken"
  );

if (!adminToken) {

  location.href =
    "admin-login.html";

}

function logoutAdmin() {

  localStorage.removeItem(
    "adminToken"
  );

  location.href =
    "admin-login.html";

}