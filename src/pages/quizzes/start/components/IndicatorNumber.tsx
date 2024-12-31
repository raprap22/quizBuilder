import { Button, Card } from 'antd';

export type IndicatorNumberProps = {
  answer: number[];
  onNavigateToQuestion: (index: number) => void;
};

const IndicatorNumber = ({ answer, onNavigateToQuestion }: IndicatorNumberProps) => {
  return (
    <>
      <Card className="w-[20%]">
        <div className="flex flex-wrap gap-2">
          {answer.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigateToQuestion(index)}
              className={`px-3 py-1 rounded border ${
                item !== -1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </Card>
    </>
  );
};

export default IndicatorNumber;