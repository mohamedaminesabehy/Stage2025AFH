package com.afh.gescomp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/test")
public class TestController {

	@RequestMapping(value = "/all", method = RequestMethod.GET)
	public String allAccess() {
		return "Public Content.";
	}

	@RequestMapping(value = "/user", method = RequestMethod.GET)
	@PreAuthorize("hasRole('USER')")
	public String userAccess() {
		return "User Content.";
	}

	@RequestMapping(value = "/mod", method = RequestMethod.GET)
	@PreAuthorize("hasRole('MODERATOR')")
	public String moderatorAccess() {
		return "Moderator Board.";
	}


	@RequestMapping(value = "/admin", method = RequestMethod.GET)
	@PreAuthorize("hasRole('ADMIN')")
	public String adminAccess() {
		return "Admin Board.";
	}
}
