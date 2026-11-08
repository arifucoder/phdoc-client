// timeZone fixed: server (UTC) আর browser (ঢাকা)-এ একই তারিখ দেখায়
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	timeZone: "Asia/Dhaka",
});

export default function DateCell({ value }: { value: string | null | undefined }) {
	const date = value ? new Date(value) : null;

	// ভুল তারিখে Intl RangeError throw করে, তাই আগেই check
	if (!date || Number.isNaN(date.getTime())) {
		return <span className="text-muted-foreground">—</span>;
	}

	return (
		<time dateTime={value ?? undefined} className="whitespace-nowrap">
			{dateFormatter.format(date)}
		</time>
	);
}
