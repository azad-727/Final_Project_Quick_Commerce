package com.asap.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Order Relationship ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    // --- Product Relationship ---
    @ManyToOne(fetch = FetchType.LAZY) // Link to the actual product
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // --- Details at time of order ---
    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal pricePerUnit; // Price of ONE unit when the order was placed

    // --- Calculated field (optional, can be calculated on the fly) ---
    // @Column(precision = 10, scale = 2, nullable = false)
    // private BigDecimal lineTotal;

    // --- Constructors, Getters, Setters handled by Lombok ---
}