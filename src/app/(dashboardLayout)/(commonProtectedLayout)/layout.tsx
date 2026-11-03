export default function CommonProtectedLayout({ children }: LayoutProps<"/">) {
	return (
		<div>
			<h1>This is CommonProtectedLayout component</h1>
			{children}
		</div>
	);
}
