import Image from "next/image";
import logo from "@/public/images/home-page/quiznet-logo.png";
import { Separator } from "../ui/separator";
import { GraduationCap } from "lucide-react";

const HomeFooter = () => {
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:py-14">
        {/* Main footer content */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Branding */}
          <div className="flex max-w-md flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-primary/10">
                <Image
                  src={logo}
                  alt="Quiznet Logo"
                  fill
                  placeholder="blur"
                  className="scale-150 object-cover object-center"
                />
              </div>

              {/* Name */}
              <div>
                <h2 className="text-xl font-bold tracking-tight">Quiznet</h2>

                <p className="text-xs font-medium text-muted-foreground">
                  Online testing platform
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              A simple and reliable platform for conducting online tests,
              attempting quizzes, and tracking student performance.
            </p>
          </div>

          {/* Right-side info */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 shadow-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="size-4" />
              </span>

              <span className="text-sm font-medium">Built for students</span>
            </div>

            <p className="text-center text-xs text-muted-foreground md:text-right">
              Learn. Practice. Improve.
            </p>
          </div>
        </div>

        {/* Divider */}
        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Quiznet. All rights reserved.
          </p>

          <p className="text-xs text-muted-foreground">
            Made with{" "}
            <span className="mx-1 text-red-500" aria-label="love" role="img">
              ♥
            </span>{" "}
            by Sarvpreet Singh.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
