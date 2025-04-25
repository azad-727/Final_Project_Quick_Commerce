package com.asap.backend.repository;

import com.asap.backend.model.Address;
import com.asap.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user) ;
}
