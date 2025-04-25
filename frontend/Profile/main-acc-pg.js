const token=localStorage.getItem("token");
console.log(token);
function profile_pg(){
    sessionStorage.setItem("token", token);
    window.location.href = "Profilee.html";
}
function logout(){
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");

    // ✅ Redirect to login page
    window.location.href = "file:///G:/Azad%20Clg/BCA%20Final%20Year%20Project%20-%20Quick-Commerce-Backend/frontend/Login/login.html";
}
document.addEventListener("DOMContentLoaded", function () {
    const name=document.getElementById("name");
    const phone=document.getElementById("phno");
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
        name.innerHTML=data.name;
        phone.innerHTML=data.phone;
    })
    .catch(error => console.error("Error fetching profile:", error));
});