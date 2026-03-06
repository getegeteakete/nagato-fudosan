import { Heart, MapPin, ArrowRight, Eye, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { PROPERTIES, formatPrice, getPropertyTypeLabel, getTransactionTypeLabel } from "@/data/properties";
import { getFavoritesFromStorage, saveFavoritesToStorage } from "@/lib/mockApi";
import { Property } from "@/types/database";

const FeaturedProperties = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoritesFromStorage());
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    saveFavoritesToStorage(newFavs);
  };

  const rentalProperties = PROPERTIES.filter((p) => p.type === "rent").slice(0, 10);
  const saleProperties = PROPERTIES.filter((p) => p.type === "sale").slice(0, 10);

  const PropertyGrid = ({ properties, type }: { properties: Property[]; type: "rent" | "sale" }) => (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
      {properties.map((property) => (
        <Card
          key={property.id}
          className="group overflow-hidden hover-lift cursor-pointer shadow-premium"
        >
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";
              }}
            />
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge className={`text-xs ${type === "rent" ? "bg-green-700" : "bg-amber-600"} text-white`}>
                {type === "rent" ? "賃貸" : "売買"}
              </Badge>
              <Badge className="text-xs bg-slate-600 text-white hidden sm:inline-flex">
                {getPropertyTypeLabel(property.propertyType)}
              </Badge>
            </div>
            <button
              className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
              aria-label="お気に入りに追加"
              onClick={(e) => toggleFavorite(property.id, e)}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  favorites.includes(property.id)
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          </div>

          <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">
            <h3 className="font-serif font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-green-700 transition-colors">
              {property.title}
            </h3>

            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-xl font-bold text-green-700">
                {formatPrice(property)}
              </span>
              {property.type === "rent" && (
                <span className="text-xs text-muted-foreground">/ 月</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{property.address.replace("山口県", "")}</span>
            </div>

            <div className="flex justify-between text-xs pt-1.5 border-t border-border">
              {property.rooms > 0 && property.propertyType !== "land" ? (
                <span className="font-medium">{property.rooms}K〜</span>
              ) : <span></span>}
              {property.area > 0 && (
                <span className="text-muted-foreground">{property.area}m²</span>
              )}
            </div>

            <Link to={`/property/${property.id}`}>
              <Button variant="outline" size="sm" className="w-full text-xs h-8 group mt-1 border-green-600 text-green-700 hover:bg-green-50">
                <Eye className="h-3 w-3 mr-1" />
                詳細を見る
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">

        {/* セクションタイトル */}
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-green-700 font-semibold text-sm tracking-widest uppercase mb-2">PROPERTIES</p>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-3 text-gray-900">
            おすすめ物件
          </h2>
          <div className="w-16 h-1 bg-green-700 mx-auto mb-4 rounded-full"></div>
          <p className="text-muted-foreground text-lg">長門市の最新・注目物件をご紹介</p>
        </div>

        {/* 賃貸物件 */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-green-700 rounded-full"></div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">賃貸物件</h3>
                <p className="text-sm text-muted-foreground">Rental Properties</p>
              </div>
            </div>
            <Link to="/properties?type=rental">
              <Button variant="outline" size="sm" className="border-green-600 text-green-700 hover:bg-green-50">
                すべて見る
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <PropertyGrid properties={rentalProperties} type="rent" />
        </div>

        {/* 売買物件 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-amber-600 rounded-full"></div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">売買物件</h3>
                <p className="text-sm text-muted-foreground">For Sale Properties</p>
              </div>
            </div>
            <Link to="/properties?type=sale">
              <Button variant="outline" size="sm" className="border-amber-600 text-amber-700 hover:bg-amber-50">
                すべて見る
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <PropertyGrid properties={saleProperties} type="sale" />
        </div>

      </div>
    </section>
  );
};

export default FeaturedProperties;
