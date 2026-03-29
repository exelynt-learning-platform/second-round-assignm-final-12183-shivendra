// ---------------------------------------------------------------------------
// ChatMessage.test.jsx — Unit tests for the ChatMessage component
// ---------------------------------------------------------------------------
// Uses React Testing Library to render ChatMessage with various props and
// verify alignment, content visibility, and label text.
// ---------------------------------------------------------------------------

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessage from '../components/ChatMessage';

// Suppress React 19 act() warnings in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('ChatMessage', () => {
  // ===================================================================
  // User messages — right-aligned
  // ===================================================================
  describe('user messages', () => {
    const userMessage = {
      role: 'user',
      content: 'Hello, AI!',
      timestamp: '12:00:00 PM',
    };

    it('should render the message content', () => {
      render(<ChatMessage message={userMessage} />);

      expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
    });

    it('should display the "You" label', () => {
      render(<ChatMessage message={userMessage} />);

      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('should align user messages to the right', () => {
      const { container } = render(<ChatMessage message={userMessage} />);

      const wrapper = container.firstChild;
      expect(wrapper.style.alignItems).toBe('flex-end');
    });

    it('should render the timestamp', () => {
      render(<ChatMessage message={userMessage} />);

      expect(screen.getByText('12:00:00 PM')).toBeInTheDocument();
    });

    it('should not render a copy button for user messages', () => {
      render(<ChatMessage message={userMessage} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  // ===================================================================
  // AI messages — left-aligned
  // ===================================================================
  describe('AI messages', () => {
    const aiMessage = {
      role: 'assistant',
      content: 'How can I help you?',
      timestamp: '12:00:01 PM',
    };

    it('should render the message content', () => {
      render(<ChatMessage message={aiMessage} />);

      expect(screen.getByText('How can I help you?')).toBeInTheDocument();
    });

    it('should display the "AI" label', () => {
      render(<ChatMessage message={aiMessage} />);

      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('should align AI messages to the left', () => {
      const { container } = render(<ChatMessage message={aiMessage} />);

      const wrapper = container.firstChild;
      expect(wrapper.style.alignItems).toBe('flex-start');
    });

    it('should render a copy button for AI messages', () => {
      render(<ChatMessage message={aiMessage} />);

      expect(screen.getByRole('button', { name: /copy message/i })).toBeInTheDocument();
    });

    it('should render the timestamp', () => {
      render(<ChatMessage message={aiMessage} />);

      expect(screen.getByText('12:00:01 PM')).toBeInTheDocument();
    });
  });
});
