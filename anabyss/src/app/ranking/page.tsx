// 랭킹 페이지 

import type { RankingItem } from "@/types/exam";

async function getRankings(): Promise<RankingItem[]> {
  const response = await fetch("http://localhost:3000/api/ranking", {
    cache: "no-store",
  });

  const data = await response.json();
  return data.rankings ?? [];
}

export default async function RankingPage() {
  const rankings = await getRankings();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">랭킹</h1>
        <p className="mb-4 text-sm text-gray-500">
          점수 내림차순, 동점 시 소요 시간 오름차순 기준
        </p>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">순위</th>
                <th className="px-4 py-3">닉네임</th>
                <th className="px-4 py-3">점수</th>
                <th className="px-4 py-3">정답 수</th>
                <th className="px-4 py-3">소요 시간</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((item) => (
                <tr key={`${item.rank}-${item.nickname}`} className="border-t">
                  <td className="px-4 py-3">{item.rank}</td>
                  <td className="px-4 py-3">{item.nickname}</td>
                  <td className="px-4 py-3">{item.score}</td>
                  <td className="px-4 py-3">{item.correctCount}</td>
                  <td className="px-4 py-3">{item.duration}초</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}