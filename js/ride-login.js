const API_URL =
"https://mieza.onrender.com/api";

document
.getElementById("rideLoginForm")
.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const loginBtn =
    document.getElementById("loginBtn");

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try{

        const response =
        await fetch(

        `${API_URL}/ride-drivers/login`,

        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                email:
                document.getElementById("email").value,

                password:
                document.getElementById("password").value

            })

        }

        );

        const data =
        await response.json();

        if(!response.ok){

            alert(
                data.message ||
                "Login failed."
            );

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

            return;

        }

        localStorage.setItem(
            "rideDriverToken",
            data.token
        );

        localStorage.setItem(
            "rideDriver",
            JSON.stringify(data.driver)
        );

        window.location.href =
        "ride-driver-dashboard.html";

    }

    catch(err){

        console.log(err);

        alert(
            "Unable to login."
        );

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";

    }

});