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
    <div className="max-w-7xl w-full mx-auto my-10 px-4 md:py-16">
      <Card className="py-10">
        <CardContent className="flex flex-col gap-4">
          <MyBadge icon={FaStar} label="Better Tests. Better Futures." />

          <h1 className="order-one-heading">
            Online Tests Made <span className="text-primary">Simple</span>
          </h1>

          <p className="description-text">
            Quiznet is an online class test platform for students. Attempt
            quizzes, track your performance and achieve your goals.
          </p>

          <div className="flex flex-col md:flex-row gap-2 max-w-[200px] md:max-w-sm mt-6 md:mt-10">
            <LoginOptions user={user} />
          </div>

          <div className="mt-2 flex gap-4 flex-wrap items-center content-center">
            <AvatarGroup>
              <Avatar size="default">
                <AvatarImage
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimgcdn.stablediffusionweb.com%2F2026%2F3%2F17%2F4595be2f-10fb-4a70-9a40-51631d1af12e.webp&f=1&nofb=1&ipt=132afde490c5f705344988f7d562885f705df561c2b50f541f0b232b0be1c9bf"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar size="default">
                <AvatarImage
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpbs.twimg.com%2Fmedia%2FEeUI99bUcAMiRFa.jpg%3Alarge&f=1&nofb=1&ipt=7f28270edd21f1be8641b42b8ab8229995162245fbae9a6c58dfbc7461ebf4e4"
                  alt="@maxleiter"
                />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar size="default">
                <AvatarImage
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2F736x%2F8c%2F11%2Fdd%2F8c11dd4a7110a437722370c4663f80ec.jpg&f=1&nofb=1&ipt=52cfd40483181f75a61a60f255dea7435963c9061d9868922d335921affded46"
                  alt="@evilrabbit"
                />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>
                <Plus />
              </AvatarGroupCount>
            </AvatarGroup>

            <p className="text-foreground">
              Join 100+ students across the college
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeHero;
