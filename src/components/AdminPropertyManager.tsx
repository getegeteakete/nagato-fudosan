import React, { useState, useEffect, useMemo } from 'react';
import { PROPERTIES } from '@/data/properties';
import { Property } from '@/types/database';
import {
  Eye, EyeOff, Trash2, Edit2, Send, X, Check, Search,
  Building2, Home, ChevronDown, ExternalLink, Mail, User,
  CheckSquare, Square, Filter, Plus
} from 'lucide-react';

// ── localStorage ──
const OVERRIDES_KEY = 'admin_prop_overrides'; // { [id]: { isHidden?, title?, price?, description? } }
const CUSTOM_KEY    = 'admin_custom_props';    // 新規追加物件[]

type Override = { isHidden?: boolean; title?: string; price?: number; description?: string };
type Overrides = Record<string, Override>;

const loadOverrides = (): Overrides => {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}'); } catch { return {}; }
};
const saveOverrides = (o: Overrides) => localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o));

// ── カード ──
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-[#ddd5c8] shadow-sm ${className}`}>{children}</div>
);

// ── 物件行コンポーネント ──
const PropertyRow = ({
  property, override, onToggleHide, onDelete, onEdit, onCheck, checked
}: {
  property: Property;
  override: Override;
  onToggleHide: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onCheck: () => void;
  checked: boolean;
}) => {
  const isHidden = override?.isHidden ?? false;
  const title    = override?.title ?? property.title;
  const price    = override?.price ?? property.price;
  const url      = `https://nagato-fudosan.vercel.app/property/${property.id}`;

  return (
    <tr className={`border-b border-[#f0ebe3] hover:bg-[#faf7f2] transition-colors ${isHidden ? 'opacity-50' : ''}`}>
      <td className="px-3 py-3">
        <button onClick={onCheck} className="text-[#8a6c3e]">
          {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-[#ccc]" />}
        </button>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {property.images?.[0] ? (
            <img src={property.images[0]} alt={title} className="w-12 h-10 object-cover rounded border border-[#e0d8cc] flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-12 h-10 bg-[#f0ebe3] rounded flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-[#ccc]" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#3d2e1e] truncate max-w-[180px]">{title}</p>
            <p className="text-xs text-[#999] truncate max-w-[180px]">{property.address}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-xs text-[#666]">
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
          property.type === 'rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>{property.type === 'rent' ? '賃貸' : '売買'}</span>
      </td>
      <td className="px-3 py-3 text-xs text-[#666]">{property.propertyType}</td>
      <td className="px-3 py-3 text-xs font-bold text-[#8a6c3e]">
        {property.type === 'rent'
          ? `¥${(property.rent || price).toLocaleString()}/月`
          : `¥${price.toLocaleString()}`}
      </td>
      <td className="px-3 py-3 text-xs text-[#666]">{property.area}㎡</td>
      <td className="px-3 py-3">
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
          isHidden ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
        }`}>{isHidden ? '非表示' : '表示中'}</span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <a href={url} target="_blank" rel="noreferrer"
            className="p-1.5 rounded hover:bg-[#f5f0e8] text-[#8a6c3e] transition-colors" title="物件ページを開く">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button onClick={onEdit}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors" title="編集">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onToggleHide}
            className={`p-1.5 rounded transition-colors ${isHidden ? 'hover:bg-green-50 text-green-600' : 'hover:bg-gray-100 text-gray-500'}`}
            title={isHidden ? '表示に戻す' : '非表示にする'}>
            {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors" title="削除">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ══════════════════════════
//  メインコンポーネント
// ══════════════════════════
const AdminPropertyManager: React.FC = () => {
  const [overrides, setOverrides] = useState<Overrides>(loadOverrides());
  const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<Override>({});
  const [showSend, setShowSend] = useState(false);
  const [sendForm, setSendForm] = useState({ name: '', email: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('admin_deleted_props') || '[]'))
  );

  const properties = useMemo(() =>
    PROPERTIES.filter(p => !deletedIds.has(p.id)).filter(p => {
      if (typeFilter !== 'all' && p.type !== (typeFilter === 'rent' ? 'rent' : 'sale')) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    }),
    [typeFilter, search, deletedIds]
  );

  const updateOverride = (id: string, patch: Override) => {
    const next = { ...overrides, [id]: { ...(overrides[id] || {}), ...patch } };
    setOverrides(next); saveOverrides(next);
  };

  const handleDelete = (id: string) => {
    const next = new Set(deletedIds); next.add(id);
    setDeletedIds(next);
    localStorage.setItem('admin_deleted_props', JSON.stringify([...next]));
    setDeleteConfirm(null);
    setChecked(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const openEdit = (p: Property) => {
    setEditTarget(p);
    setEditForm(overrides[p.id] || {});
  };

  const saveEdit = () => {
    if (!editTarget) return;
    updateOverride(editTarget.id, editForm);
    setEditTarget(null);
  };

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const checkAll = () => {
    if (checked.size === properties.length) setChecked(new Set());
    else setChecked(new Set(properties.map(p => p.id)));
  };

  // ── 送信メール生成 ──
  const generateMailBody = () => {
    const lines = [...checked].map(id => {
      const p = PROPERTIES.find(x => x.id === id);
      if (!p) return '';
      const title = overrides[id]?.title ?? p.title;
      const url = `https://nagato-fudosan.vercel.app/property/${id}`;
      const priceStr = p.type === 'rent'
        ? `月額 ¥${(p.rent || p.price).toLocaleString()}`
        : `¥${p.price.toLocaleString()}`;
      return `■ ${title}\n   ${p.address}\n   ${priceStr} / ${p.area}㎡\n   ${url}`;
    }).filter(Boolean);

    return `${sendForm.name || 'お客様'} 様

いつもお世話になっております。
(有)長門不動産 でございます。

ご紹介させていただきたい物件をご案内いたします。

${lines.join('\n\n')}

ご不明な点はお気軽にお問い合わせください。

─────────────────────
(有)長門不動産
TEL: 0837-22-3321
MAIL: nag3321@sage.ocn.ne.jp
営業時間: 平日9:00〜18:00 / 土日祝10:00〜17:00
─────────────────────`;
  };

  const handleSendMail = () => {
    const subject = encodeURIComponent('【長門不動産】物件のご紹介');
    const body = encodeURIComponent(generateMailBody());
    const to = encodeURIComponent(sendForm.email);
    window.open(`mailto:${to}?subject=${subject}&body=${body}`);
  };

  const rentCount = PROPERTIES.filter(p => !deletedIds.has(p.id) && p.type === 'rent').length;
  const saleCount = PROPERTIES.filter(p => !deletedIds.has(p.id) && p.type === 'sale').length;

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-[#8a6c3e]" />
          <h2 className="text-lg font-bold text-[#3d2e1e]">物件データ管理</h2>
          <span className="text-xs bg-[#f5f0e8] text-[#8a6c3e] border border-[#c8a96e] px-2 py-0.5 rounded-full">
            賃貸 {rentCount}件 ／ 売買 {saleCount}件
          </span>
        </div>
        {checked.size > 0 && (
          <button onClick={() => setShowSend(true)}
            className="flex items-center gap-2 bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
            <Send className="h-4 w-4" />
            選択した {checked.size} 件を紹介メール送信
          </button>
        )}
      </div>

      {/* フィルター */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-[#ddd5c8]">
          {(['all', 'rent', 'sale'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === t ? 'bg-[#8a6c3e] text-white' : 'bg-white text-[#666] hover:bg-[#f5f0e8]'
              }`}>
              {t === 'all' ? `全件 (${rentCount + saleCount})` : t === 'rent' ? `賃貸 (${rentCount})` : `売買 (${saleCount})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#ddd5c8] rounded-lg px-3 py-2 flex-1 min-w-0 max-w-xs">
          <Search className="h-4 w-4 text-[#999] flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="物件名・住所で検索..." className="flex-1 text-sm outline-none bg-transparent text-[#3d2e1e] placeholder-[#bbb]" />
        </div>
      </div>

      {/* テーブル */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#f5f0e8] border-b border-[#ddd5c8]">
                <th className="px-3 py-3 w-8">
                  <button onClick={checkAll} className="text-[#8a6c3e]">
                    {checked.size === properties.length && properties.length > 0
                      ? <CheckSquare className="h-4 w-4" />
                      : <Square className="h-4 w-4 text-[#ccc]" />}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">物件</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">種別</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">タイプ</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">価格</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">面積</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">状態</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">操作</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <PropertyRow
                  key={p.id}
                  property={p}
                  override={overrides[p.id] || {}}
                  checked={checked.has(p.id)}
                  onCheck={() => toggleCheck(p.id)}
                  onToggleHide={() => updateOverride(p.id, { isHidden: !(overrides[p.id]?.isHidden) })}
                  onDelete={() => setDeleteConfirm(p.id)}
                  onEdit={() => openEdit(p)}
                />
              ))}
            </tbody>
          </table>
          {properties.length === 0 && (
            <div className="text-center py-12 text-[#999]">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-[#ddd]" />
              <p>該当する物件がありません</p>
            </div>
          )}
        </div>
      </Card>

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0]">
              <h3 className="font-bold text-[#3d2e1e]">物件情報を編集</h3>
              <button onClick={() => setEditTarget(null)} className="text-[#999] hover:text-[#3d2e1e]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b5230] mb-1">物件名</label>
                <input value={editForm.title ?? editTarget.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b5230] mb-1">
                  {editTarget.type === 'rent' ? '賃料（円/月）' : '売却価格（円）'}
                </label>
                <input type="number" value={editForm.price ?? editTarget.price}
                  onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b5230] mb-1">説明文</label>
                <textarea value={editForm.description ?? editTarget.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 border border-[#ddd5c8] rounded-lg py-2 text-sm text-[#666] hover:bg-[#f5f0e8] transition-colors">
                キャンセル
              </button>
              <button onClick={saveEdit}
                className="flex-1 bg-[#8a6c3e] text-white rounded-lg py-2 text-sm hover:bg-[#6e5430] transition-colors flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-[#3d2e1e] mb-2">削除の確認</h3>
            <p className="text-sm text-[#666] mb-5">この物件を一覧から削除しますか？<br />この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-[#ddd5c8] rounded-lg py-2 text-sm text-[#666] hover:bg-[#f5f0e8]">
                キャンセル
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 紹介メール送信モーダル */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0]">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-700" />
                <h3 className="font-bold text-[#3d2e1e]">物件紹介メールを送る</h3>
              </div>
              <button onClick={() => setShowSend(false)} className="text-[#999] hover:text-[#3d2e1e]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* 選択物件確認 */}
              <div>
                <p className="text-xs font-semibold text-[#6b5230] mb-2">送信する物件（{checked.size}件）</p>
                <div className="bg-[#f5f0e8] rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                  {[...checked].map(id => {
                    const p = PROPERTIES.find(x => x.id === id);
                    if (!p) return null;
                    const title = overrides[id]?.title ?? p.title;
                    const priceStr = p.type === 'rent' ? `¥${(p.rent||p.price).toLocaleString()}/月` : `¥${p.price.toLocaleString()}`;
                    return (
                      <div key={id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="h-3.5 w-3.5 text-[#8a6c3e] flex-shrink-0" />
                          <span className="text-sm text-[#3d2e1e] truncate">{title}</span>
                        </div>
                        <span className="text-xs font-bold text-[#8a6c3e] flex-shrink-0">{priceStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 宛先 */}
              <div>
                <label className="block text-xs font-semibold text-[#6b5230] mb-1">宛名（お客様のお名前）</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                  <input value={sendForm.name} onChange={e => setSendForm(f => ({...f, name: e.target.value}))}
                    placeholder="例：山田 太郎"
                    className="w-full border border-[#ddd5c8] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#c8a96e]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b5230] mb-1">
                  送信先メールアドレス <span className="text-[#999] font-normal">（会員・非会員どちらでも可）</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                  <input type="email" value={sendForm.email} onChange={e => setSendForm(f => ({...f, email: e.target.value}))}
                    placeholder="example@email.com"
                    className="w-full border border-[#ddd5c8] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#c8a96e]" />
                </div>
              </div>

              {/* プレビュー */}
              <div>
                <p className="text-xs font-semibold text-[#6b5230] mb-1">メール本文プレビュー</p>
                <pre className="bg-[#f9f7f4] border border-[#e8e0d4] rounded-lg p-3 text-xs text-[#555] whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                  {generateMailBody()}
                </pre>
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setShowSend(false)}
                className="flex-1 border border-[#ddd5c8] rounded-lg py-2 text-sm text-[#666] hover:bg-[#f5f0e8]">
                キャンセル
              </button>
              <button onClick={handleSendMail} disabled={!sendForm.email}
                className="flex-1 bg-green-700 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
                <Send className="h-4 w-4" />メールソフトで開く
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyManager;
