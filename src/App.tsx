import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Record from "./pages/Record";
import Upload from "./pages/Upload";
import TranscribesList from "./pages/TranscribesList";
import MeetingDetails from "./pages/MeetingDetails";
import AuthPage from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/record" element={<Record />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/transcribes" element={<TranscribesList />} />
            <Route path="/transcribes/:meetingId" element={<MeetingDetails />} />
            <Route path="/start-recording-now" element={<Record />} />
            <Route path="/upload-audio-file" element={<Upload />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
