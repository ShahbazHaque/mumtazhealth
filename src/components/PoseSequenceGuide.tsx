import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUp, ArrowDown, RotateCw, Play, Crown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PoseStep {
  name: string;
  illustration: React.ReactNode;
  cues: string[];
  modifications: string;
  movementDirection?: 'up' | 'down' | 'forward' | 'rotate' | 'hold';
}

interface PoseSequenceGuideProps {
  contentType: string;
  tags?: string[];
  title?: string;
  isPremium?: boolean;
}

export const PoseSequenceGuide = ({ contentType, tags = [], title = "", isPremium = false }: PoseSequenceGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const getSequence = (): PoseStep[] => {
    const tagList = tags.map(t => t.toLowerCase());
    
    if (tagList.some(t => ['chair-yoga', 'seated', 'chair'].includes(t))) {
      return chairYogaSequence;
    }
    if (tagList.some(t => ['wall-yoga', 'wall-supported'].includes(t))) {
      return wallYogaSequence;
    }
    if (tagList.some(t => ['bed-yoga', 'restorative', 'lying'].includes(t))) {
      return restorativeSequence;
    }
    if (tagList.some(t => ['breathwork', 'breathing', 'pranayama'].includes(t))) {
      return breathworkSequence;
    }
    if (tagList.some(t => ['meditation', 'mindfulness'].includes(t))) {
      return meditationSequence;
    }
    if (tagList.some(t => ['mobility', 'stretching', 'arthritis', 'joint-care'].includes(t))) {
      return mobilitySequence;
    }
    if (tagList.some(t => ['pregnancy', 'prenatal'].includes(t))) {
      return pregnancySafeSequence;
    }
    if (contentType === 'yoga') return gentleYogaSequence;
    if (contentType === 'meditation') return meditationSequence;
    if (contentType === 'breathwork') return breathworkSequence;
    
    return gentleYogaSequence;
  };

  const sequence = getSequence();
  const currentPose = sequence[currentStep];

  const nextStep = () => setCurrentStep((prev) => (prev + 1) % sequence.length);
  const prevStep = () => setCurrentStep((prev) => (prev - 1 + sequence.length) % sequence.length);

  const getDirectionArrow = (direction?: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-5 w-5 text-accent" />;
      case 'down': return <ArrowDown className="h-5 w-5 text-accent" />;
      case 'forward': return <ArrowRight className="h-5 w-5 text-accent" />;
      case 'rotate': return <RotateCw className="h-5 w-5 text-accent" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Illustration Area */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-lg overflow-hidden">
        {/* Soft pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="posePattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <circle cx="10" cy="10" r="1" fill="hsl(var(--primary))" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#posePattern)" />
          </svg>
        </div>

        {/* Pose Illustration */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative">
            {currentPose.illustration}
            
            {/* Movement Direction Arrow */}
            {currentPose.movementDirection && (
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-background/80 rounded-full px-2 py-1">
                {getDirectionArrow(currentPose.movementDirection)}
              </div>
            )}
          </div>
        </div>

        {/* Step Counter */}
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-medium">
            Step {currentStep + 1} of {sequence.length}
          </span>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            className="h-9 w-9 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-1.5">
            {sequence.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-6 bg-primary' 
                    : 'w-2 bg-primary/30 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextStep}
            className="h-9 w-9 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Pose Details */}
      <div className="bg-card rounded-lg p-4 space-y-3 border border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">{currentPose.name}</h3>
          {currentPose.movementDirection && (
            <Badge variant="outline" className="gap-1">
              {getDirectionArrow(currentPose.movementDirection)}
              {currentPose.movementDirection === 'hold' ? 'Hold' : 'Move'}
            </Badge>
          )}
        </div>

        {/* Beginner Cues */}
        <div className="space-y-1.5">
          {currentPose.cues.map((cue, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-primary font-medium">•</span>
              <span>{cue}</span>
            </div>
          ))}
        </div>

        {/* Modification */}
        <div className="bg-secondary/30 rounded-md p-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Modification: </span>
            {currentPose.modifications}
          </p>
        </div>
      </div>

      {/* Premium Session Message */}
      {isPremium && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Join live Premium sessions for full guided practice</p>
              <p className="text-sm text-muted-foreground">Get personalized guidance from Mumtaz</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Play className="h-4 w-4" />
              View Sessions
            </Button>
          </div>
        </div>
      )}

      {/* Upload Placeholder for Admin */}
      <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center">
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">
          Video/animation upload area (Admin)
        </p>
      </div>
    </div>
  );
};

// Inclusive human figure illustrations
const createFigure = (pose: string, variant: 'young' | 'mature' | 'seated' = 'young') => {
  const skinTones = ['hsl(25, 50%, 55%)', 'hsl(20, 45%, 45%)', 'hsl(30, 40%, 60%)'];
  const skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
  
  return (
    <svg viewBox="0 0 180 220" className="w-40 h-48 md:w-52 md:h-60">
      <defs>
        <linearGradient id={`skin-${pose}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
          <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
        </linearGradient>
        <linearGradient id={`clothing-${pose}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(280, 35%, 55%)" />
        </linearGradient>
        <linearGradient id={`hijab-${pose}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(270, 40%, 50%)" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="90" cy="110" r="85" fill="hsl(var(--primary))" opacity="0.05" />
      
      {/* Figure based on pose */}
      {renderPoseFigure(pose, variant)}
    </svg>
  );
};

const renderPoseFigure = (pose: string, variant: string) => {
  // Base seated figure
  if (pose.includes('seated') || pose.includes('chair')) {
    return (
      <g>
        {/* Chair */}
        <rect x="40" y="140" width="100" height="6" rx="2" fill="hsl(var(--muted))" />
        <rect x="125" y="85" width="10" height="60" rx="2" fill="hsl(var(--muted))" />
        <rect x="43" y="146" width="6" height="30" rx="1" fill="hsl(var(--muted-foreground))" opacity="0.5" />
        <rect x="131" y="146" width="6" height="30" rx="1" fill="hsl(var(--muted-foreground))" opacity="0.5" />
        
        {/* Body */}
        <ellipse cx="90" cy="120" rx="28" ry="22" fill={`url(#clothing-seated)`} />
        
        {/* Head with hijab */}
        <ellipse cx="90" cy="70" rx="18" ry="20" fill={`url(#skin-seated)`} />
        <path d="M68 62 Q72 45 90 42 Q108 45 112 62 Q115 80 90 88 Q65 80 68 62" fill={`url(#hijab-seated)`} />
        <path d="M70 82 Q65 100 70 115" stroke={`url(#hijab-seated)`} strokeWidth="10" fill="none" />
        
        {/* Face */}
        <ellipse cx="83" cy="68" rx="2" ry="2.5" fill="hsl(20, 30%, 25%)" />
        <ellipse cx="97" cy="68" rx="2" ry="2.5" fill="hsl(20, 30%, 25%)" />
        <path d="M85 78 Q90 81 95 78" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Arms */}
        <path d="M70 105 Q55 120 55 140" stroke={`url(#skin-seated)`} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M110 105 Q125 120 125 140" stroke={`url(#skin-seated)`} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="55" cy="143" r="5" fill={`url(#skin-seated)`} />
        <circle cx="125" cy="143" r="5" fill={`url(#skin-seated)`} />
        
        {/* Legs */}
        <path d="M75 140 L72 175" stroke={`url(#skin-seated)`} strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M105 140 L108 175" stroke={`url(#skin-seated)`} strokeWidth="11" strokeLinecap="round" fill="none" />
        <ellipse cx="72" cy="178" rx="9" ry="4" fill={`url(#skin-seated)`} />
        <ellipse cx="108" cy="178" rx="9" ry="4" fill={`url(#skin-seated)`} />
      </g>
    );
  }
  
  // Standing figure
  if (pose.includes('standing') || pose.includes('mountain')) {
    return (
      <g>
        {/* Body */}
        <path d="M75 90 Q90 85 105 90 L110 140 Q90 145 70 140 Z" fill={`url(#clothing-standing)`} />
        
        {/* Head with hijab */}
        <ellipse cx="90" cy="60" rx="18" ry="20" fill={`url(#skin-standing)`} />
        <path d="M68 52 Q72 35 90 32 Q108 35 112 52 Q115 70 90 78 Q65 70 68 52" fill={`url(#hijab-standing)`} />
        <path d="M70 72 Q65 90 70 105" stroke={`url(#hijab-standing)`} strokeWidth="10" fill="none" />
        
        {/* Face */}
        <ellipse cx="83" cy="58" rx="2" ry="2.5" fill="hsl(20, 30%, 25%)" />
        <ellipse cx="97" cy="58" rx="2" ry="2.5" fill="hsl(20, 30%, 25%)" />
        <path d="M85 68 Q90 71 95 68" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Arms at sides */}
        <path d="M72 95 Q60 120 58 150" stroke={`url(#skin-standing)`} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M108 95 Q120 120 122 150" stroke={`url(#skin-standing)`} strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="58" cy="153" r="5" fill={`url(#skin-standing)`} />
        <circle cx="122" cy="153" r="5" fill={`url(#skin-standing)`} />
        
        {/* Legs */}
        <path d="M78 140 L75 200" stroke={`url(#skin-standing)`} strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M102 140 L105 200" stroke={`url(#skin-standing)`} strokeWidth="11" strokeLinecap="round" fill="none" />
        <ellipse cx="75" cy="205" rx="10" ry="5" fill={`url(#skin-standing)`} />
        <ellipse cx="105" cy="205" rx="10" ry="5" fill={`url(#skin-standing)`} />
      </g>
    );
  }
  
  // Default gentle figure
  return (
    <g>
      {/* Cushion */}
      <ellipse cx="90" cy="180" rx="40" ry="10" fill="hsl(var(--secondary))" />
      
      {/* Body */}
      <ellipse cx="90" cy="145" rx="30" ry="28" fill={`url(#clothing-gentle)`} />
      
      {/* Head with hijab */}
      <ellipse cx="90" cy="80" rx="18" ry="20" fill={`url(#skin-gentle)`} />
      <path d="M68 72 Q72 55 90 52 Q108 55 112 72 Q115 90 90 98 Q65 90 68 72" fill={`url(#hijab-gentle)`} />
      <path d="M70 92 Q65 110 70 125" stroke={`url(#hijab-gentle)`} strokeWidth="10" fill="none" />
      
      {/* Peaceful closed eyes */}
      <path d="M80 78 Q85 75 90 78" stroke="hsl(20, 30%, 30%)" strokeWidth="1.5" fill="none" />
      <path d="M90 78 Q95 75 100 78" stroke="hsl(20, 30%, 30%)" strokeWidth="1.5" fill="none" />
      <path d="M85 88 Q90 91 95 88" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      
      {/* Hands in lap */}
      <circle cx="78" cy="160" r="6" fill={`url(#skin-gentle)`} />
      <circle cx="102" cy="160" r="6" fill={`url(#skin-gentle)`} />
      
      {/* Arms */}
      <path d="M72 115 Q65 135 78 160" stroke={`url(#skin-gentle)`} strokeWidth="9" fill="none" />
      <path d="M108 115 Q115 135 102 160" stroke={`url(#skin-gentle)`} strokeWidth="9" fill="none" />
    </g>
  );
};

// Pose Sequences
const chairYogaSequence: PoseStep[] = [
  {
    name: "Seated Mountain Pose",
    illustration: createFigure('seated-mountain', 'mature'),
    cues: ["Sit tall with feet flat on the floor", "Relax shoulders down and back"],
    modifications: "Use a cushion for support if needed. Place feet on a block if they don't reach the floor.",
    movementDirection: 'hold'
  },
  {
    name: "Seated Side Stretch",
    illustration: createFigure('seated-side', 'mature'),
    cues: ["Reach one arm overhead and lean gently to the side", "Keep both hips grounded on the chair"],
    modifications: "Keep arm lower if shoulder is sensitive. Only stretch as far as comfortable.",
    movementDirection: 'up'
  },
  {
    name: "Seated Cat-Cow",
    illustration: createFigure('seated-cat', 'mature'),
    cues: ["On inhale, arch back gently, lift chest", "On exhale, round spine, tuck chin"],
    modifications: "Make movements smaller if back is sensitive. Move slowly.",
    movementDirection: 'forward'
  },
  {
    name: "Seated Twist",
    illustration: createFigure('seated-twist', 'mature'),
    cues: ["Turn gently to one side, hold chair back", "Keep spine tall, breathe deeply"],
    modifications: "Only twist as far as comfortable. Keep both feet planted.",
    movementDirection: 'rotate'
  }
];

const wallYogaSequence: PoseStep[] = [
  {
    name: "Wall Mountain",
    illustration: createFigure('wall-standing', 'young'),
    cues: ["Stand with back against wall", "Press shoulders and head gently into wall"],
    modifications: "Step feet slightly away from wall if more comfortable.",
    movementDirection: 'hold'
  },
  {
    name: "Wall Chest Opener",
    illustration: createFigure('wall-chest', 'young'),
    cues: ["Place one arm on wall at shoulder height", "Turn body gently away from wall"],
    modifications: "Lower arm position if shoulder is sensitive.",
    movementDirection: 'rotate'
  },
  {
    name: "Wall Downward Dog",
    illustration: createFigure('wall-down', 'young'),
    cues: ["Place hands on wall at hip height", "Walk feet back until back is flat"],
    modifications: "Keep hands higher on wall to reduce intensity.",
    movementDirection: 'forward'
  },
  {
    name: "Wall Leg Stretch",
    illustration: createFigure('wall-leg', 'young'),
    cues: ["Face wall, place one heel on wall", "Gently lean forward for hamstring stretch"],
    modifications: "Keep foot lower on wall for gentler stretch.",
    movementDirection: 'forward'
  }
];

const restorativeSequence: PoseStep[] = [
  {
    name: "Supported Recline",
    illustration: createFigure('lying-supported', 'mature'),
    cues: ["Lie back with pillow under knees", "Let arms rest at sides, palms up"],
    modifications: "Add pillow under head if needed. Cover with blanket for warmth.",
    movementDirection: 'hold'
  },
  {
    name: "Gentle Knee Circles",
    illustration: createFigure('lying-knees', 'mature'),
    cues: ["Bring knees to chest, hold gently", "Make small circles with knees"],
    modifications: "Keep circles very small. Hold behind thighs if knees are sensitive.",
    movementDirection: 'rotate'
  },
  {
    name: "Lying Twist",
    illustration: createFigure('lying-twist', 'mature'),
    cues: ["Lower both knees to one side", "Keep shoulders relaxed on floor"],
    modifications: "Place pillow between knees for support.",
    movementDirection: 'rotate'
  },
  {
    name: "Rest Pose",
    illustration: createFigure('lying-rest', 'mature'),
    cues: ["Let body completely relax", "Focus on slow, deep breaths"],
    modifications: "Stay as long as needed. Use props for any discomfort.",
    movementDirection: 'hold'
  }
];

const breathworkSequence: PoseStep[] = [
  {
    name: "Comfortable Seat",
    illustration: createFigure('seated-breath', 'young'),
    cues: ["Find a comfortable seated position", "Close eyes or soften gaze"],
    modifications: "Sit on chair or against wall if floor is uncomfortable.",
    movementDirection: 'hold'
  },
  {
    name: "Deep Belly Breath",
    illustration: createFigure('seated-inhale', 'young'),
    cues: ["Inhale slowly, let belly expand", "Feel ribs widen gently"],
    modifications: "Place hand on belly to feel the breath movement.",
    movementDirection: 'up'
  },
  {
    name: "Gentle Exhale",
    illustration: createFigure('seated-exhale', 'young'),
    cues: ["Exhale slowly through nose or mouth", "Let shoulders drop, release tension"],
    modifications: "Make exhale longer than inhale for calming effect.",
    movementDirection: 'down'
  },
  {
    name: "Peaceful Pause",
    illustration: createFigure('seated-pause', 'young'),
    cues: ["Pause briefly at end of exhale", "Notice the stillness"],
    modifications: "Skip pause if it feels uncomfortable. Just breathe naturally.",
    movementDirection: 'hold'
  }
];

const meditationSequence: PoseStep[] = [
  {
    name: "Grounding",
    illustration: createFigure('meditation-ground', 'young'),
    cues: ["Feel your connection to the earth", "Notice where body meets cushion or chair"],
    modifications: "Sit however feels most stable and comfortable.",
    movementDirection: 'hold'
  },
  {
    name: "Softening",
    illustration: createFigure('meditation-soft', 'young'),
    cues: ["Relax face, jaw, and shoulders", "Let go of any tension you notice"],
    modifications: "Scan body slowly, releasing one area at a time.",
    movementDirection: 'hold'
  },
  {
    name: "Focusing",
    illustration: createFigure('meditation-focus', 'young'),
    cues: ["Bring attention to your breath", "Or choose a word or phrase to repeat"],
    modifications: "If mind wanders, gently return without judgment.",
    movementDirection: 'hold'
  },
  {
    name: "Resting",
    illustration: createFigure('meditation-rest', 'young'),
    cues: ["Simply be present in this moment", "No effort needed, just awareness"],
    modifications: "Start with just 2-3 minutes. Build gradually.",
    movementDirection: 'hold'
  }
];

const mobilitySequence: PoseStep[] = [
  {
    name: "Neck Circles",
    illustration: createFigure('seated-neck', 'mature'),
    cues: ["Drop chin to chest, then slowly roll ear to shoulder", "Keep movements slow and gentle"],
    modifications: "Make half circles only if full circles cause dizziness.",
    movementDirection: 'rotate'
  },
  {
    name: "Shoulder Rolls",
    illustration: createFigure('seated-shoulders', 'mature'),
    cues: ["Lift shoulders toward ears, then roll back and down", "Breathe with the movement"],
    modifications: "Make movements smaller if painful. Do one shoulder at a time if needed.",
    movementDirection: 'rotate'
  },
  {
    name: "Wrist Circles",
    illustration: createFigure('seated-wrists', 'mature'),
    cues: ["Circle wrists in both directions", "Spread fingers wide, then make gentle fists"],
    modifications: "Support forearm with other hand if needed.",
    movementDirection: 'rotate'
  },
  {
    name: "Ankle Circles",
    illustration: createFigure('seated-ankles', 'mature'),
    cues: ["Lift one foot, circle ankle slowly", "Point and flex foot gently"],
    modifications: "Keep foot on floor and just rotate heel if lifting is difficult.",
    movementDirection: 'rotate'
  }
];

const pregnancySafeSequence: PoseStep[] = [
  {
    name: "Wide-Legged Seat",
    illustration: createFigure('pregnancy-seat', 'young'),
    cues: ["Sit with legs wide, feet turned out", "Support belly with hands or pillow"],
    modifications: "Sit on cushion or bolster for more comfort.",
    movementDirection: 'hold'
  },
  {
    name: "Cat-Cow on All Fours",
    illustration: createFigure('pregnancy-cat', 'young'),
    cues: ["On hands and knees, alternate arching and rounding spine", "Move with your breath"],
    modifications: "Place blanket under knees. Keep movements gentle.",
    movementDirection: 'forward'
  },
  {
    name: "Side-Lying Rest",
    illustration: createFigure('pregnancy-side', 'young'),
    cues: ["Lie on left side with pillow between knees", "Support head and belly with pillows"],
    modifications: "This position is safe for all trimesters.",
    movementDirection: 'hold'
  },
  {
    name: "Seated Hip Opener",
    illustration: createFigure('pregnancy-hip', 'young'),
    cues: ["Sit with soles of feet together, knees out", "Let knees drop gently, don't force"],
    modifications: "Support knees with pillows if they don't reach the floor.",
    movementDirection: 'hold'
  }
];

const gentleYogaSequence: PoseStep[] = [
  {
    name: "Mountain Pose",
    illustration: createFigure('standing-mountain', 'young'),
    cues: ["Stand tall with feet hip-width apart", "Arms relaxed at sides, shoulders back"],
    modifications: "Hold onto chair or wall for balance if needed.",
    movementDirection: 'hold'
  },
  {
    name: "Gentle Forward Fold",
    illustration: createFigure('standing-fold', 'young'),
    cues: ["Bend knees, hinge at hips, let head hang", "Let arms dangle or hold opposite elbows"],
    modifications: "Keep knees bent as much as needed. Don't force the stretch.",
    movementDirection: 'down'
  },
  {
    name: "Cat-Cow Flow",
    illustration: createFigure('floor-cat', 'young'),
    cues: ["On hands and knees, arch then round spine", "Coordinate movement with breath"],
    modifications: "Place blanket under knees. Keep movement range small.",
    movementDirection: 'forward'
  },
  {
    name: "Child's Pose",
    illustration: createFigure('floor-child', 'young'),
    cues: ["Knees wide, sit back toward heels", "Reach arms forward or rest at sides"],
    modifications: "Place pillow under forehead or between hips and heels.",
    movementDirection: 'hold'
  }
];

export default PoseSequenceGuide;
