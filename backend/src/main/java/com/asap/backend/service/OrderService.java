package com.asap.backend.service;

import com.asap.backend.model.Order;
import com.asap.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // ✅ Get all orders for a user
    public List<Order> getOrdersByUserEmail(String email) {
        return orderRepository.findByUserEmail(email);
    }

    // ✅ Get specific order by ID & check ownership
    public Optional<Order> getOrderById(Long orderId, String email) {
        return orderRepository.findByIdAndUserEmail(orderId, email);
    }
}
