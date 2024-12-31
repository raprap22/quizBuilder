import { LoadingOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Layout as AntLayout, Menu, Dropdown, Spin } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Modal from './modal';
import { logout } from '@/services';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { USER } from '@/types';
import LanguageSwitcher from '@/pages/components/langSwitch';
import { useTranslation } from 'react-i18next';

const { Header, Content, Footer } = AntLayout;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visibleLogout, setIsVisibleLogout] = useState(false);
  const [visibleQuizStarting, setVisibleQuizStarting] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  let isQuizStarting: any = null;
  const user: USER = useSelector((state: RootState) => state.user.user);

  if (typeof window !== 'undefined') {
    isQuizStarting = localStorage.getItem('quizDeadline');
  }
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast.success(t('Loggedoutsuccessfully'));
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
      setIsVisibleLogout(false);
      window.location.href = '/';
    }
  };

  const handleQuiz = () => {
    localStorage.removeItem('quizDeadline');
    localStorage.removeItem('quizAnswers');
    setVisibleQuizStarting(false);
    router.push('/quizzes');
  };

  const menu = (
    <Menu>
      <Menu.Item disabled>
        <LanguageSwitcher borderless={true} />
      </Menu.Item>
      <Menu.Item key="logout" onClick={() => setIsVisibleLogout(true)}>
        <LogoutOutlined /> {t('Logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <AntLayout className="min-h-screen flex flex-col">
        <Header>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ display: 'flex', width: '100%' }}
          >
            <Menu.Item
              onClick={() =>
                isQuizStarting ? setVisibleQuizStarting(true) : router.push('/quizzes')
              }
            >
              {t('Quizzes')}
            </Menu.Item>
            {user?.role === 'student' && (
              <Menu.Item
                onClick={() =>
                  isQuizStarting ? setVisibleQuizStarting(true) : router.push('/quizzes/score')
                }
              >
                {t('MyScore')}
              </Menu.Item>
            )}
            <Menu.Item style={{ marginLeft: 'auto' }}>
              <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                <span style={{ cursor: 'pointer' }}>
                  {user?.name} <UserOutlined />
                </span>
              </Dropdown>
            </Menu.Item>
          </Menu>
        </Header>
        <Content className="flex-grow p-4 overflow-auto">{children}</Content>
        <Footer className="text-center mt-auto">{t('QuizBuilderby')} Ridho ©2024</Footer>
      </AntLayout>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <Spin indicator={<LoadingOutlined className="text-blue-400" spin />} size="large" />
        </div>
      )}

      <Modal
        visible={visibleLogout}
        onCancel={() => setIsVisibleLogout(false)}
        onConfirm={() => handleLogout()}
        title={t('LogoutConfirmation')}
        content={t('Areyousureyouwanttologout')}
        footer={true}
      />
      <Modal
        visible={visibleQuizStarting}
        onCancel={() => setVisibleQuizStarting(false)}
        onConfirm={() => handleQuiz()}
        title={t('ExitQuizConfirmation')}
        content={t('Areyousureyouwanttoexitthequiz')}
        footer={true}
      />
    </>
  );
};
