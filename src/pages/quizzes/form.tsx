import { useRouter } from 'next/router';
import { Button, Card, Spin, Typography, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQuizById, createQuiz, updateQuiz } from '@/services';
import { QuizForm } from './components/QuizForm';
import { useSelector } from 'react-redux';
import store, { RootState } from '@/store';
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { destroyQuiz } from '@/store/quizSlice';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const QuizFormPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = store.dispatch;
  const queryClient = useQueryClient();
  const quiz = useSelector((state: RootState) => state.quiz.quiz);
  const id = quiz?.id;
  const isEditMode = Boolean(id);

  const { data: quizData, isLoading: isFetchingQuiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuizById(id as string),
    enabled: isEditMode,
  });

  const { mutate: handleCreateQuiz, isPending: isCreating } = useMutation({
    mutationFn: async (data: any) => await createQuiz(data),
    onSuccess: () => {
      toast.success('Quiz created successfully!');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      router.push('/quizzes');
    },
    onError: (error) => {
      message.error(`Error: ${error.message}`);
    },
  });

  const { mutate: handleUpdateQuiz, isPending: isUpdating } = useMutation({
    mutationFn: async (data: any) =>
      await updateQuiz({
        id: id as string,
        ...data,
      }),
    onSuccess: () => {
      toast.success(t('Quizupdatedsuccessfully'));
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      window.location.href = '/quizzes';
    },
    onError: (error) => {
      message.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (data: any) => {
    if (isEditMode) {
      handleUpdateQuiz(data);
    } else {
      handleCreateQuiz(data);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <Button
            icon={<ArrowLeftOutlined className="text-lg" />}
            className="ml-0"
            onClick={() => {
              router.back();
              dispatch(destroyQuiz());
            }}
          />
          <Title level={2} className="text-center flex-1">
            {isEditMode ? t('EditQuiz') : t('CreateQuiz')}
          </Title>
        </div>
        {isFetchingQuiz && isEditMode ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
            <Spin indicator={<LoadingOutlined className="text-blue-400" spin />} size="large" />
          </div>
        ) : (
          <QuizForm
            defaultValues={
              quizData || {
                title: '',
                author: '',
                description: '',
                time: 0,
                questions: [{ question: '', answers: ['', '', '', ''], correct_answer: 0 }],
              }
            }
            isSubmitting={isCreating || isUpdating}
            onSubmit={handleSubmit}
          />
        )}
      </Card>
    </div>
  );
};

export default QuizFormPage;
