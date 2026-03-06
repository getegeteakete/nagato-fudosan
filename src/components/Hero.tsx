import { Search, Calculator, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// 営業時間ロジック
const getBusinessStatus = () => {
  const now = new Date();
  const day = now.getDay(); // 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;
  const date = now.getDate();

  // 第何週かを計算
  const weekOfMonth = Math.ceil(date / 7);

  // 定休日判定: 毎週水曜・第2火曜・第3日曜
  const isRegularClosed =
    day === 3 || // 水曜
    (day === 2 && weekOfMonth === 2) || // 第2火曜
    (day === 0 && weekOfMonth === 3);   // 第3日曜

  if (isRegularClosed) return { open: false, label: "本日定休日", color: "bg-red-600" };

  // 営業時間チェック
  if (day >= 1 && day <= 5) {
    // 平日 9:00〜18:00
    if (time >= 9 * 60 && time < 18 * 60) return { open: true, label: "営業中", color: "bg-green-600" };
    if (time >= 8 * 60 && time < 9 * 60) return { open: false, label: "本日 9:00〜18:00", color: "bg-amber-600" };
    return { open: false, label: "本日は営業終了", color: "bg-gray-600" };
  } else {
    // 土日 10:00〜17:00
    if (time >= 10 * 60 && time < 17 * 60) return { open: true, label: "営業中", color: "bg-green-600" };
    if (time >= 9 * 60 && time < 10 * 60) return { open: false, label: "本日 10:00〜17:00", color: "bg-amber-600" };
    return { open: false, label: "本日は営業終了", color: "bg-gray-600" };
  }
};

const Hero = () => {
  const status = getBusinessStatus();

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
      {/* グラデーションオーバーレイ：左側を濃く、右側は透明 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

      {/* コンテンツ */}
      <div className="relative container h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
          {/* 営業状態バッジ */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-white ${status.open ? 'animate-pulse' : ''}`}></span>
              {status.label}
            </span>
            <span className="text-white/70 text-xs">平日 9-18時 / 土日祝 10-17時</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            住まい探しを、<br />もっと美しく。
          </h1>
          <p className="text-lg md:text-xl text-white mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-medium">
            賃貸・売買・売却・入居サポートをワンストップで。
          </p>
          <p className="text-sm text-white/80 mb-8 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            おかげさまで地元・長門市に根付いて48年
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/properties">
              <Button size="lg" className="text-base px-8 py-6 group bg-white text-gray-900 hover:bg-gray-100 border-2 border-white shadow-lg">
                <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                物件を探す
              </Button>
            </Link>
            <Link to="/valuation">
              <Button size="lg" className="text-base px-8 py-6 group bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-900 transition-all shadow-lg">
                <Calculator className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                売却査定を依頼
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 営業時間インフォバー（下部） */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm">
        <div className="container py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/90">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-green-400" />
            <span className="font-semibold text-white">営業時間</span>
          </div>
          <span>平日：9:00〜18:00</span>
          <span>土日祝：10:00〜17:00</span>
          <span className="text-white/60">｜</span>
          <span className="text-amber-300">定休日：毎週水曜・第2火曜・第3日曜</span>
          <a href="tel:0837223321" className="ml-auto text-green-300 font-bold hover:text-green-200">
            📞 0837-22-3321
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
