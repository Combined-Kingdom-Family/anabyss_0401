// 동적 결과 페이지 
// 서버에서 결과를 읽어와서 뿌리는 역할 

type ResultPageProps = {
  params: Promise<{
    resultId: string;
  }>;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { resultId } = await params;

  // TODO: 나중에 DB에서 resultId로 실제 조회
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">시험 결과</h1>
        <p>resultId: {resultId}</p>

        <div className="rounded-lg bg-gray-100 p-4">
          <p>점수: TODO</p>
          <p>정답 수: TODO</p>
          <p>소요 시간: TODO</p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">문항별 결과</h2>
          <p>DB 연결 후 표시 예정</p>
        </div>
      </div>
    </main>
  );
}