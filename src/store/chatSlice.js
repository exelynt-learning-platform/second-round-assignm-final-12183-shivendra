import { createSlice } from '@reduxjs/toolkit';
import { sendMessageToOpenRouter } from '../services/openrouterService';

// ---------------------------------------------------------------------------
// Initial state for the chat slice.
// - messages: Array of chat messages, each containing role ('user' or
//   'assistant'), content (the message text), and timestamp. Pre-populated
//   with a welcome message from the assistant.
// - loading: Boolean flag indicating whether an API call is in progress.
//   Used to show/hide the typing indicator and disable the input.
// - error: Stores the most recent error message string, or null if no error.
//   Displayed in the ErrorBanner component and dismissable by the user.
// ---------------------------------------------------------------------------
const initialState = {
  messages: [
    {
      role: 'assistant',
      content: "Hi! I'm your AI Assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ],
  loading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Chat slice — contains synchronous reducers and the slice configuration.
// ---------------------------------------------------------------------------
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // -----------------------------------------------------------------------
    // addMessage: Appends a new message object to the chat history.
    // Called for both user messages (before the API call) and assistant
    // messages (after a successful API response). The action payload is an
    // object shaped as { role, content, timestamp }.
    // -----------------------------------------------------------------------
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // -----------------------------------------------------------------------
    // setLoading: Toggles the loading flag to track API call status.
    // Dispatched with `true` before calling the API and `false` after the
    // response (or error) is received. Drives the typing indicator visibility
    // and disables the send input while a request is in flight.
    // -----------------------------------------------------------------------
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // -----------------------------------------------------------------------
    // setError: Stores an error message string in state, or clears it when
    // dispatched with null. The ErrorBanner component reads this value and
    // renders a dismissable banner at the top of the chat window.
    // -----------------------------------------------------------------------
    setError: (state, action) => {
      state.error = action.payload;
    },

    // -----------------------------------------------------------------------
    // clearMessages: Resets the chat back to its initial state. Replaces
    // the messages array with just the welcome message, clears any error,
    // and resets the loading flag. Triggered by the "Clear Chat" button
    // after the user confirms in the dialog.
    // -----------------------------------------------------------------------
    clearMessages: (state) => {
      state.messages = initialState.messages;
      state.error = null;
      state.loading = false;
    },
  },
});

// Export all synchronous action creators for use in components.
export const { addMessage, setLoading, setError, clearMessages } = chatSlice.actions;

// ---------------------------------------------------------------------------
// sendMessage — async thunk that orchestrates the full API call lifecycle.
//
// Flow:
//   1. Immediately add the user's message to the chat so it appears in the UI.
//   2. Set loading to true (shows typing indicator, disables input).
//   3. Read the full messages array from the store (includes the user message
//      we just added) and pass it to the OpenRouter API service.
//   4. On success: add the AI's response message to the chat, set loading false.
//   5. On error: extract the most descriptive error message available
//      (API error response → JS error message → generic fallback), dispatch
//      it via setError, and set loading false.
// ---------------------------------------------------------------------------
export const sendMessage = (userInput) => async (dispatch, getState) => {
  // Step 1: Add the user's message to the chat history immediately so it
  // renders in the UI right away, with a timestamp for display.
  dispatch(addMessage({ role: 'user', content: userInput, timestamp: new Date().toLocaleTimeString() }));

  // Step 2: Set loading true to show the typing indicator and disable input
  // while we wait for the API response.
  dispatch(setLoading(true));

  try {
    // Step 3: Retrieve the current messages array (which now includes the
    // user message) and send it to the OpenRouter API for completion.
    const { messages } = getState().chat;
    const responseText = await sendMessageToOpenRouter(messages);

    // Step 4a (success): Add the AI assistant's response to the chat history
    // with a timestamp, then clear the loading flag.
    dispatch(addMessage({ role: 'assistant', content: responseText, timestamp: new Date().toLocaleTimeString() }));
    dispatch(setLoading(false));
  } catch (error) {
    // Step 4b (error): Extract the most informative error message available.
    // Prefer the API's error message if present in the response body,
    // fall back to the JS Error message, then to a generic fallback.
    const message = error.response?.data?.error?.message || error.message || 'Something went wrong. Please try again.';

    // Dispatch the error message so the ErrorBanner renders it, and clear
    // the loading flag so the user can try again.
    dispatch(setError(message));
    dispatch(setLoading(false));
  }
};

// Default export is the reducer, which the store combines with other slices.
export default chatSlice.reducer;
