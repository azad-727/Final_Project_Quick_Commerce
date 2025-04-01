document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault();
    let email = document.querySelector("#email").value;

    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    fetch("http://localhost:8080/api/users/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to send OTP. Please try again.");
        }
        return response.text();
    })
    .then(message => {
        alert("OTP sent successfully! Check your inbox.");
        sessionStorage.setItem("resetEmail", email); // Store email for next step
        window.location.href = "verify-otp.html";  // Redirect to OTP verification page
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error: " + error.message);
    });
});
