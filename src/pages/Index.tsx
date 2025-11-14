import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DailyRecommendations } from "@/components/DailyRecommendations";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Sacred Cycle Wellness</h1>
        <p className="text-muted-foreground">
          Your personalized Ayurvedic journey through all phases of womanhood
        </p>
      </div>

      <DailyRecommendations />

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Button
          variant="outline"
          className="h-32 flex flex-col gap-2"
          onClick={() => navigate("/tracker")}
        >
          <Calendar className="h-8 w-8" />
          <span>Daily Tracker</span>
        </Button>
        <Button
          variant="outline"
          className="h-32 flex flex-col gap-2"
          onClick={() => navigate("/content")}
        >
          <BookOpen className="h-8 w-8" />
          <span>Content Library</span>
        </Button>
        <Button
          variant="outline"
          className="h-32 flex flex-col gap-2"
          onClick={() => navigate("/onboarding")}
        >
          <User className="h-8 w-8" />
          <span>My Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default Index;
