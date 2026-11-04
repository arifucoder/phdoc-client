export interface IDoctor {
	id: string;
	name: string;
	email: string;
	profilePhoto?: string;
	appointmentFee: number;
	designation: string;
	currentWorkingPlace: string;
	experience: number;
	averageRating: number;
	specialties: Array<{
		specialty: { id: string; title: string };
	}>;
}
