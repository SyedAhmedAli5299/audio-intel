import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { RecordingInterface } from "@/components/RecordingInterface";
import { PricingSection } from "@/components/PricingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <RecordingInterface />
        <PricingSection />
      </main>
    </div>
  );
};

export default Index;
