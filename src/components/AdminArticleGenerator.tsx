import React, { useState, useMemo } from 'react';
import { PROPERTIES } from '@/data/properties';
import { Property } from '@/types/database';
import {
  Sparkles, Check, Copy, Search, Building2, FileText,
  Instagram, Twitter, Home, Bell, X, Key, AlertCircle,
  Loader2, Send, Edit3, Globe
} from 'lucide-react';

const CUSTOM_KEY  = 'admin_custom_props';
const DELETED_KEY = 'admin_deleted_props';
const API_KEY_KEY = 'admin_anthropic_key';
export const ARTICLES_KEY = 'site_articles';

const loadLS = <T,>(key: string, fb: T): T => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
};

export interface SiteArticle {
  id: string;
  title: string;
  body: string;
  articleType: string;
  propertyIds: string[];
  publishedAt: string;
  status: 'draft' | 'published';
}

// ─── 長門市エリア情報 ───
const NAGATO_CONTEXT = `
長門不動産は山口県長門市の不動産会社。
長門市のエリア情報：
- 東深川・西深川（深川地区）: 長門市の中心部。JR長門市駅、市役所、スーパーマルナカ、ニシムタ、コンビニ各社、飲食店多数。
- 仙崎地区: 仙崎港・仙崎漁港。くじら資料館、仙崎海水浴場。静かな漁師町の雰囲気。
- 三隅地区: JR長門三隅駅周辺。三隅川沿いの自然豊か。ホームセンターコーナン近く。
- 日置地区: 日本海沿岸。釣りやサーフィンのスポット。のんびりした生活スタイル。
- 油谷地区: 向津具半島。棚田・龍宮の潮吹。移住者に人気のエリア。
- 俵山地区: 俵山温泉郷。温泉が日常に。山間の静かな環境。
- 深川湯本（湯本温泉）: 長門湯本温泉。音信川沿いの風情ある街並み。
スーパー：マルナカ、ニシムタ、エブリイ / コンビニ：セブン、ファミマ、ローソン
`;

type ArticleType = 'intro' | 'sns_instagram' | 'sns_twitter' | 'life' | 'news';

const ARTICLE_TYPES: { id: ArticleType; icon: React.FC<any>; label: string; desc: string; color: string }[] = [
  { id: 'intro',         icon: FileText,   label: '物件紹介記事',    desc: 'ブログ・サイト掲載用',      color: 'bg-[#8a6c3e]' },
  { id: 'sns_instagram', icon: Instagram,  label: 'Instagram投稿',   desc: '絵文字・ハッシュタグ付き',   color: 'bg-pink-600' },
  { id: 'sns_twitter',   icon: Twitter,    label: 'X（Twitter）投稿', desc: '140文字以内',               color: 'bg-sky-600' },
  { id: 'life',          icon: Home,       label: '生活情報記事',    desc: '周辺環境・暮らし方',          color: 'bg-green-700' },
  { id: 'news',          icon: Bell,       label: '新着お知らせ',    desc: '新物件追加のお知らせ',        color: 'bg-amber-600' },
];

const STAFF_PERSONA = `あなたは長門不動産のスタッフ・田中さん（30代女性、長門市在住10年）です。
地元への愛情があり、親しみやすく、でも情報はしっかり伝えるプロ。
堅くなく、友人に話しかけるような温かみのある文体で書いてください。
「〜ですよ！」「〜なんです」「ぜひ〜してみてください」など自然な語り口で。
絶対に嘘をつかず、物件情報に基づいた内容のみ書く。`;

const buildPrompt = (type: ArticleType, properties: Property[], extraNote: string): string => {
  const isMulti = properties.length > 1;
  const propBlock = properties.map((p, i) => {
    const price = p.type === 'rent'
      ? `月額 ${(p.rent || p.price).toLocaleString()}円（管理費 ${p.managementFee || 0}円）`
      : `${p.price.toLocaleString()}円`;
    return `【物件${isMulti ? i + 1 : ''}】
- 物件名: ${p.title} / 種別: ${p.type === 'rent' ? '賃貸' : '売買'} / 住所: ${p.address}
- 価格: ${price} / 面積: ${p.area}㎡ / 間取り: ${p.rooms}部屋 / 築${p.age}年
- 駅: ${p.station || 'なし'}${p.walkingTime ? ` 徒歩${p.walkingTime}分` : ''} / 設備: ${p.features.join('、') || 'なし'}
- 説明: ${p.description || 'なし'}`;
  }).join('\n\n');

  const note = extraNote ? `\n追加メモ：${extraNote}` : '';

  if (type === 'intro') return `${STAFF_PERSONA}\n\n${NAGATO_CONTEXT}\n\n${propBlock}\n\n
${isMulti ? `これら${properties.length}件の物件をまとめて紹介するサイト掲載用記事を書いてください。
構成：①キャッチーな見出し ②各物件の魅力ポイントを1〜2文 ③共通のおすすめポイント・エリアの魅力 ④スタッフからの一言 ⑤問い合わせへの誘導
文字数：600〜900文字` : `この物件のサイト掲載用紹介記事を書いてください。
構成：①キャッチーな見出し（〇〇な方におすすめ！など）②物件の魅力3〜4ポイント ③周辺環境・生活の便利さ ④スタッフからの一言 ⑤問い合わせへの誘導
文字数：500〜700文字`}${note}`;

  if (type === 'sns_instagram') return `${STAFF_PERSONA}\n\n${NAGATO_CONTEXT}\n\n${propBlock}\n\n
${isMulti ? `${properties.length}件の物件をまとめて` : 'この物件の'}Instagram投稿文を作成してください。
要件：冒頭は絵文字で始める / 魅力をテンポよく / 生活イメージが湧く表現 / 最後にハッシュタグ10〜15個（#長門不動産 #長門市 など） / 全体300文字以内${note}`;

  if (type === 'sns_twitter') return `${STAFF_PERSONA}\n\n${propBlock}\n\n
${isMulti ? `${properties.length}件の物件をまとめて` : 'この物件の'}X（Twitter）投稿文を作成してください。
要件：140文字以内 / 最初に絵文字1〜2個 / 一番の売りを一言で / #長門不動産 タグ付き${note}`;

  if (type === 'life') return `${STAFF_PERSONA}\n\n${NAGATO_CONTEXT}\n\n${propBlock}\n\n
${isMulti ? `これら${properties.length}件の` : 'この'}物件周辺の生活情報記事を書いてください。
構成：①エリア紹介（雰囲気） ②買い物事情 ③交通アクセス ④休日の過ごし方 ⑤スタッフが感じる好きなところ
文字数：600〜800文字${note}`;

  if (type === 'news') return `${STAFF_PERSONA}\n\n${propBlock}\n\n
${isMulti ? `${properties.length}件の` : ''}新着物件のお知らせブログ記事を書いてください。
構成：①タイトル（「新着！〇〇エリアに〇〇が出ました！」風） ②物件概要${isMulti ? '（各物件を2〜3行）' : '3行で'} ③おすすめしたい方 ④スタッフひとこと ⑤TEL: 0837-22-3321（平日9〜18時）
文字数：${isMulti ? '400〜600文字' : '300〜400文字'}${note}`;

  return '';
};

// ─── コンポーネント ───
const AdminArticleGenerator: React.FC = () => {
  const [apiKey, setApiKey]           = useState<string>(localStorage.getItem(API_KEY_KEY) || '');
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem(API_KEY_KEY));
  const [search, setSearch]           = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [articleType, setArticleType] = useState<ArticleType>('intro');
  const [extraNote, setExtraNote]     = useState('');
  const [generating, setGenerating]   = useState(false);
  const [result, setResult]           = useState('');
  const [error, setError]             = useState('');
  const [copied, setCopied]           = useState(false);
  const [statMode, setStatMode]       = useState(false);
  // 投稿モーダル
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle]         = useState('');
  const [postStatus, setPostStatus]       = useState<'draft' | 'published'>('published');
  const [posted, setPosted]               = useState(false);

  const deletedIds = new Set<string>(loadLS<string[]>(DELETED_KEY, []));
  const customProps: Property[] = loadLS<Property[]>(CUSTOM_KEY, []);
  const allProperties = useMemo(() => [
    ...PROPERTIES.filter(p => !deletedIds.has(p.id)),
    ...customProps.filter(p => !deletedIds.has(p.id)),
  ], []);

  const rentCount = allProperties.filter(p => p.type === 'rent').length;
  const saleCount = allProperties.filter(p => p.type === 'sale').length;

  const filtered = useMemo(() => allProperties.filter(p => {
    const q = search.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
  }), [allProperties, search]);

  const selectedProperties = allProperties.filter(p => selectedIds.has(p.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const saveKey = () => {
    if (apiKey.trim()) { localStorage.setItem(API_KEY_KEY, apiKey.trim()); setShowKeyInput(false); }
  };

  const extractTitle = (text: string) => {
    const first = text.split('\n').find(l => l.trim());
    return first?.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim().slice(0, 60) || '無題の記事';
  };

  const openPostModal = () => {
    setPostTitle(extractTitle(result));
    setPosted(false);
    setShowPostModal(true);
  };

  const handlePost = () => {
    const articles: SiteArticle[] = loadLS<SiteArticle[]>(ARTICLES_KEY, []);
    const newArticle: SiteArticle = {
      id: `article_${Date.now()}`,
      title: postTitle || extractTitle(result),
      body: result,
      articleType: statMode ? 'stat' : articleType,
      propertyIds: [...selectedIds],
      publishedAt: new Date().toISOString(),
      status: postStatus,
    };
    localStorage.setItem(ARTICLES_KEY, JSON.stringify([newArticle, ...articles]));
    setPosted(true);
    setTimeout(() => setShowPostModal(false), 1800);
  };

  const generate = async () => {
    if (!apiKey) { setShowKeyInput(true); return; }
    if (!statMode && selectedIds.size === 0) { setError('物件を1件以上選択してください'); return; }
    setGenerating(true); setResult(''); setError('');

    const prompt = statMode
      ? `${STAFF_PERSONA}

現在の物件掲載状況：
- 賃貸物件：${rentCount}件
- 売買物件：${saleCount}件
- 合計：${rentCount + saleCount}件

「${rentCount + saleCount}件の物件を掲載しました！」というタイトルの物件掲載お知らせ記事を書いてください。

【構成】
1. タイトル：「新着物件を〇件掲載しました！」「〇件の物件情報を更新しました！」など具体的な件数入りのタイトル
2. 導入文：今回の掲載・更新についての簡単な挨拶とお礼（2〜3文）
3. 各物件カテゴリー別のご案内：
   - 賃貸物件（${rentCount}件）についての概要とおすすめポイント
   - 売買物件（${saleCount}件）についての概要とおすすめポイント
4. どんな方におすすめか（ファミリー・単身・移住希望など具体的に）
5. スタッフからのひとこと
6. お問い合わせ先（TEL: 0837-22-3321、平日9〜18時、土日祝10〜17時）

文字数：400〜500文字。不動産会社らしいお知らせ記事のトーンで、親しみやすく。`
      : buildPrompt(articleType, selectedProperties, extraNote);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `API Error ${res.status}`); }
      const data = await res.json();
      setResult(data.content?.[0]?.text || '');
    } catch (e: any) {
      setError(e.message || '生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#8a6c3e]"/>
          <h2 className="text-lg font-bold text-[#3d2e1e]">AI記事生成</h2>
          <span className="text-xs bg-[#f5f0e8] text-[#8a6c3e] border border-[#c8a96e] px-2 py-0.5 rounded-full">
            賃貸 {rentCount}件 ／ 売買 {saleCount}件
          </span>
        </div>
        <button onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-2 text-xs text-[#8a6c3e] border border-[#c8a96e] px-3 py-1.5 rounded-lg hover:bg-[#faf7f2] transition-colors">
          <Key className="h-3.5 w-3.5"/>APIキー設定
        </button>
      </div>

      {/* APIキー入力 */}
      {showKeyInput && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-amber-800">Anthropic APIキーが必要です</p>
              <p className="text-xs text-amber-700 mt-0.5">
                <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="underline">console.anthropic.com</a> で取得できます。キーはブラウザに保存されます。
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..." onKeyDown={e => e.key === 'Enter' && saveKey()}
              className="flex-1 border border-amber-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 bg-white"/>
            <button onClick={saveKey} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 flex items-center gap-2">
              <Check className="h-4 w-4"/>保存
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 左：設定パネル */}
        <div className="space-y-4">

          {/* 生成モード */}
          <div className="bg-white border border-[#ddd5c8] rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-[#6b5230] uppercase tracking-wider">生成モード</p>
            <div className="flex gap-2">
              <button onClick={() => setStatMode(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${statMode ? 'bg-[#8a6c3e] text-white border-[#8a6c3e]' : 'bg-white text-[#666] border-[#ddd5c8] hover:bg-[#f5f0e8]'}`}>
                📋 物件掲載お知らせ記事
              </button>
              <button onClick={() => setStatMode(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${!statMode ? 'bg-[#8a6c3e] text-white border-[#8a6c3e]' : 'bg-white text-[#666] border-[#ddd5c8] hover:bg-[#f5f0e8]'}`}>
                🏠 個別物件の記事
              </button>
            </div>
          </div>

          {/* 記事タイプ */}
          {!statMode && (
            <div className="bg-white border border-[#ddd5c8] rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-[#6b5230] uppercase tracking-wider">記事タイプ</p>
              <div className="grid grid-cols-1 gap-2">
                {ARTICLE_TYPES.map(t => (
                  <button key={t.id} onClick={() => setArticleType(t.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${articleType === t.id ? 'border-[#c8a96e] bg-[#faf7f2]' : 'border-[#e8e0d4] hover:border-[#c8a96e]'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.color} flex-shrink-0`}>
                      <t.icon className="h-4 w-4 text-white"/>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${articleType === t.id ? 'text-[#8a6c3e]' : 'text-[#3d2e1e]'}`}>{t.label}</p>
                      <p className="text-xs text-[#999]">{t.desc}</p>
                    </div>
                    {articleType === t.id && <Check className="h-4 w-4 text-[#8a6c3e] flex-shrink-0"/>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 物件選択 */}
          {!statMode && (
            <div className="bg-white border border-[#ddd5c8] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#6b5230] uppercase tracking-wider">物件を選択（複数可）</p>
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <span className="text-xs bg-[#8a6c3e] text-white px-2 py-0.5 rounded-full font-bold">{selectedIds.size}件選択中</span>
                  )}
                  <button onClick={() => setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)))}
                    className="text-xs text-[#8a6c3e] hover:underline">
                    {selectedIds.size === filtered.length ? '全解除' : '全選択'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#f5f0e8] rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-[#999] flex-shrink-0"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="物件名・住所で検索..." className="flex-1 text-sm outline-none bg-transparent text-[#3d2e1e] placeholder-[#bbb]"/>
                {search && <button onClick={() => setSearch('')} className="text-[#999]"><X className="h-3.5 w-3.5"/></button>}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {filtered.map(p => {
                  const on = selectedIds.has(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleSelect(p.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${on ? 'border-[#c8a96e] bg-[#faf7f2]' : 'border-transparent hover:bg-[#f5f0e8]'}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${on ? 'bg-[#8a6c3e] border-[#8a6c3e]' : 'border-[#ccc]'}`}>
                        {on && <Check className="h-2.5 w-2.5 text-white"/>}
                      </div>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-10 h-8 object-cover rounded border border-[#e0d8cc] flex-shrink-0" onError={e => (e.target as HTMLImageElement).style.display='none'}/>
                        : <div className="w-10 h-8 bg-[#f0ebe3] rounded flex items-center justify-center flex-shrink-0"><Building2 className="h-3.5 w-3.5 text-[#ccc]"/></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#3d2e1e] truncate">{p.title}</p>
                        <p className="text-xs text-[#999] truncate">{p.address}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${p.type==='rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {p.type==='rent' ? '賃貸' : '売買'}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedIds.size > 0 && (
                <div className="bg-[#f5f0e8] rounded-lg p-2.5 flex flex-wrap gap-1.5">
                  {[...selectedIds].map(id => {
                    const p = allProperties.find(x => x.id === id);
                    return p ? (
                      <span key={id} className="flex items-center gap-1 bg-[#8a6c3e] text-white text-xs px-2 py-1 rounded-full">
                        <span className="max-w-[100px] truncate">{p.title}</span>
                        <button onClick={() => toggleSelect(id)} className="hover:text-red-200 flex-shrink-0"><X className="h-3 w-3"/></button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* 補足メモ */}
          <div className="bg-white border border-[#ddd5c8] rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-[#6b5230] uppercase tracking-wider">スタッフからの補足メモ（任意）</p>
            <textarea value={extraNote} onChange={e => setExtraNote(e.target.value)} rows={2}
              placeholder="例：オーナーさんがDIYで改装済み、ペット大歓迎、などAIへの追加情報"
              className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e] resize-none"/>
          </div>

          {/* 生成ボタン */}
          <button onClick={generate} disabled={generating || (!statMode && selectedIds.size === 0)}
            className="w-full bg-gradient-to-r from-[#8a6c3e] to-[#6b5230] text-white rounded-xl py-3.5 font-bold text-sm hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2.5 shadow-md transition-all">
            {generating
              ? <><Loader2 className="h-5 w-5 animate-spin"/>生成中...</>
              : <><Sparkles className="h-5 w-5"/>AI記事を生成する</>}
          </button>
        </div>

        {/* 右：生成結果 */}
        <div className="bg-white border border-[#ddd5c8] rounded-xl overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
          <div className="flex items-center justify-between px-4 py-3 bg-[#f5f0e8] border-b border-[#e8e0d4]">
            <p className="text-sm font-bold text-[#3d2e1e]">生成された記事</p>
            {result && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs border border-[#c8a96e] text-[#8a6c3e] px-3 py-1.5 rounded-lg hover:bg-[#f5f0e8] transition-colors">
                  {copied ? <><Check className="h-3.5 w-3.5"/>コピー済み!</> : <><Copy className="h-3.5 w-3.5"/>コピー</>}
                </button>
                <button onClick={openPostModal}
                  className="flex items-center gap-1.5 text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors font-bold">
                  <Send className="h-3.5 w-3.5"/>投稿する
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {!result && !error && !generating && (
              <div className="h-full flex flex-col items-center justify-center text-[#ccc]" style={{ minHeight: '300px' }}>
                <Sparkles className="h-12 w-12 mb-3 text-[#e8e0d4]"/>
                <p className="text-sm">物件を選択して記事を生成してください</p>
              </div>
            )}
            {generating && (
              <div className="h-full flex flex-col items-center justify-center text-[#8a6c3e]" style={{ minHeight: '300px' }}>
                <Loader2 className="h-10 w-10 animate-spin mb-3"/>
                <p className="text-sm font-medium">田中さんが記事を執筆中...</p>
                <p className="text-xs text-[#999] mt-1">少々お待ちください</p>
              </div>
            )}
            {result && (
              <pre className="whitespace-pre-wrap text-sm text-[#3d2e1e] leading-relaxed font-sans">{result}</pre>
            )}
          </div>

          {result && (
            <div className="border-t border-[#e8e0d4] px-4 py-3 bg-[#faf7f2] flex items-center justify-between gap-3">
              <p className="text-xs text-[#999]">※ 公開前に内容をご確認ください。</p>
              <button onClick={openPostModal}
                className="flex items-center gap-1.5 text-xs bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 font-bold transition-colors">
                <Globe className="h-3.5 w-3.5"/>サイトに投稿する
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 投稿モーダル */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0]">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-700"/>
                <h3 className="font-bold text-[#3d2e1e]">記事を投稿する</h3>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-[#999] hover:text-[#3d2e1e]"><X className="h-5 w-5"/></button>
            </div>
            {!posted ? (
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#6b5230] mb-1">記事タイトル</p>
                  <input value={postTitle} onChange={e => setPostTitle(e.target.value)}
                    className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e]"/>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b5230] mb-2">公開設定</p>
                  <div className="flex gap-3">
                    <button onClick={() => setPostStatus('published')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${postStatus==='published' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-[#666] border-[#ddd5c8] hover:border-green-500'}`}>
                      <Globe className="h-4 w-4"/>公開する
                    </button>
                    <button onClick={() => setPostStatus('draft')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${postStatus==='draft' ? 'bg-[#8a6c3e] text-white border-[#8a6c3e]' : 'bg-white text-[#666] border-[#ddd5c8] hover:border-[#c8a96e]'}`}>
                      <Edit3 className="h-4 w-4"/>下書き保存
                    </button>
                  </div>
                </div>
                <div className="bg-[#f5f0e8] rounded-lg p-3">
                  <p className="text-xs text-[#8a6c3e] font-medium mb-1">プレビュー（冒頭100文字）</p>
                  <p className="text-xs text-[#666] leading-relaxed">{result.slice(0, 100)}...</p>
                </div>
                <button onClick={handlePost}
                  className="w-full bg-green-700 text-white rounded-lg py-3 font-bold text-sm hover:bg-green-800 flex items-center justify-center gap-2 transition-colors">
                  <Send className="h-4 w-4"/>
                  {postStatus === 'published' ? '公開投稿する' : '下書きとして保存する'}
                </button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-8 w-8 text-green-600"/>
                </div>
                <p className="font-bold text-[#3d2e1e] mb-1">
                  {postStatus === 'published' ? '公開しました！' : '下書き保存しました'}
                </p>
                <p className="text-xs text-[#999]">「記事管理」メニューから確認・編集できます</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticleGenerator;
