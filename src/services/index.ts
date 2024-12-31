import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import store from '@/store';
import { logout as destroyStore } from '@/store/userSlice';
import { destroyQuiz } from '@/store/quizSlice';

// ============================ Quizz ============================
export const fetchQuizzes = async () => {
  const { data, error } = await supabase.from('quizzes').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const fetchQuizById = async (id: string) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const createQuiz = async ({
  title,
  author,
  description,
  time,
  questions,
}: {
  title: string;
  author: string;
  description: string;
  time: number;
  questions: { question: string; answers: string[]; correct_answer: number }[];
}) => {
  const user = await getCurrentUser();
  if (!user) {
    toast.error('User not authenticated');
    throw new Error('User not authenticated');
  }

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({
      title,
      author,
      description,
      time,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const questionInserts = questions.map((question) => ({
    quiz_id: quiz.id,
    question: question.question,
    answers: question.answers,
    correct_answer: question.correct_answer,
  }));

  const { error: questionError } = await supabase.from('questions').insert(questionInserts);
  if (questionError) throw new Error(questionError.message);

  return quiz;
};

export const updateQuiz = async ({
  id,
  title,
  author,
  description,
  time,
  questions,
}: {
  id: number;
  title: string;
  author: string;
  description: string;
  time: number;
  questions: { id?: number; question: string; answers: string[]; correct_answer: number }[];
}) => {
  const user = await getCurrentUser();
  const dispatch = store.dispatch;

  if (!user) {
    toast.error('User not authenticated');
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('quizzes')
    .update({
      title,
      author,
      description,
      time,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  const updatePromises = questions.map(async (question) => {
    if (question.id) {
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          question: question.question,
          answers: question.answers,
          correct_answer: question.correct_answer,
        })
        .eq('id', question.id);

      if (updateError) throw new Error(updateError.message);
    } else {
      const { error: insertError } = await supabase.from('questions').insert({
        quiz_id: id,
        question: question.question,
        answers: question.answers,
        correct_answer: question.correct_answer,
      });

      if (insertError) throw new Error(insertError.message);
    }
  });
  dispatch(destroyQuiz());

  await Promise.all(updatePromises);

  return { message: 'Quiz updated successfully' };
};

// ============================ Submission ============================

export const createSubmission = async ({ quizId, score }: { quizId: string; score: number }) => {
  const user = await getCurrentUser();

  if (!user) {
    toast.error('User not authenticated');
    throw new Error('User not authenticated');
  }

  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({
      quiz_id: quizId,
      user_id: user.id,
      score: score,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return submission;
};

//

export const fetchScoreByUser = async (user_id: string) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      id,
      score,
      quiz_id,
      user_id,
      created_at,
      quizzes(
        title,
        time,
        author
      ),
      users(
        email
      )
    `
    )
    .eq('user_id', user_id)

  if (error) throw new Error(error.message);
  return data;
};

// ============================ Auth ============================

export const login = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return data?.user || null;
};

export const logout = async (): Promise<void> => {
  const dispatch = store.dispatch;
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  dispatch(destroyStore());
};

export const register = async (
  email: string,
  name: string,
  role: string,
  password: string
): Promise<User | null> => {
  const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUserError && existingUserError.code !== 'PGRST116') {
    throw new Error(existingUserError.message);
  }

  if (existingUser) {
    throw new Error('User already exists');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData?.user?.id;
  if (!userId) {
    throw new Error('Failed to retrieve user ID');
  }

  const { error: insertError } = await supabase.from('users').insert([
    {
      id: userId,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
    },
  ]);

  if (insertError) {
    await supabase.from('users').delete().eq('id', userId);

    throw new Error(insertError.message);
  }

  return authData.user;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const { data: userData } = await supabase.auth.getUser();

  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userData?.user?.id)
    .single();

  const combinedUser = {
    ...userData?.user,
    ...existingUser,
  };

  return combinedUser || null;
};
