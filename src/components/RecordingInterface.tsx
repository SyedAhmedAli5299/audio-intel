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
  Settings
} from "lucide-react";

export const RecordingInterface = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream.current);
      
      mediaRecorder.current.ondataavailable = (event) => {
        // Handle recorded data
        console.log('Recording data available:', event.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Simulate audio level monitoring
      const audioLevelInterval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
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
      
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }

      // Simulate upload progress
      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(uploadInterval);
        }
      }, 200);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current) {
      if (isPaused) {
        mediaRecorder.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorder.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setUploadProgress(0);

    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(uploadInterval);
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
            {/* Recording Card */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  Live Recording
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Status */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording 
                        ? 'bg-destructive/20 border-4 border-destructive animate-pulse' 
                        : 'bg-primary/20 border-4 border-primary/30'
                    }`}>
                      <Mic className={`h-8 w-8 ${isRecording ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    {isRecording && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2">
                        REC
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

                {/* Controls */}
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

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Card */}
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
                  <Button variant="hero" onClick={() => fileInputRef.current?.click()}>
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
                      <span>Uploading...</span>
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