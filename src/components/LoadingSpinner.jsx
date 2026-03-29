import React, { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// LoadingSpinner Component
// ---------------------------------------------------------------------------
// WhatsApp-style typing indicator with 3 bouncing gray dots, animated one
// after another with a 0.2s delay between each. Rendered left-aligned inside
// a dark gray bubble (#1e293b) to visually match AI messages.
// ---------------------------------------------------------------------------

const LoadingSpinner = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // ---------------------------------------------------------------------------
  // Responsive Max-Width
  // ---------------------------------------------------------------------------
  // Match the same mobile/desktop breakpoint used by ChatMessage so the
  // typing indicator bubble has a consistent width.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  // Outer container — left-aligned to sit on the AI side of the chat.
  const containerStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: 16,
    animation: 'fadeInUp 0.3s ease forwards',
  };

  // "AI" label above the bubble, matching ChatMessage's label style.
  const labelStyle = {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  };

  // Bubble — dark gray background (#1e293b) matching the AI message bubble.
  const bubbleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 14px',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    maxWidth: isMobile ? '90%' : '70%',
  };

  // Individual dot — gray circle with a bounce animation.
  const dotStyle = {
    width: 8,
    height: 8,
    backgroundColor: '#9ca3af',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out',
  };

  return (
    <div style={containerStyle}>
      {/* -----------------------------------------------------------------
          Inline <style> block
          - bounce keyframes: moves each dot up and down in a smooth arc.
          - fadeInUp keyframes: fades the indicator in when it appears.
          ----------------------------------------------------------------- */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div>
        {/* Sender label — "AI" to match AI message bubbles. */}
        <div style={labelStyle}>AI</div>

        {/* Typing indicator bubble containing three bouncing dots. */}
        <div style={bubbleStyle}>
          <div style={{ ...dotStyle, animationDelay: '0s' }} />
          <div style={{ ...dotStyle, animationDelay: '0.2s' }} />
          <div style={{ ...dotStyle, animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// React.memo Optimization
// ---------------------------------------------------------------------------
// LoadingSpinner takes no props and its rendered output is static.
// React.memo ensures it is never re-rendered by parent state changes
// (e.g. new messages arriving) — it only mounts/unmounts when `loading`
// toggles.
// ---------------------------------------------------------------------------
export default React.memo(LoadingSpinner);
