import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { AppointmentSchedule, Doctor, SlotGroup } from '../../models/appointment_schedule.models';
import { BookingStateService } from '../../services/booking-state/booking-state.service';

@Component({
  selector: 'app-slot-booking',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './slot-booking.component.html',
  styleUrl: './slot-booking.component.css'
})
export class SlotBookingComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly bookingStateService = inject(BookingStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly doctor = signal<Doctor | null>(null);
  readonly slotGroups = signal<SlotGroup[]>([]);
  readonly selectedSlot = signal<AppointmentSchedule | null>(null);

  readonly selectedSlotLabel = computed(() => {
    const slot = this.selectedSlot();
    if (!slot) return '';
    return `${this.formatDate(slot.date)} · ${this.formatTime(slot.startTime)}–${this.formatTime(slot.endTime)}`;
  });

  ngOnInit(): void {
    // Adjust the param name here to match your route config, e.g. { path: 'doctors/:doctorId' }
    const doctorId = Number(this.route.snapshot.paramMap.get('doctorId'));

    if (!doctorId) {
      this.errorMessage.set('No doctor selected.');
      this.loading.set(false);
      return;
    }

    this.fetchDoctorAndSlots(doctorId);
  }

  private fetchDoctorAndSlots(doctorId: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      doctor: this.bookingService.getDoctorProfile(doctorId).pipe(
        catchError(error => {
          console.error('Failed to load doctor profile', error);
          // Return null or throw a specific error depending on your needs
          return of(null);
        })
      ),
      slots: this.bookingService.getDoctorSlots(doctorId).pipe(
        catchError(error => {
          console.error('Failed to load slots', error);
          // Return an empty array as a fallback so the doctor profile can still render
          return of([]);
        })
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ doctor, slots }) => {
          if (!doctor) {
            this.errorMessage.set("We couldn't load this doctor's details. Please try again.");
          } else {
            this.doctor.set(doctor);
            this.slotGroups.set(this.groupSlotsByDate(slots));
          }
          this.loading.set(false);
        },
        error: (err) => {
          // This will now only trigger if something catastrophic happens outside the inner catches
          this.errorMessage.set("An unexpected error occurred.");
          this.loading.set(false);
        },
      });
  }

  private groupSlotsByDate(schedules: AppointmentSchedule[]): SlotGroup[] {
    const byDate = new Map<string, AppointmentSchedule[]>();

    for (const schedule of schedules) {
      const existing = byDate.get(schedule.date) ?? [];
      existing.push(schedule);
      byDate.set(schedule.date, existing);
    }

    return Array.from(byDate.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, slots]) => ({
        date,
        slots: slots.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }));
  }

  selectSlot(slot: AppointmentSchedule): void {
    this.selectedSlot.set(slot);
  }

  isSelected(slot: AppointmentSchedule): boolean {
    return this.selectedSlot()?.id === slot.id;
  }

  confirmSlot(): void {
    const slot = this.selectedSlot();
    const doc = this.doctor();

    if (!slot || !doc) return;
    // TODO: carry this into step 3 (Selection Overview) — router state, a shared
    // booking-draft service, or a query param, whichever pattern the rest of
    // CareSlot already uses for cross-step state.

    this.bookingStateService.selectedDoctor.set(doc);
    this.bookingStateService.selectedSlot.set(slot);

    this.router.navigate(['/booking/review']);
    
    console.log('Confirmed slot', slot);
  }

  fullName(doctor: Doctor): string {
    return `${doctor.firstName} ${doctor.lastName}`.replace(/\s+/g, ' ').trim();
  }

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

}
