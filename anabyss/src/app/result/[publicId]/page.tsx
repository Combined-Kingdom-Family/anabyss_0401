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

// function formatSubmittedAt(dateString: string) {
//   const date = new Date(dateString);

//   return new Intl.DateTimeFormat("ko-KR", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).format(date);
// }

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

  const geombulsiSummary = areaSummaries.find(
    (item) => item.area === "검불시"
  );
  const part1Summary = areaSummaries.find((item) => item.area === "1부");
  const part2Summary = areaSummaries.find((item) => item.area === "2부");
  const part3Summary = areaSummaries.find((item) => item.area === "3부");

  return (
    <main className="min-h-screen bg-[#F1F3FB] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-6">
        {/* 상단 성적통지표 */}
          <section className="relative border border-black bg-white px-3 py-4 sm:px-[4.5%] sm:py-[4.5%]">
            <div className="relative mx-auto w-full max-w-[62rem]">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative h-[7rem] w-[7rem] opacity-[0.1] sm:h-[15rem] sm:w-[15rem] sm:opacity-[0.14]">
                    <Image
                      src="/images/watermark.png"
                      alt="워터마크"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  <div className="mt-2 select-none font-watermark text-[2.4rem] font-black tracking-[0.1em] text-sky-300/20 sm:mt-4 sm:text-[clamp(3.75rem,10vw,7.5rem)] sm:tracking-[0.14em] sm:text-sky-300/30">
                    CICE
                  </div>
                </div>
              </div>

              <div className="relative">
                <header className="mb-5 text-center sm:mb-12">
                  <h1 className="font-serif text-[2.05rem] font-black tracking-[-0.04em] text-black [text-shadow:0_0_0.5px_rgba(0,0,0,0.8)] sm:text-[clamp(2.8rem,6vw,4.8rem)]">
                    검불시 영역
                  </h1>
                </header>

                {/* 모바일: 기본정보 카드 */}
                <div className="grid grid-cols-1 gap-2 sm:hidden">
                  <div className="border border-black bg-black/5 px-3 py-2 text-sm font-semibold text-black">
                    기본 정보
                  </div>
                  <div className="border border-black bg-white">
                    <div className="grid grid-cols-[5.5rem_1fr] border-b border-black">
                      <div className="bg-black/5 px-3 py-2 text-sm font-semibold">수험번호</div>
                      <div className="px-3 py-2 text-sm">{result.userNumber}</div>
                    </div>
                    <div className="grid grid-cols-[5.5rem_1fr] border-b border-black">
                      <div className="bg-black/5 px-3 py-2 text-sm font-semibold">성명</div>
                      <div className="px-3 py-2 text-sm">{result.nickname}</div>
                    </div>
                    <div className="grid grid-cols-[5.5rem_1fr]">
                      <div className="bg-black/5 px-3 py-2 text-sm font-semibold">출신고교</div>
                      <div className="px-3 py-2 text-sm">CK고등학교</div>
                    </div>
                  </div>
                </div>

                {/* 데스크탑: 기본정보 표 */}
                <div className="hidden sm:block">
                  <table className="w-full border-collapse border-[1.5px] border-black text-center text-[clamp(1rem,1.35vw,1.22rem)] text-black">
                    <tbody>
                      <tr>
                        <th className="w-1/3 border border-black bg-black/5 px-3 py-3 font-semibold">
                          수 험 번 호
                        </th>
                        <th className="w-1/3 border border-black bg-black/5 px-3 py-3 font-semibold">
                          성 명
                        </th>
                        <th className="w-1/3 border border-black bg-black/5 px-3 py-3 font-semibold">
                          출 신 고 교
                        </th>
                      </tr>
                      <tr>
                        <td className="border border-black px-3 py-3">{result.userNumber}</td>
                        <td className="border border-black px-3 py-3">{result.nickname}</td>
                        <td className="border border-black px-3 py-3">CK고등학교</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 모바일: 영역별 점수 카드 */}
                <div className="mt-4 sm:hidden">
                  <div className="border border-black bg-black/5 px-3 py-2 text-sm font-semibold text-black">
                    영역별 성적
                  </div>
                  <div className="border-x border-b border-black">
                    {[
                      { area: "검불시", summary: geombulsiSummary },
                      { area: "1부", summary: part1Summary },
                      { area: "2부", summary: part2Summary },
                      { area: "3부", summary: part3Summary },
                    ].map((item) => (
                      <div
                        key={item.area}
                        className="grid grid-cols-[4.5rem_1fr_1fr] border-b border-black last:border-b-0"
                      >
                        <div className="bg-black/5 px-2 py-2 text-center text-sm font-semibold">
                          {item.area}
                        </div>
                        <div className="px-2 py-2 text-center text-sm">
                          점수 {item.summary?.score ?? 0}
                        </div>
                        <div className="px-2 py-2 text-center text-sm">
                          등급 {item.summary?.grade ?? "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 데스크탑: 영역별 점수 표 */}
                <div className="mt-4 hidden sm:block">
                  <table className="w-full border-collapse border-[1.5px] border-black text-center text-[clamp(1rem,1.35vw,1.22rem)] text-black">
                    <tbody>
                      <tr>
                        <th className="w-1/5 border border-black bg-black/5 px-3 py-3 font-semibold">영 역</th>
                        <th className="w-1/5 border border-black bg-black/5 px-3 py-3 font-semibold">검불시</th>
                        <th className="w-1/5 border border-black bg-black/5 px-3 py-3 font-semibold">1부</th>
                        <th className="w-1/5 border border-black bg-black/5 px-3 py-3 font-semibold">2부</th>
                        <th className="w-1/5 border border-black bg-black/5 px-3 py-3 font-semibold">3부</th>
                      </tr>
                      <tr>
                        <td className="border border-black px-3 py-3 font-semibold">점 수</td>
                        <td className="border border-black px-3 py-3">{geombulsiSummary?.score ?? 0}</td>
                        <td className="border border-black px-3 py-3">{part1Summary?.score ?? 0}</td>
                        <td className="border border-black px-3 py-3">{part2Summary?.score ?? 0}</td>
                        <td className="border border-black px-3 py-3">{part3Summary?.score ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-3 py-3 font-semibold">등 급</td>
                        <td className="border border-black px-3 py-3">{geombulsiSummary?.grade ?? "-"}</td>
                        <td className="border border-black px-3 py-3">{part1Summary?.grade ?? "-"}</td>
                        <td className="border border-black px-3 py-3">{part2Summary?.grade ?? "-"}</td>
                        <td className="border border-black px-3 py-3">{part3Summary?.grade ?? "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 요약 */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3">
                  <div className="border border-black px-3 py-3 text-center sm:px-4">
                    <p className="text-[0.82rem] font-medium text-gray-600 sm:text-[clamp(1rem,1.25vw,1.1rem)]">
                      총 점수
                    </p>
                    <p className="mt-1 text-[1.3rem] font-bold text-black sm:text-[clamp(1.45rem,2.3vw,2rem)]">
                      {result.score}점
                    </p>
                  </div>

                  <div className="border border-black px-3 py-3 text-center sm:px-4">
                    <p className="text-[0.82rem] font-medium text-gray-600 sm:text-[clamp(1rem,1.25vw,1.1rem)]">
                      총 정답 수
                    </p>
                    <p className="mt-1 text-[1.3rem] font-bold text-black sm:text-[clamp(1.45rem,2.3vw,2rem)]">
                      {result.correctCount} / {result.totalQuestions}
                    </p>
                  </div>

                  <div className="border border-black px-3 py-3 text-center sm:px-4">
                    <p className="text-[0.82rem] font-medium text-gray-600 sm:text-[clamp(1rem,1.25vw,1.1rem)]">
                      소요 시간
                    </p>
                    <p className="mt-1 text-[1.3rem] font-bold text-black sm:text-[clamp(1.45rem,2.3vw,2rem)]">
                      {formatDuration(result.durationSeconds)}
                    </p>
                  </div>
                </div>

                {/* 기관명 + 도장 */}
                <div className="mt-5 flex justify-center sm:mt-8">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-y-1/2 translate-x-[4.25rem] opacity-35 sm:h-20 sm:w-20 sm:translate-x-[13rem] sm:opacity-40">
                      <Image
                        src="/images/stamp.png"
                        alt="도장"
                        fill
                        className="object-contain"
                      />
                    </div>

                    <p className="relative z-10 text-center font-serif text-[0.95rem] tracking-[0.12em] text-black sm:text-[clamp(1.2rem,2vw,1.95rem)] sm:tracking-[0.22em]">
                      C K 사 설 교 육 과 정 평 가 원 장
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        {/* 문항별 정오표 */}
        <section className="border border-black bg-white px-3 py-4 sm:px-[4.5%] sm:py-[4.5%]">
          <div className="mx-auto w-full max-w-[62rem]">
            <header className="mb-5 sm:mb-8">
              <h2 className="text-[1.45rem] font-bold tracking-[-0.03em] text-black sm:text-[clamp(1.7rem,2.7vw,2.5rem)]">
                문항별 정오표
              </h2>
              <p className="mt-2 text-[0.88rem] text-gray-700 sm:text-base">
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
                  className="border border-black bg-transparent p-3 sm:p-5"
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[1rem] font-semibold text-black sm:text-[clamp(1.15rem,1.7vw,1.35rem)]">
                        {index + 1}번 문제
                      </p>
                      <p className="text-[0.82rem] text-gray-600 sm:text-base">
                        영역: {detail.area}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[0.78rem] font-medium sm:px-3 sm:text-sm ${
                        detail.isCorrect
                          ? "border-green-700 bg-green-100 text-green-700"
                          : "border-red-700 bg-red-100 text-red-700"
                      }`}
                    >
                      {detail.isCorrect ? "정답" : "오답"}
                    </span>
                  </div>

                  <p className="mb-4 text-[0.95rem] leading-[1.7] text-black sm:text-[clamp(1.08rem,1.5vw,1.25rem)] sm:leading-[1.95]">
                    {detail.questionText}
                  </p>

                  {detail.imageUrl ? (
                    <div className="mb-4 border border-black bg-transparent">
                      <div className="relative h-[min(24dvh,12rem)] w-full sm:max-h-[24rem] sm:aspect-[16/9]">
                        <Image
                          src={detail.imageUrl}
                          alt={`question-${detail.questionId}`}
                          fill
                          className="object-contain p-2 sm:p-3"
                          sizes="(max-width: 768px) 100vw, 900px"
                        />
                      </div>
                    </div>
                  ) : null}

                  {detail.choices.length > 0 ? (
                    <ul className="mb-4 space-y-2">
                      {detail.choices.map((choice, choiceIndex) => {
                        const isSelected = detail.selectedAnswer === choiceIndex;
                        const isCorrectChoice = detail.correctAnswer === choiceIndex;

                        return (
                          <li
                            key={`${detail.questionId}-${choiceIndex}`}
                            className={`border px-3 py-2 text-[0.88rem] leading-[1.55] sm:text-[clamp(0.95rem,1.25vw,1.05rem)] ${
                              isCorrectChoice
                                ? "border-green-700 bg-green-50"
                                : isSelected
                                ? "border-red-700 bg-red-50"
                                : "border-black bg-transparent"
                            }`}
                          >
                            {choiceIndex + 1}. {stripChoicePrefix(choice)}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  <div className="space-y-1 text-[0.82rem] text-gray-700 sm:text-base">
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