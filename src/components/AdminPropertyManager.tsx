import React, { useState, useMemo, useRef } from 'react';
import { PROPERTIES } from '@/data/properties';
import { Property } from '@/types/database';
import {
  Eye, EyeOff, Trash2, Edit2, Send, X, Check, Search,
  Building2, ExternalLink, Mail, User,
  CheckSquare, Square, Plus, ChevronRight,
  Upload, Download, AlertCircle, CheckCircle2, FileText
} from 'lucide-react';

// ─── localStorage helpers ───
const OVERRIDES_KEY = 'admin_prop_overrides';
const CUSTOM_KEY    = 'admin_custom_props';
const DELETED_KEY   = 'admin_deleted_props';

type Override = { isHidden?: boolean; title?: string; price?: number; rent?: number; description?: string };
type Overrides = Record<string, Override>;

const load = <T,>(key: string, fallback: T): T => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; } };
const save = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

// ─── CSV ───
const CSV_HEADERS = ['type','propertyType','title','address','area','rooms','floor','totalFloors','age','price','rent','managementFee','deposit','keyMoney','station','walkingTime','features','images','description'];
const CSV_TEMPLATE = CSV_HEADERS.join(',') + '\n' +
  'rent,apartment,賃貸　アパート サンプル,山口県長門市東深川123,30,2,1,2,10,0,45000,3000,1,0,JR長門市駅,10,エアコン|室内洗濯機置き場,https://example.com/img.jpg,サンプル物件です\n' +
  'sale,house,売買　一戸建て サンプル,山口県長門市仙崎456,80,4,1,2,25,8000000,0,0,0,0,,0,駐車場あり|ペット可能,https://example.com/img2.jpg,日当たり良好な物件';

const downloadTemplate = () => {
  const bom = '\uFEFF';
  const blob = new Blob([bom + CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '長門不動産_物件登録テンプレート.csv'; a.click();
};

type CsvRow = { ok: boolean; row: number; data?: Property; errors: string[] };

const parseCSV = (text: string): CsvRow[] => {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const results: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // CSVのカンマ分割（クォート対応）
    const cols: string[] = [];
    let cur = ''; let inQ = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());

    const get = (field: string) => {
      const idx = header.indexOf(field);
      return idx >= 0 ? (cols[idx] || '').replace(/^"|"$/g, '').trim() : '';
    };

    const errors: string[] = [];
    const type = get('type');
    const propertyType = get('propertyType');
    const title = get('title');
    const address = get('address');
    const area = parseFloat(get('area')) || 0;
    const price = parseInt(get('price')) || 0;
    const rent  = parseInt(get('rent'))  || 0;

    if (!['rent','sale'].includes(type)) errors.push(`type が無効 (rent/sale)`);
    if (!['apartment','house','land','office'].includes(propertyType)) errors.push(`propertyType が無効 (apartment/house/land/office)`);
    if (!title) errors.push('title は必須');
    if (!address) errors.push('address は必須');
    if (area <= 0) errors.push('area は0より大きい値');
    if (type === 'rent' && rent <= 0) errors.push('賃貸の場合 rent は必須');
    if (type === 'sale' && price <= 0) errors.push('売買の場合 price は必須');

    const prop: Property = {
      id: `csv_${Date.now()}_${i}`,
      title, address, description: get('description'),
      type: type as 'rent' | 'sale',
      propertyType: propertyType as Property['propertyType'],
      price: type === 'sale' ? price : rent,
      rent: type === 'rent' ? rent : undefined,
      managementFee: parseInt(get('managementFee')) || 0,
      deposit: parseInt(get('deposit')) || 0,
      keyMoney: parseInt(get('keyMoney')) || 0,
      area, rooms: parseInt(get('rooms')) || 1,
      floor: parseInt(get('floor')) || 1,
      totalFloors: parseInt(get('totalFloors')) || 1,
      age: parseInt(get('age')) || 0,
      prefecture: '山口県', city: '長門市',
      station: get('station'), walkingTime: parseInt(get('walkingTime')) || 0,
      features: get('features') ? get('features').split('|').map(f => f.trim()).filter(Boolean) : [],
      images: get('images') ? get('images').split('|').map(u => u.trim()).filter(Boolean) : [],
      isAvailable: true, isNew: true,
      createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin',
    };
    results.push({ ok: errors.length === 0, row: i, data: prop, errors });
  }
  return results;
};

// ─── 空物件フォーム ───
const emptyForm = (): Partial<Property> & { imageUrlInput?: string } => ({
  type: 'rent', propertyType: 'apartment',
  title: '', address: '', prefecture: '山口県', city: '長門市',
  station: '', area: 0, rooms: 1, floor: 1, totalFloors: 1, age: 0,
  price: 0, rent: 0, managementFee: 0, deposit: 0, keyMoney: 0,
  walkingTime: 0, description: '', features: [], images: [],
  isAvailable: true, isNew: true, createdBy: 'admin', imageUrlInput: '',
});

const FEATURE_LIST = ['エアコン','室内洗濯機置き場','バス・トイレ別','シャワー','駐車場あり','ペット可能','ペット不可','オートロック','TVドアホン','フローリング','収納あり','二重ガラス'];

// ─── 部品 ───
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-[#ddd5c8] shadow-sm ${className}`}>{children}</div>
);

const Label = ({ children }: any) => <p className="text-xs font-semibold text-[#6b5230] mb-1">{children}</p>;

const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e] transition-colors" {...props} />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e] bg-white" {...props}>{children}</select>
);

const StatusBadge = ({ status }: { status: string }) => {
  const m: Record<string, string> = { pending:'bg-amber-100 text-amber-700', confirmed:'bg-blue-100 text-blue-700', completed:'bg-green-100 text-green-700', in_progress:'bg-blue-100 text-blue-700' };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m[status]||'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

// ─── 物件行 ───
const PropertyRow = ({ property, override, checked, onCheck, onToggleHide, onDelete, onEdit }: {
  property: Property; override: Override; checked: boolean;
  onCheck: () => void; onToggleHide: () => void; onDelete: () => void; onEdit: () => void;
}) => {
  const isHidden = override?.isHidden ?? false;
  const title    = override?.title ?? property.title;
  const url      = `https://nagato-fudosan.vercel.app/property/${property.id}`;
  const priceStr = property.type === 'rent'
    ? `¥${((override?.rent ?? property.rent ?? property.price) || 0).toLocaleString()}/月`
    : `¥${((override?.price ?? property.price) || 0).toLocaleString()}`;

  return (
    <tr className={`border-b border-[#f0ebe3] hover:bg-[#faf7f2] transition-colors ${isHidden ? 'opacity-40' : ''}`}>
      <td className="px-3 py-2.5">
        <button onClick={onCheck} className="text-[#8a6c3e]">
          {checked ? <CheckSquare className="h-4 w-4"/> : <Square className="h-4 w-4 text-[#ccc]"/>}
        </button>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          {property.images?.[0]
            ? <img src={property.images[0]} alt="" className="w-12 h-10 object-cover rounded border border-[#e0d8cc] flex-shrink-0" onError={e => (e.target as HTMLImageElement).style.display='none'} />
            : <div className="w-12 h-10 bg-[#f0ebe3] rounded flex items-center justify-center flex-shrink-0"><Building2 className="h-4 w-4 text-[#ccc]"/></div>}
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#3d2e1e] truncate max-w-[160px]">{title}</p>
            <p className="text-xs text-[#999] truncate max-w-[160px]">{property.address}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${property.type==='rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
          {property.type==='rent' ? '賃貸' : '売買'}
        </span>
      </td>
      <td className="px-3 py-2.5 text-xs text-[#666]">{property.propertyType}</td>
      <td className="px-3 py-2.5 text-xs font-bold text-[#8a6c3e]">{priceStr}</td>
      <td className="px-3 py-2.5 text-xs text-[#666]">{property.area}㎡</td>
      <td className="px-3 py-2.5">
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isHidden ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'}`}>
          {isHidden ? '非表示' : '表示中'}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-0.5">
          <a href={url} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-[#f5f0e8] text-[#8a6c3e]" title="開く"><ExternalLink className="h-3.5 w-3.5"/></a>
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="編集"><Edit2 className="h-3.5 w-3.5"/></button>
          <button onClick={onToggleHide} className={`p-1.5 rounded ${isHidden ? 'hover:bg-green-50 text-green-600' : 'hover:bg-gray-100 text-gray-500'}`} title={isHidden?'表示':'非表示'}>
            {isHidden ? <Eye className="h-3.5 w-3.5"/> : <EyeOff className="h-3.5 w-3.5"/>}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="削除"><Trash2 className="h-3.5 w-3.5"/></button>
        </div>
      </td>
    </tr>
  );
};

// ══════════════════════════════════════════
//  メイン
// ══════════════════════════════════════════
const AdminPropertyManager: React.FC = () => {
  const [overrides, setOverrides] = useState<Overrides>(load(OVERRIDES_KEY, {}));
  const [customProps, setCustomProps] = useState<Property[]>(load(CUSTOM_KEY, []));
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set(load<string[]>(DELETED_KEY, [])));

  const [typeFilter, setTypeFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const [searchQ, setSearchQ] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // モーダル状態
  const [mode, setMode] = useState<null | 'add' | 'edit' | 'csv'>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSend, setShowSend] = useState(false);
  const [sendForm, setSendForm] = useState({ name: '', email: '' });
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvImported, setCsvImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setCsvRows(parseCSV(text));
      setCsvImported(false);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleCsvImport = () => {
    const valid = csvRows.filter(r => r.ok && r.data);
    if (valid.length === 0) return;
    const next = [...customProps, ...valid.map(r => r.data!)];
    setCustomProps(next); save(CUSTOM_KEY, next);
    setCsvImported(true);
  };

  // 全物件（マスター＋カスタム、削除済み除外）
  const allProperties: Property[] = useMemo(() => {
    const master = PROPERTIES.filter(p => !deletedIds.has(p.id));
    const custom = customProps.filter(p => !deletedIds.has(p.id));
    return [...master, ...custom];
  }, [deletedIds, customProps]);

  const filtered = useMemo(() => allProperties.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    const q = searchQ.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
  }), [allProperties, typeFilter, searchQ]);

  const rentCount = allProperties.filter(p => p.type === 'rent').length;
  const saleCount = allProperties.filter(p => p.type === 'sale').length;

  // ── override操作 ──
  const updateOverride = (id: string, patch: Override) => {
    const next = { ...overrides, [id]: { ...(overrides[id]||{}), ...patch } };
    setOverrides(next); save(OVERRIDES_KEY, next);
  };

  // ── 削除 ──
  const handleDelete = (id: string) => {
    const next = new Set(deletedIds); next.add(id);
    setDeletedIds(next); save(DELETED_KEY, [...next]);
    setChecked(prev => { const s = new Set(prev); s.delete(id); return s; });
    setDeleteConfirm(null);
  };

  // ── チェック ──
  const toggleCheck = (id: string) => setChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const checkAll = () => checked.size === filtered.length ? setChecked(new Set()) : setChecked(new Set(filtered.map(p => p.id)));

  // ── 編集モーダルを開く ──
  const openEdit = (p: Property) => {
    const ov = overrides[p.id] || {};
    setForm({
      ...p,
      title: ov.title ?? p.title,
      price: ov.price ?? p.price,
      rent: (ov.rent ?? p.rent) || 0,
      description: ov.description ?? p.description,
      imageUrlInput: '',
    });
    setEditId(p.id);
    setMode('edit');
  };

  // ── 追加モーダルを開く ──
  const openAdd = () => { setForm(emptyForm()); setEditId(null); setMode('add'); };

  // ── 保存 ──
  const handleSave = () => {
    if (!form.title || !form.address) return;

    if (mode === 'add') {
      const newProp: Property = {
        id: `custom_${Date.now()}`,
        title: form.title || '',
        description: form.description || '',
        type: form.type as 'rent' | 'sale',
        propertyType: form.propertyType as Property['propertyType'],
        price: Number(form.price) || 0,
        rent: form.type === 'rent' ? Number(form.rent) || Number(form.price) || 0 : undefined,
        managementFee: Number(form.managementFee) || 0,
        deposit: Number(form.deposit) || 0,
        keyMoney: Number(form.keyMoney) || 0,
        area: Number(form.area) || 0,
        rooms: Number(form.rooms) || 1,
        floor: Number(form.floor) || 1,
        totalFloors: Number(form.totalFloors) || 1,
        age: Number(form.age) || 0,
        address: form.address || '',
        prefecture: form.prefecture || '山口県',
        city: form.city || '長門市',
        station: form.station || '',
        walkingTime: Number(form.walkingTime) || 0,
        features: form.features || [],
        images: form.images || [],
        isAvailable: true,
        isNew: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
      };
      const next = [...customProps, newProp];
      setCustomProps(next); save(CUSTOM_KEY, next);
    } else if (mode === 'edit' && editId) {
      // カスタム物件の場合は直接更新
      const isCustom = customProps.some(p => p.id === editId);
      if (isCustom) {
        const next = customProps.map(p => p.id !== editId ? p : {
          ...p,
          title: form.title || p.title,
          price: Number(form.price) || p.price,
          rent: form.type === 'rent' ? Number(form.rent) || 0 : p.rent,
          description: form.description || p.description,
          area: Number(form.area) || p.area,
          rooms: Number(form.rooms) || p.rooms,
          address: form.address || p.address,
          images: form.images || p.images,
          features: form.features || p.features,
          managementFee: Number(form.managementFee) || 0,
          deposit: Number(form.deposit) || 0,
          keyMoney: Number(form.keyMoney) || 0,
        });
        setCustomProps(next); save(CUSTOM_KEY, next);
      } else {
        // マスター物件はoverride
        updateOverride(editId, {
          title: form.title || undefined,
          price: Number(form.price) || undefined,
          rent: form.type === 'rent' ? Number(form.rent) || undefined : undefined,
          description: form.description || undefined,
        });
      }
    }
    setMode(null);
  };

  const f = (field: string, val: unknown) => setForm(prev => ({ ...prev, [field]: val }));
  const addImageUrl = () => {
    const url = (form.imageUrlInput || '').trim();
    if (url) { f('images', [...(form.images||[]), url]); f('imageUrlInput', ''); }
  };
  const removeImage = (idx: number) => f('images', (form.images||[]).filter((_: any, i: number) => i !== idx));
  const toggleFeature = (feat: string) => {
    const cur = form.features || [];
    f('features', cur.includes(feat) ? cur.filter((x: string) => x !== feat) : [...cur, feat]);
  };

  // ── 紹介メール ──
  const generateMailBody = () => {
    const lines = [...checked].map(id => {
      const p = allProperties.find(x => x.id === id); if (!p) return '';
      const title = overrides[id]?.title ?? p.title;
      const url   = `https://nagato-fudosan.vercel.app/property/${id}`;
      const priceStr = p.type === 'rent' ? `月額 ¥${((overrides[id]?.rent ?? p.rent ?? p.price) || 0).toLocaleString()}` : `¥${((overrides[id]?.price ?? p.price) || 0).toLocaleString()}`;
      return `■ ${title}\n   ${p.address}\n   ${priceStr} / ${p.area}㎡\n   ${url}`;
    }).filter(Boolean);
    return `${sendForm.name || 'お客様'} 様\n\nいつもお世話になっております。\n(有)長門不動産 でございます。\n\nご紹介させていただきたい物件をご案内いたします。\n\n${lines.join('\n\n')}\n\nご不明な点はお気軽にお問い合わせください。\n\n─────────────────────\n(有)長門不動産\nTEL: 0837-22-3321\nMAIL: nag3321@sage.ocn.ne.jp\n営業時間: 平日9:00〜18:00 / 土日祝10:00〜17:00\n─────────────────────`;
  };
  const handleSendMail = () => {
    window.open(`mailto:${encodeURIComponent(sendForm.email)}?subject=${encodeURIComponent('【長門不動産】物件のご紹介')}&body=${encodeURIComponent(generateMailBody())}`);
  };

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-[#8a6c3e]"/>
          <h2 className="text-lg font-bold text-[#3d2e1e]">物件データ管理</h2>
          <span className="text-xs bg-[#f5f0e8] text-[#8a6c3e] border border-[#c8a96e] px-2 py-0.5 rounded-full">賃貸 {rentCount}件 ／ 売買 {saleCount}件</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {checked.size > 0 && (
            <button onClick={() => setShowSend(true)}
              className="flex items-center gap-2 bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
              <Send className="h-4 w-4"/>選択 {checked.size}件を紹介メール送信
            </button>
          )}
          <button onClick={() => { setCsvRows([]); setCsvImported(false); setMode('csv'); }}
            className="flex items-center gap-2 bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            <Upload className="h-4 w-4"/>CSV一括登録
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#8a6c3e] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#6e5430] transition-colors">
            <Plus className="h-4 w-4"/>新規物件を登録
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-[#ddd5c8]">
          {(['all','rent','sale'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${typeFilter===t ? 'bg-[#8a6c3e] text-white' : 'bg-white text-[#666] hover:bg-[#f5f0e8]'}`}>
              {t==='all' ? `全件 (${rentCount+saleCount})` : t==='rent' ? `賃貸 (${rentCount})` : `売買 (${saleCount})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#ddd5c8] rounded-lg px-3 py-2 flex-1 min-w-0 max-w-xs">
          <Search className="h-4 w-4 text-[#999] flex-shrink-0"/>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="物件名・住所で検索..." className="flex-1 text-sm outline-none bg-transparent text-[#3d2e1e] placeholder-[#bbb]"/>
        </div>
      </div>

      {/* テーブル */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-[#f5f0e8] border-b border-[#ddd5c8]">
                <th className="px-3 py-3 w-8">
                  <button onClick={checkAll} className="text-[#8a6c3e]">
                    {checked.size>0 && checked.size===filtered.length ? <CheckSquare className="h-4 w-4"/> : <Square className="h-4 w-4 text-[#ccc]"/>}
                  </button>
                </th>
                {['物件','種別','タイプ','価格','面積','状態','操作'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-[#6b5230]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <PropertyRow key={p.id} property={p} override={overrides[p.id]||{}} checked={checked.has(p.id)}
                  onCheck={() => toggleCheck(p.id)}
                  onToggleHide={() => updateOverride(p.id, { isHidden: !(overrides[p.id]?.isHidden) })}
                  onDelete={() => setDeleteConfirm(p.id)}
                  onEdit={() => openEdit(p)} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#999]">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-[#ddd]"/>
              <p>該当する物件がありません</p>
            </div>
          )}
        </div>
      </Card>

      {/* ───── 新規追加 / 編集 モーダル ───── */}
      {mode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0] sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center gap-2">
                {mode==='add' ? <Plus className="h-5 w-5 text-[#8a6c3e]"/> : <Edit2 className="h-5 w-5 text-blue-600"/>}
                <h3 className="font-bold text-[#3d2e1e]">{mode==='add' ? '新規物件を登録' : '物件情報を編集'}</h3>
              </div>
              <button onClick={() => setMode(null)} className="text-[#999] hover:text-[#3d2e1e]"><X className="h-5 w-5"/></button>
            </div>

            <div className="p-5 space-y-5">
              {/* 種別 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>物件種別 *</Label>
                  <Select value={form.type} onChange={e => f('type', e.target.value)}>
                    <option value="rent">賃貸</option>
                    <option value="sale">売買</option>
                  </Select>
                </div>
                <div>
                  <Label>タイプ *</Label>
                  <Select value={form.propertyType} onChange={e => f('propertyType', e.target.value)}>
                    <option value="apartment">アパート・マンション</option>
                    <option value="house">一戸建て</option>
                    <option value="land">土地</option>
                    <option value="office">倉庫・事務所</option>
                  </Select>
                </div>
              </div>

              {/* 物件名 */}
              <div>
                <Label>物件名 *</Label>
                <Input value={form.title||''} onChange={e => f('title', e.target.value)} placeholder="例：賃貸　アパート"/>
              </div>

              {/* 住所 */}
              <div>
                <Label>住所 *</Label>
                <Input value={form.address||''} onChange={e => f('address', e.target.value)} placeholder="例：山口県長門市東深川1234"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>最寄り駅</Label><Input value={form.station||''} onChange={e => f('station', e.target.value)} placeholder="例：JR山陰本線 長門市駅"/></div>
                <div><Label>駅から徒歩（分）</Label><Input type="number" value={form.walkingTime||0} onChange={e => f('walkingTime', e.target.value)} min={0}/></div>
              </div>

              {/* 価格 */}
              <div className="bg-[#faf7f2] rounded-lg p-4 space-y-3 border border-[#ede8e0]">
                <p className="text-xs font-bold text-[#6b5230] uppercase tracking-wider">価格情報</p>
                {form.type === 'rent' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>賃料（円/月） *</Label><Input type="number" value={form.rent||0} onChange={e => f('rent', e.target.value)} min={0}/></div>
                    <div><Label>管理費（円/月）</Label><Input type="number" value={form.managementFee||0} onChange={e => f('managementFee', e.target.value)} min={0}/></div>
                    <div><Label>敷金（ヶ月）</Label><Input type="number" value={form.deposit||0} onChange={e => f('deposit', e.target.value)} min={0}/></div>
                    <div><Label>礼金（ヶ月）</Label><Input type="number" value={form.keyMoney||0} onChange={e => f('keyMoney', e.target.value)} min={0}/></div>
                  </div>
                ) : (
                  <div><Label>売却価格（円） *</Label><Input type="number" value={form.price||0} onChange={e => f('price', e.target.value)} min={0}/></div>
                )}
              </div>

              {/* 物件詳細 */}
              <div className="bg-[#faf7f2] rounded-lg p-4 space-y-3 border border-[#ede8e0]">
                <p className="text-xs font-bold text-[#6b5230] uppercase tracking-wider">物件詳細</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>専有面積（㎡） *</Label><Input type="number" value={form.area||0} onChange={e => f('area', e.target.value)} min={0} step={0.01}/></div>
                  <div><Label>間取り（部屋数）</Label><Input type="number" value={form.rooms||1} onChange={e => f('rooms', e.target.value)} min={1}/></div>
                  <div><Label>階数</Label><Input type="number" value={form.floor||1} onChange={e => f('floor', e.target.value)} min={1}/></div>
                  <div><Label>総階数</Label><Input type="number" value={form.totalFloors||1} onChange={e => f('totalFloors', e.target.value)} min={1}/></div>
                  <div className="col-span-2"><Label>築年数</Label><Input type="number" value={form.age||0} onChange={e => f('age', e.target.value)} min={0}/></div>
                </div>
              </div>

              {/* 設備・特徴 */}
              <div>
                <Label>設備・特徴</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {FEATURE_LIST.map(feat => {
                    const on = (form.features||[]).includes(feat);
                    return (
                      <button key={feat} type="button" onClick={() => toggleFeature(feat)}
                        className={`text-xs px-2 py-1.5 rounded border text-left transition-colors ${on ? 'bg-[#8a6c3e] text-white border-[#8a6c3e]' : 'bg-white text-[#666] border-[#ddd5c8] hover:border-[#c8a96e]'}`}>
                        {on ? '✓ ' : ''}{feat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 説明文 */}
              <div>
                <Label>物件説明</Label>
                <textarea value={form.description||''} onChange={e => f('description', e.target.value)} rows={3}
                  className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e] resize-none"
                  placeholder="物件の特徴や周辺環境など"/>
              </div>

              {/* 画像URL */}
              <div>
                <Label>物件画像URL</Label>
                <div className="flex gap-2 mb-2">
                  <input value={form.imageUrlInput||''} onChange={e => f('imageUrlInput', e.target.value)}
                    placeholder="https://example.com/image.jpg" onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addImageUrl())}
                    className="flex-1 border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e]"/>
                  <button type="button" onClick={addImageUrl}
                    className="bg-[#8a6c3e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#6e5430] flex items-center gap-1">
                    <Plus className="h-4 w-4"/>追加
                  </button>
                </div>
                {(form.images||[]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(form.images as string[]).map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="w-20 h-16 object-cover rounded border border-[#e0d8cc]" onError={e => (e.target as HTMLImageElement).src='https://via.placeholder.com/80x64?text=Error'}/>
                        <button type="button" onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setMode(null)}
                className="flex-1 border border-[#ddd5c8] rounded-lg py-2.5 text-sm text-[#666] hover:bg-[#f5f0e8]">
                キャンセル
              </button>
              <button onClick={handleSave} disabled={!form.title || !form.address}
                className="flex-1 bg-[#8a6c3e] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#6e5430] disabled:opacity-40 flex items-center justify-center gap-2">
                <Check className="h-4 w-4"/>{mode==='add' ? '登録する' : '保存する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV一括登録モーダル */}
      {mode === 'csv' && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0]">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600"/>
                <h3 className="font-bold text-[#3d2e1e]">CSV一括登録</h3>
              </div>
              <button onClick={() => setMode(null)} className="text-[#999] hover:text-[#3d2e1e]"><X className="h-5 w-5"/></button>
            </div>

            <div className="p-5 space-y-5">
              {/* テンプレートDL */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"/>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-800 mb-1">まずはテンプレートをダウンロード</p>
                    <p className="text-xs text-blue-600 mb-3">CSVの列順・フォーマットを確認してください。featuresとimagesは <code className="bg-blue-100 px-1 rounded">|</code> で区切って複数指定できます。</p>
                    <div className="bg-white border border-blue-200 rounded p-2 mb-3 overflow-x-auto">
                      <code className="text-xs text-[#555] whitespace-nowrap">
                        {CSV_HEADERS.join(' , ')}
                      </code>
                    </div>
                    <button onClick={downloadTemplate}
                      className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="h-4 w-4"/>テンプレートCSVをダウンロード
                    </button>
                  </div>
                </div>
              </div>

              {/* ファイル選択 */}
              <div>
                <Label>CSVファイルを選択（UTF-8 または BOM付きUTF-8）</Label>
                <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleCsvFile} className="hidden"/>
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#c8a96e] rounded-lg py-8 text-center hover:bg-[#faf7f2] transition-colors">
                  <Upload className="h-8 w-8 text-[#c8a96e] mx-auto mb-2"/>
                  <p className="text-sm font-medium text-[#8a6c3e]">クリックしてCSVファイルを選択</p>
                  <p className="text-xs text-[#999] mt-1">.csv ファイル対応</p>
                </button>
              </div>

              {/* 解析結果 */}
              {csvRows.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-sm font-bold text-[#3d2e1e]">解析結果：{csvRows.length}行</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      成功 {csvRows.filter(r=>r.ok).length}件
                    </span>
                    {csvRows.filter(r=>!r.ok).length > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        エラー {csvRows.filter(r=>!r.ok).length}件
                      </span>
                    )}
                  </div>
                  <div className="border border-[#ddd5c8] rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    {csvRows.map((row, idx) => (
                      <div key={idx} className={`flex items-start gap-3 px-4 py-2.5 border-b border-[#f0ebe3] text-sm ${row.ok ? '' : 'bg-red-50'}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {row.ok
                            ? <CheckCircle2 className="h-4 w-4 text-green-600"/>
                            : <AlertCircle className="h-4 w-4 text-red-500"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#999]">{row.row}行目</span>
                            {row.data && <span className="text-[#3d2e1e] font-medium truncate">{row.data.title}</span>}
                            {row.data && (
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${row.data.type==='rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {row.data.type==='rent' ? '賃貸' : '売買'}
                              </span>
                            )}
                          </div>
                          {row.errors.length > 0 && (
                            <p className="text-xs text-red-600 mt-0.5">{row.errors.join(' / ')}</p>
                          )}
                          {row.data && row.ok && (
                            <p className="text-xs text-[#999] mt-0.5">
                              {row.data.address} / {row.data.area}㎡
                              {row.data.type==='rent' ? ` / ¥${(row.data.rent||0).toLocaleString()}/月` : ` / ¥${row.data.price.toLocaleString()}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!csvImported ? (
                    <button onClick={handleCsvImport} disabled={csvRows.filter(r=>r.ok).length === 0}
                      className="mt-4 w-full bg-blue-700 text-white rounded-lg py-3 text-sm font-bold hover:bg-blue-800 disabled:opacity-40 flex items-center justify-center gap-2 transition-colors">
                      <Upload className="h-4 w-4"/>
                      成功した {csvRows.filter(r=>r.ok).length}件 を登録する
                    </button>
                  ) : (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0"/>
                      <div>
                        <p className="text-sm font-bold text-green-800">{csvRows.filter(r=>r.ok).length}件の物件を登録しました</p>
                        <p className="text-xs text-green-600">物件管理一覧に反映されました</p>
                      </div>
                      <button onClick={() => setMode(null)} className="ml-auto text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700">閉じる</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 削除確認 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-3"/>
            <h3 className="font-bold text-[#3d2e1e] mb-2">削除の確認</h3>
            <p className="text-sm text-[#666] mb-5">この物件を一覧から削除しますか？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-[#ddd5c8] rounded-lg py-2 text-sm text-[#666] hover:bg-[#f5f0e8]">キャンセル</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 flex items-center justify-center gap-2"><Trash2 className="h-4 w-4"/>削除する</button>
            </div>
          </div>
        </div>
      )}

      {/* 紹介メール送信 */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0]">
              <div className="flex items-center gap-2"><Send className="h-5 w-5 text-green-700"/><h3 className="font-bold text-[#3d2e1e]">物件紹介メールを送る</h3></div>
              <button onClick={() => setShowSend(false)} className="text-[#999] hover:text-[#3d2e1e]"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#6b5230] mb-2">送信する物件（{checked.size}件）</p>
                <div className="bg-[#f5f0e8] rounded-lg p-3 space-y-1.5 max-h-36 overflow-y-auto">
                  {[...checked].map(id => {
                    const p = allProperties.find(x => x.id === id); if (!p) return null;
                    const title = overrides[id]?.title ?? p.title;
                    const priceStr = p.type==='rent' ? `¥${((overrides[id]?.rent ?? p.rent ?? p.price) || 0).toLocaleString()}/月` : `¥${((overrides[id]?.price ?? p.price) || 0).toLocaleString()}`;
                    return (
                      <div key={id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0"><Building2 className="h-3.5 w-3.5 text-[#8a6c3e] flex-shrink-0"/><span className="text-sm text-[#3d2e1e] truncate">{title}</span></div>
                        <span className="text-xs font-bold text-[#8a6c3e] flex-shrink-0">{priceStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>宛名（お客様のお名前）</Label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]"/>
                  <input value={sendForm.name} onChange={e => setSendForm(f => ({...f, name: e.target.value}))} placeholder="例：山田 太郎"
                    className="w-full border border-[#ddd5c8] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#c8a96e]"/>
                </div>
              </div>
              <div>
                <Label>送信先メールアドレス <span className="text-[#999] font-normal">（会員・非会員どちらでも可）</span></Label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]"/>
                  <input type="email" value={sendForm.email} onChange={e => setSendForm(f => ({...f, email: e.target.value}))} placeholder="example@email.com"
                    className="w-full border border-[#ddd5c8] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#c8a96e]"/>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6b5230] mb-1">メール本文プレビュー</p>
                <pre className="bg-[#f9f7f4] border border-[#e8e0d4] rounded-lg p-3 text-xs text-[#555] whitespace-pre-wrap max-h-44 overflow-y-auto font-sans">{generateMailBody()}</pre>
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setShowSend(false)} className="flex-1 border border-[#ddd5c8] rounded-lg py-2 text-sm text-[#666] hover:bg-[#f5f0e8]">キャンセル</button>
              <button onClick={handleSendMail} disabled={!sendForm.email}
                className="flex-1 bg-green-700 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-green-800 disabled:opacity-40 flex items-center justify-center gap-2">
                <Send className="h-4 w-4"/>メールソフトで開く
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyManager;
