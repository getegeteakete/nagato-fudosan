import { ChevronLeft, ChevronRight, Search, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* 動画背景 */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/55" />

      {/* コンテンツ */}
      <div className="relative container h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-balance text-white">
            住まい探しを、<br />もっと美しく。
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            賃貸・売買・売却・入居サポートをワンストップで。
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
    </section>
  );
};

export default Hero;
