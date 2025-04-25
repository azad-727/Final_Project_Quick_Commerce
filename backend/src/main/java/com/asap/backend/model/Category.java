package com.asap.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*; // Use jakarta persistence imports
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.OneToMany; // Make sure OneToMany is imported
import jakarta.persistence.CascadeType;
import lombok.Getter; // Optional Lombok
import lombok.Setter; // Optional Lombok

@Entity
@Getter // Optional Lombok
@Setter // Optional Lombok
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    @Column(length = 1000)
    private String description;
    private String type;
    private String seoTitle;
    private String seoDescription;
    private String imageUrl; // Store relative path ideally

    @OneToMany(
            mappedBy = "category", // MUST match the field name in the Product entity
            fetch = FetchType.LAZY // Keep it lazy unless you ALWAYS need products
            // cascade = CascadeType.ALL, // Be careful with cascade - do you want deleting category to delete products? Probably not.
            // orphanRemoval = true // Also potentially dangerous
    )
    @JsonManagedReference
    private Set<Product> products = new HashSet<>();
}