import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mail, Loader2, ChevronDown, Home } from 'lucide-react';
import { PROPERTIES } from '@/data/properties';
import { Property } from '@/types/database';

const API_KEY_KEY = 'admin_anthropic_key';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── プロパティ概要テキスト生成（APIに渡す）───
const buildPropertyContext = () => {
  const rent = PROPERTIES.filter(p => p.type === 'rent');
  const sale = PROPERTIES.filter(p => p.type === 'sale');
  const rentSummary = rent.slice(0, 30).map(p =>
    `[ID:${p.id}] ${p.title} / ${p.address} / ${p.area}㎡ / ${p.rooms}部屋 / 月額${(p.rent||p.price).toLocaleString()}円 / ${p.features.slice(0,3).join('・')}`
  ).join('\n');
  const saleSummary = sale.slice(0, 20).map(p =>
    `[ID:${p.id}] ${p.title} / ${p.address} / ${p.area}㎡ / ${p.price.toLocaleString()}円 / ${p.features.slice(0,3).join('・')}`
  ).join('\n');
  return `
【賃貸物件一覧（${rent.length}件）】
${rentSummary}
...他${Math.max(0,rent.length-30)}件

【売買物件一覧（${sale.length}件）】
${saleSummary}
...他${Math.max(0,sale.length-20)}件
`;
};

const SYSTEM_PROMPT = `あなたは長門不動産（山口県長門市）の受付スタッフ「なぎちゃん」です。
明るく親しみやすく、でもプロフェッショナルに対応します。
長門市に詳しく、地元愛があります。

【重要ルール】
1. 長門不動産の業務（賃貸・売買・売却・不動産相談）に関係する質問のみ回答する
2. 関係のない質問（料理・政治・芸能等）は「お答えできません。お部屋探しや不動産のことならお気軽にどうぞ！」と丁重にお断り
3. 物件を紹介するときは物件名・価格・特徴を具体的に（サイトURLは https://nagato-fudosan.vercel.app/property/[ID]）
4. 賃貸の契約費用の概算には必ず「仲介手数料：家賃1か月分（税込）」を含める
5. 長門市の地域情報（グーグルマップ・口コミ等をもとに）を親しみやすく紹介できる
6. 「もっと詳しく知りたい」「直接聞きたい」場合は「お問い合わせフォームまたは📞 0837-22-3321へ」と案内
7. 返答は長くなりすぎず、テンポよく会話する（最大300文字程度）
8. 絵文字を適度に使って親しみやすく
9. 物件の詳細ページリンクは「👉 [物件名](URL)」の形式で

【長門不動産の情報】
会社名：（有）長門不動産
所在地：山口県長門市
電話：0837-22-3321
営業時間：平日9〜18時、土日祝10〜17時
定休日：毎週水曜・第2火曜・第3日曜
メール：nag3321@sage.ocn.ne.jp

【長門市エリア情報】
- 東深川・西深川：市の中心部。JR長門市駅、スーパーマルナカ・ニシムタ、コンビニ多数
- 仙崎：漁港・仙崎海水浴場。穏やかな漁師町
- 三隅：JR長門三隅駅。三隅川沿い、自然豊か
- 日置：日本海沿岸。サーフィン・釣りスポット
- 油谷：向津具半島。移住者に人気、棚田・龍宮の潮吹
- 俵山：温泉郷。日常に温泉
- 湯本温泉：長門湯本温泉。観光スポット

【賃貸契約費用の目安（概算）】
- 仲介手数料：家賃1か月分（税込）※必ず含める
- 敷金：0〜2か月分（物件による）
- 礼金：0〜1か月分（物件による）
- 前払い家賃：1か月分
- 合計目安：家賃の2〜4か月分

${buildPropertyContext()}`;

// ─── 簡易Markdown→Text変換（リンクはそのまま）───
const renderMessage = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // リンク [text](url)
    const linked = line.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      (_, t, u) => `<a href="${u}" target="_blank" rel="noreferrer" class="text-green-700 underline hover:text-green-900">${t}</a>`
    );
    // 太字 **text**
    const bolded = linked.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className={`${i > 0 && line === '' ? 'mt-2' : ''} leading-relaxed`} dangerouslySetInnerHTML={{ __html: bolded }}/>;
  });
};

const QUICK_REPLIES = [
  '賃貸物件を探したい',
  '契約費用の目安は？',
  '長門市ってどんな街？',
  '売却相談したい',
];

const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'こんにちは！長門不動産のなぎちゃんです😊\nお部屋探しや不動産のことなら何でも聞いてください！\n長門市のこと、物件のご案内、契約の流れなどお答えします✨' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMailForm, setShowMailForm] = useState(false);
  const [mailContent, setMailContent] = useState('');
  const [mailSent, setMailSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const apiKey = localStorage.getItem(API_KEY_KEY) || '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    if (!apiKey) {
      setMessages([...newMessages, { role: 'assistant', content: 'AIチャットを使うにはAPIキーの設定が必要です。管理画面の「AIキー設定」から設定してください。' }]);
      setLoading(false);
      return;
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
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || '申し訳ありません、少し問題が発生しました。お電話（0837-22-3321）かメールでお問い合わせください。';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'ネットワークエラーが発生しました。📞 0837-22-3321 までお電話ください。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMailSend = () => {
    const subject = encodeURIComponent('【チャットからのお問い合わせ】長門不動産');
    const body = encodeURIComponent(`${mailContent}\n\n---\nチャットボットからの転送`);
    window.location.href = `mailto:nag3321@sage.ocn.ne.jp?subject=${subject}&body=${body}`;
    setMailSent(true);
    setTimeout(() => { setShowMailForm(false); setMailSent(false); }, 2000);
  };

  // チャット履歴をメール本文に変換
  const chatToMailText = () => messages.map(m => `【${m.role === 'user' ? 'お客様' : 'なぎちゃん'}】\n${m.content}`).join('\n\n');

  return (
    <>
      {/* ─── フローティングボタン ─── */}
      <div className="fixed bottom-24 lg:bottom-8 right-4 z-50">
        {/* 吹き出し */}
        {!open && (
          <div className="absolute -top-10 right-0 bg-green-700 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-md animate-bounce">
            お気軽にどうぞ！
            <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-green-700 rotate-45"/>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl border-2 border-white hover:scale-110 transition-transform focus:outline-none"
          aria-label="チャットを開く"
        >
          <video
            ref={videoRef}
            src="/chatbot-avatar.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {open && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <X className="h-6 w-6 text-white"/>
            </div>
          )}
        </button>
      </div>

      {/* ─── チャットウィンドウ ─── */}
      {open && (
        <div className="fixed bottom-44 lg:bottom-28 right-4 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-[#e8e0d4] overflow-hidden flex flex-col"
          style={{ maxHeight: '520px' }}>

          {/* ヘッダー */}
          <div className="bg-green-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
              <video src="/chatbot-avatar.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover"/>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">なぎちゃん</p>
              <p className="text-green-200 text-xs">長門不動産 AIスタッフ</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowMailForm(true)} title="メールで送る"
                className="text-green-200 hover:text-white transition-colors">
                <Mail className="h-4 w-4"/>
              </button>
              <button onClick={() => setOpen(false)} className="text-green-200 hover:text-white transition-colors">
                <ChevronDown className="h-5 w-5"/>
              </button>
            </div>
          </div>

          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f9f6f1]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                    <video src="/chatbot-avatar.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover"/>
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                  m.role === 'user'
                    ? 'bg-green-700 text-white rounded-br-none'
                    : 'bg-white text-[#1a1a1a] rounded-bl-none border border-[#e8e0d4]'
                }`}>
                  {renderMessage(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                  <video src="/chatbot-avatar.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover"/>
                </div>
                <div className="bg-white border border-[#e8e0d4] px-3 py-2 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 text-green-600 animate-spin"/>
                  <span className="text-xs text-[#999]">考え中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* クイックリプライ */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-[#f9f6f1] border-t border-[#e8e0d4] flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs bg-white border border-green-300 text-green-700 px-2.5 py-1 rounded-full hover:bg-green-50 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 入力エリア */}
          <div className="border-t border-[#e8e0d4] bg-white px-3 py-2 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
              placeholder="メッセージを入力..."
              className="flex-1 text-sm outline-none bg-transparent text-[#1a1a1a] placeholder-[#bbb]"
              disabled={loading}
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center hover:bg-green-800 disabled:opacity-40 transition-colors flex-shrink-0">
              <Send className="h-3.5 w-3.5"/>
            </button>
          </div>

          {/* メール送信フォーム */}
          {showMailForm && (
            <div className="absolute inset-0 bg-white flex flex-col z-10">
              <div className="bg-green-700 px-4 py-3 flex items-center justify-between">
                <p className="text-white font-bold text-sm">📧 メールで送る</p>
                <button onClick={() => setShowMailForm(false)} className="text-green-200 hover:text-white"><X className="h-4 w-4"/></button>
              </div>
              {!mailSent ? (
                <div className="flex-1 p-4 space-y-3">
                  <p className="text-xs text-[#666]">チャット内容や追加のご質問をメールで送れます。</p>
                  <textarea
                    value={mailContent || chatToMailText()}
                    onChange={e => setMailContent(e.target.value)}
                    rows={8}
                    className="w-full text-xs border border-[#ddd] rounded-lg p-3 outline-none focus:border-green-500 resize-none font-mono"
                  />
                  <button onClick={handleMailSend}
                    className="w-full bg-green-700 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-green-800 flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4"/>メールソフトで送信
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="h-7 w-7 text-green-600"/>
                    </div>
                    <p className="font-bold text-[#1a1a1a]">メールを開きました</p>
                    <p className="text-xs text-[#999] mt-1">送信をお忘れなく！</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
