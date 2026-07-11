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

const API_URL =
  "https://mieza.onrender.com/api";

if (
  !token ||
  !adminUser
) {

  location.href =
    "admin-login.html";

}



const form =
  document.getElementById(
    "adminUserForm"
  );

form.addEventListener(
  "submit",
  createAdminUser
);

async function createAdminUser(
  event
) {

  event.preventDefault();

  const name =
    document.getElementById(
      "adminName"
    ).value.trim();

  const email =
    document.getElementById(
      "adminEmail"
    ).value
      .trim()
      .toLowerCase();

  const password =
    document.getElementById(
      "adminPassword"
    ).value;

  try {

    const res =
      await fetch(
        `${API_URL}/admin/admin-users`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            name,
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
        "Unable to create account"
      );

      return;
    }

    alert(
      "Co-founder account created successfully."
    );

    form.reset();

    loadAdminUsers();

  } catch (err) {

    console.log(err);

    alert(
      "Server error. Please try again."
    );

  }

}

async function loadAdminUsers() {

  try {

    const res =
      await fetch(
        `${API_URL}/admin/admin-users`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const admins =
      await res.json();

    if (!res.ok) {

      alert(
        admins.message ||
        "Unable to load admin users"
      );

      return;
    }

    renderAdminUsers(
      admins
    );

  } catch (err) {

    console.log(err);

  }

}

function renderAdminUsers(
  admins
) {

  const table =
    document.getElementById(
      "adminUsersTable"
    );

  table.innerHTML = "";

  admins.forEach(admin => {

    table.innerHTML += `

      <tr>

        <td>
          ${escapeHtml(admin.name)}
        </td>

        <td>
          ${escapeHtml(admin.email)}
        </td>

        <td>
          ${escapeHtml(admin.role)}
        </td>

        <td>
          ${
            admin.isActive
              ? "Active"
              : "Disabled"
          }
        </td>

        <td>
          ${
            admin.lastLoginAt
              ? new Date(
                  admin.lastLoginAt
                ).toLocaleString()
              : "Never"
          }
        </td>

        <td>

          ${
            admin.role === "owner"
              ? "Owner account"
              : `
                <button
                  onclick="changeAdminStatus(
                    '${admin._id}',
                    ${!admin.isActive}
                  )"
                >
                  ${
                    admin.isActive
                      ? "Disable"
                      : "Activate"
                  }
                </button>
              `
          }

        </td>

      </tr>

    `;

  });

}

async function changeAdminStatus(
  adminId,
  isActive
) {

  const action =
    isActive
      ? "activate"
      : "disable";

  const confirmed =
    confirm(
      `Are you sure you want to ${action} this admin account?`
    );

  if (!confirmed) return;

  try {

    const res =
      await fetch(
        `${API_URL}/admin/admin-users/${adminId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            isActive
          })
        }
      );

    const data =
      await res.json();

    alert(
      data.message ||
      "Admin account updated"
    );

    if (res.ok) {
      loadAdminUsers();
    }

  } catch (err) {

    console.log(err);

    alert(
      "Unable to update the admin account."
    );

  }

}

function logoutAdmin() {

  localStorage.removeItem(
    "adminToken"
  );

  localStorage.removeItem(
    "adminUser"
  );

  location.href =
    "admin-login.html";

}

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

async function initializeAdminUsersPage() {

  const verifiedAdmin =
    await verifyAdminAccess([
      "owner"
    ]);

  if (!verifiedAdmin) return;

  loadAdminUsers();

}

initializeAdminUsersPage();