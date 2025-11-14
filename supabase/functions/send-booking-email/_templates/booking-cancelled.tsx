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

interface BookingCancelledEmailProps {
  userName: string
  serviceTitle: string
  bookingDate: string
}

export const BookingCancelledEmail = ({
  userName,
  serviceTitle,
  bookingDate,
}: BookingCancelledEmailProps) => (
  <Html>
    <Head />
    <Preview>Your booking for {serviceTitle} has been cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Cancelled</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          This is to confirm that your booking has been cancelled.
        </Text>
        
        <Section style={detailsBox}>
          <Text style={detailLabel}>Service</Text>
          <Text style={detailValue}>{serviceTitle}</Text>
          
          <Text style={detailLabel}>Original Date & Time</Text>
          <Text style={detailValue}>{bookingDate}</Text>
        </Section>

        <Text style={text}>
          If you'd like to reschedule or book a different service, we'd love to welcome you back anytime.
        </Text>
        
        <Text style={footer}>
          With gratitude,
          <br />
          <strong>Holistic Wellness Team</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default BookingCancelledEmail

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

const detailsBox = {
  backgroundColor: '#f8faf9',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e8ebe8',
}

const detailLabel = {
  color: '#666',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '16px 0 4px',
}

const detailValue = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 8px',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e8ebe8',
}
