import { useState } from "react";
import { Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QuickSearch = () => {
  const [searchType, setSearchType] = useState("rental");

  return (
    <section className="py-12 bg-card/30 backdrop-blur-sm">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-8">
            物件をクイック検索
          </h2>

          <Tabs defaultValue="rental" className="w-full" onValueChange={setSearchType}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="rental">賃貸</TabsTrigger>
              <TabsTrigger value="sale">売買</TabsTrigger>
            </TabsList>

            <TabsContent value="rental" className="space-y-6">
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-premium">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">エリア</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nagato">長門市全域</SelectItem>
                        <SelectItem value="higashifukawa">東深川</SelectItem>
                        <SelectItem value="nishifukawa">西深川</SelectItem>
                        <SelectItem value="seimei">正明市</SelectItem>
                        <SelectItem value="tawarayama">俵山</SelectItem>
                        <SelectItem value="senzaki">仙崎</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">沿線・駅</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nagato">長門市駅</SelectItem>
                        <SelectItem value="senzaki">仙崎駅</SelectItem>
                        <SelectItem value="nagatoyumoto">長門湯本駅</SelectItem>
                        <SelectItem value="itamochi">板持駅</SelectItem>
                        <SelectItem value="misumi">三隅駅</SelectItem>
                        <SelectItem value="hitomaru">人丸駅</SelectItem>
                        <SelectItem value="furuyama">古市駅</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">賃料</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="指定なし" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3万円以下</SelectItem>
                        <SelectItem value="4">4万円以下</SelectItem>
                        <SelectItem value="5">5万円以下</SelectItem>
                        <SelectItem value="6">6万円以下</SelectItem>
                        <SelectItem value="7">7万円以下</SelectItem>
                        <SelectItem value="10">10万円以下</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">間取り</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="指定なし" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ldk">1LDK</SelectItem>
                        <SelectItem value="2dk">2DK</SelectItem>
                        <SelectItem value="3dk">3DK</SelectItem>
                        <SelectItem value="4dk">4DK</SelectItem>
                        <SelectItem value="4ldk">4LDK</SelectItem>
                        <SelectItem value="5dk">5DK</SelectItem>
                        <SelectItem value="6k">6K</SelectItem>
                        <SelectItem value="6dk">6DK</SelectItem>
                        <SelectItem value="6ldk">6LDK</SelectItem>
                        <SelectItem value="8dk">8DK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">物件種別</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="指定なし" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mansion">マンション</SelectItem>
                        <SelectItem value="apartment">アパート</SelectItem>
                        <SelectItem value="house">一戸建</SelectItem>
                        <SelectItem value="dormitory">社宅・寮</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/properties" className="flex-1">
                    <Button variant="premium" size="lg" className="w-full group">
                      <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      この条件で探す
                    </Button>
                  </Link>
                  <Link to="/properties">
                    <Button variant="outline" size="lg" className="group">
                      <Settings className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                      詳細条件を設定
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sale" className="space-y-6">
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-premium">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">エリア</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nagato">長門市全域</SelectItem>
                        <SelectItem value="higashifukawa">東深川</SelectItem>
                        <SelectItem value="nishifukawa">西深川</SelectItem>
                        <SelectItem value="seimei">正明市</SelectItem>
                        <SelectItem value="tawarayama">俵山</SelectItem>
                        <SelectItem value="senzaki">仙崎</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">沿線・駅</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nagato">長門市駅</SelectItem>
                        <SelectItem value="senzaki">仙崎駅</SelectItem>
                        <SelectItem value="nagatoyumoto">長門湯本駅</SelectItem>
                        <SelectItem value="itamochi">板持駅</SelectItem>
                        <SelectItem value="misumi">三隅駅</SelectItem>
                        <SelectItem value="hitomaru">人丸駅</SelectItem>
                        <SelectItem value="furuyama">古市駅</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">価格</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="指定なし" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">300万円以下</SelectItem>
                        <SelectItem value="400">400万円以下</SelectItem>
                        <SelectItem value="500">500万円以下</SelectItem>
                        <SelectItem value="600">600万円以下</SelectItem>
                        <SelectItem value="700">700万円以下</SelectItem>
                        <SelectItem value="800">800万円以下</SelectItem>
                        <SelectItem value="900">900万円以下</SelectItem>
                        <SelectItem value="1000">1000万円以下</SelectItem>
                        <SelectItem value="1100">1100万円以下</SelectItem>
                        <SelectItem value="1200">1200万円以下</SelectItem>
                        <SelectItem value="1300">1300万円以下</SelectItem>
                        <SelectItem value="1400">1400万円以下</SelectItem>
                        <SelectItem value="1500">1500万円以下</SelectItem>
                        <SelectItem value="1600">1600万円以下</SelectItem>
                        <SelectItem value="1700">1700万円以下</SelectItem>
                        <SelectItem value="1800">1800万円以下</SelectItem>
                        <SelectItem value="1900">1900万円以下</SelectItem>
                        <SelectItem value="2000">2000万円以下</SelectItem>
                        <SelectItem value="3000">3000万円以下</SelectItem>
                        <SelectItem value="5000">5000万円以下</SelectItem>
                        <SelectItem value="7000">7000万円以下</SelectItem>
                        <SelectItem value="10000">1億円以下</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">築年数</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="指定なし" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">新築</SelectItem>
                        <SelectItem value="5">築5年以内</SelectItem>
                        <SelectItem value="10">築10年以内</SelectItem>
                        <SelectItem value="15">築15年以内</SelectItem>
                        <SelectItem value="20">築20年以内</SelectItem>
                        <SelectItem value="30">築30年以内</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">駅歩分</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="指定なし" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1分以内</SelectItem>
                        <SelectItem value="3">3分以内</SelectItem>
                        <SelectItem value="5">5分以内</SelectItem>
                        <SelectItem value="10">10分以内</SelectItem>
                        <SelectItem value="15">15分以内</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/properties" className="flex-1">
                    <Button variant="premium" size="lg" className="w-full group">
                      <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      この条件で探す
                    </Button>
                  </Link>
                  <Link to="/properties">
                    <Button variant="outline" size="lg" className="group">
                      <Settings className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                      詳細条件を設定
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default QuickSearch;
