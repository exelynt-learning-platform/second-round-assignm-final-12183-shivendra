import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../store/chatSlice';
import { useTheme } from '../context/ThemeContext';

// ---------------------------------------------------------------------------
// ChatInput Component
// ---------------------------------------------------------------------------
// Fixed input bar rendered at the bottom of the chat window.
//
// Features:
//   - Auto-growing textarea capped at 4 visible lines.
//   - Enter to send, Shift+Enter for newline (desktop only).
//   - Send button disabled + grayed when input is empty or loading.
//   - Character counter displayed below the input.
//   - Tooltip on the send button ("Send message").
//   - Responsive styles via media queries for screens < 768px.
// ---------------------------------------------------------------------------

const MAX_LINES = 4;

const ChatInput = () => {
  // ---------------------------------------------------------------------------
  // State & Refs
  // ---------------------------------------------------------------------------
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const lineHeightRef = useRef(20); // measured once on mount

  // ---------------------------------------------------------------------------
  // Redux & Theme
  // ---------------------------------------------------------------------------
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.chat);
  const { theme } = useTheme();

  // ---------------------------------------------------------------------------
  // Responsive Breakpoint
  // ---------------------------------------------------------------------------
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------------------------------------------------------------------
  // Auto-Grow Textarea (capped at 4 lines)
  // ---------------------------------------------------------------------------
  // On every keystroke we reset the height to "auto" so the browser reports
  // the natural scrollHeight, then clamp it to maxHeight = 4 * lineHeight.
  useEffect(() => {
    const textareaElement = textareaRef.current;
    if (!textareaElement) return;

    // Measure the line-height once so we can compute the max height.
    const computed = window.getComputedStyle(textareaElement);
    lineHeightRef.current = parseInt(computed.lineHeight, 10) || 20;

    const maxHeight = lineHeightRef.current * MAX_LINES;

    textareaElement.style.height = 'auto';
    textareaElement.style.height = `${Math.min(textareaElement.scrollHeight, maxHeight)}px`;
    textareaElement.style.overflowY = textareaElement.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [input]);

  // ---------------------------------------------------------------------------
  // Send Handler
  // ---------------------------------------------------------------------------
  // Dispatches the trimmed message and clears the input. No-op when the
  // input is whitespace-only or the app is waiting for an AI response.
  // Wrapped in useCallback so the function reference stays stable between
  // renders (unless input/loading/dispatch change), preventing unnecessary
  // re-creation of the closure on every keystroke.
  const handleSend = useCallback(() => {
    if (input.trim() && !loading) {
      dispatch(sendMessage(input.trim()));
      setInput('');
    }
  }, [input, loading, dispatch]);

  // ---------------------------------------------------------------------------
  // Keyboard Shortcuts
  // ---------------------------------------------------------------------------
  // Desktop: Enter sends, Shift+Enter inserts a newline.
  // Mobile:  the OS keyboard "send" button is handled via enterKeyHint.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------------------------------------------------------------------------
  // Derived Values
  // ---------------------------------------------------------------------------
  const charCount = input.length;
  const isSendDisabled = !input.trim() || loading;

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: theme.inputAreaBg,
        borderTop: `1px solid ${theme.inputAreaBorder}`,
        padding: '16px',
      }}
    >
      {/* -----------------------------------------------------------------
          Inline <style> block
          - Mobile media queries shrink padding, font sizes, and button size.
          - .char-counter styles the small character count label.
          ----------------------------------------------------------------- */}
      <style>{`
        @media (max-width: 768px) {
          .chat-input-container {
            padding: 10px !important;
          }
          .chat-input-row {
            gap: 6px !important;
          }
          .chat-input-textarea {
            font-size: 16px !important;
            padding: 8px 10px !important;
          }
          .chat-input-button {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          .char-counter {
            font-size: 10px !important;
          }
        }
      `}</style>

      <div
        className="chat-input-container"
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: theme.inputAreaBg,
          borderTop: `1px solid ${theme.inputAreaBorder}`,
          padding: '16px',
        }}
      >
        {/* ================================================================
            Textarea + Send button row
            ================================================================ */}
        <div
          className="chat-input-row"
          style={{ display: 'flex', gap: 8 }}
        >
          {/* Auto-growing textarea, capped at 4 lines. */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="chat-input-textarea"
            enterKeyHint="send"
            style={{
              flex: 1,
              resize: 'none',
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: 8,
              padding: '10px 12px',
              backgroundColor: theme.inputBg,
              color: theme.inputText,
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '20px',
              overflowY: 'hidden',
            }}
            rows={1}
            disabled={loading}
          />

          {/* Send button — disabled + grayed when input is empty or loading. */}
          <button
            onClick={handleSend}
            disabled={isSendDisabled}
            className="chat-input-button"
            title="Send message"
            style={{
              padding: '10px 20px',
              backgroundColor: isSendDisabled
                ? theme.sendBtnDisabled
                : theme.sendBtnActive,
              color: theme.sendBtnText,
              border: 'none',
              borderRadius: 8,
              cursor: isSendDisabled ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.15s ease',
            }}
          >
            Send
          </button>
        </div>

        {/* ================================================================
            Character counter — shows current character count below input.
            ================================================================ */}
        <div
          className="char-counter"
          style={{
            fontSize: 11,
            color: '#6b7280',
            marginTop: 4,
            textAlign: 'right',
            opacity: 0.7,
          }}
        >
          {charCount} characters
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
