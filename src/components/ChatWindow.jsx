import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMessages } from '../store/chatSlice';
import { useTheme } from '../context/ThemeContext';
import ErrorBanner from './ErrorBanner';
import ChatMessage from './ChatMessage';
import LoadingSpinner from './LoadingSpinner';
import ChatInput from './ChatInput';

// ---------------------------------------------------------------------------
// ChatWindow Component
// ---------------------------------------------------------------------------
// Top-level layout for the chat UI. Renders three vertically stacked regions:
//
//   1. Fixed header   — title, theme toggle, and "Clear Chat" button.
//   2. Scrollable area — messages + the typing-indicator placeholder.
//   3. Fixed input bar — sticky at the bottom (ChatInput).
//
// The component also wires up auto-scroll, a browser confirm dialog for
// clearing chat, and responsive padding / font sizes for mobile screens.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
// Moon icon shown in light mode (click to switch to dark).
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Sun icon shown in dark mode (click to switch to light).
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// Trash icon used inside the "Clear Chat" button.
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ChatWindow = () => {
  // ---------------------------------------------------------------------------
  // Redux State
  // ---------------------------------------------------------------------------
  const { messages, loading, error } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------
  // isDark: boolean flag, toggleTheme: flip function, theme: color tokens.
  // Preference is persisted to localStorage inside ThemeContext.
  const { isDark, toggleTheme, theme } = useTheme();

  // ---------------------------------------------------------------------------
  // Auto-Scroll Ref
  // ---------------------------------------------------------------------------
  // A hidden <div> sits at the very bottom of the messages container.
  // Whenever `messages` changes, we scroll it into view smoothly.
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ---------------------------------------------------------------------------
  // Clear Chat Handler
  // ---------------------------------------------------------------------------
  // Uses the browser's native confirm() dialog. If the user clicks OK,
  // dispatches the clearMessages action to reset the Redux store.
  // Wrapped in useCallback so the function reference is stable across
  // re-renders, preventing unnecessary re-renders of child components
  // that receive it as a prop.
  const handleClearChat = useCallback(() => {
    if (window.confirm('This will delete all messages and reset the conversation. This action cannot be undone.')) {
      dispatch(clearMessages());
    }
  }, [dispatch]);

  // ---------------------------------------------------------------------------
  // Rendered Messages List
  // ---------------------------------------------------------------------------
  // useMemo caches the mapped ChatMessage components. When a new message is
  // appended, only the new element is created — the existing ones are reused
  // from the previous render. Combined with React.memo on ChatMessage, this
  // means unchanged messages skip their render cycle entirely.
  const renderedMessages = useMemo(
    () => messages.map((message, index) => (
      <ChatMessage key={index} message={message} />
    )),
    [messages]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: theme.appBg,
        color: theme.headerText,
      }}
    >
      {/* -----------------------------------------------------------------
          Inline <style> block
          - Mobile media queries reduce header font, padding, and message area
            padding for screens narrower than 768px.
          ----------------------------------------------------------------- */}
      <style>{`
        @media (max-width: 768px) {
          .chat-header-title {
            font-size: 1.1rem !important;
          }
          .chat-header {
            padding: 10px 12px !important;
          }
          .chat-messages {
            padding: 10px !important;
          }
          .chat-header-buttons {
            gap: 4px !important;
          }
          .chat-header-buttons button {
            padding: 5px 8px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* ================================================================
          1. HEADER — fixed at the top of the viewport.
             Contains the centered title, a sun/moon toggle, and a
             "Clear Chat" button on the right.
          ================================================================ */}
      <div
        className="chat-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: theme.headerBg,
          borderBottom: `1px solid ${theme.headerBorder}`,
          padding: '16px',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Title — centered visually via flexbox. */}
        <h1
          className="chat-header-title"
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0,
            color: theme.headerText,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          AI Chatbox
        </h1>

        {/* Right-side buttons: theme toggle + clear chat. */}
        <div
          className="chat-header-buttons"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginLeft: 'auto',
          }}
        >
          {/* Theme toggle — shows sun in dark mode, moon in light mode. */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'none',
              border: `1px solid ${theme.clearBtnBorder}`,
              borderRadius: 8,
              color: theme.clearBtnText,
              padding: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Clear chat — opens browser confirm dialog on click. */}
          <button
            onClick={handleClearChat}
            aria-label="Clear chat"
            style={{
              background: 'none',
              border: `1px solid ${theme.clearBtnBorder}`,
              borderRadius: 8,
              color: theme.clearBtnText,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.clearBtnHoverBorder;
              e.currentTarget.style.color = theme.clearBtnHoverText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.clearBtnBorder;
              e.currentTarget.style.color = theme.clearBtnText;
            }}
          >
            <TrashIcon />
            Clear Chat
          </button>
        </div>
      </div>

      {/* ================================================================
          2. ERROR BANNER — shown conditionally when an API error exists.
          ================================================================ */}
      {error && <ErrorBanner error={error} />}

      {/* ================================================================
          3. MESSAGES AREA — scrollable middle section.
             flex: 1 makes it fill all remaining space between the header
             and the input bar. overflowY: auto enables vertical scrolling.
             Auto-scrolls to the bottom whenever messages or loading state
             changes (via the messagesEndRef div).
          ================================================================ */}
      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        {/* Rendered messages — memoized to avoid re-creating elements
            for unchanged messages on every render. */}
        {renderedMessages}

        {/* Typing indicator — shown while waiting for an AI response. */}
        {loading && <LoadingSpinner />}

        {/* Invisible anchor — scroll target for auto-scroll. */}
        <div ref={messagesEndRef} />
      </div>

      {/* ================================================================
          4. INPUT BAR — fixed at the bottom of the viewport.
             ChatInput is sticky-positioned internally so it stays visible
             while the messages area scrolls behind it.
          ================================================================ */}
      <ChatInput />
    </div>
  );
};

export default ChatWindow;
