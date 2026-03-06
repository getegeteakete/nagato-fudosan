import React from 'react';
import { Property } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Home, Car, Wifi, Users } from 'lucide-react';
import { useFavorites } from '@/hooks/usePropertySearch';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  showFavoriteButton?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  showFavoriteButton = true,
}) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFavorited = isFavorite(property.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      // ログインが必要な場合の処理
      return;
    }

    if (isFavorited) {
      await removeFavorite(property.id);
    } else {
      await addFavorite(property.id);
    }
  };

  const formatPrice = (price: number, type: 'rent' | 'sale') => {
    if (type === 'rent') {
      return `¥${price.toLocaleString()}/月`;
    } else {
      return `¥${price.toLocaleString()}`;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'マンション',
      house: '戸建て',
      office: 'オフィス',
      land: '土地',
    };
    return types[type] || type;
  };

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      pet_allowed: <Users className="h-4 w-4" />,
      parking: <Car className="h-4 w-4" />,
      wifi: <Wifi className="h-4 w-4" />,
      near_station: <MapPin className="h-4 w-4" />,
    };
    return icons[feature] || <Home className="h-4 w-4" />;
  };

  const getFeatureLabel = (feature: string) => {
    const labels: Record<string, string> = {
      pet_allowed: 'ペット可',
      parking: '駐車場',
      wifi: 'WiFi',
      near_station: '駅近',
      balcony: 'バルコニー',
      air_conditioning: 'エアコン',
      washing_machine: '洗濯機置き場',
      refrigerator: '冷蔵庫',
      furnished: '家具付き',
      quiet: '静かな環境',
      security: 'セキュリティ',
    };
    return labels[feature] || feature;
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      onClick={() => onViewDetails?.(property)}
    >
      <CardHeader className="p-0">
        <div className="relative">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex gap-1">
            {property.isNew && (
              <Badge variant="destructive" className="text-xs">
                新着
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {getPropertyTypeLabel(property.propertyType)}
            </Badge>
          </div>

          {showFavoriteButton && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={`h-4 w-4 ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`} 
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{property.address}</span>
          </div>

          {property.station && (
            <div className="text-sm text-gray-600">
              {property.station}
              {property.walkingTime && ` 徒歩${property.walkingTime}分`}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(property.type === 'rent' ? property.rent || 0 : property.price, property.type)}
            </div>
            <div className="text-sm text-gray-600">
              {property.area}㎡
            </div>
          </div>

          {property.type === 'rent' && (property.deposit || property.keyMoney) && (
            <div className="text-sm text-gray-600">
              {property.deposit && `敷金: ¥${property.deposit.toLocaleString()}`}
              {property.deposit && property.keyMoney && ' / '}
              {property.keyMoney && `礼金: ¥${property.keyMoney.toLocaleString()}`}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{property.rooms}部屋</span>
            <span>•</span>
            <span>{property.age}年築</span>
            {property.floor && (
              <>
                <span>•</span>
                <span>{property.floor}階</span>
              </>
            )}
          </div>

          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {property.features.slice(0, 4).map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {getFeatureIcon(feature)}
                  <span className="ml-1">{getFeatureLabel(feature)}</span>
                </Badge>
              ))}
              {property.features.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{property.features.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(property);
          }}
        >
          詳細を見る
        </Button>
      </CardFooter>
    </Card>
  );
};
