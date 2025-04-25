package com.asap.backend.service;

import com.asap.backend.model.Address;
import com.asap.backend.model.User;
import com.asap.backend.repository.AddressRepository;
import com.asap.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepo;

    @Autowired
    private UserRepository userRepo;

    public Address saveAddress(Address address, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        address.setUser(user);
        return addressRepo.save(address);
    }

    public List<Address> getAddressesByUserEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return addressRepo.findByUser(user);
    }
    public Optional<Address> getAddressById(Long id) {
        return addressRepo.findById(id);
    }

    public void deleteAddress(Long id) {
        addressRepo.deleteById(id);
    }

}
