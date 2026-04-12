(function () {
  const CATEGORIES = [
    "全部",
    "太陽病",
    "陽明病",
    "少陽病",
    "太陰病",
    "少陰病",
    "厥陰病",
    "霍亂病",
    "差後病",
  ];

  const TENDENCIES = ["全部", "大溫", "偏溫", "平性", "偏寒", "大寒"];
  const FLAVORS = ["辛", "甘", "苦", "酸", "鹹"];
  const STORAGE_KEYS = {
    favorites: "shanghanlun_favs",
    wrongBook: "shanghanlun_wrong_questions",
  };
  const COMPARE_GROUPS = [
    { title: "表虛與表實", desc: "桂枝湯解肌祛風 vs 麻黃湯發汗解表", formulas: ["桂枝湯", "麻黃湯"] },
    { title: "三承氣湯", desc: "攻下力道：調胃→小承氣→大承氣", formulas: ["調胃承氣湯", "小承氣湯", "大承氣湯"] },
    { title: "五瀉心湯", desc: "同治心下痞，病機各異", formulas: ["半夏瀉心湯", "生薑瀉心湯", "甘草瀉心湯", "大黃黃連瀉心湯", "附子瀉心湯"] },
    { title: "四逆輩", desc: "回陽救逆力道比較", formulas: ["四逆湯", "通脈四逆湯", "白通湯", "乾薑附子湯"] },
    { title: "柴胡劑", desc: "少陽和解系列", formulas: ["小柴胡湯", "大柴胡湯", "柴胡桂枝湯", "柴胡桂枝乾薑湯"] },
    { title: "苓桂劑", desc: "溫陽化飲系列", formulas: ["茯苓桂枝白朮甘草湯", "茯苓桂枝甘草大棗湯", "茯苓甘草湯", "五苓散"] },
    { title: "梔子劑", desc: "清宣鬱熱系列", formulas: ["梔子豉湯", "梔子甘草豉湯", "梔子生薑豉湯", "梔子厚朴湯", "梔子乾薑湯"] },
    { title: "附子方", desc: "生附子（回陽）vs 炮附子（溫陽）", formulas: ["四逆湯", "真武湯", "附子湯", "麻黃細辛附子湯"] },
    { title: "清熱方", desc: "不同層次的清熱", formulas: ["白虎湯", "白虎加人參湯", "黃芩湯", "黃連阿膠湯"] },
    { title: "桂枝湯加減", desc: "桂枝湯的常見變化", formulas: ["桂枝湯", "桂枝加葛根湯", "桂枝加附子湯", "桂枝加厚朴杏子湯"] },
    { title: "溫裏方", desc: "太陰少陰溫裏比較", formulas: ["理中丸", "四逆湯", "真武湯", "附子湯"] },
    { title: "建中補虛", desc: "補虛的不同方向", formulas: ["小建中湯", "桂枝加芍藥湯", "炙甘草湯"] },
  ];

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function pickUnique(items, count) {
    const pool = items.slice();
    const results = [];

    for (let i = 0; i < count && pool.length > 0; i += 1) {
      const index = Math.floor(Math.random() * pool.length);
      results.push(pool.splice(index, 1)[0]);
    }

    return results;
  }

  function resolveQuizMode(mode) {
    if (mode !== "random") return mode;
    return pickRandom(["f2h", "h2f", "clause"]);
  }

  function buildWrongQuestionKey(question) {
    return `${question.mode}::${question.formulaName}::${question.question}`;
  }

  function buildWrongEntry(question) {
    return {
      key: buildWrongQuestionKey(question),
      mode: question.mode,
      question: question.question,
      options: question.options,
      answer: question.answer,
      formulaName: question.formulaName,
    };
  }

  function createQuizQuestion({ data, mode, scope = "all", favorites = [] }) {
    const pool = data.filter((item) => {
      if (scope === "fav") return favorites.includes(item.n);
      if (scope !== "all") return item.c === scope;
      return true;
    });

    if (pool.length < 4) return { error: "方劑數量不足，請擴大範圍" };

    const actualMode = resolveQuizMode(mode);
    const correct = pickRandom(pool);
    const wrongs = pickUnique(pool.filter((item) => item.n !== correct.n), 3);

    if (actualMode === "f2h") {
      const correctHerbs = correct.hd.map((herb) => herb.n).join("、");
      const options = pickUnique(
        [correctHerbs].concat(wrongs.map((item) => item.hd.map((herb) => herb.n).join("、"))),
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
      const options = pickUnique([correct.n].concat(wrongs.map((item) => item.n)), 4);
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
      if (withClauses.length < 4) return { error: "條文數量不足" };

      const clauseFormula = pickRandom(withClauses);
      const clause = pickRandom(clauseFormula.cl);
      const options = pickUnique(
        [clauseFormula.n].concat(
          pickUnique(
            withClauses.filter((item) => item.n !== clauseFormula.n),
            3
          ).map((item) => item.n)
        ),
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

  function createBrowserStorageAdapter(storage) {
    return {
      readJson(key, fallback) {
        try {
          const raw = storage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
          return fallback;
        }
      },
      writeJson(key, value) {
        storage.setItem(key, JSON.stringify(value));
      },
      remove(key) {
        storage.removeItem(key);
      },
    };
  }

  function createWrongBookStore(adapter) {
    return {
      load() {
        return adapter.readJson(STORAGE_KEYS.wrongBook, []);
      },
      save(entries) {
        adapter.writeJson(STORAGE_KEYS.wrongBook, entries);
      },
      clear() {
        adapter.remove(STORAGE_KEYS.wrongBook);
      },
    };
  }

  function createFavoritesStore(adapter) {
    return {
      load() {
        return adapter.readJson(STORAGE_KEYS.favorites, []);
      },
      save(entries) {
        adapter.writeJson(STORAGE_KEYS.favorites, entries);
      },
      clear() {
        adapter.remove(STORAGE_KEYS.favorites);
      },
    };
  }

  window.AppCore = {
    CATEGORIES,
    TENDENCIES,
    FLAVORS,
    STORAGE_KEYS,
    COMPARE_GROUPS,
    pickUnique,
    resolveQuizMode,
    buildWrongQuestionKey,
    buildWrongEntry,
    createQuizQuestion,
    createBrowserStorageAdapter,
    createWrongBookStore,
    createFavoritesStore,
  };
})();
