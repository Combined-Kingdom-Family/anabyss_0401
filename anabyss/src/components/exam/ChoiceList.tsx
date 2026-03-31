type ChoiceListProps = {
  choices: string[];
  selectedAnswer?: number;
  onSelect: (index: number) => void;
};

export default function ChoiceList({
  choices,
  selectedAnswer,
  onSelect,
}: ChoiceListProps) {
  return (
    <div className="flex flex-col gap-3">
      {choices.map((choice, index) => {
        const isSelected = selectedAnswer === index;

        return (
          <button
            key={`${choice}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className={`rounded-lg border px-4 py-3 text-left ${
              isSelected
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            {index + 1}. {choice}
          </button>
        );
      })}
    </div>
  );
}