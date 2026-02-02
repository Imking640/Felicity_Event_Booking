const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');

/**
 * Generate QR code for a ticket
 * @param {Object} ticketData - Data to encode in QR code
 * @returns {Promise<String>} Base64 encoded QR code image
 */
const generateQRCode = async (ticketData) => {
  try {
    // Convert ticket data to JSON string
    const dataString = JSON.stringify(ticketData);
    
    // Generate QR code as data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Create a ticket with QR code for a registration
 * @param {ObjectId} registrationId - Registration ID
 * @param {ObjectId} eventId - Event ID
 * @param {ObjectId} participantId - Participant ID
 * @param {Date} eventEndDate - Event end date (for ticket expiry)
 * @returns {Promise<Object>} Created ticket
 */
const createTicket = async (registrationId, eventId, participantId, eventEndDate) => {
  try {
    // Generate unique ticket ID
    const ticketId = Ticket.generateTicketId();
    
    // Prepare ticket data for QR code
    const ticketData = {
      ticketId,
      registrationId: registrationId.toString(),
      eventId: eventId.toString(),
      participantId: participantId.toString(),
      generatedAt: new Date().toISOString()
    };
    
    // Generate QR code
    const qrCode = await generateQRCode(ticketData);
    
    // Set expiry date (1 day after event ends)
    const expiresAt = new Date(eventEndDate);
    expiresAt.setDate(expiresAt.getDate() + 1);
    
    // Create ticket in database
    const ticket = await Ticket.create({
      ticketId,
      registration: registrationId,
      event: eventId,
      participant: participantId,
      qrCode,
      expiresAt
    });
    
    return ticket;
  } catch (error) {
    console.error('Ticket creation error:', error);
    throw new Error('Failed to create ticket');
  }
};

/**
 * Verify and decode QR code data
 * @param {String} qrData - Scanned QR code data (JSON string)
 * @returns {Object} Decoded ticket data
 */
const verifyQRCode = (qrData) => {
  try {
    const ticketData = JSON.parse(qrData);
    
    // Validate required fields
    if (!ticketData.ticketId || !ticketData.registrationId || !ticketData.eventId) {
      throw new Error('Invalid QR code data');
    }
    
    return ticketData;
  } catch (error) {
    console.error('QR verification error:', error);
    throw new Error('Invalid QR code');
  }
};

/**
 * Scan and validate a ticket
 * @param {String} ticketId - Ticket ID from QR code
 * @param {ObjectId} eventId - Event ID (to verify ticket is for correct event)
 * @param {ObjectId} scannedByUserId - User ID of person scanning (organizer)
 * @returns {Promise<Object>} Validation result
 */
const scanTicket = async (ticketId, eventId, scannedByUserId) => {
  try {
    // Find ticket
    const ticket = await Ticket.findOne({ ticketId })
      .populate('participant', 'firstName lastName email participantType')
      .populate('event', 'eventName eventType');
    
    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found'
      };
    }
    
    // Verify ticket is for correct event
    if (ticket.event._id.toString() !== eventId.toString()) {
      return {
        success: false,
        message: 'Ticket is not for this event'
      };
    }
    
    // Check if already used
    if (ticket.status === 'used') {
      return {
        success: false,
        message: 'Ticket already scanned',
        scannedAt: ticket.scannedAt
      };
    }
    
    // Check if cancelled
    if (ticket.status === 'cancelled') {
      return {
        success: false,
        message: 'Ticket has been cancelled'
      };
    }
    
    // Check if expired
    if (ticket.status === 'expired' || !ticket.isValidForScanning()) {
      return {
        success: false,
        message: 'Ticket has expired'
      };
    }
    
    // Mark ticket as used
    await ticket.markAsUsed(scannedByUserId);
    
    // Update registration attendance
    const Registration = require('../models/Registration');
    await Registration.findByIdAndUpdate(ticket.registration, {
      attended: true,
      attendanceMarkedAt: Date.now(),
      attendanceMarkedBy: scannedByUserId
    });
    
    // Update event attendance count
    const Event = require('../models/Event');
    await Event.findByIdAndUpdate(eventId, {
      $inc: { totalAttendance: 1 }
    });
    
    return {
      success: true,
      message: 'Ticket validated successfully',
      participant: ticket.participant,
      event: ticket.event
    };
  } catch (error) {
    console.error('Ticket scanning error:', error);
    throw new Error('Failed to scan ticket');
  }
};

module.exports = {
  generateQRCode,
  createTicket,
  verifyQRCode,
  scanTicket
};
