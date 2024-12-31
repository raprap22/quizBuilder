import { QUIZZEZ } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  quiz: QUIZZEZ | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  quiz: null,
  isAuthenticated: false,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuiz(state, action: PayloadAction<QUIZZEZ>) {
      state.quiz = action.payload;
    },
    destroyQuiz(state) {
      state.quiz = null;
    },
  },
});

export const { setQuiz, destroyQuiz } = quizSlice.actions;

export default quizSlice.reducer;
