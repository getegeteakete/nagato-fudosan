import { Link } from "react-router-dom";
import { Building2, Calculator, MessageCircle, Clock } from "lucide-react";

const getBusinessStatus = () => {
  const now = new Date();
  const day = now.getDay();
  const time = now.getHours() * 60 + now.getMinutes();
  const weekOfMonth = Math.ceil(now.getDate() / 7);

  const isRegularClosed =
    day === 3 ||
    (day === 2 && weekOfMonth === 2) ||
    (day === 0 && weekOfMonth === 3);

  if (isRegularClosed) return { open: false, label: "本日定休日", dot: "bg-red-400" };

  if (day >= 1 && day <= 5) {
    if (time >= 9 * 60 && time < 18 * 60) return { open: true, label: "営業中 9:00-18:00", dot: "bg-green-400" };
    return { open: false, label: "本日は営業終了", dot: "bg-gray-400" };
  } else {
    if (time >= 10 * 60 && time < 17 * 60) return { open: true, label: "営業中 10:00-17:00", dot: "bg-green-400" };
    return { open: false, label: "本日は営業終了", dot: "bg-gray-400" };
  }
};

const FixedSideButtons = () => {
  const status = getBusinessStatus();

  return (
    <>
      {/* PC版: 右側固定 */}
      <div className="hidden lg:block fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-1">
          <Link to="/properties" className="group">
            <div className="bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-16 h-32 border-l-4 border-green-600">
              <div className="writing-mode-vertical text-center">
                <Building2 className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-bold tracking-wider">物件を探す</span>
              </div>
            </div>
          </Link>
          <Link to="/valuation" className="group">
            <div className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-16 h-32 border-l-4 border-green-500">
              <div className="writing-mode-vertical text-center">
                <Calculator className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-bold tracking-wider">売却相談</span>
              </div>
            </div>
          </Link>
          <Link to="/contact" className="group">
            <div className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-16 h-32 border-l-4 border-gray-500">
              <div className="writing-mode-vertical text-center">
                <MessageCircle className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-bold tracking-wider">お問い合わせ</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* スマホ版: 下部固定 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        {/* 営業状態バー */}
        <div className={`flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium text-white ${status.open ? 'bg-green-700' : 'bg-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.open ? 'animate-pulse' : ''}`}></span>
          <Clock className="h-3 w-3" />
          <span>{status.label}</span>
          <span className="text-white/60">｜定休：水・第2火・第3日</span>
        </div>
        {/* ナビボタン */}
        <div className="flex justify-around items-center py-1.5 px-4">
          <Link to="/properties" className="flex flex-col items-center justify-center py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Building2 className="h-6 w-6 text-green-700 mb-0.5" />
            <span className="text-xs font-medium text-gray-700">物件を探す</span>
          </Link>
          <Link to="/valuation" className="flex flex-col items-center justify-center py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Calculator className="h-6 w-6 text-green-600 mb-0.5" />
            <span className="text-xs font-medium text-gray-700">売却相談</span>
          </Link>
          <Link to="/contact" className="flex flex-col items-center justify-center py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="h-6 w-6 text-gray-600 mb-0.5" />
            <span className="text-xs font-medium text-gray-700">お問い合わせ</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default FixedSideButtons;
