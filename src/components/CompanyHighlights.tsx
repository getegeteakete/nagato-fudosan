import { Shield, Clock, TrendingUp } from "lucide-react";

const highlights = [
  {
    icon: Clock,
    title: "地域密着48年",
    description: "長門市に根付いて48年。地域の特性を深く理解したサポート"
  },
  {
    icon: Shield,
    title: "信頼と安心",
    description: "48年の実績と豊富な経験で、お客様に安心してお任せいただけるサービス"
  },
  {
    icon: TrendingUp,
    title: "コスト削減",
    description: "広告や営業など、無駄な費用を削減することであなたのためのサポート"
  }
];

const CompanyHighlights = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
      <div className="container">
        <div className="mb-12 -mx-4 md:-mx-6 lg:-mx-8">
          <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
            <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
            <div>
              <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">WHY CHOOSE US</p>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">安心と信頼の理由</h2>
            </div>
            <p className="text-sm text-gray-500 ml-auto hidden md:block">地元・長門市に根付いて48年</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {highlights.map((item, index) => (
            <div 
              key={item.title}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="inline-flex p-6 rounded-2xl bg-card shadow-premium mb-6 group-hover:shadow-gold transition-all duration-300">
                <item.icon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyHighlights;
