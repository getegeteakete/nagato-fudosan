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
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Save } from 'lucide-react';
import { useSavedSearches } from '@/hooks/usePropertySearch';

const searchSchema = z.object({
  type: z.enum(['rent', 'sale']).optional(),
  propertyType: z.array(z.string()).optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
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

const PREFECTURES = [
  '山口県', '広島県', '岡山県', '鳥取県', '島根県',
  '福岡県', '大分県', '熊本県', '宮崎県', '鹿児島県',
  '兵庫県', '大阪府', '京都府',
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'マンション' },
  { value: 'house', label: '戸建て' },
  { value: 'office', label: 'オフィス' },
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
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { saveSearch } = useSavedSearches();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      type: initialCriteria.type,
      propertyType: initialCriteria.propertyType || [],
      prefecture: initialCriteria.prefecture,
      city: initialCriteria.city,
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
      // 空の配列やundefinedを除去
      propertyType: data.propertyType?.length ? data.propertyType : undefined,
      features: data.features?.length ? data.features : undefined,
    };
    onSearch(criteria);
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) return;
    
    const criteria: SearchCriteria = {
      ...watchedValues,
      propertyType: watchedValues.propertyType?.length ? watchedValues.propertyType : undefined,
      features: watchedValues.features?.length ? watchedValues.features : undefined,
    };

    const success = await saveSearch(saveSearchName, criteria);
    if (success) {
      setSaveSearchName('');
      setShowSaveDialog(false);
    }
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    const currentFeatures = watchedValues.features || [];
    if (checked) {
      setValue('features', [...currentFeatures, feature]);
    } else {
      setValue('features', currentFeatures.filter(f => f !== feature));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          物件検索
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本条件</TabsTrigger>
              <TabsTrigger value="advanced">詳細条件</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">取引種別</Label>
                  <Select
                    value={watchedValues.type || ''}
                    onValueChange={(value) => setValue('type', value as 'rent' | 'sale')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">賃貸</SelectItem>
                      <SelectItem value="sale">売買</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prefecture">都道府県</Label>
                  <Select
                    value={watchedValues.prefecture || ''}
                    onValueChange={(value) => setValue('prefecture', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREFECTURES.map((pref) => (
                        <SelectItem key={pref} value={pref}>
                          {pref}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">市区町村</Label>
                  <Input
                    {...register('city')}
                    placeholder="例: 渋谷区"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station">最寄り駅</Label>
                  <Input
                    {...register('station')}
                    placeholder="例: 渋谷駅"
                  />
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
                  <Label>面積</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="最小面積（㎡）"
                      {...register('minArea', { valueAsNumber: true })}
                    />
                    <Input
                      type="number"
                      placeholder="最大面積（㎡）"
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
                  <Label>間取り</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="最小部屋数"
                      {...register('minRooms', { valueAsNumber: true })}
                    />
                    <Input
                      type="number"
                      placeholder="最大部屋数"
                      {...register('maxRooms', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>築年数</Label>
                  <Input
                    type="number"
                    placeholder="最大築年数"
                    {...register('maxAge', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>徒歩時間</Label>
                  <Input
                    type="number"
                    placeholder="最大徒歩時間（分）"
                    {...register('maxWalkingTime', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>設備・特徴</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
            <Button type="submit" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              検索
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              リセット
            </Button>
            {showSaveButton && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            )}
          </div>
        </form>

        {showSaveDialog && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <Label htmlFor="saveSearchName">検索条件名</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="saveSearchName"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="検索条件名を入力"
              />
              <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                保存
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSaveSearchName('');
                  setShowSaveDialog(false);
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
