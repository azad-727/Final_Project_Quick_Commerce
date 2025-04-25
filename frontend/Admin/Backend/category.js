// --- START OF FILE category.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Category page script loaded.");

    // --- Configuration & Elements ---
    const API_BASE_URL = "http://localhost:8080"; // Adjust if needed
    const CATEGORIES_ENDPOINT = "/api/categories";
    const PRODUCTS_ENDPOINT = "/api/products/category";
    const categoryTitleElement = document.getElementById('pageCategoryTitle');
    const productGridElement = document.getElementById('productListingGrid');
    const subcategoryContainer = document.getElementById('subcategoryContainer'); // Get the subcategory container
    const token = localStorage.getItem("token");

    // --- Get Category ID from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('categoryId'); // This is the ID of the category *currently being viewed*

    // --- Validation ---
    if (!categoryTitleElement || !productGridElement) {
        console.error("Required elements ('pageCategoryTitle' or 'productListingGrid') not found.");
        return;
    }
    // Added check for subcategory container
    if (!subcategoryContainer) {
         console.warn("Element with ID 'subcategoryContainer' not found. Subcategory navigation will not be loaded.");
    }
    if (!token) {
        console.error("Authentication token not found.");
        categoryTitleElement.textContent = "Access Denied";
        showProductErrorState("Please log in to view products.");
        return;
    }
    if (!categoryId) {
        console.error("Category ID not found in URL query parameters (?categoryId=...).");
        categoryTitleElement.textContent = "Invalid Category";
        showProductErrorState("No category specified.");
        return; // Stop if no category ID for the main page content
    }

    console.log(`Displaying category page for ID: ${categoryId}`);

    // --- Function to Fetch Category Details (for Title) ---
    async function fetchCategoryDetails(id) {
        // ... (keep existing implementation) ...
        console.log(`Fetching details for Category ID: ${id}`);
        try {
            const response = await fetch(`${API_BASE_URL}${CATEGORIES_ENDPOINT}/${id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 404) throw new Error('Category not found');
                throw new Error(`Failed to load category details (Status: ${response.status})`);
            }
            const category = await response.json();
            updatePageTitle(category.title || "Category Products");
        } catch (error) {
            console.error("Error fetching category details:", error);
            updatePageTitle("Unknown Category");
        }
    }

    // --- Function to Fetch Products for the Category ---
    async function fetchProductsForCategory(id) {
        // ... (keep existing implementation) ...
        showProductLoadingState(true);
        console.log(`Fetching products for Category ID: ${id}`);
        try {
            const response = await fetch(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const errorText = await response.text();
                throw new Error(`Failed to load products (Status: ${response.status}). ${errorText}`);
            }
            const products = await response.json();
            console.log("Products fetched:", products);
            renderProducts(products);
        } catch (error) {
            console.error("Error fetching products:", error);
            showProductErrorState(error.message || "Could not fetch products for this category.");
        } finally {
            showProductLoadingState(false);
        }
    }

   // --- Function to Render Products in the Grid (MODIFIED) ---
   function renderProducts(products) {
    if (!productGridElement) return;
    productGridElement.innerHTML = '';

    if (!products || products.length === 0) {
        productGridElement.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500">No products found in this category.</div>`;
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card'; // Existing class handles overall card style
        card.dataset.productId = product.id;

        const price = typeof product.price === 'number' ? `₹${product.price.toFixed(2)}` : 'N/A';
        const mrp = typeof product.mrp === 'number' && product.mrp > product.price ? `₹${product.mrp.toFixed(2)}` : null;
        const mrpHtml = mrp ? `<span class="product-mrp">${mrp}</span>` : '';
        const imageUrl = product.imageUrl ? product.imageUrl : 'img/placeholder.png';
        const productDetailUrl = `product.html?productId=${product.id}`;

        // --- START: Modified innerHTML ---
        card.innerHTML = `
            <a href="${productDetailUrl}" class="product-link-area block">
                <div class="product-image-wrapper">
                    <img class="product-image" src="${imageUrl}" alt="${product.name || 'Product'}">
                </div>
                <div class="product-details">
                    <h4 class="product-name">${product.name || 'Unnamed Product'}</h4>
                    <p class="product-variant">${product.unit || ''}</p>
                </div>
            </a>

            <div class="product-price-section mt-auto pt-2 flex flex-col gap-2"> <!-- Price & actions stacked -->
                <p class="product-price text-left w-full">${price} ${mrpHtml}</p> <!-- Price takes full width -->

                <!-- Actions Container: Buttons side-by-side -->
                <div class="flex items-center justify-between gap-2 w-full">
                    <!-- Initial Add Button (Visible by default) -->
                    <button class="add-button flex-grow" onclick="handleAddInitial(this)">Add</button> <!-- Use new handler -->

                    <!-- Quantity Controls (Hidden by default) -->
                    <div class="hidden items-center justify-center border border-black rounded-md shadow-[3px_3px_0px_black]" data-qty-controls>
                        <button class="qty-button minus-button rounded-l-md px-3 py-1" onclick="decreaseQty(this)">-</button>
                        <!-- Replaced span with input -->
                        <input type="number" class="qty-input w-10 text-center border-t border-b border-black font-bold text-sm py-1" value="1" min="1" max="99" oninput="handleQtyInput(this)">
                        <button class="qty-button plus-button rounded-r-md px-3 py-1" onclick="increaseQty(this)">+</button>
                    </div>

                    <!-- Buy Now Button -->
                    <button class="buy-now-button flex-shrink-0" onclick="handleBuyNow(this)">Buy Now</button>
                </div>
            </div>
        `;
        // --- END: Modified innerHTML ---

        productGridElement.appendChild(card);

        // Check cart state on load and show qty controls if needed
        const quantityInCart = getCartItemQuantity(product.id); // From cartUtils.js
        if (quantityInCart > 0) {
            showQtyControls(card, quantityInCart); // Call helper to show correct UI
        }
    });
}
// --- Add New Function: handleBuyNow ---
function handleBuyNow(button) {
    const card = button.closest('.product-card');
    if (!card) return;
    const productId = card.dataset.productId;

    // 1. Gather product info (same as addToCart)
     const productName = card.querySelector('.product-name')?.textContent || 'Unknown Product';
     const productPriceText = card.querySelector('.product-price')?.textContent || '0';
     const productPrice = parseFloat(productPriceText.replace('₹', '').split(' ')[0]) || 0;
     const productUnit = card.querySelector('.product-variant')?.textContent || '';
     const productImageUrl = card.querySelector('.product-image')?.src || 'img/placeholder.png';

     const productData = {
         id: productId,
         name: productName,
         price: productPrice,
         unit: productUnit,
         imageUrl: productImageUrl
     };

    console.log(`Buy Now clicked for product:`, productData);

    // 2. Add THIS item to the cart (using the utility function)
    // This ensures the item is in the cart before redirecting.
    // You might modify addToCart or create a specific function if "Buy Now"
    // should *replace* the cart instead of just adding. Let's assume adding for now.
    addToCart(productData); // from cartUtils.js

    // 3. Redirect to the cart page
    const cartPageUrl = 'cart.html'; // Adjust path if needed
    console.log(`Redirecting to cart page: ${cartPageUrl}`);
    window.location.href = cartPageUrl;
}

function showQtyControls(cardElement, quantity) {
    const addButton = cardElement.querySelector('.add-button');
    const qtyControls = cardElement.querySelector('[data-qty-controls]');
    const qtyInput = cardElement.querySelector('.qty-input'); // Target input now

    if (addButton) addButton.classList.add('hidden');
    if (qtyControls) {
        qtyControls.classList.remove('hidden');
        qtyControls.classList.add('flex'); // Use flex to display inline-block items
    }
    if (qtyInput) qtyInput.value = quantity; // Set input value
}
// Helper to show Add button and hide Qty controls
function showAddButton(cardElement) {
    const addButton = cardElement.querySelector('.add-button');
    const qtyControls = cardElement.querySelector('[data-qty-controls]');

    if (addButton) addButton.classList.remove('hidden');
    if (qtyControls) {
        qtyControls.classList.add('hidden');
        qtyControls.classList.remove('flex');
    }
}

// NEW: Initial handler when "Add" button is clicked
function handleAddInitial(button) {
   const card = button.closest('.product-card');
   if (!card) return;
   const productId = card.dataset.productId;

   // Gather product info
    const productData = {
        id: productId,
        name: card.querySelector('.product-name')?.textContent || 'Unknown',
        price: parseFloat((card.querySelector('.product-price')?.textContent || '0').replace('₹','').split(' ')[0]) || 0,
        unit: card.querySelector('.product-variant')?.textContent || '',
        imageUrl: card.querySelector('.product-image')?.src || ''
    };

   console.log(`Adding initial product to cart:`, productData);
   addToCart(productData); // from cartUtils.js - adds quantity 1 or increments
   const newQty = getCartItemQuantity(productId); // Get the actual new quantity after add
   showQtyControls(card, newQty || 1); // Show controls with the correct quantity (at least 1)
   showCartNotification(`${productData.name || 'Item'} added to cart!`);
}

// UPDATED: Increase Quantity
function increaseQty(button) {
   const card = button.closest('.product-card');
   if (!card) return;
   const productId = card.dataset.productId;
   const qtyInput = card.querySelector('.qty-input');
   if (!qtyInput) return;

   let currentQty = parseInt(qtyInput.value) || 0;
   currentQty++;
   qtyInput.value = currentQty; // Update input display

   console.log(`Increased qty for ${productId} to ${currentQty}`);
   updateCartQuantity(productId, currentQty); // from cartUtils.js
}

// UPDATED: Decrease Quantity
function decreaseQty(button) {
   const card = button.closest('.product-card');
    if (!card) return;
   const productId = card.dataset.productId;
   const qtyInput = card.querySelector('.qty-input');
   if (!qtyInput) return;

   let currentQty = parseInt(qtyInput.value) || 0;

   if (currentQty > 1) {
       currentQty--;
       qtyInput.value = currentQty; // Update input display
       console.log(`Decreased qty for ${productId} to ${currentQty}`);
       updateCartQuantity(productId, currentQty); // from cartUtils.js
   } else {
       // Quantity becomes 0 or less, remove from cart and show Add button
       console.log(`Removing product ${productId} from cart`);
       removeFromCart(productId); // from cartUtils.js
       showAddButton(card); // Show the Add button again
   }
}

// NEW: Handle direct input in quantity field
function handleQtyInput(inputElement) {
   const card = inputElement.closest('.product-card');
   if (!card) return;
   const productId = card.dataset.productId;

   let newQuantity = parseInt(inputElement.value);

   // Validate input (minimum 1, maybe a maximum?)
   if (isNaN(newQuantity) || newQuantity < 1) {
       // If invalid (e.g., empty or 0), remove from cart and show Add button
       console.log(`Invalid quantity input (${inputElement.value}). Removing product ${productId}`);
       removeFromCart(productId); // from cartUtils.js
       showAddButton(card);
       inputElement.value = '1'; // Reset visual input for next time (optional)
       return;
   }
   // Optional: Add max quantity check if needed
   // if (newQuantity > 99) { newQuantity = 99; inputElement.value = 99; }

   console.log(`Quantity input changed for ${productId} to ${newQuantity}`);
   updateCartQuantity(productId, newQuantity); // from cartUtils.js
}


// UPDATED: Buy Now Logic
function handleBuyNow(button) {
   const card = button.closest('.product-card');
   if (!card) return;
   const productId = card.dataset.productId;
   const qtyInput = card.querySelector('.qty-input');
   const addButton = card.querySelector('.add-button');

   // Determine quantity: Use input if visible, otherwise assume 1 (user clicks BuyNow before Add)
   let quantityToBuy = 1;
   if (qtyInput && !qtyInput.closest('[data-qty-controls]').classList.contains('hidden')) {
       quantityToBuy = parseInt(qtyInput.value) || 1; // Get qty from visible input
   }

   // Gather product info
    const productData = {
        id: productId,
        name: card.querySelector('.product-name')?.textContent || 'Unknown',
        price: parseFloat((card.querySelector('.product-price')?.textContent || '0').replace('₹','').split(' ')[0]) || 0,
        unit: card.querySelector('.product-variant')?.textContent || '',
        imageUrl: card.querySelector('.product-image')?.src || ''
    };

   console.log(`Buy Now clicked for product:`, productData, `Quantity: ${quantityToBuy}`);

   // Ensure item is in cart with the correct quantity using cartUtils
   // First, try updating (handles if item exists)
   updateCartQuantity(productId, quantityToBuy);
   // Then, check if it's actually there (updateCartQuantity doesn't add if not present)
   if (getCartItemQuantity(productId) < quantityToBuy) {
       // If update didn't work (item wasn't there), add it.
       // Note: This simplified addToCart adds 1 or increments. We need exactly quantityToBuy.
       // For simplicity here, we'll call update again AFTER potentially adding it via addToCart.
       // A better cartUtil function `setCartItem(product, qty)` would be ideal.
       addToCart(productData); // Ensure it's in cart (adds 1 or increments)
       if (quantityToBuy > getCartItemQuantity(productId)) { // If the desired qty is still not met
            updateCartQuantity(productId, quantityToBuy); // Set the final quantity
       }
   }


   // Show alert and redirect
   alert(`${productData.name || 'Item'} (Qty: ${quantityToBuy}) added to cart! Please proceed.`); // Updated alert
   const cartPageUrl = 'cart.html'; // Adjust path if needed
   console.log(`Redirecting to cart page: ${cartPageUrl}`);
   window.location.href = cartPageUrl;
}

// --- Make functions global for onclick ---
window.handleAddInitial = handleAddInitial;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.handleQtyInput = handleQtyInput;
window.handleBuyNow = handleBuyNow;

    // --- NEW: Function to Fetch ALL Categories for SubNav ---
    async function fetchAllCategoriesForSubNav() {
        if (!subcategoryContainer) return; // Do nothing if container doesn't exist

        subcategoryContainer.innerHTML = `<span class="p-2 text-gray-500">Loading categories...</span>`; // Loading state

        try {
            const response = await fetch(`${API_BASE_URL}${CATEGORIES_ENDPOINT}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`Failed to load category list (Status: ${response.status})`);
            }
            const allCategories = await response.json();
            console.log("Fetched all categories for subnav:", allCategories);
            renderSubcategoryButtons(allCategories);
        } catch (error) {
            console.error("Error fetching categories for subnav:", error);
            subcategoryContainer.innerHTML = `<span class="p-2 text-red-500">Error loading categories</span>`;
        }
    }

    // --- NEW: Function to Render Subcategory Buttons ---
    function renderSubcategoryButtons(categories) {
        if (!subcategoryContainer) return;
        subcategoryContainer.innerHTML = ''; // Clear loading/error

        if (!categories || categories.length === 0) {
             subcategoryContainer.innerHTML = `<span class="p-2 text-gray-500">No other categories found.</span>`;
            return;
        }

        // Add the "All" button first (optional - links back to a main product page or dashboard?)
        // const allButton = document.createElement('button');
        // allButton.className = 'subcategory-button';
        // allButton.textContent = 'All Products';
        // allButton.addEventListener('click', () => { window.location.href = 'allProductsPage.html'; }); // Example link
        // subcategoryContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'subcategory-button'; // Use the class from HTML
            button.textContent = category.title || 'Unnamed';
            button.dataset.categoryId = category.id; // Store the ID

            // Highlight the button corresponding to the current page's category
            // Compare IDs as strings or numbers consistently
            if (category.id.toString() === categoryId) {
                button.classList.add('active'); // Add active class
                // Optional: Disable clicking the current category button
                // button.disabled = true;
                // button.style.cursor = 'default';
            }

            // Add click listener ONLY if it's not the current category (or always add if you want refresh)
            // if (category.id.toString() !== categoryId) {
                 button.addEventListener('click', handleSubcategoryClick);
            // }

            subcategoryContainer.appendChild(button);
        });
    }

    // --- NEW: Function to Handle Subcategory Button Click ---
    function handleSubcategoryClick(event) {
        const clickedButton = event.currentTarget;
        const clickedCategoryId = clickedButton.dataset.categoryId;

        if (!clickedCategoryId) {
            console.error("Clicked subcategory button is missing category ID.");
            return;
        }

        // Optional: Prevent navigation if clicking the already active category
        if (clickedCategoryId === categoryId) {
             console.log("Clicked the current category. No navigation needed.");
             return;
        }


        console.log(`Subcategory button clicked. Navigating to category ID: ${clickedCategoryId}`);

        // Construct URL for the same page but with the new category ID
        const nextUrl = `User-Category.html?categoryId=${clickedCategoryId}`;
        window.location.href = nextUrl; // Navigate
    }


    // --- Helper Functions (Keep existing ones) ---
    function updatePageTitle(title) { /* ... */
         const displayTitle = title || "Category Products";
         if (categoryTitleElement) categoryTitleElement.textContent = displayTitle;
         document.title = `Category: ${displayTitle} - ASAP`;
    }
    function showProductLoadingState(isLoading) { /* ... */
        if (!productGridElement) return;
        if (isLoading) productGridElement.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500">Loading Products...</div>`;
    }
    function showProductErrorState(errorMessage) { /* ... */
         if (!productGridElement) return;
         productGridElement.innerHTML = `<div class="col-span-full text-center py-8 text-red-500">Error: ${errorMessage}</div>`;
    }


    // --- Placeholder Cart Interaction Functions (Keep existing ones) ---
    // IMPORTANT: Make these functions global if they are called directly via onclick in HTML
    // Or better, attach event listeners dynamically in renderProducts
    window.handleAddToCart = function(button) { /* ... */ }; // Make global example
    window.increaseQty = function(button) { /* ... */ };
    window.decreaseQty = function(button) { /* ... */ };
    window.updateCartCount = function(change) { /* ... */ };


    // --- Initial Fetch Calls ---
    fetchCategoryDetails(categoryId);       // Fetch title for the current category
    fetchProductsForCategory(categoryId);   // Fetch products for the current category
    if (subcategoryContainer) {
        fetchAllCategoriesForSubNav();    // Fetch ALL categories for the top scroll bar
    }

}); // End DOMContentLoaded

// --- END OF FILE category.js ---