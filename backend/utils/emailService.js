const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send ticket email to participant
 * @param {Object} participant - Participant user object
 * @param {Object} event - Event object
 * @param {Object} ticket - Ticket object with QR code
 * @returns {Promise<Object>} Email send result
 */
const sendTicketEmail = async (participant, event, ticket) => {
  try {
    const transporter = createTransporter();
    
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
            <p>Dear ${participant.firstName} ${participant.lastName},</p>
            
            <p>Thank you for registering! Your ticket has been generated successfully.</p>
            
            <div class="ticket-box">
              <h2 style="color: #667eea; margin-top: 0;">Your Ticket</h2>
              
              <div class="qr-code">
                <img src="${ticket.qrCode}" alt="Ticket QR Code" style="max-width: 100%; height: auto;" />
              </div>
              
              <div class="info-row">
                <span class="label">Ticket ID:</span> ${ticket.ticketId}
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
      to: participant.email,
      subject: `🎫 Your Ticket for ${event.eventName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `ticket-${ticket.ticketId}.png`,
          path: ticket.qrCode,
          cid: 'qrcode'
        }
      ]
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Ticket email sent:', info.messageId);
    
    // Update ticket to mark email as sent
    const Ticket = require('../models/Ticket');
    await Ticket.findByIdAndUpdate(ticket._id, {
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

module.exports = {
  sendTicketEmail,
  sendRegistrationConfirmation
};
