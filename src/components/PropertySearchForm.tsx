import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SearchCriteria } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, Navigation } from 'lucide-react';
import { useSavedSearches } from '@/hooks/usePropertySearch';

const searchSchema = z.object({
  type: z.enum(['rent', 'sale']).optional(),
  propertyType: z.array(z.string()).optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  station: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minArea: z.number().optional(),
  maxArea: z.number().optional(),
  minRooms: z.number().optional(),
  maxRooms: z.number().optional(),
  maxAge: z.number().optional(),
  maxWalkingTime: z.number().optional(),
  features: z.array(z.string()).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface PropertySearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  initialCriteria?: SearchCriteria;
  showSaveButton?: boolean;
}

// 長門市のエリア（大字レベル）
const NAGATO_AREAS = [
  { value: '東深川', label: '東深川（市街地中心）' },
  { value: '西深川', label: '西深川' },
  { value: '仙崎', label: '仙崎' },
  { value: '三隅', label: '三隅' },
  { value: '日置', label: '日置' },
  { value: '油谷', label: '油谷' },
  { value: '俵山', label: '俵山' },
  { value: '深川湯本', label: '深川湯本（湯本温泉）' },
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'アパート' },
  { value: 'mansion', label: 'マンション' },
  { value: 'house', label: '戸建て' },
  { value: 'office', label: '倉庫・事務所' },
  { value: 'land', label: '土地' },
];

const FEATURES = [
  { value: 'pet_allowed', label: 'ペット可' },
  { value: 'parking', label: '駐車場あり' },
  { value: 'balcony', label: 'バルコニー' },
  { value: 'air_conditioning', label: 'エアコン' },
  { value: 'washing_machine', label: '洗濯機置き場' },
  { value: 'refrigerator', label: '冷蔵庫' },
  { value: 'furnished', label: '家具付き' },
  { value: 'near_station', label: '駅近' },
  { value: 'quiet', label: '静かな環境' },
  { value: 'security', label: 'セキュリティ充実' },
];

export const PropertySearchForm: React.FC<PropertySearchFormProps> = ({
  onSearch,
  initialCriteria = {},
  showSaveButton = true,
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsArea, setGpsArea] = useState<string | null>(null);
  const { saveSearch } = useSavedSearches();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      type: initialCriteria.type,
      propertyType: initialCriteria.propertyType || [],
      prefecture: '山口県',
      city: '長門市',
      area: initialCriteria.city || '',
      station: initialCriteria.station,
      minPrice: initialCriteria.minPrice,
      maxPrice: initialCriteria.maxPrice,
      minArea: initialCriteria.minArea,
      maxArea: initialCriteria.maxArea,
      minRooms: initialCriteria.minRooms,
      maxRooms: initialCriteria.maxRooms,
      maxAge: initialCriteria.maxAge,
      maxWalkingTime: initialCriteria.maxWalkingTime,
      features: initialCriteria.features || [],
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: SearchFormData) => {
    const criteria: SearchCriteria = {
      ...data,
      prefecture: '山口県',
      city: data.area ? `長門市${data.area}` : '長門市',
      propertyType: data.propertyType?.length ? data.propertyType : undefined,
      features: data.features?.length ? data.features : undefined,
    };
    onSearch(criteria);
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    const currentFeatures = watchedValues.features || [];
    if (checked) {
      setValue('features', [...currentFeatures, feature]);
    } else {
      setValue('features', currentFeatures.filter(f => f !== feature));
    }
  };

  // 現在地から近いエリアを自動判定
  const handleGpsSearch = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // 長門市エリアの中心座標（大まかな判定）
        const areaCoords: { area: string; lat: number; lng: number }[] = [
          { area: '東深川', lat: 34.374, lng: 131.182 },
          { area: '西深川', lat: 34.364, lng: 131.168 },
          { area: '仙崎', lat: 34.388, lng: 131.228 },
          { area: '三隅', lat: 34.299, lng: 131.210 },
          { area: '日置', lat: 34.416, lng: 131.098 },
          { area: '油谷', lat: 34.456, lng: 131.014 },
          { area: '俵山', lat: 34.337, lng: 131.113 },
          { area: '深川湯本', lat: 34.374, lng: 131.147 },
        ];
        // 最も近いエリアを計算
        let nearest = areaCoords[0];
        let minDist = Infinity;
        for (const a of areaCoords) {
          const d = Math.sqrt((a.lat - latitude) ** 2 + (a.lng - longitude) ** 2);
          if (d < minDist) { minDist = d; nearest = a; }
        }
        setValue('area', nearest.area);
        setGpsArea(nearest.area);
        setGpsLoading(false);
        // 自動検索
        onSearch({
          prefecture: '山口県',
          city: `長門市${nearest.area}`,
        });
      },
      () => {
        alert('位置情報の取得に失敗しました。設定をご確認ください。');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-green-700" />
          物件検索
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 現在地から探すボタン */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4 border-green-600 text-green-700 hover:bg-green-50"
          onClick={handleGpsSearch}
          disabled={gpsLoading}
        >
          <Navigation className={`h-4 w-4 mr-2 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? '位置情報を取得中...' : '現在地から近い物件を探す'}
        </Button>
        {gpsArea && (
          <p className="text-xs text-green-700 text-center -mt-2 mb-3">
            📍 現在地に近いエリア：<strong>{gpsArea}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本条件</TabsTrigger>
              <TabsTrigger value="advanced">詳細条件</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* 固定：山口県・長門市 */}
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-700 flex-shrink-0" />
                <div>
                  <span className="text-xs text-green-600 font-medium">検索エリア固定</span>
                  <p className="text-sm font-bold text-green-800">山口県 長門市</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>エリア（地区）</Label>
                <Select
                  value={watchedValues.area || ''}
                  onValueChange={(value) => setValue('area', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="地区を選択（全域）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全域</SelectItem>
                    {NAGATO_AREAS.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">取引種別</Label>
                  <Select
                    value={watchedValues.type || ''}
                    onValueChange={(value) => setValue('type', value as 'rent' | 'sale')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">賃貸</SelectItem>
                      <SelectItem value="sale">売買</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>価格帯</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="最低価格"
                      {...register('minPrice', { valueAsNumber: true })}
                    />
                    <Input
                      type="number"
                      placeholder="最高価格"
                      {...register('maxPrice', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>面積（㎡）</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="最小"
                      {...register('minArea', { valueAsNumber: true })}
                    />
                    <Input
                      type="number"
                      placeholder="最大"
                      {...register('maxArea', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>物件種別</Label>
                  <div className="space-y-2">
                    {PROPERTY_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={watchedValues.propertyType?.includes(type.value) || false}
                          onCheckedChange={(checked) => {
                            const currentTypes = watchedValues.propertyType || [];
                            if (checked) {
                              setValue('propertyType', [...currentTypes, type.value]);
                            } else {
                              setValue('propertyType', currentTypes.filter(t => t !== type.value));
                            }
                          }}
                        />
                        <Label htmlFor={type.value}>{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>間取り（部屋数）</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="最小"
                      {...register('minRooms', { valueAsNumber: true })}
                    />
                    <Input
                      type="number"
                      placeholder="最大"
                      {...register('maxRooms', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>築年数（以内）</Label>
                  <Input
                    type="number"
                    placeholder="例：20（年以内）"
                    {...register('maxAge', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>設備・特徴</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURES.map((feature) => (
                    <div key={feature.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.value}
                        checked={watchedValues.features?.includes(feature.value) || false}
                        onCheckedChange={(checked) => handleFeatureChange(feature.value, !!checked)}
                      />
                      <Label htmlFor={feature.value} className="text-sm">
                        {feature.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800">
              <Search className="h-4 w-4 mr-2" />
              検索
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset({ prefecture: '山口県', city: '長門市', area: '' }); setGpsArea(null); }}
            >
              リセット
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
