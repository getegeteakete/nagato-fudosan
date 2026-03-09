import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Award, Target, Heart, Shield, TrendingUp, Globe } from "lucide-react";

const About = () => {
  const stats = [
    { label: "創業年数", value: "48", description: "年" },
    { label: "地域密着", value: "100%", description: "" },
    { label: "対応地域", value: "長門市", description: "全域" },
    { label: "信頼実績", value: "48", description: "年" },
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "地域密着48年",
      description: "長門市に根付いて48年。地域の特性を深く理解し、お客様に最適なサービスを提供します。"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "信頼と安心",
      description: "48年の実績と豊富な経験で、お客様に安心してお任せいただけるサービスを提供します。"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      title: "コスト削減",
      description: "広告や営業など、無駄な費用を削減することであなたのためのサポートをします。"
    },
    {
      icon: <Globe className="h-8 w-8 text-green-600" />,
      title: "とことんサポート",
      description: "一生に一度の、納得のいく物件がみつかるまで、とことんおつき合いさせていただきます。"
    }
  ];

  const history = [
    { year: "1978", event: "長門不動産設立", description: "山口県長門市にて創業" },
    { year: "1985", event: "事業拡大", description: "賃貸仲介事業を本格開始" },
    { year: "1995", event: "売買事業強化", description: "土地・中古住宅の売買事業を強化" },
    { year: "2005", event: "管理事業開始", description: "空き家管理・不動産管理事業を開始" },
    { year: "2015", event: "デジタル化推進", description: "Webサイトでの物件検索サービスを開始" },
    { year: "2024", event: "46周年", description: "地域密着の不動産サービスを継続提供" }
  ];

  return (
    <div className="container py-16">
      {/* ヒーローセクション */}
      <div className="mb-12 -mx-4">
        <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
          <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
          <div>
            <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">ABOUT US</p>
            <h1 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">会社案内</h1>
          </div>
          <p className="text-sm text-gray-500 ml-auto hidden md:block">おかげさまで地元に根付いて48年</p>
        </div>
      </div>

      {/* 会社概要 */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-green-600" />
              <span>会社概要</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">会社名</h4>
                  <p className="text-gray-600">(有)長門不動産</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">代表者</h4>
                  <p className="text-gray-600">大野高史</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">創業</h4>
                  <p className="text-gray-600">1976年（48年の実績）</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">免許証番号</h4>
                  <p className="text-gray-600">山口県知事（11）第1790号</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">所在地</h4>
                  <p className="text-gray-600">
                    〒759-4101<br />
                    山口県長門市東深川2684番地5<br />
                    （深川中テニスコート前）
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">事業内容</h4>
                  <p className="text-gray-600">
                    土地、中古住宅などの不動産売買サービス<br />
                    アパート・マンション・一戸建て・社宅・寮などの賃貸仲介サービス<br />
                    空き家管理・不動産管理
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">営業時間</h4>
                  <p className="text-gray-600">
                    平日：9:00～18:00<br />
                    土日祝：10:00～17:00<br />
                    定休日：毎週水曜日/第2火曜日/第3日曜日
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 実績・数値 */}
      <div className="mb-16">
        <div className="mb-6 -mx-4">
          <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
            <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">ACHIEVEMENTS</p>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">実績・数値</h2>
            </div>
          </div>
        </div>
        <div className="w-12 h-1 bg-green-700 mx-auto mb-12 rounded-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stat.value}
                  <span className="text-lg text-gray-600 ml-1">{stat.description}</span>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 企業理念・価値観 */}
      <div className="mb-16">
        <div className="mb-10 -mx-4">
          <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
            <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">PHILOSOPHY</p>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">企業理念・価値観</h2>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 沿革 */}
      <div className="mb-16">
        <div className="mb-10 -mx-4">
          <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
            <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">HISTORY</p>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">沿革</h2>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {history.map((item, index) => (
            <div key={index} className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
                  {item.year}
                </Badge>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.event}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 代表メッセージ */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <span>代表取締役からのメッセージ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900">大野 高史</h3>
                <p className="text-center text-gray-600">代表取締役</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-700 leading-relaxed mb-4">
                  1978年の創業以来、私たち長門不動産は地域密着の不動産サービスを提供し、長門市の皆様の住まい探しをサポートしてまいりました。
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  48年間で培った地域の知識と信頼関係を活かし、お客様一人ひとりに最適な物件をご提案いたします。私たちはただ安いだけでは意味がないと考え、広告や営業など無駄な費用を削減することで、お客様のためのサポートをすることができます。
                </p>
                <p className="text-gray-700 leading-relaxed">
                  一生に一度の、納得のいく物件が見つかるまで、とことんおつき合いさせていただきます。長門市の不動産のプロフェッショナルとして、これからも地域社会の発展に貢献してまいります。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* アクセス */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-green-600" />
              <span>アクセス</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">本社所在地</h4>
                <p className="text-gray-600 mb-4">
                  〒759-4101<br />
                  山口県長門市東深川2684番地5<br />
                  （深川中テニスコート前）
                </p>
                <h4 className="font-semibold text-gray-900 mb-2">最寄り駅</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• JR山陰本線「長門市駅」</li>
                  <li>• JR山陰本線「仙崎駅」</li>
                  <li>• JR美祢線「長門湯本駅」</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">営業時間</h4>
                <div className="space-y-2 text-gray-600">
                  <p>平日：9:00 - 18:00</p>
                  <p>土日祝：10:00 - 17:00</p>
                  <p className="text-sm text-gray-500 mt-4">定休日：毎週水曜日/第2火曜日/第3日曜日</p>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 mt-6">お問い合わせ</h4>
                <div className="space-y-1 text-gray-600">
                  <p>TEL: 0837-22-3321</p>
                  <p>FAX: 0837-22-6675</p>
                  <p>Email: nag3321@sage.ocn.ne.jp</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
