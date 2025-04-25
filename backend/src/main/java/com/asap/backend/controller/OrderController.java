package com.asap.backend.controller;

import com.asap.backend.dto.OrderRequest;
import com.asap.backend.model.*;
import com.asap.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AddressRepository addressRepository; // <<< Inject AddressRepository

    @PostMapping
    @Transactional
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {
        log.info("Received order request with selected address ID: {}", orderRequest.getSelectedAddressId());

        // 1. Get Authenticated User (Keep as before)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        log.info("Order placed by user: {} (ID: {})", userEmail, currentUser.getId());

        // 2. Validate Input
        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Order must contain items.");
        }
        // --- CHANGE: Validate selectedAddressId ---
        if (orderRequest.getSelectedAddressId() == null) {
            return ResponseEntity.badRequest().body("Delivery address selection is required.");
        }
        if (orderRequest.getPaymentMethod() == null) {
            return ResponseEntity.badRequest().body("Payment method required.");
        }

        // --- 3. Fetch and Validate Selected Address ---
        Address selectedAddress = addressRepository.findById(orderRequest.getSelectedAddressId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected address not found."));

        // Security Check: Ensure the selected address belongs to the logged-in user
        if (!selectedAddress.getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to use address {} belonging to user {}", currentUser.getId(), selectedAddress.getId(), selectedAddress.getUser().getId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot use selected address.");
        }
        log.info("Using selected address ID: {}, Label: {}", selectedAddress.getId(), selectedAddress.getLabel());


        // 4. Create new Order entity
        Order newOrder = new Order();
        newOrder.setUser(currentUser);
        newOrder.setOrderStatus("PENDING"); // Start as PENDING, update after payment/confirmation
        newOrder.setPaymentMethod(orderRequest.getPaymentMethod());
        newOrder.setPaymentStatus("PENDING");

        // --- CHANGE: Set Address from fetched entity ---
        // You might need to parse the fullAddress or add separate fields if needed later
        newOrder.setRecipientName(currentUser.getName()); // Use user's name or add field to Address
        newOrder.setRecipientPhone(currentUser.getPhone()); // Use user's phone or add field to Address
        newOrder.setDeliveryAddressLine1(selectedAddress.getFullAddress()); // Assuming fullAddress is sufficient
        newOrder.setDeliveryAddressLine2(""); // Clear or map if needed
        newOrder.setDeliveryCity("N/A"); // TODO: Parse city from fullAddress or add city field to Address entity
        newOrder.setDeliveryPostalCode("N/A"); // TODO: Parse postcode from fullAddress or add postcode field to Address entity


        BigDecimal calculatedTotal = BigDecimal.ZERO;
        List<OrderItem> orderItemsList = new ArrayList<>();

        // 5. Process Order Items (Keep as before)
        // Fetch all required products in one go...
        List<Long> productIds = orderRequest.getItems().stream().map(OrderRequest.CartItemDto::getProductId).collect(Collectors.toList());
        Map<Long, Product> productsMap = productRepository.findAllById(productIds).stream().collect(Collectors.toMap(Product::getId, product -> product));

        for (OrderRequest.CartItemDto itemDto : orderRequest.getItems()) {
            Product product = productsMap.get(itemDto.getProductId());
            if (product == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product ID " + itemDto.getProductId() + " not found.");
            if (product.getStock() < itemDto.getQuantity())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for: " + product.getName());

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPricePerUnit(BigDecimal.valueOf(product.getPrice()));
            orderItem.setOrder(newOrder);
            orderItemsList.add(orderItem);
            calculatedTotal = calculatedTotal.add(orderItem.getPricePerUnit().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
            // Optional: Deduct stock
        }

        // 6. Set Order Total and Items (Keep as before)
        newOrder.setTotalAmount(calculatedTotal);
        newOrder.setOrderItems(orderItemsList);

        // 7. Save Order (Keep as before)
        Order savedOrder = orderRepository.save(newOrder);
        log.info("Order created successfully with ID: {}", savedOrder.getId());

        // 8. TODO: Initiate Payment Process if necessary

        // 9. Return Response (Keep as before)
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Keep authorization
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) { // <<< Return Order entity directly
        log.info("Request received to get order by ID: {}", id);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        // Fetch order
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Authorization Check (Keep this)
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN")); // Adjust role if needed
        boolean isOwner = order.getUser().getEmail().equals(userEmail);

        if (!isOwner && !isAdmin) {
            log.warn("User {} attempted to access order {} belonging to user {}", userEmail, id, order.getUser().getEmail());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this order");
        }

        // --- ADD THIS RETURN STATEMENT ---
        return ResponseEntity.ok(order); // Return the fetched Order object if authorized
        // --- END ADDED RETURN STATEMENT ---

    } // Closing brace for the getOrderById method000

    // --- Keep the TODO comments or implement the methods later ---
    // --- TODO: Add GET /api/orders (for user's own orders) endpoint ---
    // --- TODO: Add Admin endpoints (GET all orders, PUT status) ---

} // Closing brace for the OrderController class
