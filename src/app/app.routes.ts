import { Routes } from '@angular/router';
import { PaymentStatusComponent } from './payment-status/payment-status.component';
import { CheckoutComponent } from './checkout/checkout/checkout.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DoctorSignupComponent } from './doctor-signup/doctor-signup.component';
import { DoctorListingComponent } from './doctors/doctor-listing/doctor-listing.component';
import { DoctorAvailabilityComponent } from './doctors/doctor-availability/doctor-availability.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'doctors', component: DoctorListingComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'signup-doctor', component: DoctorSignupComponent },
    { path: 'checkout', component: CheckoutComponent, canActivate: [RoleGuard], data: { roles: ['PATIENT'] } },
    { path: 'payment-status', component: PaymentStatusComponent },
    { path: 'availaility-details', component: DoctorAvailabilityComponent, canActivate: [RoleGuard], data: { roles: ['DOCTOR'] } },
];
