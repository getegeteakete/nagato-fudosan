import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SiteArticle } from '@/components/AdminArticleGenerator';
import { getPublishedArticles, getArticleById } from '@/lib/articleStore';
import { PROPERTIES } from '@/data/properties';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowLeft, Clock, Building2, ExternalLink } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  intro: '物件紹介', sns_instagram: 'Instagram', sns_twitter: 'X/Twitter',
  life: '生活情報', news: '新着お知らせ', stat: '物件掲載お知らせ',
};

// ─── 記事一覧 ───
const NewsList: React.FC = () => {
  const [articles, setArticles] = useState<SiteArticle[]>([]);
  useEffect(() => { getPublishedArticles().then(setArticles); }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation/>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 -mx-4">
          <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
            <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">STAFF BLOG</p>
              <h1 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">スタッフブログ</h1>
            </div>
            <p className="text-sm text-gray-500 ml-auto hidden md:block">物件情報・長門市の暮らし情報</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-[#999]">
            <p className="text-lg mb-2">まだ記事がありません</p>
            <p className="text-sm">しばらくお待ちください</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map(article => {
              const relatedProps = PROPERTIES.filter(p => article.propertyIds.includes(p.id));
              const preview = article.body.replace(/\*\*/g,'').replace(/^#+\s*/gm,'').trim().slice(0,160);
              return (
                <Link to={`/news/${article.id}`} key={article.id}
                  className="block group border border-[#e8e0d4] rounded-2xl p-6 hover:shadow-md transition-all hover:border-green-300 bg-white">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                      {TYPE_LABELS[article.articleType] || 'ブログ'}
                    </span>
                    <span className="text-xs text-[#999] flex items-center gap-1">
                      <Clock className="h-3 w-3"/>
                      {new Date(article.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1a1a1a] mb-2 group-hover:text-green-800 transition-colors leading-snug">{article.title}</h2>
                  <p className="text-sm text-[#666] leading-relaxed mb-4">{preview}...</p>
                  {relatedProps.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Building2 className="h-3.5 w-3.5 text-[#c8a96e]"/>
                      {relatedProps.slice(0,2).map(p => (
                        <span key={p.id} className="text-xs bg-[#faf7f2] text-[#8a6c3e] border border-[#e8e0d4] px-2 py-0.5 rounded-full">{p.title}</span>
                      ))}
                      {relatedProps.length > 2 && <span className="text-xs text-[#999]">他{relatedProps.length-2}件</span>}
                    </div>
                  )}
                  <div className="mt-4 text-xs text-green-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">続きを読む →</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

// ─── 記事詳細 ───
const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<SiteArticle | null | undefined>(undefined);

  useEffect(() => {
    if (id) getArticleById(id).then(setArticle);
  }, [id]);

  if (article === undefined) return (
    <div className="min-h-screen bg-white"><Navigation/>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-[#999]">読み込み中...</p></div>
    <Footer/></div>
  );

  if (!article || article.status !== 'published') return (
    <div className="min-h-screen bg-white"><Navigation/>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-[#999] mb-4">記事が見つかりません</p>
        <Link to="/news" className="text-green-700 underline">← ブログ一覧へ戻る</Link>
      </div>
    <Footer/></div>
  );

  const relatedProps = PROPERTIES.filter(p => article.propertyIds.includes(p.id));

  const renderBody = (text: string) => text.split('\n').map((line, i) => {
    const h1 = line.match(/^#\s+(.+)/), h2 = line.match(/^##\s+(.+)/), h3 = line.match(/^###\s+(.+)/);
    const bold = (s: string) => s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    if (h1) return <h1 key={i} className="text-2xl font-bold text-[#1a1a1a] mt-6 mb-3" dangerouslySetInnerHTML={{ __html: bold(h1[1]) }}/>;
    if (h2) return <h2 key={i} className="text-xl font-bold text-[#1a1a1a] mt-5 mb-2 pb-1 border-b border-[#e8e0d4]" dangerouslySetInnerHTML={{ __html: bold(h2[1]) }}/>;
    if (h3) return <h3 key={i} className="text-base font-bold text-green-800 mt-4 mb-1" dangerouslySetInnerHTML={{ __html: bold(h3[1]) }}/>;
    if (!line.trim()) return <div key={i} className="h-3"/>;
    return <p key={i} className="text-[#333] leading-relaxed text-sm mb-1" dangerouslySetInnerHTML={{ __html: bold(line) }}/>;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation/>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-[#999] hover:text-green-700 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4"/>ブログ一覧へ戻る
        </Link>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">{TYPE_LABELS[article.articleType] || 'ブログ'}</span>
          <span className="text-xs text-[#999] flex items-center gap-1">
            <Clock className="h-3 w-3"/>
            {new Date(article.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-6 leading-snug">{article.title}</h1>
        <div className="flex items-center gap-3 mb-8 bg-[#f5f0e8] rounded-xl px-4 py-3">
          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">田</div>
          <div><p className="text-sm font-bold text-[#3d2e1e]">田中（スタッフ）</p><p className="text-xs text-[#999]">長門不動産・長門市在住10年</p></div>
        </div>
        <div className="prose max-w-none">{renderBody(article.body)}</div>

        {relatedProps.length > 0 && (
          <div className="mt-12 border-t border-[#e8e0d4] pt-8">
            <h3 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-green-700"/>この記事の関連物件</h3>
            <div className="grid gap-3">
              {relatedProps.map(p => (
                <Link key={p.id} to={`/property/${p.id}`} className="flex items-center gap-3 border border-[#e8e0d4] rounded-xl p-3 hover:border-green-300 hover:shadow-sm transition-all group">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" onError={e => (e.target as HTMLImageElement).style.display='none'}/>
                    : <div className="w-16 h-12 bg-[#f0ebe3] rounded-lg flex items-center justify-center flex-shrink-0"><Building2 className="h-5 w-5 text-[#ccc]"/></div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1a1a] text-sm truncate group-hover:text-green-800">{p.title}</p>
                    <p className="text-xs text-[#999]">{p.address}</p>
                    <p className="text-xs font-bold text-green-700 mt-0.5">{p.type==='rent' ? `¥${(p.rent||p.price).toLocaleString()}/月` : `¥${p.price.toLocaleString()}`}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#ccc] group-hover:text-green-600 flex-shrink-0"/>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-bold text-green-900 mb-2">気になる物件がありましたか？</p>
          <p className="text-sm text-green-700 mb-4">お気軽にお問い合わせください。スタッフ一同、お待ちしております！</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:0837-22-3321" className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-lg hover:bg-green-800 font-bold text-sm transition-colors">📞 0837-22-3321</a>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 px-6 py-2.5 rounded-lg hover:bg-green-50 font-bold text-sm transition-colors">メールで問い合わせる</Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

const News: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return id ? <NewsDetail/> : <NewsList/>;
};

export default News;
