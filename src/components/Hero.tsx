import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBuilding from "@/assets/hero-building.jpg";
import heroInterior from "@/assets/hero-interior.jpg";

const slides = [
  {
    image: heroBuilding,
    title: "住まい探しを、もっと美しく。",
    subtitle: "賃貸・売買・売却・入居サポートをワンストップで。"
  },
  {
    image: heroInterior,
    title: "信頼と上質を、あなたに。",
    subtitle: "透明性のある迅速な対応で、理想の住まいをサポートします。"
  },
  {
    image: heroBuilding,
    title: "地域密着46年の実績",
    subtitle: "長門市の不動産のプロフェッショナルとして、お客様の夢をサポートします。"
  },
  {
    image: heroInterior,
    title: "長門市の魅力と共に",
    subtitle: "美しい自然と歴史ある街並みの中で、理想の住まいを見つけませんか。"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          
          <div className="relative container h-full flex items-center">
            <div className="max-w-2xl animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-balance text-white">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/properties">
                  <Button size="lg" className="text-base px-8 py-6 group bg-white text-gray-900 hover:bg-gray-100 border-2 border-white">
                    <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    物件を探す
                  </Button>
                </Link>
                <Link to="/valuation">
                  <Button size="lg" className="text-base px-8 py-6 group bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-900 transition-all">
                    <Calculator className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    売却査定を依頼
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
        aria-label="前のスライド"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white"
        aria-label="次のスライド"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`スライド ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
