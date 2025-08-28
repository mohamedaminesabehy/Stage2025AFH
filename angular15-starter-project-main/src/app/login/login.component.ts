import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';  // Importez FormBuilder et Validators
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SignupComponent } from '../signup/signup/signup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; 
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      matricule: ['', Validators.required],  
      password: ['', [Validators.required, Validators.minLength(3)]]  
    });

    if (this.authService.isAuthenticated()) {
      this.isLoggedIn = true;
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      console.log(this.loginForm.controls)
      return; 
    }

    const { matricule, password } = this.loginForm.value; 

    this.authService.login(matricule, password).subscribe({
      next: data => {
        if (data.authenticated === true) {
          this.isLoggedIn = true;
          location.replace('/home');
        } else {
          this.isLoginFailed = true;
          this.isLoggedIn = false;
          this.errorMessage = data.resultat;
        }
      },
      error: err => {
        this.errorMessage = "Internal Server Error 500";
        this.isLoginFailed = true;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onRedirect(): void {
    const dialogRef = this.dialog.open(SignupComponent, {
      data: '',
      width: '70%',
      height: '68%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.loadMarches();
      }
    });
  }
}
