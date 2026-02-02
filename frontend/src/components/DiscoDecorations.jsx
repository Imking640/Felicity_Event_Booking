import React, { useEffect } from 'react';
import '../styles/discoTheme.css';

const DiscoDecorations = () => {
  useEffect(() => {
    // Rainbow mouse trail
    const mouseTrailColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff00'];
    let colorIndex = 0;

    const handleMouseMove = (e) => {
      const trail = document.createElement('div');
      trail.className = 'trail-particle';
      trail.style.left = e.clientX + 'px';
      trail.style.top = e.clientY + 'px';
      trail.style.background = mouseTrailColors[colorIndex];
      document.body.appendChild(trail);
      
      colorIndex = (colorIndex + 1) % mouseTrailColors.length;
      
      setTimeout(() => trail.remove(), 800);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Floating disco balls */}
      <div className="disco-ball" style={{ top: '10%', left: '10%', animationDelay: '0s' }} />
      <div className="disco-ball" style={{ top: '20%', right: '15%', animationDelay: '1s' }} />
      <div className="disco-ball" style={{ bottom: '15%', left: '20%', animationDelay: '2s' }} />
      
      {/* Vinyl records */}
      <div className="vinyl-record" style={{ top: '5%', right: '5%' }} />
      <div className="vinyl-record" style={{ bottom: '10%', right: '25%', animationDelay: '-2s' }} />
      
      {/* Star bursts */}
      <div className="star-burst" style={{ top: '30%', left: '5%' }} />
      <div className="star-burst" style={{ top: '60%', right: '8%', animationDelay: '-1s' }} />
      
      {/* Dancing speakers */}
      <div className="speaker" style={{ top: '40%', left: '20px' }}>
        <div className="speaker-cone small" />
        <div className="speaker-cone" />
      </div>
      <div className="speaker" style={{ top: '40%', right: '20px', animationDelay: '-0.25s' }}>
        <div className="speaker-cone small" />
        <div className="speaker-cone" />
      </div>
    </>
  );
};

export default DiscoDecorations;

// Utility function to create confetti
export const createConfetti = () => {
  const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff00'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-20px';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }, i * 20);
  }
};

// Utility function to show disco toast
export const showDiscoToast = (message, isSuccess = true) => {
  const toast = document.createElement('div');
  toast.className = `disco-toast ${!isSuccess ? 'error' : ''}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toast-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) reverse';
    setTimeout(() => toast.remove(), 400);
  }, 2600);
};
