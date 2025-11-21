export enum NegotiationStatus {
  LEAD = 'リード',
  CONTACTED = '初回接触',
  PROPOSAL = '提案中',
  NEGOTIATION = '交渉中',
  CLOSED_WON = '受注',
  CLOSED_LOST = '失注'
}

export interface Negotiation {
  id: string;
  title: string;
  client: string;
  date: string; // ISO Date string YYYY-MM-DD
  description: string;
  amount: number;
  status: NegotiationStatus;
  nextActionDate: string; // ISO Date string YYYY-MM-DD
  nextActionDetail: string;
  attachmentUrl?: string | null;
  createdAt: number;
  updatedAt: number;
}

export type ViewState = 'DASHBOARD' | 'LIST' | 'FORM';

export interface NegotiationFormData extends Omit<Negotiation, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}