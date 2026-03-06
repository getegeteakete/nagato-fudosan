// データベース型定義

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'rent' | 'sale'; // 賃貸 or 売買
  propertyType: 'apartment' | 'house' | 'office' | 'land'; // 物件種別
  price: number;
  rent?: number; // 賃料（賃貸の場合）
  managementFee?: number; // 管理費
  deposit?: number; // 敷金
  keyMoney?: number; // 礼金
  area: number; // 面積（㎡）
  rooms: number; // 部屋数
  floor: number; // 階数
  totalFloors: number; // 総階数
  age: number; // 築年数
  address: string;
  prefecture: string;
  city: string;
  station: string;
  walkingTime?: number; // 徒歩分数
  features: string[]; // 設備・特徴
  images: string[]; // 画像URL
  isAvailable: boolean;
  isNew: boolean; // 新着フラグ
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // 作成者ID
}

export interface User {
  id: string;
  email: string;
  password: string; // ハッシュ化済み
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  userId: string;
  notificationEmail: boolean;
  notificationLine: boolean;
  lineUserId?: string;
  preferredAreas: string[];
  preferredPropertyTypes: string[];
  maxPrice?: number;
  minArea?: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchCriteria: SearchCriteria;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchCriteria {
  type?: 'rent' | 'sale';
  propertyType?: string[];
  prefecture?: string;
  city?: string;
  station?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minRooms?: number;
  maxRooms?: number;
  maxAge?: number;
  maxWalkingTime?: number;
  features?: string[];
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_property' | 'price_change' | 'status_change' | 'valuation_result' | 'moveout_confirmation';
  title: string;
  message: string;
  propertyId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ValuationRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: 'apartment' | 'house' | 'land';
  address: string;
  area: number;
  age: number;
  floor?: number;
  rooms?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  features: string[];
  estimatedPrice?: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoveoutRequest {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  roomNumber: string;
  moveoutDate: Date;
  reason: string;
  preferredInspectionDate?: Date;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
