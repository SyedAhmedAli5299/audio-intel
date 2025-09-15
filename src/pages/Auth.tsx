import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SignInForm } from "@/components/auth/SignInForm";
import { Navbar } from "@/components/Navbar";

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center py-12 md:py-24">
        <Tabs defaultValue="sign-in" className="w-full max-w-md px-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your dashboard and meeting history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignInForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sign-up">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Get started with AI-powered meeting intelligence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignUpForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AuthPage;
