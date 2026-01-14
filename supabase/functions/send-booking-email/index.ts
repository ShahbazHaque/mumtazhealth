import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { BookingConfirmedEmail } from "./_templates/booking-confirmed.tsx";
import { BookingCancelledEmail } from "./_templates/booking-cancelled.tsx";
import { AdminNotificationEmail } from "./_templates/admin-notification.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin email for notifications - stored server-side only
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "mumtazhaque07@gmail.com";

interface BookingEmailRequest {
  type: "confirmed" | "cancelled" | "admin_notification";
  bookingId: string;
  userEmail?: string;
  userName?: string;
  serviceTitle?: string;
  bookingDate?: string;
  duration?: string;
  price?: string;
  notes?: string;
}

// Validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize string input
function sanitizeString(str: unknown, maxLength: number = 500): string {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // Validate required fields
    const { type, bookingId } = body;
    
    if (!type || !['confirmed', 'cancelled', 'admin_notification'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!bookingId || !isValidUUID(bookingId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid booking ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the booking belongs to the authenticated user
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*, services(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !bookingData) {
      console.error("Booking lookup error:", bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership - user must own the booking
    if (bookingData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to send emails for this booking' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    // Use verified data from database, not from request body
    const userName = profile?.username || user.email?.split('@')[0] || "Valued Client";
    const userEmail = user.email || '';
    const serviceTitle = bookingData.services?.title || "Wellness Service";
    const bookingDate = new Date(bookingData.booking_date).toLocaleString();
    const duration = bookingData.services?.duration_days 
      ? `${bookingData.services.duration_days} days` 
      : `${bookingData.services?.duration_hours || 60} minutes`;
    const price = `${bookingData.services?.currency || 'USD'} ${bookingData.services?.price || 'TBD'}`;
    const notes = sanitizeString(bookingData.notes, 500);

    console.log("Sending booking email:", { type, bookingId, userEmail: userEmail.substring(0, 3) + '***', userName, serviceTitle });

    let html: string;
    let subject: string;
    let to: string;

    if (type === "confirmed") {
      html = await renderAsync(
        React.createElement(BookingConfirmedEmail, {
          userName,
          serviceTitle,
          bookingDate,
          duration,
          price,
          notes: notes || undefined,
        })
      );
      subject = `Booking Confirmed: ${serviceTitle}`;
      to = userEmail;
    } else if (type === "cancelled") {
      html = await renderAsync(
        React.createElement(BookingCancelledEmail, {
          userName,
          serviceTitle,
          bookingDate,
        })
      );
      subject = `Booking Cancelled: ${serviceTitle}`;
      to = userEmail;
    } else if (type === "admin_notification") {
      html = await renderAsync(
        React.createElement(AdminNotificationEmail, {
          userName,
          userEmail,
          serviceTitle,
          bookingDate,
          duration,
          price,
          notes: notes || "",
          bookingId,
        })
      );
      subject = `New Booking Request: ${serviceTitle}`;
      to = ADMIN_EMAIL;
    } else {
      throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "Holistic Wellness <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-booking-email function:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
