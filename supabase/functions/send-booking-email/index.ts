import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { render } from "npm:@react-email/render@0.0.12";
import { BookingConfirmedEmail } from "./_templates/booking-confirmed.tsx";
import { BookingCancelledEmail } from "./_templates/booking-cancelled.tsx";
import { AdminNotificationEmail } from "./_templates/admin-notification.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  type: "confirmed" | "cancelled" | "admin_notification";
  bookingId: string;
  userEmail: string;
  userName: string;
  serviceTitle: string;
  bookingDate: string;
  duration?: string;
  price?: string;
  notes?: string;
  adminEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type,
      bookingId,
      userEmail,
      userName,
      serviceTitle,
      bookingDate,
      duration,
      price,
      notes,
      adminEmail,
    }: BookingEmailRequest = await req.json();

    console.log("Sending booking email:", { type, bookingId, userEmail });

    let html: string;
    let subject: string;
    let to: string;

    if (type === "confirmed") {
      html = render(
        React.createElement(BookingConfirmedEmail, {
          userName,
          serviceTitle,
          bookingDate,
          duration: duration || "",
          price: price || "",
          notes,
        })
      );
      subject = `Booking Confirmed: ${serviceTitle}`;
      to = userEmail;
    } else if (type === "cancelled") {
      html = render(
        React.createElement(BookingCancelledEmail, {
          userName,
          serviceTitle,
          bookingDate,
        })
      );
      subject = `Booking Cancelled: ${serviceTitle}`;
      to = userEmail;
    } else if (type === "admin_notification") {
      html = render(
        React.createElement(AdminNotificationEmail, {
          userName,
          userEmail,
          serviceTitle,
          bookingDate,
          duration: duration || "",
          price: price || "",
          notes,
          bookingId,
        })
      );
      subject = `New Booking Request: ${serviceTitle}`;
      to = adminEmail || "admin@holistic-wellness.com";
    } else {
      throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "Holistic Wellness <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
