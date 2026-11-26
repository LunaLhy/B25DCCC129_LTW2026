import { createSlice } from '@reduxjs/toolkit';

const matchesSlice = createSlice({
  name: 'matches',
  initialState: [],
  reducers: {
    setMatches: (state, action) => [...action.payload],
    addMatch: (state, action) => {
      const maxId = state.reduce((max, item) => (item.id > max ? item.id : max), 0);
      state.push({ ...action.payload, id: maxId + 1 });
    },
    removeMatch: (state, action) =>
      state.filter((item) => item.id !== action.payload),
    setGoals: (state, action) => {
      const { id, homeGoals, awayGoals } = action.payload;
      const match = state.find((item) => item.id === id);
      if (match) {
        match.homeGoals = homeGoals;
        match.awayGoals = awayGoals;
      }
    },
  },
});

export const { setMatches, addMatch, removeMatch, setGoals } = matchesSlice.actions;

export const selectMatches = (state) => state.matches;

export default matchesSlice.reducer;