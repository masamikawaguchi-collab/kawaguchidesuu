import React, { useState, useEffect } from 'react';
import { Negotiation, NegotiationFormData, NegotiationStatus } from '../types';
import { Button } from './Button';
import { polishDescription, suggestNextAction } from '../services/geminiService';
import { Save, X, Wand2, Loader2, Calendar } from 'lucide-react';

interface NegotiationFormProps {
  initialData?: Negotiation;
  onSave: (data: NegotiationFormData) => void;
  onCancel: () => void;
}

export const NegotiationForm: React.FC<NegotiationFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<NegotiationFormData>({
    title: '',
    client: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: 0,
    status: NegotiationStatus.LEAD,
    nextActionDate: '',
    nextActionDetail: '',
    attachmentUrl: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'POLISH' | 'SUGGEST' | null>(null);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...rest } = initialData;
      setFormData({ ...rest, id });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = '案件名は必須です';
    if (!formData.client) newErrors.client = '顧客名は必須です';
    if (!formData.date) newErrors.date = '商談日は必須です';
    if (formData.amount < 0) newErrors.amount = '金額は0以上で入力してください';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  // Gemini AI Interactions
  const handleAiPolish = async () => {
    if (!formData.description) return;
    setIsAiLoading(true);
    setAiMode('POLISH');
    try {
      const polished = await polishDescription(formData.description);
      setFormData(prev => ({ ...prev, description: polished }));
    } finally {
      setIsAiLoading(false);
      setAiMode(null);
    }
  };

  const handleAiSuggestNext = async () => {
    if (!formData.description) return;
    setIsAiLoading(true);
    setAiMode('SUGGEST');
    try {
      const suggestion = await suggestNextAction(formData.description, formData.status);
      // Default next action date to 1 week from today if not set
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setFormData(prev => ({ 
        ...prev, 
        nextActionDetail: suggestion,
        nextActionDate: prev.nextActionDate || nextWeek.toISOString().slice(0, 10)
      }));
    } finally {
      setIsAiLoading(false);
      setAiMode(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? '商談編集' : '新規商談登録'}
          </h2>
          <p className="text-gray-500">商談の詳細情報を入力してください</p>
        </div>
        <Button variant="secondary" onClick={onCancel} icon={<X className="w-4 h-4"/>}>
          キャンセル
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">案件名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="例: AIソリューション導入"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
          </div>

          {/* Client */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">顧客名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="client"
              value={formData.client}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.client ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="例: 株式会社〇〇"
            />
            {errors.client && <p className="text-red-500 text-xs">{errors.client}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">商談日 <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">金額 (円)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ステータス</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Object.values(NegotiationStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description with AI Polish */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">商談内容詳細</label>
            <button
              type="button"
              onClick={handleAiPolish}
              disabled={isAiLoading || !formData.description}
              className="text-xs flex items-center text-purple-600 hover:text-purple-800 disabled:opacity-50"
            >
              {isAiLoading && aiMode === 'POLISH' ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Wand2 className="w-3 h-3 mr-1"/>}
              AIで文章を整える
            </button>
          </div>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="商談の具体的な内容を入力..."
          />
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-800">次回アクション</h3>
            <button
              type="button"
              onClick={handleAiSuggestNext}
              disabled={isAiLoading || !formData.description}
              className="text-xs flex items-center text-purple-600 hover:text-purple-800 disabled:opacity-50"
            >
              {isAiLoading && aiMode === 'SUGGEST' ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Wand2 className="w-3 h-3 mr-1"/>}
              AIに提案してもらう
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">次回アクション日</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="nextActionDate"
                  value={formData.nextActionDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">アクション内容</label>
              <input
                type="text"
                name="nextActionDetail"
                value={formData.nextActionDetail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="例: お見積書の提出"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4"/>}>
            保存する
          </Button>
        </div>
      </form>
    </div>
  );
};