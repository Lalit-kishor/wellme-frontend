import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';


export interface LoginResponse {
  success: boolean,
  message: string,
  email?: string,
  role?: string
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        if (response.success) {

          // JWT is now stored in HTTP-only cookie automatically

          const role = response.role;
          console.log("Role is: ", role);
          
          
          if(role === 'PATIENT') this.router.navigate(['patient-dashboard']);
          else if (role === 'DOCTOR') this.router.navigate(['/availaility-details']);
          else if(role === 'ADMIN') this.router.navigate(['/admin-dashboard']);

        } else {
          this.errorMessage = response.message || 'Login failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
