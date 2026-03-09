import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites, useSavedSearches } from '@/hooks/usePropertySearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Heart, Search, Bell, Settings, LogOut, Home,
  FileText, Calculator, ChevronRight, Menu, X,
  Building2, ClipboardList
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview',       icon: Home,          label: 'ダッシュボード' },
  { id: 'favorites',      icon: Heart,         label: 'お気に入り' },
  { id: 'searches',       icon: Search,        label: '保存した検索' },
  { id: 'notifications',  icon: Bell,          label: '通知' },
  { id: 'requests',       icon: ClipboardList, label: '申請履歴' },
];

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { favorites, isLoading: favLoading } = useFavorites();
  const { savedSearches, isLoading: searchLoading } = useSavedSearches();
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => { await logout(); navigate('/'); };

  // ── サイドバー ──
  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-60 min-h-screen'} bg-[#1e1e1e] flex flex-col`}>
      {/* ロゴ */}
      <div className="px-5 py-5 border-b border-[#333]">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#c8a96e]" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">(有)長門不動産</p>
            <p className="text-[#888] text-xs">マイページ</p>
          </div>
        </Link>
      </div>

      {/* ユーザー情報 */}
      <div className="px-5 py-4 border-b border-[#333] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#c8a96e] flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-[#1e1e1e]" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-[#888] text-xs truncate">{user.email}</p>
        </div>
      </div>

      {/* ナビ */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { setActive(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
              active === item.id
                ? 'bg-[#c8a96e]/20 text-[#c8a96e] border-l-3 border-[#c8a96e]'
                : 'text-[#aaa] hover:bg-[#2a2a2a] hover:text-white'
            }`}
            style={active === item.id ? { borderLeft: '3px solid #c8a96e' } : { borderLeft: '3px solid transparent' }}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </button>
        ))}

        <div className="mt-4 pt-4 border-t border-[#333]">
          <p className="px-5 text-[#555] text-xs font-semibold uppercase tracking-wider mb-2">サービス</p>
          <Link to="/properties">
            <div className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#aaa] hover:bg-[#2a2a2a] hover:text-white transition-colors">
              <Building2 className="h-4 w-4" />物件を探す
            </div>
          </Link>
          <Link to="/valuation">
            <div className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#aaa] hover:bg-[#2a2a2a] hover:text-white transition-colors">
              <Calculator className="h-4 w-4" />売却査定
            </div>
          </Link>
          <Link to="/moveout">
            <div className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#aaa] hover:bg-[#2a2a2a] hover:text-white transition-colors">
              <FileText className="h-4 w-4" />退去申請
            </div>
          </Link>
        </div>
      </nav>

      {/* フッター */}
      <div className="px-5 py-4 border-t border-[#333] space-y-1">
        <button onClick={() => navigate('/contact')} className="w-full flex items-center gap-3 px-2 py-2 text-sm text-[#aaa] hover:text-white rounded transition-colors">
          <Settings className="h-4 w-4" />設定・お問い合わせ
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-sm text-[#aaa] hover:text-red-400 rounded transition-colors">
          <LogOut className="h-4 w-4" />ログアウト
        </button>
      </div>
    </aside>
  );

  // ── コンテンツ部品 ──
  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="h-5 w-5 text-[#8a6c3e]" />
      <h2 className="text-lg font-bold text-[#3d2e1e]">{title}</h2>
    </div>
  );

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded border border-[#ddd5c8] shadow-sm ${className}`}>{children}</div>
  );

  const StatCard = ({ icon: Icon, color, label, value }: any) => (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-xs text-[#888] font-medium">{label}</p>
          <p className="text-2xl font-bold text-[#3d2e1e]">{value}</p>
        </div>
      </div>
    </Card>
  );

  // ── ページコンテンツ ──
  const renderContent = () => {
    switch (active) {

      case 'overview': return (
        <div className="space-y-6">
          {/* 統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Heart}    color="bg-rose-500"   label="お気に入り"     value={favLoading ? '…' : favorites.length} />
            <StatCard icon={Search}   color="bg-green-600"  label="保存した検索"   value={searchLoading ? '…' : savedSearches.length} />
            <StatCard icon={Bell}     color="bg-amber-500"  label="未読通知"       value={0} />
            <StatCard icon={User}     color="bg-[#8a6c3e]"  label="アカウント"     value={user.role === 'admin' ? '管理者' : '一般'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* お気に入り一覧 */}
            <Card className="p-5">
              <SectionTitle icon={Heart} title="最近のお気に入り" />
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-[#999]">
                  <Heart className="h-10 w-10 mx-auto mb-2 text-[#ccc]" />
                  <p className="text-sm">お気に入りの物件がありません</p>
                  <Link to="/properties"><Button size="sm" className="mt-3 bg-[#8a6c3e] hover:bg-[#6e5430]">物件を探す</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f0ebe3]">
                  {favorites.slice(0, 4).map(p => (
                    <Link to={`/property/${p.id}`} key={p.id} className="flex items-center gap-3 py-3 hover:bg-[#faf7f2] rounded px-1 transition-colors">
                      <img src={p.images?.[0]} alt={p.title} className="w-14 h-14 object-cover rounded border border-[#e0d8cc]" onError={(e) => { (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3d2e1e] truncate">{p.title}</p>
                        <p className="text-xs text-[#8a6c3e] font-bold">{p.type === 'rent' ? `¥${p.rent?.toLocaleString()}/月` : `¥${p.price?.toLocaleString()}`}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#ccc] flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* クイックアクション */}
            <Card className="p-5">
              <SectionTitle icon={Settings} title="クイックアクション" />
              <div className="space-y-2">
                {[
                  { to: '/properties', icon: Building2, label: '物件を探す', desc: '長門市の賃貸・売買物件' },
                  { to: '/valuation',  icon: Calculator, label: '売却査定を依頼', desc: '無料でオンライン査定' },
                  { to: '/moveout',    icon: FileText,   label: '退去申請',    desc: '各種お手続き' },
                  { to: '/contact',    icon: Bell,       label: 'お問い合わせ', desc: '平日 9:00〜18:00' },
                ].map(item => (
                  <Link to={item.to} key={item.to}>
                    <div className="flex items-center gap-3 p-3 rounded border border-[#e8e0d4] hover:bg-[#faf7f2] hover:border-[#c8a96e] transition-all">
                      <div className="w-9 h-9 rounded bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-4 w-4 text-[#8a6c3e]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3d2e1e]">{item.label}</p>
                        <p className="text-xs text-[#999]">{item.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#ccc] ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      );

      case 'favorites': return (
        <div>
          <SectionTitle icon={Heart} title="お気に入り物件" />
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

      case 'searches': return (
        <div>
          <SectionTitle icon={Search} title="保存した検索条件" />
          {savedSearches.length > 0 ? (
            <div className="space-y-3">
              {savedSearches.map(s => (
                <Card key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#3d2e1e]">{s.name}</p>
                    <p className="text-xs text-[#999] mt-0.5">作成日：{new Date(s.createdAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <Link to="/properties"><Button size="sm" variant="outline" className="border-[#c8a96e] text-[#8a6c3e]">検索実行</Button></Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <Search className="h-12 w-12 text-[#ccc] mx-auto mb-3" />
              <p className="text-[#999] mb-4">保存された検索条件がありません</p>
              <Link to="/properties"><Button className="bg-[#8a6c3e] hover:bg-[#6e5430]">物件を検索</Button></Link>
            </Card>
          )}
        </div>
      );

      case 'notifications': return (
        <div>
          <SectionTitle icon={Bell} title="通知" />
          <Card className="py-16 text-center">
            <Bell className="h-12 w-12 text-[#ccc] mx-auto mb-3" />
            <p className="text-[#999]">新しい通知はありません</p>
          </Card>
        </div>
      );

      case 'requests': return (
        <div>
          <SectionTitle icon={ClipboardList} title="申請履歴" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#ede8e0]">
                <Calculator className="h-4 w-4 text-[#8a6c3e]" />
                <h3 className="font-bold text-[#3d2e1e]">査定依頼履歴</h3>
              </div>
              <p className="text-[#999] text-sm text-center py-6">査定依頼履歴はありません</p>
              <Link to="/valuation"><Button size="sm" className="w-full bg-[#8a6c3e] hover:bg-[#6e5430]">査定を依頼する</Button></Link>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#ede8e0]">
                <FileText className="h-4 w-4 text-[#8a6c3e]" />
                <h3 className="font-bold text-[#3d2e1e]">退去申請履歴</h3>
              </div>
              <p className="text-[#999] text-sm text-center py-6">退去申請履歴はありません</p>
              <Link to="/moveout"><Button size="sm" className="w-full bg-[#8a6c3e] hover:bg-[#6e5430]">退去申請をする</Button></Link>
            </Card>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">

      {/* PC サイドバー */}
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* スマホ サイドバー（オーバーレイ） */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-60"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* メインエリア */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* トップバー */}
        <header className="bg-white border-b border-[#ddd5c8] px-5 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button className="lg:hidden p-1.5 rounded hover:bg-[#f5f0e8]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-[#3d2e1e]" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#3d2e1e]">{NAV_ITEMS.find(n => n.id === active)?.label}</p>
            <p className="text-xs text-[#999]">こんにちは、{user.name}さん</p>
          </div>
          <Link to="/" className="hidden sm:flex items-center gap-1 text-xs text-[#8a6c3e] hover:underline">
            <Home className="h-3.5 w-3.5" />サイトへ戻る
          </Link>
        </header>

        {/* コンテンツ */}
        <main className="flex-1 p-5 md:p-7">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
