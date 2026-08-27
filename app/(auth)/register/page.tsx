import SecondaryButton from "@/components/Buttons/SecondaryButton";

import {
  FaArrowLeft,
  FaStar,
  FaGraduationCap,
  FaChartBar,
  FaLock,
} from "react-icons/fa";

import Image from "next/image";
import Link from "next/link";

import logo from "@/public/images/home-page/quiznet-logo.png";

import MyBadge from "@/components/MyBadge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import RegisterForm from "@/components/Auth/RegisterForm";

const Register = () => {
  const features = [
    {
      heading: "Easy and Fast",
      description: "Create your account in less than a minute.",
      icon: FaGraduationCap,
    },
    {
      heading: "Secure and Private",
      description: "Your personal data stays protected and private.",
      icon: FaLock,
    },
    {
      heading: "Smart Analytics",
      description: "Track your performance and improve continuously.",
      icon: FaChartBar,
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
              Create Your <span className="text-primary">Account</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Get started with QuizNet and access quizzes, assessments, results,
              and performance insights in one place.
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

          {/* ==================== REGISTER CARD ==================== */}

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
                  <CardTitle className="text-2xl">
                    Create your account
                  </CardTitle>

                  <CardDescription className="text-sm leading-6">
                    Fill in the details below to get started with QuizNet.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <RegisterForm />
              </CardContent>

              <CardFooter className="border-t border-border/50 pt-6">
                <p className="w-full text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="
                      font-medium
                      text-primary
                      transition-colors
                      hover:text-primary/80
                      hover:underline
                      underline-offset-4
                    "
                  >
                    Log in
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

export default Register;
