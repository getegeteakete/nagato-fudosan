import { useState } from "react";
import { Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const AREAS = [
  { value: "all", label: "長門市全域" },
  { value: "東深川", label: "東深川" },
  { value: "西深川", label: "西深川" },
  { value: "仙崎", label: "仙崎" },
  { value: "三隅", label: "三隅" },
  { value: "日置", label: "日置" },
  { value: "油谷", label: "油谷" },
  { value: "俵山", label: "俵山" },
  { value: "深川湯本", label: "深川湯本" },
];

const RENTAL_PRICES = [
  { value: "30000", label: "3万円以下" },
  { value: "40000", label: "4万円以下" },
  { value: "50000", label: "5万円以下" },
  { value: "60000", label: "6万円以下" },
  { value: "70000", label: "7万円以下" },
  { value: "100000", label: "10万円以下" },
];

const SALE_PRICES = [
  { value: "3000000", label: "300万円以下" },
  { value: "5000000", label: "500万円以下" },
  { value: "8000000", label: "800万円以下" },
  { value: "10000000", label: "1000万円以下" },
  { value: "15000000", label: "1500万円以下" },
  { value: "20000000", label: "2000万円以下" },
  { value: "30000000", label: "3000万円以下" },
];

const PROPERTY_TYPES_RENTAL = [
  { value: "apartment", label: "アパート" },
  { value: "house", label: "一戸建て" },
  { value: "mansion", label: "マンション" },
  { value: "warehouse", label: "倉庫" },
];
const PROPERTY_TYPES_SALE = [
  { value: "apartment", label: "アパート" },
  { value: "house", label: "一戸建て" },
  { value: "mansion", label: "マンション" },
  { value: "warehouse", label: "倉庫" },
];

const AGES = [
  { value: "5", label: "築5年以内" },
  { value: "10", label: "築10年以内" },
  { value: "20", label: "築20年以内" },
  { value: "30", label: "築30年以内" },
];

const QuickSearch = () => {
  const navigate = useNavigate();
  const [rental, setRental] = useState({ area: "", price: "", type: "" });
  const [sale, setSale] = useState({ area: "", price: "", type: "", age: "" });

  const handleRentalSearch = () => {
    const params = new URLSearchParams();
    params.set("type", "rental");
    if (rental.area && rental.area !== "all") params.set("area", rental.area);
    if (rental.price) params.set("maxPrice", rental.price);
    if (rental.type) params.set("propertyType", rental.type);
    navigate(`/properties?${params.toString()}`);
  };

  const handleSaleSearch = () => {
    const params = new URLSearchParams();
    params.set("type", "sale");
    if (sale.area && sale.area !== "all") params.set("area", sale.area);
    if (sale.price) params.set("maxPrice", sale.price);
    if (sale.type) params.set("propertyType", sale.type);
    if (sale.age) params.set("maxAge", sale.age);
    navigate(`/properties?${params.toString()}`);
  };

  const SearchRow = ({ fields }: { fields: React.ReactNode[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {fields}
    </div>
  );

  return (
    <section className="py-12 bg-card/30 backdrop-blur-sm">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 -mx-4 md:-mx-6 lg:-mx-8">
            <div className="w-full bg-green-50 border-y border-green-100 py-4 px-6 flex items-center gap-4">
              <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>
              <div>
                <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">QUICK SEARCH</p>
                <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">物件をクイック検索</h2>
              </div>
            </div>
          </div>

          <Tabs defaultValue="rental" className="w-full">
            <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="rental">賃貸</TabsTrigger>
              <TabsTrigger value="sale">売買</TabsTrigger>
            </TabsList>

            {/* 賃貸 */}
            <TabsContent value="rental">
              <div className="bg-card rounded-2xl p-5 md:p-7 shadow-premium">
                <SearchRow fields={[
                  <div key="area">
                    <label className="block text-sm font-medium mb-1.5">エリア</label>
                    <Select value={rental.area} onValueChange={v => setRental(r => ({ ...r, area: v }))}>
                      <SelectTrigger><SelectValue placeholder="長門市全域" /></SelectTrigger>
                      <SelectContent>
                        {AREAS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>,
                  <div key="price">
                    <label className="block text-sm font-medium mb-1.5">賃料（上限）</label>
                    <Select value={rental.price} onValueChange={v => setRental(r => ({ ...r, price: v }))}>
                      <SelectTrigger><SelectValue placeholder="指定なし" /></SelectTrigger>
                      <SelectContent>
                        {RENTAL_PRICES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>,
                  <div key="type">
                    <label className="block text-sm font-medium mb-1.5">物件種別</label>
                    <Select value={rental.type} onValueChange={v => setRental(r => ({ ...r, type: v }))}>
                      <SelectTrigger><SelectValue placeholder="指定なし" /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES_RENTAL.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>,
                  <div key="spacer" className="hidden md:block" />,
                ]} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleRentalSearch} size="lg" className="flex-1 bg-green-700 hover:bg-green-800 group">
                    <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    この条件で賃貸を探す
                  </Button>
                  <Button onClick={() => navigate("/properties?type=rental")} variant="outline" size="lg" className="border-green-600 text-green-700 hover:bg-green-50">
                    <Settings className="mr-2 h-5 w-5" />
                    詳細条件で絞り込む
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 売買 */}
            <TabsContent value="sale">
              <div className="bg-card rounded-2xl p-5 md:p-7 shadow-premium">
                <SearchRow fields={[
                  <div key="area">
                    <label className="block text-sm font-medium mb-1.5">エリア</label>
                    <Select value={sale.area} onValueChange={v => setSale(s => ({ ...s, area: v }))}>
                      <SelectTrigger><SelectValue placeholder="長門市全域" /></SelectTrigger>
                      <SelectContent>
                        {AREAS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>,
                  <div key="price">
                    <label className="block text-sm font-medium mb-1.5">価格（上限）</label>
                    <Select value={sale.price} onValueChange={v => setSale(s => ({ ...s, price: v }))}>
                      <SelectTrigger><SelectValue placeholder="指定なし" /></SelectTrigger>
                      <SelectContent>
                        {SALE_PRICES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>,
                  <div key="type">
                    <label className="block text-sm font-medium mb-1.5">物件種別</label>
                    <Select value={sale.type} onValueChange={v => setSale(s => ({ ...s, type: v }))}>
                      <SelectTrigger><SelectValue placeholder="指定なし" /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES_SALE.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>,
                  <div key="age">
                    <label className="block text-sm font-medium mb-1.5">築年数</label>
                    <Select value={sale.age} onValueChange={v => setSale(s => ({ ...s, age: v }))}>
                      <SelectTrigger><SelectValue placeholder="指定なし" /></SelectTrigger>
                      <SelectContent>
                        {AGES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>,
                ]} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSaleSearch} size="lg" className="flex-1 bg-amber-600 hover:bg-amber-700 group">
                    <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    この条件で売買物件を探す
                  </Button>
                  <Button onClick={() => navigate("/properties?type=sale")} variant="outline" size="lg" className="border-amber-600 text-amber-700 hover:bg-amber-50">
                    <Settings className="mr-2 h-5 w-5" />
                    詳細条件で絞り込む
                  </Button>
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
