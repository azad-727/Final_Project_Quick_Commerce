// --- START OF admin-addProduct.js ---

// --- Common JS & Sidebar Logic (Keep As Is) ---
const token = localStorage.getItem("token");
console.log("Admin Token:", token);

function logout(){
    localStorage.removeItem("token"); // Ensure correct key is removed
    sessionStorage.removeItem("token"); // If you use session storage too

    // Redirect to login page
    window.location.href = "../Login/asap-login-page.html"; // Adjust path if needed
}

const sidebar = document.getElementById('adminSidebar');
const hamburgerButton = document.getElementById('hamburgerButton');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}
if (hamburgerButton) {
    hamburgerButton.addEventListener('click', e => {
        e.stopPropagation();
        openSidebar();
    });
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}
// --- End Common JS & Sidebar ---


// --- Add Product Specific Logic ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Add Product specific script loaded.");

    // --- Configuration & Elements ---
    const API_BASE_URL = "http://localhost:8080"; // Adjust if needed
    const CATEGORIES_ENDPOINT = "/api/categories";
    const PRODUCTS_ENDPOINT = "/api/products";
    const addProductForm = document.getElementById('addProductForm');
    const categorySelect = document.getElementById('categorySelect'); // Target the new select ID
    const submitButton = addProductForm ? addProductForm.querySelector('button[type="submit"]') : null; // Get submit button

    // --- Validation ---
    if (!token) {
        console.error("Authentication token missing.");
        alert("Authentication Error: Please log in again.");
        // Optionally redirect
        if (submitButton) submitButton.disabled = true; // Disable form submission
        return;
    }
     if (!addProductForm) {
        console.error("Form #addProductForm not found!");
        return; // Can't proceed without the form
    }
    if (!categorySelect) {
        console.error("Select element #categorySelect not found! Cannot load categories.");
        // Don't return, maybe user can still submit if category isn't strictly required?
        // Or disable submit button: if (submitButton) submitButton.disabled = true;
    }


    // --- Function to Load Categories ---
    async function loadCategories() {
        if (!categorySelect) return; // Don't proceed if select element is missing

        console.log("Loading categories...");
        categorySelect.disabled = true; // Disable while loading

        try {
            const response = await fetch(`${API_BASE_URL}${CATEGORIES_ENDPOINT}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch categories (Status: ${response.status})`);
            }

            const categories = await response.json();
            console.log("Categories fetched:", categories);
            populateCategoryDropdown(categories);

        } catch (error) {
            console.error("Error loading categories:", error);
            // Update dropdown to show error
            categorySelect.innerHTML = '<option value="" disabled selected>Error loading categories</option>';
            // Keep it disabled on error
        }
        // NOTE: Select remains disabled if loading fails or no categories found
    }

    // --- Function to Populate Dropdown ---
    function populateCategoryDropdown(categories) {
         if (!categorySelect) return;

         // Set a default prompt
         categorySelect.innerHTML = '<option value="" disabled selected>-- Select a Category --</option>';

        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id; // Value is the ID
                option.textContent = category.title; // Text is the title
                categorySelect.appendChild(option);
            });
             categorySelect.disabled = false; // Enable select now that options are loaded
        } else {
            // Handle case where no categories exist
            categorySelect.innerHTML = '<option value="" disabled selected>-- No categories available --</option>';
            // Keep disabled
        }
    }

    // --- Form Submission Handler ---
    async function handleAddProduct(event) {
        event.preventDefault();
        console.log("Add product form submitted.");

        // Create FormData directly from the form - includes categoryId now
        const formData = new FormData(addProductForm);

        // --- REMOVE ALL RENAMING LOGIC ---
        // formData.append("name", formData.get("productName")); // NO LONGER NEEDED if HTML name="name"
        // ... delete all the formData.append(...) and formData.delete(...) lines ...

        // --- VALIDATION ---
        // Check if category was selected (it's required in HTML and backend expects it)
        const selectedCategoryId = formData.get('categoryId');
        if (!selectedCategoryId) {
             alert("Please select a category for the product.");
             return; // Stop submission
        }

        // Optional: Client-side check for other required fields if needed
        // const requiredFields = ['name', 'unit', 'price', 'stock', 'image']; // Add others if needed
        // for (const field of requiredFields) {
        //     const value = formData.get(field);
        //     if (!value || (value instanceof File && value.size === 0)) {
        //         alert(`Please fill in the required field: ${field}`);
        //         return;
        //     }
        // }

        // Log final data before sending (useful for debugging)
        console.log("🧪 Final FormData Preview (sending to backend):");
        for (let pair of formData.entries()) {
           if (pair[1] instanceof File) {
               console.log(`${pair[0]}: File - ${pair[1].name}, Size: ${pair[1].size}`);
           } else {
               console.log(`${pair[0]}: ${pair[1]}`);
           }
        }

        // Disable submit button
        if (submitButton) {
             submitButton.disabled = true;
             submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> ADDING...';
        }

        try {
            const response = await fetch(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": "Bearer " + token
                    // NO Content-Type header needed for FormData
                }
            });

            const responseBodyText = await response.text();

            if (!response.ok || response.status >= 300) { // Check for non-2xx status
                console.error(`HTTP Error: ${response.status} ${response.statusText}`);
                console.error("Response Body:", responseBodyText);
                 let errorMsg = `Failed to add product. Status: ${response.status}.`;
                 try {
                     const errorJson = JSON.parse(responseBodyText);
                     errorMsg += ` Error: ${errorJson.message || responseBodyText}`;
                 } catch (e) {
                     errorMsg += ` Error: ${responseBodyText}`;
                 }
                 alert(errorMsg);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // --- Success ---
            console.log("✅ Product Added Response Body:", responseBodyText);
             const addedProduct = JSON.parse(responseBodyText);
             console.log("✅ Product Added:", addedProduct);
            alert(`Product "${addedProduct.name || 'Unknown'}" added successfully!`);
            addProductForm.reset(); // Reset the form
            // Reset category dropdown to default prompt
            if(categorySelect) categorySelect.value = "";


        } catch (error) {
            console.error("❌ Error adding product:", error);
             if (!error.message.startsWith("HTTP error!")) {
                alert("An unexpected error occurred while adding the product. Check console.");
             }
        } finally {
            // Re-enable submit button
             if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-plus-circle mr-2"></i> Add Product';
             }
        }
    }

    // Attach event listener to form
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // --- Initial Call to Load Categories ---
    loadCategories();

}); // End DOMContentLoaded

// --- END OF admin-addProduct.js ---