import { Question } from '../types/Question';

const STORAGE_KEY = 'zuknow_questions';

/**
 * 問題をローカルストレージに保存する
 * @param questions 保存する問題の配列
 */
/**
 * saveQuestions関数の解説:
 *
 * 1. 機能:
 * - Question型の配列を受け取り、ローカルストレージに保存する関数です
 * - STORAGE_KEY ('zuknow_questions') をキーとして使用します
 *
 * 2. 引数:
 * - questions: Question[]型の配列
 * - 保存したい問題データの配列を受け取ります
 *
 * 3. 処理の流れ:
 * - JSON.stringify()で配列をJSON文字列に変換
 * - localStorage.setItem()でブラウザのローカルストレージに保存
 * - エラー発生時は適切なエラーハンドリングを実施
 *
 * 4. エラーハンドリング:
 * - try-catchでストレージ操作の例外を捕捉
 * - エラーログを出力し、エラーをスロー
 */
export const saveQuestions = (questions: Question[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (error) {
    console.error('問題の保存に失敗しました:', error);
    throw new Error('問題の保存に失敗しました');
  }
};

/**
 * ローカルストレージから問題を取得する
 * @returns 保存されている問題の配列
 */
/**
 * getQuestions関数の解説:
 *
 * 1. 機能:
 * - ローカルストレージから保存された問題データを取得する関数です
 * - STORAGE_KEYをキーとして使用してデータを取得します
 *
 * 2. 戻り値:
 * - Question[]型の配列を返します
 * - データが存在しない場合は空配列を返します
 *
 * 3. 処理の流れ:
 * - localStorage.getItem()でデータを文字列として取得
 * - データが存在しない場合は空配列を返す
 * - JSON.parse()で文字列をオブジェクトに変換
 * - 日付文字列をDate型に変換して返す
 *
 * 4. 日付の変換:
 * - createdAtとupdatedAtはJSON化の過程で文字列になっているため
 * - new Date()を使って正しいDate型のオブジェクトに変換
 *
 * 5. エラーハンドリング:
 * - try-catchでJSON解析やストレージ操作の例外を捕捉
 * - エラーログを出力し、エラーをスロー
 */
export const getQuestions = (): Question[] => {
  try {
    const questions = localStorage.getItem(STORAGE_KEY);
    if (!questions) return [];

    const parsedQuestions = JSON.parse(questions);
    // Date型に変換
    return parsedQuestions.map((q: any) => ({
      ...q,
      createdAt: new Date(q.createdAt),
      updatedAt: new Date(q.updatedAt)
    }));
  } catch (error) {
    console.error('問題の取得に失敗しました:', error);
    throw new Error('問題の取得に失敗しました');
  }
};

/**
 * 単一の問題を保存する
 * @param question 保存する問題
 */
export const saveQuestion = (question: Question): void => {
  try {
    const questions = getQuestions();
    const index = questions.findIndex(q => q.id === question.id);

    if (index !== -1) {
      questions[index] = question;
    } else {
      questions.push(question);
    }

    saveQuestions(questions);
  } catch (error) {
    console.error('問題の保存に失敗しました:', error);
    throw new Error('問題の保存に失敗しました');
  }
};

/**
 * IDを指定して問題を取得する
 * @param id 問題のID
 * @returns 指定されたIDの問題、存在しない場合はundefined
 */
export const getQuestionById = (id: string): Question | undefined => {
  try {
    const questions = getQuestions();
    return questions.find(q => q.id === id);
  } catch (error) {
    console.error('問題の取得に失敗しました:', error);
    throw new Error('問題の取得に失敗しました');
  }
};

/**
 * IDを指定して問題を削除する
 * @param id 削除する問題のID
 */
export const deleteQuestion = (id: string): void => {
  try {
    const questions = getQuestions();
    const filteredQuestions = questions.filter(q => q.id !== id);
    saveQuestions(filteredQuestions);
  } catch (error) {
    console.error('問題の削除に失敗しました:', error);
    throw new Error('問題の削除に失敗しました');
  }
};

/**
 * 全ての問題を削除する
 */
export const clearQuestions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('問題の削除に失敗しました:', error);
    throw new Error('問題の削除に失敗しました');
  }
};
