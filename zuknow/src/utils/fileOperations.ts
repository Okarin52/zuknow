import { Question, QuestionInput } from '../types/Question';

/**
 * 問題データをJSONファイルとしてエクスポートする
 * @param questions エクスポートする問題の配列
 * @param filename ファイル名（省略時は自動生成）
 */
export const exportQuestionsToJSON = (
  questions: Question[],
  filename?: string
): void => {
  try {
    // 日付を適切な形式に変換してJSONに含める
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalQuestions: questions.length
      },
      questions: questions.map(question => ({
        ...question,
        createdAt: question.createdAt.toISOString(),
        updatedAt: question.updatedAt.toISOString()
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const defaultFilename = `zuknow_questions_${new Date().toISOString().split('T')[0]}.json`;
    const finalFilename = filename || defaultFilename;

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`${questions.length}個の問題を${finalFilename}にエクスポートしました`);
  } catch (error) {
    console.error('ファイルのエクスポートに失敗しました:', error);
    throw new Error('ファイルのエクスポートに失敗しました');
  }
};

/**
 * JSONファイルから問題データをインポートする
 * @param file インポートするJSONファイル
 * @returns Promise<Question[]> インポートされた問題の配列
 */
export const importQuestionsFromJSON = (file: File): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    try {
      // ファイルタイプの検証
      if (!file.type.includes('json') && !file.name.endsWith('.json')) {
        throw new Error('JSONファイルを選択してください');
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result !== 'string') {
            throw new Error('ファイルの読み取りに失敗しました');
          }

          const data = JSON.parse(result);

          // データ形式の検証
          const questions = validateAndParseQuestions(data);
          console.log(`${questions.length}個の問題をインポートしました`);
          resolve(questions);
        } catch (parseError) {
          console.error('JSONの解析に失敗しました:', parseError);
          reject(new Error('JSONファイルの形式が正しくありません'));
        }
      };

      reader.onerror = () => {
        console.error('ファイルの読み取りに失敗しました');
        reject(new Error('ファイルの読み取りに失敗しました'));
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('ファイルのインポートに失敗しました:', error);
      reject(error);
    }
  });
};

/**
 * インポートされたデータを検証し、Question型に変換する
 * @param data インポートされたJSONデータ
 * @returns Question[] 検証済みの問題配列
 */
const validateAndParseQuestions = (data: any): Question[] => {
  // 新しい形式（メタデータ付き）かどうかをチェック
  const questionsArray = data.questions ? data.questions : data;

  if (!Array.isArray(questionsArray)) {
    throw new Error('問題データが配列形式ではありません');
  }

  return questionsArray.map((item: any, index: number) => {
    try {
      // 必須フィールドの検証
      if (!item.id || typeof item.id !== 'string') {
        throw new Error(`問題${index + 1}: IDが無効です`);
      }
      if (!item.question || typeof item.question !== 'string') {
        throw new Error(`問題${index + 1}: 問題文が無効です`);
      }
      if (!item.answer || typeof item.answer !== 'string') {
        throw new Error(`問題${index + 1}: 回答が無効です`);
      }
      if (!item.explanation || typeof item.explanation !== 'string') {
        throw new Error(`問題${index + 1}: 解説が無効です`);
      }

      // 日付の変換
      const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
      const updatedAt = item.updatedAt ? new Date(item.updatedAt) : new Date();

      if (isNaN(createdAt.getTime())) {
        throw new Error(`問題${index + 1}: 作成日時が無効です`);
      }
      if (isNaN(updatedAt.getTime())) {
        throw new Error(`問題${index + 1}: 更新日時が無効です`);
      }

      // difficulty の検証
      if (item.difficulty && !['easy', 'medium', 'hard'].includes(item.difficulty)) {
        throw new Error(`問題${index + 1}: 難易度が無効です`);
      }

      // tags の検証
      if (item.tags && !Array.isArray(item.tags)) {
        throw new Error(`問題${index + 1}: タグが配列形式ではありません`);
      }

      return {
        id: item.id,
        question: item.question,
        answer: item.answer,
        explanation: item.explanation,
        category: item.category || undefined,
        tags: item.tags || undefined,
        difficulty: item.difficulty || undefined,
        createdAt,
        updatedAt
      } as Question;
    } catch (error) {
      throw new Error(`問題${index + 1}の検証に失敗しました: ${error}`);
    }
  });
};

/**
 * QuestionInputからQuestionを生成する
 * @param input QuestionInput型のデータ
 * @returns Question型のデータ
 */
export const createQuestionFromInput = (input: QuestionInput): Question => {
  const now = new Date();
  return {
    id: generateQuestionId(),
    ...input,
    createdAt: now,
    updatedAt: now
  };
};

/**
 * 一意のIDを生成する
 * @returns 生成されたID
 */
const generateQuestionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `q_${timestamp}_${randomPart}`;
};

/**
 * ファイルサイズを人間が読みやすい形式に変換する
 * @param bytes バイト数
 * @returns フォーマットされたサイズ文字列
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * CSVファイルから問題データをインポートする（基本実装）
 * @param file インポートするCSVファイル
 * @returns Promise<Question[]> インポートされた問題の配列
 */
export const importQuestionsFromCSV = (file: File): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    try {
      // file.typeはMIMEタイプを表し、file.nameは実際のファイル名を表します
      // MIMEタイプが'csv'を含まない AND ファイル名が'.csv'で終わらない場合、
      // CSVファイルではないと判断します
      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        throw new Error('CSVファイルを選択してください');
      }

      // FileReaderはファイルの内容を非同期で読み込むためのAPIです
      // CSVファイルをテキストとして読み込み、その内容を文字列として取得します
      // reader.onload: ファイル読み込み完了時のコールバック
      // reader.onerror: エラー発生時のコールバック
      // reader.readAsText(): ファイルの読み込みを開始
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result !== 'string') {
            throw new Error('ファイルの読み取りに失敗しました');
          }

          const questions = parseCSVToQuestions(result);
          console.log(`${questions.length}個の問題をCSVからインポートしました`);
          resolve(questions);
        } catch (parseError) {
          console.error('CSVの解析に失敗しました:', parseError);
          reject(new Error('CSVファイルの形式が正しくありません'));
        }
      };

      reader.onerror = () => {
        console.error('ファイルの読み取りに失敗しました');
        reject(new Error('ファイルの読み取りに失敗しました'));
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('CSVファイルのインポートに失敗しました:', error);
      reject(error);
    }
  });
};

/**
 * CSV文字列をQuestion配列に変換する
 * @param csvContent CSV文字列
 * @returns Question[] 変換された問題配列
 */
const parseCSVToQuestions = (csvContent: string): Question[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSVファイルにデータが含まれていません');
  }

  // ヘッダー行を解析
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));

  // 必須列の確認
  const requiredColumns = ['question', 'answer', 'explanation'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(`必須列が不足しています: ${missingColumns.join(', ')}`);
  }

  // データ行を処理
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''));

    if (values.length !== headers.length) {
      throw new Error(`行${index + 2}: 列数が一致しません`);
    }

    const questionData: any = {};
    headers.forEach((header, i) => {
      questionData[header] = values[i];
    });

    return createQuestionFromInput({
      question: questionData.question,
      answer: questionData.answer,
      explanation: questionData.explanation,
      category: questionData.category || undefined,
      tags: questionData.tags ? questionData.tags.split(';') : undefined,
      difficulty: questionData.difficulty && ['easy', 'medium', 'hard'].includes(questionData.difficulty)
        ? questionData.difficulty as 'easy' | 'medium' | 'hard'
        : undefined
    });
  });
};
