/**
 * 記事データの読み書き
 * Supabaseが設定されていればDB、なければlocalStorageにフォールバック
 */
import { supabase, isSupabaseReady } from './supabase';
import { SiteArticle, ARTICLES_KEY } from '@/components/AdminArticleGenerator';
import { SAMPLE_ARTICLES } from '@/data/sampleArticles';

const loadLS = <T,>(key: string, fb: T): T => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch { return fb; }
};

// DB行 → SiteArticle
const fromRow = (row: Record<string, unknown>): SiteArticle => ({
  id: row.id as string,
  title: row.title as string,
  body: row.body as string,
  articleType: row.article_type as string,
  propertyIds: (row.property_ids as string[]) || [],
  publishedAt: row.published_at as string,
  status: row.status as 'draft' | 'published',
});

// SiteArticle → DB行
const toRow = (a: SiteArticle) => ({
  id: a.id,
  title: a.title,
  body: a.body,
  article_type: a.articleType,
  property_ids: a.propertyIds,
  published_at: a.publishedAt,
  status: a.status,
});

// ─── 全件取得 ───
export const getArticles = async (): Promise<SiteArticle[]> => {
  if (isSupabaseReady && supabase) {
    const { data, error } = await supabase
      .from('site_articles')
      .select('*')
      .order('published_at', { ascending: false });
    if (!error && data) return data.map(fromRow);
  }
  const ls = loadLS<SiteArticle[]>(ARTICLES_KEY, []);
  return ls.length > 0 ? ls : SAMPLE_ARTICLES;
};

// ─── 公開記事のみ取得 ───
export const getPublishedArticles = async (): Promise<SiteArticle[]> => {
  if (isSupabaseReady && supabase) {
    const { data, error } = await supabase
      .from('site_articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (!error && data && data.length > 0) return data.map(fromRow);
    if (!error && data && data.length === 0) return SAMPLE_ARTICLES;
  }
  const ls = loadLS<SiteArticle[]>(ARTICLES_KEY, []).filter(a => a.status === 'published');
  return ls.length > 0 ? ls : SAMPLE_ARTICLES;
};

// ─── 1件取得 ───
export const getArticleById = async (id: string): Promise<SiteArticle | null> => {
  if (isSupabaseReady && supabase) {
    const { data, error } = await supabase
      .from('site_articles')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return fromRow(data);
  }
  // localStorageとサンプルから検索
  const all = [...loadLS<SiteArticle[]>(ARTICLES_KEY, []), ...SAMPLE_ARTICLES];
  return all.find(a => a.id === id) || null;
};

// ─── 保存（新規・更新）───
export const saveArticle = async (article: SiteArticle): Promise<boolean> => {
  if (isSupabaseReady && supabase) {
    const { error } = await supabase
      .from('site_articles')
      .upsert(toRow(article));
    if (!error) return true;
    console.error('Supabase save error:', error);
  }
  // localStorageフォールバック
  const articles = loadLS<SiteArticle[]>(ARTICLES_KEY, []);
  const exists = articles.findIndex(a => a.id === article.id);
  if (exists >= 0) articles[exists] = article;
  else articles.unshift(article);
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  return true;
};

// ─── 削除 ───
export const deleteArticle = async (id: string): Promise<boolean> => {
  if (isSupabaseReady && supabase) {
    const { error } = await supabase.from('site_articles').delete().eq('id', id);
    if (!error) return true;
  }
  const articles = loadLS<SiteArticle[]>(ARTICLES_KEY, []).filter(a => a.id !== id);
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  return true;
};

// ─── 一括保存（ローカルからSupabaseへの移行用）───
export const migrateLocalToSupabase = async (): Promise<number> => {
  if (!isSupabaseReady || !supabase) return 0;
  const local = loadLS<SiteArticle[]>(ARTICLES_KEY, []);
  if (local.length === 0) return 0;
  const { error } = await supabase.from('site_articles').upsert(local.map(toRow));
  if (!error) {
    console.log(`Migrated ${local.length} articles to Supabase`);
    return local.length;
  }
  return 0;
};
