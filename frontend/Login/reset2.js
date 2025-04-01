document.addEventListener("DOMContentLoaded", function () {
    const resetForm = document.getElementById("resetForm");
    const resetTokenInput = document.getElementById("resetToken");
    let email = sessionStorage.getItem("resetEmail");
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);

    // if (!resetToken) {
    //     alert("Invalid reset link!");
    //     window.location.href = "login.html"; // Redirect to login if no token
    //     return;
    // }

    // resetTokenInput.value = resetToken;

    resetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // API call to reset password
        fetch("http://localhost:8080/api/users/set-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                newPassword: newPassword,
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Password reset failed");
            }
            return response.text();
        })
        .then(data => {
            alert("Password successfully reset!");
            window.location.href = "login.html"; // Redirect to login page
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to reset password. Please try again.");
        });
    });
});
