import { QUIZ_MODES } from "./constants.js";

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickUnique(items, count) {
  const pool = [...items];
  const results = [];

  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    results.push(pool.splice(index, 1)[0]);
  }

  return results;
}

export function resolveQuizMode(mode) {
  if (mode !== "random") return mode;
  return pickRandom(QUIZ_MODES.filter((item) => item !== "random"));
}

export function buildWrongQuestionKey(question) {
  return `${question.mode}::${question.formulaName}::${question.question}`;
}

export function buildWrongEntry(question) {
  return {
    key: buildWrongQuestionKey(question),
    mode: question.mode,
    question: question.question,
    options: question.options,
    answer: question.answer,
    formulaName: question.formulaName,
  };
}

export function createQuizQuestion({ data, mode, scope = "all", favorites = [] }) {
  const pool = data.filter((item) => {
    if (scope === "fav") return favorites.includes(item.n);
    if (scope !== "all") return item.c === scope;
    return true;
  });

  if (pool.length < 4) {
    return { error: "方劑數量不足，請擴大範圍" };
  }

  const actualMode = resolveQuizMode(mode);
  const correct = pickRandom(pool);
  const wrongs = pickUnique(pool.filter((item) => item.n !== correct.n), 3);

  if (actualMode === "f2h") {
    const correctHerbs = correct.hd.map((herb) => herb.n).join("、");
    const options = pickUnique(
      [correctHerbs, ...wrongs.map((item) => item.hd.map((herb) => herb.n).join("、"))],
      4
    );
    return {
      mode: actualMode,
      question: `「${correct.n}」的組成藥物為？`,
      options,
      answer: options.indexOf(correctHerbs),
      formulaName: correct.n,
    };
  }

  if (actualMode === "h2f") {
    const options = pickUnique([correct.n, ...wrongs.map((item) => item.n)], 4);
    return {
      mode: actualMode,
      question: `以下藥物組成的方劑是？\n${correct.hd.map((herb) => herb.n).join("、")}`,
      options,
      answer: options.indexOf(correct.n),
      formulaName: correct.n,
    };
  }

  if (actualMode === "clause") {
    const withClauses = pool.filter((item) => item.cl && item.cl.length > 0);
    if (withClauses.length < 4) {
      return { error: "條文數量不足" };
    }

    const clauseFormula = pickRandom(withClauses);
    const clause = pickRandom(clauseFormula.cl);
    const options = pickUnique(
      [clauseFormula.n, ...pickUnique(withClauses.filter((item) => item.n !== clauseFormula.n), 3).map((item) => item.n)],
      4
    );

    return {
      mode: actualMode,
      question: `以下條文出自哪首方劑？\n「${clause.t.replace(clauseFormula.n, "＿＿＿湯/丸/散")}」`,
      options,
      answer: options.indexOf(clauseFormula.n),
      formulaName: clauseFormula.n,
    };
  }

  return { error: `不支援的題型：${actualMode}` };
}
