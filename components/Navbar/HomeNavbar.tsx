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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        {/* ==================== LOGO ==================== */}

        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="relative size-12">
            <Image
              src={logo}
              alt="QuizNet Logo"
              fill
              placeholder="blur"
              className="object-contain scale-250"
            />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight">Quiznet</span>
          </div>
        </Link>

        {/* ==================== DESKTOP NAVIGATION ==================== */}

        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {homeNavLinks.map((link) => (
                <NavigationMenuItem key={link.name}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className="
                        inline-flex
                        h-9
                        items-center
                        justify-center
                        rounded-lg
                        px-4
                        text-sm
                        font-medium
                        text-muted-foreground
                        transition-all
                        duration-200
                        hover:bg-accent
                        hover:text-foreground
                      "
                    >
                      {link.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ==================== DESKTOP ACTIONS ==================== */}

        <div className="hidden items-center gap-2 md:flex">
          <ModeToggle />

          <div className="h-6 w-px bg-border/70" />

          <LoginOptions user={user} />
        </div>

        {/* ==================== MOBILE ACTIONS ==================== */}

        <div className="flex items-center gap-4 md:hidden">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9 rounded-lg px-3 text-sm">
                  Menu
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="grid w-[220px] gap-1 p-2">
                    {homeNavLinks.map((link) => (
                      <NavigationMenuLink asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="
                            flex
                            h-10
                            items-center
                            rounded-lg
                            px-3
                            text-sm
                            font-medium
                            text-muted-foreground
                            transition-colors
                            hover:bg-accent
                            hover:text-foreground
                          "
                        >
                          {link.name}
                        </Link>
                      </NavigationMenuLink>
                    ))}

                    <div className="my-1 h-px bg-border/70" />

                    <NavigationMenuLink asChild>
                      <Link
                        href="/login"
                        className="
                          flex
                          h-10
                          items-center
                          rounded-lg
                          px-3
                          text-sm
                          font-medium
                          transition-colors
                          hover:bg-accent
                        "
                      >
                        Login
                      </Link>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <Link
                        href="/register"
                        className="
                          flex
                          h-10
                          items-center
                          rounded-lg
                          bg-primary
                          px-3
                          text-sm
                          font-medium
                          text-primary-foreground
                          transition-opacity
                          hover:opacity-90
                        "
                      >
                        Register
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <ModeToggle />
        </div>
      </nav>
    </header>
  );
};

export default HomeNavbar;
