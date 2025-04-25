package com.asap.backend.repository;

import com.asap.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Find orders by user ID (add more finders as needed)
    List<Order> findByUserId(Long userId);
    // Optional: Find by user ID ordered by date
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findByUserEmail(String email); // <<< ADD THIS LINE
    Optional<Order> findByIdAndUserEmail(Long orderId, String email); // <<< ADD THIS LINE

}