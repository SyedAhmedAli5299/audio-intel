import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/enhanced-button";
import { FileText, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const TranscribesList = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Tables<'meetings'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Tables<'meetings'> | null>(null);

  useEffect(() => {
    document.title = "My Transcripts | MeetingAI";

    const fetchMeetings = async () => {
      if (!user) {
        setLoading(false);
        return;
      };

      setLoading(true);
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching meetings:", error);
        toast.error("Failed to load transcripts", { description: error.message });
      } else {
        setMeetings(data);
      }
      setLoading(false);
    };

    if(user) {
      fetchMeetings();
    }
  }, [user]);

  const handleDeleteClick = (meeting: Tables<'meetings'>) => {
    setMeetingToDelete(meeting);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", meetingToDelete.id);
    
    setIsDeleting(false);
    setShowDeleteDialog(false);

    if (error) {
      toast.error("Deletion Failed", { description: error.message });
    } else {
      toast.success(`"${meetingToDelete.title}" was deleted.`);
      setMeetings(meetings.filter(m => m.id !== meetingToDelete.id));
    }
    setMeetingToDelete(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (meetings.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No transcripts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Record or upload a meeting to get started.
          </p>
          <div className="mt-6">
            <Button asChild variant="hero">
              <Link to="/record">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Meeting
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="h-full flex flex-col glass hover:shadow-glow transition-shadow duration-300">
            <CardHeader className="flex-row items-start justify-between">
              <div className="flex-1">
                <CardTitle className="truncate hover:underline">
                  <Link to={`/transcribes/${meeting.id}`}>
                    {meeting.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true })}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(meeting);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              <Link to={`/transcribes/${meeting.id}`} className="block h-full">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {meeting.transcription_text || "No transcription available."}
                </p>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Transcripts</h1>
            <Button asChild variant="hero">
              <Link to="/record">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Meeting
              </Link>
            </Button>
          </div>
          {renderContent()}
        </main>
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meeting
              <span className="font-bold"> "{meetingToDelete?.title}" </span>
              and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TranscribesList;
