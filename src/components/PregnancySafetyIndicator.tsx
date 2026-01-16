import { AlertTriangle, CheckCircle, Baby, ShieldAlert, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PREGNANCY_EXCLUDED_CRITERIA, getPregnancyExclusionReasons } from "@/hooks/usePregnancySafeMode";

interface PregnancySafetyIndicatorProps {
  content: {
    title: string;
    description?: string | null;
    tags?: string[] | null;
    content_type: string;
    pregnancy_statuses?: string[] | null;
    pregnancy_trimesters?: number[] | null;
    difficulty_level?: string | null;
  };
  trimester: number | null;
  isPregnancySafeMode: boolean;
  showAlways?: boolean; // Show even when not in pregnancy safe mode
}

type SafetyStatus = 'safe' | 'caution' | 'excluded' | 'trimester-specific';

interface SafetyResult {
  status: SafetyStatus;
  reasons: string[];
  trimesterNote?: string;
  modifications?: string[];
}

/**
 * Check if content should be excluded during pregnancy based on tags and description
 */
export function getContentPregnancySafety(
  content: {
    title: string;
    description?: string | null;
    tags?: string[] | null;
    content_type: string;
    pregnancy_statuses?: string[] | null;
    pregnancy_trimesters?: number[] | null;
    difficulty_level?: string | null;
  },
  trimester: number | null
): SafetyResult {
  const lowerTitle = content.title.toLowerCase();
  const lowerDescription = (content.description || '').toLowerCase();
  const tags = content.tags?.map(t => t.toLowerCase()) || [];
  const combinedText = `${lowerTitle} ${lowerDescription} ${tags.join(' ')}`;
  
  // If content explicitly supports pregnancy
  if (content.pregnancy_statuses?.includes('pregnant')) {
    // Check trimester-specific safety
    if (content.pregnancy_trimesters && content.pregnancy_trimesters.length > 0) {
      if (trimester && !content.pregnancy_trimesters.includes(trimester)) {
        return {
          status: 'trimester-specific',
          reasons: [`Designed for trimester${content.pregnancy_trimesters.length > 1 ? 's' : ''} ${content.pregnancy_trimesters.join(', ')}`],
          trimesterNote: `Best suited for trimester ${content.pregnancy_trimesters.join(' or ')}`
        };
      }
    }
    return {
      status: 'safe',
      reasons: ['Pregnancy-safe practice'],
      modifications: getPregnancyModifications(content, trimester)
    };
  }
  
  // Check for excluded keywords
  const excludedReasons: string[] = [];
  
  // Check for advanced poses
  if (content.difficulty_level === 'advanced' || 
      combinedText.includes('advanced') ||
      combinedText.includes('power yoga')) {
    excludedReasons.push('Advanced poses');
  }
  
  // Check for splits
  if (combinedText.includes('splits') || 
      combinedText.includes('hanumanasana')) {
    excludedReasons.push('Splits (Hanumanasana)');
  }
  
  // Check for twists
  if (combinedText.includes('deep twist') || 
      combinedText.includes('closed twist') ||
      combinedText.includes('parivrtta')) {
    excludedReasons.push('Deep/closed twists');
  }
  
  // Check for deep lunges
  if (combinedText.includes('deep lunge')) {
    excludedReasons.push('Deep lunges');
  }
  
  // Check for core compression
  if (combinedText.includes('core compression') || 
      combinedText.includes('intense core') ||
      combinedText.includes('navasana') ||
      (combinedText.includes('core') && combinedText.includes('strength'))) {
    excludedReasons.push('Strong core compression');
  }
  
  // Check for supine poses (after first trimester)
  if (trimester && trimester > 1) {
    if (combinedText.includes('supine') || 
        combinedText.includes('lying on back') ||
        combinedText.includes('flat on back') ||
        combinedText.includes('reclined')) {
      excludedReasons.push('Lying flat on back (avoid after 1st trimester)');
    }
  }
  
  // Check for inversions
  if (combinedText.includes('inversion') || 
      combinedText.includes('headstand') ||
      combinedText.includes('handstand') ||
      combinedText.includes('sirsasana')) {
    excludedReasons.push('Inversions');
  }
  
  // Check for hot yoga
  if (combinedText.includes('hot yoga') || 
      combinedText.includes('bikram')) {
    excludedReasons.push('Hot yoga (overheating risk)');
  }
  
  if (excludedReasons.length > 0) {
    return {
      status: 'excluded',
      reasons: excludedReasons
    };
  }
  
  // Check for caution-worthy content (not excluded but needs modification)
  const cautionReasons: string[] = [];
  
  if (combinedText.includes('twist') && !combinedText.includes('gentle twist')) {
    cautionReasons.push('Open twists only - avoid compressing belly');
  }
  
  if (combinedText.includes('lunge') && !combinedText.includes('deep')) {
    cautionReasons.push('Use blocks for stability');
  }
  
  if (combinedText.includes('balance') || combinedText.includes('standing')) {
    cautionReasons.push('Stay near wall for balance support');
  }
  
  if (cautionReasons.length > 0) {
    return {
      status: 'caution',
      reasons: cautionReasons,
      modifications: getPregnancyModifications(content, trimester)
    };
  }
  
  // Default to safe for gentle/restorative content
  const safeKeywords = ['gentle', 'restorative', 'prenatal', 'pregnancy', 'breathing', 'meditation', 'relaxation'];
  if (safeKeywords.some(keyword => combinedText.includes(keyword))) {
    return {
      status: 'safe',
      reasons: ['Gentle practice suitable for pregnancy'],
      modifications: getPregnancyModifications(content, trimester)
    };
  }
  
  // For yoga content without clear indicators, mark as caution
  if (content.content_type === 'yoga') {
    return {
      status: 'caution',
      reasons: ['Consult with healthcare provider before trying'],
      modifications: getPregnancyModifications(content, trimester)
    };
  }
  
  // Non-yoga content (nutrition, articles, etc.) is generally safe
  return {
    status: 'safe',
    reasons: []
  };
}

/**
 * Get pregnancy-specific modifications based on trimester
 */
function getPregnancyModifications(
  content: { tags?: string[] | null; content_type: string },
  trimester: number | null
): string[] {
  const modifications: string[] = [];
  
  // General modifications
  modifications.push('Listen to your body and rest when needed');
  
  if (trimester === 1) {
    modifications.push('Avoid overexertion during early pregnancy fatigue');
    modifications.push('Stay hydrated');
  } else if (trimester === 2) {
    modifications.push('Use props for balance as center of gravity shifts');
    modifications.push('Avoid lying flat on back for extended periods');
  } else if (trimester === 3) {
    modifications.push('Focus on gentle stretches and breathing');
    modifications.push('Use support under hips and knees');
    modifications.push('Take frequent breaks');
    modifications.push('Avoid deep squats if uncomfortable');
  }
  
  return modifications;
}

/**
 * Visual indicator component for pregnancy safety status
 */
export function PregnancySafetyIndicator({
  content,
  trimester,
  isPregnancySafeMode,
  showAlways = false
}: PregnancySafetyIndicatorProps) {
  if (!isPregnancySafeMode && !showAlways) {
    return null;
  }
  
  const safety = getContentPregnancySafety(content, trimester);
  
  if (safety.status === 'safe' && safety.reasons.length === 0) {
    return null; // Don't show indicator for unmarked safe content
  }
  
  const getStatusConfig = () => {
    switch (safety.status) {
      case 'safe':
        return {
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          label: 'Pregnancy Safe',
          badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
          iconClass: 'text-green-600 dark:text-green-400'
        };
      case 'caution':
        return {
          icon: <Info className="h-3.5 w-3.5" />,
          label: 'Modifications Needed',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
          iconClass: 'text-amber-600 dark:text-amber-400'
        };
      case 'excluded':
        return {
          icon: <ShieldAlert className="h-3.5 w-3.5" />,
          label: 'Avoid During Pregnancy',
          badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
          iconClass: 'text-red-600 dark:text-red-400'
        };
      case 'trimester-specific':
        return {
          icon: <Baby className="h-3.5 w-3.5" />,
          label: safety.trimesterNote || 'Trimester-specific',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
          iconClass: 'text-purple-600 dark:text-purple-400'
        };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`cursor-help flex items-center gap-1 text-xs ${config.badgeClass}`}
          >
            <span className={config.iconClass}>{config.icon}</span>
            <span className="hidden sm:inline">{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-xs p-3 space-y-2"
        >
          <div className="font-semibold flex items-center gap-2">
            <Baby className="h-4 w-4 text-primary" />
            Pregnancy Safety
          </div>
          
          {safety.reasons.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {safety.status === 'excluded' ? 'Avoid because:' : 'Notes:'}
              </p>
              <ul className="text-xs space-y-0.5">
                {safety.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-muted-foreground">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {safety.modifications && safety.modifications.length > 0 && (
            <div className="space-y-1 pt-1 border-t">
              <p className="text-xs font-medium text-muted-foreground">
                {trimester === 3 ? 'Third Trimester Tips:' : 'Modifications:'}
              </p>
              <ul className="text-xs space-y-0.5">
                {safety.modifications.slice(0, 3).map((mod, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-green-600">✓</span>
                    {mod}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact badge for list views
 */
export function PregnancySafetyBadge({
  content,
  trimester,
  isPregnancySafeMode
}: PregnancySafetyIndicatorProps) {
  if (!isPregnancySafeMode) {
    return null;
  }
  
  const safety = getContentPregnancySafety(content, trimester);
  
  if (safety.status === 'excluded') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="absolute top-2 right-2 bg-red-500/90 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              <span>Avoid</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Not recommended during pregnancy:</p>
            <ul className="text-xs mt-1">
              {safety.reasons.slice(0, 2).map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (safety.status === 'safe' && safety.reasons.length > 0) {
    return (
      <div className="absolute top-2 right-2 bg-green-500/90 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
        <Baby className="h-3 w-3" />
        <span>Safe</span>
      </div>
    );
  }
  
  return null;
}
