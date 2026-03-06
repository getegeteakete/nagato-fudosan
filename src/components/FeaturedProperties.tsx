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
  const [activeTab, setActiveTab] = useState<"rental" | "sale">("rental");

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
      color: property.type === "rent" ? "bg-green-700 text-white" : "bg-orange-600 text-white",
    });
    badges.push({
      label: getPropertyTypeLabel(property.propertyType),
      color: "bg-slate-600 text-white",
    });
    return badges;
  };

  const rentalProperties = PROPERTIES.filter((p) => p.type === "rent").slice(0, 10);
  const saleProperties = PROPERTIES.filter((p) => p.type === "sale").slice(0, 10);
  const displayProperties = activeTab === "rental" ? rentalProperties : saleProperties;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-green-700 font-semibold text-sm tracking-widest uppercase mb-2">PROPERTIES</p>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-gray-900">
            おすすめ物件
          </h2>
          <div className="w-16 h-1 bg-green-700 mx-auto mb-4 rounded-full"></div>
          <p className="text-muted-foreground text-lg">
            長門市の最新・注目物件をご紹介
          </p>
        </div>

        {/* タブ */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab("rental")}
              className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === "rental"
                  ? "bg-green-700 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              賃貸 {rentalProperties.length}件
            </button>
            <button
              onClick={() => setActiveTab("sale")}
              className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === "sale"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              売買 {saleProperties.length}件
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12">
          {displayProperties.map((property, index) => (
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
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {getBadges(property).map((badge) => (
                    <Badge key={badge.label} className={`backdrop-blur-sm text-xs ${badge.color} hidden sm:inline-flex`}>
                      {badge.label}
                    </Badge>
                  ))}
                  <Badge className={`backdrop-blur-sm text-xs ${getBadges(property)[1].color} sm:hidden`}>
                    {getBadges(property)[1].label}
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

              <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-3">
                <h3 className="font-serif font-semibold text-sm sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-2xl font-bold text-primary">
                    {formatPrice(property)}
                  </span>
                  {property.type === "rent" && (
                    <span className="text-xs text-muted-foreground">/ 月</span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{property.address.replace("山口県", "")}</span>
                  </div>
                  {property.station && (
                    <div className="hidden sm:flex items-center gap-1">
                      <Train className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {property.station}
                        {property.walkingTime ? ` 徒歩${property.walkingTime}分` : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2 border-t border-border text-xs">
                  {property.rooms > 0 && property.propertyType !== "land" ? (
                    <span className="font-medium">{property.rooms}K〜</span>
                  ) : (
                    <span></span>
                  )}
                  {property.area > 0 && (
                    <span className="text-muted-foreground">{property.area}m²</span>
                  )}
                </div>

                <div className="pt-1">
                  <Link to={`/property/${property.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8 group">
                      <Eye className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform" />
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to={`/properties?type=${activeTab === "rental" ? "rental" : "sale"}`}>
            <Button variant="outline" size="lg" className="group">
              {activeTab === "rental" ? "賃貸物件" : "売買物件"}をすべて見る
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
