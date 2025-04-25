package com.asap.backend.repository;

import com.asap.backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Custom queries can be added later if needed
}