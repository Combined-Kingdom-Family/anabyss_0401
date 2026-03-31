type TimerProps = {
  remainingSeconds: number;
};

function formatTime(seconds: number) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default function Timer({ remainingSeconds }: TimerProps) {
  return (
    <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold">
      남은 시간: {formatTime(remainingSeconds)}
    </div>
  );
}