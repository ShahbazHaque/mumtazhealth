import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Admin email for notifications
const ADMIN_EMAIL = "mumtazhaque07@gmail.com";

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

    console.log(`[send-welcome-email] Starting email send for: ${userEmail}`);

    const greeting = userName ? `Hello ${userName}` : "Hello beautiful";

    // Send welcome email to user
    const userEmailResponse = await resend.emails.send({
      from: "Mumtaz Health <onboarding@resend.dev>",
      reply_to: ADMIN_EMAIL,
      to: [userEmail],
      subject: "Welcome to Mumtaz Health 💜",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; background: linear-gradient(180deg, #faf8fc 0%, #ffffff 100%);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #9B87C7; font-size: 28px; margin-bottom: 8px;">Mumtaz Health</h1>
            <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #9B87C7, #7C9885); margin: 0 auto;"></div>
          </div>
          
          <p style="line-height: 1.8; margin-bottom: 20px; font-size: 16px;">Welcome beautiful 💜</p>
          
          <p style="line-height: 1.8; margin-bottom: 20px; font-size: 16px;">Thank you for joining the Mumtaz Health community.</p>
          
          <p style="line-height: 1.8; margin-bottom: 20px; font-size: 16px;">This space is created by a woman who has walked through every phase of womanhood — menstrual health, motherhood, perimenopause, menopause, recovery, healing, and transformation.</p>
          
          <p style="line-height: 1.8; margin-bottom: 20px; font-size: 16px;">Here you will learn about <strong style="color: #7C9885;">Ayurveda</strong>, <strong style="color: #7C9885;">Yoga</strong>, <strong style="color: #7C9885;">Nutrition</strong>, <strong style="color: #7C9885;">Mobility</strong>, and <strong style="color: #7C9885;">Spirituality</strong> in a gentle and personalised way.</p>
          
          <div style="background: #f8f5fc; border-left: 4px solid #9B87C7; padding: 20px; margin: 32px 0; border-radius: 0 8px 8px 0;">
            <p style="line-height: 1.8; margin: 0; font-size: 16px; font-style: italic;">Your journey starts here. 💜</p>
          </div>
          
          <p style="line-height: 1.8; margin-top: 32px; margin-bottom: 8px; font-size: 16px;">With love and light,</p>
          
          <p style="line-height: 1.6; margin-bottom: 4px; font-size: 16px;"><strong style="color: #9B87C7;">Mumtaz Haque</strong></p>
          <p style="line-height: 1.6; margin-bottom: 4px; color: #666; font-size: 14px;">Founder, Mumtaz Health</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="color: #999; font-size: 12px;">Reply to this email: ${ADMIN_EMAIL}</p>
          </div>
        </div>
      `,
    });

    console.log("[send-welcome-email] User welcome email sent:", userEmailResponse);

    // Send admin notification about new signup
    try {
      const adminNotificationResponse = await resend.emails.send({
        from: "Mumtaz Health <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `🎉 New User Signup: ${userName || userEmail}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
            <h1 style="color: #9B87C7; font-size: 24px; margin-bottom: 20px;">New User Registration 🎉</h1>
            
            <div style="background: #f8f5fc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${userEmail}</p>
              ${userName ? `<p style="margin: 0 0 10px 0;"><strong>Username:</strong> ${userName}</p>` : ''}
              <p style="margin: 0;"><strong>Registered at:</strong> ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              A new user has completed registration on Mumtaz Health. Their welcome email has been sent successfully.
            </p>
          </div>
        `,
      });

      console.log("[send-welcome-email] Admin notification sent:", adminNotificationResponse);
    } catch (adminError) {
      // Log but don't fail the whole request if admin notification fails
      console.error("[send-welcome-email] Admin notification failed (non-critical):", adminError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      userEmail: userEmailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("[send-welcome-email] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to send welcome email. The user account was still created successfully."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
