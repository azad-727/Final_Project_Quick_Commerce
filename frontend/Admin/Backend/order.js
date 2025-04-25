// --- START OF FILE order.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Order page script loaded.");

    // --- Config and Elements ---
    const API_BASE_URL = "http://localhost:8080";
    const ADDRESS_ENDPOINT = "/api/addresses"; // Endpoint for addresses
    const ORDER_ENDPOINT = "/api/orders";     // Endpoint for orders
    const token = localStorage.getItem("token");

    const addressListContainer = document.getElementById('addressList');
    const showAddAddressBtn = document.getElementById('showAddAddressBtn');
    const addAddressFormContainer = document.getElementById('addAddressFormContainer');
    const addAddressForm = document.getElementById('addAddressForm');
    const cancelAddAddressBtn = document.getElementById('cancelAddAddressBtn');
    const addAddressError = document.getElementById('addAddressError');
    const addressSelectionError = document.getElementById('addressSelectionError');

    const orderSummaryItemsContainer = document.getElementById('orderSummaryItems');
    const summarySubtotalElement = document.getElementById('summarySubtotal');
    const summaryDeliveryFeeElement = document.getElementById('summaryDeliveryFee'); // Assuming ID exists
    const summaryTotalElement = document.getElementById('summaryTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const placeOrderError = document.getElementById('placeOrderError');

    let userAddresses = []; // To store fetched addresses

    // --- Initial Validation ---
    if (!token) {
        alert("Please log in to place an order.");
        window.location.href = '../../Login/asap-login-page.html'; // Redirect to login
        return;
    }
    if (!addressListContainer || !orderSummaryItemsContainer || !placeOrderBtn /* add others */) {
        console.error("One or more critical order page elements not found.");
        // Handle this more gracefully? Maybe show a generic error.
        return;
    }

    // --- Main Functions ---

    function renderOrderSummary() {
        const cart = getCart(); // from cartUtils.js
        orderSummaryItemsContainer.innerHTML = ''; // Clear previous

        if (cart.length === 0) {
            orderSummaryItemsContainer.innerHTML = '<p class="text-gray-500">No items in cart.</p>';
             if (placeOrderBtn) placeOrderBtn.disabled = true; // Disable place order if cart empty
             updateTotalsDisplay(0); // Update totals to zero
            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0';
            itemElement.innerHTML = `
                <span class="flex-grow pr-2 truncate">${item.quantity} x ${item.name}</span>
                <span class="font-medium flex-shrink-0">₹${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderSummaryItemsContainer.appendChild(itemElement);
        });

        const subtotal = getCartSubtotal();
        updateTotalsDisplay(subtotal);
         if (placeOrderBtn) placeOrderBtn.disabled = false; // Enable button if cart has items
    }

    function updateTotalsDisplay(subtotal) {
        const deliveryFee = 0.00; // Placeholder - Implement logic later
        const total = subtotal + deliveryFee;

        if (summarySubtotalElement) summarySubtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        if (summaryDeliveryFeeElement) summaryDeliveryFeeElement.textContent = `₹${deliveryFee.toFixed(2)}`;
        if (summaryTotalElement) summaryTotalElement.textContent = `₹${total.toFixed(2)}`;
    }

    async function loadAddresses() {
        console.log("Loading user addresses...");
        addressListContainer.innerHTML = '<p class="text-gray-500">Loading addresses...</p>';
        showAddAddressForm(false); // Ensure form is hidden initially

        try {
            const response = await fetch(`${API_BASE_URL}${ADDRESS_ENDPOINT}/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Failed to fetch addresses (Status: ${response.status})`);

            userAddresses = await response.json();
            console.log("User addresses:", userAddresses);
            renderAddressList(userAddresses);

        } catch (error) {
            console.error("Error loading addresses:", error);
            addressListContainer.innerHTML = `<p class="text-red-500">Could not load addresses. ${error.message}</p>`;
            // Show add address form if loading failed and no addresses were previously loaded
            if (userAddresses.length === 0) {
                 showAddAddressForm(true); // Force show form if none loaded
            }
        }
    }

    function renderAddressList(addresses) {
        addressListContainer.innerHTML = ''; // Clear loading/error
        addressSelectionError.classList.add('hidden'); // Hide error

        if (addresses.length === 0) {
            addressListContainer.innerHTML = '<p class="text-gray-600 italic">No saved addresses found. Please add one.</p>';
            showAddAddressForm(true); // Show form if no addresses
            if (showAddAddressBtn) showAddAddressBtn.classList.add('hidden'); // Hide "Add New" button
        } else {
            addresses.forEach((address, index) => {
                const div = document.createElement('div');
                div.className = 'address-option';
                div.innerHTML = `
                    <input type="radio" id="address_${address.id}" name="selectedAddress" value="${address.id}" ${index === 0 ? 'checked' : ''}>
                    <div>
                        <label for="address_${address.id}">${address.label || 'Address'}</label>
                        <p>${address.fullAddress || 'N/A'}</p>
                    </div>
                `;
                 // Add listener to visually select
                 div.addEventListener('click', () => selectAddressOption(div));
                addressListContainer.appendChild(div);
                 // Select first one visually by default
                 if (index === 0) selectAddressOption(div);
            });
            showAddAddressForm(false); // Hide form if addresses exist
             if (showAddAddressBtn) showAddAddressBtn.classList.remove('hidden'); // Show "Add New" button
        }
    }
     // Helper to visually style selected address
    function selectAddressOption(selectedDiv) {
        document.querySelectorAll('.address-option').forEach(opt => opt.classList.remove('selected'));
        selectedDiv.classList.add('selected');
        // Ensure the radio button inside is checked
        const radio = selectedDiv.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    }


    function showAddAddressForm(show = true) {
        if (addAddressFormContainer && addAddressForm) {
            if (show) {
                addAddressFormContainer.classList.remove('hidden');
                addAddressForm.reset(); // Clear form when shown
                addAddressError.classList.add('hidden'); // Hide error
                if (userAddresses.length > 0) { // Hide list only if addresses exist
                     addressListContainer.classList.add('hidden');
                }
                 if (showAddAddressBtn) showAddAddressBtn.classList.add('hidden'); // Hide button when form shown
            } else {
                addAddressFormContainer.classList.add('hidden');
                 addressListContainer.classList.remove('hidden'); // Ensure list is visible
                if (userAddresses.length > 0 && showAddAddressBtn) { // Show button only if addresses exist
                     showAddAddressBtn.classList.remove('hidden');
                }
            }
        }
    }

    async function handleSaveAddress(event) {
        event.preventDefault();
        if (!addAddressForm) return;
        const saveButton = document.getElementById('saveAddressBtn');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        addAddressError.classList.add('hidden');

        const newAddress = {
            label: document.getElementById('newAddressLabel').value.trim(),
            fullAddress: document.getElementById('newAddressFull').value.trim(),
            // User is set by backend based on token
        };

        if (!newAddress.label || !newAddress.fullAddress) {
            addAddressError.textContent = "Label and Full Address are required.";
            addAddressError.classList.remove('hidden');
            saveButton.disabled = false;
            saveButton.textContent = 'Save Address';
            return;
        }

        console.log("Saving new address:", newAddress);

        try {
            const response = await fetch(`${API_BASE_URL}${ADDRESS_ENDPOINT}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAddress)
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || `Failed to save address (Status: ${response.status})`);
            }

            console.log("Address saved successfully");
            await loadAddresses(); // Reload address list to show the new one & select it
            showAddAddressForm(false); // Hide form

        } catch (error) {
            console.error("Error saving address:", error);
            addAddressError.textContent = `Error: ${error.message}`;
            addAddressError.classList.remove('hidden');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Address';
        }
    }

    async function handlePlaceOrderClick() {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Placing Order...';
        placeOrderError.classList.add('hidden');
        addressSelectionError.classList.add('hidden'); // Hide address error

        // 1. Get Selected Address ID
        const selectedAddressInput = document.querySelector('input[name="selectedAddress"]:checked');
        if (!selectedAddressInput) {
            addressSelectionError.classList.remove('hidden'); // Show address error
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
            console.error("No address selected.");
            return;
        }
        const selectedAddressId = selectedAddressInput.value;

        // 2. Get Cart Items
        const cart = getCart();
        if (cart.length === 0) {
             placeOrderError.textContent = "Your cart is empty.";
             placeOrderError.classList.remove('hidden');
             placeOrderBtn.disabled = false;
             placeOrderBtn.textContent = 'Place Order';
             return;
        }

        // 3. Prepare Order Request
        const orderRequest = {
            selectedAddressId: parseInt(selectedAddressId, 10), // Ensure it's a number
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || "COD", // Get selected payment method
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        console.log("Placing Order Request:", JSON.stringify(orderRequest));

        // 4. Make API Call
        try {
            const response = await fetch(`${API_BASE_URL}${ORDER_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderRequest)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `Order placement failed (Status: ${response.status})`);
            }

            // 5. Handle Success
            const createdOrder = responseData;
            console.log("Order Placed Successfully:", createdOrder);
            clearCart(); // Clear cart from localStorage
            // Redirect to Thank You page
            window.location.href = `thankYou.html?orderId=${createdOrder.id}`;

        } catch (error) {
            console.error("Error placing order:", error);
            placeOrderError.textContent = `Order Failed: ${error.message}`;
            placeOrderError.classList.remove('hidden');
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
        }
    }


    // --- Attach Event Listeners ---
    if (showAddAddressBtn) {
        showAddAddressBtn.addEventListener('click', () => showAddAddressForm(true));
    }
    if (cancelAddAddressBtn) {
        cancelAddAddressBtn.addEventListener('click', () => showAddAddressForm(false));
    }
    if (addAddressForm) {
        addAddressForm.addEventListener('submit', handleSaveAddress);
    }
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrderClick);
    }

    // --- Initial Load ---
    renderOrderSummary();
    loadAddresses();


}); // End DOMContentLoaded

// --- END OF FILE order.js ---