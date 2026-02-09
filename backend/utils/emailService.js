const nodemailer = require('nodemailer');

// Create email transporter - optimized for Brevo (Sendinblue)
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Timeouts for cloud environments
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 20000,   // 20 seconds
    socketTimeout: 30000,     // 30 seconds
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  };

  // Log email config (without password) for debugging
  console.log('Email config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user ? '***configured***' : 'NOT SET'
  });

  return nodemailer.createTransport(config);
};

/**
 * Send ticket email to participant
 * @param {Object|string} participantOrEmail - Participant user object OR email string
 * @param {Object|string} eventOrName - Event object OR participant name (if first param is email)
 * @param {Object} ticketOrEvent - Ticket object OR Event object (if first param is email)
 * @param {Object} [ticket] - Ticket object (if first param is email)
 * @returns {Promise<Object>} Email send result
 */
const sendTicketEmail = async (participantOrEmail, eventOrName, ticketOrEvent, ticket) => {
  try {
    const transporter = createTransporter();
    
    // Handle both calling conventions:
    // Old: sendTicketEmail(participant, event, ticket)
    // New: sendTicketEmail(email, name, event, ticket)
    let recipientEmail, recipientName, event, ticketData;
    
    if (typeof participantOrEmail === 'string') {
      // New format: (email, name, event, ticket)
      recipientEmail = participantOrEmail;
      recipientName = eventOrName || 'Participant';
      event = ticketOrEvent;
      ticketData = ticket;
    } else {
      // Old format: (participant, event, ticket)
      recipientEmail = participantOrEmail?.email;
      recipientName = `${participantOrEmail?.firstName || ''} ${participantOrEmail?.lastName || ''}`.trim() || 'Participant';
      event = eventOrName;
      ticketData = ticketOrEvent;
    }
    
    if (!recipientEmail) {
      throw new Error('Recipient email is required');
    }
    
    console.log('Sending ticket email to:', recipientEmail);
    
    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-box { background: white; padding: 20px; margin: 20px 0; 
                       border: 2px dashed #667eea; border-radius: 10px; text-align: center; }
          .qr-code { max-width: 300px; margin: 20px auto; }
          .info-row { margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 5px; }
          .label { font-weight: bold; color: #667eea; }
          .button { background: #667eea; color: white; padding: 12px 30px; 
                   text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Event Registration Confirmed!</h1>
            <p>Your ticket for ${event.eventName}</p>
          </div>
          
          <div class="content">
            <p>Dear ${recipientName},</p>
            
            <p>Thank you for registering! Your ticket has been generated successfully.</p>
            
            <div class="ticket-box">
              <h2 style="color: #667eea; margin-top: 0;">Your Ticket</h2>
              
              <div class="qr-code">
                <img src="${ticketData.qrCode}" alt="Ticket QR Code" style="max-width: 100%; height: auto;" />
              </div>
              
              <div class="info-row">
                <span class="label">Ticket ID:</span> ${ticketData.ticketId}
              </div>
              
              <div class="info-row">
                <span class="label">Event:</span> ${event.eventName}
              </div>
              
              <div class="info-row">
                <span class="label">Type:</span> ${event.eventType}
              </div>
              
              <div class="info-row">
                <span class="label">Date:</span> ${new Date(event.eventStartDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <div class="info-row">
                <span class="label">Time:</span> ${new Date(event.eventStartDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <h3>Important Instructions:</h3>
            <ul>
              <li>Save this email or take a screenshot of your QR code</li>
              <li>Present this QR code at the event venue for entry</li>
              <li>Arrive 15 minutes before the event starts</li>
              <li>Carry a valid ID proof</li>
              <li>This ticket is non-transferable</li>
            </ul>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Note:</strong> ${event.eventDescription}
            </p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}" class="button">
                View Event Details
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>For queries, contact: ${process.env.EMAIL_USER}</p>
            <p>&copy; 2026 Felicity Event Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Email options
    const mailOptions = {
      from: `"Felicity Events" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🎫 Your Ticket for ${event.eventName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `ticket-${ticketData.ticketId}.png`,
          path: ticketData.qrCode,
          cid: 'qrcode'
        }
      ]
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Ticket email sent:', info.messageId);
    
    // Update ticket to mark email as sent
    const Ticket = require('../models/Ticket');
    await Ticket.findByIdAndUpdate(ticketData._id, {
      emailSent: true,
      emailSentAt: Date.now()
    });
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw error - registration should succeed even if email fails
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send registration confirmation email (without ticket)
 * @param {Object} participant - Participant user object
 * @param {Object} event - Event object
 * @returns {Promise<Object>} Email send result
 */
const sendRegistrationConfirmation = async (participant, event) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Registration Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${participant.firstName} ${participant.lastName},</p>
            <p>You have successfully registered for <strong>${event.eventName}</strong>.</p>
            <p>Your ticket will be sent in a separate email shortly.</p>
            <p>Thank you!</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Felicity Events" <${process.env.EMAIL_USER}>`,
      to: participant.email,
      subject: `Registration Confirmed - ${event.eventName}`,
      html: htmlContent
    };
    
    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP for email verification
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} Email send result
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%); 
                   color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .otp-box { background: white; padding: 30px; margin: 20px 0; 
                    border: 2px solid #8338ec; border-radius: 15px; }
          .otp-code { font-size: 42px; font-weight: bold; letter-spacing: 10px; 
                     color: #8338ec; font-family: 'Courier New', monospace; }
          .warning { color: #ff006e; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Email Verification</h1>
            <p>Felicity Event Booking</p>
          </div>
          
          <div class="content">
            <p>Hello ${name},</p>
            <p>Please use the following OTP to verify your email address:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            
            <p class="warning">
              ⚠️ Do not share this OTP with anyone. Our team will never ask for your OTP.
            </p>
          </div>
          
          <div class="footer">
            <p>If you didn't request this OTP, please ignore this email.</p>
            <p>&copy; 2026 Felicity Event Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Felicity Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔐 Your Verification OTP - ${otp}`,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email, 'MessageId:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('OTP email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment pending notification
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {Object} event - Event object
 * @param {number} amount - Amount to pay
 * @returns {Promise<Object>} Email send result
 */
const sendPaymentPendingEmail = async (email, name, event, amount) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f9a825 0%, #ff6f00 100%); 
                   color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount-box { background: white; padding: 20px; margin: 20px 0; 
                       border: 2px solid #ff6f00; border-radius: 10px; text-align: center; }
          .amount { font-size: 36px; font-weight: bold; color: #ff6f00; }
          .button { background: #ff6f00; color: white; padding: 12px 30px; 
                   text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Required</h1>
            <p>${event.eventName}</p>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            <p>Your registration for <strong>${event.eventName}</strong> is pending payment verification.</p>
            
            <div class="amount-box">
              <p>Amount to Pay:</p>
              <div class="amount">₹${amount}</div>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Complete the payment</li>
              <li>Take a screenshot of the payment confirmation</li>
              <li>Upload the payment proof on the event page</li>
              <li>Wait for organizer approval</li>
            </ol>
            
            <p>Once your payment is verified, you'll receive your ticket via email.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}/register" class="button">
                Upload Payment Proof
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Felicity Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `💳 Payment Required - ${event.eventName}`,
      html: htmlContent
    };
    
    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('Payment pending email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendTicketEmail,
  sendRegistrationConfirmation,
  sendOTPEmail,
  sendPaymentPendingEmail
};
