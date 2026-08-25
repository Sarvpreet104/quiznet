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
      description: "Your data is safe with enterprise-grade security.",
      icon: FaLock,
    },
    {
      heading: "Smart Analytics",
      description: "Track your performance and improve continuously.",
      icon: FaChartBar,
    },
  ];

  return (
    <div className="max-w-7xl w-full min-h-screen mx-auto px-4 py-4 flex flex-col justify-center content-center">
      {/* go home */}
      <div>
        <SecondaryButton
          name="Home"
          href="/"
          icon={FaArrowLeft}
          className="flex-row-reverse"
        />
      </div>

      {/* main */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-10">
        {/* content */}
        <div className="order-1 md:order-0 flex flex-col gap-4">
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

          <MyBadge
            icon={FaStar}
            label="Join 100+ students across the college"
          />

          <h2 className="order-two-heading">
            Create Your <span className="text-primary">Account</span>
          </h2>

          <p className="description-text">
            Get started with Quiznet and access all available quizzes and tests.
          </p>

          <Card>
            <CardContent className="flex flex-col gap-4">
              {features.map((feature) => {
                return (
                  <div className="flex gap-4" key={feature.heading}>
                    <div className="flex justify-center items-center content-center rounded-full size-12 shrink-0 overflow-hidden bg-secondary border border-border text-2xl text-foreground">
                      {<feature.icon />}
                    </div>

                    <div className="flex flex-col gap-1">
                      <h4 className="order-four-heading">{feature.heading}</h4>

                      <p className="description-text">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* register card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src={logo}
                  alt="Quiznet Logo"
                  fill
                  placeholder="blur"
                  className="object-cover object-center scale-150"
                />
              </div>
              <div className="text-2xl font-bold">Quiznet</div>
            </div>
            <CardTitle>Register Account</CardTitle>
            <CardDescription>
              Make your account for Quiznet by filling following details.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <RegisterForm />
          </CardContent>

          <CardFooter>
            <p className="w-full text-center">
              Already have an account?{" "}
              <span>
                <Link
                  href={"/login"}
                  className="text-blue-400 hover:text-primary transition-all duration-300 ease-in-out hover:underline"
                >
                  Login
                </Link>
              </span>{" "}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
