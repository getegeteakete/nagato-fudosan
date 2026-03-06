import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ValuationRequest } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api';

const valuationSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  propertyType: z.enum(['apartment', 'house', 'land']),
  address: z.string().min(1, '住所を入力してください'),
  area: z.number().min(1, '面積を入力してください'),
  age: z.number().min(0, '築年数を入力してください'),
  floor: z.number().optional(),
  rooms: z.number().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  features: z.array(z.string()).optional(),
});

type ValuationFormData = z.infer<typeof valuationSchema>;

interface ValuationFormProps {
  onSuccess?: (request: ValuationRequest) => void;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'マンション' },
  { value: 'house', label: '戸建て' },
  { value: 'land', label: '土地' },
];

const CONDITIONS = [
  { value: 'excellent', label: '非常に良い', description: 'リフォーム済み、設備が新しく状態が良い' },
  { value: 'good', label: '良い', description: '一般的な状態で問題なし' },
  { value: 'fair', label: '普通', description: 'やや古いが住める状態' },
  { value: 'poor', label: '要修繕', description: 'リフォームや修繕が必要' },
];

const FEATURES = [
  { value: 'renovated', label: 'リフォーム済み' },
  { value: 'parking', label: '駐車場あり' },
  { value: 'balcony', label: 'バルコニー・ベランダ' },
  { value: 'storage', label: '収納充実' },
  { value: 'security', label: 'セキュリティ充実' },
  { value: 'near_station', label: '駅近' },
  { value: 'quiet', label: '静かな環境' },
  { value: 'convenience', label: '利便性良好' },
  { value: 'view', label: '眺望良好' },
  { value: 'south_facing', label: '南向き' },
];

const ValuationForm: React.FC<ValuationFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ValuationRequest | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      features: [],
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: ValuationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.submitValuationRequest({
        ...data,
        status: 'pending',
      });

      if (response.success && response.data) {
        setSubmittedRequest(response.data);
        onSuccess?.(response.data);
      }
    } catch (error) {
      console.error('Error submitting valuation request:', error);
    } finally {
      setIsSubmitting(false);
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

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (submittedRequest) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">査定依頼を受け付けました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              査定依頼を受け付けました。担当者より2営業日以内にご連絡いたします。
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="font-semibold">今後の流れ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                <span>担当者よりお電話にて詳細確認</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                <span>現地調査の日程調整</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                <span>現地調査実施</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                <span>査定結果のご報告</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              査定依頼番号: <span className="font-mono">{submittedRequest.id}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          オンライン売却査定
        </CardTitle>
        <p className="text-gray-600">
          無料で物件の査定を行います。お気軽にお申し込みください。
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Tabs value={currentStep.toString()} className="w-full">
            <TabsContent value="1" className="space-y-4">
              <h3 className="text-lg font-semibold">基本情報</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">お名前 *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="山田太郎"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号 *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="090-1234-5678"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">物件種別 *</Label>
                  <Select
                    value={watchedValues.propertyType || ''}
                    onValueChange={(value) => setValue('propertyType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propertyType && (
                    <p className="text-sm text-red-600">{errors.propertyType.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">住所 *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="山口県長門市..."
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="2" className="space-y-4">
              <h3 className="text-lg font-semibold">物件詳細</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">面積（㎡） *</Label>
                  <Input
                    id="area"
                    type="number"
                    {...register('area', { valueAsNumber: true })}
                    placeholder="50"
                  />
                  {errors.area && (
                    <p className="text-sm text-red-600">{errors.area.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">築年数 *</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    placeholder="10"
                  />
                  {errors.age && (
                    <p className="text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>

                {watchedValues.propertyType !== 'land' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="floor">階数</Label>
                      <Input
                        id="floor"
                        type="number"
                        {...register('floor', { valueAsNumber: true })}
                        placeholder="3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rooms">部屋数</Label>
                      <Input
                        id="rooms"
                        type="number"
                        {...register('rooms', { valueAsNumber: true })}
                        placeholder="3"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>物件の状態 *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONDITIONS.map((condition) => (
                    <div key={condition.value} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={condition.value}
                          value={condition.value}
                          {...register('condition')}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={condition.value} className="font-medium">
                          {condition.label}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {condition.description}
                      </p>
                    </div>
                  ))}
                </div>
                {errors.condition && (
                  <p className="text-sm text-red-600">{errors.condition.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="3" className="space-y-4">
              <h3 className="text-lg font-semibold">物件の特徴</h3>
              
              <div className="space-y-2">
                <Label>該当する特徴を選択してください</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

              <div className="space-y-2">
                <Label htmlFor="notes">その他ご要望・ご質問</Label>
                <Textarea
                  id="notes"
                  placeholder="査定に関するご要望やご質問がございましたら、こちらにご記入ください。"
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              前へ
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                次へ
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? '送信中...' : '査定依頼を送信'}
                <Calculator className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ValuationForm;
