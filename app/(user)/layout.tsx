import StudentSidebar from "@/components/Sidebars/StudentSidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <StudentSidebar />

        <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col bg-background">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="size-10 rounded-xl border border-border bg-background shadow-sm transition hover:bg-accent" />

              <div className="hidden h-6 w-px bg-border sm:block" />

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  Student Dashboard
                </p>

                <p className="text-xs text-muted-foreground">
                  Test your knowledge and track your progress
                </p>
              </div>
            </div>

            <ModeToggle />
          </header>

          <main className="flex-1 overflow-x-hidden">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
