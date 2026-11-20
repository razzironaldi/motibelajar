import LandingSections from "@/components/LandingSections";
import NightFlowerValleyHero from "@/components/NightFlowerValleyHero";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-clip">
      <NightFlowerValleyHero />
      <LandingSections />
    </main>
  );
}
