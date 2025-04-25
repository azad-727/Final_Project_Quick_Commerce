const token=localStorage.getItem("token");
console.log(token);
function profile(){
    sessionStorage.setItem("token", token);
    window.location.href = "file:///G:/Azad%20Clg/BCA%20Final%20Year%20Project%20-%20Quick-Commerce-Backend/frontend/Profile/main-acc-pg.html";
    
}

//map location

document.addEventListener("DOMContentLoaded", () => {
    getCurrentLocation();
});

function getCurrentLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                console.log("Location:", latitude, longitude);

                reverseGeocode(latitude, longitude);
            },
            error => {
                console.error("Location Error:", error.message);
                document.getElementById("locationDisplay").innerText = "Location not available";
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
}

// ✅ Reverse Geocode using Nominatim (Free API)
function reverseGeocode(lat, lon) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
            const address = data.display_name;
            console.log("Address:", address);
            document.getElementById("locationDisplay").innerText = address;
            estimateDeliveryTime(lat, lon);
        })
        .catch(error => {
            console.error("Error in reverse geocoding:", error);
        });
}

// ✅ Dummy delivery time estimate
function estimateDeliveryTime(lat, lon) {
    // For demo, use a fixed warehouse location
    const warehouseLat = 23.1022693;
    const warehouseLon = 72.5411829;

    const distance = getDistanceFromLatLonInKm(lat, lon, warehouseLat, warehouseLon);
    let eta = "30+ mins";
    if (distance < 2) eta = "10 mins";
    else if (distance < 5) eta = "20 mins";

    document.getElementById("deliveryETA").innerText = `Delivery ETA: ${eta}`;
}

// ✅ Haversine formula to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

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