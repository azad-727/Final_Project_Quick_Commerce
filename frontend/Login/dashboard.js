// --- START OF FILE dashboard.js ---

const token = localStorage.getItem("token"); // Get token once at the top
console.log("Dashboard Token:", token);

// --- Profile Navigation ---
function profile() {
    if (!token) {
        console.error("Cannot go to profile: Token not found.");
        alert("Please log in to view your profile.");
        return;
    }
    // Using sessionStorage might be okay if profile page also expects it,
    // but usually, you'd just rely on localStorage being available.
    // sessionStorage.setItem("token", token); // Optional: only if profile page NEEDS sessionStorage explicitly
    console.log("Navigating to profile page...");
    // IMPORTANT: Use relative paths from the current HTML file's location if possible,
    // or absolute paths from the domain root. Avoid file:/// URIs for web apps.
    window.location.href = "../Profile/main-acc-pg.html"; // Assumes profile is one level up, then into Profile folder
}

// --- Category Loading and Sidebar Handling ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard DOM ready.");

    // --- Configuration & Elements ---
    const API_BASE_URL = "http://localhost:8080"; // Adjust if needed
    const CATEGORIES_ENDPOINT = "/api/categories";
    const categoryListElement = document.getElementById('categoryList'); // Get the UL element

    // --- Validation ---
    if (!categoryListElement) {
        console.error("Element with ID 'categoryList' not found. Cannot display categories.");
        return;
    }
    if (!token) {
        console.error("Authentication token not found in localStorage. Cannot load categories.");
        categoryListElement.innerHTML = '<li class="text-red-500 p-4">Error: Not logged in.</li>';
        return;
    }

    // --- Function to Load Categories ---
    async function loadCategories() {
        showSidebarLoadingState(true);
        console.log(`Fetching categories from: ${API_BASE_URL}${CATEGORIES_ENDPOINT}`);

        try {
            const response = await fetch(`${API_BASE_URL}${CATEGORIES_ENDPOINT}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error fetching categories: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to load categories (Status: ${response.status}).`);
            }

            const categories = await response.json();
            console.log("Categories fetched:", categories);
            renderCategorySidebar(categories);

        } catch (error) {
            console.error("An error occurred while loading categories:", error);
            showSidebarErrorState(error.message || "Could not fetch categories.");
        } finally {
            showSidebarLoadingState(false); // Ensure loading state is removed
        }
    }

    // --- Function to Render Categories in Sidebar ---
    function renderCategorySidebar(categories) {
        // Clear previous content (loading/error message)
        categoryListElement.innerHTML = '';

        if (!categories || categories.length === 0) {
            categoryListElement.innerHTML = '<li class="text-gray-500 p-4">No categories found.</li>';
            return;
        }

        // Loop through each category and create list items
        categories.forEach(category => {
            const listItem = document.createElement('li');

            // Apply the necessary classes from the static HTML example
            // NOTE: Tailwind @apply is not used here, these are the computed classes
            listItem.className = "shadow-[8px_8px_0px_black] border text-[#bf4f06] py-2 px-4 p-5 rounded-none border-[3px] border-solid border-[black] bg-[#ffd196] text-center bold-text sec_cat hover-dark cursor-pointer"; // Added cursor-pointer

            listItem.textContent = category.title || 'Unnamed Category';
            listItem.dataset.categoryId = category.id; // Store ID for potential filtering

            // Add click listener
            listItem.addEventListener('click', (event) => handleCategoryClick(event, category.id, category.title));

            categoryListElement.appendChild(listItem);
        });
    }

    // --- Function to Handle Category Click ---
    function handleCategoryClick(event, categoryId, categoryTitle) {
        console.log(`Category clicked: ID=${categoryId}, Title=${categoryTitle}`);

        // 1. Visually highlight the selected category (optional)
        const allCategoryItems = categoryListElement.querySelectorAll('li');
        allCategoryItems.forEach(item => item.classList.remove('active')); // Assuming you have an 'active' style
        if (event.currentTarget) {
             event.currentTarget.classList.add('active'); // Add active class to the clicked item
        }

        // 2. TODO: Implement logic to load/filter products in the main content area
        // For now, just log a message
        const categoryPageUrl = `file:///G:/Azad%20Clg/BCA%20Final%20Year%20Project%20-%20Quick-Commerce-Backend/frontend/Admin/Backend/User-Category.html?categoryId=${categoryId}`;
        console.log(`Navigating to: ${categoryPageUrl}`);
        window.location.href = categoryPageUrl;
    
    }


    // --- Helper Functions for Sidebar State ---
    function showSidebarLoadingState(isLoading) {
        if (isLoading) {
            // Check if list is empty before adding loading message
            if (categoryListElement.innerHTML.trim() === '') {
                 categoryListElement.innerHTML = '<li class="text-gray-500 p-4">Loading categories...</li>';
            }
        } else {
             // If the current content is a loading/error message, clear it.
             // Otherwise, renderCategorySidebar will handle clearing.
             const firstChild = categoryListElement.firstElementChild;
             if (firstChild && (firstChild.textContent.includes('Loading') || firstChild.textContent.includes('Error'))) {
                 categoryListElement.innerHTML = '';
             }
        }
    }

    function showSidebarErrorState(errorMessage) {
        categoryListElement.innerHTML = `<li class="text-red-500 p-4">Error: ${errorMessage}</li>`;
    }

    // --- Initial Load ---
    loadCategories();

}); 





// End DOMContentLoaded

// --- Make sure dashboard-header.js still handles its part (ETA, Location) ---
// If dashboard-header.js also needs the token or makes API calls, ensure it retrieves
// the token similarly and includes the Authorization header.

// --- END OF FILE dashboard.js ---


// --- START OF FILE header.js (or add to shared script) ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Header script loaded.");

    const cartIconContainer = document.getElementById('cartIconContainer');
    const quickCartPopup = document.getElementById('quickCartPopup');
    const cartItemCountElement = document.getElementById('cartItemCount');
    const quickCartItemsContainer = document.getElementById('quickCartItems');
    const quickCartSubtotalElement = document.getElementById('quickCartSubtotal');

    let hideCartTimeout; // Timeout for hiding cart on mouseleave

    /**
     * Updates the cart item count badge in the header.
     */
    function updateCartBadge() {
        if (!cartItemCountElement) return;
        const totalQuantity = getCartTotalQuantity(); // From cartUtils.js
        console.log("Updating cart badge count:", totalQuantity);
        if (totalQuantity > 0) {
            cartItemCountElement.textContent = totalQuantity;
            cartItemCountElement.style.display = 'flex'; // Show badge
        } else {
            cartItemCountElement.style.display = 'none'; // Hide badge
        }
    }

    /**
     * Renders the items in the quick cart popup.
     */
    function renderQuickCart() {
        if (!quickCartPopup || !quickCartItemsContainer || !quickCartSubtotalElement) return;

        const cart = getCart(); // From cartUtils.js
        console.log("Rendering quick cart with items:", cart);
        quickCartItemsContainer.innerHTML = ''; // Clear previous items

        if (cart.length === 0) {
            quickCartItemsContainer.innerHTML = '<p class="text-center text-gray-500 text-sm py-4">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex items-center justify-between gap-2 border-b py-2 text-sm';
                itemElement.innerHTML = `
                    <img src="${item.imageUrl || 'img/placeholder.png'}" alt="${item.name}" class="w-10 h-10 object-contain border rounded flex-shrink-0">
                    <div class="flex-grow overflow-hidden mr-2">
                        <p class="font-semibold truncate">${item.name}</p>
                        <p class="text-xs text-gray-600">${item.quantity} x ₹${item.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <button class="text-red-500 hover:text-red-700 text-lg px-1 remove-quick-cart-item" data-product-id="${item.id}" title="Remove item">×</button>
                `;
                quickCartItemsContainer.appendChild(itemElement);
            });

            // Add event listeners to remove buttons AFTER they are added to the DOM
            quickCartItemsContainer.querySelectorAll('.remove-quick-cart-item').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.currentTarget.dataset.productId;
                    console.log(`Quick cart remove clicked for ID: ${productId}`);
                    removeFromCart(productId); // from cartUtils.js
                    // No need to manually call renderQuickCart here, cartUpdated event handles it
                });
            });
        }

        // Update subtotal
        const subtotal = getCartSubtotal(); // from cartUtils.js
        quickCartSubtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    }

    // --- Event Listeners ---

    // Show quick cart on hover/focus
    if (cartIconContainer && quickCartPopup) {
        cartIconContainer.addEventListener('mouseenter', () => {
            clearTimeout(hideCartTimeout); // Clear any pending hide timeout
            renderQuickCart(); // Update content when showing
            quickCartPopup.style.display = 'block';
        });
        cartIconContainer.addEventListener('focusin', () => { // For keyboard navigation
             clearTimeout(hideCartTimeout);
             renderQuickCart();
             quickCartPopup.style.display = 'block';
        });

        // Hide quick cart on mouseleave (with a small delay)
        cartIconContainer.addEventListener('mouseleave', () => {
            hideCartTimeout = setTimeout(() => {
                 quickCartPopup.style.display = 'none';
            }, 300); // 300ms delay
        });
         cartIconContainer.addEventListener('focusout', (event) => { // For keyboard navigation
             // Hide only if focus moves outside the entire cart container AND popup
             if (!cartIconContainer.contains(event.relatedTarget)) {
                  hideCartTimeout = setTimeout(() => {
                     quickCartPopup.style.display = 'none';
                  }, 150); // Shorter delay for focus out
             }
         });


        // Keep popup open if mouse enters the popup itself
        quickCartPopup.addEventListener('mouseenter', () => {
            clearTimeout(hideCartTimeout);
        });
        // Hide popup if mouse leaves the popup itself
        quickCartPopup.addEventListener('mouseleave', () => {
             hideCartTimeout = setTimeout(() => {
                 quickCartPopup.style.display = 'none';
             }, 300);
        });
    }

    // Listen for the custom 'cartUpdated' event
    window.addEventListener('cartUpdated', () => {
        console.log("Event 'cartUpdated' received.");
        updateCartBadge(); // Update the header badge
        // If the quick cart is currently visible, re-render it
        if (quickCartPopup && quickCartPopup.style.display === 'block') {
            renderQuickCart();
        }
    });

    // --- Initial Setup ---
    updateCartBadge(); // Update badge on initial page load

});
// --- END OF FILE header.js ---