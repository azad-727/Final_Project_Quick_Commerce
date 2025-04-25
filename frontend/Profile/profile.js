document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("authToken"); // Get auth token
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "/login.html"; // Redirect to login
        return;
    }

    const profileUrl = "http://localhost:8080/api/profile";
    
    // Fetch user profile
    fetch(profileUrl, { 
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.email) {
            document.getElementById("profile-name").value = data.name || "";
            document.getElementById("profile-email").value = data.email;
            document.getElementById("profile-phone").value = data.phone || "";
        } else {
            alert("Failed to load profile");
        }
    })
    .catch(error => console.error("Error fetching profile:", error));

    // Handle profile update
    document.getElementById("update-profile-form").addEventListener("submit", function (event) {
        event.preventDefault();
        
        const updatedData = {
            name: document.getElementById("profile-name").value,
            phone: document.getElementById("profile-phone").value
        };

        fetch(profileUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
        })
        .catch(error => console.error("Error updating profile:", error));
    });

    // Handle password change
    document.getElementById("change-password-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const oldPassword = document.getElementById("old-password").value;
        const newPassword = document.getElementById("new-password").value;
        
        fetch("http://localhost:8080/api/change-password", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ oldPassword, newPassword })
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
        })
        .catch(error => console.error("Error changing password:", error));
    });
});
// // Delete Account
// document.getElementById("deleteBtn").addEventListener("click",function(e){
    
// })