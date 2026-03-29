// ---------------------------------------------------------------------------
// ErrorBanner Component
// ---------------------------------------------------------------------------
// Renders a dismissable error banner at the top of the chat window when an
// API request fails. Displays the error message and a close button that
// clears the error state via Redux dispatch.
// ---------------------------------------------------------------------------

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setError } from '../store/chatSlice';
import { useTheme } from '../context/ThemeContext';

const ErrorBanner = ({ error }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleDismiss = () => {
    dispatch(setError(null));
  };

  if (!error) return null;

  const bannerStyle = {
    backgroundColor: theme.errorBannerBg,
    color: theme.errorBannerText,
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: theme.errorBannerText,
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0 8px',
  };

  return (
    <div style={bannerStyle}>
      <span>{error}</span>
      <button onClick={handleDismiss} style={buttonStyle}>×</button>
    </div>
  );
};

ErrorBanner.propTypes = {
  error: PropTypes.string.isRequired,
};

export default ErrorBanner;