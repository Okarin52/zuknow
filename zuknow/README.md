# ZuKnow 📚

**知識を蓄積し、クイズで学習を深める個人用学習アプリ**

ZuKnowは、React + TypeScript + Viteで構築された、知識管理とクイズ学習のためのWebアプリケーションです。学習したことを問題として保存し、クイズ形式で復習することで効率的な学習を支援します。

## ✨ 主な機能

### 📝 問題管理
- **CRUD操作**: 問題の作成、表示、編集、削除
- **詳細な検索・フィルタリング**: 問題文、答え、解説からの全文検索
- **カテゴリ・タグ管理**: 問題の整理と分類
- **難易度設定**: 初級・中級・上級の3段階

### 🎯 クイズ機能
- **ランダム問題選択**: 登録した問題からランダムに出題
- **即座の正誤判定**: 回答後すぐに結果表示
- **詳細な解説表示**: 学習効果を高める解説機能

### 💾 データ管理
- **ローカルストレージ**: ブラウザ上でのデータ永続化
- **JSON/CSVエクスポート**: データのバックアップ
- **JSON/CSVインポート**: 既存データの読み込み

### 📊 学習統計
- **総問題数・カテゴリ数・タグ数の表示**
- **難易度別の内訳表示**
- **学習進捗の可視化**

## 🛠️ 技術スタック

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Zustand
- **Styling**: CSS Modules + モダンなグラデーション
- **Data Storage**: Browser LocalStorage

## 🚀 セットアップ・開発手順

### 前提条件
- Node.js 18+
- npm または yarn

### インストール
```bash
# リポジトリをクローン
git clone <repository-url>
cd zuknow

# 依存関係をインストール
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```
ブラウザで http://localhost:5173 にアクセス

### ビルド
```bash
# プロダクション用ビルド
npm run build

# プレビュー
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 プロジェクト構造

```
src/
├── components/          # 共通コンポーネント
│   ├── Navigation.tsx   # ナビゲーションメニュー
│   ├── QuestionCard.tsx # 問題表示カード
│   └── AnswerForm.tsx   # 回答入力フォーム
├── pages/               # ページコンポーネント
│   ├── Home.tsx         # ホームページ
│   ├── Quiz.tsx         # クイズページ
│   ├── Explanation.tsx  # 解説ページ
│   ├── List.tsx         # 問題一覧ページ
│   └── EditQuestion.tsx # 問題編集ページ
├── stores/              # Zustand状態管理
│   └── questionsStore.ts
├── types/               # TypeScript型定義
│   └── Question.ts
├── utils/               # ユーティリティ関数
│   ├── localStorage.ts  # ローカルストレージ操作
│   └── fileOperations.ts # ファイル入出力
└── hooks/               # カスタムフック
    └── useQuestions.ts
```

## 📱 使用方法

1. **問題作成**: 「問題作成」ページで新しい問題を追加
2. **問題管理**: 「問題一覧」で検索・フィルタリング・編集・削除
3. **クイズ挑戦**: 「クイズ」ページでランダムな問題に挑戦
4. **学習復習**: 「解説」ページで詳細な説明を確認
5. **データ管理**: JSON/CSV形式でのインポート・エクスポート

## 🎨 デザイン特徴

- **モダンなUI**: グラデーションとアニメーションを活用
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **直感的な操作**: わかりやすいアイコンと日本語ラベル
- **ダークモード**: 目に優しい配色設計

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

バグ報告や機能提案はIssueでお知らせください。プルリクエストも歓迎します。
