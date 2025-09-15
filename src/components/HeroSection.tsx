import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Upload, 
  Zap, 
  Languages, 
  FileText, 
  Play,
  Sparkles,
  Users,
  Clock
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  const features = [
    { icon: Mic, text: "Record & Transcribe" },
    { icon: Languages, text: "Multi-language Support" },
    { icon: FileText, text: "AI Summarization" },
    { icon: Zap, text: "Real-time Processing" },
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Active Users" },
    { icon: Clock, value: "1M+", label: "Hours Processed" },
    { icon: Languages, value: "5", label: "Languages" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="AI Meeting Platform Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI-Powered Meeting Intelligence
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Transform Your{" "}
            <span className="gradient-text">Meetings</span>
            <br />
            Into Actionable{" "}
            <span className="gradient-text">Insights</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Record, transcribe, translate, and summarize your meetings with 
            state-of-the-art AI. Available in 5 languages with enterprise-grade security.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="xl" className="text-lg" asChild>
              <Link to="/record">
                <Play className="mr-2 h-5 w-5" />
                Start Recording Now
              </Link>
            </Button>
            <Button variant="glass" size="xl" className="text-lg" asChild>
              <Link to="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Audio File
              </Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 hover:bg-accent/10 transition-all duration-300 group"
              >
                <feature.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-center">{feature.text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};
