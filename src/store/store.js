// ---------------------------------------------------------------------------
// store.js — Redux store configuration
// ---------------------------------------------------------------------------
// Creates and exports the single Redux store instance for the application.
// Uses Redux Toolkit's configureStore which automatically sets up the
// Redux DevTools extension and includes the thunk middleware by default.
// ---------------------------------------------------------------------------

import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './chatSlice'

const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  // No need to add thunk manually — Redux Toolkit includes it by default
})

export { store }