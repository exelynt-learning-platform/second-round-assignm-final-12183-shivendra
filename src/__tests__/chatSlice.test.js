// ---------------------------------------------------------------------------
// chatSlice.test.js — Unit tests for Redux chat slice reducers
// ---------------------------------------------------------------------------
// Tests the synchronous reducers exported from chatSlice: addMessage,
// setLoading, setError, and clearMessages. Each test dispatches an action
// against a fresh copy of the reducer and asserts the resulting state.
// ---------------------------------------------------------------------------

// Mock the service module to avoid import.meta errors in Jest.
jest.mock('../services/openrouterService', () => ({
  sendMessageToOpenRouter: jest.fn(),
}));

import chatReducer, {
  addMessage,
  setLoading,
  setError,
  clearMessages,
} from '../store/chatSlice';

describe('chatSlice reducers', () => {
  // -----------------------------------------------------------------------
  // Helper: returns a clean initial state for each test so mutations
  // in one test don't leak into another (Immer produces new objects).
  // -----------------------------------------------------------------------
  const getInitialState = () => ({
    messages: [
      {
        role: 'assistant',
        content: "Hi! I'm your AI Assistant. How can I help you today?",
        timestamp: expect.any(String),
      },
    ],
    loading: false,
    error: null,
  });

  // ===================================================================
  // addMessage
  // ===================================================================
  describe('addMessage', () => {
    it('should add a user message to the messages array', () => {
      const userMessage = {
        role: 'user',
        content: 'Hello!',
        timestamp: '12:00:00 PM',
      };

      const nextState = chatReducer(getInitialState(), addMessage(userMessage));

      expect(nextState.messages).toHaveLength(2);
      expect(nextState.messages[1]).toEqual(userMessage);
    });

    it('should add an assistant message to the messages array', () => {
      const assistantMessage = {
        role: 'assistant',
        content: 'Hi there!',
        timestamp: '12:00:01 PM',
      };

      const nextState = chatReducer(
        getInitialState(),
        addMessage(assistantMessage)
      );

      expect(nextState.messages).toHaveLength(2);
      expect(nextState.messages[1]).toEqual(assistantMessage);
    });

    it('should preserve existing messages when adding a new one', () => {
      const firstMessage = {
        role: 'user',
        content: 'First',
        timestamp: '12:00:00 PM',
      };
      const secondMessage = {
        role: 'assistant',
        content: 'Second',
        timestamp: '12:00:01 PM',
      };

      let state = chatReducer(getInitialState(), addMessage(firstMessage));
      state = chatReducer(state, addMessage(secondMessage));

      expect(state.messages).toHaveLength(3);
      expect(state.messages[1]).toEqual(firstMessage);
      expect(state.messages[2]).toEqual(secondMessage);
    });
  });

  // ===================================================================
  // setLoading
  // ===================================================================
  describe('setLoading', () => {
    it('should set loading to true', () => {
      const nextState = chatReducer(getInitialState(), setLoading(true));

      expect(nextState.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const loadingState = { ...getInitialState(), loading: true };

      const nextState = chatReducer(loadingState, setLoading(false));

      expect(nextState.loading).toBe(false);
    });
  });

  // ===================================================================
  // setError
  // ===================================================================
  describe('setError', () => {
    it('should set the error message', () => {
      const errorMessage = 'Something went wrong';

      const nextState = chatReducer(getInitialState(), setError(errorMessage));

      expect(nextState.error).toBe(errorMessage);
    });

    it('should clear the error when dispatched with null', () => {
      const errorState = { ...getInitialState(), error: 'Previous error' };

      const nextState = chatReducer(errorState, setError(null));

      expect(nextState.error).toBeNull();
    });
  });

  // ===================================================================
  // clearMessages
  // ===================================================================
  describe('clearMessages', () => {
    it('should reset messages to only the welcome message', () => {
      const stateWithMessages = {
        ...getInitialState(),
        messages: [
          ...getInitialState().messages,
          { role: 'user', content: 'Hello', timestamp: '12:00:00 PM' },
          { role: 'assistant', content: 'Hi!', timestamp: '12:00:01 PM' },
        ],
      };

      const nextState = chatReducer(stateWithMessages, clearMessages());

      expect(nextState.messages).toHaveLength(1);
      expect(nextState.messages[0].role).toBe('assistant');
    });

    it('should clear any existing error', () => {
      const stateWithError = {
        ...getInitialState(),
        error: 'Some error',
      };

      const nextState = chatReducer(stateWithError, clearMessages());

      expect(nextState.error).toBeNull();
    });

    it('should reset loading to false', () => {
      const stateWithLoading = {
        ...getInitialState(),
        loading: true,
      };

      const nextState = chatReducer(stateWithLoading, clearMessages());

      expect(nextState.loading).toBe(false);
    });
  });
});
