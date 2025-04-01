let ul=document.querySelector("details");
let btn=document.querySelector("btn1").addEventListener("click",function(e){
    fetch("http://localhost:8080/api/users/profile",{
        method:"GET",
        headers:
    })  
})
const token=sessionStorage.getItem("authToken");
//Update-profile

document.getElementById("updatedProfileForm").addEventListener("submit",function (e) {
e.preventDefault(); 
const updateprofile={
    name:document.getElementById("name").value,
    phone:document.getElementById("phone").value
};
fetch("http://localhost:8080/api/users/profile",{
    method:"PUT",
    header:{
        "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
    },
    body:JSON.stringify(updateprofile)
})
.then(response=>response.text())
.then(message=>alert(message))
.then(error=>console.error("Error updating profile",error));


});

// Change-Password
document.getElementById(changePasswordForm).addEventListener("submit",function(e){
    e.preventDefault();

    const password={
        oldPassword:document.getElementById("oldPassword").value,
        newPassword:document.getElementById("newPassword").value
    };
    fetch("http://localhost:8080/api/users/change-password",{
        method:"PUT",
        headers:{
            "Authorization":`Bearer ${token}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify(password)
    })
    .then(response)
})
