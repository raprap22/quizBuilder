import { fetchScoreByUser } from '@/services';
import { RootState } from '@/store';
import { USER } from '@/types';
import { Card, Spin, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const ScorePage = () => {
  const user: USER = useSelector((state: RootState) => state.user.user);

  const {
    data: scores,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['scores', user?.id],
    queryFn: () => fetchScoreByUser(user.id),
    enabled: !!user?.id,
  });

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
        <Spin
          indicator={<LoadingOutlined className="text-blue-400 text-3xl" spin />}
          size="large"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Text className="text-red-500">
          {t('Errorfetchingscores')}: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white text-center mx-6 py-6 rounded-lg">
        <span className="text-white font-bold text-2xl">{t('YourScores')}</span>
      </header>
      <main className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scores?.map((score: any) => (
            <Card key={score.id} title={score.quizzes?.title} className="shadow-md">
              <p>
                <strong>{t('Score')}:</strong> {score?.score}
              </p>
              <p>
                <strong>{t('AuthorScore')}</strong> {score.quizzes?.author}
              </p>
              <p>
                <strong>{t('TimeLimit')}:</strong> {score.quizzes?.time} {t('Minutes')}
              </p>
              <p className="text-gray-500 text-sm mt-4">
                {moment(score.created_at).format('DD MMM YYYY, HH:mm')}
              </p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ScorePage;
