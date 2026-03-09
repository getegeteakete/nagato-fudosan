import React from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES_KEY, SiteArticle } from './AdminArticleGenerator';
import { PROPERTIES } from '@/data/properties';
import { ArrowRight, Clock, Building2, BookOpen } from 'lucide-react';

const loadLS = <T,>(key: string, fb: T): T => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
};

// 物件紹介タイプだけを対象にする
const INTRO_TYPES = ['intro', 'life', 'news', 'stat'];
const TYPE_LABELS: Record<string, string> = {
  intro: '物件紹介', life: '生活情報', news: '新着お知らせ', stat: '物件掲載お知らせ',
};

// 記事の先頭行をタイトルから除いた本文を取得
const getBody = (body: string) => body.replace(/\*\*/g, '').replace(/^#+\s*.+\n?/, '').replace(/^#+\s*/gm, '').trim();

// OGP的なサムネイル：関連物件の画像 or デフォルトグラデ
const getThumb = (article: SiteArticle): string | null => {
  for (const id of article.propertyIds) {
    const p = PROPERTIES.find(x => x.id === id);
    if (p?.images?.[0]) return p.images[0];
  }
  return null;
};

const GRADIENT_BG = [
  'from-green-800 to-green-600',
  'from-[#8a6c3e] to-[#c8a96e]',
  'from-slate-700 to-slate-500',
  'from-emerald-700 to-emerald-500',
];

const TopArticleSection: React.FC = () => {
  const articles = loadLS<SiteArticle[]>(ARTICLES_KEY, [])
    .filter(a => a.status === 'published' && INTRO_TYPES.includes(a.articleType))
    .slice(0, 6);

  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="py-14 bg-[#f9f6f1]">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-green-700 rounded-full"/>
              <p className="text-xs font-bold text-green-700 tracking-widest uppercase">Staff Blog</p>
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">物件紹介記事</h2>
          </div>
          <Link to="/news"
            className="flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:text-green-900 transition-colors group">
            すべて見る<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"/>
          </Link>
        </div>

        {/* メインレイアウト：特集1件 ＋ サブ最大5件 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* 特集記事（大） */}
          <Link to={`/news/${featured.id}`}
            className="lg:col-span-3 group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col bg-white border border-[#e8e0d4]">
            {/* サムネイル */}
            <div className="relative h-52 sm:h-64 overflow-hidden">
              {getThumb(featured) ? (
                <img src={getThumb(featured)!} alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${GRADIENT_BG[0]} flex items-center justify-center`}>
                  <BookOpen className="h-16 w-16 text-white/40"/>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
              <span className="absolute top-3 left-3 text-xs bg-green-700 text-white px-2.5 py-1 rounded-full font-semibold">
                {TYPE_LABELS[featured.articleType] || 'ブログ'}
              </span>
            </div>
            {/* テキスト */}
            <div className="p-5 flex flex-col flex-1">
              <p className="text-xs text-[#999] flex items-center gap-1 mb-2">
                <Clock className="h-3 w-3"/>
                {new Date(featured.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h3 className="font-bold text-[#1a1a1a] text-lg leading-snug mb-2 group-hover:text-green-800 transition-colors line-clamp-2">
                {featured.title}
              </h3>
              <p className="text-sm text-[#666] leading-relaxed line-clamp-3 flex-1">
                {getBody(featured.body).slice(0, 200)}...
              </p>
              {featured.propertyIds.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Building2 className="h-3.5 w-3.5 text-[#c8a96e]"/>
                  {featured.propertyIds.slice(0, 2).map(id => {
                    const p = PROPERTIES.find(x => x.id === id);
                    return p ? <span key={id} className="text-xs bg-[#f5f0e8] text-[#8a6c3e] px-2 py-0.5 rounded-full border border-[#e8e0d4]">{p.title}</span> : null;
                  })}
                </div>
              )}
              <div className="mt-4 text-sm text-green-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                続きを読む <ArrowRight className="h-3.5 w-3.5"/>
              </div>
            </div>
          </Link>

          {/* サブ記事リスト */}
          <div className="lg:col-span-2 space-y-3 flex flex-col">
            {rest.slice(0, 4).map((article, idx) => {
              const thumb = getThumb(article);
              return (
                <Link key={article.id} to={`/news/${article.id}`}
                  className="flex gap-3 bg-white border border-[#e8e0d4] rounded-xl p-3 hover:border-green-300 hover:shadow-sm transition-all group flex-1">
                  {/* サムネイル小 */}
                  <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${GRADIENT_BG[(idx + 1) % GRADIENT_BG.length]} flex items-center justify-center`}>
                        <BookOpen className="h-5 w-5 text-white/60"/>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        {TYPE_LABELS[article.articleType] || 'ブログ'}
                      </span>
                      <span className="text-xs text-[#bbb]">
                        {new Date(article.publishedAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#1a1a1a] line-clamp-2 leading-snug group-hover:text-green-800 transition-colors">
                      {article.title}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopArticleSection;
