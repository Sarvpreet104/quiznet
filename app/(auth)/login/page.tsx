import Link from "next/link";
import Image from "next/image";

import {
  FaStar,
  FaLaptop,
  FaBolt,
  FaChartLine,
  FaArrowLeft,
} from "react-icons/fa";

import logo from "@/public/images/home-page/quiznet-logo.png";

import SecondaryButton from "@/components/Buttons/SecondaryButton";
import MyBadge from "@/components/MyBadge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LoginForm from "@/components/Auth/LoginForm";

const Login = () => {
  const features = [
    {
      heading: "Online Tests",
      description: "Take assessments from anywhere, anytime.",
      icon: FaLaptop,
    },
    {
      heading: "Instant Results",
      description: "Get your results immediately after completing a quiz.",
      icon: FaBolt,
    },
    {
      heading: "Smart Analytics",
      description: "Track your performance and see where you can improve.",
      icon: FaChartLine,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <div className="flex shrink-0">
          <SecondaryButton
            name="Home"
            href="/"
            icon={FaArrowLeft}
            className="flex-row-reverse"
          />
        </div>

        {/* Main content */}
        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-2 lg:gap-20">
          {/* ==================== LEFT CONTENT ==================== */}

          <section className="order-2 flex flex-col justify-center lg:order-1">
            {/* Logo */}
            <div className="mb-6 flex flex-col">
              <div className="relative size-20">
                <Image
                  src={logo}
                  alt="QuizNet Logo"
                  fill
                  placeholder="blur"
                  className="object-contain scale-200"
                />
              </div>

              <span className="text-3xl font-bold tracking-tight">QuizNet</span>
            </div>

            {/* Badge */}
            <div className="mb-5">
              <MyBadge
                icon={FaStar}
                label="Join 100+ students across the college"
              />
            </div>

            {/* Heading */}
            <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome <span className="text-primary">Back</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Log in to access your quizzes, view your results, and keep track
              of your academic progress.
            </p>

            {/* Features */}
            <div className="mt-8 grid gap-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.heading}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-border/60
                      bg-card/60
                      p-4
                      backdrop-blur-sm
                      transition-all
                      duration-200
                      hover:border-primary/30
                      hover:bg-card
                      hover:shadow-sm
                    "
                  >
                    <div
                      className="
                        flex
                        size-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-border/60
                        bg-secondary
                        text-foreground
                        transition-colors
                        group-hover:bg-primary
                        group-hover:text-primary-foreground
                      "
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold">{feature.heading}</h3>

                      <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ==================== LOGIN CARD ==================== */}

          <section className="order-1 flex justify-center lg:order-2">
            <Card
              className="
                w-full
                max-w-md
                border-border/60
                bg-card/90
                shadow-xl
                shadow-black/5
                backdrop-blur-xl
                dark:shadow-black/20
              "
            >
              <CardHeader className="space-y-5 pb-6">
                {/* Card logo */}
                <div className="flex flex-col">
                  <div className="relative size-14">
                    <Image
                      src={logo}
                      alt="QuizNet Logo"
                      fill
                      placeholder="blur"
                      className="object-contain scale-200"
                    />
                  </div>

                  <span className="text-xl font-bold tracking-tight">
                    QuizNet
                  </span>
                </div>

                <div className="space-y-1.5">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>

                  <CardDescription className="text-sm leading-6">
                    Enter your credentials below to access your account.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <LoginForm />
              </CardContent>

              <CardFooter className="border-t border-border/50 pt-6">
                <p className="w-full text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="
                      font-medium
                      text-primary
                      transition-colors
                      hover:text-primary/80
                      hover:underline
                      underline-offset-4
                    "
                  >
                    Create one
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;
