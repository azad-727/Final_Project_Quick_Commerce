// --- START OF FILE collectionDetail.js ---
const token=localStorage.getItem("token");
function logout(){
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");

    // ✅ Redirect to login page
    window.location.href = "../login/asap-login-page.html";
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Collection Detail script loaded.");

    // --- Configuration & Elements ---
    const API_BASE_URL = "http://localhost:8080"; // Adjust if needed
    const CATEGORIES_ENDPOINT = "/api/categories";
    const productsTableBody = document.getElementById('productsTableBody');
    const collectionTitleElement = document.getElementById('collectionTitle');
  

    // --- Get Collection ID from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get('id');

    // --- Validation ---
    if (!productsTableBody || !collectionTitleElement) {
        console.error("Required elements ('productsTableBody' or 'collectionTitle') not found.");
        return;
    }
    if (!token) {
        console.error("Authentication token not found.");
        collectionTitleElement.textContent = "Error";
        showErrorState("Authentication token missing. Please log in.");
        return;
    }
    if (!collectionId) {
        console.error("Collection ID not found in URL query parameters (?id=...).");
        collectionTitleElement.textContent = "Error";
        showErrorState("No collection ID specified in the URL.");
        return;
    }

    console.log(`Fetching details for Collection ID: ${collectionId}`);

    // --- Function to Fetch Collection Details (including products) ---
    async function fetchCollectionDetails() {
        showLoadingState(true);

        try {
            const response = await fetch(`${API_BASE_URL}${CATEGORIES_ENDPOINT}/${collectionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 404) {
                 throw new Error(`Collection with ID ${collectionId} not found.`);
            }
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error fetching collection details: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to load collection details (Status: ${response.status}). ${errorText}`);
            }

            const collection = await response.json(); // Expecting a single category object WITH products
            console.log("Collection details fetched:", collection);

            // --- Backend Check: Ensure 'products' array exists ---
            if (!collection.products || !Array.isArray(collection.products)) {
                 console.warn("Backend response for collection details does not include a 'products' array. Check API/Serialization.");
                 // Decide how to handle: show warning or error?
                 // throw new Error("Product data is missing in the API response.");
            }

            updatePageTitle(collection.title || "Collection Details");
            renderProducts(collection.products || []); // Pass products array (or empty if missing)

        } catch (error) {
            console.error("An error occurred:", error);
            updatePageTitle("Error Loading Collection");
            showErrorState(error.message || "Could not fetch collection details.");
        } finally {
            showLoadingState(false);
        }
    }

    // --- Function to Render Products in the Table ---
    function renderProducts(products) {
        productsTableBody.innerHTML = ''; // Clear previous content

        if (!products || products.length === 0) {
            productsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 p-4">This collection has no products.</td></tr>`; // Adjust colspan if you add columns
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            const price = typeof product.price === 'number' ? `₹${product.price.toFixed(2)}` : 'N/A';
            const stock = typeof product.stock === 'number' ? product.stock : 'N/A';
            console.log(product.imageUrl);

            row.innerHTML = `
                <td>
                    <img src="${product.imageUrl || 'placeholder.png'}" alt="${product.name || 'Product'}" class="product-image-thumb">
                </td>
                <td>${product.name || 'Unnamed Product'}</td>
                <td>${product.sku || 'N/A'}</td>
                <td>${price}</td>
                <td>${stock}</td>
                <!-- Add more cells if needed -->
            `;
            productsTableBody.appendChild(row);
        });
    }

    // --- Helper Functions ---
    function updatePageTitle(title) {
        collectionTitleElement.textContent = title;
        document.title = `Admin - ${title}`; // Also update browser tab title
    }

    function showLoadingState(isLoading) {
        if (isLoading) {
            // Set initial loading state for both title and table
            if (!collectionTitleElement.textContent.includes("Error")) { // Don't overwrite error state
                 updatePageTitle(`Loading Collection #${collectionId}...`);
            }
            productsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 p-4">Loading products...</td></tr>`; // Adjust colspan
        } else {
            // Loading message removed by renderProducts or showErrorState
        }
    }

    function showErrorState(errorMessage) {
         if (!collectionTitleElement.textContent.includes("Error")) { // Don't overwrite title if already error
              updatePageTitle("Error");
         }
        productsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 p-4">Error: ${errorMessage}</td></tr>`; // Adjust colspan
    }

    // --- Initial Fetch Call ---
    fetchCollectionDetails();

}); // End DOMContentLoaded
// --- END OF FILE collectionDetail.js ---