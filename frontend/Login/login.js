const url1="http://localhost:8080/api/users/login";
document.querySelector("#submit").addEventListener("click",function(event){
    event.preventDefault();
    const email=document.querySelector("#logintxt").value;
    const password=document.querySelector("#loginpsw").value;
    if(!email||!password){
        alert("Please enter both email and password");
        return;
    }
    const data={email,password};
    fetch(url1,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    })
    .then(response=>{
        if(!response.ok){
            throw new Error(`Login failed! Status:${response.status}`);
        }
        return response.text();
    })
    .then(token=>{
        if (token) {
            console.log("JWT Token:", token);
            localStorage.setItem("token", token); 
            alert("Login successful!");
            window.location.href = "dashboard.html"; 
        } else {
            throw new Error("No token received!");
        }
    })
    .catch(error=>{
        console.error("Error:",error);
        alert("Login Failed. Please check your credentials");
    });
});