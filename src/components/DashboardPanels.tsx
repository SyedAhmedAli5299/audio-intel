import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Lightbulb, 
  Download, 
  Copy, 
  Share,
  Eye,
  EyeOff,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface DashboardPanelsProps {
  meeting: Tables<'meetings'>;
}

export const DashboardPanels = ({ meeting }: DashboardPanelsProps) => {
  const [showTranscript, setShowTranscript] = useState(true);

  // Safely parse JSON fields with fallbacks
  const getSummary = () => {
    try {
      if (!meeting.summary) return { keyTakeaways: [], actionItems: [], topics: [] };
      const parsed = JSON.parse(meeting.summary);
      return {
        keyTakeaways: parsed.keyTakeaways || [],
        actionItems: parsed.actionItems || [],
        topics: parsed.topics || [],
      };
    } catch (e) {
      console.error("Failed to parse summary JSON:", e);
      return { keyTakeaways: [], actionItems: [], topics: [] };
    }
  };
  
  const summary = getSummary();
  const translation = "Translation feature is under development.";

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meeting Analysis: <span className="gradient-text">{meeting.title}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Generated on {new Date(meeting.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass border-border/50 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Original Transcript
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowTranscript(!showTranscript)}>
                      {showTranscript ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(meeting.transcription_text || '', 'Transcript')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {showTranscript && (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed max-h-96 overflow-y-auto">
                        {meeting.transcription_text || "No transcript available."}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">English</Badge>
                    {meeting.duration_seconds && <Badge variant="secondary">{Math.round(meeting.duration_seconds / 60)} min duration</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Analysis
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">AI Summary</TabsTrigger>
                    <TabsTrigger value="translation">Translation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="mt-4 space-y-6">
                     <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">Key Takeaways</h4>
                        <ul className="space-y-2">
                          {summary.keyTakeaways.map((item, index) => (
                            <li key={index} className="text-sm leading-relaxed text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">Action Items</h4>
                        <ul className="space-y-2">
                          {summary.actionItems.map((item, index) => (
                            <li key={index} className="text-sm leading-relaxed text-muted-foreground flex items-start gap-2">
                              <span className="text-warning mt-1">→</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Topics Discussed</h4>
                        <div className="flex flex-wrap gap-2">
                          {summary.topics.map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                  </TabsContent>
                  <TabsContent value="translation" className="mt-4">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
                        {translation}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 glass border-border/50">
            <CardHeader>
              <CardTitle>Export & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero"><Download className="mr-2 h-4 w-4" />Export PDF</Button>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export DOCX</Button>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Markdown</Button>
                <Button variant="ghost"><Share className="mr-2 h-4 w-4" />Share Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
