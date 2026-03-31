import type { PublicQuestion } from "@/types/exam";
import ChoiceList from "@/components/exam/ChoiceList";
import Image from "next/image";

type QuestionCardProps = {
  questionNumber: number;
  totalQuestions: number;
  question: PublicQuestion;
  selectedAnswer?: number;
  onSelect: (index: number) => void;
};

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  selectedAnswer,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow">
      <p className="text-sm text-gray-500">
        {questionNumber} / {totalQuestions}
      </p>

      <h2 className="text-lg font-semibold">{question.questionText}</h2>

      {question.imageUrl ? (
        <Image
          src={question.imageUrl}
          alt={`question-${question.id}`}
          className="max-h-80 rounded-lg object-contain"
          width={500}
          height={300}
        />
      ) : null}

      <ChoiceList
        choices={question.choices}
        selectedAnswer={selectedAnswer}
        onSelect={onSelect}
      />
    </div>
  );
}