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
      {/* Space background layers (no symbols) */}
      <div className="space-stars" />
      <div className="space-stars layer2" />
      <div className="space-nebula" />
      <div className="space-twinkle" />

      {/* Shooting stars */}
      <div className="shooting-star" style={{ top: '12%', right: '18%', animationDelay: '0s', animationDuration: '3.2s' }} />
      <div className="shooting-star" style={{ top: '28%', right: '62%', animationDelay: '2.2s', animationDuration: '3.8s' }} />
      <div className="shooting-star" style={{ top: '55%', right: '42%', animationDelay: '5.5s', animationDuration: '3.4s' }} />
      <div className="shooting-star" style={{ top: '72%', right: '78%', animationDelay: '7.3s', animationDuration: '3.1s' }} />
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
