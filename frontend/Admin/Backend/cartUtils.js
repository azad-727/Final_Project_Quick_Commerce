// --- START OF FILE js/cartUtils.js ---

const CART_STORAGE_KEY = 'userASAPCart';

/**
 * Retrieves the cart array from localStorage.
 * @returns {Array} The cart array or an empty array.
 */
function getCart() {
    try {
        const cartJson = localStorage.getItem(CART_STORAGE_KEY);
        return cartJson ? JSON.parse(cartJson) : [];
    } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
        return []; // Return empty array on error
    }
}

/**
 * Saves the cart array to localStorage.
 * @param {Array} cartArray The cart array to save.
 */
function saveCart(cartArray) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartArray));
        // Dispatch a custom event to notify other parts of the app the cart changed
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
        console.error("Error saving cart to localStorage:", e);
    }
}

/**
 * Adds a product to the cart or increments its quantity.
 * @param {object} product - The product object { id, name, price, imageUrl, unit, ... }
 */
function addToCart(product) {
    if (!product || !product.id) {
        console.error("Invalid product data passed to addToCart:", product);
        return;
    }
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Item exists, increment quantity
        cart[existingItemIndex].quantity++;
        console.log(`Incremented quantity for product ID ${product.id}`);
    } else {
        // Item doesn't exist, add it
        const newItem = {
            id: product.id,
            name: product.name || 'Unknown Product',
            price: product.price || 0,
            imageUrl: product.imageUrl || 'img/placeholder.png', // Adjust placeholder path
            unit: product.unit || '',
            quantity: 1
        };
        cart.push(newItem);
        console.log(`Added new product ID ${product.id} to cart`);
    }
    saveCart(cart);
}

/**
 * Updates the quantity of a specific item in the cart.
 * Removes the item if quantity <= 0.
 * @param {string|number} productId - The ID of the product to update.
 * @param {number} newQuantity - The new quantity.
 */
function updateCartQuantity(productId, newQuantity) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id == productId); // Use == for potential type difference

    if (itemIndex === -1) {
        console.warn(`Product ID ${productId} not found in cart for update.`);
        return;
    }

    if (newQuantity > 0) {
        cart[itemIndex].quantity = newQuantity;
        console.log(`Updated quantity for product ID ${productId} to ${newQuantity}`);
        saveCart(cart);
    } else {
        // Quantity is 0 or less, remove the item
        removeFromCart(productId);
    }
}

/**
 * Removes an item completely from the cart.
 * @param {string|number} productId - The ID of the product to remove.
 */
function removeFromCart(productId) {
    let cart = getCart();
    const initialLength = cart.length;
    cart = cart.filter(item => item.id != productId); // Use != for potential type difference

    if (cart.length < initialLength) {
        console.log(`Removed product ID ${productId} from cart`);
        saveCart(cart);
    } else {
         console.warn(`Product ID ${productId} not found in cart for removal.`);
    }
}

/**
 * Calculates the total number of items in the cart (sum of quantities).
 * @returns {number} Total quantity of items.
 */
function getCartTotalQuantity() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Calculates the subtotal price of all items in the cart.
 * @returns {number} The cart subtotal.
 */
function getCartSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
}

/**
 * Clears the entire cart from localStorage.
 */
function clearCart() {
    console.log("Clearing cart from localStorage.");
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify UI
}


// Optional: Helper to check if an item is in the cart
function isProductInCart(productId) {
    const cart = getCart();
    return cart.some(item => item.id == productId);
}

// Optional: Helper to get quantity of a specific item
function getCartItemQuantity(productId) {
     const cart = getCart();
     const item = cart.find(item => item.id == productId);
     return item ? item.quantity : 0;
}

// --- END OF FILE js/cartUtils.js ---