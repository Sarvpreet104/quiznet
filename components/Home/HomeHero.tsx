import { Card, CardContent } from "@/components/ui/card";
import LoginOptions from "@/components/Buttons/LoginOptions";
import { getCurrentUser } from "@/lib/auth";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

import { Plus } from "lucide-react";
import { FaStar } from "react-icons/fa";

import MyBadge from "../MyBadge";

const HomeHero = async () => {
  const user = await getCurrentUser();

  return (
    <section className="relative overflow-hidden">
      {/* ==================== BACKGROUND DECORATION ==================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          -z-10
          flex
          justify-center
          overflow-hidden
        "
      >
        <div
          className="
            h-[420px]
            w-[700px]
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />
      </div>

      {/* ==================== HERO ==================== */}

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 md:py-24">
        <Card
          className="
            relative
            overflow-hidden
            border-border/60
            bg-background/80
            shadow-sm
            backdrop-blur
          "
        >
          {/* subtle card decoration */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-32
              -top-32
              size-72
              rounded-full
              bg-primary/10
              blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-40
              -left-40
              size-80
              rounded-full
              bg-primary/5
              blur-3xl
            "
          />

          <CardContent className="relative px-6 py-12 sm:px-10 sm:py-16 md:px-16 md:py-20">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              {/* ==================== BADGE ==================== */}

              <MyBadge icon={FaStar} label="Better Tests. Better Futures." />

              {/* ==================== HEADING ==================== */}

              <h1
                className="
                  mt-6
                  max-w-3xl
                  text-4xl
                  font-bold
                  leading-[1.1]
                  tracking-tight
                  sm:text-5xl
                  md:text-6xl
                  lg:text-7xl
                "
              >
                Online Tests Made <span className="text-primary">Simple</span>
              </h1>

              {/* ==================== DESCRIPTION ==================== */}

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-base
                  leading-7
                  text-muted-foreground
                  sm:text-lg
                "
              >
                Quiznet is an online class test platform for students. Attempt
                quizzes, track your performance and achieve your goals.
              </p>

              {/* ==================== CTA ==================== */}

              <div
                className="
                  mt-8
                  flex
                  w-full
                  max-w-md
                  flex-col
                  gap-3
                  sm:mt-10
                  sm:w-auto
                  sm:flex-row
                  sm:items-center
                  sm:justify-center
                "
              >
                <LoginOptions user={user} />
              </div>

              {/* ==================== SOCIAL PROOF ==================== */}

              <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row">
                <AvatarGroup>
                  <Avatar size="default">
                    <AvatarImage
                      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimgcdn.stablediffusionweb.com%2F2026%2F3%2F17%2F4595be2f-10fb-4a70-9a40-51631d1af12e.webp&f=1&nofb=1&ipt=132afde490c5f705344988f7d562885f705df561c2b50f541f0b232b0be1c9bf"
                      alt="Student"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <Avatar size="default">
                    <AvatarImage
                      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpbs.twimg.com%2Fmedia%2FEeUI99bUcAMiRFa.jpg%3Alarge&f=1&nofb=1&ipt=7f28270edd21f1be8641b42b8ab8229995162245fbae9a6c58dfbc7461ebf4e4"
                      alt="Student"
                    />
                    <AvatarFallback>LR</AvatarFallback>
                  </Avatar>

                  <Avatar size="default">
                    <AvatarImage
                      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2F736x%2F8c%2F11%2Fdd%2F8c11dd4a7110a437722370c4663f80ec.jpg&f=1&nofb=1&ipt=52cfd40483181f75a61a60f255dea7435963c9061d9868922d335921affded46"
                      alt="Student"
                    />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>

                  <AvatarGroupCount>
                    <Plus />
                  </AvatarGroupCount>
                </AvatarGroup>

                <div className="flex flex-col text-center sm:text-left">
                  <span className="text-sm font-semibold">
                    Join 100+ students
                  </span>

                  <span className="text-xs text-muted-foreground">
                    across the college
                  </span>
                </div>
              </div>

              {/* ==================== TRUST LINE ==================== */}

              <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-1.5 rounded-full bg-primary" />
                <span>Simple. Fast. Built for students.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HomeHero;
