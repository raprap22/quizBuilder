export type QUIZZEZ = {
  id: '';
  created_at: Date;
  user_id: '';
  title: '';
  description: '';
  author: '';
  time: null;
};

export type REGISTER = {
  email: '';
  password: '';
  role: '';
  name: '';
};

export type USER = {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  name: string;
};

export type AppMetadata = {
  provider: string;
  providers: string[];
};

export type UserMetadata = {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
};

export type Identity = {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: IdentityData;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
};

export type IdentityData = {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
};

export type QuizStartPageProps = {
  id: string;
  title: string;
  description: string;
  author: string;
  time: number;
  questions: Question[];
};

export type Question = {
  id: string;
  question: string;
  answers: string[];
  correct_answer: number;
  quiz_id: string;
};

export type QuizQuestionProps = {
  question: Question;
  onAnswerChange: (questionIndex: number, answerIndex: number) => void;
  currentIndex: number;
  selectedAnswer: number;
};
