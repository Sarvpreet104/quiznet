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
      description: "From anywhere, anytime.",
      icon: FaLaptop,
    },
    {
      heading: "Instant Results",
      description: "Immediate evaluation.",
      icon: FaBolt,
    },
    {
      heading: "Analytics",
      description: "In-depth progress tracking.",
      icon: FaChartLine,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
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
            Welcome <span className="text-primary">Back</span>
          </h2>

          <p className="description-text">
            Log in to access your quizzes and track your performance.
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

        {/* login card */}
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
            <CardTitle>Login to Quiznet</CardTitle>
            <CardDescription>
              Enter your email and password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <LoginForm />
          </CardContent>

          <CardFooter>
            <p className="w-full text-center">
              Don't have any account?{" "}
              <span>
                <Link
                  href={"/register"}
                  className="text-blue-400 hover:text-primary transition-all duration-300 ease-in-out hover:underline"
                >
                  Register
                </Link>
              </span>{" "}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
