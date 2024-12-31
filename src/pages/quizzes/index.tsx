import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Button, Typography, List, Card, Spin, Alert, Badge } from 'antd';
import { fetchQuizzes } from '@/services';
import { QUIZZEZ, USER } from '@/types';
import moment from 'moment';
import { useSelector } from 'react-redux';
import store, { RootState } from '@/store';
import { destroyQuiz, setQuiz } from '@/store/quizSlice';
import { useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from '@/components/modal';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const QuizzesPage = () => {
  const dispatch = store.dispatch;
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [openQuiz, setOpenQuiz] = useState(false);
  const [idQuiz, setIdQuiz] = useState('');

  const {
    data: quizzes = [],
    isLoading,
    error,
  } = useQuery<QUIZZEZ[]>({
    queryKey: ['quizzes'],
    queryFn: fetchQuizzes,
  });

  const router = useRouter();
  const user: USER = useSelector((state: RootState) => state.user.user);
  const quizDataStore: QUIZZEZ | null = useSelector((state: RootState) => state.quiz.quiz);
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  {
    isTeacher ? 'Edit Quiz' : 'Take Quiz';
  }

  const filteredQuizzes =
    filter === 'my' ? quizzes.filter((quiz) => quiz.user_id === user?.id) : quizzes;

  const labelByRole = () => {
    switch (user?.role) {
      case 'teacher':
        return t('EditQuiz');
      case 'student':
        return t('TakeQuiz');
      case 'admin':
        return t('QuizDetail');

      default:
        '';
        break;
    }
  };

  const handleTakeQuiz = (id: string) => {
    setOpenQuiz(true);
    setIdQuiz(id);
  };

  if (error)
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert message="Error" description={(error as Error).message} type="error" showIcon />
      </div>
    );

  return (
    <div className="mx-auto p-4 ">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <Spin indicator={<LoadingOutlined className="text-blue-400" spin />} size="large" />
        </div>
      )}
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
        {t('availQuiz')}
      </Title>

      {isTeacher && (
        <div className="flex justify-center mb-6">
          <Button
            onClick={() => setFilter('all')}
            type={filter === 'all' ? 'primary' : 'default'}
            className="mr-4"
          >
            {t('allQuiz')}
          </Button>
          <Button onClick={() => setFilter('my')} type={filter === 'my' ? 'primary' : 'default'}>
            {t('MyQuizzes')}
          </Button>
        </div>
      )}

      {!isStudent && (
        <div className="w-[30%]">
          <Button
            onClick={() => {
              router.push('/quizzes/form');
              dispatch(destroyQuiz());
            }}
            type="primary"
            block
            className="mb-6"
          >
            {t('CreateQuiz')}
          </Button>
        </div>
      )}

      <List
        dataSource={filteredQuizzes}
        grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
        renderItem={(quiz) => (
          <List.Item>
            <Badge.Ribbon text={quiz?.time + t('Minutes')}>
              <Card
                className="w-full"
                title={
                  <div className="flex flex-col">
                    <Text className="font-bold">{quiz.title}</Text>
                    <Text className="font-normal text-xs text-gray-400">
                      {t('Author')} {quiz.author}
                    </Text>
                  </div>
                }
              >
                <div className="flex flex-col">
                  <Text>{moment(quiz.created_at).format('DD MMM YYYY')}</Text>
                  <Text>{quiz.description}</Text>
                </div>
                {isStudent || quiz.user_id === user?.id ? (
                  <div
                    className={`w-full my-4 button button-${isTeacher ? 'blue' : 'green'}`}
                    style={{ '--button-height': '8px' } as React.CSSProperties}
                    onClick={() => {
                      dispatch(setQuiz(quiz));
                      isStudent ? handleTakeQuiz(quiz.id) : router.push('/quizzes/form');
                    }}
                  >
                    {labelByRole()}
                  </div>
                ) : (
                  <div
                    className="w-full my-4 button button-red"
                    style={
                      {
                        '--button-height': '8px',
                        '--button-color': '#ff737e',
                        '--button-hover-color': '#ff737e',
                      } as React.CSSProperties
                    }
                  >
                    {t('cantTakeQuiz')}
                  </div>
                )}
              </Card>
            </Badge.Ribbon>
          </List.Item>
        )}
      />
      <Modal
        visible={openQuiz}
        onCancel={() => setOpenQuiz(false)}
        onConfirm={() => router.push(`/quizzes/start/${idQuiz}`)}
        title={t('TakeQuizConfirmation')}
        content={t('Areyousurewanttotakethequiz')}
        footer={true}
      />
    </div>
  );
};

export default QuizzesPage;
