package com.asap.backend.config; // Adjust package if needed

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(MvcConfig.class);

    // Define relative sub-paths (relative to backend project root)
    private static final String UPLOADS_FOLDER = "uploads";
    private static final String PRODUCT_SUB_PATH = "products";
    private static final String CATEGORY_SUB_PATH = "categories";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        log.info("Configuring resource handlers...");

        // Get the backend project's working directory
        String backendWorkingDir = System.getProperty("user.dir");
        log.info("Using backend working directory path: {}", backendWorkingDir);

        // --- Handler for Product Images ---
        // 1. Define the URL path the browser requests
        String productUrlPath = "/" + UPLOADS_FOLDER + "/" + PRODUCT_SUB_PATH + "/**"; // --> /uploads/products/**

        // 2. Construct the absolute physical disk path using forward slashes for the file: URI
        //    Starts with "file:", uses working directory, adds sub-folders, ends with "/"
        String productDiskPath = "file:///" // Use triple slash for file URIs, especially on Windows
                + backendWorkingDir.replace("\\", "/") // Replace backslashes with forward slashes
                + "/" + UPLOADS_FOLDER
                + "/" + PRODUCT_SUB_PATH
                + "/"; // Must end with slash

        log.info("Mapping URL path [{}] to disk location [{}]", productUrlPath, productDiskPath);
        registry.addResourceHandler(productUrlPath)
                .addResourceLocations(productDiskPath);


        // --- Handler for Category Images (Assuming they are also in backend/uploads/categories) ---
        String categoryUrlPath = "/" + UPLOADS_FOLDER + "/" + CATEGORY_SUB_PATH + "/**"; // --> /uploads/categories/**

        String categoryDiskPath = "file:///"
                + backendWorkingDir.replace("\\", "/")
                + "/" + UPLOADS_FOLDER
                + "/" + CATEGORY_SUB_PATH
                + "/";

        log.info("Mapping URL path [{}] to disk location [{}]", categoryUrlPath, categoryDiskPath);
        registry.addResourceHandler(categoryUrlPath)
                .addResourceLocations(categoryDiskPath);

    }
}