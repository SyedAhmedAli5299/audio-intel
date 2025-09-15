import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { RecordingInterface } from "@/components/RecordingInterface";

const Upload = () => {
  useEffect(() => {
    document.title = "Upload Audio | AI Meeting Summarizer";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <RecordingInterface />
      </main>
    </div>
  );
};

export default Upload;
