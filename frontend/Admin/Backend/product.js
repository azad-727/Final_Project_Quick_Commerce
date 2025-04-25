// --- START OF FILE product.js ---

document.addEventListener("DOMContentLoaded", function () {
    console.log("Product Detail script loaded.");

    // --- Configuration & Elements ---
    const API_BASE_URL = "http://localhost:8080"; // Adjust if needed
    const PRODUCTS_ENDPOINT = "/api/products";
    const token = localStorage.getItem("token"); // Assuming user token

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    // Use 'productId' to match the key used in category.js link
    const productId = urlParams.get("productId");

    // Elements for population
    const productNameH1 = document.querySelector("h1#productName"); // Target H1 specifically
    const productNameBreadcrumb = document.querySelector("span#productName"); // Target breadcrumb span
    const brandNameElement = document.querySelector("#brandName");
    const bulletPointList = document.querySelector("#bulletPoint");
    const descriptionElement = document.querySelector("#description");
    const productImage = document.querySelector(".product-image-container img");
    const productPriceElement = document.querySelector("#productPrice"); // Use new ID
    const productMrpElement = document.querySelector("#productMrp");
    // const deliveryEtaElement = document.querySelector("#deliveryETA span"); // Keep if static ETA is okay
    const shelfLifeElement = document.querySelector("#shelfLife");
    const manufacturerElement = document.querySelector("#manufacturer");

    // Elements for interaction
    const quantitySpan = document.getElementById("quantity");
    const plusBtn = document.getElementById("plusQtyBtn");     // Use new ID
    const minusBtn = document.getElementById("minusQtyBtn");    // Use new ID
    const addToCartBtn = document.getElementById("addToCartBtn"); // Use new ID

    // Global variable to store current product data
    let currentProductData = null;

    // --- Initial Validation ---
    if (!token) {
        console.error("Authentication token missing.");
        alert("Please log in to view products.");
        // Disable interactions if needed
        if (addToCartBtn) addToCartBtn.disabled = true;
        if (plusBtn) plusBtn.disabled = true;
        if (minusBtn) minusBtn.disabled = true;
        return;
    }
    if (!productId) {
        console.error("Product ID not found in URL.");
        alert("Product ID not found in URL.");
        document.body.innerHTML = '<p class="text-red-500 text-center p-10">Invalid Product URL.</p>'; // Replace page content
        return;
    }

    // --- Fetch Product Details ---
    async function fetchProductDetails(id) {
        console.log(`Fetching details for Product ID: ${id}`);
        // Optional: Add a loading indicator state here
        try {
            const response = await fetch(`${API_BASE_URL}${PRODUCTS_ENDPOINT}/${id}`, {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            });

            if (response.status === 404) throw new Error("Product not found.");
            if (!response.ok) throw new Error(`Failed to fetch product (Status: ${response.status})`);

            const product = await response.json();
            console.log("Product data received:", product);
            currentProductData = product; // Store fetched data
            populateProductDetails(product);
            setupQuantityControls(); // Setup controls after data is loaded
            updateAddToCartButtonState(); // Check if item is already in cart

        } catch (error) {
            console.error("Error fetching product:", error);
            alert(`Could not load product details: ${error.message}`);
            // Display error message on page
             document.body.innerHTML = `<p class="text-red-500 text-center p-10">Error loading product: ${error.message}</p>`;
        }
    }

    // --- Populate HTML with Product Data ---
    function populateProductDetails(product) {
        if (!product) return;

        const price = typeof product.price === 'number' ? `₹${product.price.toFixed(2)}` : 'N/A';
        const mrp = typeof product.mrp === 'number' && product.mrp > product.price ? `₹${product.mrp.toFixed(2)}` : 'N/A';
        const productName = product.name || "Product"; // Fallback title

        // Update Titles & Breadcrumb
        document.title = `${productName} - ASAP`; // Browser tab title
        if (productNameH1) productNameH1.textContent = productName;
        if (productNameBreadcrumb) productNameBreadcrumb.textContent = productName;

        // Update other details
        if (brandNameElement) brandNameElement.textContent = product.brand || '';
        if (descriptionElement) descriptionElement.textContent = product.description || 'No description available.';
        if (productImage) {
            productImage.src = product.imageUrl || 'img/placeholder.png'; // Use placeholder
            productImage.alt = productName;
        }
        if (productPriceElement) productPriceElement.textContent = price;
        if (productMrpElement) {
            productMrpElement.textContent = mrp !== 'N/A' ? mrp : ''; // Show MRP only if valid
            productMrpElement.style.display = mrp !== 'N/A' ? 'inline' : 'none'; // Hide if no valid MRP
        }
        if (shelfLifeElement) shelfLifeElement.textContent = product.shelfLife ? `${product.shelfLife} days` : 'Not specified';
        if (manufacturerElement) manufacturerElement.textContent = product.manufacturer || 'Not specified';

        // Handle Bullet Points (assuming newline separated)
        if (bulletPointList && product.bulletPoint) {
            bulletPointList.innerHTML = ''; // Clear static points
            const points = product.bulletPoint.split('\n').filter(p => p.trim() !== ''); // Split by newline, remove empty
            points.forEach(point => {
                const li = document.createElement('li');
                li.textContent = point.trim();
                bulletPointList.appendChild(li);
            });
        } else if (bulletPointList) {
             bulletPointList.innerHTML = '<li>No highlights available.</li>'; // Placeholder if no points
        }

        // Static ETA example (can be removed if not needed)
        // if (deliveryEtaElement) deliveryEtaElement.textContent = "10-15 minutes";
    }

    // --- Setup Quantity +/- Buttons ---
    function setupQuantityControls() {
        if (!quantitySpan || !plusBtn || !minusBtn) {
             console.warn("Quantity control elements not found.");
             return;
        }

        plusBtn.addEventListener("click", () => {
            let qty = parseInt(quantitySpan.textContent);
            qty++;
            quantitySpan.textContent = qty;
            updateAddToCartButtonState(); // Update button state based on new quantity
        });

        minusBtn.addEventListener("click", () => {
            let qty = parseInt(quantitySpan.textContent);
            if (qty > 1) {
                qty--;
                quantitySpan.textContent = qty;
                updateAddToCartButtonState(); // Update button state based on new quantity
            }
            // Optional: Add logic here if qty reaches 0 (e.g., disable minus button?)
        });
    }

    // --- Handle Add to Cart Click ---
    function handleAddToCartClick() {
        if (!currentProductData) {
            console.error("Cannot add to cart: currentProductData is null");
            alert("Product data not loaded correctly. Please refresh.");
            return;
        }
        if (!quantitySpan) {
            console.error("Cannot add to cart: quantitySpan element not found");
            return;
        }

        const quantity = parseInt(quantitySpan.textContent) || 1; // Default to 1 if parsing fails

        // Prepare data for cartUtils
        const productToAdd = {
            id: currentProductData.id,
            name: currentProductData.name,
            price: currentProductData.price,
            imageUrl: currentProductData.imageUrl,
            unit: currentProductData.unit, // Make sure 'unit' exists in your Product model/response
        };

        console.log(`Adding ${quantity} of product to cart:`, productToAdd);

        // Use cartUtils function - need to handle quantity here
        const currentCartQty = getCartItemQuantity(productToAdd.id); // from cartUtils.js
        const newQty = currentCartQty + quantity;
        updateCartQuantity(productToAdd.id, newQty); // Use update to handle existing items

        showCartNotification(`${quantity} x ${productToAdd.name} added to cart!`); // Use shared notification

        updateAddToCartButtonState(); // Update button state after adding
        // Reset quantity selector back to 1 after adding? (Optional)
        // quantitySpan.textContent = '1';
    }

    // --- Update Add to Cart Button State (e.g., disable if already added, or show different text) ---
    function updateAddToCartButtonState() {
        if (!addToCartBtn || !currentProductData) return;

        const quantityInCart = getCartItemQuantity(currentProductData.id); // from cartUtils.js

        // Example: Just log state for now. You can disable the button, change text, etc.
        if (quantityInCart > 0) {
            console.log(`Product ${currentProductData.id} is already in cart with quantity ${quantityInCart}.`);
            // Example: Change button text
            // addToCartBtn.innerHTML = '<i class="fas fa-check mr-2"></i> In Cart';
            // addToCartBtn.disabled = true; // Or disable it
        } else {
            // Example: Ensure button is in default state
            // addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i> Add to Cart';
            // addToCartBtn.disabled = false;
        }
    }


    // --- Add Listener to Cart Button ---
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", handleAddToCartClick);
    } else {
         console.error("Add to Cart button not found.");
    }


    // --- Cart Notification Function (Copied from category.js - Keep DRY, ideally move to shared utils) ---
    function showCartNotification(message) {
        console.log("Notification:", message);
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-5 right-5 bg-green-600 text-white py-2 px-5 rounded-lg shadow-lg z-[999] transition-opacity duration-300 ease-out';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => { notification.remove(); }, 300);
        }, 2500);
    }

    // --- Initial Fetch ---
    fetchProductDetails(productId);

});
// --- END OF FILE product.js ---