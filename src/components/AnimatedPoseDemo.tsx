import { useEffect, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnimatedPoseDemoProps {
  contentType: string;
  tags?: string[];
  title?: string;
}

type SpeedOption = 0.5 | 1 | 1.5;

// Professional human yoga animations with muscle highlights
export const AnimatedPoseDemo = ({ contentType, tags = [], title = "" }: AnimatedPoseDemoProps) => {
  const [currentPose, setCurrentPose] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<SpeedOption>(1);
  const [showMuscles, setShowMuscles] = useState(true);
  
  const getAnimationType = () => {
    const tagList = tags.map(t => t.toLowerCase());
    
    if (tagList.some(t => ['chair-yoga', 'seated', 'chair'].includes(t))) return 'chair-yoga';
    if (tagList.some(t => ['breathwork', 'breathing', 'pranayama'].includes(t))) return 'breathwork';
    if (tagList.some(t => ['meditation', 'mindfulness', 'relaxation'].includes(t))) return 'meditation';
    if (tagList.some(t => ['mobility', 'stretching', 'gentle-stretch', 'arthritis'].includes(t))) return 'mobility';
    if (tagList.some(t => ['wall-yoga', 'wall-supported'].includes(t))) return 'wall-yoga';
    if (tagList.some(t => ['bed-yoga', 'restorative', 'lying'].includes(t))) return 'restorative';
    if (tagList.some(t => ['standing', 'balance'].includes(t))) return 'standing';
    if (tagList.some(t => ['nutrition', 'recipe', 'food', 'meal'].includes(t))) return 'nutrition';
    if (tagList.some(t => ['pregnancy', 'prenatal'].includes(t))) return 'pregnancy-safe';
    if (tagList.some(t => ['floor', 'beginner-floor'].includes(t))) return 'floor-yoga';
    if (contentType === 'meditation') return 'meditation';
    if (contentType === 'breathwork') return 'breathwork';
    if (contentType === 'yoga') return 'gentle-yoga';
    if (contentType === 'nutrition') return 'nutrition';
    
    return 'gentle-yoga';
  };

  const animationType = getAnimationType();
  const intervalTime = 3000 / speed;

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentPose(prev => (prev + 1) % 4);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [isPlaying, intervalTime]);

  const handleReplay = useCallback(() => {
    setCurrentPose(0);
    setIsPlaying(true);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeed(prev => {
      if (prev === 0.5) return 1;
      if (prev === 1) return 1.5;
      return 0.5;
    });
  }, []);

  return (
    <div className="aspect-video bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-lg overflow-hidden relative">
      {/* Soft background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="softDots" patternUnits="userSpaceOnUse" width="15" height="15">
              <circle cx="7.5" cy="7.5" r="0.8" fill="hsl(var(--primary))" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#softDots)" />
        </svg>
      </div>

      {/* Animation Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pb-16">
        {animationType === 'chair-yoga' && <ChairYogaHuman pose={currentPose} showMuscles={showMuscles} />}
        {animationType === 'breathwork' && <BreathworkHuman showMuscles={showMuscles} />}
        {animationType === 'meditation' && <MeditationHuman />}
        {animationType === 'mobility' && <MobilityHuman pose={currentPose} showMuscles={showMuscles} />}
        {animationType === 'wall-yoga' && <WallYogaHuman pose={currentPose} showMuscles={showMuscles} />}
        {animationType === 'restorative' && <RestorativeHuman showMuscles={showMuscles} />}
        {animationType === 'standing' && <StandingHuman pose={currentPose} showMuscles={showMuscles} />}
        {animationType === 'gentle-yoga' && <GentleYogaHuman pose={currentPose} showMuscles={showMuscles} />}
        {animationType === 'nutrition' && <NutritionAnimation />}
        {animationType === 'pregnancy-safe' && <PregnancySafeHuman pose={currentPose} showMuscles={showMuscles} />}
        {animationType === 'floor-yoga' && <FloorYogaHuman pose={currentPose} showMuscles={showMuscles} />}
      </div>

      {/* Playback Controls */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplay}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleSpeed}
              className="h-8 px-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-xs gap-1"
            >
              <Gauge className="h-3 w-3" />
              {speed}x
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMuscles(!showMuscles)}
              className={`text-xs px-2 py-1 rounded-full transition-all ${
                showMuscles 
                  ? 'bg-accent/30 text-accent-foreground' 
                  : 'bg-background/80 text-muted-foreground'
              }`}
            >
              Muscles {showMuscles ? 'On' : 'Off'}
            </button>
            <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
              Follow along gently
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Realistic human figure component for chair yoga
const ChairYogaHuman = ({ pose, showMuscles }: { pose: number; showMuscles: boolean }) => {
  const poses = [
    { label: 'Seated Mountain', muscles: ['core', 'back'] },
    { label: 'Arms Overhead Stretch', muscles: ['shoulders', 'arms', 'back'] },
    { label: 'Seated Side Stretch', muscles: ['obliques', 'shoulders'] },
    { label: 'Gentle Seated Twist', muscles: ['core', 'back', 'obliques'] },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-44 h-44 md:w-60 md:h-60">
        <defs>
          <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
          <linearGradient id="clothingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(280, 35%, 55%)" />
          </linearGradient>
          <linearGradient id="muscleHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Chair */}
        <rect x="45" y="135" width="110" height="8" rx="3" fill="hsl(var(--muted))" />
        <rect x="140" y="75" width="12" height="68" rx="3" fill="hsl(var(--muted))" />
        <rect x="48" y="143" width="8" height="35" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
        <rect x="144" y="143" width="8" height="35" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />
        
        {/* Body - torso with clothing */}
        <path 
          d={pose === 2 
            ? "M75 95 Q100 85 125 95 L130 130 Q100 135 70 130 Z"
            : "M80 95 Q100 90 120 95 L125 130 Q100 135 75 130 Z"
          }
          fill="url(#clothingGradient)"
          className="transition-all duration-700"
          style={{
            transform: pose === 3 ? 'rotate(-8deg)' : pose === 2 ? 'skewX(-5deg)' : 'none',
            transformOrigin: '100px 112px'
          }}
        />
        
        {/* Muscle highlights on torso */}
        {showMuscles && currentPoseData.muscles.includes('core') && (
          <ellipse cx="100" cy="115" rx="15" ry="20" fill="url(#muscleHighlight)" className="animate-pulse" opacity="0.6" />
        )}
        {showMuscles && currentPoseData.muscles.includes('back') && (
          <ellipse cx="100" cy="105" rx="20" ry="15" fill="url(#muscleHighlight)" className="animate-pulse" opacity="0.5" />
        )}
        {showMuscles && currentPoseData.muscles.includes('obliques') && (
          <>
            <ellipse cx="82" cy="115" rx="8" ry="15" fill="url(#muscleHighlight)" className="animate-pulse" opacity="0.5" />
            <ellipse cx="118" cy="115" rx="8" ry="15" fill="url(#muscleHighlight)" className="animate-pulse" opacity="0.5" />
          </>
        )}
        
        {/* Head */}
        <ellipse cx="100" cy="68" rx="18" ry="20" fill="url(#skinTone)" />
        
        {/* Hijab/Head covering - flowing and natural */}
        <path 
          d="M78 60 Q82 45 100 42 Q118 45 122 60 Q125 75 120 85 Q100 95 80 85 Q75 75 78 60" 
          fill="url(#clothingGradient)"
        />
        <path 
          d="M80 85 Q75 100 78 115 Q80 118 82 115 Q80 100 85 88" 
          fill="url(#clothingGradient)"
          opacity="0.9"
        />
        
        {/* Face - warm, friendly expression */}
        <ellipse cx="93" cy="68" rx="2.5" ry="3" fill="hsl(20, 30%, 25%)" />
        <ellipse cx="107" cy="68" rx="2.5" ry="3" fill="hsl(20, 30%, 25%)" />
        <path d="M95 78 Q100 82 105 78" stroke="hsl(20, 30%, 35%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Arms with natural anatomy */}
        <g className="transition-all duration-700 ease-out">
          {pose === 0 && (
            <>
              {/* Arms resting on thighs */}
              <path d="M80 100 Q70 115 68 132" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M120 100 Q130 115 132 132" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" />
              <circle cx="68" cy="135" r="6" fill="url(#skinTone)" />
              <circle cx="132" cy="135" r="6" fill="url(#skinTone)" />
            </>
          )}
          {pose === 1 && (
            <>
              {/* Arms raised overhead */}
              <path d="M82 98 Q75 70 80 45" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" className="animate-pulse" />
              <path d="M118 98 Q125 70 120 45" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" className="animate-pulse" />
              <circle cx="80" cy="42" r="6" fill="url(#skinTone)" />
              <circle cx="120" cy="42" r="6" fill="url(#skinTone)" />
              {showMuscles && (
                <>
                  <ellipse cx="78" cy="75" rx="8" ry="15" fill="url(#muscleHighlight)" className="animate-pulse" opacity="0.6" />
                  <ellipse cx="122" cy="75" rx="8" ry="15" fill="url(#muscleHighlight)" className="animate-pulse" opacity="0.6" />
                </>
              )}
            </>
          )}
          {pose === 2 && (
            <>
              {/* Side stretch - one arm up, one down */}
              <path d="M85 100 Q65 115 60 130" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M115 95 Q135 60 150 40" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" className="animate-pulse" />
              <circle cx="60" cy="133" r="6" fill="url(#skinTone)" />
              <circle cx="152" cy="38" r="6" fill="url(#skinTone)" />
              {showMuscles && (
                <ellipse cx="125" cy="70" rx="10" ry="20" fill="url(#muscleHighlight)" className="animate-pulse" opacity="0.6" />
              )}
            </>
          )}
          {pose === 3 && (
            <>
              {/* Gentle twist - arms crossed */}
              <path d="M85 100 Q110 105 135 95" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M115 100 Q90 110 65 105" stroke="url(#skinTone)" strokeWidth="10" strokeLinecap="round" fill="none" />
              <circle cx="137" cy="95" r="6" fill="url(#skinTone)" />
              <circle cx="63" cy="105" r="6" fill="url(#skinTone)" />
            </>
          )}
        </g>
        
        {/* Legs */}
        <path d="M85 130 L82 165 L78 175" stroke="url(#skinTone)" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M115 130 L118 165 L122 175" stroke="url(#skinTone)" strokeWidth="12" strokeLinecap="round" fill="none" />
        
        {/* Feet */}
        <ellipse cx="78" cy="178" rx="10" ry="5" fill="url(#skinTone)" />
        <ellipse cx="122" cy="178" rx="10" ry="5" fill="url(#skinTone)" />
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles && `Working: ${currentPoseData.muscles.join(', ')}`}
        </p>
        <PoseIndicator current={pose} total={poses.length} />
      </div>
    </div>
  );
};

// Breathwork with visible ribcage/diaphragm movement
const BreathworkHuman = ({ showMuscles }: { showMuscles: boolean }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg viewBox="0 0 200 200" className="w-44 h-44 md:w-56 md:h-56">
          <defs>
            <linearGradient id="skinToneBreath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
              <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
            </linearGradient>
          </defs>
          
          {/* Cushion */}
          <ellipse cx="100" cy="170" rx="45" ry="10" fill="hsl(var(--secondary))" />
          
          {/* Body - seated meditation pose */}
          <ellipse cx="100" cy="140" rx="35" ry="30" fill="hsl(var(--accent))" className="animate-breathe" />
          
          {/* Diaphragm/chest area showing breath */}
          {showMuscles && (
            <ellipse cx="100" cy="120" rx="25" ry="20" fill="hsl(var(--primary))" opacity="0.25" className="animate-breathe" />
          )}
          
          {/* Head */}
          <ellipse cx="100" cy="75" rx="20" ry="22" fill="url(#skinToneBreath)" />
          
          {/* Hijab */}
          <path 
            d="M76 68 Q80 48 100 45 Q120 48 124 68 Q127 90 100 98 Q73 90 76 68" 
            fill="hsl(var(--accent))"
          />
          <path d="M78 90 Q72 110 78 125" stroke="hsl(var(--accent))" strokeWidth="12" fill="none" />
          
          {/* Closed eyes - peaceful */}
          <path d="M88 76 Q93 73 98 76" stroke="hsl(20, 30%, 30%)" strokeWidth="2" fill="none" />
          <path d="M102 76 Q107 73 112 76" stroke="hsl(20, 30%, 30%)" strokeWidth="2" fill="none" />
          
          {/* Gentle smile */}
          <path d="M94 86 Q100 90 106 86" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          
          {/* Hands in lap */}
          <circle cx="85" cy="155" r="8" fill="url(#skinToneBreath)" />
          <circle cx="115" cy="155" r="8" fill="url(#skinToneBreath)" />
          
          {/* Arms */}
          <path d="M82 110 Q75 130 85 155" stroke="url(#skinToneBreath)" strokeWidth="10" fill="none" />
          <path d="M118 110 Q125 130 115 155" stroke="url(#skinToneBreath)" strokeWidth="10" fill="none" />
          
          {/* Breath visualization rings */}
          <circle cx="100" cy="110" r="50" stroke="hsl(var(--accent))" strokeWidth="1" fill="none" opacity="0.3" className="animate-breathe-ring" />
          <circle cx="100" cy="110" r="60" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="none" opacity="0.2" className="animate-breathe-ring" style={{ animationDelay: '1s' }} />
        </svg>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground animate-breathe-text">Breathe deeply</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles ? 'Expanding: diaphragm, intercostals' : 'Follow the gentle rhythm'}
        </p>
      </div>
    </div>
  );
};

// Meditation figure
const MeditationHuman = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-44 h-44 md:w-56 md:h-56">
        <defs>
          <linearGradient id="skinToneMed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
          <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Aura glow */}
        <circle cx="100" cy="110" r="75" fill="url(#auraGlow)" className="animate-pulse" />
        
        {/* Cushion */}
        <ellipse cx="100" cy="168" rx="40" ry="10" fill="hsl(var(--secondary))" />
        
        {/* Crossed legs */}
        <path d="M70 160 Q100 175 130 160" stroke="url(#skinToneMed)" strokeWidth="14" fill="none" />
        
        {/* Body */}
        <ellipse cx="100" cy="135" rx="28" ry="30" fill="hsl(var(--accent))" />
        
        {/* Head */}
        <ellipse cx="100" cy="78" rx="20" ry="22" fill="url(#skinToneMed)" />
        
        {/* Hijab */}
        <path 
          d="M76 72 Q80 50 100 47 Q120 50 124 72 Q128 95 100 102 Q72 95 76 72" 
          fill="hsl(var(--accent))"
        />
        <path d="M78 95 Q70 115 75 135" stroke="hsl(var(--accent))" strokeWidth="14" fill="none" />
        
        {/* Peaceful closed eyes */}
        <path d="M88 80 Q93 77 98 80" stroke="hsl(20, 30%, 30%)" strokeWidth="2" fill="none" />
        <path d="M102 80 Q107 77 112 80" stroke="hsl(20, 30%, 30%)" strokeWidth="2" fill="none" />
        
        {/* Serene smile */}
        <path d="M94 90 Q100 94 106 90" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Hands in mudra position */}
        <circle cx="75" cy="150" r="7" fill="url(#skinToneMed)" />
        <circle cx="125" cy="150" r="7" fill="url(#skinToneMed)" />
        <path d="M82 115 Q70 135 75 150" stroke="url(#skinToneMed)" strokeWidth="10" fill="none" />
        <path d="M118 115 Q130 135 125 150" stroke="url(#skinToneMed)" strokeWidth="10" fill="none" />
      </svg>
      
      <p className="text-sm text-muted-foreground">Find your inner stillness</p>
    </div>
  );
};

// Mobility/Stretching with joint highlights
const MobilityHuman = ({ pose, showMuscles }: { pose: number; showMuscles: boolean }) => {
  const poses = [
    { label: 'Neck Rolls', muscles: ['neck', 'trapezius'] },
    { label: 'Shoulder Circles', muscles: ['shoulders', 'upper back'] },
    { label: 'Wrist Rotations', muscles: ['forearms', 'wrists'] },
    { label: 'Ankle Circles', muscles: ['calves', 'ankles'] },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-44 h-44 md:w-60 md:h-60">
        <defs>
          <linearGradient id="skinToneMob" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Chair */}
        <rect x="50" y="140" width="100" height="8" rx="3" fill="hsl(var(--muted))" />
        <rect x="135" y="85" width="10" height="63" rx="2" fill="hsl(var(--muted))" />
        
        {/* Body */}
        <ellipse cx="100" cy="115" rx="25" ry="28" fill="hsl(var(--accent))" />
        
        {/* Head with rotation based on pose */}
        <g 
          className="transition-all duration-700"
          style={{ 
            transform: pose === 0 
              ? `rotate(${Math.sin(Date.now() / 1000) * 15}deg)` 
              : 'rotate(0deg)',
            transformOrigin: '100px 75px'
          }}
        >
          <ellipse cx="100" cy="65" rx="18" ry="20" fill="url(#skinToneMob)" />
          <path d="M80 60 Q85 42 100 40 Q115 42 120 60 Q122 78 100 85 Q78 78 80 60" fill="hsl(var(--accent))" />
          <circle cx="94" cy="65" r="2" fill="hsl(20, 30%, 25%)" />
          <circle cx="106" cy="65" r="2" fill="hsl(20, 30%, 25%)" />
          <path d="M95 75 Q100 78 105 75" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" />
          
          {/* Neck muscle highlight */}
          {showMuscles && pose === 0 && (
            <ellipse cx="100" cy="82" rx="8" ry="10" fill="hsl(var(--primary))" opacity="0.4" className="animate-pulse" />
          )}
        </g>
        
        {/* Shoulders with circles */}
        <g>
          <circle 
            cx="72" 
            cy="100" 
            r="10" 
            fill="url(#skinToneMob)"
            className={pose === 1 ? 'animate-shoulder-circle' : ''}
          />
          <circle 
            cx="128" 
            cy="100" 
            r="10" 
            fill="url(#skinToneMob)"
            className={pose === 1 ? 'animate-shoulder-circle-reverse' : ''}
          />
          
          {/* Shoulder muscle highlights */}
          {showMuscles && pose === 1 && (
            <>
              <circle cx="72" cy="100" r="15" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
              <circle cx="128" cy="100" r="15" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
            </>
          )}
        </g>
        
        {/* Arms */}
        <path d="M82 100 L75 135" stroke="url(#skinToneMob)" strokeWidth="10" fill="none" />
        <path d="M118 100 L125 135" stroke="url(#skinToneMob)" strokeWidth="10" fill="none" />
        
        {/* Hands with wrist rotation */}
        <circle 
          cx="75" 
          cy="140" 
          r="7" 
          fill="url(#skinToneMob)"
          className={pose === 2 ? 'animate-wrist-rotate' : ''}
        />
        <circle 
          cx="125" 
          cy="140" 
          r="7" 
          fill="url(#skinToneMob)"
          className={pose === 2 ? 'animate-wrist-rotate' : ''}
        />
        
        {/* Wrist highlights */}
        {showMuscles && pose === 2 && (
          <>
            <circle cx="75" cy="140" r="12" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
            <circle cx="125" cy="140" r="12" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
          </>
        )}
        
        {/* Legs */}
        <path d="M90 140 L88 175" stroke="url(#skinToneMob)" strokeWidth="12" fill="none" />
        <path d="M110 140 L112 175" stroke="url(#skinToneMob)" strokeWidth="12" fill="none" />
        
        {/* Feet with ankle rotation */}
        <ellipse 
          cx="88" 
          cy="180" 
          rx="12" 
          ry="6" 
          fill="url(#skinToneMob)"
          className={pose === 3 ? 'animate-wrist-rotate' : ''}
        />
        <ellipse 
          cx="112" 
          cy="180" 
          rx="12" 
          ry="6" 
          fill="url(#skinToneMob)"
          className={pose === 3 ? 'animate-wrist-rotate' : ''}
        />
        
        {/* Ankle highlights */}
        {showMuscles && pose === 3 && (
          <>
            <circle cx="88" cy="175" r="10" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
            <circle cx="112" cy="175" r="10" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
          </>
        )}
        
        {/* Movement indicator circles */}
        {pose === 1 && (
          <>
            <circle cx="72" cy="100" r="18" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.5" />
            <circle cx="128" cy="100" r="18" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.5" />
          </>
        )}
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles && `Working: ${currentPoseData.muscles.join(', ')}`}
        </p>
        <PoseIndicator current={pose} total={poses.length} />
      </div>
    </div>
  );
};

// Wall Yoga Human
const WallYogaHuman = ({ pose, showMuscles }: { pose: number; showMuscles: boolean }) => {
  const poses = [
    { label: 'Wall Support Stand', muscles: ['legs', 'core'] },
    { label: 'Wall Chest Opener', muscles: ['chest', 'shoulders'] },
    { label: 'Wall Forward Fold', muscles: ['hamstrings', 'back'] },
    { label: 'Wall Rest Position', muscles: ['full body relax'] },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-44 h-44 md:w-60 md:h-60">
        <defs>
          <linearGradient id="skinToneWall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Wall */}
        <rect x="155" y="20" width="15" height="165" fill="hsl(var(--muted))" rx="2" />
        
        {/* Floor */}
        <line x1="20" y1="185" x2="180" y2="185" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Figure changes based on pose */}
        <g className="transition-all duration-700">
          {pose === 0 && (
            <>
              {/* Standing with back to wall */}
              <ellipse cx="130" cy="115" rx="20" ry="35" fill="hsl(var(--accent))" />
              <ellipse cx="130" cy="60" rx="18" ry="20" fill="url(#skinToneWall)" />
              <path d="M110 55 Q115 38 130 35 Q145 38 150 55 Q152 72 130 78 Q108 72 110 55" fill="hsl(var(--accent))" />
              <circle cx="124" cy="58" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="136" cy="58" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M125 68 Q130 72 135 68" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" />
              <path d="M115 95 L100 130" stroke="url(#skinToneWall)" strokeWidth="10" fill="none" />
              <path d="M145 95 L155 110" stroke="url(#skinToneWall)" strokeWidth="10" fill="none" />
              <path d="M120 150 L115 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
              <path d="M140 150 L145 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
              {showMuscles && (
                <ellipse cx="130" cy="165" rx="15" ry="25" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
              )}
            </>
          )}
          {pose === 1 && (
            <>
              {/* Chest opener against wall */}
              <ellipse cx="120" cy="115" rx="22" ry="35" fill="hsl(var(--accent))" />
              <ellipse cx="120" cy="60" rx="18" ry="20" fill="url(#skinToneWall)" />
              <path d="M100 55 Q105 38 120 35 Q135 38 140 55 Q142 72 120 78 Q98 72 100 55" fill="hsl(var(--accent))" />
              <circle cx="114" cy="58" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="126" cy="58" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M138 90 L155 70" stroke="url(#skinToneWall)" strokeWidth="10" fill="none" className="animate-pulse" />
              <path d="M138 100 L155 120" stroke="url(#skinToneWall)" strokeWidth="10" fill="none" />
              <path d="M110 150 L105 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
              <path d="M130 150 L135 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
              {showMuscles && (
                <ellipse cx="130" cy="100" rx="20" ry="15" fill="hsl(var(--primary))" opacity="0.35" className="animate-pulse" />
              )}
            </>
          )}
          {pose === 2 && (
            <>
              {/* Forward fold with wall support */}
              <ellipse cx="100" cy="130" rx="30" ry="18" fill="hsl(var(--accent))" style={{ transform: 'rotate(-45deg)', transformOrigin: '100px 130px' }} />
              <ellipse cx="70" cy="115" rx="16" ry="18" fill="url(#skinToneWall)" />
              <path d="M52 110 Q58 95 70 92 Q82 95 88 110 Q90 125 70 130 Q50 125 52 110" fill="hsl(var(--accent))" />
              <path d="M100 120 L155 100" stroke="url(#skinToneWall)" strokeWidth="8" fill="none" />
              <path d="M120 145 L125 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
              <path d="M135 135 L145 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
              {showMuscles && (
                <ellipse cx="130" cy="160" rx="12" ry="25" fill="hsl(var(--primary))" opacity="0.35" className="animate-pulse" />
              )}
            </>
          )}
          {pose === 3 && (
            <>
              {/* Resting against wall */}
              <ellipse cx="130" cy="120" rx="20" ry="32" fill="hsl(var(--accent))" />
              <ellipse cx="130" cy="68" rx="17" ry="19" fill="url(#skinToneWall)" />
              <path d="M111 63 Q116 48 130 45 Q144 48 149 63 Q151 78 130 84 Q109 78 111 63" fill="hsl(var(--accent))" />
              <path d="M122 68 Q127 65 132 68" stroke="hsl(20, 30%, 30%)" strokeWidth="2" fill="none" />
              <path d="M134 68 Q139 65 144 68" stroke="hsl(20, 30%, 30%)" strokeWidth="2" fill="none" />
              <path d="M115 100 L95 125" stroke="url(#skinToneWall)" strokeWidth="10" fill="none" />
              <path d="M145 100 L155 110" stroke="url(#skinToneWall)" strokeWidth="10" fill="none" />
              <path d="M120 152 L115 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
              <path d="M140 152 L145 183" stroke="url(#skinToneWall)" strokeWidth="12" fill="none" />
            </>
          )}
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles && `Working: ${currentPoseData.muscles.join(', ')}`}
        </p>
        <PoseIndicator current={pose} total={poses.length} />
      </div>
    </div>
  );
};

// Restorative/Bed Yoga Human
const RestorativeHuman = ({ showMuscles }: { showMuscles: boolean }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 120" className="w-52 h-32 md:w-72 md:h-40">
        <defs>
          <linearGradient id="skinToneRest" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Bed/mat */}
        <rect x="15" y="70" width="190" height="18" rx="4" fill="hsl(var(--secondary))" />
        <rect x="10" y="88" width="200" height="10" rx="3" fill="hsl(var(--muted))" />
        
        {/* Pillow */}
        <ellipse cx="45" cy="62" rx="25" ry="12" fill="hsl(var(--accent))" opacity="0.8" />
        
        {/* Lying figure */}
        <ellipse cx="110" cy="55" rx="55" ry="15" fill="hsl(var(--accent))" className="animate-breathe-subtle" />
        
        {/* Back muscle highlight */}
        {showMuscles && (
          <ellipse cx="110" cy="55" rx="45" ry="12" fill="hsl(var(--primary))" opacity="0.25" className="animate-breathe-subtle" />
        )}
        
        {/* Head on pillow */}
        <ellipse cx="45" cy="48" rx="16" ry="18" fill="url(#skinToneRest)" />
        
        {/* Hijab - lying down */}
        <ellipse cx="45" cy="42" rx="20" ry="14" fill="hsl(var(--accent))" />
        
        {/* Peaceful closed eyes */}
        <path d="M38 50 L42 48" stroke="hsl(20, 30%, 30%)" strokeWidth="1.5" fill="none" />
        <path d="M48 50 L52 48" stroke="hsl(20, 30%, 30%)" strokeWidth="1.5" fill="none" />
        
        {/* Arms resting beside body */}
        <path d="M75 55 L78 72" stroke="url(#skinToneRest)" strokeWidth="8" fill="none" />
        <path d="M145 55 L142 72" stroke="url(#skinToneRest)" strokeWidth="8" fill="none" />
        <circle cx="78" cy="75" r="5" fill="url(#skinToneRest)" />
        <circle cx="142" cy="75" r="5" fill="url(#skinToneRest)" />
        
        {/* Legs */}
        <path d="M155 55 L185 58" stroke="url(#skinToneRest)" strokeWidth="12" fill="none" />
        <path d="M160 60 L190 63" stroke="url(#skinToneRest)" strokeWidth="12" fill="none" />
        
        {/* Feet */}
        <ellipse cx="190" cy="58" rx="8" ry="5" fill="url(#skinToneRest)" />
        <ellipse cx="195" cy="63" rx="8" ry="5" fill="url(#skinToneRest)" />
        
        {/* Peaceful aura */}
        <ellipse cx="110" cy="50" rx="85" ry="30" stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.3" className="animate-pulse" />
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Restorative Rest</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles ? 'Releasing: full body tension' : 'Let your body relax completely'}
        </p>
      </div>
    </div>
  );
};

// Standing Yoga Human
const StandingHuman = ({ pose, showMuscles }: { pose: number; showMuscles: boolean }) => {
  const poses = [
    { label: 'Mountain Pose', muscles: ['legs', 'core'] },
    { label: 'Arms Raised', muscles: ['shoulders', 'arms', 'core'] },
    { label: 'Tree Pose', muscles: ['legs', 'core', 'balance'] },
    { label: 'Standing Forward Fold', muscles: ['hamstrings', 'back'] },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-44 h-44 md:w-60 md:h-60">
        <defs>
          <linearGradient id="skinToneStand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Floor */}
        <line x1="40" y1="188" x2="160" y2="188" stroke="hsl(var(--border))" strokeWidth="2" />
        
        <g className="transition-all duration-700">
          {pose === 0 && (
            <>
              {/* Mountain pose - standing tall */}
              <ellipse cx="100" cy="110" rx="22" ry="38" fill="hsl(var(--accent))" />
              <ellipse cx="100" cy="55" rx="18" ry="20" fill="url(#skinToneStand)" />
              <path d="M80 50 Q85 32 100 30 Q115 32 120 50 Q122 68 100 74 Q78 68 80 50" fill="hsl(var(--accent))" />
              <circle cx="94" cy="53" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="106" cy="53" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M95 63 Q100 67 105 63" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" />
              <path d="M82 85 L70 130" stroke="url(#skinToneStand)" strokeWidth="10" fill="none" />
              <path d="M118 85 L130 130" stroke="url(#skinToneStand)" strokeWidth="10" fill="none" />
              <circle cx="70" cy="133" r="6" fill="url(#skinToneStand)" />
              <circle cx="130" cy="133" r="6" fill="url(#skinToneStand)" />
              <path d="M92 148 L88 185" stroke="url(#skinToneStand)" strokeWidth="13" fill="none" />
              <path d="M108 148 L112 185" stroke="url(#skinToneStand)" strokeWidth="13" fill="none" />
              {showMuscles && (
                <ellipse cx="100" cy="165" rx="18" ry="28" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
              )}
            </>
          )}
          {pose === 1 && (
            <>
              {/* Arms raised */}
              <ellipse cx="100" cy="115" rx="22" ry="38" fill="hsl(var(--accent))" />
              <ellipse cx="100" cy="58" rx="18" ry="20" fill="url(#skinToneStand)" />
              <path d="M80 53 Q85 35 100 32 Q115 35 120 53 Q122 70 100 76 Q78 70 80 53" fill="hsl(var(--accent))" />
              <circle cx="94" cy="56" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="106" cy="56" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M95 66 Q100 70 105 66" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" />
              <path d="M85 85 L75 35" stroke="url(#skinToneStand)" strokeWidth="10" fill="none" className="animate-pulse" />
              <path d="M115 85 L125 35" stroke="url(#skinToneStand)" strokeWidth="10" fill="none" className="animate-pulse" />
              <circle cx="75" cy="32" r="6" fill="url(#skinToneStand)" />
              <circle cx="125" cy="32" r="6" fill="url(#skinToneStand)" />
              <path d="M92 152 L88 185" stroke="url(#skinToneStand)" strokeWidth="13" fill="none" />
              <path d="M108 152 L112 185" stroke="url(#skinToneStand)" strokeWidth="13" fill="none" />
              {showMuscles && (
                <>
                  <ellipse cx="80" cy="60" rx="10" ry="20" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
                  <ellipse cx="120" cy="60" rx="10" ry="20" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
                </>
              )}
            </>
          )}
          {pose === 2 && (
            <>
              {/* Tree pose */}
              <ellipse cx="100" cy="115" rx="22" ry="38" fill="hsl(var(--accent))" />
              <ellipse cx="100" cy="58" rx="18" ry="20" fill="url(#skinToneStand)" />
              <path d="M80 53 Q85 35 100 32 Q115 35 120 53 Q122 70 100 76 Q78 70 80 53" fill="hsl(var(--accent))" />
              <circle cx="94" cy="56" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="106" cy="56" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M95 66 Q100 70 105 66" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" />
              {/* Arms in prayer position overhead */}
              <path d="M88 85 Q75 50 90 25" stroke="url(#skinToneStand)" strokeWidth="9" fill="none" />
              <path d="M112 85 Q125 50 110 25" stroke="url(#skinToneStand)" strokeWidth="9" fill="none" />
              <ellipse cx="100" cy="22" rx="12" ry="6" fill="url(#skinToneStand)" />
              {/* Standing leg */}
              <path d="M95 152 L92 185" stroke="url(#skinToneStand)" strokeWidth="13" fill="none" />
              {/* Bent leg */}
              <path d="M108 150 Q125 145 115 125" stroke="url(#skinToneStand)" strokeWidth="11" fill="none" />
              {showMuscles && (
                <ellipse cx="95" cy="168" rx="12" ry="22" fill="hsl(var(--primary))" opacity="0.35" className="animate-pulse" />
              )}
            </>
          )}
          {pose === 3 && (
            <>
              {/* Forward fold */}
              <ellipse cx="100" cy="120" rx="28" ry="20" fill="hsl(var(--accent))" style={{ transform: 'rotate(-60deg)', transformOrigin: '100px 140px' }} />
              <ellipse cx="68" cy="95" rx="16" ry="18" fill="url(#skinToneStand)" />
              <path d="M50 90 Q56 75 68 72 Q80 75 86 90 Q88 105 68 110 Q48 105 50 90" fill="hsl(var(--accent))" />
              <path d="M82 108 Q90 140 85 165" stroke="url(#skinToneStand)" strokeWidth="9" fill="none" />
              <path d="M88 115 Q98 145 95 165" stroke="url(#skinToneStand)" strokeWidth="9" fill="none" />
              <circle cx="85" cy="168" r="5" fill="url(#skinToneStand)" />
              <circle cx="95" cy="168" r="5" fill="url(#skinToneStand)" />
              <path d="M105 135 L108 185" stroke="url(#skinToneStand)" strokeWidth="13" fill="none" />
              <path d="M118 130 L125 185" stroke="url(#skinToneStand)" strokeWidth="13" fill="none" />
              {showMuscles && (
                <ellipse cx="115" cy="158" rx="15" ry="28" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
              )}
            </>
          )}
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles && `Working: ${currentPoseData.muscles.join(', ')}`}
        </p>
        <PoseIndicator current={pose} total={poses.length} />
      </div>
    </div>
  );
};

// Gentle Yoga Human (default)
const GentleYogaHuman = ({ pose, showMuscles }: { pose: number; showMuscles: boolean }) => {
  const poses = [
    { label: 'Cat-Cow Stretch', muscles: ['spine', 'core', 'back'] },
    { label: 'Child\'s Pose', muscles: ['back', 'hips', 'shoulders'] },
    { label: 'Gentle Seated Twist', muscles: ['spine', 'obliques'] },
    { label: 'Seated Forward Fold', muscles: ['hamstrings', 'back'] },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 150" className="w-52 h-36 md:w-68 md:h-44">
        <defs>
          <linearGradient id="skinToneGentle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Mat */}
        <rect x="25" y="115" width="170" height="10" rx="3" fill="hsl(var(--secondary))" />
        
        <g className="transition-all duration-700">
          {pose === 0 && (
            <>
              {/* Cat-Cow on all fours */}
              <ellipse cx="110" cy="75" rx="42" ry="22" fill="hsl(var(--accent))" className="animate-cat-cow" />
              {showMuscles && (
                <ellipse cx="110" cy="75" rx="35" ry="18" fill="hsl(var(--primary))" opacity="0.25" className="animate-cat-cow" />
              )}
              <ellipse cx="55" cy="68" rx="16" ry="18" fill="url(#skinToneGentle)" />
              <path d="M37 63 Q43 48 55 45 Q67 48 73 63 Q75 78 55 83 Q35 78 37 63" fill="hsl(var(--accent))" />
              <circle cx="49" cy="66" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="61" cy="66" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M50 75 Q55 78 60 75" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" />
              {/* Arms */}
              <path d="M75 90 L68 113" stroke="url(#skinToneGentle)" strokeWidth="10" fill="none" />
              <path d="M92 95 L85 113" stroke="url(#skinToneGentle)" strokeWidth="10" fill="none" />
              {/* Legs */}
              <path d="M128 95 L135 113" stroke="url(#skinToneGentle)" strokeWidth="10" fill="none" />
              <path d="M145 90 L152 113" stroke="url(#skinToneGentle)" strokeWidth="10" fill="none" />
            </>
          )}
          {pose === 1 && (
            <>
              {/* Child's pose */}
              <ellipse cx="110" cy="95" rx="48" ry="18" fill="hsl(var(--accent))" />
              {showMuscles && (
                <ellipse cx="110" cy="95" rx="40" ry="14" fill="hsl(var(--primary))" opacity="0.2" />
              )}
              <ellipse cx="55" cy="98" rx="16" ry="16" fill="url(#skinToneGentle)" />
              <ellipse cx="55" cy="94" rx="18" ry="12" fill="hsl(var(--accent))" />
              {/* Arms stretched forward */}
              <path d="M80 92 L45 110" stroke="url(#skinToneGentle)" strokeWidth="9" fill="none" />
              <path d="M140 92 L175 110" stroke="url(#skinToneGentle)" strokeWidth="9" fill="none" />
              <circle cx="42" cy="112" r="5" fill="url(#skinToneGentle)" />
              <circle cx="178" cy="112" r="5" fill="url(#skinToneGentle)" />
            </>
          )}
          {pose === 2 && (
            <>
              {/* Seated twist */}
              <ellipse cx="110" cy="90" rx="28" ry="25" fill="hsl(var(--accent))" style={{ transform: 'rotate(-8deg)', transformOrigin: '110px 90px' }} />
              {showMuscles && (
                <>
                  <ellipse cx="95" cy="90" rx="10" ry="18" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                  <ellipse cx="125" cy="90" rx="10" ry="18" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                </>
              )}
              <ellipse cx="110" cy="50" rx="17" ry="19" fill="url(#skinToneGentle)" />
              <path d="M91 45 Q96 30 110 28 Q124 30 129 45 Q131 60 110 66 Q89 60 91 45" fill="hsl(var(--accent))" />
              <circle cx="104" cy="48" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="116" cy="48" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M105 57 Q110 60 115 57" stroke="hsl(20, 30%, 35%)" strokeWidth="1.5" fill="none" />
              {/* Twisted arms */}
              <path d="M95 70 L140 78" stroke="url(#skinToneGentle)" strokeWidth="9" fill="none" />
              <path d="M125 70 L80 82" stroke="url(#skinToneGentle)" strokeWidth="9" fill="none" />
              <circle cx="143" cy="78" r="5" fill="url(#skinToneGentle)" />
              <circle cx="77" cy="82" r="5" fill="url(#skinToneGentle)" />
              {/* Legs */}
              <path d="M100 110 L95 113" stroke="url(#skinToneGentle)" strokeWidth="10" fill="none" />
              <path d="M120 110 L125 113" stroke="url(#skinToneGentle)" strokeWidth="10" fill="none" />
            </>
          )}
          {pose === 3 && (
            <>
              {/* Seated forward fold */}
              <ellipse cx="105" cy="92" rx="35" ry="18" fill="hsl(var(--accent))" style={{ transform: 'rotate(-35deg)', transformOrigin: '105px 92px' }} />
              {showMuscles && (
                <ellipse cx="140" cy="95" rx="15" ry="25" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
              )}
              <ellipse cx="72" cy="82" rx="15" ry="17" fill="url(#skinToneGentle)" />
              <ellipse cx="72" cy="78" rx="17" ry="12" fill="hsl(var(--accent))" />
              {/* Arms reaching to feet */}
              <path d="M95 90 L140 108" stroke="url(#skinToneGentle)" strokeWidth="9" fill="none" />
              <path d="M100 95 L145 112" stroke="url(#skinToneGentle)" strokeWidth="9" fill="none" />
              <circle cx="143" cy="110" r="5" fill="url(#skinToneGentle)" />
              <circle cx="148" cy="114" r="5" fill="url(#skinToneGentle)" />
              {/* Legs extended */}
              <path d="M120 98 L165 105" stroke="url(#skinToneGentle)" strokeWidth="12" fill="none" />
              <path d="M125 105 L170 112" stroke="url(#skinToneGentle)" strokeWidth="12" fill="none" />
              <ellipse cx="172" cy="105" rx="8" ry="5" fill="url(#skinToneGentle)" />
              <ellipse cx="177" cy="112" rx="8" ry="5" fill="url(#skinToneGentle)" />
            </>
          )}
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles && `Working: ${currentPoseData.muscles.join(', ')}`}
        </p>
        <PoseIndicator current={pose} total={poses.length} />
      </div>
    </div>
  );
};

// Pregnancy-safe yoga poses
const PregnancySafeHuman = ({ pose, showMuscles }: { pose: number; showMuscles: boolean }) => {
  const poses = [
    { label: 'Supported Side Lying', muscles: ['hips', 'back'] },
    { label: 'Cat-Cow (Modified)', muscles: ['spine', 'core'] },
    { label: 'Seated Hip Opener', muscles: ['hips', 'inner thighs'] },
    { label: 'Wall Supported Squat', muscles: ['legs', 'pelvic floor'] },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 140" className="w-52 h-34 md:w-68 md:h-42">
        <defs>
          <linearGradient id="skinTonePreg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Mat */}
        <rect x="20" y="105" width="180" height="10" rx="3" fill="hsl(var(--secondary))" />
        
        <g className="transition-all duration-700">
          {pose === 0 && (
            <>
              {/* Side lying with pillow support */}
              <ellipse cx="90" cy="85" rx="50" ry="18" fill="hsl(var(--accent))" />
              {/* Belly bump */}
              <ellipse cx="100" cy="80" rx="20" ry="15" fill="hsl(var(--accent))" />
              <ellipse cx="40" cy="78" rx="15" ry="17" fill="url(#skinTonePreg)" />
              <ellipse cx="40" cy="74" rx="17" ry="12" fill="hsl(var(--accent))" />
              {/* Pillow under head */}
              <ellipse cx="40" cy="92" rx="20" ry="8" fill="hsl(var(--muted))" />
              {/* Pillow between legs */}
              <ellipse cx="145" cy="95" rx="15" ry="10" fill="hsl(var(--muted))" />
              {/* Legs with pillow between */}
              <path d="M130 88 L155 92" stroke="url(#skinTonePreg)" strokeWidth="11" fill="none" />
              <path d="M135 95 L160 100" stroke="url(#skinTonePreg)" strokeWidth="11" fill="none" />
              {showMuscles && (
                <ellipse cx="100" cy="85" rx="25" ry="12" fill="hsl(var(--primary))" opacity="0.2" />
              )}
            </>
          )}
          {pose === 1 && (
            <>
              {/* Modified cat-cow */}
              <ellipse cx="110" cy="70" rx="45" ry="20" fill="hsl(var(--accent))" className="animate-cat-cow" />
              {/* Belly */}
              <ellipse cx="110" cy="78" rx="18" ry="12" fill="hsl(var(--accent))" />
              <ellipse cx="55" cy="62" rx="15" ry="17" fill="url(#skinTonePreg)" />
              <path d="M38 57 Q44 44 55 42 Q66 44 72 57 Q74 70 55 75 Q36 70 38 57" fill="hsl(var(--accent))" />
              <circle cx="50" cy="60" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="60" cy="60" r="2" fill="hsl(20, 30%, 25%)" />
              <path d="M70 82 L65 103" stroke="url(#skinTonePreg)" strokeWidth="10" fill="none" />
              <path d="M88 88 L82 103" stroke="url(#skinTonePreg)" strokeWidth="10" fill="none" />
              <path d="M132 88 L138 103" stroke="url(#skinTonePreg)" strokeWidth="10" fill="none" />
              <path d="M150 82 L155 103" stroke="url(#skinTonePreg)" strokeWidth="10" fill="none" />
              {showMuscles && (
                <ellipse cx="110" cy="70" rx="35" ry="15" fill="hsl(var(--primary))" opacity="0.2" className="animate-cat-cow" />
              )}
            </>
          )}
          {pose === 2 && (
            <>
              {/* Seated hip opener */}
              <ellipse cx="110" cy="80" rx="30" ry="25" fill="hsl(var(--accent))" />
              {/* Belly */}
              <ellipse cx="110" cy="78" rx="15" ry="12" fill="hsl(var(--accent))" />
              <ellipse cx="110" cy="42" rx="16" ry="18" fill="url(#skinTonePreg)" />
              <path d="M92 38 Q97 24 110 22 Q123 24 128 38 Q130 52 110 58 Q90 52 92 38" fill="hsl(var(--accent))" />
              <circle cx="104" cy="40" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="116" cy="40" r="2" fill="hsl(20, 30%, 25%)" />
              {/* Arms on knees */}
              <path d="M95 65 L70 90" stroke="url(#skinTonePreg)" strokeWidth="9" fill="none" />
              <path d="M125 65 L150 90" stroke="url(#skinTonePreg)" strokeWidth="9" fill="none" />
              {/* Butterfly legs */}
              <path d="M90 100 Q60 95 55 103" stroke="url(#skinTonePreg)" strokeWidth="11" fill="none" />
              <path d="M130 100 Q160 95 165 103" stroke="url(#skinTonePreg)" strokeWidth="11" fill="none" />
              {showMuscles && (
                <>
                  <ellipse cx="75" cy="95" rx="12" ry="8" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                  <ellipse cx="145" cy="95" rx="12" ry="8" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                </>
              )}
            </>
          )}
          {pose === 3 && (
            <>
              {/* Wall supported squat */}
              <rect x="170" y="20" width="12" height="90" fill="hsl(var(--muted))" rx="2" />
              <ellipse cx="140" cy="70" rx="25" ry="30" fill="hsl(var(--accent))" />
              {/* Belly */}
              <ellipse cx="135" cy="72" rx="15" ry="12" fill="hsl(var(--accent))" />
              <ellipse cx="140" cy="32" rx="16" ry="18" fill="url(#skinTonePreg)" />
              <path d="M122 28 Q127 15 140 13 Q153 15 158 28 Q160 42 140 48 Q120 42 122 28" fill="hsl(var(--accent))" />
              <circle cx="134" cy="30" r="2" fill="hsl(20, 30%, 25%)" />
              <circle cx="146" cy="30" r="2" fill="hsl(20, 30%, 25%)" />
              {/* Arms against wall */}
              <path d="M158 55 L170 50" stroke="url(#skinTonePreg)" strokeWidth="9" fill="none" />
              <path d="M158 65 L170 70" stroke="url(#skinTonePreg)" strokeWidth="9" fill="none" />
              {/* Squatting legs */}
              <path d="M128 95 L115 103" stroke="url(#skinTonePreg)" strokeWidth="12" fill="none" />
              <path d="M152 95 L165 103" stroke="url(#skinTonePreg)" strokeWidth="12" fill="none" />
              {showMuscles && (
                <ellipse cx="140" cy="90" rx="20" ry="15" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
              )}
            </>
          )}
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles && `Working: ${currentPoseData.muscles.join(', ')}`}
        </p>
        <PoseIndicator current={pose} total={poses.length} />
      </div>
    </div>
  );
};

// Floor-based beginner yoga
const FloorYogaHuman = ({ pose, showMuscles }: { pose: number; showMuscles: boolean }) => {
  const poses = [
    { label: 'Supine Twist', muscles: ['spine', 'obliques'] },
    { label: 'Knees to Chest', muscles: ['lower back', 'hips'] },
    { label: 'Bridge Pose', muscles: ['glutes', 'back', 'core'] },
    { label: 'Happy Baby', muscles: ['hips', 'inner thighs'] },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 120" className="w-52 h-30 md:w-68 md:h-38">
        <defs>
          <linearGradient id="skinToneFloor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 45%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Mat */}
        <rect x="15" y="85" width="190" height="12" rx="3" fill="hsl(var(--secondary))" />
        
        <g className="transition-all duration-700">
          {pose === 0 && (
            <>
              {/* Supine twist */}
              <ellipse cx="100" cy="60" rx="50" ry="18" fill="hsl(var(--accent))" style={{ transform: 'rotate(10deg)', transformOrigin: '100px 60px' }} />
              <ellipse cx="45" cy="52" rx="15" ry="17" fill="url(#skinToneFloor)" />
              <ellipse cx="45" cy="48" rx="17" ry="12" fill="hsl(var(--accent))" />
              {/* Twisted legs */}
              <path d="M140 55 Q160 45 155 35" stroke="url(#skinToneFloor)" strokeWidth="12" fill="none" />
              <path d="M145 65 Q165 55 160 45" stroke="url(#skinToneFloor)" strokeWidth="12" fill="none" />
              {/* Arms out to sides */}
              <path d="M70 58 L30 75" stroke="url(#skinToneFloor)" strokeWidth="8" fill="none" />
              <path d="M130 55 L180 40" stroke="url(#skinToneFloor)" strokeWidth="8" fill="none" />
              {showMuscles && (
                <>
                  <ellipse cx="100" cy="60" rx="20" ry="15" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                  <ellipse cx="85" cy="55" rx="10" ry="12" fill="hsl(var(--primary))" opacity="0.2" className="animate-pulse" />
                </>
              )}
            </>
          )}
          {pose === 1 && (
            <>
              {/* Knees to chest */}
              <ellipse cx="100" cy="55" rx="45" ry="20" fill="hsl(var(--accent))" />
              <ellipse cx="45" cy="50" rx="15" ry="17" fill="url(#skinToneFloor)" />
              <ellipse cx="45" cy="46" rx="17" ry="12" fill="hsl(var(--accent))" />
              {/* Knees drawn up */}
              <ellipse cx="130" cy="40" rx="18" ry="15" fill="url(#skinToneFloor)" />
              {/* Arms hugging knees */}
              <path d="M80 50 Q110 30 140 45" stroke="url(#skinToneFloor)" strokeWidth="8" fill="none" />
              {showMuscles && (
                <ellipse cx="100" cy="60" rx="25" ry="15" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
              )}
            </>
          )}
          {pose === 2 && (
            <>
              {/* Bridge pose */}
              <path d="M50 70 Q100 30 150 70" stroke="hsl(var(--accent))" strokeWidth="25" fill="none" />
              <ellipse cx="45" cy="65" rx="14" ry="16" fill="url(#skinToneFloor)" />
              <ellipse cx="45" cy="61" rx="16" ry="11" fill="hsl(var(--accent))" />
              {/* Arms by sides */}
              <path d="M70 72 L75 83" stroke="url(#skinToneFloor)" strokeWidth="8" fill="none" />
              <path d="M130 72 L125 83" stroke="url(#skinToneFloor)" strokeWidth="8" fill="none" />
              {/* Feet on ground */}
              <path d="M145 58 L155 83" stroke="url(#skinToneFloor)" strokeWidth="11" fill="none" />
              <path d="M150 62 L160 83" stroke="url(#skinToneFloor)" strokeWidth="11" fill="none" />
              {showMuscles && (
                <>
                  <ellipse cx="100" cy="50" rx="30" ry="12" fill="hsl(var(--primary))" opacity="0.3" className="animate-pulse" />
                  <ellipse cx="152" cy="70" rx="12" ry="15" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                </>
              )}
            </>
          )}
          {pose === 3 && (
            <>
              {/* Happy baby */}
              <ellipse cx="100" cy="55" rx="40" ry="18" fill="hsl(var(--accent))" />
              <ellipse cx="50" cy="52" rx="14" ry="16" fill="url(#skinToneFloor)" />
              <ellipse cx="50" cy="48" rx="16" ry="11" fill="hsl(var(--accent))" />
              {/* Legs up and out */}
              <path d="M85 45 Q75 25 65 30" stroke="url(#skinToneFloor)" strokeWidth="11" fill="none" />
              <path d="M115 45 Q125 25 135 30" stroke="url(#skinToneFloor)" strokeWidth="11" fill="none" />
              {/* Hands holding feet */}
              <circle cx="65" cy="28" r="6" fill="url(#skinToneFloor)" />
              <circle cx="135" cy="28" r="6" fill="url(#skinToneFloor)" />
              <path d="M80 50 L65 32" stroke="url(#skinToneFloor)" strokeWidth="7" fill="none" />
              <path d="M120 50 L135 32" stroke="url(#skinToneFloor)" strokeWidth="7" fill="none" />
              {showMuscles && (
                <>
                  <ellipse cx="75" cy="40" rx="10" ry="12" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                  <ellipse cx="125" cy="40" rx="10" ry="12" fill="hsl(var(--primary))" opacity="0.25" className="animate-pulse" />
                </>
              )}
            </>
          )}
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {showMuscles && `Working: ${currentPoseData.muscles.join(', ')}`}
        </p>
        <PoseIndicator current={pose} total={poses.length} />
      </div>
    </div>
  );
};

// Nutrition Animation (keeping simpler version)
const NutritionAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 150" className="w-44 h-36 md:w-56 md:h-44">
        {/* Bowl */}
        <ellipse cx="100" cy="105" rx="55" ry="18" fill="hsl(var(--secondary))" />
        <path d="M45 105 Q45 135 100 140 Q155 135 155 105" fill="hsl(var(--muted))" />
        
        {/* Food items */}
        <circle cx="80" cy="95" r="12" fill="hsl(var(--primary))" className="animate-bob" style={{ animationDelay: '0s' }} />
        <circle cx="105" cy="90" r="10" fill="hsl(var(--accent))" className="animate-bob" style={{ animationDelay: '0.3s' }} />
        <circle cx="125" cy="95" r="11" fill="hsl(var(--primary))" className="animate-bob" style={{ animationDelay: '0.6s' }} />
        <ellipse cx="90" cy="100" rx="8" ry="5" fill="hsl(100 30% 60%)" className="animate-bob" style={{ animationDelay: '0.9s' }} />
        <ellipse cx="115" cy="100" rx="7" ry="4" fill="hsl(100 30% 60%)" className="animate-bob" style={{ animationDelay: '0.2s' }} />
        
        {/* Steam */}
        <path d="M85 65 Q80 55 85 45" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.4" className="animate-steam" />
        <path d="M100 60 Q95 50 100 40" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.3" className="animate-steam" style={{ animationDelay: '0.5s' }} />
        <path d="M115 65 Q120 55 115 45" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.4" className="animate-steam" style={{ animationDelay: '1s' }} />
        
        {/* Decorative leaves */}
        <path d="M50 85 Q55 75 65 80" stroke="hsl(100 30% 50%)" strokeWidth="2" fill="none" />
        <path d="M150 85 Q145 75 135 80" stroke="hsl(100 30% 50%)" strokeWidth="2" fill="none" />
      </svg>
      
      <p className="text-sm text-muted-foreground">Nourishing recipes await</p>
    </div>
  );
};

// Pose indicator dots
const PoseIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex gap-1.5 justify-center mt-2">
    {Array.from({ length: total }).map((_, i) => (
      <div 
        key={i} 
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i === current % total 
            ? 'bg-primary scale-125' 
            : 'bg-muted-foreground/30'
        }`}
      />
    ))}
  </div>
);

export default AnimatedPoseDemo;
