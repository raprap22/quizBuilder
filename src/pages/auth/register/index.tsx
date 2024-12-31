import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Alert, Card, message, Spin, Radio } from 'antd';
import { register } from '@/services';
import { REGISTER } from '@/types';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export default function Register() {
  const [error, setError] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const { t } = useTranslation();

  const handleOkClick = () => {
    messageApi.destroy();
    router.push('/auth/login');
  };

  const successContent = () => {
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="flex items-center space-x-2 mt-5">
          <CheckCircleOutlined className="text-2xl text-green-500" />
          <Typography>{t('successRegister')}</Typography>
        </div>

        <div className="button button-green w-32 py-2 mt-5 cursor-pointer" onClick={handleOkClick}>
          {t('ok')}
        </div>
      </div>
    );
  };

  const { mutate: handleRegister, isPending } = useMutation({
    mutationFn: async (values: REGISTER) => {
      const user = await register(values.email, values.name, values.role, values.password);
      if (!user) {
        throw new Error('Registration failed');
      }
      return user;
    },
    onError: (error) => {
      setError(error.message);
    },
    onSuccess: () => {
      const successMessageKey = 'successMessage';

      messageApi.open({
        key: successMessageKey,
        content: successContent(),
        onClose: () => {
          router.push('/auth/login');
        },
      });
    },
  });

  const onFinish = (values: REGISTER) => {
    setError('');
    handleRegister(values);
  };

  return (
    <div className="flex flex-col max-w-[400px] mx-auto p-5 items-center justify-center min-h-screen">
      {contextHolder}
      <Card className="w-full">
        <Title level={2} style={{ textAlign: 'center' }}>
          {t('createAcc')}
        </Title>

        {error && (
          <Alert
            message={t("error")}
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={t("email")}
            name="email"
            rules={[{ required: true, message: t('warningEmail'), type: 'email' }]}
          >
            <Input placeholder={t('inputEmail')} />
          </Form.Item>
          <Form.Item
            label={t("name")}
            name="name"
            rules={[{ required: true, message: t('warningName') }]}
          >
            <Input placeholder={t("inputName")} />
          </Form.Item>

          <Form.Item
            label={t('youAreA')}
            name="role"
            rules={[{ required: true, message: t('warningRole') }]}
          >
            <Radio.Group>
              <Radio.Button value="student">{t("Student")} </Radio.Button>
              <Radio.Button value="teacher">{t('Teacher')}</Radio.Button>
            </Radio.Group>
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
              {t('register')} {isPending && <Spin />}
            </Button>
          </Form.Item>
        </Form>
        <Typography
          className="text-blue-500 cursor-pointer text-center"
          onClick={() => router.back()}
        >
          {t('back')}
        </Typography>
      </Card>
    </div>
  );
}
