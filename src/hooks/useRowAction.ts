"use client";

import { useCallback, useMemo, useState } from "react";

export type RowActionType = "view" | "edit" | "delete";

interface RowActionState<TData> {
	type: RowActionType;
	row: TData;
	open: boolean;
}

// একটাই state: "কোন row-এ কোন কাজ"। একসাথে দুটো dialog খোলা থাকা অসম্ভব।
export function useRowAction<TData>() {
	const [state, setState] = useState<RowActionState<TData> | null>(null);

	// setState stable, তাই actions-ও stable থাকে → DataTable-এর columns বারবার নতুন হয় না
	const actions = useMemo(
		() => ({
			onView: (row: TData) => setState({ type: "view", row, open: true }),
			onEdit: (row: TData) => setState({ type: "edit", row, open: true }),
			onDelete: (row: TData) => setState({ type: "delete", row, open: true }),
		}),
		[],
	);

	// বন্ধ করার সময় row রেখে দিই: close animation চলাকালীন content হারায় না
	const close = useCallback(() => setState((prev) => (prev ? { ...prev, open: false } : prev)), []);

	// নির্দিষ্ট dialog-এর জন্য props: <ViewDialog {...dialogProps("view")} />
	const dialogProps = useCallback(
		(type: RowActionType) => ({
			row: state?.type === type ? state.row : null,
			open: state?.type === type && state.open,
			onOpenChange: (open: boolean) => {
				if (!open) close();
			},
		}),
		[state, close],
	);

	return { actions, close, dialogProps };
}
