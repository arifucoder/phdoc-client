// backend reviewPublicInclude: patient-এর শুধু নাম আর ছবি (email/phone কখনো না)
export interface IReview {
	id: string;
	rating: number;
	comment: string | null;
	createdAt: string;
	patient: {
		name: string;
		profilePhoto: string | null;
	};
}
