import HomeHero from "@/components/Home/HomeHero";
import HomeFeatures from "@/components/Home/HomeFeatures";
import HomeWorking from "@/components/Home/HomeWorking";
import HomeFAQs from "@/components/Home/HomeFAQs";

export default function Home() {
  return (
    <div>
      <HomeHero />

      <HomeFeatures />

      <HomeWorking />

      <HomeFAQs />
    </div>
  );
}
