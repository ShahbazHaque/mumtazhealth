import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.15'
import * as React from 'https://esm.sh/react@18.3.1'

interface PracticeReminder {
  title: string;
  time: string;
  days: string;
}

interface WeeklySummaryEmailProps {
  userName: string
  weekStart: string
  weekEnd: string
  daysTracked: number
  yogaSessions: number
  mealsLogged: number
  meditationMinutes: number
  avgMoodScore: number
  topPractices: string[]
  insights: string[]
  completedPractices: number
  scheduledPractices: number
  upcomingReminders: PracticeReminder[]
}

export const WeeklySummaryEmail = ({
  userName,
  weekStart,
  weekEnd,
  daysTracked,
  yogaSessions,
  mealsLogged,
  meditationMinutes,
  avgMoodScore,
  topPractices,
  insights,
  completedPractices = 0,
  scheduledPractices = 0,
  upcomingReminders = [],
}: WeeklySummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Your wellness summary for {weekStart} - {weekEnd}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🌸 Your Weekly Wellness Summary</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          Here's a recap of your wellness journey from {weekStart} to {weekEnd}:
        </Text>
        
        <Section style={statsBox}>
          <Text style={statHeading}>📊 Week at a Glance</Text>
          
          <div style={statRow}>
            <Text style={statLabel}>Days Tracked</Text>
            <Text style={statValue}>{daysTracked}/7</Text>
          </div>
          
          <div style={statRow}>
            <Text style={statLabel}>Yoga Sessions</Text>
            <Text style={statValue}>{yogaSessions}</Text>
          </div>
          
          <div style={statRow}>
            <Text style={statLabel}>Meals Logged</Text>
            <Text style={statValue}>{mealsLogged}</Text>
          </div>
          
          <div style={statRow}>
            <Text style={statLabel}>Meditation</Text>
            <Text style={statValue}>{meditationMinutes} min</Text>
          </div>
          
          <div style={statRow}>
            <Text style={statLabel}>Average Mood</Text>
            <Text style={statValue}>{avgMoodScore}/5 ⭐</Text>
          </div>
        </Section>

        {/* Daily Practice Summary */}
        {scheduledPractices > 0 && (
          <Section style={practiceBox}>
            <Text style={practiceHeading}>🧘 Daily Practice Summary</Text>
            
            <div style={statRow}>
              <Text style={statLabel}>Completed Practices</Text>
              <Text style={statValue}>{completedPractices}</Text>
            </div>
            
            <div style={statRow}>
              <Text style={statLabel}>Scheduled This Week</Text>
              <Text style={statValue}>{scheduledPractices}</Text>
            </div>
            
            {completedPractices > 0 && scheduledPractices > 0 && (
              <div style={statRow}>
                <Text style={statLabel}>Completion Rate</Text>
                <Text style={statValue}>
                  {Math.round((completedPractices / scheduledPractices) * 100)}%
                </Text>
              </div>
            )}
          </Section>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <Section style={remindersBox}>
            <Text style={reminderHeading}>⏰ Your Upcoming Practice Reminders</Text>
            {upcomingReminders.map((reminder, index) => (
              <div key={index} style={reminderItem}>
                <Text style={reminderTitle}>{reminder.title}</Text>
                <Text style={reminderDetails}>
                  {reminder.time} • {reminder.days}
                </Text>
              </div>
            ))}
          </Section>
        )}

        {topPractices.length > 0 && (
          <Section style={insightsBox}>
            <Text style={insightHeading}>💫 Your Top Practices</Text>
            {topPractices.map((practice, index) => (
              <Text key={index} style={insightItem}>• {practice}</Text>
            ))}
          </Section>
        )}

        {insights.length > 0 && (
          <Section style={encouragementBox}>
            <Text style={encouragementHeading}>✨ Insights & Encouragement</Text>
            {insights.map((insight, index) => (
              <Text key={index} style={insightItem}>• {insight}</Text>
            ))}
          </Section>
        )}

        <Text style={text}>
          Keep up the wonderful work on your wellness journey! Every step you take brings you closer to balance and harmony.
        </Text>
        
        <Text style={footer}>
          With gratitude and encouragement,
          <br />
          <strong>Mumtaz Health</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WeeklySummaryEmail

const main = {
  backgroundColor: '#faf5f0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
}

const h1 = {
  color: '#5D3F6A',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const statsBox = {
  backgroundColor: '#F5F0F7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #C9A7DD',
}

const statHeading = {
  color: '#5D3F6A',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #E8D5F0',
}

const statLabel = {
  color: '#475569',
  fontSize: '14px',
  fontWeight: '500',
}

const statValue = {
  color: '#5D3F6A',
  fontSize: '16px',
  fontWeight: '700',
}

const practiceBox = {
  backgroundColor: '#F0F5F2',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #98A98F',
}

const practiceHeading = {
  color: '#5A6B52',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const remindersBox = {
  backgroundColor: '#FFF8F0',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #E8C9A0',
}

const reminderHeading = {
  color: '#8B6914',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const reminderItem = {
  padding: '12px',
  backgroundColor: '#FFFCF5',
  borderRadius: '6px',
  marginBottom: '8px',
}

const reminderTitle = {
  color: '#333',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const reminderDetails = {
  color: '#666',
  fontSize: '13px',
  margin: '0',
}

const insightsBox = {
  backgroundColor: '#F5F0F7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #C9A7DD',
}

const insightHeading = {
  color: '#5D3F6A',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const encouragementBox = {
  backgroundColor: '#F0F5F2',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #98A98F',
}

const encouragementHeading = {
  color: '#5A6B52',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const insightItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e8ebe8',
}
