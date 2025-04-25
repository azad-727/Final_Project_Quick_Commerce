document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("form");
    
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();  // Prevent form from reloading the page

        const firstName = document.querySelector("#first-name").value.trim();
        const lastName = document.querySelector("#last-name").value.trim();
        const name=firstName+" "+lastName;
        const email = document.querySelector("#email").value.trim();
        const phone = document.querySelector("#mobile").value.trim();
        const password = document.querySelector("#password").value.trim();
        const confirmPassword = document.querySelector("#confirm").value.trim();

        // Basic Validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            alert("Please fill out all fields.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Prepare the request payload
        const userData = {
            name: name,
            email: email,
            phone: phone,
            password: password
        };
        console.log(userData);

        // Make API call
        fetch("http://localhost:8080/api/users/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to register. Please try again.");
            }
            return response.json();
        })
        .then(data => {
            alert("Registration Successful!");
            window.location.href = "../Login/login.html";  // Redirect to login page
        })
        .catch(error => {
            console.error("Error:", error);
            alert(error.message);
        });
    });
    
});
