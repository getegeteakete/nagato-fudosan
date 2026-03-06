import { Shield, Clock, TrendingUp } from "lucide-react";

const highlights = [
  {
    icon: Clock,
    title: "地域密着46年",
    description: "長門市に根付いて46年。地域の特性を深く理解したサポート"
  },
  {
    icon: Shield,
    title: "信頼と安心",
    description: "46年の実績と豊富な経験で、お客様に安心してお任せいただけるサービス"
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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            長門市の魅力
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            美しい自然と歴史ある街並みの中で、理想の住まいを見つけませんか
          </p>
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
