import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/usePropertySearch';
import { useNavigate, Link } from 'react-router-dom';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import AdminPropertyManager from '@/components/AdminPropertyManager';
import AdminArticleGenerator from '@/components/AdminArticleGenerator';
import {
  User, Heart, LogOut, Home, FileText, Calculator,
  ChevronRight, Menu, Building2, Bell, Users,
  ClipboardList, CheckCircle, Mail, Phone, Eye, X, Sparkles
} from 'lucide-react';

// ──────────── 型 ────────────
interface MockMoveout {
  id: string; name: string; email: string; phone: string;
  propertyId: string; roomNumber: string; moveoutDate: string;
  reason: string; status: 'pending' | 'confirmed' | 'completed';
  notes?: string; createdAt: string; isRead: boolean;
}
interface MockValuation {
  id: string; name: string; email: string; phone: string;
  propertyType: string; address: string; area: number; age: number;
  condition: string; status: 'pending' | 'in_progress' | 'completed';
  createdAt: string; isRead: boolean;
}
interface MockUser {
  id: string; name: string; email: string; phone?: string;
  role: string; isActive: boolean; createdAt: string;
}

// ──────────── LocalStorage helper ────────────
const loadMockData = <T,>(key: string, fallback: T[]): T[] => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
};
const saveMockData = <T,>(key: string, data: T[]) =>
  localStorage.setItem(key, JSON.stringify(data));

// ──────────── デザイン部品 ────────────
const SidebarItem = ({ id, icon: Icon, label, badge, active, onClick }: any) => (
  <button onClick={() => onClick(id)}
    className="w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors relative group"
    style={active === id
      ? { borderLeft: '3px solid #c8a96e', background: 'rgba(200,169,110,0.15)', color: '#c8a96e' }
      : { borderLeft: '3px solid transparent', color: '#aaa' }}
  >
    <Icon className="h-4 w-4 flex-shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{badge}</span>
    )}
  </button>
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-[#ddd5c8] shadow-sm ${className}`}>{children}</div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    pending:     { label: '未対応', color: 'bg-amber-100 text-amber-700' },
    in_progress: { label: '対応中', color: 'bg-blue-100 text-blue-700' },
    confirmed:   { label: '確認済', color: 'bg-blue-100 text-blue-700' },
    completed:   { label: '完了', color: 'bg-green-100 text-green-700' },
  };
  const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>;
};

// ══════════════════════════════════════════
//  管理者ダッシュボード
// ══════════════════════════════════════════
const AdminDashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moveouts, setMoveouts] = useState<MockMoveout[]>([]);
  const [valuations, setValuations] = useState<MockValuation[]>([]);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [detailItem, setDetailItem] = useState<any>(null);

  useEffect(() => {
    setMoveouts(loadMockData<MockMoveout>('mock_moveouts', []));
    setValuations(loadMockData<MockValuation>('mock_valuations', []));
    const stored = loadMockData<MockUser>('mock_users', []);
    // 管理者自身も含める
    const adminEntry: MockUser = { id: 'admin', name: '管理者', email: 'admin@nagato-fudosan.jp', role: 'admin', isActive: true, createdAt: new Date().toISOString() };
    const all = [adminEntry, ...stored.filter(u => u.id !== 'admin')];
    setUsers(all);
  }, []);

  const unreadMoveouts   = moveouts.filter(m => !m.isRead).length;
  const unreadValuations = valuations.filter(v => !v.isRead).length;

  const markMoveoutRead = (id: string) => {
    const updated = moveouts.map(m => m.id === id ? { ...m, isRead: true } : m);
    setMoveouts(updated); saveMockData('mock_moveouts', updated);
  };
  const updateMoveoutStatus = (id: string, status: MockMoveout['status']) => {
    const updated = moveouts.map(m => m.id === id ? { ...m, status, isRead: true } : m);
    setMoveouts(updated); saveMockData('mock_moveouts', updated);
  };
  const updateValuationStatus = (id: string, status: MockValuation['status']) => {
    const updated = valuations.map(v => v.id === id ? { ...v, status, isRead: true } : v);
    setValuations(updated); saveMockData('mock_valuations', updated);
  };

  const ADMIN_NAV = [
    { id: 'overview',    icon: Home,          label: 'ダッシュボード', badge: 0 },
    { id: 'properties',  icon: Building2,     label: '物件管理',       badge: 0 },
    { id: 'articles',    icon: Sparkles,      label: 'AI記事生成',     badge: 0 },
    { id: 'moveouts',    icon: ClipboardList, label: '退去申請受付',   badge: unreadMoveouts },
    { id: 'valuations',  icon: Calculator,    label: '査定依頼一覧',   badge: unreadValuations },
    { id: 'members',     icon: Users,         label: '会員一覧',       badge: 0 },
  ];

  const Sidebar = () => (
    <aside className="w-60 min-h-screen bg-[#1e1e1e] flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-[#333]">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#c8a96e]" />
          <div>
            <p className="text-white font-bold text-sm">(有)長門不動産</p>
            <p className="text-[#888] text-xs">管理画面</p>
          </div>
        </Link>
      </div>
      <div className="px-5 py-3 border-b border-[#333] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#c8a96e] flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-[#1e1e1e]" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium">{user.name}</p>
          <span className="text-xs bg-[#c8a96e] text-[#1e1e1e] font-bold px-1.5 rounded">管理者</span>
        </div>
      </div>
      <nav className="flex-1 py-3">
        <p className="px-5 text-[#555] text-xs font-semibold uppercase tracking-wider mb-1 mt-2">管理メニュー</p>
        {ADMIN_NAV.map(n => <SidebarItem key={n.id} {...n} active={active} onClick={(id: string) => { setActive(id); setSidebarOpen(false); }} />)}
        <div className="mt-4 pt-3 border-t border-[#333]">
          <p className="px-5 text-[#555] text-xs font-semibold uppercase tracking-wider mb-1">サイト</p>
          <Link to="/"><div className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#aaa] hover:text-white transition-colors"><Home className="h-4 w-4" />サイトを見る</div></Link>
          <Link to="/properties"><div className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#aaa] hover:text-white transition-colors"><Building2 className="h-4 w-4" />物件一覧</div></Link>
        </div>
      </nav>
      <div className="px-5 py-4 border-t border-[#333]">
        <button onClick={async () => { await logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-2 py-2 text-sm text-[#aaa] hover:text-red-400 rounded transition-colors">
          <LogOut className="h-4 w-4" />ログアウト
        </button>
      </div>
    </aside>
  );

  const renderContent = () => {
    switch (active) {

      // ── 物件管理 ──
      case 'properties': return <AdminPropertyManager />;

      // ── AI記事生成 ──
      case 'articles': return <AdminArticleGenerator />;

      // ── 概要 ──
      case 'overview': return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users,       color: 'bg-[#8a6c3e]', label: '会員数',       value: users.length },
              { icon: ClipboardList, color: 'bg-amber-500', label: '退去申請（未対応）', value: moveouts.filter(m=>m.status==='pending').length },
              { icon: Calculator,  color: 'bg-green-600',  label: '査定依頼（未対応）', value: valuations.filter(v=>v.status==='pending').length },
              { icon: Bell,        color: 'bg-red-500',    label: '未読合計',     value: unreadMoveouts + unreadValuations },
            ].map(s => (
              <Card key={s.label} className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[#888]">{s.label}</p>
                    <p className="text-2xl font-bold text-[#3d2e1e]">{s.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 最新退去申請 */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#8a6c3e]" />
                <h3 className="font-bold text-[#3d2e1e]">最新の退去申請</h3>
                {unreadMoveouts > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadMoveouts}</span>}
              </div>
              <button onClick={() => setActive('moveouts')} className="text-xs text-[#8a6c3e] hover:underline flex items-center gap-1">すべて見る<ChevronRight className="h-3 w-3"/></button>
            </div>
            {moveouts.length === 0 ? (
              <p className="text-[#999] text-sm text-center py-6">退去申請はありません</p>
            ) : (
              <div className="divide-y divide-[#f0ebe3]">
                {moveouts.slice(0, 5).map(m => (
                  <div key={m.id} className={`py-3 flex items-center justify-between gap-3 ${!m.isRead ? 'bg-amber-50 -mx-1 px-1 rounded' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      {!m.isRead && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#3d2e1e] truncate">{m.name}様</p>
                        <p className="text-xs text-[#999]">物件ID: {m.propertyId} / {m.roomNumber}</p>
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      );

      // ── 退去申請一覧 ──
      case 'moveouts': return (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <ClipboardList className="h-5 w-5 text-[#8a6c3e]" />
            <h2 className="text-lg font-bold text-[#3d2e1e]">退去申請受付一覧</h2>
            {unreadMoveouts > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">未読 {unreadMoveouts}件</span>}
          </div>
          {moveouts.length === 0 ? (
            <Card className="py-16 text-center">
              <ClipboardList className="h-12 w-12 text-[#ccc] mx-auto mb-3" />
              <p className="text-[#999]">退去申請はまだありません</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {moveouts.map(m => (
                <Card key={m.id} className={`p-4 ${!m.isRead ? 'border-amber-300 bg-amber-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {!m.isRead && <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-[#3d2e1e]">{m.name} 様</p>
                          <StatusBadge status={m.status} />
                          {!m.isRead && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">NEW</span>}
                        </div>
                        <div className="text-xs text-[#888] mt-1 space-y-0.5">
                          <p className="flex items-center gap-1"><Mail className="h-3 w-3"/>{m.email}</p>
                          <p className="flex items-center gap-1"><Phone className="h-3 w-3"/>{m.phone}</p>
                          <p>物件ID: {m.propertyId} / 部屋: {m.roomNumber} / 退去予定: {m.moveoutDate ? new Date(m.moveoutDate).toLocaleDateString('ja-JP') : '未設定'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => { markMoveoutRead(m.id); setDetailItem({ type: 'moveout', data: m }); }}
                        className="flex items-center gap-1 text-xs bg-[#8a6c3e] text-white px-3 py-1.5 rounded hover:bg-[#6e5430] transition-colors">
                        <Eye className="h-3 w-3"/>詳細
                      </button>
                      {m.status === 'pending' && (
                        <button onClick={() => updateMoveoutStatus(m.id, 'confirmed')}
                          className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors">
                          <CheckCircle className="h-3 w-3"/>確認済にする
                        </button>
                      )}
                      {m.status === 'confirmed' && (
                        <button onClick={() => updateMoveoutStatus(m.id, 'completed')}
                          className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors">
                          <CheckCircle className="h-3 w-3"/>完了にする
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      );

      // ── 査定依頼一覧 ──
      case 'valuations': return (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Calculator className="h-5 w-5 text-[#8a6c3e]" />
            <h2 className="text-lg font-bold text-[#3d2e1e]">査定依頼一覧</h2>
            {unreadValuations > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">未読 {unreadValuations}件</span>}
          </div>
          {valuations.length === 0 ? (
            <Card className="py-16 text-center">
              <Calculator className="h-12 w-12 text-[#ccc] mx-auto mb-3" />
              <p className="text-[#999]">査定依頼はまだありません</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {valuations.map(v => (
                <Card key={v.id} className={`p-4 ${!v.isRead ? 'border-amber-300 bg-amber-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#3d2e1e]">{v.name} 様</p>
                        <StatusBadge status={v.status} />
                        {!v.isRead && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">NEW</span>}
                      </div>
                      <div className="text-xs text-[#888] mt-1 space-y-0.5">
                        <p className="flex items-center gap-1"><Mail className="h-3 w-3"/>{v.email}</p>
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3"/>{v.phone}</p>
                        <p>種別: {v.propertyType} / 住所: {v.address} / {v.area}㎡ / 築{v.age}年</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {v.status === 'pending' && (
                        <button onClick={() => updateValuationStatus(v.id, 'in_progress')}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors">
                          対応中にする
                        </button>
                      )}
                      {v.status === 'in_progress' && (
                        <button onClick={() => updateValuationStatus(v.id, 'completed')}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors">
                          完了にする
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      );

      // ── 会員一覧 ──
      case 'members': return (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Users className="h-5 w-5 text-[#8a6c3e]" />
            <h2 className="text-lg font-bold text-[#3d2e1e]">会員一覧</h2>
            <span className="text-xs bg-[#f5f0e8] text-[#8a6c3e] border border-[#c8a96e] px-2 py-0.5 rounded-full">{users.length}名</span>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f5f0e8] border-b border-[#ddd5c8]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b5230]">名前</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b5230]">メールアドレス</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b5230]">権限</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b5230]">状態</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b5230]">登録日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebe3]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-[#faf7f2] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#e8e0d4] flex items-center justify-center flex-shrink-0">
                            <User className="h-3.5 w-3.5 text-[#8a6c3e]" />
                          </div>
                          <span className="font-medium text-[#3d2e1e]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#666]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-[#c8a96e]/20 text-[#8a6c3e]' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 'admin' ? '管理者' : '一般会員'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.isActive ? '有効' : '無効'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#999]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ja-JP') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      {/* PC サイドバー */}
      <div className="hidden lg:flex"><Sidebar /></div>

      {/* スマホ サイドバー */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-60"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#ddd5c8] px-5 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button className="lg:hidden p-1.5 rounded hover:bg-[#f5f0e8]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-[#3d2e1e]" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#3d2e1e]">
              {ADMIN_NAV.find(n => n.id === active)?.label || 'ダッシュボード'}
            </p>
            <p className="text-xs text-[#999]">管理者：{user.name}</p>
          </div>
          {(unreadMoveouts + unreadValuations) > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600 font-bold">
              <Bell className="h-4 w-4" />
              未読 {unreadMoveouts + unreadValuations}件
            </div>
          )}
        </header>
        <main className="flex-1 p-5 md:p-7">{renderContent()}</main>
      </div>

      {/* 詳細モーダル */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0]">
              <h3 className="font-bold text-[#3d2e1e]">退去申請詳細</h3>
              <button onClick={() => setDetailItem(null)} className="text-[#999] hover:text-[#3d2e1e]"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {Object.entries(detailItem.data).filter(([k]) => !['id','isRead'].includes(k)).map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-[#999] w-28 flex-shrink-0 text-xs pt-0.5">{k}</span>
                  <span className="text-[#3d2e1e] break-all">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════
//  一般ユーザーダッシュボード
// ══════════════════════════════════════════
const UserDashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { favorites, isLoading: favLoading } = useFavorites();
  const [active, setActive] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const USER_NAV = [
    { id: 'home',      icon: Home,       label: 'マイページ',   badge: 0 },
    { id: 'favorites', icon: Heart,      label: 'お気に入り',   badge: 0 },
    { id: 'moveout',   icon: FileText,   label: '退去申請',     badge: 0 },
    { id: 'valuation', icon: Calculator, label: '売却査定',     badge: 0 },
  ];

  const Sidebar = () => (
    <aside className="w-60 min-h-screen bg-[#1e1e1e] flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-[#333]">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#c8a96e]" />
          <div>
            <p className="text-white font-bold text-sm">(有)長門不動産</p>
            <p className="text-[#888] text-xs">マイページ</p>
          </div>
        </Link>
      </div>
      <div className="px-5 py-3 border-b border-[#333] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#c8a96e] flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-[#1e1e1e]" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-[#888] text-xs truncate">{user.email}</p>
        </div>
      </div>
      <nav className="flex-1 py-3">
        {USER_NAV.map(n => <SidebarItem key={n.id} {...n} active={active} onClick={(id: string) => { setActive(id); setSidebarOpen(false); }} />)}
        <div className="mt-4 pt-3 border-t border-[#333]">
          <p className="px-5 text-[#555] text-xs font-semibold uppercase tracking-wider mb-1">物件</p>
          <Link to="/properties"><div className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#aaa] hover:text-white transition-colors"><Building2 className="h-4 w-4"/>物件を探す</div></Link>
          <Link to="/contact"><div className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#aaa] hover:text-white transition-colors"><Bell className="h-4 w-4"/>お問い合わせ</div></Link>
        </div>
      </nav>
      <div className="px-5 py-4 border-t border-[#333]">
        <button onClick={async () => { await logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-2 py-2 text-sm text-[#aaa] hover:text-red-400 rounded transition-colors">
          <LogOut className="h-4 w-4"/>ログアウト
        </button>
      </div>
    </aside>
  );

  const renderContent = () => {
    switch (active) {
      case 'home': return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#8a6c3e] to-[#6b5230] rounded-xl p-6 text-white">
            <p className="text-sm text-white/70 mb-1">ようこそ</p>
            <h2 className="text-2xl font-bold">{user.name} さん</h2>
            <p className="text-white/80 text-sm mt-1">長門不動産マイページへ</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { to: '/properties', icon: Building2, label: '物件を探す',    desc: '長門市の賃貸・売買物件を検索', color: 'bg-green-600' },
              { to: '/valuation',  icon: Calculator, label: '売却査定を依頼', desc: '無料でオンライン査定', color: 'bg-[#8a6c3e]' },
              { to: '/moveout',    icon: FileText,   label: '退去申請',     desc: '退去のお手続き', color: 'bg-amber-600' },
              { to: '/contact',    icon: Bell,       label: 'お問い合わせ', desc: '平日 9:00〜18:00', color: 'bg-gray-600' },
            ].map(item => (
              <Link to={item.to} key={item.to}>
                <Card className="p-4 hover:shadow-md transition-shadow hover:border-[#c8a96e]">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#3d2e1e] text-sm">{item.label}</p>
                      <p className="text-xs text-[#999]">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#ccc]" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      );

      case 'favorites': return (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Heart className="h-5 w-5 text-[#8a6c3e]" />
            <h2 className="text-lg font-bold text-[#3d2e1e]">お気に入り物件</h2>
            <span className="text-xs bg-[#f5f0e8] text-[#8a6c3e] border border-[#c8a96e] px-2 py-0.5 rounded-full">{favorites.length}件</span>
          </div>
          {favLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-[#ede8e0] rounded animate-pulse" />)}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {favorites.map(p => <PropertyCard key={p.id} property={p} showFavoriteButton />)}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <Heart className="h-12 w-12 text-[#ccc] mx-auto mb-3" />
              <p className="text-[#999] mb-4">お気に入りの物件がありません</p>
              <Link to="/properties"><Button className="bg-[#8a6c3e] hover:bg-[#6e5430]">物件を探す</Button></Link>
            </Card>
          )}
        </div>
      );

      case 'moveout': return (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <FileText className="h-5 w-5 text-[#8a6c3e]" />
            <h2 className="text-lg font-bold text-[#3d2e1e]">退去申請</h2>
          </div>
          <Card className="p-6">
            <p className="text-sm text-[#666] mb-4">退去申請フォームに移動して手続きを行ってください。</p>
            <Link to="/moveout"><Button className="bg-[#8a6c3e] hover:bg-[#6e5430]">退去申請フォームへ</Button></Link>
          </Card>
        </div>
      );

      case 'valuation': return (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="h-5 w-5 text-[#8a6c3e]" />
            <h2 className="text-lg font-bold text-[#3d2e1e]">無料売却査定</h2>
          </div>
          <Card className="p-6">
            <p className="text-sm text-[#666] mb-4">オンラインで無料査定を依頼できます。</p>
            <Link to="/valuation"><Button className="bg-[#8a6c3e] hover:bg-[#6e5430]">査定依頼フォームへ</Button></Link>
          </Card>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <div className="hidden lg:flex"><Sidebar /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-60"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#ddd5c8] px-5 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button className="lg:hidden p-1.5 rounded hover:bg-[#f5f0e8]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-[#3d2e1e]" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#3d2e1e]">{USER_NAV.find(n => n.id === active)?.label || 'マイページ'}</p>
            <p className="text-xs text-[#999]">こんにちは、{user.name}さん</p>
          </div>
          <Link to="/" className="hidden sm:flex items-center gap-1 text-xs text-[#8a6c3e] hover:underline">
            <Home className="h-3.5 w-3.5"/>サイトへ戻る
          </Link>
        </header>
        <main className="flex-1 p-5 md:p-7">{renderContent()}</main>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
//  エントリーポイント：権限で分岐
// ══════════════════════════════════════════
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }
  if (user.role === 'admin') return <AdminDashboard user={user} />;
  return <UserDashboard user={user} />;
};

export default Dashboard;
