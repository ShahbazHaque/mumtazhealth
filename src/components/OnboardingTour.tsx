import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ run, onComplete }: OnboardingTourProps) {
  const steps: Step[] = [
    {
      target: "body",
      content: "Welcome to Mumtaz Health! Let me show you around your personalized wellness journey. 🌸",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="profile-summary"]',
      content: "Here's your wellness profile at a glance - your life stage, dosha type, and spiritual path.",
      placement: "bottom",
    },
    {
      target: '[data-tour="progress-tracker"]',
      content: "Track your wellness journey with check-ins and milestones. Watch your progress grow! 📈",
      placement: "bottom",
    },
    {
      target: '[data-tour="daily-tracker"]',
      content: "Start your day here - log your wellness entries and track how you're feeling.",
      placement: "top",
    },
    {
      target: '[data-tour="symptom-tracker"]',
      content: "Track PCOS, Endometriosis, and other symptoms to understand patterns over time.",
      placement: "top",
    },
    {
      target: '[data-tour="content-library"]',
      content: "Explore personalized yoga, meditation, nutrition, and wellness content tailored to your dosha and life stage. 🧘‍♀️",
      placement: "top",
    },
    {
      target: '[data-tour="insights"]',
      content: "View your wellness insights and AI-powered analysis to make informed decisions about your health.",
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
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}
