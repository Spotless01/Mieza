const ADMIN_API_URL =
  "https://mieza.onrender.com/api";

async function verifyAdminAccess(
  allowedRoles = [
    "owner",
    "cofounder",
    "staff"
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

    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    const ownerOnlyPages = new Set([
      "admin-settings.html",
      "admin-users.html",
      "admin-settlements.html",
      "admin-analytics.html"
    ]);

    if (ownerOnlyPages.has(currentPage) && admin.role !== "owner") {
      alert("This section is available to the founder only.");
      window.location.replace("admin-dashboard.html");
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