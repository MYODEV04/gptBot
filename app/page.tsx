"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [grade, setGrade] = useState("GEM MT 10");

  // ✅ 카드 이름 (name) / setter는 setCardName 으로 변경
  const [cardName, setCardName] = useState("GENGAR HOLO");

  const [year, setYear] = useState("1997");

  // ✅ 세트 이름은 setName 대신 setLabel로 헷갈리지 않게 변경
  const [setLabel, setSetLabel] = useState("POKEMON JAPANESE FOSSIL");

  const [currency, setCurrency] = useState("JPY");

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const example = useMemo(
    () => `예: ${grade} / ${cardName} / ${year} / ${setLabel}`,
    [grade, cardName, year, setLabel]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnswer("");
    setQuery("");

    try {
      const res = await fetch("/api/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          name: cardName,     // ✅ 서버는 name 필드를 기대하니 여기서 매핑
          year,
          setName: setLabel,  // ✅ 서버는 setName 필드를 기대하니 여기서 매핑
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || data?.detail || "Request failed");
      }

      setQuery(data.query || "");
      setAnswer(data.answer || "");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <header className="header">
        <h1>🃏 Pokémon Card Price (Vercel + OpenAI)</h1>
        <p className="sub">
          입력값을 기반으로 웹에서 최근 판매완료(sold/completed) 근거를 찾아 시세를 요약합니다.
        </p>
      </header>

      <section className="card">
        <form onSubmit={onSubmit} className="grid">
          <label className="field">
            <span>Grade</span>
            <input value={grade} onChange={(e) => setGrade(e.target.value)} required />
          </label>

          <label className="field">
            <span>Name</span>
            <input value={cardName} onChange={(e) => setCardName(e.target.value)} required />
          </label>

          <label className="field">
            <span>Year</span>
            <input value={year} onChange={(e) => setYear(e.target.value)} />
          </label>

          <label className="field">
            <span>Set</span>
            <input value={setLabel} onChange={(e) => setSetLabel(e.target.value)} />
          </label>

          <label className="field">
            <span>Currency</span>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </label>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "조회 중..." : "시세 조회"}
          </button>
        </form>

        <div className="hint">{example}</div>
      </section>

      {error && (
        <section className="card err">
          <b>에러</b>
          <div className="mono">{error}</div>
          <div className="small">
            • 오류가 발생하였습니다. 잠시 후 다시 시도해주세요. <br />
          </div>
        </section>
      )}

      {query && (
        <section className="card">
          <div className="small"><b>Search Query</b></div>
          <div className="mono">{query}</div>
        </section>
      )}

      {answer && (
        <section className="card">
          <div className="small"><b>Answer</b></div>
          <pre className="mono pre">{answer}</pre>
        </section>
      )}

    
    </main>
  );
}

