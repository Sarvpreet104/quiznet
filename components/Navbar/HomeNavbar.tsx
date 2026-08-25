import { homeNavLinks } from "./data";
import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import logo from "@/public/images/home-page/quiznet-logo.png";

import LoginOptions from "../Buttons/LoginOptions";
import { getCurrentUser } from "@/lib/auth";
import { ModeToggle } from "../ModeToggle";

const HomeNavbar = async () => {
  const user = await getCurrentUser();

  return (
    // sticky top-0 left-0 right-0 z-50
    <nav className="flex gap-4 justify-between items-center py-2 px-4 max-w-7xl mx-auto w-full h-16 max-h-16">
      <Link href={"/"} className="flex justify-center items-center gap-2">
        <div className="relative w-[50px] h-[50px]">
          <Image
            src={logo}
            alt="Quiznet Logo"
            placeholder="blur"
            fill
            className="scale-200 object-center object-cover"
          />
        </div>
        <div className="text-foreground text-2xl font-bold">Quiznet</div>
      </Link>

      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList className="gap-1">
            {homeNavLinks.map((link) => (
              <NavigationMenuItem key={link.name}>
                <NavigationMenuLink asChild>
                  <Link href={link.href}>{link.name}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="hidden md:flex gap-2 items-center justify-center content-center">
        <ModeToggle />
        <LoginOptions user={user} />
      </div>

      <div className="md:hidden flex gap-2 justify-center items-center content-center">
        <ModeToggle />

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                {homeNavLinks.map((link) => (
                  <NavigationMenuLink asChild key={link.href}>
                    <Link href={link.href}>{link.name}</Link>
                  </NavigationMenuLink>
                ))}
                <NavigationMenuLink asChild>
                  <Link href={"/login"}>Login</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href={"/register"}>Register</Link>
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default HomeNavbar;
