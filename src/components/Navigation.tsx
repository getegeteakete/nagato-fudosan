import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronDown, Menu, X, User, LogOut, Calculator, FileText, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <nav className="container flex h-20 items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold text-gray-900">(有)長門不動産</span>
            <span className="text-xs text-gray-600 font-medium">おかげさまで地元に根付いて46年</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {/* 物件を探す */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>物件を探す</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[800px] gap-6 p-8 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">賃貸物件</h4>
                      <ul className="space-y-3">
                        <li>
                          <Link to="/rental/mansion" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold group-hover:text-blue-600 transition-colors">マンション</span>
                              <p className="text-xs text-gray-500 mt-0.5">高品質な賃貸物件</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/rental/apartment" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold group-hover:text-green-600 transition-colors">アパート</span>
                              <p className="text-xs text-gray-500 mt-0.5">お手頃な賃貸物件</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/rental/house" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                              <Building2 className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold group-hover:text-orange-600 transition-colors">戸建て</span>
                              <p className="text-xs text-gray-500 mt-0.5">一戸建て賃貸</p>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">売買物件</h4>
                      <ul className="space-y-3">
                        <li>
                          <Link to="/sale/new" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                              <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold group-hover:text-purple-600 transition-colors">新築</span>
                              <p className="text-xs text-gray-500 mt-0.5">新築マンション・戸建て</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/sale/used" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                              <Building2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold group-hover:text-indigo-600 transition-colors">中古</span>
                              <p className="text-xs text-gray-500 mt-0.5">中古マンション・戸建て</p>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/sale/land" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                              <Building2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold group-hover:text-emerald-600 transition-colors">土地</span>
                              <p className="text-xs text-gray-500 mt-0.5">土地・更地</p>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">注目物件</h4>
                      <div className="space-y-3">
                        <div className="relative group cursor-pointer">
                          <img 
                            src="/src/assets/hero-building.jpg" 
                            alt="高級マンション" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/30 transition-colors"></div>
                          <div className="absolute bottom-2 left-2 text-white">
                            <p className="text-xs font-semibold">高級マンション</p>
                            <p className="text-xs opacity-90">渋谷・恵比寿エリア</p>
                          </div>
                        </div>
                        <div className="relative group cursor-pointer">
                          <img 
                            src="/src/assets/hero-interior.jpg" 
                            alt="新築戸建て" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/30 transition-colors"></div>
                          <div className="absolute bottom-2 left-2 text-white">
                            <p className="text-xs font-semibold">新築戸建て</p>
                            <p className="text-xs opacity-90">世田谷・目黒エリア</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <Link to="/properties" className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      <span>すべての物件を見る</span>
                      <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ご売却の相談 */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>ご売却の相談</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[500px] p-8 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">査定サービス</h4>
                      <ul className="space-y-4">
                        <li>
                          <Link to="/valuation" className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calculator className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">オンライン査定</h5>
                                <p className="text-sm text-gray-600 mt-1">簡単な情報入力で査定額を算出</p>
                              </div>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/valuation/visit" className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Home className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">訪問査定</h5>
                                <p className="text-sm text-gray-600 mt-1">専門スタッフが訪問して詳細査定</p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">サポート</h4>
                      <ul className="space-y-4">
                        <li>
                          <Link to="/selling-guide" className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">売却の流れ</h5>
                                <p className="text-sm text-gray-600 mt-1">ステップバイステップで解説</p>
                              </div>
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/contact" className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <User className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">専門家相談</h5>
                                <p className="text-sm text-gray-600 mt-1">不動産のプロが直接サポート</p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ご入居者さま */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>ご入居者さま</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[400px] p-8 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">入居者サポート</h4>
                    <ul className="space-y-4">
                      <li>
                        <Link to="/moveout" className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">退去申請</h5>
                              <p className="text-sm text-gray-600 mt-1">オンラインで簡単に申請</p>
                            </div>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link to="/faq" className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">よくある質問</h5>
                              <p className="text-sm text-gray-600 mt-1">お困りごとはこちら</p>
                            </div>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link to="/maintenance" className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Home className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">修繕・メンテナンス</h5>
                              <p className="text-sm text-gray-600 mt-1">設備の不具合や修繕依頼</p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* 会社案内 */}
            <NavigationMenuItem>
              <Link to="/about" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                会社案内
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/contact">
            <Button variant="outline" size="sm">お問い合わせ</Button>
          </Link>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">マイページ</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/properties">物件検索</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/valuation">査定依頼</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">ログイン</Button>
              </Link>
              <Link to="/register">
                <Button variant="premium" size="sm">新規登録</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-bold text-gray-900">(有)長門不動産</span>
                  <span className="text-xs text-gray-600">おかげさまで地元に根付いて46年</span>
                </div>
              </div>

              {/* メインメニュー */}
              <nav className="flex-1 space-y-2">
                {/* 物件を探す */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3">物件を探す</h3>
                  <Link to="/properties" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">物件検索</span>
                  </Link>
                  <Link to="/properties?type=rental" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <Home className="h-5 w-5 text-green-600" />
                    <span className="font-medium">賃貸物件</span>
                  </Link>
                  <Link to="/properties?type=sale" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <Calculator className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">売買物件</span>
                  </Link>
                </div>

                {/* ご売却の相談 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3">ご売却の相談</h3>
                  <Link to="/valuation" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <Calculator className="h-5 w-5 text-green-600" />
                    <span className="font-medium">無料査定</span>
                  </Link>
                  <Link to="/contact" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <User className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">売却相談</span>
                  </Link>
                </div>

                {/* ご入居者さま */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3">ご入居者さま</h3>
                  <Link to="/moveout" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <FileText className="h-5 w-5 text-red-600" />
                    <span className="font-medium">退去申請</span>
                  </Link>
                  <Link to="/faq" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">よくある質問</span>
                  </Link>
                </div>

                {/* 会社案内 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3">会社案内</h3>
                  <Link to="/about" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">会社概要</span>
                  </Link>
                  <Link to="/contact" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(false)}>
                    <MessageCircle className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">お問い合わせ</span>
                  </Link>
                </div>
              </nav>

              {/* フッターアクション */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="premium" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        マイページ
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}>
                      ログアウト
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        ログイン
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button variant="premium" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        新規登録
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Navigation;
