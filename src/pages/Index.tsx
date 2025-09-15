import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { RecordingInterface } from "@/components/RecordingInterface";
import { DashboardPanels } from "@/components/DashboardPanels";
import { PricingSection } from "@/components/PricingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <RecordingInterface />
        <DashboardPanels />
        <PricingSection />
      </main>
    </div>
  );
};

export default Index;
