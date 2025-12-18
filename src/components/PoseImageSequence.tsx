import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PoseImage {
  id: string;
  image_url: string;
  step_number: number;
  pose_name: string | null;
  cue_text: string | null;
  modification_text: string | null;
}

interface PoseImageSequenceProps {
  contentId: string;
  videoUrl?: string | null;
  isPremiumUser: boolean;
  isPremiumContent: boolean;
}

export const PoseImageSequence = ({ 
  contentId, 
  videoUrl, 
  isPremiumUser, 
  isPremiumContent 
}: PoseImageSequenceProps) => {
  const [poseImages, setPoseImages] = useState<PoseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPoseImages();
  }, [contentId]);

  const loadPoseImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('content_pose_images')
      .select('*')
      .eq('content_id', contentId)
      .order('step_number', { ascending: true });

    if (error) {
      console.error('Error loading pose images:', error);
      setLoading(false);
      return;
    }

    setPoseImages(data || []);
    setLoading(false);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : poseImages.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < poseImages.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full aspect-video rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="w-20 h-20 rounded-md" />
          <Skeleton className="w-20 h-20 rounded-md" />
          <Skeleton className="w-20 h-20 rounded-md" />
        </div>
      </div>
    );
  }

  // If no pose images uploaded, return null to let fallback content show
  if (poseImages.length === 0) {
    return null;
  }

  const currentPose = poseImages[currentIndex];

  return (
    <div className="space-y-4">
      {/* Premium Video Section - Only for Premium users */}
      {videoUrl && isPremiumUser && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Full Guided Video</span>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-xs">Premium</Badge>
          </div>
          <video controls className="w-full rounded-lg bg-black">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Premium Video Placeholder - For non-Premium users */}
      {videoUrl && !isPremiumUser && (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="text-center p-6">
              <Crown className="h-10 w-10 mx-auto mb-3 text-amber-500" />
              <p className="text-sm font-medium mb-2">Join live Premium sessions for full guided practice</p>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Pose Image Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Step-by-Step Pose Guide</span>
        <Badge variant="outline" className="text-xs">All Users</Badge>
      </div>

      {/* Main Pose Image Display */}
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="p-0 relative">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 to-secondary/5">
            <img
              src={currentPose.image_url}
              alt={currentPose.pose_name || `Step ${currentPose.step_number}`}
              className="w-full h-full object-contain"
            />
            
            {/* Navigation Arrows */}
            {poseImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-10 w-10"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 h-10 w-10"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Step Counter */}
            <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium">
                Step {currentIndex + 1} of {poseImages.length}
              </span>
            </div>
          </div>

          {/* Pose Info */}
          <div className="p-4 space-y-2">
            {currentPose.pose_name && (
              <h4 className="font-semibold text-lg">{currentPose.pose_name}</h4>
            )}
            
            {currentPose.cue_text && (
              <p className="text-sm text-foreground/90">
                {currentPose.cue_text}
              </p>
            )}
            
            {currentPose.modification_text && (
              <div className="flex items-start gap-2 p-3 bg-secondary/20 rounded-lg">
                <Badge variant="secondary" className="text-xs shrink-0">Modification</Badge>
                <p className="text-sm text-muted-foreground">
                  {currentPose.modification_text}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Navigation */}
      {poseImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {poseImages.map((pose, index) => (
            <button
              key={pose.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                index === currentIndex 
                  ? 'border-primary ring-2 ring-primary/30' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img
                src={pose.image_url}
                alt={pose.pose_name || `Step ${pose.step_number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm text-xs text-center py-0.5">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
