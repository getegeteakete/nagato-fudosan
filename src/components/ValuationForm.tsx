import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const step1Schema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  propertyType: z.enum(['apartment', 'house', 'land'], { required_error: '物件種別を選択してください' }),
  address: z.string().min(1, '住所を入力してください'),
});

const step2Schema = z.object({
  area: z.number({ invalid_type_error: '面積を入力してください' }).min(1, '面積を入力してください'),
  age: z.number({ invalid_type_error: '築年数を入力してください' }).min(0, '築年数を入力してください'),
  floor: z.number().optional(),
  rooms: z.number().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor'], { required_error: '物件の状態を選択してください' }),
});

const fullSchema = step1Schema.merge(step2Schema).extend({
  features: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof fullSchema>;

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'マンション' },
  { value: 'house', label: '戸建て' },
  { value: 'land', label: '土地' },
];

const CONDITIONS = [
  { value: 'excellent', label: '非常に良い', description: 'リフォーム済み・設備が新しく状態が良い' },
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

const STEP_LABELS = ['基本情報', '物件詳細', '特徴・送信'];

const ValuationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const {
    register,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: { features: [] },
    mode: 'onSubmit',
  });

  const watchedValues = watch();

  const scrollToTop = () => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNext = async () => {
    let valid = false;
    if (currentStep === 1) {
      valid = await trigger(['name', 'email', 'phone', 'propertyType', 'address']);
    } else if (currentStep === 2) {
      valid = await trigger(['area', 'age', 'condition']);
    }
    if (valid) {
      setCurrentStep(s => s + 1);
      scrollToTop();
    }
  };

  const handlePrev = () => {
    setCurrentStep(s => s - 1);
    scrollToTop();
  };

  const handleSubmit = () => {
    const data = getValues();
    const featureLabels = (data.features || [])
      .map(f => FEATURES.find(x => x.value === f)?.label || f)
      .join('、');
    const conditionLabel = CONDITIONS.find(c => c.value === data.condition)?.label || '';
    const typeLabel = PROPERTY_TYPES.find(t => t.value === data.propertyType)?.label || '';

    const subject = `【売却査定依頼】${data.name} 様`;
    const body = `■ お客様情報
お名前：${data.name}
メール：${data.email}
電話番号：${data.phone}

■ 物件情報
種別：${typeLabel}
住所：${data.address}
面積：${data.area}㎡
築年数：${data.age}年
${data.floor ? `階数：${data.floor}階\n` : ''}${data.rooms ? `部屋数：${data.rooms}部屋\n` : ''}物件の状態：${conditionLabel}
特徴：${featureLabels || 'なし'}

■ ご要望・ご質問
${data.notes || 'なし'}
`;

    window.location.href = `mailto:nag3321@sage.ocn.ne.jp?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    scrollToTop();
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    const current = watchedValues.features || [];
    setValue('features', checked ? [...current, feature] : current.filter(f => f !== feature));
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-700" />
          </div>
          <h2 className="text-2xl font-bold text-green-800">査定依頼を送信しました</h2>
          <Alert className="text-left border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              メールアプリが開きます。送信後、担当者より2営業日以内にご連絡いたします。
            </AlertDescription>
          </Alert>
          <div className="space-y-2 text-sm text-left pt-4">
            <p className="font-semibold text-gray-700">今後の流れ</p>
            {['担当者よりお電話にて詳細確認', '現地調査の日程調整', '現地調査実施', '査定結果のご報告'].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 bg-green-700 hover:bg-green-800" onClick={() => { setSubmitted(false); setCurrentStep(1); }}>
            もう一度依頼する
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* ── ヒーローセクション ── */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: '480px' }}>
        <img
          src="/valuation-hero.png"
          alt="売却査定・物件紹介の流れ"
          className="w-full object-cover object-center"
          style={{ maxHeight: '480px' }}
        />
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        {/* テキスト */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
          <p className="text-green-300 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-2 drop-shadow">Valuation & Consultation</p>
          <h1 className="text-white text-2xl md:text-4xl font-bold leading-snug drop-shadow-lg mb-3">
            売却査定・<br className="md:hidden" />お気軽にご相談を
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-md drop-shadow leading-relaxed">
            長門不動産では物件の無料査定を承っております。<br />
            まずはお気軽にお問い合わせください。
          </p>
          <div className="flex items-center gap-3 mt-5">
            <span className="bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">無料査定</span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">オンライン対応</span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">秘密厳守</span>
          </div>
        </div>
      </div>

      {/* ── フォーム ── */}
      <div className="py-12 px-4">
        <Card className="max-w-2xl mx-auto" ref={formTopRef as any}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-green-700" />
          オンライン売却査定（無料）
        </CardTitle>
        <p className="text-gray-600 text-sm">必要事項をご入力のうえ、査定依頼をお送りください。</p>
      </CardHeader>
      <CardContent>
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2 mb-8" ref={formTopRef}>
          {STEP_LABELS.map((label, i) => {
            const step = i + 1;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step < currentStep ? 'bg-green-700 text-white' :
                    step === currentStep ? 'bg-green-700 text-white ring-4 ring-green-200' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step < currentStep ? '✓' : step}
                  </div>
                  <span className={`text-xs font-medium ${step === currentStep ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
                </div>
                {step < 3 && (
                  <div className={`w-10 h-1 rounded mb-4 transition-colors ${step < currentStep ? 'bg-green-700' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="space-y-4">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-l-4 border-green-700 pl-3">基本情報</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>お名前 <span className="text-red-500">*</span></Label>
                  <Input {...register('name')} placeholder="山田太郎" />
                  {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>メールアドレス <span className="text-red-500">*</span></Label>
                  <Input type="email" {...register('email')} placeholder="example@email.com" />
                  {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>電話番号 <span className="text-red-500">*</span></Label>
                  <Input {...register('phone')} placeholder="090-1234-5678" />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>物件種別 <span className="text-red-500">*</span></Label>
                  <Select value={watchedValues.propertyType || ''} onValueChange={(v) => setValue('propertyType', v as any)}>
                    <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.propertyType && <p className="text-xs text-red-600">{errors.propertyType.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label>住所 <span className="text-red-500">*</span></Label>
                <Input {...register('address')} placeholder="山口県長門市..." />
                {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-l-4 border-green-700 pl-3">物件詳細</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>面積（㎡） <span className="text-red-500">*</span></Label>
                  <Input type="number" {...register('area', { valueAsNumber: true })} placeholder="50" />
                  {errors.area && <p className="text-xs text-red-600">{errors.area.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>築年数 <span className="text-red-500">*</span></Label>
                  <Input type="number" {...register('age', { valueAsNumber: true })} placeholder="10" />
                  {errors.age && <p className="text-xs text-red-600">{errors.age.message}</p>}
                </div>
                {watchedValues.propertyType !== 'land' && (
                  <>
                    <div className="space-y-1">
                      <Label>階数</Label>
                      <Input type="number" {...register('floor', { valueAsNumber: true })} placeholder="3" />
                    </div>
                    <div className="space-y-1">
                      <Label>部屋数</Label>
                      <Input type="number" {...register('rooms', { valueAsNumber: true })} placeholder="3" />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>物件の状態 <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONDITIONS.map((c) => (
                    <label key={c.value} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      watchedValues.condition === c.value ? 'border-green-700 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}>
                      <input type="radio" value={c.value} {...register('condition')} className="mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{c.label}</p>
                        <p className="text-xs text-gray-500">{c.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.condition && <p className="text-xs text-red-600">{errors.condition.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-l-4 border-green-700 pl-3">特徴・その他</h3>

              <div className="space-y-2">
                <Label>該当する特徴を選択（任意）</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURES.map((f) => (
                    <label key={f.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={watchedValues.features?.includes(f.value) || false}
                        onCheckedChange={(checked) => handleFeatureChange(f.value, !!checked)}
                      />
                      <span className="text-sm">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>ご要望・ご質問（任意）</Label>
                <Textarea {...register('notes')} placeholder="査定に関するご要望やご質問をご記入ください" rows={4} />
              </div>

              {/* 確認サマリー */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1 border">
                <p className="font-semibold text-gray-700 mb-2">入力内容の確認</p>
                <p><span className="text-gray-500">お名前：</span>{watchedValues.name}</p>
                <p><span className="text-gray-500">電話：</span>{watchedValues.phone}</p>
                <p><span className="text-gray-500">住所：</span>{watchedValues.address}</p>
                <p><span className="text-gray-500">種別：</span>{PROPERTY_TYPES.find(t => t.value === watchedValues.propertyType)?.label}</p>
                <p><span className="text-gray-500">面積：</span>{watchedValues.area}㎡　<span className="text-gray-500">築年数：</span>{watchedValues.age}年</p>
              </div>
            </div>
          )}

          {/* ナビゲーション */}
          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 1} className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />前へ
            </Button>
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} className="flex items-center gap-1 bg-green-700 hover:bg-green-800">
                次へ<ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} className="flex items-center gap-1 bg-green-700 hover:bg-green-800">
                査定依頼を送信<Calculator className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default ValuationForm;
