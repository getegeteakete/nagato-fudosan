import { Link } from "react-router-dom";
import { Building2, Calculator, MessageCircle } from "lucide-react";

const FixedSideButtons = () => {
  return (
    <>
      {/* PC版: 右側固定 */}
      <div className="hidden lg:block fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-1">
          {/* 物件を探す */}
          <Link to="/properties" className="group">
            <div className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-16 h-32 border-l-4 border-blue-500 hover:border-blue-400">
              <div className="writing-mode-vertical text-center">
                <Building2 className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-bold tracking-wider">物件を探す</span>
              </div>
            </div>
          </Link>

          {/* 売却相談 */}
          <Link to="/valuation" className="group">
            <div className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-16 h-32 border-l-4 border-green-500 hover:border-green-400">
              <div className="writing-mode-vertical text-center">
                <Calculator className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-bold tracking-wider">売却相談</span>
              </div>
            </div>
          </Link>

          {/* お問い合わせ */}
          <Link to="/contact" className="group">
            <div className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-16 h-32 border-l-4 border-gray-500 hover:border-gray-400">
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
        <div className="flex justify-around items-center py-2 px-4">
          {/* 物件を探す */}
          <Link to="/properties" className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Building2 className="h-6 w-6 text-blue-600 mb-1" />
            <span className="text-xs font-medium text-gray-700">物件を探す</span>
          </Link>

          {/* 売却相談 */}
          <Link to="/valuation" className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Calculator className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs font-medium text-gray-700">売却相談</span>
          </Link>

          {/* お問い合わせ */}
          <Link to="/contact" className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="h-6 w-6 text-gray-600 mb-1" />
            <span className="text-xs font-medium text-gray-700">お問い合わせ</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default FixedSideButtons;
