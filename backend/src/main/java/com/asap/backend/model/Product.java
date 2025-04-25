package com.asap.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private double price;
    @Column(nullable = false)
    private double mrp;
    @Column(nullable = false)
    private int shelfLife;
    @Column(nullable = false)
    private int stock;
    @Column(nullable = false)
    private String unit;
    @Column(nullable = false)
    private String sku;
    @Column(nullable = false)
    private String brand;
    @Column(nullable = false)
    private String bulletPoint;
    @Column(nullable = false)
    private String description;
    @Column(nullable = false)
    private String manufacturer;
    @Column(nullable = false)
    private String tags;
    @Column(nullable = false)
    private String imageUrl;
    // ✅ New Field for Image
    @ManyToOne(fetch = FetchType.LAZY) // Fetch category details only when needed
    @JoinColumn(name = "category_id") // This adds a category_id column to the product table
    @JsonBackReference
    private Category category;

}
