import { Component, inject } from '@angular/core';
import { BookingStateService } from '../../services/booking-state/booking-state.service';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Doctor } from '../../models/appointment_schedule.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-review',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './booking-review.component.html',
  styleUrl: './booking-review.component.css'
})
export class BookingReviewComponent {

    private bookingState = inject(BookingStateService);

    doctor = this.bookingState.selectedDoctor;
    slot = this.bookingState.selectedSlot;

  initials(doctor: Doctor): string {
    return `${doctor.firstName.trim()[0] ?? ''}${doctor.lastName.trim()[0] ?? ''}`.toUpperCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  onPay(): void {
    // TODO: Integrate payment gateway here
    console.log('Proceeding to payment for:', this.doctor(), 'at', this.slot());
  }
}
