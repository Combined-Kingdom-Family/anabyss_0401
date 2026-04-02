import Image from "next/image";
import { notFound } from "next/navigation";
import { questions } from "@/data/questions";
import { findExamResultDetailByPublicId } from "@/lib/queries/examResult";
import { calculateAreaSummaries } from "@/lib/scoring";

type ResultPageProps = {
  params: {
    publicId: string;
  };
};

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}분 ${sec}초`;
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function stripChoicePrefix(choice: string) {
  return choice
    .replace(/^\s*[①②③④⑤]\s*/, "")
    .replace(/^\s*\d+\s*[.)]\s*/, "")
    .trim();
}

export default async function ResultPage({ params }: ResultPageProps) {
  const publicId = params.publicId;

  if (!isUuidLike(publicId)) {
    notFound();
  }

  const result = await findExamResultDetailByPublicId(publicId);

  if (!result) {
    notFound();
  }

  const questionMap = new Map(
    questions.map((question) => [question.id, question])
  );

  const mergedDetails = result.answerDetails.map((detail) => {
    const question = questionMap.get(detail.questionId);

    return {
      ...detail,
      area: question?.area ?? "검불시",
      questionText: question?.questionText ?? "문제 정보를 찾을 수 없습니다.",
      choices: question?.choices ?? [],
      correctAnswer: question?.answer ?? null,
      imageUrl: question?.imageUrl ?? null,
    };
  });

  const answersMap = Object.fromEntries(
    result.answerDetails
      .filter((detail) => detail.selectedAnswer !== null)
      .map((detail) => [detail.questionId, detail.selectedAnswer as number])
  );

  const areaSummaries = calculateAreaSummaries(answersMap);

  const geombulsiSummary = areaSummaries.find((item) => item.area === "설정");
  const part1Summary = areaSummaries.find((item) => item.area === "인물");
  const part2Summary = areaSummaries.find((item) => item.area === "서사");
  const part3Summary = areaSummaries.find((item) => item.area === "세부");

  return (
    <main className="min-h-screen bg-[#F1F3FB] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-6">
        <section className="relative border-[1.5px] border-black bg-[#FFFFFF] px-[4.5%] py-[4.5%]">
          <div className="relative mx-auto w-full max-w-[62rem]">
            {/* 워터마크 */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative flex flex-col items-center justify-center">
                <div className="relative h-[12rem] w-[12rem] opacity-[0.14] sm:h-[15rem] sm:w-[15rem]">
                  <Image
                    src="/images/watermark.png"
                    alt="워터마크"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                <div className="mt-4 select-none font-watermark text-[clamp(3.75rem,10vw,7.5rem)] font-black tracking-[0.14em] text-sky-300/30">
                  CICE
                </div>
              </div>
            </div>

            <div className="relative">
              <header className="mb-10 text-center sm:mb-12">
                <h1 className="font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-black tracking-[-0.04em] text-black [text-shadow:0_0_0.5px_rgba(0,0,0,0.8)]">
                  검불시 영역
                </h1>
              </header>

              {/* 모바일 기본 정보 카드 */}
              <div className="space-y-3 sm:hidden">
                <div className="border-[1.5px] border-black">
                  <div className="border-b-[1.5px] border-black bg-[#D6DAE2] px-4 py-3 text-center text-[1rem] font-semibold text-black">
                    수험번호
                  </div>
                  <div className="px-4 py-4 text-center text-[1.2rem] font-medium text-black">
                    {result.userNumber}
                  </div>
                </div>

                <div className="border-[1.5px] border-black">
                  <div className="border-b-[1.5px] border-black bg-[#D6DAE2] px-4 py-3 text-center text-[1rem] font-semibold text-black">
                    성명
                  </div>
                  <div className="px-4 py-4 text-center text-[1.2rem] font-medium text-black">
                    {result.nickname}
                  </div>
                </div>

                <div className="border-[1.5px] border-black">
                  <div className="border-b-[1.5px] border-black bg-[#D6DAE2] px-4 py-3 text-center text-[1rem] font-semibold text-black">
                    출신 고교
                  </div>
                  <div className="px-4 py-4 text-center text-[1.2rem] font-medium text-black">
                    CK고등학교
                  </div>
                </div>
              </div>

              {/* 데스크톱 기본 정보 표 */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[44rem] border-collapse border-[1.5px] border-black text-center text-[clamp(1rem,1.35vw,1.22rem)] text-black">
                  <tbody>
                    <tr>
                      <th className="w-1/3 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        수 험 번 호
                      </th>
                      <th className="w-1/3 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        성 명
                      </th>
                      <th className="w-1/3 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        출 신 고 교
                      </th>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {result.userNumber}
                      </td>
                      <td className="border-[1.5px] border-black  px-3 py-3">
                        {result.nickname}
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        CK고등학교
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 모바일 영역 카드 */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:hidden">
                {[
                  { label: "설정", summary: geombulsiSummary },
                  { label: "인물", summary: part1Summary },
                  { label: "서사", summary: part2Summary },
                  { label: "세부", summary: part3Summary },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border-[1.5px] border-black"
                  >
                    <div className="border-b-[1.5px] border-black bg-[#D6DAE2] px-4 py-3 text-center text-[1rem] font-semibold text-black">
                      {item.label}
                    </div>

                    <div className="grid grid-cols-2">
                      <div className="border-r-[1.5px] border-black border-b-[1.5px] bg-[#D6DAE2] px-4 py-3 text-center text-[1rem] font-semibold text-black">
                        점수
                      </div>
                      <div className="border-b-[1.5px] border-black  px-4 py-3 text-center text-[1.15rem] font-medium text-black">
                        {item.summary?.score ?? 0}
                      </div>

                      <div className="border-r-[1.5px] border-black px-4 py-3 text-center text-[1rem] font-semibold text-black">
                        등급
                      </div>
                      <div className="px-4 py-3 text-center text-[1.15rem] font-medium text-black">
                        {item.summary?.grade ?? "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 데스크톱 영역 표 */}
              <div className="mt-4 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[44rem] border-collapse border-[1.5px] border-black text-center text-[clamp(1rem,1.35vw,1.22rem)] text-black">
                  <tbody>
                    <tr>
                      <th className="w-1/5 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        영 역
                      </th>
                      <th className="w-1/5 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        설정
                      </th>
                      <th className="w-1/5 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        인물
                      </th>
                      <th className="w-1/5 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        서사
                      </th>
                      <th className="w-1/5 border-[1.5px] border-black bg-[#D6DAE2] px-3 py-3 font-semibold">
                        세부
                      </th>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black px-3 py-3 font-semibold">
                        점 수
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {geombulsiSummary?.score ?? 0}
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {part1Summary?.score ?? 0}
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {part2Summary?.score ?? 0}
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {part3Summary?.score ?? 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black px-3 py-3 font-semibold">
                        등 급
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {geombulsiSummary?.grade ?? "-"}
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {part1Summary?.grade ?? "-"}
                      </td>
                      <td className="border-[1.5px] border-black  px-3 py-3">
                        {part2Summary?.grade ?? "-"}
                      </td>
                      <td className="border-[1.5px] border-black px-3 py-3">
                        {part3Summary?.grade ?? "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 총점 / 총정답 / 소요시간 */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3">
                <div className="border-[1.5px] border-black px-4 py-4 text-center">
                  <p className="text-[1rem] font-medium text-gray-600">
                    총 점수
                  </p>
                  <p className="mt-2 text-[clamp(1.8rem,5vw,2.2rem)] font-bold text-black">
                    {result.score}점
                  </p>
                </div>

                <div className="border-[1.5px] border-black px-4 py-4 text-center">
                  <p className="text-[1rem] font-medium text-gray-600">
                    총 정답 수
                  </p>
                  <p className="mt-2 text-[clamp(1.8rem,5vw,2.2rem)] font-bold text-black">
                    {result.correctCount} / {result.totalQuestions}
                  </p>
                </div>

                <div className="border-[1.5px] border-black px-4 py-4 text-center">
                  <p className="text-[1rem] font-medium text-gray-600">
                    소요 시간
                  </p>
                  <p className="mt-2 text-[clamp(1.8rem,5vw,2.2rem)] font-bold text-black">
                    {formatDuration(result.durationSeconds)}
                  </p>
                </div>
              </div>

              {/* 기관명 + 하트 도장 */}
              <div className="mt-8 sm:mt-10">
                <div className="relative flex w-full items-center justify-center">
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-y-1/2 translate-x-[8.8rem] opacity-55 sm:h-20 sm:w-20 sm:translate-x-[13rem]">
                    <Image
                      src="/images/stamp.png"
                      alt="도장"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <p className="relative z-10 text-center font-serif text-[clamp(1.15rem,3.8vw,1.95rem)] tracking-[0.08em] text-black sm:tracking-[0.22em]">
                    C K 사 설 교 육 과 정 평 가 원 장
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 문항별 정오표 */}
        <section className="border-[1.5px] border-black bg-[#FFFFFF] px-[4.5%] py-[4.5%]">
          <div className="mx-auto w-full max-w-[62rem]">
            <header className="mb-6 sm:mb-8">
              <h2 className="text-[clamp(1.7rem,2.7vw,2.5rem)] font-bold tracking-[-0.03em] text-black">
                문항별 정오표
              </h2>
              <p className="mt-2 text-[1rem] text-gray-700 sm:text-base">
                제출한 답안과 정답을 문제별로 확인할 수 있습니다.
              </p>
            </header>

            <div className="flex flex-col gap-4">
              {mergedDetails.map((detail, index) => {
                const selectedLabel =
                  detail.selectedAnswer !== null
                    ? `${detail.selectedAnswer + 1}번`
                    : "미응답";

                const correctLabel =
                  detail.correctAnswer !== null
                    ? `${detail.correctAnswer + 1}번`
                    : "정답 정보 없음";

                return (
                  <article
                    key={detail.id}
                    className="border-[1.5px] border-black bg-transparent p-4 sm:p-5"
                  >
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-[clamp(1.25rem,4vw,1.35rem)] font-semibold text-black">
                          {index + 1}번 문제
                        </p>
                        <p className="text-[1rem] text-gray-600 sm:text-base">
                          영역: {detail.area}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-medium ${
                          detail.isCorrect
                            ? "border-green-700 bg-green-100 text-green-700"
                            : "border-red-700 bg-red-100 text-red-700"
                        }`}
                      >
                        {detail.isCorrect ? "정답" : "오답"}
                      </span>
                    </div>

                    <p className="mb-5 text-[clamp(1.15rem,4.2vw,1.25rem)] leading-[1.95] text-black">
                      {detail.questionText}
                    </p>

                    {detail.imageUrl ? (
                      <div className="mb-6 relative w-full aspect-[1400/788] overflow-hidden border-[1.5px]">
                        <Image
                          src={detail.imageUrl}
                          alt={`question-${detail.questionId}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 900px"
                        />
                      </div>
                    ) : null}

                    {detail.choices.length > 0 ? (
                      <ul className="mb-4 space-y-2">
                        {detail.choices.map((choice, choiceIndex) => {
                          const isSelected =
                            detail.selectedAnswer === choiceIndex;
                          const isCorrectChoice =
                            detail.correctAnswer === choiceIndex;

                          return (
                            <li
                              key={`${detail.questionId}-${choiceIndex}`}
                              className={`border-[1.5px] px-3 py-2 text-[clamp(1rem,1.35vw,1.1rem)] font-medium text-black ${
                                isCorrectChoice
                                  ? "border-green-700 bg-green-50 text-black"
                                  : isSelected
                                  ? "border-red-700 bg-red-50 text-black"
                                  : "border-black bg-transparent text-black"
                              }`}
                            >
                              {choiceIndex + 1}. {stripChoicePrefix(choice)}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}

                    <div className="space-y-1 text-[1rem] text-gray-700 sm:text-base">
                      <p>내 답: {selectedLabel}</p>
                      <p>정답: {correctLabel}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}