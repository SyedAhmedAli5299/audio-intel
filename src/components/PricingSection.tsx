import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Zap, 
  Crown, 
  Building,
  Mic,
  Clock,
  Users,
  Shield,
  Headphones,
  Settings
} from "lucide-react";

export const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out our platform",
      icon: Mic,
      popular: false,
      features: [
        "30 minutes per month",
        "Basic transcription",
        "English only",
        "Standard quality",
        "Web app access",
        "Email support"
      ],
      limitations: [
        "No translation",
        "No AI summaries",
        "No export options"
      ]
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Ideal for professionals and small teams",
      icon: Zap,
      popular: true,
      features: [
        "10 hours per month",
        "Advanced transcription",
        "5 languages supported",
        "Real-time translation",
        "AI-powered summaries",
        "PDF, DOCX, MD export",
        "Priority support",
        "Team collaboration",
        "Custom vocabulary"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large teams and organizations",
      icon: Building,
      popular: false,
      features: [
        "Unlimited usage",
        "Premium transcription",
        "All languages",
        "Custom model training",
        "Advanced analytics",
        "API access",
        "SSO integration",
        "Dedicated support",
        "Custom integrations",
        "On-premise deployment"
      ],
      limitations: []
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "50,000+" },
    { icon: Clock, label: "Hours Processed", value: "1M+" },
    { icon: Shield, label: "Uptime", value: "99.9%" },
    { icon: Headphones, label: "Support Rating", value: "4.9/5" }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Pricing Plans
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include our core AI features 
              with increasing limits and advanced capabilities.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative glass border-border/50 hover:shadow-glow transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-primary/50 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="bg-gradient-primary">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button 
                    variant={plan.popular ? "hero" : "outline"} 
                    className="w-full"
                  >
                    {plan.name === "Free" ? "Get Started" : "Start Free Trial"}
                  </Button>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t border-border/50">
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-muted-foreground mt-0.5">×</span>
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto glass border-border/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Need a Custom Solution?</h3>
                <p className="text-muted-foreground mb-6">
                  We offer custom enterprise solutions with advanced features, 
                  dedicated support, and flexible deployment options.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero">
                    Contact Sales
                  </Button>
                  <Button variant="outline">
                    Schedule Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};