import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/home-page/quiznet-logo.png";
import { getCurrentUser } from "@/lib/auth";
import { MdSocialDistance } from "react-icons/md";
import { Separator } from "../ui/separator";

const HomeFooter = async () => {
  const user = await getCurrentUser();
  const is_admin = user?.is_admin;

  const footerLinks = [
    {
      name: "Company",
      links: [
        { label: "Home", href: "/" },
        {
          label: "Dashboard",
          href: is_admin ? "/admin/dashboard" : "/dashboard",
        },
        {
          label: "Quizzes",
          href: is_admin ? "/admin/quizzes" : "/dashboard/quizzes",
        },
        {
          label: "Result",
          href: is_admin ? "/admin/dashboard" : "/dashboard/results",
        },
      ],
    },
    {
      name: "Policy",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
    {
      name: "Social",
      links: [
        { label: "Instagram", href: "https://www.instagram.com" },
        { label: "Linkedin", href: "https://www.linkedin.com" },
        { label: "Github", href: "https://www.github.com" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border flex flex-col justify-center items-center py-10 px-4">
      <div className="mycontainer flex flex-col gap-6">
        {/* main content */}
        <div className="flex flex-col md:flex-row gap-20 justify-between items-center">
          {/* branding */}
          <div className="flex flex-col">
            <div className="relative w-20 h-20">
              <Image
                src={logo}
                alt="Quiznet Logo"
                fill
                placeholder="blur"
                className="object-cover object-center scale-200"
              />
            </div>
            <div className="text-3xl font-bold">Quiznet</div>
          </div>

          {/* links container */}
          <div className="flex flex-wrap gap-4 md:gap-4 w-full justify-around md:justify-end text-center md:text-left">
            {footerLinks.map((category) => {
              return (
                // link category
                <div
                  className="basis-32 flex flex-col gap-2"
                  key={category.name}
                >
                  {/* category heading */}
                  <div className="text-lg font-semibold px-2 text-foreground">
                    {category.name}
                  </div>
                  {/* category links */}
                  <div className="flex flex-col">
                    {category.links.map((link) => {
                      return (
                        <Link
                          href={link.href}
                          className="text-base text-muted-foreground hover:text-foreground active:text-foreground transition-all duration-300 ease-in-out px-2 py-1"
                          key={link.label}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* main content ends here */}

        {/* seperator */}
        <Separator />

        {/* watermark */}
        <div className="text-sm text-muted-foreground text-center">
          Made with &#128151; by Sarvpreet Singh.
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
