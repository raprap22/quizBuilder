import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/services';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useTranslation();

  const { mutate: handleLogin, isPending } = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const user = await login(values.email, values.password);
      if (!user) {
        throw new Error('Login failed');
      }
      return user;
    },
    onError: (error: any) => {
      setError(error.message);
    },
    onSuccess: () => {
      window.location.href = '/quizzes';
    },
  });

  const onFinish = (values: { email: string; password: string }) => {
    setError('');
    handleLogin(values);
  };

  return (
    <div className="max-w-sm mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full">
        <Title level={2} style={{ textAlign: 'center' }}>
          {t('login')}
        </Title>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: '', password: '' }}>
          <Form.Item
            label={t('email')}
            name="email"
            rules={[{ required: true, message: t('warningEmail'), type: 'email' }]}
          >
            <Input placeholder={t('inputEmail')} />
          </Form.Item>

          <Form.Item
            label={t('password')}
            name="password"
            rules={[{ required: true, message: t('warningPassword') }]}
          >
            <Input.Password placeholder={t('inputPassword')} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isPending}>
              {isPending ? t('loggingIn') : t('login')}
            </Button>
          </Form.Item>
        </Form>
        <Typography
          className="text-blue-500 cursor-pointer text-center"
          onClick={() => router.push('/')}
        >
          {t('back')}
        </Typography>
      </Card>
    </div>
  );
}
