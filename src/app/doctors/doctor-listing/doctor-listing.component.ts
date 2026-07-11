import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';

// interface any {
// 	id: number;
// 	firstName: string;
// 	lastName: string;
// 	gender: string;
// 	specializations: string[];
// 	yearsOfExperience: number;
// 	consultationFee: number;
// 	medicalLicenseNumber: string;
// 	languages: string[];
// 	clinicAddress: string;
// 	city: string;
// }

@Component({
	selector: 'app-doctor-listing',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './doctor-listing.component.html',
	styleUrl: './doctor-listing.component.css'
})
export class DoctorListingComponent implements OnInit {

	constructor(private doctorService: DoctorService) { }

	searchText = '';
	selectedDoctorId: number | null = null;
	sortBy = 'recommended';
	maxConsultationFee = 1800;

	selectedSpecialities: string[] = [];
	selectedLanguages: string[] = [];
	selectedGender: string[] = [];

	readonly specialities = [
		'General Physician',
		'Pediatrics',
		'Dermatology',
		'Gynecology'
	];

	readonly languages = ['English', 'Hindi', 'Punjabi', 'Marathi', 'Kannada', 'Telugu', 'Tamil', 'Bengali', 'Malayalam'];
	readonly genderOptions = ['Male', 'Female'];

	doctors: any[] = [];

	ngOnInit(): void {
		this.doctorService.getAllDoctors().subscribe(
			(res: any[]) => {
				this.doctors = res;
				console.log("doctor list: ", res);
			},
			(error) => {
				console.log("Error occured: ", error);
			});
	}

	readonly sortOptions = [
		{ value: 'recommended', label: 'Recommended' },
		{ value: 'experience-asc', label: 'Experience: Low to High' },
		{ value: 'experience-desc', label: 'Experience: High to Low' },
		{ value: 'fee-asc', label: 'Consultation Fee: Low to High' },
		{ value: 'fee-desc', label: 'Consultation Fee: High to Low' }
	];

	get highestConsultationFee(): number {
		return Math.max(...this.doctors.map((doctor) => doctor.consultationFee));
	}

	get filteredDoctors(): any[] {
		const normalizedSearch = this.searchText.trim().toLowerCase();

		const filtered = this.doctors.filter((doctor) => {
			const matchesSearch =
				!normalizedSearch ||
				doctor.firstName.toLowerCase().includes(normalizedSearch) ||
				doctor.lastName.toLowerCase().includes(normalizedSearch) ||
				doctor.clinicAddress.toLowerCase().includes(normalizedSearch);

			const matchesSpeciality =
				this.selectedSpecialities.length === 0 ||
				this.selectedSpecialities.some((speciality) => doctor.specializations.includes(speciality));

			const matchesLanguage =
				this.selectedLanguages.length === 0 ||
				this.selectedLanguages.some((language) => doctor.languages.includes(language));

			// Gender data is intentionally not part of static cards yet.
			const matchesGender = this.selectedGender.length === 0 || this.selectedGender.length > 0;
			const matchesConsultationFee = doctor.consultationFee <= this.maxConsultationFee;

			return matchesSearch && matchesSpeciality && matchesLanguage && matchesGender && matchesConsultationFee;
		});

		return this.sortDoctors(filtered);
	}

	private sortDoctors(doctors: any[]): any[] {
		const sortedDoctors = [...doctors];

		switch (this.sortBy) {
			case 'experience-asc':
				sortedDoctors.sort((a, b) => a.yearsOfExperience - b.yearsOfExperience);
				break;
			case 'experience-desc':
				sortedDoctors.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
				break;
			case 'fee-asc':
				sortedDoctors.sort((a, b) => a.consultationFee - b.consultationFee);
				break;
			case 'fee-desc':
				sortedDoctors.sort((a, b) => b.consultationFee - a.consultationFee);
				break;
		}

		return sortedDoctors;
	}

	toggleSelection(value: string, selectedValues: string[]): void {
		const valueIndex = selectedValues.indexOf(value);

		if (valueIndex === -1) {
			selectedValues.push(value);
			return;
		}

		selectedValues.splice(valueIndex, 1);
	}

	clearAllFilters(): void {
		this.searchText = '';
		this.sortBy = 'recommended';
		this.maxConsultationFee = this.highestConsultationFee;
		this.selectedSpecialities = [];
		this.selectedLanguages = [];
		this.selectedGender = [];
	}

	onBook(doctor: any): void {
		this.selectedDoctorId = doctor.id;
	}
}
