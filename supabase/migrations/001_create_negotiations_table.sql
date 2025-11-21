-- SalesFlow Japan用のnegotiationsテーブルを作成

-- negotiationsテーブル
CREATE TABLE IF NOT EXISTS negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('リード', '初回接触', '提案中', '交渉中', '受注', '失注')),
  next_action_date DATE,
  next_action_detail TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- negotiationsテーブルにトリガーを設定
CREATE TRIGGER update_negotiations_updated_at
  BEFORE UPDATE ON negotiations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
CREATE INDEX IF NOT EXISTS idx_negotiations_client ON negotiations(client);
CREATE INDEX IF NOT EXISTS idx_negotiations_date ON negotiations(date DESC);
CREATE INDEX IF NOT EXISTS idx_negotiations_created_at ON negotiations(created_at DESC);

-- Row Level Security (RLS)の有効化
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;

-- 全てのユーザーが全てのnegotiationsを読み取れるポリシー（開発用）
-- 本番環境では認証されたユーザーのみアクセス可能に変更してください
CREATE POLICY "Enable read access for all users" ON negotiations
  FOR SELECT USING (true);

-- 全てのユーザーがnegotiationsを挿入できるポリシー（開発用）
CREATE POLICY "Enable insert access for all users" ON negotiations
  FOR INSERT WITH CHECK (true);

-- 全てのユーザーがnegotiationsを更新できるポリシー（開発用）
CREATE POLICY "Enable update access for all users" ON negotiations
  FOR UPDATE USING (true);

-- 全てのユーザーがnegotiationsを削除できるポリシー（開発用）
CREATE POLICY "Enable delete access for all users" ON negotiations
  FOR DELETE USING (true);

-- サンプルデータの挿入
INSERT INTO negotiations (title, client, date, description, amount, status, next_action_date, next_action_detail, created_at, updated_at)
VALUES
  ('新規ECサイト構築', '株式会社テックソリューション', '2025-03-15', '既存システムのリプレイス提案。React + Node.jsでのフルスタック開発を提案中。予算感は500万円程度。', 5000000, '提案中', '2025-03-25', '詳細な見積もりを提出し、技術選定の理由を説明する', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('CRMシステム導入支援', '山田商事株式会社', '2025-03-10', '営業チームの効率化を目的としたCRM導入。Salesforceをベースにカスタマイズ提案。', 3000000, '交渉中', '2025-03-20', 'カスタマイズ範囲の最終確認と契約書のレビュー', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('モバイルアプリ開発', '佐藤産業株式会社', '2025-02-28', '社内業務用のモバイルアプリ開発。iOS/Android両対応。Flutter での開発を提案。', 8000000, '受注', '2025-04-01', 'キックオフミーティングの実施と要件定義開始', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('データ分析基盤構築', '株式会社データドリブン', '2025-03-18', 'BIツールの導入とデータウェアハウスの構築。初回ヒアリング完了。', 6000000, '初回接触', '2025-03-28', '要件定義のための2回目のミーティングを設定', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('セキュリティ診断サービス', '鈴木エンタープライズ', '2025-03-05', 'Webアプリケーションの脆弱性診断。予算の都合で見送りとなった。', 1500000, '失注', NULL, NULL, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),
  ('マーケティングオートメーション', '田中マーケティング株式会社', '2025-03-20', 'MAツールの導入検討。HubSpotまたはMarketoを提案予定。現在は情報収集フェーズ。', 4000000, 'リード', '2025-03-30', '初回のオンラインデモを実施し、機能説明を行う', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');
