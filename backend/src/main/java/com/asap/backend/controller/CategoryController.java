package com.asap.backend.controller;

import com.asap.backend.dto.CreateCategoryRequest; // MAKE SURE YOU HAVE CREATED THIS DTO FILE
import com.asap.backend.model.Category;
import com.asap.backend.model.Product; // Import Product model
import com.asap.backend.repository.CategoryRepository;
import com.asap.backend.repository.ProductRepository; // Import ProductRepository
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // Can be used for external config
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories") // Endpoint remains the same
@CrossOrigin(origins = "*") // Added CORS - adjust origin "*" if needed for production
public class CategoryController {

    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired // Inject ProductRepository
    private ProductRepository productRepository;

    // Define upload directory relative to project root
    // Example: project_root/uploads/categories/
    private static final String RELATIVE_UPLOAD_DIR = "uploads" + File.separator + "categories";
    // Get absolute path based on where the application is running
    private static final String UPLOAD_DIR_ABSOLUTE = System.getProperty("user.dir") + File.separator + RELATIVE_UPLOAD_DIR;

    /**
     * Creates a new Category, uploads an associated image, and links selected products.
     * Expects multipart/form-data request.
     *
     * @param request DTO containing category details, image file, and product IDs.
     * @return ResponseEntity with the created Category or an error message.
     */
    @PostMapping(consumes = {"multipart/form-data"}) // Expect multipart form data
    public ResponseEntity<?> createCategory(@ModelAttribute CreateCategoryRequest request) {
        log.info("Received category creation request for title: {}", request.getTitle());
        log.debug("DTO details: title={}, description={},seoTitle={}, seoDescription={}, image={}, productIds={}",
                request.getTitle(), request.getDescription(), request.getType(), request.getSeoTitle(), request.getSeoDescription(),
                (request.getImage() != null ? request.getImage().getOriginalFilename() : "null"), request.getProductIds());

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category title cannot be empty.");
        }
        if (request.getType() == null || request.getType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category type cannot be empty.");
        }

        String relativeImagePath = null;

        try {
            MultipartFile imageFile = request.getImage();
            if (imageFile != null && !imageFile.isEmpty()) {
                String uploadDir = "G:\\Azad Clg\\BCA Final Year Project - Quick-Commerce-Backend"+ File.separator + "uploads";
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                    log.info("Created uploads directory: {}", directory.getAbsolutePath());
                }

                String filePath = uploadDir + File.separator + imageFile.getOriginalFilename();
                File file = new File(filePath);
                imageFile.transferTo(file);

                relativeImagePath = "/uploads/" + imageFile.getOriginalFilename();
                log.info("Image uploaded successfully: {}", file.getAbsolutePath());
            } else {
                log.warn("No image file provided for category: {}", request.getTitle());
            }

            // --- 2. Find Associated Products ---
            Set<Product> associatedProducts = new HashSet<>();
            if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
                List<Long> validProductIds = request.getProductIds().stream()
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());

                if (!validProductIds.isEmpty()) {
                    try {
                        List<Product> foundProducts = productRepository.findAllById(validProductIds);
                        associatedProducts.addAll(foundProducts);
                        log.info("Found {} products for IDs: {}", associatedProducts.size(), validProductIds);
                        if (associatedProducts.size() != validProductIds.size()) {
                            log.warn("Some products not found. Requested: {}, Found: {}", validProductIds, associatedProducts.size());
                        }
                    } catch (Exception e) {
                        log.error("Error fetching products: {}", validProductIds, e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching associated products.");
                    }
                } else {
                    log.info("Product ID list contained only null values.");
                }
            }

            // --- 3. Create and Save Category Entity ---
            Category category = new Category();
            category.setTitle(request.getTitle());
            category.setDescription(request.getDescription());
            category.setType(request.getType());
            category.setSeoTitle(request.getSeoTitle());
            category.setSeoDescription(request.getSeoDescription());
            category.setImageUrl(relativeImagePath);
            category.setProducts(associatedProducts);

            Category savedCategory = categoryRepository.save(category);
            log.info("Successfully created and saved category with ID: {}", savedCategory.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);

        } catch (IOException e) {
            log.error("Image upload failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while creating category: {}", request.getTitle(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            // Note: This might cause issues if 'products' is lazy-loaded and not handled
            // Consider returning a List<CategoryDTO> instead for better control
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error fetching all categories", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Or an error object
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        log.info("Request received to delete category with ID: {}", id);
        try {
            if (!categoryRepository.existsById(id)) {
                log.warn("Attempted to delete non-existent category with ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found with ID: " + id);
            }
            // Consider implications: What happens to products in this category?
            // By default, @ManyToMany usually just removes the link in the join table.
            categoryRepository.deleteById(id);
            log.info("Successfully deleted category with ID: {}", id);
            return ResponseEntity.ok("Category deleted successfully."); // Return success message
        } catch (Exception e) {
            log.error("Error deleting category with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting category: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable Long id) {
        log.debug("Request received to get category with ID: {}", id);
        try {
            Optional<Category> categoryOptional = categoryRepository.findById(id);

            if (categoryOptional.isPresent()) {
                // Again, consider lazy loading of 'products'. Fetch eagerly if needed or use DTO.
                log.debug("Found category with ID: {}", id);
                return ResponseEntity.ok(categoryOptional.get());
            } else {
                log.warn("Category not found for ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found with ID: " + id);
            }
        } catch (Exception e) {
            log.error("Error fetching category with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching category: " + e.getMessage());
        }
    }

    // --- Static Resource Configuration Note ---
    // Remember to configure static resource handling if you haven't already,
    // so the images stored in UPLOAD_DIR_ABSOLUTE can be accessed via the
    // relativeImagePath URLs (e.g., /uploads/categories/your_image.jpg).
    // This is typically done in a class implementing WebMvcConfigurer.
    /* Example MvcConfig.java:
       @Configuration
       public class MvcConfig implements WebMvcConfigurer {
           @Override
           public void addResourceHandlers(ResourceHandlerRegistry registry) {
               String uploadPath = System.getProperty("user.dir") + "/uploads/categories/";
               registry.addResourceHandler("/uploads/categories/**")
                       .addResourceLocations("file:" + uploadPath);
           }
       }
    */
}