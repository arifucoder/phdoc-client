import StarRating from "@/components/shared/StarRating";
import DateCell from "@/components/shared/table/cells/DateCell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/formatters";
import type { IReview } from "@/types/review.types";

interface DoctorReviewsProps {
	reviews: IReview[] | null; // null = load হয়নি (page ভাঙে না, শুধু এই অংশে message)
	total: number;
}

export default function DoctorReviews({ reviews, total }: DoctorReviewsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Patient reviews</CardTitle>
				{total > 0 && (
					<CardDescription>
						{total} {total === 1 ? "review" : "reviews"}
						{reviews && total > reviews.length && ` · showing latest ${reviews.length}`}
					</CardDescription>
				)}
			</CardHeader>

			<CardContent>
				{reviews === null ? (
					<p className="text-sm text-muted-foreground">Reviews couldn&apos;t be loaded right now.</p>
				) : reviews.length === 0 ? (
					<p className="text-sm text-muted-foreground">No reviews yet.</p>
				) : (
					<ul className="divide-y">
						{reviews.map((review) => (
							<li key={review.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
								<Avatar className="size-9">
									{review.patient.profilePhoto && <AvatarImage src={review.patient.profilePhoto} alt="" />}
									<AvatarFallback className="text-xs">{getInitials(review.patient.name)}</AvatarFallback>
								</Avatar>

								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<p className="text-sm font-medium">{review.patient.name}</p>
										<span className="text-xs text-muted-foreground">
											<DateCell value={review.createdAt} />
										</span>
									</div>
									<StarRating value={review.rating} />
									{review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
