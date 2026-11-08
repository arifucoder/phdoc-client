// locale fixed: server আর browser-এ একই output (hydration mismatch হয় না)
const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "BDT",
	currencyDisplay: "narrowSymbol", // "৳1,500"
	maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

export const formatCurrency = (amount: number) => currencyFormatter.format(amount);
export const formatNumber = (value: number) => numberFormatter.format(value);

// "Dr. John Doe" → "JD"
export const getInitials = (name: string) =>
	name
		.replace(/^dr\.?\s*/i, "")
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase())
		.join("");
