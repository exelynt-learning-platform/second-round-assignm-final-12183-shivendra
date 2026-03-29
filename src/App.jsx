// ---------------------------------------------------------------------------
// App.jsx — Root application component
// ---------------------------------------------------------------------------
// Wraps the entire app in the Redux Provider and ThemeProvider, then renders
// the AppContent shell which centers the ChatWindow inside a card layout.
// ---------------------------------------------------------------------------

import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ChatWindow from './components/ChatWindow';

function AppContent() {
  const { theme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.appBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 768, backgroundColor: theme.appOuterBg, borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <ChatWindow />
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
