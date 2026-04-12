// Future app shell reference.
// Intended as the eventual composition root after the current single-file app is split.
import { ComparePage, QuizPage } from "./features/index.js";

export function AppShell() {
  // Reserved for future App composition.
  // Keep imports alive for migration visibility.
  void ComparePage;
  void QuizPage;
  return null;
}
