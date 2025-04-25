
document.addEventListener("DOMContentLoaded", function () {
    // const productId = new URLSearchParams(window.location.search).get("id");

    // if (!productId) {
    //     alert("Product ID not found in URL.");
    //     return;
    // }
    const token="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYXphZDM3NzRAZ21haWwuY29tIiwiaWF0IjoxNzQ1NDcxMDE1LCJleHAiOjE3NDU0NzQ2MTV9.5N5hx0t6Myiy33Zih028kTeDM8slRg2Wi167IvmYFV4";

    fetch("http://localhost:8080/api/products/12",{ 
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }})
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch product");
            return response.json();
        })
        .then(product => populateProductDetails(product))
        .catch(error => {
            console.error("Error fetching product:", error);
            alert("Could not load product details.");
        });

    setupQuantityControls();
});

function populateProductDetails(product) {
    document.querySelector("h1").textContent = product.name;
    document.querySelector("#productName").textContent =product.name;
    document.querySelector("#brandName").textContent =product.brand;
    document.querySelector("#bulletPoint").textContent=product.bulletPoint;
    document.querySelector("#description").textContent=product.description;
    document.querySelector(".product-image-container img").src = product.imageUrl;
    document.querySelector(".product-image-container img").alt = product.name;
    document.querySelector(".text-2xl.font-bold.text-black").textContent = `₹${product.price}`;
    document.querySelector("#deliveryETA span").textContent = "10-15 minutes";
    document.querySelector("#productMrp").textContent = `₹${product.mrp}`;
    document.querySelector("#shelfLife").textContent=product.shelfLife;
    document.querySelector("#manufacturer").textContent=product.manufacturer;
    // Save current product for cart
    window.currentProduct = product;
}

function setupQuantityControls() {
    const quantitySpan = document.getElementById("quantity");
    const plusBtn = document.querySelectorAll(".qty-button")[1];
    const minusBtn = document.querySelectorAll(".qty-button")[0];

    plusBtn.addEventListener("click", () => {
        let qty = parseInt(quantitySpan.textContent);
        quantitySpan.textContent = qty + 1;
    });

    minusBtn.addEventListener("click", () => {
        let qty = parseInt(quantitySpan.textContent);
        if (qty > 1) quantitySpan.textContent = qty - 1;
    });
}

function addToCart() {
    const quantity = parseInt(document.getElementById("quantity").textContent);
    const product = window.currentProduct;

    if (!product) {
        alert("Product data not available.");
        return;
    }

    const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart!");
}

// Bind addToCart to button
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".cart-button");
    if (addBtn) {
        addBtn.addEventListener("click", addToCart);
    }
});


// Example update for category.js (Apply similar logic to productDetail.js)

// --- Make sure cartUtils.js is included BEFORE this script in User-Category.html ---

// --- Placeholder Cart Interaction Functions (Replace previous placeholders) ---

function handleAddToCart(button) {
    const card = button.closest('.product-card');
    if (!card) return;
    const productId = card.dataset.productId;
    const addButton = card.querySelector('.add-button');
    const qtyControls = card.querySelector('[data-qty-controls]');
    const qtyDisplay = card.querySelector('.qty-display');

    // Gather product info needed for the cart item
    const productName = card.querySelector('.product-name')?.textContent || 'Unknown Product';
    const productPriceText = card.querySelector('.product-price')?.textContent || '0';
    const productPrice = parseFloat(productPriceText.replace('₹', '').split(' ')[0]) || 0; // Extract price
    const productUnit = card.querySelector('.product-variant')?.textContent || '';
    const productImageUrl = card.querySelector('.product-image')?.src || 'img/placeholder.png';

    const productData = {
        id: productId,
        name: productName,
        price: productPrice,
        unit: productUnit,
        imageUrl: productImageUrl
    };

    console.log(`Adding product to cart:`, productData);
    addToCart(productData); // Use function from cartUtils.js

    // Update button UI
    if (addButton) addButton.classList.add('hidden');
    if (qtyControls) {
        qtyControls.classList.remove('hidden');
        qtyControls.classList.add('flex');
    }
    if (qtyDisplay) qtyDisplay.textContent = '1';

    showCartNotification(`${productName} added to cart!`); // Show feedback
}

function increaseQty(button) {
    const card = button.closest('.product-card');
    if (!card) return;
    const productId = card.dataset.productId;
    const qtyDisplay = card.querySelector('.qty-display');
    if (!qtyDisplay) return;

    let currentQty = parseInt(qtyDisplay.textContent);
    currentQty++;
    qtyDisplay.textContent = currentQty;

    console.log(`Increased qty for ${productId} to ${currentQty}`);
    updateCartQuantity(productId, currentQty); // Use function from cartUtils.js
    // Notification usually not needed on increase/decrease
}

function decreaseQty(button) {
    const card = button.closest('.product-card');
     if (!card) return;
    const productId = card.dataset.productId;
    const qtyDisplay = card.querySelector('.qty-display');
    const addButton = card.querySelector('.add-button');
    const qtyControls = card.querySelector('[data-qty-controls]');
    if (!qtyDisplay || !addButton || !qtyControls) return;

    let currentQty = parseInt(qtyDisplay.textContent);
    currentQty--; // Decrease first

    console.log(`Decreased qty for ${productId} to ${currentQty}`);
    updateCartQuantity(productId, currentQty); // Use function from cartUtils.js (will handle removal if 0)

    // Update UI based on new quantity (could be 0)
    if (currentQty <= 0) {
        qtyControls.classList.add('hidden');
        qtyControls.classList.remove('flex');
        addButton.classList.remove('hidden');
    } else {
        qtyDisplay.textContent = currentQty;
    }
}

// --- NEW: Cart Notification Function ---
function showCartNotification(message) {
    console.log("Notification:", message);
    // Create a temporary notification element (Toast)
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-5 right-5 bg-green-600 text-white py-2 px-5 rounded-lg shadow-lg z-[999] transition-opacity duration-300 ease-out';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Fade out and remove after a few seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300); // Wait for fade out transition
    }, 2500); // Show for 2.5 seconds
}


// --- Make cart functions globally accessible from onclick ---
// !! Consider replacing onclick with dynamic event listeners added in renderProducts !!
window.handleAddToCart = handleAddToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
// Note: updateCartCount is no longer needed here, the badge updates via the event listener in header.js