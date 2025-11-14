import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.15'
import * as React from 'https://esm.sh/react@18.3.1'

interface BookingConfirmedEmailProps {
  userName: string
  serviceTitle: string
  bookingDate: string
  duration: string
  price: string
  notes?: string
}

export const BookingConfirmedEmail = ({
  userName,
  serviceTitle,
  bookingDate,
  duration,
  price,
  notes,
}: BookingConfirmedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your booking for {serviceTitle} has been confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Booking Confirmed!</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          Great news! Your booking has been confirmed. Here are the details:
        </Text>
        
        <Section style={detailsBox}>
          <Text style={detailLabel}>Service</Text>
          <Text style={detailValue}>{serviceTitle}</Text>
          
          <Text style={detailLabel}>Date & Time</Text>
          <Text style={detailValue}>{bookingDate}</Text>
          
          <Text style={detailLabel}>Duration</Text>
          <Text style={detailValue}>{duration}</Text>
          
          <Text style={detailLabel}>Price</Text>
          <Text style={detailValue}>{price}</Text>
          
          {notes && (
            <>
              <Text style={detailLabel}>Notes</Text>
              <Text style={detailValue}>{notes}</Text>
            </>
          )}
        </Section>

        <Text style={text}>
          We look forward to seeing you! If you have any questions, please don't hesitate to reach out.
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

export default BookingConfirmedEmail

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
