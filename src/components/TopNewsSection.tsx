import React from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES_KEY, SiteArticle } from './AdminArticleGenerator';
import { SAMPLE_ARTICLES } from '@/data/sampleArticles';
import { Bell, ArrowRight, Clock, ChevronRight } from 'lucide-react';

const loadLS = <T,>(key: string, fb: T): T => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
};

const TYPE_LABELS: Record<string, string> = {
  intro: '物件紹介', sns_instagram: 'Instagram', sns_twitter: 'X', life: '生活情報',
  news: '新着お知らせ', stat: '物件掲載お知らせ',
};
const TYPE_COLORS: Record<string, string> = {
  news: 'bg-red-100 text-red-700', stat: 'bg-green-100 text-green-700',
  intro: 'bg-blue-100 text-blue-700', life: 'bg-emerald-100 text-emerald-700',
  sns_instagram: 'bg-pink-100 text-pink-700', sns_twitter: 'bg-sky-100 text-sky-700',
};

const TopNewsSection: React.FC = () => {
  const stored = loadLS<SiteArticle[]>(ARTICLES_KEY, []).filter(a => a.status === 'published');
  const articles = (stored.length > 0 ? stored : SAMPLE_ARTICLES).slice(0, 5);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="mb-8 -mx-4 md:-mx-6 lg:-mx-8">
          <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
            <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">News & Info</p>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">新着お知らせ</h2>
            </div>
            <Link to="/news"
              className="ml-auto flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:text-green-900 transition-colors group flex-shrink-0">
              すべて見る
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"/>
            </Link>
          </div>
        </div>

        {/* お知らせリスト */}
        <div className="border border-[#e8e0d4] rounded-2xl overflow-hidden divide-y divide-[#f0ece6]">
          {articles.map((article, i) => {
            const preview = article.body.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').trim();
            const typeColor = TYPE_COLORS[article.articleType] || 'bg-gray-100 text-gray-600';
            return (
              <Link key={article.id} to={`/news/${article.id}`}
                className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-[#faf7f2] transition-colors group">
                {/* 日付 */}
                <div className="flex-shrink-0 text-center w-12">
                  <p className="text-lg font-bold text-[#1a1a1a] leading-none">
                    {new Date(article.publishedAt).getDate()}
                  </p>
                  <p className="text-xs text-[#999]">
                    {new Date(article.publishedAt).toLocaleDateString('ja-JP', { month: 'short' })}
                  </p>
                </div>
                {/* タグ */}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${typeColor}`}>
                  {TYPE_LABELS[article.articleType] || 'お知らせ'}
                </span>
                {/* タイトル＋プレビュー */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1a1a1a] truncate group-hover:text-green-800 transition-colors">
                    {article.title}
                  </p>
                  <p className="text-xs text-[#999] truncate mt-0.5 hidden sm:block">
                    {preview.slice(0, 80)}...
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#ccc] flex-shrink-0 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all"/>
              </Link>
            );
          })}
        </div>

        {/* もっと見るボタン */}
        {articles.length >= 5 && (
          <div className="mt-5 text-center">
            <Link to="/news"
              className="inline-flex items-center gap-2 border border-green-700 text-green-700 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 hover:text-white transition-colors">
              <Bell className="h-4 w-4"/>すべてのお知らせを見る
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopNewsSection;
