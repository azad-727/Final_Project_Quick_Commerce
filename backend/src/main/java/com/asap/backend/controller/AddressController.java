package com.asap.backend.controller;

import com.asap.backend.model.Address;
import com.asap.backend.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @PostMapping("/add")
    public Address addAddress(@RequestBody Address address, Authentication authentication)
    {
        String email=authentication.getName();

        return addressService.saveAddress(address, email);
    }

    @GetMapping("/all")
    public List<Address> getUserAddresses(Authentication authentication) {
        String email=authentication.getName();
        return addressService.getAddressesByUserEmail(email);
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody Address updatedAddress, Authentication authentication) {
        String email= authentication.getName();
        Optional<Address> addressOptional = addressService.getAddressById(id);

        if (addressOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Address address = addressOptional.get();

        if (!address.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(403).body("Unauthorized to update this address");
        }

        address.setLabel(updatedAddress.getLabel());
        address.setFullAddress(updatedAddress.getFullAddress());

        return ResponseEntity.ok(addressService.saveAddress(address, email));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteAddress(@PathVariable Long id, Authentication authentication) {
        String email= authentication.getName();
        System.out.println("Received ID for deletion: " + id);
        Optional<Address> addressOptional = addressService.getAddressById(id);

        if (addressOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Address address = addressOptional.get();

        if (!address.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(403).body("Unauthorized to delete this address");
        }

        addressService.deleteAddress(id);
        return ResponseEntity.ok("Address deleted successfully");
    }


}
