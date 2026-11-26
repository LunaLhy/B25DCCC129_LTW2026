import { configureStore } from '@reduxjs/toolkit';
import goalReducer from './features/goalSlice';
import matchesReducer from './features/matchesSlice';

export const store = configureStore({
  reducer: {
    matches: matchesReducer,
    goal: goalReducer,
  },
});