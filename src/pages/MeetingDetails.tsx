import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DashboardPanels } from "@/components/DashboardPanels";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const MeetingDetails = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<Tables<'meetings'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      setError("No meeting ID provided.");
      setLoading(false);
      return;
    }

    const fetchMeeting = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .single();

      if (error) {
        console.error("Error fetching meeting:", error);
        setError("Could not load meeting details. Please try again.");
      } else {
        setMeeting(data);
      }
      setLoading(false);
    };

    fetchMeeting();
  }, [meetingId]);

  useEffect(() => {
    if (meeting) {
      document.title = `${meeting.title} | MeetingAI`;
    }
  }, [meeting]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid lg:grid-cols-3 gap-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (meeting) {
      return <DashboardPanels meeting={meeting} />;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested meeting could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{renderContent()}</main>
    </div>
  );
};

export default MeetingDetails;
