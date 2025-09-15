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
  Home,
  Loader2
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign Out Failed", { description: error.message });
    } else {
      toast.success("Signed out successfully.");
      navigate("/");
    }
  };

  const navItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Mic, label: "Record", to: "/record" },
    { icon: Upload, label: "Upload", to: "/upload" },
    { icon: FileText, label: "Transcripts", to: "/transcribes" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 glass backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              MeetingAI
            </span>
            <Badge variant="secondary" className="text-xs">
              Pro
            </Badge>
          </Link>

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
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : session && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
                      <AvatarFallback>
                        {getInitials(user.user_metadata.full_name || user.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Upgrade to Pro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
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
              <div className="pt-4 mt-4 border-t border-border/40">
                {!session && (
                   <div className="flex flex-col space-y-2">
                      <Button variant="ghost" asChild>
                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                      </Button>
                      <Button variant="hero" asChild>
                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                      </Button>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
