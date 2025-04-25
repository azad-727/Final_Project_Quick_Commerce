const token = localStorage.getItem("token");
console.log("Token:", token);

// 🔹 Logout Function
function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "../Login/login.html";
}

// 🔹 Load User Info
document.addEventListener("DOMContentLoaded", function () {
  const name = document.getElementById("name");
  const phone = document.getElementById("phno");

  // Fetch user profile
  fetch("http://localhost:8080/api/users/profile", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      name.innerText = data.name || "User";
      phone.innerText = data.phone || "N/A";
    })
    .catch((error) => console.error("Error fetching profile:", error));

  // Fetch saved addresses

});

// 🔹Add Address
// 🔹 Show Modal
function addAddress() {
    document.getElementById("addAddressModal").style.display = "flex";
  }
  
  // 🔹 Close Modal
  function closeModal() {
    document.getElementById("addAddressModal").style.display = "none";
  }
  
  // 🔹 Submit New Address
  document.getElementById("addressForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const label = document.getElementById("label").value.trim();
    const Address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
  
    if (!label || !Address || !pincode) {
      alert("Please fill all fields.");
      return;
    }
  
    const full_address = `${Address}, Pincode: ${pincode}`;
  
    fetch("http://localhost:8080/api/addresses/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  "Bearer " + token,
      },
      body: JSON.stringify({
        label: label,   
        fullAddress: full_address,
      }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Address added!");
          closeModal();
        //   fetchAddresses(); // Refresh list
        } else {
          alert("Failed to add address.");
        }
      })
      .catch((err) => {
        console.error("Add address error:", err);
        alert("Something went wrong!");
      });
  });
  


  document.addEventListener("DOMContentLoaded", () => {
    fetchSavedAddresses();
});

function fetchSavedAddresses() {
    if (!token) {
        alert("Please login first");
        return;
    }

    fetch("http://localhost:8080/api/addresses/all", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch addresses");
        }
        return response.json();
    })
    .then(data => {
        console.log("Fetched addresses:", data);
        renderAddresses(data);
    })
    .catch(error => {
        console.error("Error fetching addresses:", error);
        alert("Unable to load addresses.");
    });
}

function renderAddresses(addressList) {
    const container = document.getElementById("saved-address-container");
    container.innerHTML = ""; // Clear existing content

    addressList.forEach(address => {
        const div = document.createElement("div");
        div.classList.add("d1");

        div.innerHTML = `
            <div class="flex items-center" id="address-label">${address.label}</div>
            <div class="inner flex items-center" id="address-box" 
                style="font-weight: lighter; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">
                ${address.fullAddress},
            </div>
            <button class="address-update" data-id="${address.id}">Update</button> | 
            <button class="address-delete" data-id="${address.id}">Delete</button>
        `;

        container.appendChild(div);
    });

    // Attach event listeners for update and delete
    attachAddressActions();
}

function attachAddressActions() {
    document.querySelectorAll(".address-delete").forEach(btn => {
        btn.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            deleteAddress(id);
        });
    });

    document.querySelectorAll(".address-update").forEach(btn => {
        btn.addEventListener("click", function () {
            const ide = this.getAttribute("data-id");
            // console.log(`http://localhost:8080/api/addresses/all?id=${id}`);
            console.log(ide);
            fetch(`http://localhost:8080/api/addresses/all?id=${ide}`, {
            method:"GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
           
            data.forEach(dataa=>{
                if(dataa.id==ide){
                    console.log(dataa);
                    openUpdateModal(dataa);    
                }
            })

        })
        .catch(err => {
            console.error("Error loading address:", err);
            alert("Could not load address data.");
        });           
        });
    });
}
let currentUpdateId = null;

// Show update modal with data
function openUpdateModal(address) {

    currentUpdateId = address.id;

    document.getElementById("updateLabel").value = address.label;
    document.getElementById("updateAddress").value = address.fullAddress;

    document.getElementById("updateAddressModal").style.display = "flex";
}

// Close modal
document.getElementById("closeUpdateModal").addEventListener("click", () => {
    document.getElementById("updateAddressModal").style.display = "none";
});

// Submit update
document.getElementById("submitUpdateAddress").addEventListener("click", () => {
    const updatedData = {
        label: document.getElementById("updateLabel").value,
        fullAddress: document.getElementById("updateAddress").value +" "+ document.getElementById("updatePincode").value
    };

    fetch(`http://localhost:8080/api/addresses/update/${currentUpdateId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(updatedData)
    })
    .then(() => {
        alert("Address updated successfully!");
        document.getElementById("updateAddressModal").style.display = "none";
        fetchSavedAddresses();
    })
    .catch(err => {
        console.error("Update error:", err);
        alert("Failed to update address.");
    });
});

//end of update address
function deleteAddress(id) {
    console.log("Deleting ID:", id);
    fetch(`http://localhost:8080/api/addresses/delete/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to delete");
        alert("Address deleted");
        fetchSavedAddresses(); // Refresh
    })
    .catch(err => {
        console.error("Error deleting address:", err);
        alert("Delete failed");
    });
}
