import React, { useState, useMemo } from 'react';
import { PROPERTIES } from '@/data/properties';
import { Property } from '@/types/database';
import {
  Sparkles, Settings, Copy, Check, ChevronDown, Building2,
  Search, RefreshCw, FileText, Instagram, Twitter, Home,
  Bell, X, Key, AlertCircle, ExternalLink, Loader2
} from 'lucide-react';

const CUSTOM_KEY  = 'admin_custom_props';
const DELETED_KEY = 'admin_deleted_props';
const API_KEY_KEY = 'admin_anthropic_key';

const load = <T,>(key: string, fb: T): T => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; } };

// ─── 長門市エリア情報（プロンプトで使う地域知識）───
const NAGATO_CONTEXT = `
長門不動産は山口県長門市の不動産会社。
長門市のエリア情報：
- 東深川・西深川（深川地区）: 長門市の中心部。JR長門市駅、市役所、スーパーマルナカ、ニシムタ、コンビニ各社、飲食店多数。長門市立図書館近く。
- 仙崎地区: 仙崎港・仙崎漁港。生鮮市場「仙崎かまぼこ」「くじら資料館」、仙崎海水浴場。静かな漁師町の雰囲気。
- 三隅地区: JR山陰本線・長門三隅駅周辺。三隅川沿いの自然豊か。ホームセンターコーナン近く。田舎の落ち着いた暮らし。
- 日置地区: 日本海沿岸。自然豊か、釣りやサーフィンのスポット。コンビニは距離あり、のんびりした生活スタイル。
- 油谷地区: 向津具半島（むかつく）。棚田・龍宮の潮吹。農業・漁業が盛ん。移住者に人気のエリア。
- 俵山地区: 俵山温泉郷。温泉が日常に。山間の静かな環境。
- 深川湯本（湯本温泉）: 長門湯本温泉。観光スポット。音信川沿いの風情ある街並み。
スーパー：マルナカ、ニシムタ、エブリイ
コンビニ：セブンイレブン、ファミリーマート、ローソン
医療：長門市立病院
学校：長門市立各小中学校、山口県立長門高校
`;

type ArticleType = 'intro' | 'sns_instagram' | 'sns_twitter' | 'life' | 'news';

const ARTICLE_TYPES: { id: ArticleType; icon: any; label: string; desc: string; color: string }[] = [
  { id: 'intro',         icon: FileText,   label: '物件紹介記事',      desc: 'ブログ・サイト掲載用',  color: 'bg-[#8a6c3e]' },
  { id: 'sns_instagram', icon: Instagram,  label: 'Instagram投稿',     desc: '絵文字多め・ハッシュタグ付き', color: 'bg-pink-600' },
  { id: 'sns_twitter',   icon: Twitter,    label: 'X（Twitter）投稿',   desc: '140文字以内',          color: 'bg-sky-600' },
  { id: 'life',          icon: Home,       label: '生活情報記事',       desc: '周辺環境・暮らし方',    color: 'bg-green-700' },
  { id: 'news',          icon: Bell,       label: '新着お知らせ',       desc: '新物件追加のお知らせ',  color: 'bg-amber-600' },
];

const buildPrompt = (type: ArticleType, properties: Property[], extraNote: string): string => {
  const propInfoBlock = properties.map((property, i) => {
    const priceStr = property.type === 'rent'
      ? `月額 ${(property.rent || property.price).toLocaleString()}円（管理費 ${property.managementFee || 0}円）`
      : `${property.price.toLocaleString()}円`;
    return `【物件${properties.length > 1 ? i + 1 : ''}】
- 物件名: ${property.title}
- 種別: ${property.type === 'rent' ? '賃貸' : '売買'}
- タイプ: ${property.propertyType}
- 住所: ${property.address}
- 価格: ${priceStr}
- 面積: ${property.area}㎡ / 間取り: ${property.rooms}部屋 / 築${property.age}年
- 駅: ${property.station || 'なし'} ${property.walkingTime ? `徒歩${property.walkingTime}分` : ''}
- 設備: ${property.features.join('、') || 'なし'}
- 説明: ${property.description || 'なし'}`;
  }).join('\n\n');

  const STAFF_PERSONA = `あなたは長門不動産のスタッフ・田中さん（30代女性、長門市在住10年）です。
地元への愛情があり、親しみやすく、でも情報はしっかり伝えるプロ。
堅くなく、友人に話しかけるような温かみのある文体で書いてください。
「〜ですよ！」「〜なんです」「ぜひ〜してみてください」など自然な語り口で。
絶対に嘘をつかず、物件情報に基づいた内容のみ書く。`;

  const isMulti = properties.length > 1;

  switch (type) {
    case 'intro':
      return `${STAFF_PERSONA}\n\n${NAGATO_CONTEXT}\n\n${propInfoBlock}\n\n
${isMulti ? `これら${properties.length}件の物件をまとめて紹介するサイト掲載用記事を書いてください。
【構成】
1. キャッチーな見出し（複数物件を横断したテーマで）
2. 各物件の魅力ポイントを1〜2文でテンポよく紹介
3. 共通するおすすめポイント・エリアの魅力
4. スタッフからの一言
5. お問い合わせへの誘導
文字数：600〜900文字` : `この物件のサイト掲載用紹介記事を書いてください。
【構成】
1. キャッチーな見出し（〇〇な方におすすめ！など）
2. 物件の魅力を3〜4つのポイントで紹介
3. 周辺環境・生活の便利さ
4. スタッフからの一言
5. お問い合わせへの誘導
文字数：500〜700文字`}
${extraNote ? `\n追加メモ：${extraNote}` : ''}`;

    case 'sns_instagram':
      return `${STAFF_PERSONA}\n\n${NAGATO_CONTEXT}\n\n${propInfoBlock}\n\n
${isMulti ? `${properties.length}件の物件をまとめて紹介するInstagram投稿文を作成してください。` : 'この物件のInstagram投稿文を作成してください。'}
【要件】
- 冒頭は絵文字で始める
- 物件の魅力をテンポよく（複数の場合は各物件を一言ずつ）
- 生活イメージが湧くような表現
- 最後にハッシュタグ10〜15個（#長門不動産 #長門市 など）
- 全体で300文字以内
${extraNote ? `\n追加メモ：${extraNote}` : ''}`;

    case 'sns_twitter':
      return `${STAFF_PERSONA}\n\n${propInfoBlock}\n\n
${isMulti ? `${properties.length}件の物件をまとめてX（Twitter）投稿文を作成してください。` : 'この物件のX（Twitter）投稿文を作成してください。'}
【要件】
- 140文字以内（日本語）
- 最初に絵文字1〜2個
- ${isMulti ? '各物件を一言ずつ、または共通の魅力を一言で' : '物件の一番の売りを一言で'}
- #長門不動産 タグ付き
${extraNote ? `\n追加メモ：${extraNote}` : ''}`;

    case 'life':
      return `${STAFF_PERSONA}\n\n${NAGATO_CONTEXT}\n\n${propInfoBlock}\n\n
${isMulti ? `これら${properties.length}件の物件エリアの生活情報記事を書いてください。エリアが近い場合はまとめて、離れている場合は各エリアを紹介してください。` : 'この物件周辺の生活情報記事を書いてください。'}
【構成】
1. エリア紹介（どんな雰囲気の街か）
2. 買い物事情（スーパー・コンビニなど）
3. 交通アクセス
4. 休日の過ごし方（自然・観光・グルメなど）
5. スタッフが感じる「このエリアの好きなところ」
文字数：600〜800文字。住所から推測できる範囲で事実のみ。
${extraNote ? `\n追加メモ：${extraNote}` : ''}`;

    case 'news':
      return `${STAFF_PERSONA}\n\n${propInfoBlock}\n\n
${isMulti ? `${properties.length}件の新着物件のお知らせブログ記事を書いてください。` : '新着物件のお知らせブログ記事を書いてください。'}
【構成】
1. タイトル（「新着！〇〇エリアに〇〇が出ました！」風）
2. 物件概要${isMulti ? '（各物件を2〜3行で）' : 'を3行で'}
3. 「今回おすすめしたい方」（ターゲット像を具体的に）
4. スタッフからのひとこと
5. お問い合わせ先（TEL: 0837-22-3321、平日9〜18時）
文字数：${isMulti ? '400〜600文字' : '300〜400文字'}。テンポよく新鮮さが伝わるように。
${extraNote ? `\n追加メモ：${extraNote}` : ''}`;
  }
};

// ─── コンポーネント ───
const AdminArticleGenerator: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem(API_KEY_KEY) || '');
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem(API_KEY_KEY));
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [articleType, setArticleType] = useState<ArticleType>('intro');
  const [extraNote, setExtraNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [statMode, setStatMode] = useState(false);

  const deletedIds = new Set<string>(load<string[]>(DELETED_KEY, []));
  const customProps: Property[] = load<Property[]>(CUSTOM_KEY, []);
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
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const saveKey = () => {
    if (apiKey.trim()) { localStorage.setItem(API_KEY_KEY, apiKey.trim()); setShowKeyInput(false); }
  };

  const generate = async () => {
    if (!apiKey) { setShowKeyInput(true); return; }
    if (!statMode && selectedIds.size === 0) { setError('物件を1件以上選択してください'); return; }

    setGenerating(true); setResult(''); setError('');

    let prompt = '';
    if (statMode) {
      prompt = `あなたは長門不動産のスタッフ・田中さん（30代女性、長門市在住10年）です。
地元愛があり、親しみやすい文体で書いてください。

現在の物件掲載状況：
- 賃貸物件：${rentCount}件
- 売買物件：${saleCount}件
- 合計：${rentCount + saleCount}件

サイトの物件掲載数についてお知らせブログ記事を書いてください。
【内容】
1. タイトル（「おかげさまで〇〇件掲載中！」など）
2. 現在の掲載状況の紹介
3. 長門市で物件を探している方へのメッセージ
4. 賃貸・売買それぞれのおすすめポイント
5. お問い合わせ・来店のご案内（TEL: 0837-22-3321）

文字数：300〜400文字。テンポよく親しみやすく。`;
    } else {
      prompt = buildPrompt(articleType, selectedProperties, extraNote) || '';
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `API Error ${res.status}`);
      }
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

      {/* APIキー設定 */}
      {showKeyInput && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-amber-800">Anthropic APIキーが必要です</p>
              <p className="text-xs text-amber-700 mt-0.5">
                <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="underline hover:no-underline">console.anthropic.com</a> でAPIキーを取得してください。キーはブラウザのlocalStorageに保存されます。
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..." onKeyDown={e => e.key === 'Enter' && saveKey()}
              className="flex-1 border border-amber-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 bg-white"/>
            <button onClick={saveKey}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 flex items-center gap-2">
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
                📊 掲載数お知らせ記事
              </button>
              <button onClick={() => setStatMode(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${!statMode ? 'bg-[#8a6c3e] text-white border-[#8a6c3e]' : 'bg-white text-[#666] border-[#ddd5c8] hover:bg-[#f5f0e8]'}`}>
                🏠 個別物件の記事
              </button>
            </div>
          </div>

          {/* 記事タイプ（個別物件モード時） */}
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
                    <div>
                      <p className={`text-sm font-medium ${articleType === t.id ? 'text-[#8a6c3e]' : 'text-[#3d2e1e]'}`}>{t.label}</p>
                      <p className="text-xs text-[#999]">{t.desc}</p>
                    </div>
                    {articleType === t.id && <Check className="h-4 w-4 text-[#8a6c3e] ml-auto flex-shrink-0"/>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 物件選択（個別物件モード時） */}
          {!statMode && (
            <div className="bg-white border border-[#ddd5c8] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#6b5230] uppercase tracking-wider">物件を選択（複数可）</p>
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <span className="text-xs bg-[#8a6c3e] text-white px-2 py-0.5 rounded-full font-bold">
                      {selectedIds.size}件選択中
                    </span>
                  )}
                  <button onClick={() => {
                    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(filtered.map(p => p.id)));
                  }} className="text-xs text-[#8a6c3e] hover:underline">
                    {selectedIds.size === filtered.length ? '全解除' : '全選択'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#f5f0e8] rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-[#999] flex-shrink-0"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="物件名・住所で検索..." className="flex-1 text-sm outline-none bg-transparent text-[#3d2e1e] placeholder-[#bbb]"/>
                {search && <button onClick={() => setSearch('')} className="text-[#999] hover:text-[#666]"><X className="h-3.5 w-3.5"/></button>}
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
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
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs bg-[#8a6c3e] text-white px-3 py-1.5 rounded-lg hover:bg-[#6e5430] transition-colors">
                {copied ? <><Check className="h-3.5 w-3.5"/>コピー済み!</> : <><Copy className="h-3.5 w-3.5"/>全文コピー</>}
              </button>
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
              <div className="h-full flex flex-col items-center justify-center text-[#ccc]">
                <Sparkles className="h-12 w-12 mb-3 text-[#e8e0d4]"/>
                <p className="text-sm">物件を選択して記事を生成してください</p>
              </div>
            )}
            {generating && (
              <div className="h-full flex flex-col items-center justify-center text-[#8a6c3e]">
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
            <div className="border-t border-[#e8e0d4] px-4 py-3 bg-[#faf7f2]">
              <p className="text-xs text-[#999]">※ AIが生成した文章です。公開前に内容を確認・編集してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminArticleGenerator;
