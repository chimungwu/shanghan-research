// Extracted quiz feature reference for future app migration.
// Not connected to current browser runtime yet.

function QuizPage({ favs }) {
  const browserStorage = createBrowserStorageAdapter(window.localStorage);
  const wrongBookStore = createWrongBookStore(browserStorage);
  const [mode, setMode] = useState(null);
  const [scope, setScope] = useState("all");
  const [q, setQ] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState({ total: 0, correct: 0 });
  const [history, setHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [wrongBook, setWrongBook] = useState(() => wrongBookStore.load());

  const pool = useMemo(() => {
    if (scope === "fav") return DATA.filter(d => favs.includes(d.n));
    if (scope !== "all") return DATA.filter(d => d.c === scope);
    return DATA;
  }, [scope, favs]);

  const saveWrongBook = (next) => {
    setWrongBook(next);
    try { wrongBookStore.save(next); } catch (e) {}
  };

  const reviewPool = useMemo(() => {
    if (!reviewWrongOnly) return [];
    return wrongBook;
  }, [reviewWrongOnly, wrongBook]);

  const resetQuizState = () => {};
  const genQuestion = () => {};
  const handleAnswer = (idx) => {};
}
