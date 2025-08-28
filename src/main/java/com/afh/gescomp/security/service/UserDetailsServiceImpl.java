/*
package com.afh.gescomp.security.service;

import com.afh.gescomp.model.secondary.User;
import com.afh.gescomp.repository.secondary.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class UserDetailsServiceImpl implements UserDetailsService {
	@Autowired
	UserRepository userRepository;
	Long immatriculeLong;

	@Override
	@Transactional
	public UserDetails loadUserByUsername(String immatricule) throws UsernameNotFoundException {
		try {
			immatriculeLong = Long.parseLong(immatricule);
		} catch (NumberFormatException e) {
			throw new UsernameNotFoundException("Invalid immatricule format");
		}

		User user = userRepository.findByImmatricule(immatriculeLong)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with immatricule: " + immatricule));
		return UserDetailsImpl.build(user);
	}
	}
*/
