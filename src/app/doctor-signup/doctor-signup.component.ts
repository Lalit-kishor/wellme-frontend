import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-doctor-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-signup.component.html',
  styleUrls: ['./doctor-signup.component.css']
})
export class DoctorSignupComponent {
  readonly totalSteps: number = 3;
  currentStep: number = 1;
  readonly stepTitles: string[] = [
    'Personal Information',
    'Professional Information',
    'Account Security'
  ];

  email: string = '';
  password: string = '';
  password_repeat: string = '';
  firstName: string = '';
  lastName: string = '';
  medicalLicenseNumber: string = '';
  specializations: string = '';
  clinicAddress: string = '';
  city: string = '';
  yearsOfExperience: number = 0;
  gender: string = '';
  languages: string = '';
  consultationFee: number = 0;
  profilePicture: File | null = null;
  profilePicturePreview: string | null = null;
  
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get currentStepTitle(): string {
    return this.stepTitles[this.currentStep - 1];
  }

  goToStep(targetStep: number): void {
    if (targetStep < 1 || targetStep > this.totalSteps || targetStep === this.currentStep) {
      return;
    }

    this.errorMessage = '';

    if (targetStep > this.currentStep) {
      for (let step = 1; step < targetStep; step++) {
        if (!this.validateStep(step)) {
          this.currentStep = step;
          return;
        }
      }
    }

    this.currentStep = targetStep;
  }

  goToNextStep(): void {
    this.errorMessage = '';
    if (!this.validateStep(this.currentStep)) {
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep += 1;
    }
  }

  goToPreviousStep(): void {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  isStepAccessible(step: number): boolean {
    if (step <= this.currentStep) {
      return true;
    }

    for (let index = 1; index < step; index++) {
      if (!this.isStepValid(index)) {
        return false;
      }
    }

    return true;
  }

  

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profilePicture = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicturePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    for (let step = 1; step <= this.totalSteps; step++) {
      if (!this.validateStep(step)) {
        this.currentStep = step;
        return;
      }
    }

    this.isLoading = true;

    const doctorData = {
      email: this.email,
      password: this.password,
      password_repeat: this.password_repeat,
      firstName: this.firstName,
      lastName: this.lastName,
      medicalLicenseNumber: this.medicalLicenseNumber,
      specializations: this.specializations,
      clinicAddress: this.clinicAddress,
      city: this.city,
      yearsOfExperience: this.yearsOfExperience,
      gender: this.gender,
      languages: this.languages,
      consultationFee: this.consultationFee,
      profilePicture: this.profilePicture || undefined
    };

    this.authService.signupDoctor(doctorData).subscribe({
      next: (response) => {
        console.log('Response from signupDoctor API is: ', response);
        this.isLoading = false;
        this.successMessage = 'Doctor account created successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error || 'Signup failed. Please try again.';
      }
    });
  }

  

  private validateStep(step: number): boolean {
    switch (step) {
      case 1:
        return this.validatePersonalInfo(true);
      case 2:
        return this.validateProfessionalInfo(true);
      case 3:
        return this.validateAccountSecurity(true);
      default:
        return false;
    }
  }

  private isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.validatePersonalInfo(false);
      case 2:
        return this.validateProfessionalInfo(false);
      case 3:
        return this.validateAccountSecurity(false);
      default:
        return false;
    }
  }

  private validatePersonalInfo(showError: boolean): boolean {
    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.gender.trim() ||
      !this.languages.trim()
    ) {
      if (showError) {
        this.errorMessage = 'Please fill in all required personal information fields.';
      }
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email.trim())) {
      if (showError) {
        this.errorMessage = 'Please enter a valid email address.';
      }
      return false;
    }

    return true;
  }

  private validateProfessionalInfo(showError: boolean): boolean {
    if (
      !this.medicalLicenseNumber.trim() ||
      !this.specializations.trim() ||
      !this.clinicAddress.trim() ||
      !this.city.trim()
    ) {
      if (showError) {
        this.errorMessage = 'Please fill in all required professional information fields.';
      }
      return false;
    }

    if (this.yearsOfExperience < 0) {
      if (showError) {
        this.errorMessage = 'Years of experience cannot be negative.';
      }
      return false;
    }

    if (this.consultationFee < 0) {
      if (showError) {
        this.errorMessage = 'Consultation fee cannot be negative.';
      }
      return false;
    }

    return true;
  }

  

  private validateAccountSecurity(showError: boolean): boolean {
    if (!this.password || !this.password_repeat) {
      if (showError) {
        this.errorMessage = 'Please fill in password and confirm password.';
      }
      return false;
    }

    if (this.password.length < 6) {
      if (showError) {
        this.errorMessage = 'Password must be at least 6 characters long.';
      }
      return false;
    }

    if (this.password !== this.password_repeat) {
      if (showError) {
        this.errorMessage = 'Passwords do not match.';
      }
      return false;
    }

    return true;
  }

  
}
