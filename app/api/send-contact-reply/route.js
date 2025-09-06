
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { 
      messageId, 
      replyText, 
      recipientEmail, 
      recipientName, 
      originalSubject, 
      originalMessage 
    } = await request.json();

    // Validate required fields
    if (!messageId || !replyText || !recipientEmail) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated and admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    // SendGrid integration
    const sgMail = require('@sendgrid/mail');
    
    // Set API key from environment variables
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailData = {
      to: recipientEmail,
      from: {
        email: 'contact@fan-gigs.com',
        name: 'FanGigs Support'
      },
      subject: `Re: ${originalSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FanGigs Support</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <p style="margin-bottom: 20px;">Hi ${recipientName},</p>
            
            <p style="margin-bottom: 20px;">Thank you for contacting FanGigs. Here's our response to your inquiry:</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
              ${replyText.replace(/\n/g, '<br>')}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="font-size: 14px; color: #6c757d; margin-bottom: 10px;"><strong>Original Message:</strong></p>
              <p style="font-size: 14px; color: #6c757d; margin-bottom: 5px;"><strong>Subject:</strong> ${originalSubject}</p>
              <div style="font-size: 14px; color: #6c757d; background: #f8f9fa; padding: 15px; border-radius: 5px;">
                ${originalMessage.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <p style="margin-top: 30px;">If you have any additional questions, please don't hesitate to reach out.</p>
            
            <p style="margin-bottom: 0;">Best regards,<br>The FanGigs Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
            <p style="margin: 0;">© 2024 FanGigs. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Visit us at <a href="https://fan-gigs.com" style="color: #667eea;">fan-gigs.com</a></p>
          </div>
        </div>
      `,
      text: `
Hi ${recipientName},

Thank you for contacting FanGigs. Here's our response to your inquiry:

${replyText}

---
Original Message:
Subject: ${originalSubject}
${originalMessage}

If you have any additional questions, please don't hesitate to reach out.

Best regards,
The FanGigs Team

© 2024 FanGigs. All rights reserved.
Visit us at https://fan-gigs.com
      `
    };

    // Send email via SendGrid
    let sendGridResponse;
    try {
      sendGridResponse = await sgMail.send(emailData);
      console.log('Email sent successfully via SendGrid');
    } catch (sendGridError) {
      console.error('SendGrid error:', sendGridError);
      throw new Error(`Failed to send email: ${sendGridError.message || 'SendGrid error'}`);
    }

    // Save the sent email to database for tracking
    const { error: replyInsertError } = await supabase
      .from('contact_replies')
      .insert({
        contact_submission_id: messageId,
        sender_id: user.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject: emailData.subject,
        reply_content: replyText,
        original_message: originalMessage,
        email_html: emailData.html,
        email_text: emailData.text,
        sendgrid_message_id: sendGridResponse?.[0]?.headers?.['x-message-id'] || null,
        delivery_status: 'sent'
      });

    if (replyInsertError) {
      console.error('Error saving email reply to database:', replyInsertError);
    }

    // Update the contact submission with reply timestamp
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({ 
        status: 'replied',
        replied_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (updateError) {
      console.error('Error updating contact submission:', updateError);
    }

    return NextResponse.json({ 
      message: 'Reply sent successfully',
      emailData: process.env.NODE_ENV === 'development' ? emailData : undefined
    });

  } catch (error) {
    console.error('Error sending contact reply:', error);
    return NextResponse.json(
      { message: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
