// ---------------------------------------------------------------------------
// ChatInput.test.jsx — Unit tests for the ChatInput component
// ---------------------------------------------------------------------------
// Uses React Testing Library to render ChatInput within a Redux store and
// ThemeProvider, then verifies the send button state, input typing, and
// keyboard shortcuts.
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import chatReducer from '../store/chatSlice';
import { ThemeProvider } from '../context/ThemeContext';
import ChatInput from '../components/ChatInput';

// Mock the service module to avoid import.meta errors in Jest.
jest.mock('../services/openrouterService', () => ({
  sendMessageToOpenRouter: jest.fn(),
}));

// Suppress React 19 act() warnings and other noise in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

// ---------------------------------------------------------------------------
// Helper: wraps ChatInput in a real Redux store and ThemeProvider so all
// hooks (useSelector, useDispatch, useTheme) resolve correctly.
// ---------------------------------------------------------------------------
function renderWithProviders(ui, { preloadedState } = {}) {
  const store = configureStore({
    reducer: { chat: chatReducer },
    preloadedState,
  });

  return {
    ...render(
      <Provider store={store}>
        <ThemeProvider>{ui}</ThemeProvider>
      </Provider>
    ),
    store,
  };
}

describe('ChatInput', () => {
  // ===================================================================
  // Send button state
  // ===================================================================
  describe('send button disabled state', () => {
    it('should be disabled when the input is empty', () => {
      renderWithProviders(<ChatInput />);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('should be disabled when loading is true', () => {
      renderWithProviders(<ChatInput />, {
        preloadedState: {
          chat: {
            messages: [],
            loading: true,
            error: null,
          },
        },
      });

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('should be enabled when input has text and loading is false', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChatInput />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello');

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).not.toBeDisabled();
    });
  });

  // ===================================================================
  // Input typing
  // ===================================================================
  describe('input typing', () => {
    it('should update the textarea value when typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChatInput />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello world');

      expect(textarea).toHaveValue('Hello world');
    });

    it('should display the character count', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChatInput />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hi');

      expect(screen.getByText('2 characters')).toBeInTheDocument();
    });
  });

  // ===================================================================
  // Keyboard shortcuts
  // ===================================================================
  describe('keyboard shortcuts', () => {
    it('should call the send handler when Enter is pressed', async () => {
      const user = userEvent.setup();
      const { store } = renderWithProviders(<ChatInput />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Test message');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      // After sending, the input should be cleared
      expect(textarea).toHaveValue('');
    });

    it('should not send when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ChatInput />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Line 1');
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      // Input should NOT be cleared — the message was not sent
      expect(textarea).toHaveValue('Line 1');
    });
  });
});
