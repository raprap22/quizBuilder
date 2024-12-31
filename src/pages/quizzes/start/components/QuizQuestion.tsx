import { Radio, Typography } from 'antd';
import { QuizQuestionProps } from '@/types';

const { Text } = Typography;

const QuizQuestion = ({
  question,
  onAnswerChange,
  currentIndex,
  selectedAnswer,
}: QuizQuestionProps) => {
  return (
    <div className="mb-6">
      <Text strong>
        {currentIndex + 1}. {question?.question}
      </Text>
      <div className="mt-3">
        <Radio.Group
          onChange={(e) => onAnswerChange(currentIndex, e.target.value)}
          value={selectedAnswer}
        >
          {question?.answers?.map((answer, index) => (
            <div key={index} className="mb-2">
              <Radio value={index}>{answer}</Radio>
            </div>
          ))}
        </Radio.Group>
      </div>
    </div>
  );
};

export default QuizQuestion;
