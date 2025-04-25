package com.asap.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class OrderRequest {

    // User ID will be taken from the security context (token)

    // --- CHANGE: Accept Address ID instead of full address ---
    private Long selectedAddressId; // ID of the address chosen by the user

    // Payment Method (required)
    private String paymentMethod; // e.g., "COD", "ONLINE"

    // Cart Items (required) - Frontend sends this based on localStorage cart
    private List<CartItemDto> items;

    // Inner class for cart items (remains the same)
    @Getter
    @Setter
    public static class CartItemDto {
        private Long productId;
        private int quantity;
    }
}