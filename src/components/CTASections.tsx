import { FileText, LogOut, ArrowRight, Calculator, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const CTASections = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* 売却査定CTA */}
          <Card className="p-8 md:p-10 shadow-premium hover-lift gradient-gold border-primary/20 group">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Calculator className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-semibold mb-3">
                  売却をお考えの方へ
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  オンラインで簡単に査定依頼が可能です。<br />
                  専門スタッフが迅速かつ正確に対応いたします。
                </p>
                <Link to="/valuation">
                  <Button variant="premium" size="lg" className="group/btn">
                    無料査定を依頼する
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* 退去申請CTA */}
          <Card className="p-8 md:p-10 shadow-premium hover-lift group">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl bg-secondary text-foreground group-hover:bg-secondary/80 transition-colors">
                <FileCheck className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-semibold mb-3">
                  ご入居者さまへ
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  退去申請や各種お手続きは<br />
                  オンラインで24時間受付中です。
                </p>
                <Link to="/moveout">
                  <Button variant="outline" size="lg" className="group/btn border-2 hover:bg-primary hover:text-primary-foreground transition-all">
                    退去申請をする
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CTASections;
