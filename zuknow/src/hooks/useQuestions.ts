import { useState, useEffect, useCallback } from 'react';
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

/**
 * useQuestions カスタムフック
 * 問題データの状態管理とCRUD操作を提供する
 */
export const useQuestions = () => {
  const [state, setState] = useState<QuestionState>({
    questions: [],
    currentQuestion: undefined,
    loading: false,
    error: null
  });

  // 初期データの読み込み
  useEffect(() => {
    loadQuestions();
  }, []);

  /**
   * ローカルストレージから問題を読み込む
   */
    const loadQuestions = useCallback(async () => {
    setState((prev: QuestionState) => ({ ...prev, loading: true, error: null }));

    try {
      const questions = getQuestions();
      setState((prev: QuestionState) => ({
        ...prev,
        questions,
        loading: false
      }));
    } catch (error) {
      setState((prev: QuestionState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '問題の読み込みに失敗しました'
      }));
    }
  }, []);

  /**
   * 新しい問題を作成する
   */
    const createQuestion = useCallback(async (input: QuestionInput) => {
    setState((prev: QuestionState) => ({ ...prev, loading: true, error: null }));

    try {
      const newQuestion = createQuestionFromInput(input);
      saveQuestion(newQuestion);

      setState((prev: QuestionState) => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
        loading: false
      }));

      return newQuestion;
    } catch (error) {
      setState((prev: QuestionState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '問題の作成に失敗しました'
      }));
      throw error;
    }
  }, []);

  /**
   * 問題を更新する
   */
  const updateQuestion = useCallback(async (id: string, input: QuestionInput) => {
    setState((prev: QuestionState) => ({ ...prev, loading: true, error: null }));

    try {
      let updatedQuestion: Question;
      let error: Error | null = null;

      setState((prev: QuestionState) => {
        const existingQuestion = prev.questions.find((q: Question) => q.id === id);
        if (!existingQuestion) {
          error = new Error('指定された問題が見つかりません');
          return { ...prev, loading: false, error: error.message };
        }

        updatedQuestion = {
          ...existingQuestion,
          ...input,
          updatedAt: new Date()
        };

        saveQuestion(updatedQuestion);

        return {
          ...prev,
          questions: prev.questions.map((q: Question) => q.id === id ? updatedQuestion : q),
          currentQuestion: prev.currentQuestion?.id === id ? updatedQuestion : prev.currentQuestion,
          loading: false
        };
      });

      if (error) {
        throw error;
      }

      return updatedQuestion!;
    } catch (error) {
      setState((prev: QuestionState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '問題の更新に失敗しました'
      }));
      throw error;
    }
  }, []);

  /**
   * 問題を削除する
   */
    const removeQuestion = useCallback(async (id: string) => {
    setState((prev: QuestionState) => ({ ...prev, loading: true, error: null }));

    try {
      deleteQuestion(id);

      setState((prev: QuestionState) => ({
        ...prev,
        questions: prev.questions.filter((q: Question) => q.id !== id),
        currentQuestion: prev.currentQuestion?.id === id ? undefined : prev.currentQuestion,
        loading: false
      }));
    } catch (error) {
      setState((prev: QuestionState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '問題の削除に失敗しました'
      }));
      throw error;
    }
  }, []);

  /**
   * IDで問題を取得する
   */
  const getQuestion = useCallback((id: string): Question | undefined => {
    try {
      return getQuestionById(id);
    } catch (error) {
      setState((prev: QuestionState) => ({
        ...prev,
        error: error instanceof Error ? error.message : '問題の取得に失敗しました'
      }));
      return undefined;
    }
  }, []);

  /**
   * 現在の問題を設定する
   */
  const setCurrentQuestion = useCallback((question: Question | undefined) => {
    setState((prev: QuestionState) => ({
      ...prev,
      currentQuestion: question
    }));
  }, []);

  /**
   * ランダムな問題を取得する
   */
  const getRandomQuestion = useCallback((): Question | undefined => {
    if (state.questions.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * state.questions.length);
    const randomQuestion = state.questions[randomIndex];
    setCurrentQuestion(randomQuestion);
    return randomQuestion;
  }, [state.questions, setCurrentQuestion]);

    /**
   * カテゴリで問題をフィルタリングする
   */
  const getQuestionsByCategory = useCallback((category: string): Question[] => {
    return state.questions.filter((q: Question) => q.category === category);
  }, [state.questions]);

  /**
   * タグで問題をフィルタリングする
   */
  const getQuestionsByTag = useCallback((tag: string): Question[] => {
    return state.questions.filter((q: Question) => q.tags?.includes(tag));
  }, [state.questions]);

  /**
   * 難易度で問題をフィルタリングする
   */
  const getQuestionsByDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
    return state.questions.filter((q: Question) => q.difficulty === difficulty);
  }, [state.questions]);

  /**
   * キーワードで問題を検索する
   */
  const searchQuestions = useCallback((keyword: string): Question[] => {
    const lowerKeyword = keyword.toLowerCase();
    return state.questions.filter((q: Question) =>
      q.question.toLowerCase().includes(lowerKeyword) ||
      q.answer.toLowerCase().includes(lowerKeyword) ||
      q.explanation.toLowerCase().includes(lowerKeyword) ||
      q.category?.toLowerCase().includes(lowerKeyword) ||
      q.tags?.some((tag: string) => tag.toLowerCase().includes(lowerKeyword))
    );
  }, [state.questions]);

  /**
   * 全ての問題を削除する
   */
  const clearAllQuestions = useCallback(async () => {
    setState((prev: QuestionState) => ({ ...prev, loading: true, error: null }));

    try {
      clearQuestions();
      setState((prev: QuestionState) => ({
        ...prev,
        questions: [],
        currentQuestion: undefined,
        loading: false
      }));
    } catch (error) {
      setState((prev: QuestionState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '問題の削除に失敗しました'
      }));
      throw error;
    }
  }, []);

  /**
   * 問題をJSONファイルにエクスポートする
   */
  const exportToJSON = useCallback(async (filename?: string) => {
    setState((prev: QuestionState) => ({ ...prev, loading: true, error: null }));

    try {
      exportQuestionsToJSON(state.questions, filename);
      setState((prev: QuestionState) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev: QuestionState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'エクスポートに失敗しました'
      }));
      throw error;
    }
  }, [state.questions]);

  /**
   * JSONファイルから問題をインポートする
   */
  const importFromJSON = useCallback(async (file: File, mergeMode: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const importedQuestions = await importQuestionsFromJSON(file);

      const newQuestions = mergeMode
        ? [...state.questions, ...importedQuestions]
        : importedQuestions;

      saveQuestions(newQuestions);

      setState(prev => ({
        ...prev,
        questions: newQuestions,
        loading: false
      }));

      return importedQuestions;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'インポートに失敗しました'
      }));
      throw error;
    }
  }, [state.questions]);

  /**
   * CSVファイルから問題をインポートする
   */
  const importFromCSV = useCallback(async (file: File, mergeMode: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const importedQuestions = await importQuestionsFromCSV(file);

      const newQuestions = mergeMode
        ? [...state.questions, ...importedQuestions]
        : importedQuestions;

      saveQuestions(newQuestions);

      setState(prev => ({
        ...prev,
        questions: newQuestions,
        loading: false
      }));

      return importedQuestions;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'インポートに失敗しました'
      }));
      throw error;
    }
  }, [state.questions]);

  /**
   * エラーをクリアする
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * 統計情報を取得する
   */
  const getStatistics = useCallback(() => {
    const total = state.questions.length;
    const categories = [...new Set(state.questions.map(q => q.category).filter(Boolean))];
    const tags = [...new Set(state.questions.flatMap(q => q.tags || []))];
    const difficulties = {
      easy: state.questions.filter(q => q.difficulty === 'easy').length,
      medium: state.questions.filter(q => q.difficulty === 'medium').length,
      hard: state.questions.filter(q => q.difficulty === 'hard').length,
      unspecified: state.questions.filter(q => !q.difficulty).length
    };

    return {
      total,
      categories: categories.length,
      tags: tags.length,
      difficulties,
      categoriesList: categories,
      tagsList: tags
    };
  }, [state.questions]);

  return {
    // 状態
    questions: state.questions,
    currentQuestion: state.currentQuestion,
    loading: state.loading,
    error: state.error,

    // CRUD操作
    createQuestion,
    updateQuestion,
    removeQuestion,
    getQuestion,
    clearAllQuestions,

    // 検索・フィルタリング
    searchQuestions,
    getQuestionsByCategory,
    getQuestionsByTag,
    getQuestionsByDifficulty,

    // ナビゲーション
    setCurrentQuestion,
    getRandomQuestion,

    // ファイル操作
    exportToJSON,
    importFromJSON,
    importFromCSV,

    // ユーティリティ
    loadQuestions,
    clearError,
    getStatistics
  };
};
