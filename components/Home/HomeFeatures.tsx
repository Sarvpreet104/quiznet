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
    <div className="max-w-7xl w-full mx-auto px-4 py-4" id="features">
      {/* features */}
      <Card className="px-4 py-8">
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {features.map((feature) => {
            return (
              <div className="flex gap-4" key={feature.heading}>
                <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-2xl shrink-0 overflow-hidden">
                  {<feature.icon />}
                </div>

                <div className="flex flex-col">
                  <h4 className="order-four-heading">{feature.heading}</h4>
                  <p className="text-sm">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      {/* features end here */}

      {/* content heading */}
      <div className="flex flex-col gap-6 justify-center items-center pt-14 pb-10">
        <MyBadge icon={FaQuestionCircle} label="Why Choose Quiznet?" />

        <h2 className="order-two-heading text-center">
          Everything you need for a Smooth Experience
        </h2>
      </div>

      {/* carousel */}
      <div className="px-6 sm:px-14 py-2">
        <Carousel>
          <CarouselContent>
            {msp.map((item) => {
              return (
                <CarouselItem
                  className="h-64 py-1 pr-1 pl-5 md:max-w-[500px]"
                  key={item.heading}
                >
                  <Card className="h-full">
                    <CardContent className="flex flex-col justify-start items-center content-center gap-6 h-full overflow-clip">
                      <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-2xl shrink-0 overflow-hidden">
                        {<item.icon />}
                      </div>

                      <div className="flex flex-col gap-2 justify-center items-center content-center text-center">
                        <h4 className="order-four-heading">{item.heading}</h4>

                        <p className="description-text">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* buttons */}
          <CarouselPrevious className="-left-8 md:-left-10" />
          <CarouselNext className="-right-8 md:-right-10" />
        </Carousel>
      </div>
    </div>
  );
};

export default HomeFeatures;
