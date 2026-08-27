import { Card, CardContent } from "@/components/ui/card";

import {
  FaBolt,
  FaBuilding,
  FaBullseye,
  FaChartLine,
  FaClipboardList,
  FaLaptop,
  FaQuestionCircle,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

import MyBadge from "@/components/MyBadge";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const HomeFeatures = () => {
  const msp = [
    {
      heading: "Online Tests",
      description: "From anywhere, anytime.",
      icon: FaLaptop,
    },
    {
      heading: "Instant Results",
      description: "Immediate evaluation and performance details.",
      icon: FaBolt,
    },
    {
      heading: "Secure and Fair",
      description: "Advanced protection and secure environment.",
      icon: FaShieldAlt,
    },
    {
      heading: "Analytics",
      description: "In-depth progress tracking.",
      icon: FaChartLine,
    },
  ];

  const features = [
    {
      heading: "100+",
      description: "Students Registered",
      icon: FaUsers,
    },
    {
      heading: "10+",
      description: "Quizzes Conducted",
      icon: FaClipboardList,
    },
    {
      heading: "99.9%",
      description: "Accuracy and reliability",
      icon: FaBullseye,
    },
    {
      heading: "4+",
      description: "Departments",
      icon: FaBuilding,
    },
  ];

  return (
    <section
      id="features"
      className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 md:py-24"
    >
      {/* ==================== STATS ==================== */}

      <Card
        className="
          overflow-hidden
          border-border/60
          bg-background/80
          shadow-sm
          backdrop-blur
        "
      >
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-x-0 sm:divide-x divide-y divide-border/60 md:grid-cols-4 md:divide-y-0">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.heading}
                  className="
                    group
                    flex
                    items-center
                    md:justify-center
                    gap-4
                    px-5
                    py-6
                    sm:px-7
                    md:px-6
                    md:py-7
                  "
                >
                  {/* Icon */}

                  <div
                    className="
                      flex
                      size-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-border/70
                      bg-muted/50
                      text-lg
                      text-muted-foreground
                      transition-all
                      duration-200
                      group-hover:border-primary/30
                      group-hover:bg-primary/10
                      group-hover:text-primary
                    "
                  >
                    <Icon />
                  </div>

                  {/* Text */}

                  <div className="min-w-0">
                    <p className="text-xl font-bold tracking-tight sm:text-2xl">
                      {feature.heading}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ==================== SECTION HEADING ==================== */}

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 pb-10 pt-20 text-center sm:pt-24">
        <MyBadge icon={FaQuestionCircle} label="Why Choose Quiznet?" />

        <h2
          className="
            text-3xl
            font-bold
            leading-tight
            tracking-tight
            sm:text-4xl
            md:text-5xl
          "
        >
          Everything you need for a{" "}
          <span className="text-primary">smooth experience</span>
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Take tests, get instant results, stay secure, and understand your
          performance — all from one simple platform.
        </p>
      </div>

      {/* ==================== FEATURE CAROUSEL ==================== */}

      <div className="relative px-8 sm:px-12 md:px-14">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 px-1 py-2">
            {msp.map((item) => {
              const Icon = item.icon;

              return (
                <CarouselItem
                  key={item.heading}
                  className="
                    basis-full
                    pl-4
                    sm:basis-1/2
                    lg:basis-1/3
                  "
                >
                  <Card
                    className="
                      group
                      h-full
                      min-h-[260px]
                      border-border/60
                      bg-background/80
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-primary/30
                      hover:shadow-lg
                    "
                  >
                    <CardContent
                      className="
                        flex
                        h-full
                        min-h-[260px]
                        flex-col
                        items-center
                        justify-center
                        px-6
                        py-8
                        text-center
                      "
                    >
                      {/* Icon */}

                      <div
                        className="
                          flex
                          size-14
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          border-border/70
                          bg-muted/50
                          text-xl
                          text-muted-foreground
                          transition-all
                          duration-300
                          group-hover:scale-105
                          group-hover:border-primary/30
                          group-hover:bg-primary/10
                          group-hover:text-primary
                        "
                      >
                        <Icon />
                      </div>

                      {/* Content */}

                      <div className="mt-6 flex flex-col items-center gap-2">
                        <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                          {item.heading}
                        </h3>

                        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      {/* Bottom accent */}

                      <div
                        className="
                          mt-6
                          h-1
                          w-8
                          rounded-full
                          bg-primary/20
                          transition-all
                          duration-300
                          group-hover:w-12
                          group-hover:bg-primary
                        "
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* ==================== CAROUSEL CONTROLS ==================== */}

          <CarouselPrevious
            className="
              -left-5
              size-9
              border-border/70
              bg-background
              shadow-sm
              transition-all
              hover:bg-accent
              sm:-left-6
              md:-left-7
            "
          />

          <CarouselNext
            className="
              -right-5
              size-9
              border-border/70
              bg-background
              shadow-sm
              transition-all
              hover:bg-accent
              sm:-right-6
              md:-right-7
            "
          />
        </Carousel>
      </div>
    </section>
  );
};

export default HomeFeatures;
