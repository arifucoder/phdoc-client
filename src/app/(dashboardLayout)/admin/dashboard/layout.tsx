export default function AdminDashboardLayout({ children }: LayoutProps<"/admin/dashboard">) {
	return (
		<div>
			<h1>This is AdminDashboardLayout component</h1>
			{children}
		</div>
	);
}
