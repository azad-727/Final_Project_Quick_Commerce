package com.asap.backend.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class CreateCategoryRequest {
    private String title;
    private String description;
    private String type;
    private String seoTitle;
    private String seoDescription;
    private MultipartFile image; // Matches the @RequestParam name currently
    private List<Long> productIds; // To receive the list of product IDs
}