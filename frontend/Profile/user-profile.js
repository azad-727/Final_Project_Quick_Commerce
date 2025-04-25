const token=localStorage.getItem("token");
console.log(token);
document.addEventListener("DOMContentLoaded", function () {
    const nameField = document.getElementById("name-field");
    const name=document.getElementById("name");
    const phone=document.getElementById("phno");
    const phoneField = document.getElementById("phone-field");
    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");
    const updateBtn = document.getElementById("update-profile-btn");
    
    // 🔹 Fetch user profile data
    fetch("http://localhost:8080/api/users/profile", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            // "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        nameInput.value = data.name;
        name.innerHTML=data.name;
        phone.innerHTML=data.phone;
        emailInput.value = data.email;
        phoneInput.value = data.phone;
    })
    .catch(error => console.error("Error fetching profile:", error));

    // 🔹 Enable editing when clicking on the field
    function enableEditing(field, input) {
        field.addEventListener("click", function () {
            input.disabled = false;
            input.focus();
            field.style.backgroundColor = "black"; // Highlight editable state
        });
    }

    enableEditing(nameField, nameInput);
    enableEditing(phoneField, phoneInput);

    // 🔹 Update profile on button click
    updateBtn.addEventListener("click", function () {
        fetch("http://localhost:8080/api/users/profile", {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nameInput.value,
                phone: phoneInput.value
            })
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
            nameInput.disabled = true;
            phoneInput.disabled = true;
            nameField.style.backgroundColor = "#f8f8f8"; 
            phoneField.style.backgroundColor = "#f8f8f8"; 
        })
        .catch(error => console.error("Error updating profile:", error));
    });
});

//change password
document.getElementById("change-password-btn").addEventListener("click", function () {
    document.getElementById("password-modal").style.display = "block";
});

document.getElementById("close-modal").addEventListener("click", function () {
    document.getElementById("password-modal").style.display = "none";
});

document.getElementById("submit-password-change").addEventListener("click", function () {
    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;

    if (!oldPassword || !newPassword) {
        alert("Please fill both fields.");
        return;
    }
 // Get Token (Adjust if stored differently)
    
    fetch("http://localhost:8080/api/users/change-password", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
            
        },
        body: JSON.stringify({ oldPassword, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Password changed successfully") {
            alert("Password updated successfully!");
            document.getElementById("password-modal").style.display = "none"; // Close modal
        } else {
            alert("Error: " + data.message); // Show error message
        }
    })
    .catch(error => console.error("Error:", error));
    
});

function logout(){
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");

    // ✅ Redirect to login page
    window.location.href = "file:///G:/Azad%20Clg/BCA%20Final%20Year%20Project%20-%20Quick-Commerce-Backend/frontend/Login/login.html";
};

// Delete Account 
document.addEventListener("DOMContentLoaded", function () {
    const deleteBtn = document.getElementById("deleteBtn");

    deleteBtn.addEventListener("click", async function () {
        const confirmation = confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (!confirmation) return;

        const token = localStorage.getItem("token"); // Adjust if using sessionStorage or cookies

        try {
            const response = await fetch("http://localhost:8080/api/users/delete-account", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                alert("Account deleted successfully.");
                localStorage.removeItem("token"); // Clear token
                window.location.href = "../Login/login.html "; // Redirect to login or home
            } else {
                const errorData = await response.json();
                alert("Error deleting account: " + errorData.message);
            }

        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong while deleting account.");
        }
    });
});
