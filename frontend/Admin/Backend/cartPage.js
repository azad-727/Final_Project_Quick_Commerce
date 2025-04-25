// --- START OF FILE cartPage.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Cart page script loaded.");

    // --- Elements ---
    const cartTableBody = document.getElementById('cartTableBody');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const deliveryFeeElement = document.getElementById('deliveryFee'); // Assuming ID exists
    const cartDiscountElement = document.getElementById('cartDiscount'); // Assuming ID exists
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    const clearCartButton = document.getElementById('clearCartButton'); // Added

    // --- Validation ---
    if (!cartTableBody || !cartSubtotalElement || !cartTotalElement || !checkoutButton || !clearCartButton) {
        console.error("One or more required cart elements not found on the page.");
        return;
    }

    // --- Render Cart on Load ---
    renderCartPage();

    // --- Attach Event Listeners ---
    cartTableBody.addEventListener('click', handleCartTableClick);
    cartTableBody.addEventListener('input', handleCartTableInput);
    checkoutButton.addEventListener('click', handleCheckout);
    clearCartButton.addEventListener('click', handleClearCart); // Added listener

    // Listen for cart updates from other tabs/windows or utils
    window.addEventListener('cartUpdated', renderCartPage);


    // --- Main Render Function ---
    function renderCartPage() {
        console.log("Rendering cart page...");
        const cart = getCart(); // From cartUtils.js
        cartTableBody.innerHTML = ''; // Clear table body

        if (cart.length === 0) {
            cartTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-6">Your cart is empty. <a href='../../Login/dashboard1.html' class='text-blue-600 hover:underline'>Continue Shopping</a></td></tr>`; // Link back
            updateCartSummary(cart); // Update summary to show zeros
            return;
        }

        cart.forEach(item => {
            const row = document.createElement('tr');
            const itemPrice = item.price || 0;
            const itemQuantity = item.quantity || 0;
            const itemTotal = itemPrice * itemQuantity;
            const imageUrl = item.imageUrl || '../img/placeholder.png'; // Use relative path

            row.innerHTML = `
                <td class="flex items-center">
                    <img src="${imageUrl}" alt="${item.name || 'Product'}" class="cart-item-image">
                    <div>
                        <span class="cart-item-name">${item.name || 'Unnamed Product'}</span>
                        <span class="cart-item-unit">${item.unit || ''}</span>
                    </div>
                </td>
                <td>₹${itemPrice.toFixed(2)}</td>
                <td>
                    <div class="qty-controls-container">
                        <button class="qty-button minus-button px-2 py-1" data-product-id="${item.id}" data-action="decrease">-</button>
                        <input type="number" class="qty-input" value="${itemQuantity}" min="1" max="99" data-product-id="${item.id}" data-action="input">
                        <button class="qty-button plus-button px-2 py-1" data-product-id="${item.id}" data-action="increase">+</button>
                    </div>
                </td>
                <td>₹${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="remove-item-btn" data-product-id="${item.id}" data-action="remove" title="Remove Item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        updateCartSummary(cart);
    }

    // --- Event Handlers (using Delegation) ---
    function handleCartTableClick(event) {
        const target = event.target;
        const button = target.closest('button'); // Check if click was on or inside a button

        if (!button || !button.dataset.action) return; // Ignore clicks not on action buttons

        const action = button.dataset.action;
        const productId = button.dataset.productId;

        if (!productId) return;

        console.log(`Cart action: ${action}, Product ID: ${productId}`);

        if (action === 'increase') {
            const currentQty = getCartItemQuantity(productId);
            updateCartQuantity(productId, currentQty + 1);
        } else if (action === 'decrease') {
            const currentQty = getCartItemQuantity(productId);
            updateCartQuantity(productId, currentQty - 1); // cartUtils handles removal if < 1
        } else if (action === 'remove') {
            if (confirm(`Are you sure you want to remove "${getCartItemName(productId)}" from your cart?`)) {
                 removeFromCart(productId);
            }
        }
    }

    function handleCartTableInput(event) {
        const target = event.target;

        if (target.tagName === 'INPUT' && target.dataset.action === 'input') {
            const productId = target.dataset.productId;
            let newQuantity = parseInt(target.value);

            if (isNaN(newQuantity) || newQuantity < 1) {
                // If invalid, revert to 1 or remove (let's remove for simplicity)
                 if (confirm(`Invalid quantity. Remove "${getCartItemName(productId)}" from cart?`)) {
                    removeFromCart(productId);
                 } else {
                     // Revert input to previous valid quantity
                     target.value = getCartItemQuantity(productId) || 1;
                 }
                return;
            }
            // Optional Max Qty Check
            // if (newQuantity > 99) { newQuantity = 99; target.value = 99; }

            console.log(`Cart quantity input changed for ${productId} to ${newQuantity}`);
            updateCartQuantity(productId, newQuantity);
        }
    }

    // Inside cartPage.js

function handleCheckout(event) {
    event.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before proceeding.");
        return;
    }
    console.log("Redirecting to order placement page.");
    window.location.href = 'order.html'; // Redirect to the new order page
}
     // Added handler for Clear Cart button
     function handleClearCart() {
        if (confirm("Are you sure you want to remove all items from your cart?")) {
            clearCart(); // From cartUtils.js
            // renderCartPage will be called by the 'cartUpdated' event
        }
    }

    // --- Update Summary ---
    function updateCartSummary(cart) {
        const subtotal = getCartSubtotal(); // From cartUtils.js
        const delivery = 0; // Placeholder - implement calculation if needed
        const discount = 0; // Placeholder - implement coupon logic if needed
        const total = subtotal + delivery - discount;

        if (cartSubtotalElement) cartSubtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        if (deliveryFeeElement) deliveryFeeElement.textContent = `₹${delivery.toFixed(2)}`; // Update delivery if element exists
        if (cartDiscountElement) cartDiscountElement.textContent = `- ₹${discount.toFixed(2)}`; // Update discount if element exists
        if (cartTotalElement) cartTotalElement.textContent = `₹${total.toFixed(2)}`;

        // Disable checkout if cart is empty
        if (checkoutButton) checkoutButton.disabled = cart.length === 0;
    }

     // Helper to get item name for confirmation dialogs
     function getCartItemName(productId) {
        const cart = getCart();
        const item = cart.find(item => item.id == productId);
        return item ? item.name : 'this item';
    }


});
// Inside cartPage.js


// End DOMContentLoaded

// --- END OF FILE cartPage.js ---