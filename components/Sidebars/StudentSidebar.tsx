"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Trophy,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { logoutUser } from "@/app/actions/auth";

const mainNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quizzes",
    href: "/dashboard/quizzes",
    icon: BookOpenCheck,
  },
  {
    title: "Results",
    href: "/dashboard/results",
    icon: Trophy,
  },
];

const StudentSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-border/60"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <SidebarHeader className="border-b border-border/60 p-3">
        <div
          className="
            flex items-center gap-3 rounded-xl px-2 py-2
            group-data-[collapsible=icon]:justify-center
            group-data-[collapsible=icon]:px-0
          "
        >
          {/* Logo */}
          <div
            className="
              flex size-9 shrink-0 items-center justify-center
              rounded-xl bg-primary text-primary-foreground
              shadow-sm
            "
          >
            <GraduationCap className="size-5" />
          </div>

          {/* Brand */}
          <div
            className="
              flex min-w-0 flex-col
              group-data-[collapsible=icon]:hidden
            "
          >
            <span className="truncate text-sm font-bold tracking-tight">
              QUIZNET
            </span>

            <span className="text-[11px] font-medium text-muted-foreground">
              Student Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ================================================== */}
      {/* CONTENT */}
      {/* ================================================== */}

      <SidebarContent className="px-0 py-4">
        {/* ================================================== */}
        {/* MAIN NAVIGATION */}
        {/* ================================================== */}

        <SidebarGroup>
          <SidebarGroupLabel
            className="
              px-3
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-muted-foreground
              group-data-[collapsible=icon]:hidden
            "
          >
            Overview
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="
                        h-10
                        w-full
                        rounded-xl
                        px-3
                        transition-all
                        duration-200
                        hover:bg-accent
                        hover:text-accent-foreground
                        data-[active=true]:bg-primary
                        data-[active=true]:font-medium
                        data-[active=true]:text-primary-foreground
                        data-[active=true]:shadow-sm
                        group-data-[collapsible=icon]:mx-auto
                        group-data-[collapsible=icon]:size-10
                        group-data-[collapsible=icon]:px-0
                      "
                    >
                      <Link
                        href={item.href}
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          gap-2
                          group-data-[collapsible=icon]:justify-center
                          group-data-[collapsible=icon]:gap-0
                        "
                      >
                        <Icon
                          className="
                            size-4
                            shrink-0
                            stroke-[2]
                          "
                        />

                        <span
                          className="
                            truncate
                            group-data-[collapsible=icon]:hidden
                          "
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ================================================== */}
        {/* STUDENT INFO */}
        {/* ================================================== */}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <div
              className="
                rounded-xl
                border
                border-border/60
                bg-muted/40
                p-3
                group-data-[collapsible=icon]:hidden
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    size-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <GraduationCap className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold">Student Portal</p>

                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                    Take quizzes, track your progress and view your results.
                  </p>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}

      <SidebarFooter className="border-t border-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logoutUser} className="w-full">
              <SidebarMenuButton
                type="submit"
                tooltip="Logout"
                className="
                  h-10
                  w-full
                  rounded-xl
                  px-3
                  text-destructive
                  transition-colors
                  hover:bg-destructive/10
                  hover:text-destructive
                  group-data-[collapsible=icon]:mx-auto
                  group-data-[collapsible=icon]:size-10
                  group-data-[collapsible=icon]:justify-center
                  group-data-[collapsible=icon]:px-0
                "
              >
                <LogOut className="size-4 shrink-0 stroke-[2]" />

                <span className="group-data-[collapsible=icon]:hidden">
                  Logout
                </span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default StudentSidebar;
