import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Calendar,
  Building2,
  Phone,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
  User,
  Train,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PROPERTIES, formatPrice, getPropertyTypeLabel, getTransactionTypeLabel } from '@/data/properties';
import { getFavoritesFromStorage, saveFavoritesToStorage } from '@/lib/mockApi';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // 3321.jpの実データから物件を取得
  const property = PROPERTIES.find((p) => p.id === id) || PROPERTIES[0];

  // 実データはコンポーネント冒頭で取得済み

  useEffect(() => {
    const favs = getFavoritesFromStorage();
    setIsFavorite(favs.includes(property.id));
  }, [property.id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const toggleFavorite = () => {
    const favs = getFavoritesFromStorage();
    const newFavs = isFavorite
      ? favs.filter((f) => f !== property.id)
      : [...favs, property.id];
    saveFavoritesToStorage(newFavs);
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 画像ギャラリー */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  
                  {/* 画像ナビゲーション */}
                  {property.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* 画像インジケーター */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>

                {/* サムネイル */}
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 物件基本情報 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{property.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFavorite}
                      className={isFavorite ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: property.title, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('URLをコピーしました');
                        }
                      }} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 価格情報 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(property)}
                    {property.type === 'rent' && <span className="text-lg text-gray-600">/月</span>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {property.type === 'rent' ? '賃料' : '価格'}
                  </div>
                </div>

                {/* 物件詳細 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm text-gray-600">間取り</div>
                    <div className="font-semibold">{property.rooms > 0 ? `${property.rooms}K〜` : '土地'}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm text-gray-600">所在地</div>
                    <div className="font-semibold text-xs">長門市</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Building2 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm text-gray-600">物件種別</div>
                    <div className="font-semibold">{property.type === 'sale' ? '売買' : '賃貸'}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm text-gray-600">更新日</div>
                    <div className="font-semibold">NEW</div>
                  </div>
                </div>

                {/* 物件の特徴 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">物件の特徴</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 物件説明 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">物件説明</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                {/* 最寄り駅 */}
                {property.station && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">最寄り駅</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Train className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{property.station}</span>
                      </div>
                      {property.walkingTime && (
                        <div className="text-blue-600 font-semibold">徒歩{property.walkingTime}分</div>
                      )}
                    </div>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 問い合わせフォーム */}
            <Card>
              <CardHeader>
                <CardTitle>この物件について問い合わせる</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href="tel:0837223321" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    電話で問い合わせ（0837-22-3321）
                  </Button>
                </a>
                <a href={`mailto:nag3321@sage.ocn.ne.jp?subject=${encodeURIComponent(`【物件問い合わせ】${property.title}`)}&body=${encodeURIComponent(`物件名：${property.title}\n物件ID：${property.id}\n\nお問い合わせ内容：\n`)}`} className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    メールで問い合わせ
                  </Button>
                </a>
                <a href={`/contact?property=${encodeURIComponent(property.title)}`} className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    内見予約・お問い合わせ
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* 担当者情報 */}
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせ先</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">（有）長門不動産</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      4.9
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>0837-22-3321</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>nag3321@sage.ocn.ne.jp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-xs">〒759-4101 山口県長門市東深川藤中2684-5</span>
                  </div>
                </div>
                <div className="pt-2">
                  <a
                    href="https://3321.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    公式サイトで詳細を見る
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* 関連物件 */}
            <Card>
              <CardHeader>
                <CardTitle>関連物件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PROPERTIES.filter((p) => p.id !== property.id && p.type === property.type).slice(0, 3).map((p) => (
                    <Link key={p.id} to={`/property/${p.id}`} className="block">
                      <div className="p-3 border rounded-lg hover:border-blue-400 transition-colors">
                        <div className="text-sm font-medium">{p.title}</div>
                        <div className="text-xs text-gray-600">{formatPrice(p)}{p.type === 'rent' ? '/月' : ''}</div>
                        <div className="text-xs text-gray-400 mt-1">{p.address.replace('山口県', '')}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
