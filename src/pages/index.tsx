import { Button, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/langSwitch';
import i18n from '../../i18n';

const Home = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-700">
      <div className="absolute top-0 right-0 p-5">
        <LanguageSwitcher />
      </div>
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold mb-6">{t('welcome')}</h1>
        <p className="text-xl mb-4">{t('createTakeTitle')}</p>
        <div>
          <Button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 text-white bg-blue-500 rounded-md border-none"
          >
            {t('login')}
          </Button>
          <br />
          <span className="text-sm text-yellow-50 mt-4 block">
            {t('dontHaveAccount')}{' '}
            <Typography
              onClick={() => router.push('/auth/register')}
              className="text-blue-500 cursor-pointer"
            >
              {t('register')}
            </Typography>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
