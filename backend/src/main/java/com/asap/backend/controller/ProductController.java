package com.asap.backend.controller;

import com.asap.backend.model.Category; // Import Category
import com.asap.backend.model.Product;
import com.asap.backend.repository.CategoryRepository; // Import CategoryRepository
import com.asap.backend.repository.ProductRepository;
// import jakarta.validation.Valid; // Remove if not using validation annotations here
import org.slf4j.Logger; // Add Logging
import org.slf4j.LoggerFactory; // Add Logging
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Add HttpStatus
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Enable CORS
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class); // Add Logger

    @Autowired
    private ProductRepository productRepository;

    @Autowired // Inject CategoryRepository
    private CategoryRepository categoryRepository;

    private static final String IMAGE_DIRECTORY = "uploads/";

    // --- GET Methods (Unchanged, kept for context) ---
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() { /* ... */ return ResponseEntity.ok(productRepository.findAll());}
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) { /* ... */ Optional<Product> p = productRepository.findById(id); return p.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }
    // This needs update if Product no longer has String category
    // @GetMapping("/category/{category}")
    // public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) { /* ... */ return ResponseEntity.ok(productRepository.findByCategory(category)); }
    @GetMapping("/category/{categoryId}") // Change to search by category ID
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productRepository.findByCategoryId(categoryId)); // Assumes findByCategoryId exists in Repo
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) { /* ... */ return ResponseEntity.ok(productRepository.findByNameContainingIgnoreCase(keyword)); }

    // --- MODIFIED addProduct Method ---
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> addProduct(
            @RequestParam String name,
            @RequestParam String sku,
            @RequestParam String brand,
            @RequestParam String unit,
            @RequestParam String bulletPoint,
            @RequestParam int shelfLife,
            @RequestParam double mrp,
            @RequestParam String description,
            @RequestParam String manufacturer,
            @RequestParam String tags,
            @RequestParam Long categoryId,
            @RequestParam double price,
            @RequestParam int stock,
            @RequestParam MultipartFile imageUrl
    ) {
        log.info("Received request to add product: Name={}, SKU={}, CategoryID={}", name, sku, categoryId);

        try {
            // --- 1. Validate Category ---
            Optional<Category> categoryOptional = categoryRepository.findById(categoryId);
            if (categoryOptional.isEmpty()) {
                log.warn("Invalid Category ID provided: {}", categoryId);
                return ResponseEntity.badRequest().body("Invalid Category ID: " + categoryId + ". Category not found.");
            }
            Category selectedCategory = categoryOptional.get(); // Get the Category entity
            log.info("Found category: {}", selectedCategory.getTitle());

            try {
                // ✅ Ensure uploads directory exists in project folder
                String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs(); // Create the directory if it doesn't exist
                }

                // ✅ Save image
                String filePath = uploadDir + File.separator + imageUrl.getOriginalFilename();
                File file = new File(filePath);
                imageUrl.transferTo(file);

                // --- 3. Create and Save Product ---
                Product product = new Product();
                product.setName(name);
                product.setSku(sku);
                product.setBrand(brand);
                product.setUnit(unit);
                product.setBulletPoint(bulletPoint);
                product.setShelfLife(shelfLife);
                product.setMrp(mrp);
                product.setDescription(description);
                product.setManufacturer(manufacturer);
                product.setTags(tags);
                product.setPrice(price);
                product.setStock(stock);
                product.setImageUrl(filePath); // Store the relative image path

                // --- SET THE RELATIONSHIP ---
                product.setCategory(selectedCategory);

                Product savedProduct = productRepository.save(product);
                log.info("Successfully saved product '{}' with ID: {} under Category ID: {}", savedProduct.getName(), savedProduct.getId(), categoryId);

                return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);

            } catch (Exception e) {
                log.error("Unexpected error adding product: {}", name, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while adding the product.");
            }

        } catch (Exception outer) {
            log.error("Outer exception while validating category or setup: {}", outer.getMessage(), outer);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong at outer try block.");
        }
    }


    // --- PUT and DELETE Methods (May need review depending on Category use) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) { /* ... */ return ResponseEntity.ok("Update logic needs review for category handling");}

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) { /* ... */ productRepository.deleteById(id); return ResponseEntity.ok("Product deleted successfully"); }


    // --- Repository Method Needed ---
    // Add this method definition to your ProductRepository interface:
    // List<Product> findByCategoryId(Long categoryId);

}