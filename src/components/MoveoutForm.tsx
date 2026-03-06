import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoveoutRequest } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Calendar as CalendarIcon, Home, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { apiClient } from '@/lib/api';

const moveoutSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  propertyId: z.string().min(1, '物件IDを入力してください'),
  roomNumber: z.string().min(1, '部屋番号を入力してください'),
  moveoutDate: z.date({
    required_error: '退去希望日を選択してください',
  }),
  reason: z.string().min(1, '退去理由を入力してください'),
  preferredInspectionDate: z.date().optional(),
});

type MoveoutFormData = z.infer<typeof moveoutSchema>;

interface MoveoutFormProps {
  onSuccess?: (request: MoveoutRequest) => void;
}

const MOVE_OUT_REASONS = [
  { value: 'job_transfer', label: '転勤・転職' },
  { value: 'marriage', label: '結婚' },
  { value: 'family', label: '家族の事情' },
  { value: 'purchase', label: '住宅購入' },
  { value: 'rent_increase', label: '家賃上昇' },
  { value: 'noise', label: '騒音・近隣トラブル' },
  { value: 'maintenance', label: '設備・管理の問題' },
  { value: 'size', label: '間取り・広さが合わない' },
  { value: 'location', label: '立地・交通の便' },
  { value: 'other', label: 'その他' },
];

const MoveoutForm: React.FC<MoveoutFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<MoveoutRequest | null>(null);
  const [moveoutDateOpen, setMoveoutDateOpen] = useState(false);
  const [inspectionDateOpen, setInspectionDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MoveoutFormData>({
    resolver: zodResolver(moveoutSchema),
  });

  const watchedValues = watch();

  const onSubmit = async (data: MoveoutFormData) => {
    setIsSubmitting(true);
    try {
      const subject = `【退去申請】${data.tenantName} 様`;
      const body = `■ 入居者情報
お名前：${data.tenantName}
メール：${data.email}
電話：${data.phone}

■ 物件情報
物件ID：${data.propertyId}
部屋番号：${data.roomNumber}
退去予定日：${data.moveoutDate ? new Date(data.moveoutDate).toLocaleDateString('ja-JP') : ''}

■ 退去理由
${data.reason || 'なし'}

■ その他ご要望
${data.notes || 'なし'}
`;
      window.location.href = `mailto:nag3321@sage.ocn.ne.jp?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setSubmittedRequest({ id: 'submitted', ...data } as any);
      onSuccess?.({ id: 'submitted', ...data } as any);
    } catch (error) {
      console.error('Error submitting moveout request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">退去申請を受け付けました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              退去申請を受け付けました。担当者より2営業日以内にご連絡いたします。
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="font-semibold">今後の流れ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                <span>担当者よりお電話にて詳細確認</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                <span>立会い日程の調整</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                <span>立会い実施・原状回復確認</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                <span>敷金精算・鍵返却</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              申請番号: <span className="font-mono">{submittedRequest.id}</span>
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
          <Home className="h-6 w-6" />
          退去申請フォーム
        </CardTitle>
        <p className="text-gray-600">
          退去をご希望の方は、こちらのフォームからお申し込みください。
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                <Label htmlFor="roomNumber">部屋番号 *</Label>
                <Input
                  id="roomNumber"
                  {...register('roomNumber')}
                  placeholder="101"
                />
                {errors.roomNumber && (
                  <p className="text-sm text-red-600">{errors.roomNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyId">物件ID *</Label>
              <Input
                id="propertyId"
                {...register('propertyId')}
                placeholder="物件IDを入力してください"
              />
              {errors.propertyId && (
                <p className="text-sm text-red-600">{errors.propertyId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">退去情報</h3>
            
            <div className="space-y-2">
              <Label>退去希望日 *</Label>
              <Popover open={moveoutDateOpen} onOpenChange={setMoveoutDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValues.moveoutDate ? (
                      format(watchedValues.moveoutDate, 'yyyy年MM月dd日', { locale: ja })
                    ) : (
                      <span>日付を選択してください</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedValues.moveoutDate}
                    onSelect={(date) => {
                      setValue('moveoutDate', date!);
                      setMoveoutDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.moveoutDate && (
                <p className="text-sm text-red-600">{errors.moveoutDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>退去理由 *</Label>
              <Select
                value={watchedValues.reason || ''}
                onValueChange={(value) => setValue('reason', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="退去理由を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {MOVE_OUT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>希望立会い日時（任意）</Label>
              <Popover open={inspectionDateOpen} onOpenChange={setInspectionDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValues.preferredInspectionDate ? (
                      format(watchedValues.preferredInspectionDate, 'yyyy年MM月dd日', { locale: ja })
                    ) : (
                      <span>日付を選択してください（任意）</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedValues.preferredInspectionDate}
                    onSelect={(date) => {
                      setValue('preferredInspectionDate', date!);
                      setInspectionDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">その他ご要望・ご質問</Label>
              <Textarea
                id="notes"
                placeholder="退去に関するご要望やご質問がございましたら、こちらにご記入ください。"
                rows={4}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>ご注意事項：</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 退去の1ヶ月前までにご申請ください</li>
                  <li>• 原状回復が必要な場合は、事前にご相談ください</li>
                  <li>• 立会い日時は後日調整させていただきます</li>
                  <li>• 敷金の精算は立会い完了後に行います</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? '送信中...' : '退去申請を送信'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MoveoutForm;
