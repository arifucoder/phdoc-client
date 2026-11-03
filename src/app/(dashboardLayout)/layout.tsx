export default function DashboardLayout({ children }: LayoutProps<"/">) {
	return (
		<div>
			<h1>This is DashboardLayout component</h1>
			{children}
		</div>
	);
}
