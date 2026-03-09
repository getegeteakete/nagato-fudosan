import React, { useState } from 'react';
import { ARTICLES_KEY, SiteArticle } from './AdminArticleGenerator';
import { PROPERTIES } from '@/data/properties';
import {
  FileText, Globe, Edit3, Trash2, Eye, EyeOff,
  X, Check, ExternalLink, Clock, Building2
} from 'lucide-react';

const loadLS = <T,>(key: string, fb: T): T => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
};

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  intro: '物件紹介', sns_instagram: 'Instagram', sns_twitter: 'X/Twitter',
  life: '生活情報', news: '新着お知らせ', stat: '掲載数お知らせ',
};

const AdminArticleManager: React.FC = () => {
  const [articles, setArticles] = useState<SiteArticle[]>(() => loadLS<SiteArticle[]>(ARTICLES_KEY, []));
  const [editTarget, setEditTarget] = useState<SiteArticle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const save = (next: SiteArticle[]) => {
    setArticles(next);
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(next));
  };

  const toggleStatus = (id: string) =>
    save(articles.map(a => a.id === id ? { ...a, status: a.status === 'published' ? 'draft' : 'published' } : a));

  const handleDelete = (id: string) => { save(articles.filter(a => a.id !== id)); setDeleteConfirm(null); };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    save(articles.map(a => a.id === editTarget.id ? editTarget : a));
    setEditTarget(null);
  };

  const published = articles.filter(a => a.status === 'published').length;
  const drafts    = articles.filter(a => a.status === 'draft').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#8a6c3e]"/>
          <h2 className="text-lg font-bold text-[#3d2e1e]">記事管理</h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">公開 {published}件</span>
          {drafts > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">下書き {drafts}件</span>}
        </div>
        <a href="/news" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs border border-[#ddd5c8] text-[#666] px-3 py-1.5 rounded-lg hover:bg-[#f5f0e8] transition-colors">
          <ExternalLink className="h-3.5 w-3.5"/>公開ページを見る
        </a>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white border border-[#ddd5c8] rounded-xl py-16 text-center">
          <FileText className="h-12 w-12 text-[#ddd] mx-auto mb-3"/>
          <p className="text-[#999] mb-2">まだ記事がありません</p>
          <p className="text-sm text-[#bbb]">「AI記事生成」で記事を作成して投稿してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => {
            const relatedProps = PROPERTIES.filter(p => article.propertyIds.includes(p.id));
            return (
              <div key={article.id} className="bg-white border border-[#ddd5c8] rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {article.status === 'published' ? '● 公開中' : '○ 下書き'}
                      </span>
                      <span className="text-xs bg-[#f5f0e8] text-[#8a6c3e] px-1.5 py-0.5 rounded font-medium">
                        {ARTICLE_TYPE_LABELS[article.articleType] || article.articleType}
                      </span>
                      <span className="text-xs text-[#999] flex items-center gap-1">
                        <Clock className="h-3 w-3"/>
                        {new Date(article.publishedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#3d2e1e] text-sm mb-1 truncate">{article.title}</h3>
                    <p className="text-xs text-[#999] leading-relaxed line-clamp-2">
                      {article.body.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').slice(0, 120)}...
                    </p>
                    {relatedProps.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Building2 className="h-3 w-3 text-[#c8a96e]"/>
                        {relatedProps.slice(0, 3).map(p => (
                          <span key={p.id} className="text-xs bg-[#faf7f2] border border-[#e8e0d4] text-[#8a6c3e] px-1.5 py-0.5 rounded">{p.title}</span>
                        ))}
                        {relatedProps.length > 3 && <span className="text-xs text-[#999]">+{relatedProps.length - 3}件</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0 min-w-[64px]">
                    {article.status === 'published' && (
                      <a href={`/news/${article.id}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs bg-[#f5f0e8] text-[#8a6c3e] px-2.5 py-1.5 rounded-lg hover:bg-[#ede8e0] transition-colors">
                        <Eye className="h-3.5 w-3.5"/>表示
                      </a>
                    )}
                    <button onClick={() => setEditTarget({ ...article })}
                      className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      <Edit3 className="h-3.5 w-3.5"/>編集
                    </button>
                    <button onClick={() => toggleStatus(article.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${article.status === 'published' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                      {article.status === 'published' ? <><EyeOff className="h-3.5 w-3.5"/>非公開</> : <><Globe className="h-3.5 w-3.5"/>公開</>}
                    </button>
                    <button onClick={() => setDeleteConfirm(article.id)}
                      className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="h-3.5 w-3.5"/>削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-[#ede8e0] sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center gap-2"><Edit3 className="h-5 w-5 text-blue-600"/><h3 className="font-bold text-[#3d2e1e]">記事を編集</h3></div>
              <button onClick={() => setEditTarget(null)} className="text-[#999] hover:text-[#3d2e1e]"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#6b5230] mb-1">タイトル</p>
                <input value={editTarget.title} onChange={e => setEditTarget({ ...editTarget, title: e.target.value })}
                  className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e]"/>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6b5230] mb-1">本文</p>
                <textarea value={editTarget.body} onChange={e => setEditTarget({ ...editTarget, body: e.target.value })}
                  rows={16} className="w-full border border-[#ddd5c8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c8a96e] resize-none font-mono leading-relaxed"/>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6b5230] mb-2">公開設定</p>
                <div className="flex gap-3">
                  {(['published', 'draft'] as const).map(s => (
                    <button key={s} onClick={() => setEditTarget({ ...editTarget, status: s })}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${editTarget.status === s ? (s === 'published' ? 'bg-green-700 text-white border-green-700' : 'bg-[#8a6c3e] text-white border-[#8a6c3e]') : 'bg-white text-[#666] border-[#ddd5c8]'}`}>
                      {s === 'published' ? '公開' : '下書き'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setEditTarget(null)} className="flex-1 border border-[#ddd5c8] rounded-lg py-2.5 text-sm text-[#666] hover:bg-[#f5f0e8]">キャンセル</button>
              <button onClick={handleSaveEdit} className="flex-1 bg-[#8a6c3e] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#6e5430] flex items-center justify-center gap-2">
                <Check className="h-4 w-4"/>保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-3"/>
            <h3 className="font-bold text-[#3d2e1e] mb-2">記事を削除しますか？</h3>
            <p className="text-sm text-[#666] mb-5">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-[#ddd5c8] rounded-lg py-2 text-sm text-[#666] hover:bg-[#f5f0e8]">キャンセル</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4"/>削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticleManager;
