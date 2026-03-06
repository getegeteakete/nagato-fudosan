import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
        <div className="flex items-center mb-6">
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold">(有)長門不動産</span>
            <span className="text-xs text-gray-300 font-medium">おかげさまで地元に根付いて46年</span>
          </div>
        </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              おかげさまで地元に根付いて46年。長門市の賃貸・物件・不動産売買・空き家管理・不動産管理はお任せください。
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <span>0837-22-3321</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <span>nag3321@sage.ocn.ne.jp</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>〒759-4101<br />山口県長門市東深川2684番地5<br />（深川中テニスコート前）</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="mt-8">
              <h5 className="text-sm font-semibold text-gray-300 mb-4">フォローする</h5>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">物件を探す</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/rental" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  賃貸物件
                </Link>
              </li>
              <li>
                <Link to="/sale" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  売買物件
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  エリアから探す
                </Link>
              </li>
              <li>
                <Link to="/properties/map" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  地図から探す
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">サービス</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/valuation" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  売却査定
                </Link>
              </li>
              <li>
                <Link to="/moveout" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  退去申請
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  マイページ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">会社情報</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  会社案内
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-green-400 transition-colors flex items-center group">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-green-300"></span>
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">&copy; 2024 Premium Estate. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>不動産事業者免許: 東京都知事 (1) 12345号</span>
              <span>|</span>
              <span>宅地建物取引士: 田中太郎 (123456)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
