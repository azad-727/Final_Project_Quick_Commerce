

//Common JS
function logout(){
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");

    // ✅ Redirect to login page
    window.location.href = "../login/asap-login-page.html";
}