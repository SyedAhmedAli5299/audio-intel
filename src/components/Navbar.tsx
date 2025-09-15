import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Crown,
  Upload,
  FileText,
  Home
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Mic, label: "Record", to: "/record" },
    { icon: Upload, label: "Upload", to: "/upload" },
    { icon: FileText, label: "Transcripts", to: "/transcribes" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 glass backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              MeetingAI
            </span>
            <Badge variant="secondary" className="text-xs">
              Pro
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">8.5 hrs left</span>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsLoggedIn(true)}>
                  Sign In
                </Button>
                <Button variant="hero" onClick={() => setIsLoggedIn(true)}>
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};