import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Form, Input, Button, Radio, InputNumber, Typography, Alert } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export type QuizFormProps = {
  defaultValues: {
    title: string;
    author: string;
    description: string;
    time: number;
    questions: { question: string; answers: string[]; correct_answer: number }[];
  };
  isSubmitting: boolean;
  onSubmit: (data: any) => void;
};

export const QuizForm = ({ defaultValues, isSubmitting, onSubmit }: QuizFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues,
  });
  const { t } = useTranslation();
  const { fields, append } = useFieldArray({ control, name: 'questions' });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label={t('QuizTitle')}
        validateStatus={errors.title ? 'error' : ''}
        help={errors.title ? t('Titleisrequired') : ''}
      >
        <Controller
          control={control}
          name="title"
          rules={{ required: t('Titleisrequired') }}
          render={({ field }) => <Input {...field} placeholder={t('Enterquiztitle')} />}
        />
      </Form.Item>

      <Form.Item
        label={t('QuizAuthor')}
        validateStatus={errors.author ? 'error' : ''}
        help={errors.author ? t('Authorisrequired') : ''}
      >
        <Controller
          control={control}
          name="author"
          rules={{ required: t('Authorisrequired') }}
          render={({ field }) => <Input {...field} placeholder={t('Enteryournameastheauthor')} />}
        />
      </Form.Item>

      <Form.Item
        label={t('Description')}
        validateStatus={errors.description ? 'error' : ''}
        help={errors.description ? t('Descriptionisrequired') : ''}
      >
        <Controller
          control={control}
          name="description"
          rules={{ required: t('Descriptionisrequired') }}
          render={({ field }) => (
            <Input.TextArea {...field} placeholder={t('Enteryourquizdescription')} rows={4} />
          )}
        />
      </Form.Item>

      <Form.Item
        label={t('Time')}
        validateStatus={errors.time ? 'error' : ''}
        help={errors.time ? t('Timeisrequired') : ''}
      >
        <Controller
          control={control}
          name="time"
          rules={{ required: t('Timeisrequired') }}
          render={({ field }) => (
            <div className="flex flex-row items-center gap-3">
              <InputNumber {...field} placeholder="Enter your quiz time" />
              <Typography className="text-gray-500">{t('Minutes')} </Typography>
            </div>
          )}
        />
      </Form.Item>

      {fields.map((field, index) => (
        <div key={field.id} style={{ marginBottom: '1.5rem' }}>
          <Form.Item
            label={`${t('Question')} ${index + 1}`}
            validateStatus={errors.questions?.[index]?.question ? 'error' : ''}
            help={errors.questions?.[index]?.question ? t('Questionisrequired') : ''}
          >
            <Controller
              control={control}
              name={`questions.${index}.question`}
              rules={{ required: t('Questionisrequired') }}
              render={({ field }) => <Input {...field} placeholder={t('Enterquestion')} />}
            />
          </Form.Item>

          <Form.Item
            label={t('Answers')}
            validateStatus={errors.questions?.[index]?.answers ? 'error' : ''}
            help={errors.questions?.[index]?.answers ? t('Allanswersarerequired') : ''}
          >
            <Radio.Group
              onChange={(e) => setValue(`questions.${index}.correct_answer`, e.target.value)}
              value={watch(`questions.${index}.correct_answer`)}
            >
              {Array.from({ length: 4 }).map((_, answerIndex) => (
                <div
                  key={answerIndex}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <Radio value={answerIndex} />
                  <Controller
                    control={control}
                    name={`questions.${index}.answers.${answerIndex}`}
                    rules={{ required: `Answer ${answerIndex + 1} is required` }}
                    render={({ field }) => (
                      <Input {...field} placeholder={`${t('Answer')} ${answerIndex + 1}`} />
                    )}
                  />
                </div>
              ))}
            </Radio.Group>
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              {t('selectAboveCorrect')}
            </Text>
          </Form.Item>
        </div>
      ))}

      <Form.Item>
        <Button
          type="dashed"
          onClick={() => append({ question: '', answers: ['', '', '', ''], correct_answer: 0 })}
          style={{ width: '100%' }}
        >
          {t('AddQuestion')}
        </Button>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ width: '100%' }}>
          {isSubmitting ? t('Saving...') : t('SaveQuiz')}
        </Button>
      </Form.Item>

      {Object.keys(errors).length > 0 && (
        <Alert
          message={t('Thereareerrorsintheform')}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}
    </Form>
  );
};
