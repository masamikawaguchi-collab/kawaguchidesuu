import { supabase } from './supabaseClient';
import type { Negotiation } from '../types';
import type { Database } from '../types/database';

type NegotiationRow = Database['public']['Tables']['negotiations']['Row'];
type NegotiationInsert = Database['public']['Tables']['negotiations']['Insert'];
type NegotiationUpdate = Database['public']['Tables']['negotiations']['Update'];

// データベースの行をアプリケーションのNegotiation型に変換
function mapRowToNegotiation(row: NegotiationRow): Negotiation {
  return {
    id: row.id,
    title: row.title,
    client: row.client,
    date: row.date,
    description: row.description,
    amount: Number(row.amount),
    status: row.status,
    nextActionDate: row.next_action_date || '',
    nextActionDetail: row.next_action_detail || '',
    attachmentUrl: row.attachment_url || null,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

// アプリケーションのNegotiation型をデータベース挿入用に変換
function mapNegotiationToInsert(negotiation: Omit<Negotiation, 'id' | 'createdAt' | 'updatedAt'>): NegotiationInsert {
  return {
    title: negotiation.title,
    client: negotiation.client,
    date: negotiation.date,
    description: negotiation.description,
    amount: negotiation.amount,
    status: negotiation.status,
    next_action_date: negotiation.nextActionDate || null,
    next_action_detail: negotiation.nextActionDetail || null,
    attachment_url: negotiation.attachmentUrl || null,
  };
}

// アプリケーションのNegotiation型をデータベース更新用に変換
function mapNegotiationToUpdate(negotiation: Partial<Negotiation>): NegotiationUpdate {
  const update: NegotiationUpdate = {};

  if (negotiation.title !== undefined) update.title = negotiation.title;
  if (negotiation.client !== undefined) update.client = negotiation.client;
  if (negotiation.date !== undefined) update.date = negotiation.date;
  if (negotiation.description !== undefined) update.description = negotiation.description;
  if (negotiation.amount !== undefined) update.amount = negotiation.amount;
  if (negotiation.status !== undefined) update.status = negotiation.status;
  if (negotiation.nextActionDate !== undefined) {
    update.next_action_date = negotiation.nextActionDate || null;
  }
  if (negotiation.nextActionDetail !== undefined) {
    update.next_action_detail = negotiation.nextActionDetail || null;
  }
  if (negotiation.attachmentUrl !== undefined) {
    update.attachment_url = negotiation.attachmentUrl || null;
  }

  return update;
}

/**
 * 全ての商談を取得
 */
export async function getAllNegotiations(): Promise<Negotiation[]> {
  const { data, error } = await supabase
    .from('negotiations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching negotiations:', error);
    throw new Error(`商談の取得に失敗しました: ${error.message}`);
  }

  return (data || []).map(mapRowToNegotiation);
}

/**
 * IDで商談を取得
 */
export async function getNegotiationById(id: string): Promise<Negotiation | null> {
  const { data, error } = await supabase
    .from('negotiations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching negotiation:', error);
    throw new Error(`商談の取得に失敗しました: ${error.message}`);
  }

  return data ? mapRowToNegotiation(data) : null;
}

/**
 * 新しい商談を作成
 */
export async function createNegotiation(
  negotiation: Omit<Negotiation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Negotiation> {
  const insertData = mapNegotiationToInsert(negotiation);

  const { data, error } = await supabase
    .from('negotiations')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating negotiation:', error);
    throw new Error(`商談の作成に失敗しました: ${error.message}`);
  }

  return mapRowToNegotiation(data as NegotiationRow);
}

/**
 * 商談を更新
 */
export async function updateNegotiation(
  id: string,
  updates: Partial<Negotiation>
): Promise<Negotiation> {
  const updateData = mapNegotiationToUpdate(updates);

  const { data, error } = await supabase
    .from('negotiations')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating negotiation:', error);
    throw new Error(`商談の更新に失敗しました: ${error.message}`);
  }

  return mapRowToNegotiation(data as NegotiationRow);
}

/**
 * 商談を削除
 */
export async function deleteNegotiation(id: string): Promise<void> {
  const { error } = await supabase
    .from('negotiations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting negotiation:', error);
    throw new Error(`商談の削除に失敗しました: ${error.message}`);
  }
}

/**
 * ステータスで商談を検索
 */
export async function getNegotiationsByStatus(status: string): Promise<Negotiation[]> {
  const { data, error } = await supabase
    .from('negotiations')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching negotiations by status:', error);
    throw new Error(`商談の取得に失敗しました: ${error.message}`);
  }

  return (data || []).map(mapRowToNegotiation);
}

/**
 * クライアント名で商談を検索
 */
export async function getNegotiationsByClient(client: string): Promise<Negotiation[]> {
  const { data, error } = await supabase
    .from('negotiations')
    .select('*')
    .ilike('client', `%${client}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching negotiations by client:', error);
    throw new Error(`商談の取得に失敗しました: ${error.message}`);
  }

  return (data || []).map(mapRowToNegotiation);
}

/**
 * キーワードで商談を検索（タイトルまたは説明文）
 */
export async function searchNegotiations(keyword: string): Promise<Negotiation[]> {
  const { data, error } = await supabase
    .from('negotiations')
    .select('*')
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching negotiations:', error);
    throw new Error(`商談の検索に失敗しました: ${error.message}`);
  }

  return (data || []).map(mapRowToNegotiation);
}

/**
 * 月次の売上予測を取得（提案中、交渉中、受注のステータスの合計金額）
 */
export async function getMonthlyRevenueForecast(): Promise<number> {
  const { data, error } = await supabase
    .from('negotiations')
    .select('amount')
    .in('status', ['提案中', '交渉中', '受注']);

  if (error) {
    console.error('Error calculating revenue forecast:', error);
    throw new Error(`売上予測の計算に失敗しました: ${error.message}`);
  }

  return (data || []).reduce((sum, row) => sum + Number((row as any).amount), 0);
}

/**
 * 今月の受注件数を取得
 */
export async function getMonthlyWonCount(): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { count, error } = await supabase
    .from('negotiations')
    .select('*', { count: 'exact', head: true })
    .eq('status', '受注')
    .gte('date', startOfMonth.toISOString().split('T')[0])
    .lte('date', endOfMonth.toISOString().split('T')[0]);

  if (error) {
    console.error('Error counting monthly wins:', error);
    throw new Error(`受注件数の取得に失敗しました: ${error.message}`);
  }

  return count || 0;
}

/**
 * ステータスごとの商談数を取得
 */
export async function getNegotiationCountByStatus(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('negotiations')
    .select('status');

  if (error) {
    console.error('Error counting negotiations by status:', error);
    throw new Error(`ステータス別の商談数取得に失敗しました: ${error.message}`);
  }

  const counts: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    counts[row.status] = (counts[row.status] || 0) + 1;
  });

  return counts;
}
