// --- START OF FILE thankYou.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Thank You page script loaded.");

    // --- Config and Elements ---
    const API_BASE_URL = "http://localhost:8080";
    const ORDER_ENDPOINT_BASE = "/api/orders"; // Base endpoint
    const token = localStorage.getItem("token");

    const orderIdElement = document.getElementById('confOrderId');
    const orderDetailsContainer = document.getElementById('confOrderDetails');
    const trackOrderLink = document.getElementById('trackOrderLink'); // Link for tracking
    const confirmationContent = document.getElementById('confirmationContent');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorIndicator = document.getElementById('errorIndicator');

    // --- Get Order ID from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    // --- Initial Validation ---
    if (!token) {
        // Should ideally not happen if redirected from order page, but good practice
        showError("Authentication missing. Cannot load order details.");
        return;
    }
    if (!orderId) {
        console.error("Order ID not found in URL.");
        showError("Order ID missing. Cannot display confirmation.");
        if (orderIdElement) orderIdElement.textContent = 'N/A';
        return;
    }
    if (!orderDetailsContainer || !orderIdElement || !trackOrderLink) {
        console.error("One or more required confirmation elements not found.");
        // Page might still function partially
    }

    // --- Fetch Order Details ---
    async function fetchOrderDetails(id) {
        showLoading(true);
        console.log(`Fetching details for Order ID: ${id}`);

        try {
            const response = await fetch(`${API_BASE_URL}${ORDER_ENDPOINT_BASE}/${id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                 let errorMsg = `Failed to load order details (Status: ${response.status})`;
                 try {
                     const errData = await response.json();
                     errorMsg = errData.message || errorMsg;
                 } catch (e) { /* Ignore if response not json */ }
                 throw new Error(errorMsg);
            }

            const order = await response.json(); // Assuming backend sends OrderResponseDto
            console.log("Order details fetched:", order);
            displayOrderConfirmation(order);

        } catch (error) {
            console.error("Error fetching order details:", error);
            showError(error.message || "Could not load order details.");
        } finally {
             showLoading(false);
        }
    }

    // --- Display Order Confirmation ---
    function displayOrderConfirmation(order) {
        if (!order) {
            showError("Invalid order data received.");
            return;
        }

        if (orderIdElement) orderIdElement.textContent = order.id || 'N/A';
        if (trackOrderLink) {
            // Update href for the tracking button/link - adjust path if needed
            trackOrderLink.href = `orderTracking.html?orderId=${order.id}`;
        }

        // Populate order details section
        if (orderDetailsContainer) {
            orderDetailsContainer.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span class="detail-value">${formatDateTime(order.orderDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value font-semibold">${order.orderStatus || 'N/A'}</span>
                </div>
                 <div class="detail-row">
                    <span class="detail-label">Deliver To:</span>
                    <span class="detail-value">${order.deliveryAddressLine1 || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value font-bold">₹${order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${order.paymentMethod || 'N/A'}</span>
                </div>
                <!-- You can add more details here if needed -->
            `;
        }
         confirmationContent.style.display = 'block'; // Show content
    }

    // --- Helper Functions ---
    function showLoading(isLoading) {
        if (loadingIndicator) loadingIndicator.style.display = isLoading ? 'block' : 'none';
        if (confirmationContent) confirmationContent.style.display = isLoading ? 'none' : 'block'; // Hide main content while loading
        if (errorIndicator) errorIndicator.style.display = 'none'; // Hide error when loading starts
    }

    function showError(message) {
        if (errorIndicator) {
            errorIndicator.textContent = `Error: ${message}`;
            errorIndicator.style.display = 'block';
        }
        if (confirmationContent) confirmationContent.style.display = 'none'; // Hide main content on error
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }

    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
            return new Date(dateTimeString).toLocaleString('en-IN', options);
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateTimeString; // Return original string if formatting fails
        }
    }

    // --- Initial Fetch ---
    fetchOrderDetails(orderId);

}); // End DOMContentLoaded

// --- END OF FILE thankYou.js ---