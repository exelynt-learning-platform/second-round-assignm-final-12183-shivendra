// ---------------------------------------------------------------------------
// OpenRouter API Service
// ---------------------------------------------------------------------------
// This service handles all communication with the OpenRouter API.
// It sends chat completion requests and returns the assistant's response text.
// All API-related logic (authentication, request formatting, response parsing,
// and error handling) is centralized here so components only dispatch actions.
// ---------------------------------------------------------------------------

import axios from 'axios';

// The API key is read from the Vite environment variable. It is securely
// stored in the .env file (listed in .gitignore) and never hardcoded in
// source code. Restart the dev server after changing .env values.
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// OpenRouter chat completions endpoint.
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ---------------------------------------------------------------------------
// sendMessageToOpenRouter
// ---------------------------------------------------------------------------
// Sends the full conversation history to the OpenRouter API and returns the
// assistant's reply as a plain text string.
//
// Request format:
//   - model: "openrouter/free" (free-tier model routing)
//   - messages: array of { role, content } objects representing the chat
//     history. The API uses this context to generate a relevant response.
//
// Response parsing:
//   The API returns a standard OpenAI-compatible response object. We extract
//   the assistant's text from data.choices[0].message.content. The response
//   is validated before returning to guard against unexpected shapes.
// ---------------------------------------------------------------------------
export async function sendMessageToOpenRouter(messages) {
  // Validate that the API key is configured before making any request.
  if (!API_KEY) {
    throw new Error('VITE_OPENROUTER_API_KEY is not set. Restart the dev server after adding it to .env');
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'openrouter/free',
        messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Validate that the response contains the expected structure before
    // attempting to read the content. This guards against malformed or
    // incomplete API responses.
    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response from API');
    }

    return content;
  } catch (error) {
    // If the error is already our custom validation error, rethrow it.
    if (error.message === 'Invalid response from API') {
      throw error;
    }

    // Handle specific HTTP status codes with user-friendly messages.
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error('Invalid API key');
      }
      if (status === 429) {
        throw new Error('Rate limit exceeded, please wait');
      }
      if (status >= 500) {
        throw new Error('Server error, please try again');
      }
    }

    // Network errors (no response received at all — e.g. DNS failure,
    // no internet connection, CORS blocked) surface as errors without
    // a response property.
    if (!error.response && error.request) {
      throw new Error('Network error, please check your connection');
    }

    // Re-throw any other unexpected errors unchanged.
    throw error;
  }
}
