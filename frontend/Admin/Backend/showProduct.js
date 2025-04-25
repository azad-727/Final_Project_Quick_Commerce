document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const tableBody = document.getElementById("productsTableBody");
    const collectionTitle = document.getElementById("collectionTitle");

    // Set a placeholder collection title
    collectionTitle.textContent = "All Products";

    async function fetchProducts() {
        try {
            const res = await fetch("http://localhost:8080/api/products", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch products: ${res.status}`);
            }

            const products = await res.json();

            if (!Array.isArray(products) || products.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-4">No products found.</td></tr>`;
                return;
            }

            tableBody.innerHTML = ""; // Clear any existing rows

            products.forEach(product => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><img src="${product.imageUrl}" alt="${product.name}" class="product-image-thumb"/></td>
                    <td>${product.name}</td>
                    <td>${product.sku || '-'}</td>
                    <td>₹${product.price}</td>
                    <td>${product.stock}</td>
                `;

                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error("Error loading products:", error);
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 py-4">Failed to load products.</td></tr>`;
        }
    }

    fetchProducts();
});
