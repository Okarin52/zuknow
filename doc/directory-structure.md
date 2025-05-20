# ディレクトリ構造

```
zuknow/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## ディレクトリの説明

- `src/`: ソースコードのルートディレクトリ
  - `assets/`: 画像やフォントなどの静的ファイル
  - `components/`: 再利用可能なReactコンポーネント
  - `hooks/`: カスタムReactフック
  - `pages/`: ページコンポーネント
  - `stores/`: 状態管理関連のファイル
  - `types/`: TypeScriptの型定義
  - `utils/`: ユーティリティ関数
- `public/`: 静的ファイルの配置ディレクトリ
- `tests/`: テストファイル
- `node_modules/`: 依存パッケージ
