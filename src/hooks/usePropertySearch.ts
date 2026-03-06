import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Property, SearchCriteria, PaginatedResponse } from '@/types/database';
import { apiClient } from '@/lib/api';

interface UsePropertySearchOptions {
  initialCriteria?: SearchCriteria;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const usePropertySearch = (options: UsePropertySearchOptions = {}) => {
  const { initialCriteria = {}, page = 1, limit = 20, enabled = true } = options;
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(initialCriteria);
  const [currentPage, setCurrentPage] = useState(page);
  const queryClient = useQueryClient();

  const queryKey = ['properties', searchCriteria, currentPage, limit];

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => apiClient.getProperties({
      page: currentPage,
      limit,
      search: searchCriteria,
    }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5分
  });

  const properties = response?.data?.items || [];
  const total = response?.data?.total || 0;
  const totalPages = response?.data?.totalPages || 0;

  const updateSearchCriteria = useCallback((newCriteria: Partial<SearchCriteria>) => {
    setSearchCriteria(prev => ({ ...prev, ...newCriteria }));
    setCurrentPage(1); // 検索条件変更時は1ページ目に戻る
  }, []);

  const resetSearchCriteria = useCallback(() => {
    setSearchCriteria({});
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  }, [queryClient]);

  return {
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
    refresh,
    refetch,
  };
};

// お気に入り物件の管理
export const useFavorites = () => {
  const queryClient = useQueryClient();

  const {
    data: favorites,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiClient.getFavorites(),
    staleTime: 5 * 60 * 1000,
  });

  const addFavorite = useCallback(async (propertyId: string) => {
    try {
      const response = await apiClient.addFavorite(propertyId);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }, [queryClient]);

  const removeFavorite = useCallback(async (propertyId: string) => {
    try {
      const response = await apiClient.removeFavorite(propertyId);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }, [queryClient]);

  const isFavorite = useCallback((propertyId: string) => {
    return favorites?.data?.some(property => property.id === propertyId) || false;
  }, [favorites]);

  return {
    favorites: favorites?.data || [],
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};

// 保存された検索条件の管理
export const useSavedSearches = () => {
  const queryClient = useQueryClient();

  const {
    data: savedSearches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: () => apiClient.getSavedSearches(),
    staleTime: 5 * 60 * 1000,
  });

  const saveSearch = useCallback(async (name: string, criteria: SearchCriteria) => {
    try {
      const response = await apiClient.saveSearch(name, criteria);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving search:', error);
      return false;
    }
  }, [queryClient]);

  const updateSavedSearch = useCallback(async (id: string, name: string, criteria: SearchCriteria) => {
    try {
      const response = await apiClient.updateSavedSearch(id, name, criteria);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating saved search:', error);
      return false;
    }
  }, [queryClient]);

  const deleteSavedSearch = useCallback(async (id: string) => {
    try {
      const response = await apiClient.deleteSavedSearch(id);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting saved search:', error);
      return false;
    }
  }, [queryClient]);

  return {
    savedSearches: savedSearches?.data || [],
    isLoading,
    error,
    saveSearch,
    updateSavedSearch,
    deleteSavedSearch,
  };
};
