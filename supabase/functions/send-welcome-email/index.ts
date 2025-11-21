import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userEmail: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName }: WelcomeEmailRequest = await req.json();

    const greeting = userName ? `Hello ${userName}` : "Hello beautiful";

    const emailResponse = await resend.emails.send({
      from: "Mumtaz Haque <mumtazhaque07@gmail.com>",
      to: [userEmail],
      subject: "Welcome to Mumtaz Health: Your Sanctuary Awaits.",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #7C9885; font-size: 24px; margin-bottom: 20px;">Welcome to Mumtaz Health</h1>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">${greeting},</p>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">I'm Mumtaz, and I want to personally welcome you to the Mumtaz Health community.</p>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">If you're here, it means you're ready to honor your unique life journey—and that is a beautiful and powerful choice.</p>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">This platform was built from my heart, drawing on over 30 years of holistic experience and having walked through many of womanhood's most profound phases myself, including navigating fertility challenges, postpartum mental health, peri-menopause, and recovery through hysterectomy rehab.</p>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">I created this space because I know the pressures women face, and I know how isolating the path can feel.</p>
          
          <h2 style="color: #9B87C7; font-size: 20px; margin-top: 24px; margin-bottom: 16px;">Our Promise to You:</h2>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">This is a safe, non-judgmental space where you can tap into the ancient wisdom of <strong>Yoga, Ayurveda, and spiritual principles</strong> to find balance and clarity—no matter where you are right now. Whether you're tracking your cycle, seeking dietary guidance, or simply looking for connection, we are here to support you.</p>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">Your life's journey is a privilege, and we are privileged to witness it. We are a community of like-minded women who want you to feel <strong>valued, inspired, and truly supported.</strong></p>
          
          <p style="line-height: 1.6; margin-bottom: 16px;">Ready to begin? Head back to the app, explore the life-phase tracker, and find a study group that resonates with your heart.</p>
          
          <p style="line-height: 1.6; margin-top: 32px; margin-bottom: 8px;">Welcome home,</p>
          
          <p style="line-height: 1.6; margin-bottom: 8px;">With deep support and respect,</p>
          
          <p style="line-height: 1.6; margin-bottom: 4px;"><strong>Mumtaz Haque</strong></p>
          <p style="line-height: 1.6; margin-bottom: 4px; color: #666;">Founder, Mumtaz Health</p>
          <p style="line-height: 1.6; color: #666;">mumtazhaque07@gmail.com</p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
