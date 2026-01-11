import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";
import { ONBOARDING_MESSAGES, JOURNEY_MESSAGES } from "@/constants/appMessaging";

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ run, onComplete }: OnboardingTourProps) {
  const steps: Step[] = [
    {
      target: "body",
      content: ONBOARDING_MESSAGES.welcome + " 🌸",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="profile-summary"]',
      content: ONBOARDING_MESSAGES.profileIntro,
      placement: "bottom",
    },
    {
      target: '[data-tour="progress-tracker"]',
      content: ONBOARDING_MESSAGES.trackingIntro + " 📈",
      placement: "bottom",
    },
    {
      target: '[data-tour="daily-tracker"]',
      content: "Start your day here — log your wellness entries and understand your patterns over time.",
      placement: "top",
    },
    {
      target: '[data-tour="symptom-tracker"]',
      content: "Track symptoms to understand patterns — " + JOURNEY_MESSAGES.progressUnlocking,
      placement: "top",
    },
    {
      target: '[data-tour="content-library"]',
      content: ONBOARDING_MESSAGES.libraryIntro + " 🧘‍♀️",
      placement: "top",
    },
    {
      target: '[data-tour="insights"]',
      content: ONBOARDING_MESSAGES.insightsIntro,
      placement: "top",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--mumtaz-lilac))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--card))",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          arrowColor: "hsl(var(--card))",
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: "hsl(var(--mumtaz-lilac))",
          borderRadius: 8,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: 10,
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Begin Your Journey",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}
