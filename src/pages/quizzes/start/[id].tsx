import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSubmission, fetchQuizById } from '@/services';
import { Spin, Typography, Statistic, Result, Card } from 'antd';
import { useState, useEffect } from 'react';
import QuizQuestion from './components/QuizQuestion';
import Modal from '@/components/modal';
import IndicatorNumber from './components/IndicatorNumber';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Countdown } = Statistic;

const QuizStartPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinish, setIsFinish] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [scoreFinal, setScoreFinal] = useState<number | null>(null);

  const { id } = router.query;

  const notAnswer = answers.filter((item) => item === -1).length;
  const { data: quizData, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuizById(id as string),
    enabled: !!id,
  });

  const { mutate: handleCreateSubmission, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: { quizId: string; score: number }) => await createSubmission(data),
    onSuccess: () => {
      toast.success(t('Submissionsavedsuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setTimeout(() => {
        router.push('/quizzes');
      }, 1000);
    },
    onError: (error: any) => {
      console.log(`Error: ${error.message}`);
    },
  });

  const calculateScore = () => {
    let newScore = 0;
    quizData.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correct_answer) {
        newScore += 1;
      }
    });
    setScoreFinal(newScore);
    return newScore;
  };

  useEffect(() => {
    if (quizData) {
      const savedDeadline = localStorage.getItem('quizDeadline');
      if (savedDeadline) {
        setDeadline(Number(savedDeadline));
      } else {
        const newDeadline = Date.now() + 1000 * quizData?.time * 60;
        setDeadline(newDeadline);
        localStorage.setItem('quizDeadline', String(newDeadline));
      }
    }
  }, [quizData]);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.questions.length).fill(-1));
    }
  }, [quizData]);

  useEffect(() => {
    if (quizData) {
      const savedAnswers = localStorage.getItem('quizAnswers');
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      } else {
        setAnswers(new Array(quizData.questions.length).fill(-1));
      }
    }
  }, [quizData]);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answerIndex;
    setAnswers(updatedAnswers);
    localStorage.setItem('quizAnswers', JSON.stringify(updatedAnswers));
  };

  const handleFinishQuiz = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    const newScore = calculateScore();
    setIsModalVisible(false);
    setIsFinish(true);
    handleCreateSubmission({ quizId: id as string, score: newScore });
    localStorage.removeItem('quizDeadline');
    localStorage.removeItem('quizAnswers');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = () => {
    const newScore = calculateScore();
    setIsFinish(true);
    handleCreateSubmission({ quizId: id as string, score: newScore });
    localStorage.removeItem('quizDeadline');
    localStorage.removeItem('quizAnswers');
  };

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (!quizData || deadline === null) return null;

  const contentFinishQuiz = () => {
    return (
      <Result
        status="success"
        title={t('TimesUp')}
        subTitle={
          <div className="items-center flex flex-col">
            {t('ThequizhasendedYourscoreis')}{' '}
            <span className="font-bold text-5xl text-red-500 mt-5">{scoreFinal}</span>
          </div>
        }
      />
    );
  };

  const handleNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleRemoveAnswer = (questionIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = -1;
    setAnswers(updatedAnswers);
    localStorage.setItem('quizAnswers', JSON.stringify(updatedAnswers));
  };

  return (
    <div className="w-full mx-auto p-6 flex flex-row gap-5 justify-between">
      <div className="w-[80%]">
        <div className="flex flex-row justify-between items-center mb-5">
          <Countdown title={t('Time')} value={deadline} onFinish={onFinish} />
          <Title level={2} className="text-center">
            {quizData.title}
          </Title>
        </div>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span>
                {t('Question')} {currentQuestionIndex + 1} {t('of')} {quizData.questions.length}
              </span>
              <div className="w-full bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-blue-500"
                  style={{
                    width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <button
              className="text-gray-600 px-6 py-2 rounded-lg border border-gray-300"
              onClick={() => handleRemoveAnswer(currentQuestionIndex)}
              disabled={answers[currentQuestionIndex] === -1}
            >
              {t('RemoveAnswer')}
            </button>
          </div>

          <QuizQuestion
            question={quizData.questions[currentQuestionIndex]}
            onAnswerChange={handleAnswerChange}
            currentIndex={currentQuestionIndex}
            selectedAnswer={answers[currentQuestionIndex]}
          />

          <div className="mt-4 flex justify-between">
            <button
              className="text-gray-600 px-6 py-2 rounded-lg border border-gray-300"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
            >
              {t('Previous')}
            </button>

            <button
              className={`${
                currentQuestionIndex !== quizData.questions.length - 1
                  ? 'bg-blue-500 hover:bg-blue-300'
                  : 'bg-green-500 hover:bg-green-300'
              } text-white px-6 py-2 rounded-lg`}
              onClick={() => {
                currentQuestionIndex !== quizData.questions.length - 1
                  ? setCurrentQuestionIndex(currentQuestionIndex + 1)
                  : handleFinishQuiz();
              }}
              disabled={
                currentQuestionIndex !== quizData.questions.length - 1
                  ? false
                  : notAnswer === 0
                  ? false
                  : true
              }
            >
              {currentQuestionIndex !== quizData.questions.length - 1 ? t('Next') : t('FinishQuiz')}
            </button>
          </div>
        </Card>
      </div>
      <IndicatorNumber answer={answers} onNavigateToQuestion={handleNavigateToQuestion} />

      <Modal
        title={t('ConfirmSubmission')}
        visible={isModalVisible}
        onConfirm={handleModalOk}
        onCancel={handleModalCancel}
        content={t('Areyousureyouhaveansweredallthequestions')}
        footer={true}
      />
      <Modal
        visible={isFinish}
        onConfirm={handleModalOk}
        onCancel={() => {
          setIsFinish(false);
          router.push('/quizzes');
        }}
        contentCustom={contentFinishQuiz}
        footer={false}
      ></Modal>
    </div>
  );
};

export default QuizStartPage;
