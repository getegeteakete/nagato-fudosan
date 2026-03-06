# Premium Real Estate

Premium Real Estate は、高級感のある不動産検索・管理プラットフォームです。賃貸・売買物件の検索、お気に入り機能、新着通知、オンライン査定、退去申請などの機能を提供します。

## 主な機能

### フロントエンド機能
- **物件検索**: 賃貸・売買物件の詳細検索とフィルタリング
- **お気に入り機能**: 気になる物件をお気に入りに保存
- **保存された検索条件**: よく使う検索条件を保存・再利用
- **新着通知**: 保存された検索条件に一致する新着物件の通知
- **オンライン売却査定**: 簡単な情報入力で査定額を算出
- **退去申請フォーム**: 入居者向けの退去申請システム
- **ユーザー認証**: ログイン・新規登録・マイページ
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

### バックエンド機能
- **RESTful API**: 物件管理、ユーザー管理、通知システム
- **認証・認可**: JWT ベースの認証システム
- **データベース**: PostgreSQL によるデータ管理
- **メール通知**: SendGrid による自動メール送信
- **ファイルアップロード**: 画像のアップロード・リサイズ機能
- **管理者ダッシュボード**: 物件・ユーザー・申請の管理

## 技術スタック

### フロントエンド
- **React 18** + **TypeScript** + **Vite**
- **shadcn/ui** (Radix UI + Tailwind CSS)
- **React Hook Form** + **Zod** バリデーション
- **TanStack Query** 状態管理
- **React Router DOM** ルーティング
- **Lucide React** アイコン

### バックエンド
- **Node.js** + **Express.js**
- **PostgreSQL** データベース
- **JWT** 認証
- **SendGrid** メール送信
- **Multer** + **Sharp** ファイルアップロード
- **Winston** ログ管理

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd premium-real-estate
```

### 2. フロントエンドのセットアップ
```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp env.example .env.local
# .env.local を編集してAPI URLなどを設定

# 開発サーバーの起動
npm run dev
```

### 3. バックエンドのセットアップ
```bash
cd backend

# 依存関係のインストール
npm install

# 環境変数の設定
cp ../env.example .env
# .env を編集してデータベース接続情報などを設定

# データベースのセットアップ
# PostgreSQL を起動し、database/schema.sql を実行

# 開発サーバーの起動
npm run dev
```

### 4. データベースの初期化
```bash
# PostgreSQL に接続してスキーマを実行
psql -U username -d premium_real_estate -f database/schema.sql
```

## 環境変数

### フロントエンド (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### バックエンド (.env)
```env
# データベース
DATABASE_URL=postgresql://username:password@localhost:5432/premium_real_estate

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# メール
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@premiumrealestate.com
ADMIN_EMAIL=admin@premiumrealestate.com

# ファイルアップロード
MAX_FILE_SIZE=10485760
```

## 利用可能なスクリプト

### フロントエンド
- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番用ビルド
- `npm run preview` - 本番ビルドのプレビュー
- `npm run lint` - ESLint 実行

### バックエンド
- `npm run dev` - 開発サーバー起動（nodemon）
- `npm start` - 本番サーバー起動
- `npm test` - テスト実行
- `npm run migrate` - データベースマイグレーション
- `npm run seed` - サンプルデータ投入

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/verify` - トークン検証

### 物件
- `GET /api/properties` - 物件一覧（検索機能付き）
- `GET /api/properties/:id` - 物件詳細
- `POST /api/properties` - 物件作成（管理者のみ）
- `PUT /api/properties/:id` - 物件更新（管理者のみ）
- `DELETE /api/properties/:id` - 物件削除（管理者のみ）

### お気に入り
- `GET /api/favorites` - お気に入り一覧
- `POST /api/favorites` - お気に入り追加
- `DELETE /api/favorites/:propertyId` - お気に入り削除

### その他
- `GET /api/saved-searches` - 保存された検索条件
- `GET /api/notifications` - 通知一覧
- `POST /api/valuation-requests` - 査定依頼
- `POST /api/moveout-requests` - 退去申請

## デプロイ

### フロントエンド
```bash
npm run build
# dist/ フォルダを静的ホスティングサービスにデプロイ
```

### バックエンド
```bash
npm start
# PM2 や Docker を使用してプロダクション環境にデプロイ
```

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

質問やサポートが必要な場合は、[Issues](https://github.com/your-repo/issues) でお知らせください。