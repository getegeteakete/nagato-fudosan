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

  const getBadges = (property: Property) => {
    const badges = [];
    if (property.isNew) badges.push({ label: "NEW", color: "bg-green-600 text-white" });
    badges.push({
      label: getTransactionTypeLabel(property.type),
      color: property.type === "rent" ? "bg-purple-600 text-white" : "bg-orange-600 text-white",
    });
    badges.push({
      label: getPropertyTypeLabel(property.propertyType),
      color: "bg-slate-600 text-white",
    });
    return badges;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            おすすめ物件
          </h2>
          <p className="text-muted-foreground text-lg">
            長門市の最新・注目物件をご紹介
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PROPERTIES.map((property, index) => (
            <Card
              key={property.id}
              className="group overflow-hidden hover-lift cursor-pointer shadow-premium"
              style={{ animationDelay: `${index * 100}ms` }}
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
                <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                  {getBadges(property).map((badge) => (
                    <Badge key={badge.label} className={`backdrop-blur-sm text-xs ${badge.color}`}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
                <button
                  className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                  aria-label="お気に入りに追加"
                  onClick={(e) => toggleFavorite(property.id, e)}
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      favorites.includes(property.id)
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-serif font-semibold text-lg group-hover:text-primary transition-colors">
                  {property.title}
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(property)}
                  </span>
                  {property.type === "rent" && (
                    <span className="text-sm text-muted-foreground">/ 月</span>
                  )}
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{property.address.replace("山口県", "")}</span>
                  </div>
                  {property.station && (
                    <div className="flex items-center gap-2">
                      <Train className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {property.station}
                        {property.walkingTime ? ` 徒歩${property.walkingTime}分` : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3 border-t border-border">
                  {property.rooms > 0 && property.propertyType !== "land" ? (
                    <span className="text-sm font-medium">
                      {property.rooms}K〜
                    </span>
                  ) : (
                    <span className="text-sm font-medium"></span>
                  )}
                  {property.area > 0 && (
                    <span className="text-sm text-muted-foreground">{property.area}m²</span>
                  )}
                </div>

                <div className="pt-2">
                  <Link to={`/property/${property.id}`}>
                    <Button variant="outline" size="sm" className="w-full group">
                      <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/properties">
            <Button variant="outline" size="lg" className="group">
              すべての物件を見る
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
