# SalesFlow Japan

営業交渉管理プラットフォーム - AI搭載の営業支援システム

## 概要

SalesFlow Japanは、日本の営業チーム向けに設計された商談管理プラットフォームです。Supabase（PostgreSQL）をバックエンドデータベースとして使用し、Google Gemini AIを活用して営業活動を効率化します。

## 主な機能

- **ダッシュボード**: KPI、売上予測、商談ステータスの可視化
- **商談管理**: 商談の作成、編集、検索、フィルタリング
- **AI機能**:
  - 商談内容の文章整形
  - 次のアクション提案
- **データエクスポート**: CSV形式でのデータエクスポート
- **リアルタイム同期**: Supabaseによるデータベース統合

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite
- **バックエンド**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **AI統合**: Google Gemini API
- **チャート**: Recharts
- **アイコン**: Lucide React

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd kawaguchidesuu
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseプロジェクトのセットアップ

#### 3.1 Supabaseアカウントの作成

1. [Supabase](https://supabase.com/)にアクセス
2. アカウントを作成（まだの場合）
3. 新しいプロジェクトを作成

#### 3.2 データベースのセットアップ

1. Supabaseダッシュボードで、**SQL Editor**を開く
2. `supabase/migrations/001_create_negotiations_table.sql`の内容をコピー
3. SQL Editorに貼り付けて実行

これにより以下が作成されます：
- `negotiations`テーブル
- 自動更新トリガー
- 検索用インデックス
- Row Level Security (RLS) ポリシー
- サンプルデータ（6件の商談）

#### 3.3 API認証情報の取得

1. Supabaseプロジェクト設定で、**Settings** → **API**を開く
2. 以下の値をコピー:
   - **Project URL** (例: `https://xxxxx.supabase.co`)
   - **anon/public key**

### 4. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成:

```bash
cp .env.example .env
```

`.env`ファイルを編集して、Supabaseの認証情報を設定:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Google Gemini APIキーの取得（オプション）

AI機能を使用する場合:

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを作成
3. `.env`ファイルの`GEMINI_API_KEY`に設定

### 6. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## データベーススキーマ

### negotiations テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー（自動生成） |
| title | TEXT | プロジェクト名 |
| client | TEXT | 顧客名 |
| date | DATE | 商談日 |
| description | TEXT | 詳細な説明 |
| amount | DECIMAL | 金額（円） |
| status | TEXT | ステータス |
| next_action_date | DATE | 次のアクション日 |
| next_action_detail | TEXT | 次のアクション詳細 |
| attachment_url | TEXT | 添付ファイルURL |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### ステータス値

- **リード**: 初期見込み客
- **初回接触**: 初回コンタクト済み
- **提案中**: 提案書提出済み
- **交渉中**: 商談進行中
- **受注**: 成約
- **失注**: 不成約

## プロジェクト構造

```
kawaguchidesuu/
├── components/           # Reactコンポーネント
│   ├── Button.tsx       # ボタンコンポーネント
│   ├── Dashboard.tsx    # ダッシュボード
│   ├── Layout.tsx       # レイアウト
│   ├── NegotiationForm.tsx   # 商談フォーム
│   └── NegotiationList.tsx   # 商談一覧
├── services/            # サービス層
│   ├── geminiService.ts      # Gemini AI統合
│   ├── negotiationService.ts # 商談CRUD操作
│   └── supabaseClient.ts     # Supabaseクライアント
├── types/               # TypeScript型定義
│   └── database.ts      # データベース型定義
├── supabase/            # Supabaseマイグレーション
│   └── migrations/      # SQLマイグレーションファイル
├── App.tsx              # メインアプリケーション
├── types.ts             # アプリケーション型定義
└── constants.ts         # 定数定義
```

## 使用方法

### 商談の作成

1. サイドバーから「新規登録」をクリック
2. フォームに商談情報を入力
3. 「保存」をクリック

### 商談の編集

1. 「商談一覧」から編集したい商談を選択
2. 「編集」ボタンをクリック
3. 情報を更新して「保存」

### AI機能の使用

- **文章整形**: 「AIで文章を整える」ボタンをクリックして、説明文を自動で改善
- **次のアクション提案**: 「AIに提案してもらう」ボタンで、次のアクションを自動提案

### データのエクスポート

商談一覧画面で「CSVエクスポート」ボタンをクリックして、データをダウンロード

## ビルド

本番環境用のビルド:

```bash
npm run build
```

ビルドされたファイルは`dist/`ディレクトリに出力されます。

## セキュリティに関する注意

現在のRow Level Security (RLS) ポリシーは開発用に全てのアクセスを許可しています。本番環境にデプロイする前に、以下を実装してください：

1. **認証の追加**: Supabase Authを使用したユーザー認証
2. **RLSポリシーの更新**: 認証されたユーザーのみがデータにアクセスできるように変更
3. **環境変数の保護**: 本番環境の環境変数を適切に管理

## ライセンス

MIT

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
