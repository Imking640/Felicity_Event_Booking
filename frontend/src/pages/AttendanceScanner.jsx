import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';

const AttendanceScanner = () => {
  const { eventId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualTicketId, setManualTicketId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState('dashboard'); // dashboard, scanner, manual, list, upload
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (eventId && token) {
      fetchEventDetails();
      fetchAttendance();
    } else if (!eventId) {
      setLoading(false);
    } else if (!token) {
      // Token not yet available, wait a bit then check again
      const timeout = setTimeout(() => {
        if (!token) {
          setError('Please login to access this page');
          setLoading(false);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, token]);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(err => console.log(err));
      }
    };
  }, []);

  const fetchEventDetails = async () => {
    console.log('Fetching event details for:', eventId, 'with token:', token ? 'present' : 'missing');
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Event fetch response:', data);
      if (data.success) {
        setEvent(data.event);
      } else {
        setError(data.message || 'Event not found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event');
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    console.log('Fetching attendance for:', eventId);
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Attendance fetch response:', data);
      if (data.success) {
        setAttendance(data);
      } else {
        console.error('Attendance fetch failed:', data.message);
        // Not an error if event exists but no attendance data yet
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScan(decodedText);
          html5QrCode.stop();
          setScannerActive(false);
        },
        (errorMessage) => {
          // Ignore error messages during scanning
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      alert('Failed to start camera. Please check permissions or use manual entry.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);
    setScanResult(null);

    try {
      // Create a temporary div for the scanner if it doesn't exist
      let scannerDiv = document.getElementById('qr-reader-upload');
      if (!scannerDiv) {
        scannerDiv = document.createElement('div');
        scannerDiv.id = 'qr-reader-upload';
        scannerDiv.style.display = 'none';
        document.body.appendChild(scannerDiv);
      }

      const html5QrCode = new Html5Qrcode("qr-reader-upload");
      
      console.log('Scanning file:', file.name, file.type, file.size);
      const decodedText = await html5QrCode.scanFile(file, true);
      console.log('Decoded QR text:', decodedText);
      
      // Process the scanned QR code
      await handleScan(decodedText);
      
      html5QrCode.clear();
    } catch (err) {
      console.error('Error scanning image:', err);
      setScanResult({
        success: false,
        message: 'Could not read QR code from image. Please try another image or use manual entry.'
      });
    } finally {
      setProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleScan = async (ticketId) => {
    if (processing) return;
    
    setProcessing(true);
    setScanResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/registrations/tickets/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ticketId })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          success: true,
          message: data.message,
          participant: data.participant
        });
        // Refresh attendance
        fetchAttendance();
      } else {
        setScanResult({
          success: false,
          message: data.message,
          duplicate: data.duplicate
        });
      }
    } catch (error) {
      console.error('Error scanning ticket:', error);
      setScanResult({
        success: false,
        message: 'Failed to scan ticket'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualEntry = (e) => {
    e.preventDefault();
    if (manualTicketId.trim()) {
      handleScan(manualTicketId.trim());
      setManualTicketId('');
    }
  };

  const toggleAttendance = async (registrationId, currentStatus) => {
    if (!window.confirm(`Mark as ${!currentStatus ? 'PRESENT' : 'ABSENT'}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/registrations/events/${eventId}/attendance/${registrationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          attended: !currentStatus,
          reason: 'Manual override by organizer'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance');
    }
  };

  const exportCSV = () => {
    window.open(`http://localhost:5000/api/events/${eventId}/attendance/export?token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: '#fff'
      }}>
        <div>Loading attendance data...</div>
      </div>
    );
  }

  if (error || !eventId) {
    return (
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: '#fff',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#ff6b6b' }}>{error || 'Event not found'}</div>
        <button
          onClick={() => navigate('/organizer/ongoing-events')}
          style={{
            background: 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
            border: 'none',
            color: '#000',
            padding: '0.8rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Go to Ongoing Events
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '2rem',
      color: '#fff'
    }}>
      {/* Hidden div for QR upload scanner */}
      <div id="qr-reader-upload" style={{ display: 'none' }}></div>
      
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 190, 11, 0.2) 100%)',
        padding: '2rem',
        borderRadius: '20px',
        border: '2px solid rgba(255, 255, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontFamily: "'Anton', sans-serif"
          }}
        >
          ← Back
        </button>
        
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(90deg, #ffff00 0%, #ff00ff 50%, #00ffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Anton', sans-serif"
        }}>
          📱 QR Scanner & Attendance
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#ffff00' }}>
          {event?.eventName}
        </p>
      </div>

      {/* Stats Dashboard */}
      {view === 'dashboard' && (
        <>
          {attendance ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.2) 100%)',
                padding: '2rem',
                borderRadius: '20px',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00ff88' }}>
                  {attendance.stats.attended}
                </div>
                <div style={{ color: '#ddd' }}>Attended</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 0, 0.2) 0%, rgba(255, 190, 11, 0.2) 100%)',
                padding: '2rem',
                borderRadius: '20px',
                border: '2px solid rgba(255, 255, 0, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffff00' }}>
                  {attendance.stats.notAttended}
                </div>
                <div style={{ color: '#ddd' }}>Not Yet Scanned</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 200, 255, 0.2) 100%)',
                padding: '2rem',
                borderRadius: '20px',
                border: '2px solid rgba(0, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00ffff' }}>
                  {attendance.stats.attendanceRate}%
                </div>
                <div style={{ color: '#ddd' }}>Attendance Rate</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2) 0%, rgba(200, 0, 200, 0.2) 100%)',
                padding: '2rem',
                borderRadius: '20px',
                border: '2px solid rgba(255, 0, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ff00ff' }}>
                  {attendance.stats.totalRegistered}
                </div>
                <div style={{ color: '#ddd' }}>Total Registered</div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 0, 0.1)',
              padding: '2rem',
              borderRadius: '20px',
              border: '2px solid rgba(255, 255, 0, 0.3)',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#ffff00', marginBottom: '0.5rem' }}>⚠️ No registrations found for this event yet.</p>
              <p style={{ color: '#ddd' }}>You can still use the scanner to mark attendance once participants register.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setView('scanner')}
              style={{
                padding: '1.2rem',
                borderRadius: '20px',
                border: '2px solid rgba(255, 255, 0, 0.6)',
                background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3) 0%, rgba(255, 190, 11, 0.3) 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              📱 Scan QR Code
            </button>

            <button
              onClick={() => setView('upload')}
              style={{
                padding: '1.2rem',
                borderRadius: '20px',
                border: '2px solid rgba(138, 43, 226, 0.6)',
                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(100, 30, 180, 0.3) 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              📷 Upload QR Image
            </button>

            <button
              onClick={() => setView('manual')}
              style={{
                padding: '1.2rem',
                borderRadius: '20px',
                border: '2px solid rgba(0, 255, 255, 0.6)',
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 200, 200, 0.2) 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              ⌨️ Manual Entry
            </button>

            <button
              onClick={() => setView('list')}
              style={{
                padding: '1.2rem',
                borderRadius: '20px',
                border: '2px solid rgba(255, 0, 255, 0.6)',
                background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2) 0%, rgba(200, 0, 200, 0.2) 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              📋 View All
            </button>

            <button
              onClick={exportCSV}
              style={{
                padding: '1.2rem',
                borderRadius: '20px',
                border: '2px solid rgba(0, 255, 136, 0.6)',
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.2) 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </>
      )}

      {/* QR Scanner View */}
      {view === 'scanner' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setView('dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontFamily: "'Anton', sans-serif"
            }}
          >
            ← Back to Dashboard
          </button>

          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            color: '#ffff00',
            fontFamily: "'Anton', sans-serif"
          }}>
            📱 Scan QR Code
          </h2>

          <div id="qr-reader" style={{ 
            width: '100%', 
            maxWidth: '500px',
            margin: '0 auto',
            borderRadius: '15px',
            overflow: 'hidden'
          }}></div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            {!scannerActive ? (
              <button
                onClick={startScanner}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '30px',
                  border: '2px solid rgba(0, 255, 136, 0.6)',
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 200, 100, 0.3) 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  fontFamily: "'Anton', sans-serif",
                  textTransform: 'uppercase'
                }}
              >
                📷 Start Camera
              </button>
            ) : (
              <button
                onClick={stopScanner}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '30px',
                  border: '2px solid rgba(255, 0, 85, 0.6)',
                  background: 'linear-gradient(135deg, rgba(255, 0, 85, 0.3) 0%, rgba(200, 0, 60, 0.3) 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  fontFamily: "'Anton', sans-serif",
                  textTransform: 'uppercase'
                }}
              >
                ⏸️ Stop Camera
              </button>
            )}
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: '15px',
              background: scanResult.success 
                ? 'rgba(0, 255, 136, 0.2)' 
                : 'rgba(255, 0, 85, 0.2)',
              border: `2px solid ${scanResult.success ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 85, 0.5)'}`,
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                {scanResult.success ? '✅' : '❌'}
              </div>
              <div style={{ 
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: scanResult.success ? '#00ff88' : '#ff0055'
              }}>
                {scanResult.message}
              </div>
              {scanResult.participant && (
                <div style={{ fontSize: '1.1rem', color: '#ddd' }}>
                  {scanResult.participant.firstName} {scanResult.participant.lastName}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Entry View */}
      {view === 'manual' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setView('dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontFamily: "'Anton', sans-serif"
            }}
          >
            ← Back to Dashboard
          </button>

          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            color: '#ffff00',
            fontFamily: "'Anton', sans-serif"
          }}>
            ⌨️ Manual Ticket Entry
          </h2>

          <form onSubmit={handleManualEntry} style={{
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              value={manualTicketId}
              onChange={(e) => setManualTicketId(e.target.value)}
              placeholder="Enter Ticket ID (e.g., FEL-xxxxx-xxxx)"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '15px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1.1rem',
                fontFamily: "'Anton', sans-serif",
                marginBottom: '1rem'
              }}
            />

            <button
              type="submit"
              disabled={processing || !manualTicketId.trim()}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                borderRadius: '30px',
                border: '2px solid rgba(0, 255, 136, 0.6)',
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 200, 100, 0.3) 100%)',
                color: '#fff',
                cursor: processing || !manualTicketId.trim() ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                opacity: processing || !manualTicketId.trim() ? 0.5 : 1
              }}
            >
              {processing ? '⏳ Validating...' : '✅ Mark Attendance'}
            </button>
          </form>

          {/* Scan Result */}
          {scanResult && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: '15px',
              background: scanResult.success 
                ? 'rgba(0, 255, 136, 0.2)' 
                : 'rgba(255, 0, 85, 0.2)',
              border: `2px solid ${scanResult.success ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 85, 0.5)'}`,
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                {scanResult.success ? '✅' : '❌'}
              </div>
              <div style={{ 
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: scanResult.success ? '#00ff88' : '#ff0055'
              }}>
                {scanResult.message}
              </div>
              {scanResult.participant && (
                <div style={{ fontSize: '1.1rem', color: '#ddd' }}>
                  {scanResult.participant.firstName} {scanResult.participant.lastName}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload QR Image View */}
      {view === 'upload' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setView('dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontFamily: "'Anton', sans-serif"
            }}
          >
            ← Back to Dashboard
          </button>

          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            color: '#8a2be2',
            fontFamily: "'Anton', sans-serif"
          }}>
            📷 Upload QR Code Image
          </h2>

          <p style={{ color: '#aaa', marginBottom: '1.5rem', textAlign: 'center' }}>
            Upload a screenshot or photo of a participant's QR code ticket to mark their attendance.
          </p>

          {/* Hidden div for QR scanning */}
          <div id="qr-reader-upload" style={{ display: 'none' }}></div>

          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="qr-image-upload"
            />
            
            <label
              htmlFor="qr-image-upload"
              style={{
                display: 'block',
                padding: '3rem 2rem',
                borderRadius: '20px',
                border: '3px dashed rgba(138, 43, 226, 0.5)',
                background: 'rgba(138, 43, 226, 0.1)',
                color: '#8a2be2',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '1.2rem',
                fontWeight: '700',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                marginBottom: '1.5rem',
                opacity: processing ? 0.5 : 1
              }}
            >
              {processing ? (
                <>⏳ Processing Image...</>
              ) : (
                <>
                  📤 Click to Upload QR Image
                  <div style={{ fontSize: '0.9rem', fontWeight: 'normal', marginTop: '0.5rem', color: '#aaa' }}>
                    Supports JPG, PNG, GIF
                  </div>
                </>
              )}
            </label>

            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              💡 Tip: Make sure the QR code is clear and not blurry for best results
            </p>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: '15px',
              background: scanResult.success 
                ? 'rgba(0, 255, 136, 0.2)' 
                : 'rgba(255, 0, 85, 0.2)',
              border: `2px solid ${scanResult.success ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 85, 0.5)'}`,
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                {scanResult.success ? '✅' : '❌'}
              </div>
              <div style={{ 
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: scanResult.success ? '#00ff88' : '#ff0055'
              }}>
                {scanResult.message}
              </div>
              {scanResult.participant && (
                <div style={{ fontSize: '1.1rem', color: '#ddd' }}>
                  {scanResult.participant.firstName} {scanResult.participant.lastName}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Participant List View */}
      {view === 'list' && attendance && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setView('dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontFamily: "'Anton', sans-serif"
            }}
          >
            ← Back to Dashboard
          </button>

          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            color: '#ffff00',
            fontFamily: "'Anton', sans-serif"
          }}>
            📋 All Participants
          </h2>

          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {attendance.registrations.map(reg => (
              <div
                key={reg._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: reg.attended 
                    ? 'rgba(0, 255, 136, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  border: reg.attended 
                    ? '2px solid rgba(0, 255, 136, 0.3)' 
                    : '2px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div>
                  <div style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    {reg.attended ? '✅' : '⏳'} {reg.participant?.firstName} {reg.participant?.lastName}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#bbb' }}>
                    {reg.participant?.email}
                  </div>
                  {reg.attended && reg.attendanceMarkedAt && (
                    <div style={{ fontSize: '0.85rem', color: '#00ff88', marginTop: '0.25rem' }}>
                      Marked: {new Date(reg.attendanceMarkedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleAttendance(reg._id, reg.attended)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '20px',
                    border: reg.attended 
                      ? '2px solid rgba(255, 0, 85, 0.6)' 
                      : '2px solid rgba(0, 255, 136, 0.6)',
                    background: reg.attended 
                      ? 'rgba(255, 0, 85, 0.2)' 
                      : 'rgba(0, 255, 136, 0.2)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontFamily: "'Anton', sans-serif",
                    fontSize: '0.9rem'
                  }}
                >
                  {reg.attended ? 'Remove' : 'Mark Present'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;
