import { useEffect, useState } from "react";

interface AnimatedPoseDemoProps {
  contentType: string;
  tags?: string[];
  title?: string;
}

// Gentle, accessible animated demonstrations for wellness content
export const AnimatedPoseDemo = ({ contentType, tags = [], title = "" }: AnimatedPoseDemoProps) => {
  const [currentPose, setCurrentPose] = useState(0);
  
  // Get the appropriate animation based on content type and tags
  const getAnimationType = () => {
    const tagList = tags.map(t => t.toLowerCase());
    
    if (tagList.some(t => ['chair-yoga', 'seated', 'chair'].includes(t))) return 'chair-yoga';
    if (tagList.some(t => ['breathwork', 'breathing', 'pranayama'].includes(t))) return 'breathwork';
    if (tagList.some(t => ['meditation', 'mindfulness', 'relaxation'].includes(t))) return 'meditation';
    if (tagList.some(t => ['mobility', 'stretching', 'gentle-stretch'].includes(t))) return 'mobility';
    if (tagList.some(t => ['wall-yoga', 'wall-supported'].includes(t))) return 'wall-yoga';
    if (tagList.some(t => ['bed-yoga', 'restorative', 'lying'].includes(t))) return 'restorative';
    if (tagList.some(t => ['standing', 'balance'].includes(t))) return 'standing';
    if (tagList.some(t => ['nutrition', 'recipe', 'food', 'meal'].includes(t))) return 'nutrition';
    if (contentType === 'meditation') return 'meditation';
    if (contentType === 'breathwork') return 'breathwork';
    if (contentType === 'yoga') return 'gentle-yoga';
    if (contentType === 'nutrition') return 'nutrition';
    
    return 'gentle-yoga';
  };

  const animationType = getAnimationType();

  // Cycle through poses for multi-pose animations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPose(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="aspect-video bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-lg overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="softWaves" patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="10" cy="10" r="1" fill="hsl(var(--primary))" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#softWaves)" />
        </svg>
      </div>

      {/* Animation Content */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        {animationType === 'chair-yoga' && <ChairYogaAnimation pose={currentPose} />}
        {animationType === 'breathwork' && <BreathworkAnimation />}
        {animationType === 'meditation' && <MeditationAnimation />}
        {animationType === 'mobility' && <MobilityAnimation pose={currentPose} />}
        {animationType === 'wall-yoga' && <WallYogaAnimation pose={currentPose} />}
        {animationType === 'restorative' && <RestorativeAnimation />}
        {animationType === 'standing' && <StandingAnimation pose={currentPose} />}
        {animationType === 'gentle-yoga' && <GentleYogaAnimation pose={currentPose} />}
        {animationType === 'nutrition' && <NutritionAnimation />}
      </div>

      {/* Label */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
            Animated demonstration
          </span>
          <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
            Loops gently
          </span>
        </div>
      </div>
    </div>
  );
};

// Chair Yoga Animation - Seated poses with arm movements
const ChairYogaAnimation = ({ pose }: { pose: number }) => {
  const poses = [
    { arms: 'down', label: 'Seated Mountain' },
    { arms: 'up', label: 'Arms Overhead' },
    { arms: 'side', label: 'Side Stretch' },
    { arms: 'twist', label: 'Gentle Twist' },
  ];
  
  const currentPoseData = poses[pose % poses.length];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-56 md:h-56">
        {/* Chair */}
        <rect x="50" y="130" width="100" height="10" rx="2" fill="hsl(var(--muted))" />
        <rect x="140" y="80" width="10" height="60" rx="2" fill="hsl(var(--muted))" />
        
        {/* Body - sitting on chair */}
        <ellipse 
          cx="100" 
          cy="115" 
          rx="20" 
          ry="25" 
          fill="hsl(var(--accent))" 
          className="transition-all duration-1000"
          style={{
            transform: currentPoseData.arms === 'twist' ? 'rotate(-5deg)' : 'rotate(0deg)',
            transformOrigin: '100px 115px'
          }}
        />
        
        {/* Head */}
        <circle 
          cx="100" 
          cy="70" 
          r="18" 
          fill="hsl(var(--primary))" 
          className="transition-all duration-1000"
        />
        
        {/* Hijab/Head covering */}
        <path 
          d="M82 70 Q100 50 118 70 Q120 85 100 90 Q80 85 82 70" 
          fill="hsl(var(--accent))" 
          className="transition-all duration-1000"
        />
        
        {/* Face - gentle smile */}
        <circle cx="94" cy="72" r="2" fill="hsl(var(--foreground))" opacity="0.6" />
        <circle cx="106" cy="72" r="2" fill="hsl(var(--foreground))" opacity="0.6" />
        <path d="M95 80 Q100 84 105 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.5" />
        
        {/* Arms - animated based on pose */}
        <g className="transition-all duration-1000 ease-in-out">
          {currentPoseData.arms === 'down' && (
            <>
              <line x1="80" y1="100" x2="65" y2="130" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
              <line x1="120" y1="100" x2="135" y2="130" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
            </>
          )}
          {currentPoseData.arms === 'up' && (
            <>
              <line x1="80" y1="100" x2="70" y2="50" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
              <line x1="120" y1="100" x2="130" y2="50" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
            </>
          )}
          {currentPoseData.arms === 'side' && (
            <>
              <line x1="80" y1="100" x2="40" y2="90" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
              <line x1="120" y1="100" x2="150" y2="60" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
            </>
          )}
          {currentPoseData.arms === 'twist' && (
            <>
              <line x1="85" y1="100" x2="140" y2="100" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
              <line x1="115" y1="100" x2="60" y2="110" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
            </>
          )}
        </g>
        
        {/* Legs */}
        <line x1="90" y1="130" x2="85" y2="170" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
        <line x1="110" y1="130" x2="115" y2="170" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{currentPoseData.label}</p>
        <div className="flex gap-1 justify-center mt-2">
          {poses.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === pose % poses.length 
                  ? 'bg-primary scale-110' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Breathwork Animation - Expanding/contracting circle
const BreathworkAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 w-40 h-40 md:w-52 md:h-52 rounded-full bg-accent/20 animate-breathe-outer" />
        
        {/* Main breathing circle */}
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 animate-breathe flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground animate-breathe-text">Breathe</p>
            <p className="text-xs text-muted-foreground mt-1">In... Out...</p>
          </div>
        </div>
        
        {/* Decorative rings */}
        <div className="absolute inset-0 w-40 h-40 md:w-52 md:h-52 rounded-full border-2 border-primary/20 animate-breathe-ring" style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-0 w-40 h-40 md:w-52 md:h-52 rounded-full border border-accent/20 animate-breathe-ring" style={{ animationDelay: '1s' }} />
      </div>
      
      <p className="text-sm text-muted-foreground">Follow the gentle rhythm</p>
    </div>
  );
};

// Meditation Animation - Peaceful seated figure
const MeditationAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-56 md:h-56">
        {/* Ground/cushion */}
        <ellipse cx="100" cy="165" rx="50" ry="8" fill="hsl(var(--secondary))" />
        
        {/* Body in meditation pose */}
        <ellipse cx="100" cy="130" rx="35" ry="35" fill="hsl(var(--accent))" />
        
        {/* Head */}
        <circle cx="100" cy="75" r="22" fill="hsl(var(--primary))" />
        
        {/* Hijab/Head covering */}
        <path 
          d="M78 75 Q100 50 122 75 Q125 95 100 100 Q75 95 78 75" 
          fill="hsl(var(--accent))" 
        />
        
        {/* Closed eyes - peaceful expression */}
        <path d="M90 78 Q94 76 98 78" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M102 78 Q106 76 110 78" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.5" />
        
        {/* Gentle smile */}
        <path d="M94 88 Q100 92 106 88" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.4" />
        
        {/* Arms in mudra position */}
        <circle cx="70" cy="145" r="6" fill="hsl(var(--primary))" />
        <circle cx="130" cy="145" r="6" fill="hsl(var(--primary))" />
        <line x1="76" y1="145" x2="95" y2="135" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        <line x1="124" y1="145" x2="105" y2="135" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        
        {/* Aura/glow effect */}
        <circle cx="100" cy="100" r="70" fill="none" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.3" className="animate-pulse" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.2" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      </svg>
      
      <p className="text-sm text-muted-foreground">Find your stillness</p>
    </div>
  );
};

// Mobility/Stretching Animation
const MobilityAnimation = ({ pose }: { pose: number }) => {
  const poses = [
    'Neck Rolls',
    'Shoulder Circles',
    'Wrist Rotations',
    'Ankle Circles',
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-56 md:h-56">
        {/* Seated figure */}
        <ellipse cx="100" cy="150" rx="30" ry="20" fill="hsl(var(--accent))" />
        
        {/* Head with rotation animation */}
        <g className="transition-all duration-1000" style={{ 
          transform: pose % 4 === 0 
            ? 'rotate(-10deg)' 
            : pose % 4 === 1 
            ? 'rotate(10deg)' 
            : 'rotate(0deg)',
          transformOrigin: '100px 90px'
        }}>
          <circle cx="100" cy="70" r="20" fill="hsl(var(--primary))" />
          <path d="M80 70 Q100 48 120 70 Q122 88 100 93 Q78 88 80 70" fill="hsl(var(--accent))" />
          <circle cx="94" cy="72" r="2" fill="hsl(var(--foreground))" opacity="0.6" />
          <circle cx="106" cy="72" r="2" fill="hsl(var(--foreground))" opacity="0.6" />
          <path d="M95 80 Q100 84 105 80" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.5" />
        </g>
        
        {/* Shoulders with circle animation */}
        <g>
          <circle 
            cx="70" 
            cy="110" 
            r="8" 
            fill="hsl(var(--primary))" 
            className={pose % 4 === 1 ? 'animate-shoulder-circle' : ''}
          />
          <circle 
            cx="130" 
            cy="110" 
            r="8" 
            fill="hsl(var(--primary))" 
            className={pose % 4 === 1 ? 'animate-shoulder-circle-reverse' : ''}
          />
        </g>
        
        {/* Arms */}
        <line x1="78" y1="110" x2="70" y2="145" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        <line x1="122" y1="110" x2="130" y2="145" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        
        {/* Hands with rotation */}
        <circle 
          cx="70" 
          cy="150" 
          r="6" 
          fill="hsl(var(--primary))" 
          className={pose % 4 === 2 ? 'animate-wrist-rotate' : ''}
        />
        <circle 
          cx="130" 
          cy="150" 
          r="6" 
          fill="hsl(var(--primary))" 
          className={pose % 4 === 2 ? 'animate-wrist-rotate' : ''}
        />
        
        {/* Movement indicator arrows */}
        <g className="animate-pulse" opacity="0.5">
          {pose % 4 === 0 && (
            <path d="M125 65 Q135 70 125 75" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
          )}
          {pose % 4 === 1 && (
            <>
              <circle cx="70" cy="100" r="12" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" strokeDasharray="4 4" />
              <circle cx="130" cy="100" r="12" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" strokeDasharray="4 4" />
            </>
          )}
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{poses[pose % poses.length]}</p>
        <div className="flex gap-1 justify-center mt-2">
          {poses.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === pose % poses.length 
                  ? 'bg-primary scale-110' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Wall Yoga Animation
const WallYogaAnimation = ({ pose }: { pose: number }) => {
  const poses = [
    'Wall Support Stand',
    'Wall Stretch',
    'Supported Forward Fold',
    'Wall Rest',
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-56 md:h-56">
        {/* Wall */}
        <rect x="150" y="20" width="15" height="160" fill="hsl(var(--muted))" rx="2" />
        
        {/* Ground */}
        <line x1="20" y1="180" x2="180" y2="180" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Figure - changes based on pose */}
        <g className="transition-all duration-1000">
          {/* Body */}
          <ellipse 
            cx={pose % 4 === 2 ? 100 : 120} 
            cy={pose % 4 === 2 ? 130 : 120} 
            rx="20" 
            ry={pose % 4 === 2 ? 15 : 25} 
            fill="hsl(var(--accent))"
            style={{ 
              transform: pose % 4 === 2 ? 'rotate(-45deg)' : 'rotate(0deg)',
              transformOrigin: '100px 130px'
            }}
          />
          
          {/* Head */}
          <circle 
            cx={pose % 4 === 2 ? 80 : 120} 
            cy={pose % 4 === 2 ? 120 : 80} 
            r="16" 
            fill="hsl(var(--primary))" 
          />
          
          {/* Hijab */}
          <path 
            d={pose % 4 === 2 
              ? "M65 120 Q80 105 95 120 Q97 132 80 136 Q63 132 65 120"
              : "M104 80 Q120 62 136 80 Q138 94 120 98 Q102 94 104 80"
            }
            fill="hsl(var(--accent))" 
          />
          
          {/* Arms touching wall */}
          {pose % 4 === 1 && (
            <>
              <line x1="135" y1="95" x2="150" y2="70" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
              <line x1="135" y1="95" x2="150" y2="120" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {pose % 4 !== 1 && pose % 4 !== 2 && (
            <>
              <line x1="130" y1="100" x2="150" y2="90" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
              <line x1="130" y1="100" x2="150" y2="110" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          
          {/* Legs */}
          <line x1="115" y1="145" x2="110" y2="178" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
          <line x1="125" y1="145" x2="130" y2="178" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{poses[pose % poses.length]}</p>
        <div className="flex gap-1 justify-center mt-2">
          {poses.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === pose % poses.length 
                  ? 'bg-primary scale-110' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Restorative/Bed Yoga Animation
const RestorativeAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 120" className="w-48 h-28 md:w-64 md:h-36">
        {/* Bed/mat */}
        <rect x="20" y="70" width="160" height="15" rx="3" fill="hsl(var(--secondary))" />
        <rect x="15" y="85" width="170" height="8" rx="2" fill="hsl(var(--muted))" />
        
        {/* Pillow */}
        <ellipse cx="45" cy="65" rx="20" ry="8" fill="hsl(var(--accent))" />
        
        {/* Lying figure */}
        <ellipse cx="100" cy="58" rx="45" ry="12" fill="hsl(var(--accent))" className="animate-breathe-subtle" />
        
        {/* Head on pillow */}
        <circle cx="45" cy="52" r="14" fill="hsl(var(--primary))" />
        
        {/* Hijab */}
        <ellipse cx="45" cy="48" rx="16" ry="10" fill="hsl(var(--accent))" />
        
        {/* Closed eyes - restful */}
        <path d="M40 54 L44 52" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
        <path d="M46 54 L50 52" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.4" />
        
        {/* Arms resting */}
        <line x1="70" y1="60" x2="75" y2="75" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
        <line x1="130" y1="60" x2="125" y2="75" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
        
        {/* Legs */}
        <line x1="140" y1="58" x2="165" y2="60" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        <line x1="145" y1="62" x2="170" y2="65" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
        
        {/* Peaceful aura */}
        <ellipse cx="100" cy="55" rx="70" ry="25" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.3" className="animate-pulse" />
      </svg>
      
      <p className="text-sm text-muted-foreground">Rest & restore gently</p>
    </div>
  );
};

// Standing Yoga Animation
const StandingAnimation = ({ pose }: { pose: number }) => {
  const poses = [
    'Mountain Pose',
    'Arms Raised',
    'Tree Pose',
    'Standing Forward',
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-56 md:h-56">
        {/* Ground */}
        <line x1="40" y1="185" x2="160" y2="185" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Standing figure */}
        <g className="transition-all duration-1000">
          {/* Body */}
          <ellipse 
            cx="100" 
            cy={pose % 4 === 3 ? 130 : 110} 
            rx="18" 
            ry={pose % 4 === 3 ? 15 : 30} 
            fill="hsl(var(--accent))"
            style={{
              transform: pose % 4 === 3 ? 'rotate(-60deg)' : 'rotate(0deg)',
              transformOrigin: '100px 140px'
            }}
          />
          
          {/* Head */}
          <circle 
            cx={pose % 4 === 3 ? 70 : 100} 
            cy={pose % 4 === 3 ? 100 : 65} 
            r="18" 
            fill="hsl(var(--primary))" 
          />
          
          {/* Hijab */}
          <path 
            d={pose % 4 === 3 
              ? "M55 100 Q70 82 85 100 Q87 115 70 118 Q53 115 55 100"
              : "M82 65 Q100 45 118 65 Q120 82 100 86 Q80 82 82 65"
            }
            fill="hsl(var(--accent))" 
          />
          
          {/* Eyes */}
          <circle cx={pose % 4 === 3 ? 65 : 94} cy={pose % 4 === 3 ? 102 : 67} r="2" fill="hsl(var(--foreground))" opacity="0.6" />
          <circle cx={pose % 4 === 3 ? 75 : 106} cy={pose % 4 === 3 ? 102 : 67} r="2" fill="hsl(var(--foreground))" opacity="0.6" />
          
          {/* Arms */}
          {pose % 4 === 0 && (
            <>
              <line x1="85" y1="95" x2="70" y2="130" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
              <line x1="115" y1="95" x2="130" y2="130" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {pose % 4 === 1 && (
            <>
              <line x1="85" y1="90" x2="70" y2="40" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
              <line x1="115" y1="90" x2="130" y2="40" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
            </>
          )}
          {pose % 4 === 2 && (
            <>
              <line x1="85" y1="90" x2="55" y2="80" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
              <line x1="115" y1="90" x2="145" y2="80" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {pose % 4 === 3 && (
            <>
              <line x1="90" y1="115" x2="70" y2="140" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="120" x2="80" y2="145" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          
          {/* Legs */}
          {pose % 4 === 2 ? (
            <>
              <line x1="95" y1="140" x2="90" y2="183" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
              <line x1="105" y1="140" x2="115" y2="120" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <line x1="92" y1="140" x2="88" y2="183" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
              <line x1="108" y1="140" x2="112" y2="183" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            </>
          )}
        </g>
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{poses[pose % poses.length]}</p>
        <div className="flex gap-1 justify-center mt-2">
          {poses.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === pose % poses.length 
                  ? 'bg-primary scale-110' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Gentle Yoga Animation (default)
const GentleYogaAnimation = ({ pose }: { pose: number }) => {
  const poses = [
    'Cat-Cow Stretch',
    'Child\'s Pose',
    'Gentle Twist',
    'Seated Forward',
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 150" className="w-44 h-32 md:w-60 md:h-44">
        {/* Mat */}
        <rect x="25" y="110" width="150" height="8" rx="2" fill="hsl(var(--secondary))" />
        
        {pose % 4 === 0 && (
          // Cat-Cow on all fours
          <g className="animate-cat-cow">
            <ellipse cx="100" cy="80" rx="35" ry="20" fill="hsl(var(--accent))" />
            <circle cx="55" cy="75" r="14" fill="hsl(var(--primary))" />
            <ellipse cx="55" cy="72" rx="15" ry="10" fill="hsl(var(--accent))" />
            <line x1="70" y1="95" x2="65" y2="110" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="85" y1="100" x2="80" y2="110" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="115" y1="100" x2="120" y2="110" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="130" y1="95" x2="135" y2="110" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}
        
        {pose % 4 === 1 && (
          // Child's pose
          <g>
            <ellipse cx="100" cy="95" rx="40" ry="15" fill="hsl(var(--accent))" />
            <circle cx="60" cy="100" r="14" fill="hsl(var(--primary))" />
            <ellipse cx="60" cy="97" rx="15" ry="10" fill="hsl(var(--accent))" />
            <line x1="80" y1="90" x2="50" y2="108" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="120" y1="90" x2="150" y2="108" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}
        
        {pose % 4 === 2 && (
          // Gentle seated twist
          <g style={{ transform: 'rotate(-5deg)', transformOrigin: '100px 100px' }}>
            <ellipse cx="100" cy="90" rx="25" ry="20" fill="hsl(var(--accent))" />
            <circle cx="100" cy="55" r="16" fill="hsl(var(--primary))" />
            <path d="M84 55 Q100 40 116 55 Q118 68 100 72 Q82 68 84 55" fill="hsl(var(--accent))" />
            <line x1="85" y1="75" x2="130" y2="80" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="115" y1="75" x2="70" y2="85" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="90" y1="105" x2="85" y2="108" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="110" y1="105" x2="115" y2="108" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}
        
        {pose % 4 === 3 && (
          // Seated forward fold
          <g>
            <ellipse cx="100" cy="95" rx="30" ry="15" fill="hsl(var(--accent))" style={{ transform: 'rotate(-30deg)', transformOrigin: '100px 95px' }} />
            <circle cx="75" cy="85" r="14" fill="hsl(var(--primary))" />
            <ellipse cx="75" cy="82" rx="15" ry="10" fill="hsl(var(--accent))" />
            <line x1="90" y1="92" x2="120" y2="105" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="85" y1="95" x2="115" y2="108" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="110" y1="100" x2="140" y2="100" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
            <line x1="115" y1="105" x2="145" y2="105" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}
      </svg>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{poses[pose % poses.length]}</p>
        <div className="flex gap-1 justify-center mt-2">
          {poses.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === pose % poses.length 
                  ? 'bg-primary scale-110' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Nutrition Animation
const NutritionAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 160" className="w-44 h-36 md:w-56 md:h-44">
        {/* Bowl */}
        <ellipse cx="100" cy="110" rx="55" ry="20" fill="hsl(var(--secondary))" />
        <path d="M45 110 Q45 140 100 145 Q155 140 155 110" fill="hsl(var(--muted))" />
        
        {/* Food items with gentle bobbing animation */}
        <circle cx="80" cy="100" r="12" fill="hsl(var(--primary))" className="animate-bob" style={{ animationDelay: '0s' }} />
        <circle cx="105" cy="95" r="10" fill="hsl(var(--accent))" className="animate-bob" style={{ animationDelay: '0.3s' }} />
        <circle cx="125" cy="100" r="11" fill="hsl(var(--primary))" className="animate-bob" style={{ animationDelay: '0.6s' }} />
        <ellipse cx="90" cy="105" rx="8" ry="5" fill="hsl(100 30% 60%)" className="animate-bob" style={{ animationDelay: '0.9s' }} />
        <ellipse cx="115" cy="105" rx="7" ry="4" fill="hsl(100 30% 60%)" className="animate-bob" style={{ animationDelay: '0.2s' }} />
        
        {/* Steam */}
        <path d="M85 70 Q80 60 85 50" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.4" className="animate-steam" />
        <path d="M100 65 Q95 55 100 45" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.3" className="animate-steam" style={{ animationDelay: '0.5s' }} />
        <path d="M115 70 Q120 60 115 50" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.4" className="animate-steam" style={{ animationDelay: '1s' }} />
        
        {/* Decorative leaves */}
        <path d="M50 85 Q55 75 65 80" stroke="hsl(100 30% 50%)" strokeWidth="2" fill="none" />
        <path d="M150 85 Q145 75 135 80" stroke="hsl(100 30% 50%)" strokeWidth="2" fill="none" />
      </svg>
      
      <p className="text-sm text-muted-foreground">Nourishing recipes await</p>
    </div>
  );
};

export default AnimatedPoseDemo;
