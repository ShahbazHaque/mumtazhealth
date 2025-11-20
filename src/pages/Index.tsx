import { Button } from "@/components/ui/button";
import { Heart, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-wellness-sage-light">
      <div className="container mx-auto px-6 py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="h-10 w-10 text-wellness-sage" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">
              Sacred Cycle Wellness
            </h1>
            <Heart className="h-10 w-10 text-wellness-lilac" />
          </div>
          
          <p className="text-2xl font-medium text-foreground leading-relaxed">
            Welcome to Your Holistic Journey
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose Your Path to Balance and Empowerment
          </p>
        </div>

        {/* Main CTA */}
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full h-24 text-xl font-semibold bg-gradient-to-r from-wellness-lilac to-wellness-sage hover:opacity-90 transition-opacity shadow-lg"
            onClick={() => navigate("/onboarding")}
          >
            <Heart className="mr-3 h-6 w-6" />
            Menstrual & Fertility Phase
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Personalized guidance for every stage of your cycle
          </p>
        </div>

        {/* Supporting Info */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">🧘‍♀️</div>
            <h3 className="font-semibold mb-2">Yoga & Movement</h3>
            <p className="text-sm text-muted-foreground">
              Practices aligned with your cycle and dosha
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">🌿</div>
            <h3 className="font-semibold mb-2">Ayurvedic Wisdom</h3>
            <p className="text-sm text-muted-foreground">
              Nutrition and lifestyle guidance for balance
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-semibold mb-2">Spiritual Support</h3>
            <p className="text-sm text-muted-foreground">
              Optional Islamic and holistic practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
