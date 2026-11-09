import Footer from "@/components/shared/Footer/Footer";
import Navbar from "@/components/shared/Navbar/Navbar";

export default function CommonLayout({ children }: LayoutProps<"/">) {
	return (
		<>
			<Navbar />
			<main className="flex-1">{children}</main>
			<Footer />
		</>
	);
}
