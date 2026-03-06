-- データベーススキーマ定義
-- PostgreSQL用のスキーマ

-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ユーザー設定テーブル
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT true,
    notification_line BOOLEAN DEFAULT false,
    line_user_id VARCHAR(100),
    preferred_areas TEXT[],
    preferred_property_types TEXT[],
    max_price INTEGER,
    min_area INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 物件テーブル
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('rent', 'sale')),
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'office', 'land')),
    price INTEGER NOT NULL,
    rent INTEGER,
    management_fee INTEGER,
    deposit INTEGER,
    key_money INTEGER,
    area DECIMAL(8,2) NOT NULL,
    rooms INTEGER NOT NULL,
    floor INTEGER,
    total_floors INTEGER,
    age INTEGER NOT NULL,
    address VARCHAR(255) NOT NULL,
    prefecture VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    station VARCHAR(100),
    walking_time INTEGER,
    features TEXT[],
    images TEXT[],
    is_available BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id)
);

-- 保存された検索条件テーブル
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    search_criteria JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- お気に入りテーブル
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- 通知テーブル
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_property', 'price_change', 'status_change', 'valuation_result', 'moveout_confirmation')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 査定依頼テーブル
CREATE TABLE valuation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'land')),
    address VARCHAR(255) NOT NULL,
    area DECIMAL(8,2) NOT NULL,
    age INTEGER NOT NULL,
    floor INTEGER,
    rooms INTEGER,
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    features TEXT[],
    estimated_price INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 退去申請テーブル
CREATE TABLE moveout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    property_id VARCHAR(100) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    moveout_date DATE NOT NULL,
    reason VARCHAR(100) NOT NULL,
    preferred_inspection_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_prefecture ON properties(prefecture);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_rent ON properties(rent);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_is_available ON properties(is_available);
CREATE INDEX idx_properties_is_new ON properties(is_new);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_valuation_requests_status ON valuation_requests(status);
CREATE INDEX idx_moveout_requests_status ON moveout_requests(status);

-- トリガー関数（updated_at自動更新用）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_valuation_requests_updated_at BEFORE UPDATE ON valuation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moveout_requests_updated_at BEFORE UPDATE ON moveout_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データ挿入（管理者ユーザー）
INSERT INTO users (email, password, name, role, is_active, email_verified) 
VALUES ('admin@example.com', '$2b$10$example_hashed_password', '管理者', 'admin', true, true);

-- サンプル物件データ
INSERT INTO properties (
    title, description, type, property_type, price, rent, area, rooms, age, 
    address, prefecture, city, station, walking_time, features, images, 
    is_available, is_new, created_by
) VALUES 
(
    '渋谷駅徒歩5分の新築マンション',
    '渋谷駅から徒歩5分の好立地にある新築マンションです。',
    'rent',
    'apartment',
    0,
    150000,
    45.5,
    2,
    0,
    '東京都渋谷区渋谷1-1-1',
    '東京都',
    '渋谷区',
    '渋谷駅',
    5,
    ARRAY['pet_allowed', 'parking', 'balcony', 'air_conditioning'],
    ARRAY['https://example.com/image1.jpg'],
    true,
    true,
    (SELECT id FROM users WHERE email = 'admin@example.com')
),
(
    '恵比寿の高級マンション',
    '恵比寿駅から徒歩3分の高級マンションです。',
    'sale',
    'apartment',
    85000000,
    0,
    78.2,
    3,
    5,
    '東京都渋谷区恵比寿1-2-3',
    '東京都',
    '渋谷区',
    '恵比寿駅',
    3,
    ARRAY['parking', 'balcony', 'security', 'near_station'],
    ARRAY['https://example.com/image2.jpg'],
    true,
    false,
    (SELECT id FROM users WHERE email = 'admin@example.com')
);
