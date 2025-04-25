// --- START OF FILE createCollection1.js ---

function logout(){
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");

    // ✅ Redirect to login page
    window.location.href = "../login/asap-login-page.html";
}


document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin Create Collection script loaded.");

  // --- Globals & Initialization ---
  const token = localStorage.getItem("token");
  if (!token) {
      console.error("FATAL: Auth token not found in localStorage. Redirecting to login.");
      // Optionally redirect: window.location.href = '/login.html'; // Adjust path as needed
      alert("Authentication token missing. Please log in again.");
      return; // Stop execution if no token
  }
  console.log("Token found.");
  console.log(token);

  const API_BASE_URL = "http://localhost:8080"; // Adjust if your backend URL is different
  const form = document.getElementById('createCollectionForm');
  const imageUploadButton = document.querySelector('.image-upload-button');
  const imageInput = document.getElementById('collectionImageInput'); // Corrected ID based on HTML

  // Product Modal Elements
  const modal = document.getElementById("productSearchModal");
  const searchInput = document.getElementById("searchInput");
  const searchResultsContainer = document.getElementById("searchResults"); // Renamed variable for clarity
  const closeBtn = document.getElementById("closeProductModal");
  const submitProductSelectionBtn = document.getElementById("submitProductSelection");
  const selectedProductsContainer = document.getElementById("selectedProductsContainer");
  const searchProductBar = document.getElementById("searchProductBar");

  let selectedProductCache = []; // To store selected product objects {id, name, imageUrl, price, ...}

  // --- Validation ---
  if (!form) {
      console.error("Form #createCollectionForm not found!");
      return;
  }
  if (!modal || !searchInput || !searchResultsContainer || !closeBtn || !submitProductSelectionBtn || !selectedProductsContainer || !searchProductBar) {
      console.error("One or more product modal/selection elements not found!");
      // Don't necessarily return, modal functionality might just fail gracefully.
  }


  // --- Main Form Submission Handler ---
  async function handleCreateCategory(event) {
      event.preventDefault();
      console.log("Form submission triggered.");

      const formData = new FormData(form); // Captures title, description, type, seo fields, and the image file

      // --- Append selected product IDs ---
      console.log("Collecting selected product IDs from cache:", selectedProductCache);
      if (selectedProductCache.length > 0) {
          selectedProductCache.forEach(product => {
               // Backend expects 'productIds' which is a List<Long>
               formData.append("productIds", product.id.toString()); // Ensure it's appended as string
          });
      } else {
          // IMPORTANT: If productIds is mandatory on backend, handle this case
          // formData.append("productIds", []); // Send empty array? Check backend requirement
          console.log("No products selected to associate.");
      }

      // Optional: Log FormData contents for debugging
      console.log("FormData prepared:");
      for (let [key, value] of formData.entries()) {
         if (value instanceof File) {
              console.log(`${key}: File - ${value.name}, Size: ${value.size}`);
         } else {
              console.log(`${key}: ${value}`);
         }
      }

      // Disable button during submission
      const saveButton = form.querySelector('.save-button');
      if (saveButton) saveButton.disabled = true;

      try {
          console.log(`Sending data to: ${API_BASE_URL}/api/categories`);
          const response = await fetch(`${API_BASE_URL}/api/categories`, {
              method: "POST",
              headers: {
                  "Authorization": "Bearer " + token
                  // Content-Type is NOT set manually for FormData; browser handles it
              },
              body: formData
          });

          const responseBodyText = await response.text(); // Read body once for logging/parsing

          if (!response.ok) {
              // Handle HTTP errors (4xx, 5xx)
              console.error(`HTTP Error: ${response.status} ${response.statusText}`);
              console.error("Response Body:", responseBodyText);
              let errorMsg = `Failed to save category. Status: ${response.status}.`;
              try {
                  // Try to parse backend error message if it's JSON
                  const errorJson = JSON.parse(responseBodyText);
                  errorMsg += ` Error: ${errorJson.message || responseBodyText}`;
              } catch (e) {
                  // If not JSON, use the raw text
                  errorMsg += ` Error: ${responseBodyText}`;
              }
              alert(errorMsg);
              throw new Error(`HTTP error! Status: ${response.status}`); // Throw to exit try block
          }

          // --- Success ---
          console.log("✅ Server Response Text:", responseBodyText);
          // Assuming backend returns the created category object as JSON
          const result = JSON.parse(responseBodyText);
          console.log("✅ Category Created:", result);
          alert("Category saved successfully!");

          // Reset form and selected products display
          form.reset();
          selectedProductCache = []; // Clear the cache
          renderSelectedProducts(); // Update display to show placeholder

      } catch (error) {
          console.error("❌ Error saving category:", error);
          // Avoid generic alert if a specific one was already shown for HTTP errors
          if (!error.message.startsWith("HTTP error!")) {
             alert("An unexpected error occurred while saving. Check console for details.");
          }
      } finally {
          // Re-enable button regardless of success/failure
          if (saveButton) saveButton.disabled = false;
      }
  }

  // Attach submit listener to form
  form.addEventListener('submit', handleCreateCategory);


  // --- Image Upload Button Trigger ---
  if (imageUploadButton && imageInput) {
       imageUploadButton.addEventListener('click', () => {
           console.log("Image upload button clicked, triggering file input.");
           imageInput.click(); // Trigger the hidden file input
       });
  } else {
      console.warn("Image upload button or input not found.");
  }

  // --- Product Search Modal Logic ---

  // Open Modal
  if(searchProductBar) {
      searchProductBar.addEventListener("click", () => {
          if (!modal) return;
          console.log("Opening product search modal.");
          modal.style.display = "flex";
          if (searchInput) searchInput.value = ""; // Clear search field
          if (searchResultsContainer) searchResultsContainer.innerHTML = ""; // Clear previous results
      });
  }

  // Close Modal
  if (closeBtn && modal) {
      closeBtn.onclick = () => {
          modal.style.display = "none";
      };
  }

  // Search Input Listener
  if (searchInput) {
      searchInput.addEventListener("input", debounce(async () => { // Use debounce to limit API calls
          const keyword = searchInput.value.trim();
          if (keyword.length < 2) { // Minimum characters to trigger search
              if (searchResultsContainer) searchResultsContainer.innerHTML = "<p class='p-4 text-gray-600'>Type at least 2 characters to search...</p>";
              return;
          }

          console.log(`Searching for products with keyword: ${keyword}`);
          if (searchResultsContainer) searchResultsContainer.innerHTML = "<p class='p-4 text-gray-600'>Searching...</p>"; // Loading indicator

          try {
              const res = await fetch(`http://localhost:8080/api/products/search?keyword=${keyword}`, {
        });

              if (!res.ok) {
                   const errorText = await res.text();
                  throw new Error(`Failed to fetch products: ${res.status} ${res.statusText} - ${errorText}`);
              }

              const products = await res.json();
              console.log("Search results received:", products);
              renderSearchResults(products);

          } catch (error) {
              console.error("Search Error:", error);
               if (searchResultsContainer) searchResultsContainer.innerHTML = `<p class="p-4 text-red-500">Error fetching products: ${error.message}</p>`;
          }
      }, 300)); // Debounce time in milliseconds (e.g., 300ms)
  }

  // Render Search Results in Modal
  function renderSearchResults(products) {
      if (!searchResultsContainer) return;
      searchResultsContainer.innerHTML = ""; // Clear previous or loading text

      if (!products || products.length === 0) {
           searchResultsContainer.innerHTML = "<p class='p-4 text-gray-600'>No products found matching your search.</p>";
           return;
      }

      products.forEach(product => {
          const item = document.createElement("div");
          item.className = "p-2 border-b flex items-center gap-3 hover:bg-orange-100";
          // Check if product is already in the main page's selected list
          const isAlreadySelected = selectedProductCache.some(p => p.id === product.id);

          item.innerHTML = `
              <input type="checkbox" id="modal-prod-${product.id}"
                     data-product='${JSON.stringify(product)}'
                     ${isAlreadySelected ? 'checked disabled' : ''}  /* Check and disable if already added */
                     class="mr-2 h-4 w-4 flex-shrink-0">
              <img src="${product.imageUrl}" alt="${product.name}" class="w-10 h-10 object-cover rounded-md mb-2"/>
              <label for="modal-prod-${product.id}" class="flex-grow cursor-pointer">
                  ${product.name} - ₹${product.price}
                  ${isAlreadySelected ? '<span class="text-xs text-gray-500 ml-2">(Already Added)</span>' : ''}
               </label>
          `;
          searchResultsContainer.appendChild(item);
      });
  }

  // Add Selected Products from Modal to Main Page Display
  if (submitProductSelectionBtn) {
      submitProductSelectionBtn.addEventListener("click", () => {
          if (!searchResultsContainer || !modal) return;
          console.log("Adding selected products from modal.");

          const checkboxes = searchResultsContainer.querySelectorAll("input[type='checkbox']:checked:not(:disabled)"); // Select checked but not disabled ones

          checkboxes.forEach(cb => {
              try {
                  const product = JSON.parse(cb.dataset.product);
                  // Add to cache only if not already present (safety check)
                  if (!selectedProductCache.some(p => p.id === product.id)) {
                      selectedProductCache.push(product);
                      console.log(`Added product ${product.id} to cache.`);
                  }
              } catch(e) {
                  console.error("Error parsing product data from checkbox:", e, cb.dataset.product);
              }
          });

          // Update the display on the main page
          renderSelectedProducts();

          modal.style.display = "none"; // Close modal
      });
  }

  // Render Selected Products on Main Page
  function renderSelectedProducts() {
       if (!selectedProductsContainer) return;
       selectedProductsContainer.innerHTML = ""; // Clear current display

       if (selectedProductCache.length === 0) {
            // Show placeholder using the structure defined in HTML
            selectedProductsContainer.innerHTML = `
               <p class="text-center text-gray-500 p-4 no-products-placeholder">
                   <i class="fas fa-box-open"></i>
                   No products added yet. Use Search/Browse above.
               </p>`;
            return;
       }

       console.log(`Rendering ${selectedProductCache.length} selected products.`);
       selectedProductCache.forEach(product => {
           const div = document.createElement("div");
           // Add class and data attribute for form submission logic
           div.className = "border p-3 my-2 rounded bg-orange-50 flex items-center gap-3 selected-product-card";
           div.dataset.productId = product.id; // CRITICAL: For formData appending later

           div.innerHTML = `
               <img src="${product.imageUrl}" alt="${product.name}" class="w-12 h-12 object-cover rounded-md flex-shrink-0"/>
               <div class="flex-grow">
                   <strong>${product.name}</strong> - ₹${product.price}<br/>
                   <small>ID: ${product.id}</small> <!-- Display ID for reference -->
               </div>
               <button type="button" class="text-red-500 hover:text-red-700 remove-product-btn text-xl px-2 flex-shrink-0" data-remove-id="${product.id}" title="Remove Product">×</button>
           `;
           selectedProductsContainer.appendChild(div);
       });

       // Add event listeners to the newly created remove buttons
       addRemoveButtonListeners();
   }

   // Add Listeners to Remove Buttons
   function addRemoveButtonListeners() {
      const removeButtons = selectedProductsContainer.querySelectorAll('.remove-product-btn');
      removeButtons.forEach(button => {
          // Remove previous listener to prevent duplicates if re-rendered often
          button.replaceWith(button.cloneNode(true));
      });
      // Add new listeners
      selectedProductsContainer.querySelectorAll('.remove-product-btn').forEach(button => {
           button.addEventListener('click', (event) => {
               const idToRemove = parseInt(event.target.dataset.removeId, 10);
               console.log(`Requesting removal of product ID: ${idToRemove}`);
               // Remove from cache
               selectedProductCache = selectedProductCache.filter(p => p.id !== idToRemove);
               // Re-render the list
               renderSelectedProducts();
           });
      });
   }

   // --- Utility Functions ---
   function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }

  // Initial render in case of page refresh with data (though unlikely for 'create' page)
  renderSelectedProducts();
  

}); // End DOMContentLoaded
// --- END OF FILE createCollection1.js ---