// モックAPI - バックエンドが未接続の場合に使用
// 3321.jp の実データを使用

import { Property, SearchCriteria, PaginatedResponse, ApiResponse } from '@/types/database';
import { PROPERTIES } from '@/data/properties';

// 検索条件でフィルタリング
function filterProperties(properties: Property[], criteria: SearchCriteria): Property[] {
  return properties.filter((p) => {
    if (criteria.type && p.type !== criteria.type) return false;
    if (criteria.propertyType && criteria.propertyType.length > 0) {
      if (!criteria.propertyType.includes(p.propertyType)) return false;
    }
    if (criteria.city && !p.city.includes(criteria.city)) return false;
    if (criteria.station && !p.station.includes(criteria.station)) return false;
    if (criteria.minPrice && p.price < criteria.minPrice) return false;
    if (criteria.maxPrice && p.price > criteria.maxPrice) return false;
    if (criteria.minArea && p.area < criteria.minArea) return false;
    if (criteria.maxArea && p.area > criteria.maxArea) return false;
    if (criteria.minRooms && p.rooms < criteria.minRooms) return false;
    if (criteria.maxRooms && p.rooms > criteria.maxRooms) return false;
    if (criteria.maxWalkingTime && p.walkingTime && p.walkingTime > criteria.maxWalkingTime) return false;
    return true;
  });
}

// ソート
function sortProperties(properties: Property[], sortBy?: string): Property[] {
  const sorted = [...properties];
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'area_asc':
      return sorted.sort((a, b) => a.area - b.area);
    case 'area_desc':
      return sorted.sort((a, b) => b.area - a.area);
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'newest':
    default:
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

// 物件一覧取得（ページネーション付き）
export async function mockGetProperties(options: {
  page?: number;
  limit?: number;
  search?: SearchCriteria & { sortBy?: string };
}): Promise<ApiResponse<PaginatedResponse<Property>>> {
  await new Promise((r) => setTimeout(r, 200)); // ネットワーク遅延を模倣

  const { page = 1, limit = 12, search = {} } = options;
  const { sortBy, ...criteria } = search as SearchCriteria & { sortBy?: string };

  let filtered = filterProperties(PROPERTIES, criteria);
  filtered = sortProperties(filtered, sortBy);

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const items = filtered.slice((page - 1) * limit, page * limit);

  return {
    success: true,
    data: {
      items,
      total,
      page,
      limit,
      totalPages,
    },
  };
}

// 物件詳細取得
export async function mockGetProperty(id: string): Promise<ApiResponse<Property>> {
  await new Promise((r) => setTimeout(r, 150));

  const property = PROPERTIES.find((p) => p.id === id);
  if (!property) {
    return { success: false, error: '物件が見つかりませんでした' };
  }
  return { success: true, data: property };
}

// 注目物件取得（新着・更新された物件を優先）
export async function mockGetFeaturedProperties(): Promise<ApiResponse<Property[]>> {
  await new Promise((r) => setTimeout(r, 150));

  const featured = [...PROPERTIES]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8);

  return { success: true, data: featured };
}

// お気に入り（ローカルストレージ使用）
const FAVORITES_KEY = 'nagato_favorites';

export function getFavoritesFromStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveFavoritesToStorage(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export async function mockGetFavorites(): Promise<ApiResponse<Property[]>> {
  const ids = getFavoritesFromStorage();
  const favorites = PROPERTIES.filter((p) => ids.includes(p.id));
  return { success: true, data: favorites };
}

export async function mockAddFavorite(propertyId: string): Promise<ApiResponse<void>> {
  const ids = getFavoritesFromStorage();
  if (!ids.includes(propertyId)) {
    ids.push(propertyId);
    saveFavoritesToStorage(ids);
  }
  return { success: true };
}

export async function mockRemoveFavorite(propertyId: string): Promise<ApiResponse<void>> {
  const ids = getFavoritesFromStorage().filter((id) => id !== propertyId);
  saveFavoritesToStorage(ids);
  return { success: true };
}
