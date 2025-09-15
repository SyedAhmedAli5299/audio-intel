import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardPanels } from "@/components/DashboardPanels";

const Transcribes = () => {
  useEffect(() => {
    document.title = "Transcripts | AI Meeting Summarizer";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <DashboardPanels />
      </main>
    </div>
  );
};

export default Transcribes;
