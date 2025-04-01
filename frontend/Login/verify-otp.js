document.querySelector("#otpForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let otp = document.querySelector("#otp").value;
    let email = sessionStorage.getItem("resetEmail"); // Get stored email from session

    if (!email) {
        alert("Session expired. Please restart the password reset process.");
        window.location.href = "reset-password.html"; // Redirect back to reset page
        return;
    }

    fetch("http://localhost:8080/api/users/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, otp: otp }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Invalid OTP. Please try again.");
        }
        return response.json();
    })
    .then(data => {
        alert("OTP Verified Successfully! Please enter a new password.");
        sessionStorage.setItem("resetToken", data.token); // Store token for password reset
        window.location.href = "new-password.html"; // Redirect to new password page
    })
    .catch(error => {
        document.querySelector("#errorMessage").style.display = "block";
    });
});
