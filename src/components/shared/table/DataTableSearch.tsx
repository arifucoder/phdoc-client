"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DataTableSearchProps {
	value: string; // URL-এর মান
	onChange: (value: string) => void; // অবশ্যই stable (useCallback) হতে হবে
	placeholder?: string;
	debounceMs?: number;
}

export default function DataTableSearch({
	value,
	onChange,
	placeholder = "Search...",
	debounceMs = 400,
}: DataTableSearchProps) {
	const [inputValue, setInputValue] = useState(value);
	const [syncedValue, setSyncedValue] = useState(value);

	// URL বাইরে থেকে বদলালে (যেমন "Reset") input-ও মিলিয়ে নেওয়া।
	// React-এর নিয়ম: prop থেকে state ঠিক করতে effect না, render-এর সময়েই।
	if (value !== syncedValue) {
		setSyncedValue(value);
		setInputValue(value);
	}

	// টাইপ থামার debounceMs পরে একবারই URL বদলায় (প্রতি অক্ষরে API call হয় না)
	useEffect(() => {
		const trimmed = inputValue.trim();
		if (trimmed === value) return;

		const timer = setTimeout(() => onChange(trimmed), debounceMs);
		return () => clearTimeout(timer);
	}, [inputValue, value, onChange, debounceMs]);

	return (
		<div className="relative w-full sm:max-w-xs">
			<Search
				className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden
			/>
			<Input
				type="search"
				value={inputValue}
				onChange={(event) => setInputValue(event.target.value)}
				placeholder={placeholder}
				aria-label={placeholder}
				className="pl-8"
			/>
		</div>
	);
}
