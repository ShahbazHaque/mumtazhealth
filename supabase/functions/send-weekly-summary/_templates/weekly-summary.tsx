import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.15'
import * as React from 'npm:react@18.3.1'

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
}: WeeklySummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Your wellness summary for {weekStart} - {weekEnd}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🌟 Your Weekly Wellness Summary</Heading>
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

        {topPractices.length > 0 && (
          <Section style={insightsBox}>
            <Text style={insightHeading}>💫 Your Top Practices</Text>
            {topPractices.map((practice, index) => (
              <Text key={index} style={insightItem}>• {practice}</Text>
            ))}
          </Section>
        )}

        {insights.length > 0 && (
          <Section style={insightsBox}>
            <Text style={insightHeading}>✨ Insights & Encouragement</Text>
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
          <strong>Holistic Wellness Team</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WeeklySummaryEmail

const main = {
  backgroundColor: '#f6f9fc',
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
  color: '#333',
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
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #bae6fd',
}

const statHeading = {
  color: '#0369a1',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #e0f2fe',
}

const statLabel = {
  color: '#475569',
  fontSize: '14px',
  fontWeight: '500',
}

const statValue = {
  color: '#0369a1',
  fontSize: '16px',
  fontWeight: '700',
}

const insightsBox = {
  backgroundColor: '#fef3f2',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #fecaca',
}

const insightHeading = {
  color: '#b91c1c',
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
