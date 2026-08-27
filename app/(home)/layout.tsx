import HomeNavbar from "@/components/Navbar/HomeNavbar";
import HomeFooter from "@/components/Footer/HomeFooter";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeNavbar />

      <main>{children}</main>

      <HomeFooter />
    </div>
  );
}
