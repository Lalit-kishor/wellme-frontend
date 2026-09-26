import { Component } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface TimeSlotWithIndex {
  startTime: string;
  endTime: string;
  originalIndex: number;
}

interface DayAvailability {
  day: string;
  isSelected: boolean;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-doctor-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-availability.component.html',
  styleUrl: './doctor-availability.component.css'
})
export class DoctorAvailabilityComponent {

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ){}

  availabilityByDay: DayAvailability[] = [
    this.createDayAvailability('MONDAY'),
    this.createDayAvailability('TUESDAY'),
    this.createDayAvailability('WEDNESDAY'),
    this.createDayAvailability('THURSDAY'),
    this.createDayAvailability('FRIDAY'),
    this.createDayAvailability('SATURDAY'),
    this.createDayAvailability('SUNDAY')
  ];

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  onDayAvailabilityToggle(dayAvailability: DayAvailability): void {
    if (!dayAvailability.isSelected) {
      dayAvailability.slots = [this.createEmptySlot()];
    }
  }

  addSlot(dayAvailability: DayAvailability): void {
    dayAvailability.slots.push(this.createEmptySlot());
  }

  removeSlot(dayAvailability: DayAvailability, slotIndex: number): void {
    if (dayAvailability.slots.length <= 1) {
      return;
    }

    dayAvailability.slots.splice(slotIndex, 1);
  }

  isTimeRangeValid(startTime: string, endTime: string): boolean {
    if (!startTime || !endTime) {
      return false;
    }

    return startTime < endTime;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';


    this.isLoading = true;

    const doctorData = {
      availability: this.buildAvailabilityPayload()
    };

    this.doctorService.addAvailabilityDetails(doctorData).subscribe({
      next: (response) => {
        console.log('Response from addAvailability API is: ', response);
        this.isLoading = false;
        this.successMessage = 'Availability details added successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/doctor-landing']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error || 'Availability addition failed. Please try again.';
      }
    });
  }

  private createEmptySlot(): TimeSlot {
    return {
      startTime: '',
      endTime: ''
    };
  }

  private createDayAvailability(day: string): DayAvailability {
    return {
      day,
      isSelected: false,
      slots: [this.createEmptySlot()]
    };
  }

  private validateAvailabilityInfo(showError: boolean): boolean {
    const selectedDays = this.availabilityByDay.filter((day) => day.isSelected);
    if (selectedDays.length === 0) {
      if (showError) {
        this.errorMessage = 'Please select at least one available day.';
      }
      return false;
    }

    for (const day of selectedDays) {
      if (day.slots.length === 0) {
        if (showError) {
          this.errorMessage = `Please add at least one time slot for ${day.day}.`;
        }
        return false;
      }

      for (const slot of day.slots) {
        if (!slot.startTime || !slot.endTime) {
          if (showError) {
            this.errorMessage = `Please provide both start and end time for ${day.day}.`;
          }
          return false;
        }

        if (!this.isTimeRangeValid(slot.startTime, slot.endTime)) {
          if (showError) {
            this.errorMessage = `End time must be later than start time for ${day.day}.`;
          }
          return false;
        }
      }

      const overlap = this.findOverlappingSlots(day.slots);
      if (overlap) {
        if (showError) {
          this.errorMessage = `Overlapping time slots found for ${day.day} (slots ${overlap.firstSlotNumber} and ${overlap.secondSlotNumber}).`;
        }
        return false;
      }
    }

    return true;
  }

  private findOverlappingSlots(slots: TimeSlot[]): {
    firstSlotNumber: number;
    secondSlotNumber: number;
  } | null {
    const normalizedSlots: TimeSlotWithIndex[] = slots.map((slot, index) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      originalIndex: index
    }));

    normalizedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let index = 1; index < normalizedSlots.length; index++) {
      const previousSlot = normalizedSlots[index - 1];
      const currentSlot = normalizedSlots[index];

      if (currentSlot.startTime < previousSlot.endTime) {
        return {
          firstSlotNumber: previousSlot.originalIndex + 1,
          secondSlotNumber: currentSlot.originalIndex + 1
        };
      }
    }

    return null;
  }

  private buildAvailabilityPayload(): Array<{
    day: string;
    startTime: string;
    endTime: string;
    active: boolean;
  }> {
    return this.availabilityByDay
      .filter((day) => day.isSelected)
      .flatMap((day) =>
        day.slots.map((slot) => ({
          day: day.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          active: true
        }))
      );
  }
}
