import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  FileAudio,
  Clock,
  Volume2,
  Settings,
  MicOff,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast as shadcnToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export const RecordingInterface = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('loading');

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (!navigator.permissions) {
        setMicPermission('prompt');
        return;
      }
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setMicPermission(permissionStatus.state);
        };
      } catch (err) {
        console.warn("Could not query microphone permission status:", err);
        setMicPermission('prompt');
      }
    };

    checkPermission();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ensureAuthenticated = () => {
    if (!session) {
      sonnerToast.error("Authentication Required", {
        description: "Please sign in or create an account to use this feature.",
      });
      navigate("/auth");
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    if (!ensureAuthenticated()) return;

    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream.current);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      audioLevelIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        shadcnToast({
          title: "Microphone permission denied",
          description: "Please allow microphone access in your browser settings to start recording.",
          variant: "destructive",
        });
      } else {
        shadcnToast({
          title: "Could not start recording",
          description: "An unexpected error occurred. Please check your microphone connection and permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        setAudioLevel(0);
      }
      
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }

      if (recordedChunks.current.length) {
        const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        processAudioBlob(blob);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current) {
      if (isPaused) {
        mediaRecorder.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        audioLevelIntervalRef.current = setInterval(() => {
          setAudioLevel(Math.random() * 100);
        }, 100);
      } else {
        mediaRecorder.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (audioLevelIntervalRef.current) {
          clearInterval(audioLevelIntervalRef.current);
          setAudioLevel(0);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const processAudioBlob = async (blob: Blob) => {
    if (!ensureAuthenticated()) return;

    try {
      setUploadProgress(10);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const b64 = res.split(",")[1] || "";
          resolve(b64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setUploadProgress(20);
      const { data: tData, error: tErr } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64, mimeType: blob.type },
      });
      if (tErr) throw tErr;
      const transcriptText: string = tData?.text || "";

      setUploadProgress(60);
      const { data: trData, error: trErr } = await supabase.functions.invoke('translate-text', {
        body: { text: transcriptText, targetLanguage: 'English' },
      });
      if (trErr) throw trErr;
      const translated: string = trData?.translated || "";

      setUploadProgress(85);
      const { data: sData, error: sErr } = await supabase.functions.invoke('summarize-text', {
        body: { transcript: transcriptText },
      });
      if (sErr) throw sErr;

      const summary = sData?.summary || { keyTakeaways: [], actionItems: [], topics: [] };

      const payload = { transcript: transcriptText, translation: translated, summary };
      localStorage.setItem('latest_analysis', JSON.stringify(payload));
      setUploadProgress(100);
      shadcnToast({ title: 'Analysis complete', description: 'Opening your results...' });
      navigate('/transcribes');
    } catch (err: any) {
      console.error('Processing error', err);
      setUploadProgress(0);

      let title = 'Processing Failed';
      let description = 'An unknown processing error occurred. Please try again.';

      if (err.name === 'FunctionsHttpError' && err.context) {
        try {
          const errorBody = await err.context.json();
          if (errorBody.error && errorBody.error.type === 'insufficient_quota') {
            title = 'OpenAI Quota Exceeded';
            description = 'Your OpenAI account has insufficient funds or has hit its usage limit. Please check your plan and billing details on the OpenAI website.';
          } else if (errorBody.error && errorBody.error.message) {
            description = errorBody.error.message;
          } else {
            description = errorBody.error || `The Gemini AI service returned an error. Status: ${err.context.status}.`;
          }
        } catch (e) {
          description = `The Gemini AI service returned an unreadable error. Status: ${err.context.status}.`;
        }
      } else if (err.message) {
        description = err.message;
      }

      shadcnToast({ 
        title: title, 
        description: description, 
        variant: 'destructive',
        duration: 10000,
      });
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!ensureAuthenticated()) return;

    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setUploadProgress(0);
    await processAudioBlob(file);
  };

  const handleUploadClick = () => {
    if (!ensureAuthenticated()) return;
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your <span className="gradient-text">Smart Recording</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Record directly in your browser or upload an existing audio file
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  Live Recording
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {micPermission === 'loading' && (
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <Skeleton className="w-24 h-24 mx-auto rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-24 mx-auto" />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Skeleton className="h-11 w-44" />
                    </div>
                  </div>
                )}

                {micPermission === 'denied' && (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 p-4 bg-destructive/10 rounded-lg h-full">
                    <MicOff className="h-10 w-10 text-destructive" />
                    <h4 className="font-semibold text-lg">Microphone Access Denied</h4>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      To record audio, please allow microphone access in your browser's site settings.
                    </p>
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      I've enabled it
                    </Button>
                  </div>
                )}
                
                {(micPermission === 'granted' || micPermission === 'prompt') && (
                  <>
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                          isRecording 
                            ? 'bg-destructive/20 border-4 border-destructive animate-pulse' 
                            : 'bg-primary/20 border-4 border-primary/30'
                        }`}>
                          <Mic className={`h-8 w-8 ${isRecording ? 'text-destructive' : 'text-primary'}`} />
                        </div>
                        {isRecording && !isPaused && (
                          <Badge variant="destructive" className="absolute top-0 right-0">
                            REC
                          </Badge>
                        )}
                        {isPaused && (
                          <Badge variant="secondary" className="absolute top-0 right-0">
                            PAUSED
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-2xl font-mono font-bold">
                          {formatTime(recordingTime)}
                        </div>
                        {isRecording && (
                          <div className="flex items-center justify-center gap-2">
                            <Volume2 className="h-4 w-4 text-primary" />
                            <Progress value={audioLevel} className="w-32 h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center gap-3">
                      {!isRecording ? (
                        <Button 
                          variant="recording" 
                          size="lg"
                          onClick={startRecording}
                          className="flex items-center gap-2"
                        >
                          <Mic className="h-4 w-4" />
                          Start Recording
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant={isPaused ? "default" : "secondary"}
                            size="lg"
                            onClick={pauseRecording}
                          >
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline"
                            size="lg"
                            onClick={stopRecording}
                          >
                            <Square className="h-4 w-4" />
                            Stop
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2 pt-6">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Audio File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                  <FileAudio className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Drop your audio file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports MP3, WAV, M4A files up to 100MB
                  </p>
                  <Button variant="hero" onClick={handleUploadClick}>
                    Choose File
                  </Button>
                  {selectedFileName && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Selected: {selectedFileName}
                    </p>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Max 2 hours
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    Auto-enhance
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};