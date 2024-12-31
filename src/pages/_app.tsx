import { Layout } from '@/components/layout';
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { getCurrentUser } from '@/services';
import { Provider } from 'react-redux';
import { setUser } from '@/store/userSlice';
import store from '@/store';
import { appWithTranslation, i18n } from 'next-i18next';
import { useRouter } from 'next/router';
import '../../i18n';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function MyAppContent({ Component, pageProps, router }: AppProps) {
  const { locale } = useRouter();

  const [queryClient] = useState(() => new QueryClient());
  const [homeLocation, setHomeLocation] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [isRender, setIsRender] = useState(false);

  const dispatch = store.dispatch;

  useEffect(() => {
    setHomeLocation(router.pathname);

    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user && Object.keys(user).length > 0) {
        dispatch(setUser(user));
        setIsLogin(!!user);
      }
    };

    checkUser();
  }, [router.pathname]);

  useEffect(() => {
    setIsRender(true);
  }, [locale]);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {isRender ? (
          homeLocation === '/' || !isLogin ? (
            <>
              <Component {...pageProps} />
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{ style: { maxWidth: 500 } }}
              />
            </>
          ) : (
            <Layout>
              <Component {...pageProps} />
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{ style: { maxWidth: 500 } }}
              />
            </Layout>
          )
        ) : (
          <div className="fixed inset-0 bg-slate-700 bg-opacity-50 flex justify-center items-center z-[9999]">
            <Spin indicator={<LoadingOutlined className="text-white" spin />} size="large" />
          </div>
        )}
      </QueryClientProvider>
    </Provider>
  );
}

export default appWithTranslation(MyAppContent);
