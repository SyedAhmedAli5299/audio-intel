import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Languages, 
  Lightbulb, 
  Download, 
  Copy, 
  Share,
  Eye,
  EyeOff,
  Volume2,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

export const DashboardPanels = () => {
  const [processingStage, setProcessingStage] = useState("transcribing");
  const [showTranscript, setShowTranscript] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const [transcript, setTranscript] = useState<string>(`Good morning everyone, welcome to our quarterly product review meeting. I'm excited to share the latest updates on our AI transcription platform. 

We've made significant progress in the last quarter, particularly in improving accuracy for technical vocabulary and handling multiple speakers...`);

  const [translation, setTranslation] = useState<string>(`Buenos días a todos, bienvenidos a nuestra reunión trimestral de revisión de productos. Estoy emocionado de compartir las últimas actualizaciones en nuestra plataforma de transcripción de IA.

Hemos hecho un progreso significativo en el último trimestre, particularmente en mejorar la precisión para el vocabulario técnico...`);

  const [summary, setSummary] = useState({
    keyTakeaways: [
      "Q3 product review meeting successfully conducted",
      "AI transcription platform showed significant accuracy improvements",
      "Technical vocabulary processing enhanced by 25%",
      "Multi-speaker handling capabilities upgraded"
    ],
    actionItems: [
      "Deploy new accuracy improvements to production by end of week",
      "Schedule follow-up meeting for December 15th",
      "Prepare demo for client presentation next month",
      "Document technical vocabulary improvements"
    ],
    topics: [
      "Product Development Updates",
      "AI Platform Performance",
      "Technical Improvements",
      "Future Roadmap Planning"
    ]
  });

  // Load latest analysis if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('latest_analysis');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.transcript) setTranscript(parsed.transcript);
        if (parsed.translation) setTranslation(parsed.translation);
        if (parsed.summary) setSummary(parsed.summary);
      }
    } catch (e) {
      console.warn('Failed to load latest analysis from storage', e);
    }
  }, []);

  const processingStages = [
    { key: "transcribing", label: "Transcribing", progress: 100, complete: true },
    { key: "translating", label: "Translating", progress: 80, complete: false },
    { key: "summarizing", label: "Summarizing", progress: 30, complete: false },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI-Powered <span className="gradient-text">Meeting Analysis</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Real-time transcription, translation, and intelligent summarization
            </p>
          </div>

          {/* Processing Status */}
          <Card className="mb-8 glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  Processing Status
                </div>
                <Badge variant="secondary">Meeting_2024_Q3_Review.mp3</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {processingStages.map((stage) => (
                  <div key={stage.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{stage.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {stage.progress}%
                      </span>
                    </div>
                    <Progress value={stage.progress} className="h-2" />
                    {stage.complete && (
                      <Badge variant="secondary" className="text-xs text-success">
                        Complete
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Transcript Panel */}
            <Card className="glass border-border/50">
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
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-sm text-muted-foreground">
                      12:34 / 45:67
                    </div>
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {showTranscript && (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
{transcript}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Badge variant="secondary">English</Badge>
                    <Badge variant="secondary">3 Speakers</Badge>
                    <Badge variant="secondary">45:67 duration</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translation Panel */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    Translation
                  </div>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tabs defaultValue="spanish" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="spanish">Spanish</TabsTrigger>
                      <TabsTrigger value="french">French</TabsTrigger>
                      <TabsTrigger value="german">German</TabsTrigger>
                    </TabsList>
                    <TabsContent value="spanish" className="mt-4">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
{translation}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="french" className="mt-4">
                      <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
                        French translation would appear here...
                      </div>
                    </TabsContent>
                    <TabsContent value="german" className="mt-4">
                      <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
                        German translation would appear here...
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-2">
                    <Badge variant="secondary">Auto-detected: English</Badge>
                    <Badge variant="secondary">Confidence: 98%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Panel */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Summary
                  </div>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Key Takeaways */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Key Takeaways
                    </h4>
                    <ul className="space-y-2">
                      {summary.keyTakeaways.map((item, index) => (
                        <li key={index} className="text-sm leading-relaxed text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      Action Items
                    </h4>
                    <ul className="space-y-2">
                      {summary.actionItems.map((item, index) => (
                        <li key={index} className="text-sm leading-relaxed text-muted-foreground flex items-start gap-2">
                          <span className="text-warning mt-1">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Topics */}
                  <div>
                    <h4 className="font-semibold mb-3">Topics Discussed</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card className="mt-8 glass border-border/50">
            <CardHeader>
              <CardTitle>Export & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export DOCX
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Markdown
                </Button>
                <Button variant="ghost">
                  <Share className="mr-2 h-4 w-4" />
                  Share Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};