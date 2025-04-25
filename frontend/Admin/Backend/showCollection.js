const token=localStorage.getItem("token");
function logout(){
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");

    // ✅ Redirect to login page
    window.location.href = "../login/asap-login-page.html";
}
const table=document.querySelectorAll("data-table")
// --- START OF FILE showCollection.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Show Collections script loaded.");

    // --- Configuration & Elements ---
    const API_BASE_URL = "http://localhost:8080"; // Adjust if your backend URL is different
    const CATEGORIES_ENDPOINT = "/api/categories";
    const tableBody = document.getElementById('collectionsTableBody');

    // --- Validation ---
    if (!tableBody) {
        console.error("Element with ID 'collectionsTableBody' not found. Cannot display data.");
        return;
    }
    if (!token) {
        console.error("Authentication token not found in localStorage.");
        // Optionally display an error message to the user or redirect
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 p-4">Error: Authentication token missing. Please log in.</td></tr>`;
        return;
    }

    // --- Function to Fetch Categories ---
    async function fetchCollections() {
        showLoadingState(true); // Show loading indicator

        try {
            const response = await fetch(`${API_BASE_URL}${CATEGORIES_ENDPOINT}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // Optional for GET, but good practice
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error fetching collections: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to load collections (Status: ${response.status}). ${errorText}`);
            }

            const collections = await response.json(); // Expecting an array of category objects
            console.log("Collections fetched:", collections);
            renderCollections(collections);

        } catch (error) {
            console.error("An error occurred:", error);
            showErrorState(error.message || "Could not fetch collections.");
        } finally {
            showLoadingState(false); // Hide loading indicator
        }
    }

    // --- Function to Render Categories in the Table ---
    function renderCollections(collections) {
        // Clear previous content (loading/error message or old data)
        tableBody.innerHTML = '';

        if (!collections || collections.length === 0) {
            // Display a message if no collections are found
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 p-4">No collections found.</td></tr>`;
            return;
        }

        // Loop through each collection and create a table row
        collections.forEach(collection => {
            const row = document.createElement('tr');

            // Determine product count - assumes 'products' is an array/set in the response
            // If products aren't sent, you might need to adjust backend/frontend
            const productCount = Array.isArray(collection.products) ? collection.products.length : 0;

            // Determine conditions text - using 'type' field
            const conditions = collection.type ? capitalizeFirstLetter(collection.type) : 'N/A'; // e.g., 'Manual' or 'Automatic'

            // Inside renderCollections function in showCollection.js
    row.innerHTML = `
    <td class="text-center">
    <input type="checkbox" class="table-checkbox" aria-label="Select collection ${collection.title}" data-id="${collection.id}">
    </td>
    <td>
    <!-- CORRECTED LINK VVVV -->
    <a href="collectionDetail.html?id=${collection.id}" class="collection-title-link">${collection.title || 'Untitled'}</a>
    </td>
    <td>${productCount}</td>
    <td>${conditions}</td>
`;
            tableBody.appendChild(row);
        });
    }

    // --- Helper Functions ---
    function showLoadingState(isLoading) {
        if (isLoading) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 p-4">Loading collections...</td></tr>`;
        } else {
            // Content will be replaced by renderCollections or showErrorState
        }
    }

    function showErrorState(errorMessage) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 p-4">Error: ${errorMessage}</td></tr>`;
    }

     function capitalizeFirstLetter(string) {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    // --- Initial Fetch Call ---
    fetchCollections();

}); // End DOMContentLoaded
// --- END OF FILE showCollection.js ---