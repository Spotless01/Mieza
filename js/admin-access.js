const ADMIN_API_URL =
  "https://mieza.onrender.com/api";

async function verifyAdminAccess(
  allowedRoles = [
    "owner",
    "cofounder"
  ]
) {

  const token =
    localStorage.getItem(
      "adminToken"
    );

  if (!token) {

    clearAdminSession();

    window.location.href =
      "admin-login.html";

    return null;
  }

  try {

    const res =
      await fetch(
        `${ADMIN_API_URL}/admin-auth/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await res.json();

    if (
      !res.ok ||
      !data.admin
    ) {

      clearAdminSession();

      window.location.href =
        "admin-login.html";

      return null;
    }

    const admin =
      data.admin;

    localStorage.setItem(
      "adminUser",
      JSON.stringify(admin)
    );

    const isPasswordChangePage =
  window.location.pathname
    .endsWith(
      "change-admin-password.html"
    );

if (
  admin.mustChangePassword === true &&
  !isPasswordChangePage
) {

  window.location.replace(
    "change-admin-password.html"
  );

  return null;
}

    if (
      !allowedRoles.includes(
        admin.role
      )
    ) {

      alert(
        "You do not have permission to access this page."
      );

      window.location.href =
        "admin-dashboard.html";

      return null;
    }

    return admin;

  } catch (err) {

    console.log(
      "Admin access verification failed:",
      err
    );

    alert(
      "Unable to verify your admin account. Please log in again."
    );

    clearAdminSession();

    window.location.href =
      "admin-login.html";

    return null;
  }

}

function clearAdminSession() {

  localStorage.removeItem(
    "adminToken"
  );

  localStorage.removeItem(
    "adminUser"
  );

}

function logoutAdmin() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");

  window.location.replace(
    "admin-login.html"
  );
}


// ===================================
// PREVENT LOGGED-OUT ADMIN PAGE RESTORE
// ===================================

window.addEventListener(
  "pageshow",
  event => {

    const token =
      localStorage.getItem(
        "adminToken"
      );

    const isAdminProtectedPage =
      !window.location.pathname
        .endsWith("admin-login.html");

    if (
      isAdminProtectedPage &&
      !token
    ) {
      window.location.replace(
        "admin-login.html"
      );
    }

  }
);