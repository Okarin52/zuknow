import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Question, QuestionInput, QuestionState } from '../types/Question';
import {
  getQuestions,
  saveQuestion,
  saveQuestions,
  getQuestionById,
  deleteQuestion,
  clearQuestions
} from '../utils/localStorage';
import {
  exportQuestionsToJSON,
  importQuestionsFromJSON,
  importQuestionsFromCSV,
  createQuestionFromInput
} from '../utils/fileOperations';

interface QuestionsStore extends QuestionState {
  // CRUD操作
  loadQuestions: () => Promise<void>;
  createQuestion: (input: QuestionInput) => Promise<Question>;
  updateQuestion: (id: string, input: QuestionInput) => Promise<Question>;
  removeQuestion: (id: string) => Promise<void>;
  getQuestion: (id: string) => Question | undefined;
  clearAllQuestions: () => Promise<void>;

  // 検索・フィルタリング
  searchQuestions: (keyword: string) => Question[];
  getQuestionsByCategory: (category: string) => Question[];
  getQuestionsByTag: (tag: string) => Question[];
  getQuestionsByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => Question[];

  // ナビゲーション
  setCurrentQuestion: (question: Question | undefined) => void;
  getRandomQuestion: () => Question | undefined;

  // ファイル操作
  exportToJSON: (filename?: string) => Promise<void>;
  importFromJSON: (file: File, mergeMode?: boolean) => Promise<Question[]>;
  importFromCSV: (file: File, mergeMode?: boolean) => Promise<Question[]>;

  // ユーティリティ
  clearError: () => void;
  getStatistics: () => {
    total: number;
    categories: number;
    tags: number;
    difficulties: {
      easy: number;
      medium: number;
      hard: number;
      unspecified: number;
    };
    categoriesList: string[];
    tagsList: string[];
  };

  // 内部状態操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useQuestionsStore = create<QuestionsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初期状態
        questions: [],
        currentQuestion: undefined,
        loading: false,
        error: null,

        // 内部状態操作
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),

        // ローカルストレージから問題を読み込む
        loadQuestions: async () => {
          set({ loading: true, error: null });

          try {
            const questions = getQuestions();
            set({ questions, loading: false });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : '問題の読み込みに失敗しました'
            });
          }
        },

        // 新しい問題を作成する
        createQuestion: async (input: QuestionInput) => {
          set({ loading: true, error: null });

          try {
            const newQuestion = createQuestionFromInput(input);
            saveQuestion(newQuestion);

            const { questions } = get();
            set({
              questions: [...questions, newQuestion],
              loading: false
            });

            return newQuestion;
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : '問題の作成に失敗しました'
            });
            throw error;
          }
        },

        // 問題を更新する
        updateQuestion: async (id: string, input: QuestionInput) => {
          set({ loading: true, error: null });

          try {
            const { questions, currentQuestion } = get();
            const existingQuestion = questions.find(q => q.id === id);

            if (!existingQuestion) {
              throw new Error('指定された問題が見つかりません');
            }

            const updatedQuestion: Question = {
              ...existingQuestion,
              ...input,
              updatedAt: new Date()
            };

            saveQuestion(updatedQuestion);

            set({
              questions: questions.map(q => q.id === id ? updatedQuestion : q),
              currentQuestion: currentQuestion?.id === id ? updatedQuestion : currentQuestion,
              loading: false
            });

            return updatedQuestion;
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : '問題の更新に失敗しました'
            });
            throw error;
          }
        },

        // 問題を削除する
        removeQuestion: async (id: string) => {
          set({ loading: true, error: null });

          try {
            deleteQuestion(id);

            const { questions, currentQuestion } = get();
            set({
              questions: questions.filter(q => q.id !== id),
              currentQuestion: currentQuestion?.id === id ? undefined : currentQuestion,
              loading: false
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : '問題の削除に失敗しました'
            });
            throw error;
          }
        },

        // IDで問題を取得する
        getQuestion: (id: string) => {
          try {
            return getQuestionById(id);
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '問題の取得に失敗しました'
            });
            return undefined;
          }
        },

        // 現在の問題を設定する
        setCurrentQuestion: (question: Question | undefined) => {
          set({ currentQuestion: question });
        },

        // ランダムな問題を取得する
        getRandomQuestion: () => {
          const { questions } = get();
          if (questions.length === 0) return undefined;

          const randomIndex = Math.floor(Math.random() * questions.length);
          const randomQuestion = questions[randomIndex];

          set({ currentQuestion: randomQuestion });
          return randomQuestion;
        },

        // カテゴリで問題をフィルタリングする
        getQuestionsByCategory: (category: string) => {
          const { questions } = get();
          return questions.filter(q => q.category === category);
        },

        // タグで問題をフィルタリングする
        getQuestionsByTag: (tag: string) => {
          const { questions } = get();
          return questions.filter(q => q.tags?.includes(tag));
        },

        // 難易度で問題をフィルタリングする
        getQuestionsByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => {
          const { questions } = get();
          return questions.filter(q => q.difficulty === difficulty);
        },

        // キーワードで問題を検索する
        searchQuestions: (keyword: string) => {
          const { questions } = get();
          const lowerKeyword = keyword.toLowerCase();
          return questions.filter(q =>
            q.question.toLowerCase().includes(lowerKeyword) ||
            q.answer.toLowerCase().includes(lowerKeyword) ||
            q.explanation.toLowerCase().includes(lowerKeyword) ||
            q.category?.toLowerCase().includes(lowerKeyword) ||
            q.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
          );
        },

        // 全ての問題を削除する
        clearAllQuestions: async () => {
          set({ loading: true, error: null });

          try {
            clearQuestions();
            set({
              questions: [],
              currentQuestion: undefined,
              loading: false
            });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : '問題の削除に失敗しました'
            });
            throw error;
          }
        },

        // 問題をJSONファイルにエクスポートする
        exportToJSON: async (filename?: string) => {
          set({ loading: true, error: null });

          try {
            const { questions } = get();
            exportQuestionsToJSON(questions, filename);
            set({ loading: false });
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'エクスポートに失敗しました'
            });
            throw error;
          }
        },

        // JSONファイルから問題をインポートする
        importFromJSON: async (file: File, mergeMode: boolean = false) => {
          set({ loading: true, error: null });

          try {
            const importedQuestions = await importQuestionsFromJSON(file);
            const { questions } = get();

            const newQuestions = mergeMode
              ? [...questions, ...importedQuestions]
              : importedQuestions;

            saveQuestions(newQuestions);

            set({
              questions: newQuestions,
              loading: false
            });

            return importedQuestions;
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'インポートに失敗しました'
            });
            throw error;
          }
        },

        // CSVファイルから問題をインポートする
        importFromCSV: async (file: File, mergeMode: boolean = false) => {
          set({ loading: true, error: null });

          try {
            const importedQuestions = await importQuestionsFromCSV(file);
            const { questions } = get();

            const newQuestions = mergeMode
              ? [...questions, ...importedQuestions]
              : importedQuestions;

            saveQuestions(newQuestions);

            set({
              questions: newQuestions,
              loading: false
            });

            return importedQuestions;
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'インポートに失敗しました'
            });
            throw error;
          }
        },

        // エラーをクリアする
        clearError: () => {
          set({ error: null });
        },

        // 統計情報を取得する
        getStatistics: () => {
          const { questions } = get();
          const total = questions.length;
          const categories = [...new Set(questions.map(q => q.category).filter(Boolean))] as string[];
          const tags = [...new Set(questions.flatMap(q => q.tags || []))];
          const difficulties = {
            easy: questions.filter(q => q.difficulty === 'easy').length,
            medium: questions.filter(q => q.difficulty === 'medium').length,
            hard: questions.filter(q => q.difficulty === 'hard').length,
            unspecified: questions.filter(q => !q.difficulty).length
          };

          return {
            total,
            categories: categories.length,
            tags: tags.length,
            difficulties,
            categoriesList: categories,
            tagsList: tags
          };
        }
      }),
      {
        name: 'questions-store', // ローカルストレージのキー名
        partialize: (state) => ({
          questions: state.questions,
          currentQuestion: state.currentQuestion
        }) // 永続化する状態を選択
      }
    ),
    {
      name: 'QuestionsStore' // DevTools での表示名
    }
  )
);

// セレクター関数の提供（パフォーマンス最適化のため）
export const useQuestions = () => useQuestionsStore(state => state.questions);
export const useCurrentQuestion = () => useQuestionsStore(state => state.currentQuestion);
export const useLoading = () => useQuestionsStore(state => state.loading);
export const useError = () => useQuestionsStore(state => state.error);
export const useQuestionsActions = () => useQuestionsStore(state => ({
  loadQuestions: state.loadQuestions,
  createQuestion: state.createQuestion,
  updateQuestion: state.updateQuestion,
  removeQuestion: state.removeQuestion,
  getQuestion: state.getQuestion,
  clearAllQuestions: state.clearAllQuestions,
  searchQuestions: state.searchQuestions,
  getQuestionsByCategory: state.getQuestionsByCategory,
  getQuestionsByTag: state.getQuestionsByTag,
  getQuestionsByDifficulty: state.getQuestionsByDifficulty,
  setCurrentQuestion: state.setCurrentQuestion,
  getRandomQuestion: state.getRandomQuestion,
  exportToJSON: state.exportToJSON,
  importFromJSON: state.importFromJSON,
  importFromCSV: state.importFromCSV,
  clearError: state.clearError,
  getStatistics: state.getStatistics
}));
