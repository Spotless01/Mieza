const API_URL =
  "https://mieza.onrender.com/api";

const token =
  localStorage.getItem(
    "adminToken"
  );

const adminUser =
  JSON.parse(
    localStorage.getItem(
      "adminUser"
    ) || "null"
  );

if (
  !token ||
  !adminUser
) {
  clearAdminSession();

  window.location.replace(
    "admin-login.html"
  );
}

if (
  adminUser &&
  adminUser.mustChangePassword !== true
) {
  window.location.replace(
    "admin-dashboard.html"
  );
}

const form =
  document.getElementById(
    "changeAdminPasswordForm"
  );

const button =
  document.getElementById(
    "changePasswordBtn"
  );

form.addEventListener(
  "submit",
  changeAdminPassword
);

async function changeAdminPassword(
  event
) {

  event.preventDefault();

  const currentPassword =
    document.getElementById(
      "currentPassword"
    ).value;

  const newPassword =
    document.getElementById(
      "newPassword"
    ).value;

  const confirmPassword =
    document.getElementById(
      "confirmPassword"
    ).value;

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    alert(
      "Please complete all password fields."
    );

    return;
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    alert(
      "The new passwords do not match."
    );

    return;
  }

  if (
    newPassword.length < 8
  ) {
    alert(
      "Your new password must contain at least 8 characters."
    );

    return;
  }

  button.disabled = true;

  button.textContent =
    "Changing Password...";

  try {

    const res =
      await fetch(
        `${API_URL}/admin-auth/change-password`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      alert(
        data.message ||
        "Unable to change password"
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

    alert(
      "Password changed successfully."
    );

    window.location.replace(
      "admin-dashboard.html"
    );

  } catch (err) {

    console.log(
      "Password change error:",
      err
    );

    alert(
      "Unable to change password. Please try again."
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "Change Password";

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