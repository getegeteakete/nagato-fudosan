import React, { useState } from 'react';
import { Property, SearchCriteria } from '@/types/database';
import { PropertySearchForm } from '@/components/PropertySearchForm';
import { PropertyCard } from '@/components/PropertyCard';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Grid, List, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

type ViewMode = 'grid' | 'list';
type SortOption = 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'newest' | 'oldest';

const SORT_OPTIONS = [
  { value: 'newest', label: '新着順' },
  { value: 'oldest', label: '古い順' },
  { value: 'price_asc', label: '価格の安い順' },
  { value: 'price_desc', label: '価格の高い順' },
  { value: 'area_asc', label: '面積の小さい順' },
  { value: 'area_desc', label: '面積の大きい順' },
];

// URLパラメータから初期検索条件を生成
const buildInitialCriteria = (params: URLSearchParams): SearchCriteria => {
  const criteria: SearchCriteria = {};
  const type = params.get('type');
  if (type === 'rental') criteria.type = 'rent';
  if (type === 'sale') criteria.type = 'sale';
  const propertyType = params.get('propertyType');
  if (propertyType) criteria.propertyType = [propertyType];
  const area = params.get('area');
  if (area && area !== 'all') criteria.city = area;
  const maxPrice = params.get('maxPrice');
  if (maxPrice) criteria.maxPrice = Number(maxPrice);
  const maxAge = params.get('maxAge');
  if (maxAge) criteria.maxAge = Number(maxAge);
  return criteria;
};

const Properties: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const {
    properties,
    total,
    totalPages,
    currentPage,
    isLoading,
    error,
    searchCriteria,
    updateSearchCriteria,
    resetSearchCriteria,
    goToPage,
  } = usePropertySearch({
    limit: 30,
    initialCriteria: buildInitialCriteria(searchParams),
  });

  const handleSearch = (criteria: SearchCriteria) => {
    updateSearchCriteria(criteria);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    // ソート条件を検索条件に追加
    updateSearchCriteria({ ...searchCriteria, sortBy: value });
  };

  const navigate = useNavigate();

  const handleViewDetails = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            物件情報の取得中にエラーが発生しました。しばらく時間をおいてから再度お試しください。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 -mx-4">
          <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
            <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">PROPERTIES</p>
              <h1 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">物件検索</h1>
            </div>
            <p className="text-sm text-gray-500 ml-auto">{total > 0 ? `${total}件の物件が見つかりました` : '条件に合う物件を検索してください'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 検索フォーム */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <PropertySearchForm
                onSearch={handleSearch}
                initialCriteria={searchCriteria}
                showSaveButton={true}
              />
            </div>
          </div>

          {/* 物件一覧 */}
          <div className="lg:col-span-3">
            {/* ツールバー */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  フィルター
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">表示順:</span>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 検索結果 */}
            {isLoading ? (
              <div className={cn(
                "grid gap-3 md:gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-2 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className={cn(
                  "grid gap-3 md:gap-6 mb-8",
                  viewMode === 'grid' 
                    ? "grid-cols-2 md:grid-cols-2 xl:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onViewDetails={handleViewDetails}
                      showFavoriteButton={true}
                    />
                  ))}
                </div>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { goToPage(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage <= 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      前へ
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                          if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                          ) : (
                            <Button
                              key={item}
                              variant={currentPage === item ? 'default' : 'outline'}
                              size="sm"
                              className={cn("w-9 h-9 p-0", currentPage === item && "bg-green-700 hover:bg-green-800 border-green-700")}
                              onClick={() => { goToPage(item as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            >
                              {item}
                            </Button>
                          )
                        )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { goToPage(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage >= totalPages}
                      className="flex items-center gap-1"
                    >
                      次へ
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  条件に合う物件が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-4">
                  検索条件を変更して再度お試しください
                </p>
                <Button onClick={resetSearchCriteria} variant="outline">
                  検索条件をリセット
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
