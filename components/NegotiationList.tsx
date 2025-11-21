import React, { useState, useMemo } from 'react';
import { Negotiation, NegotiationStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { Button } from './Button';
import { Search, Download, Filter, Edit, Eye } from 'lucide-react';

interface NegotiationListProps {
  negotiations: Negotiation[];
  onEdit: (negotiation: Negotiation) => void;
}

export const NegotiationList: React.FC<NegotiationListProps> = ({ negotiations, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState('');

  // Filter Logic
  const filteredData = useMemo(() => {
    return negotiations.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClient = item.client.toLowerCase().includes(clientFilter.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [negotiations, searchTerm, statusFilter, clientFilter]);

  const handleExportCSV = () => {
    const headers = ['ID', '案件名', '顧客名', '商談日', '金額', 'ステータス', '次回アクション'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        [row.id, row.title, row.client, row.date, row.amount, row.status, row.nextActionDetail]
        .map(val => `"${val}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `negotiations_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">商談一覧</h2>
          <p className="text-gray-500">登録された商談の検索・管理</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
          CSV出力
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="キーワード検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="顧客名で絞り込み"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">全てのステータス</option>
              {(['リード', '初回接触', '提案中', '交渉中', '受注', '失注'] as NegotiationStatus[]).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">商談日</th>
                <th className="px-6 py-4 font-semibold text-gray-700">案件名 / 顧客名</th>
                <th className="px-6 py-4 font-semibold text-gray-700">金額</th>
                <th className="px-6 py-4 font-semibold text-gray-700">ステータス</th>
                <th className="px-6 py-4 font-semibold text-gray-700">次回アクション</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    該当するデータがありません
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-gray-500 text-xs mt-1">{item.client}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ¥{item.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="text-xs mb-1 text-blue-600">{item.nextActionDate}</div>
                      <div className="truncate max-w-xs">{item.nextActionDetail}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(item)}
                        icon={<Edit className="w-4 h-4" />}
                      >
                        編集
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};