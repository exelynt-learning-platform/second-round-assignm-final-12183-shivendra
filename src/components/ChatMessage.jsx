import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

// ---------------------------------------------------------------------------
// ChatMessage Component
// ---------------------------------------------------------------------------
// Renders a single chat bubble for either the user or the AI assistant.
//
// Layout:
//   - User messages: right-aligned, blue background (#2563eb), white text.
//   - AI messages: left-aligned, dark gray background (#1e293b), white text.
//
// Features:
//   - Timestamp displayed below each bubble in small gray text.
//   - Copy-to-clipboard button on AI messages, visible on hover.
//   - Responsive max-width: 70% on desktop, 90% on mobile (< 768px).
//   - Fade-in animation when a new message first appears.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
// Small inline icons for the copy button and its "copied" confirmation state.
// ---------------------------------------------------------------------------

// Clipboard copy icon (two overlapping rectangles).
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// Checkmark icon shown for 2 seconds after a successful copy.
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChatMessage = ({ message }) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // ---------------------------------------------------------------------------
  // Responsive Max-Width
  // ---------------------------------------------------------------------------
  // Listen for window resize events to toggle between mobile (90%) and
  // desktop (70%) bubble widths. Cleanup removes the listener on unmount.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------------------------------------------------------------------
  // Copy to Clipboard
  // ---------------------------------------------------------------------------
  // Copies the full message text to the clipboard. After a successful write,
  // the icon swaps to a green checkmark for 2 seconds, then reverts.
  // ---------------------------------------------------------------------------
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------
  // User bubbles: right-aligned, blue background.
  // AI bubbles: left-aligned, dark gray background.
  // ---------------------------------------------------------------------------

  // Outer container — aligns the bubble left (AI) or right (user).
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    marginBottom: 8,
    animation: 'fadeInUp 0.3s ease forwards',
  };

  // "You" or "AI" label above the bubble.
  const labelStyle = {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  };

  // Message bubble — color scheme depends on sender.
  const bubbleStyle = {
    position: 'relative',
    backgroundColor: isUser ? '#2563eb' : '#1e293b',
    color: '#ffffff',
    borderRadius: 12,
    padding: '10px 14px',
    maxWidth: isMobile ? '90%' : '70%',
    wordWrap: 'break-word',
  };

  // Timestamp text — small, gray, placed just below the bubble.
  const timestampStyle = {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    opacity: 0.7,
  };

  // Copy button — positioned top-right inside the bubble.
  // Hidden by default (opacity 0), revealed on hover via CSS.
  const copyBtnStyle = {
    position: 'absolute',
    top: 4,
    right: 4,
    background: 'rgba(0, 0, 0, 0.4)',
    border: 'none',
    borderRadius: 6,
    padding: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.15s ease',
    color: '#d1d5db',
  };

  return (
    <div style={containerStyle}>
      {/* -----------------------------------------------------------------
          Inline <style> block
          - fadeInUp keyframes: slides the message up slightly while fading in.
          - .ai-bubble:hover .copy-btn: reveals the copy button on hover.
          - .chat-bubble: no additional margin (handled by timestampStyle).
          ----------------------------------------------------------------- */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .ai-bubble:hover .copy-btn {
          opacity: 1 !important;
        }
      `}</style>

      {/* Sender label — "You" for user, "AI" for assistant. */}
      <div style={labelStyle}>{isUser ? 'You' : 'AI'}</div>

      {/* Message bubble */}
      <div
        className={isUser ? 'chat-bubble' : 'chat-bubble ai-bubble'}
        style={bubbleStyle}
      >
        {content}

        {/* Copy button — only rendered on AI messages. Appears on hover. */}
        {!isUser && (
          <button
            className="copy-btn"
            style={copyBtnStyle}
            onClick={handleCopy}
            aria-label="Copy message"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        )}
      </div>

      {/* Timestamp — displayed below the bubble when available. */}
      {timestamp && <div style={timestampStyle}>{timestamp}</div>}
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.oneOf(['user', 'assistant']).isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
  }).isRequired,
};

// ---------------------------------------------------------------------------
// React.memo Optimization
// ---------------------------------------------------------------------------
// Wrapping with React.memo prevents re-renders when the `message` prop
// is shallowly equal. Since each message object is immutable (Redux state),
// this skips the entire render cycle for unchanged messages when a new
// message is appended to the list.
// ---------------------------------------------------------------------------
export default React.memo(ChatMessage);
