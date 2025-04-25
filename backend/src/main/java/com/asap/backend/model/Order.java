package com.asap.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal; // Use BigDecimal for currency
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders") // Use plural for table name usually
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- User Relationship ---
    @ManyToOne(fetch = FetchType.LAZY) // Link to the user who placed the order
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Assuming you have a User entity

    // --- Order Details ---
    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false)
    private String orderStatus; // e.g., "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount; // Store final calculated total

    // --- Delivery Address Info (Store directly or link to an Address entity) ---
    // Storing directly is simpler if address only needed for this order
    @Column(nullable = false)
    private String deliveryAddressLine1;
    private String deliveryAddressLine2;
    @Column(nullable = false)
    private String deliveryCity;
    @Column(nullable = false)
    private String deliveryPostalCode;
    @Column(nullable = false)
    private String recipientName;
    @Column(nullable = false)
    private String recipientPhone;

    // --- Payment Info (Basic) ---
    private String paymentMethod; // e.g., "COD", "ONLINE"
    private String paymentStatus; // e.g., "PENDING", "COMPLETED", "FAILED"
    private String transactionId; // From payment gateway if applicable

    // --- Order Items Relationship ---
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<OrderItem> orderItems = new ArrayList<>();

    // --- Helper methods ---
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
        item.setOrder(null);
    }

    // --- Timestamps ---
    @Column(updatable = false) // Ensures created date is not changed on update
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist // Runs before entity is saved for the first time
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        orderDate = LocalDateTime.now(); // Set order date on creation
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate // Runs before entity is updated
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Constructors, Getters, Setters handled by Lombok ---
}