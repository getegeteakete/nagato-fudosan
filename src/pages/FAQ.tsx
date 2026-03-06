import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqCategories = [
    {
      id: 'rental',
      title: '賃貸について',
      icon: '🏠',
      questions: [
        {
          id: 'rental-1',
          question: '賃貸物件の初期費用はどのくらいかかりますか？',
          answer: '賃貸物件の初期費用は一般的に、敷金（家賃の1-2ヶ月分）、礼金（家賃の0-2ヶ月分）、仲介手数料（家賃の0.5-1ヶ月分）、火災保険料、鍵交換費などが含まれます。物件によって異なりますが、家賃の3-5ヶ月分程度が目安となります。'
        },
        {
          id: 'rental-2',
          question: 'ペット可の物件はありますか？',
          answer: 'はい、ペット可の物件も多数ご用意しております。犬・猫の種類や体重制限、追加費用など物件によって条件が異なりますので、詳細はお問い合わせください。'
        },
        {
          id: 'rental-3',
          question: '入居審査はどのような基準で行われますか？',
          answer: '入居審査では、収入証明書、身分証明書、勤務先の確認などを行います。一般的に年収が家賃の3-4倍以上であることが基準となりますが、保証人の有無や勤務形態によっても異なります。'
        },
        {
          id: 'rental-4',
          question: '内見は可能ですか？',
          answer: 'はい、内見は可能です。事前にご予約いただければ、平日・土日祝日問わず対応いたします。オンライン内見も可能ですので、遠方の方もお気軽にお申し込みください。'
        }
      ]
    },
    {
      id: 'sale',
      title: '売買について',
      icon: '🏢',
      questions: [
        {
          id: 'sale-1',
          question: '住宅ローンはどのように組めばよいですか？',
          answer: '住宅ローンは、金融機関の審査を受けて組むことができます。当社では提携金融機関をご紹介し、最適なローンプランのご提案をいたします。事前審査も無料で承っております。'
        },
        {
          id: 'sale-2',
          question: '中古物件のリフォーム費用はどのくらいですか？',
          answer: 'リフォーム費用は物件の状態や希望する内容によって大きく異なります。キッチン・バス・トイレの水回りリフォームで100-300万円、フルリフォームで500-1000万円程度が目安です。詳細な見積もりは無料で承っております。'
        },
        {
          id: 'sale-3',
          question: '売却査定は無料ですか？',
          answer: 'はい、売却査定は完全無料です。オンライン査定と訪問査定の両方に対応しており、査定結果に基づく売却のご提案も無料で行っております。'
        },
        {
          id: 'sale-4',
          question: '売買契約の流れを教えてください。',
          answer: '売買契約の流れは、①物件選び・内見、②売買契約、③ローン申請・審査、④決済・引渡しとなります。通常2-3ヶ月程度の期間が必要です。各段階で必要な書類や手続きについて詳しくご説明いたします。'
        }
      ]
    },
    {
      id: 'tenant',
      title: '入居者向けサービス',
      icon: '🔧',
      questions: [
        {
          id: 'tenant-1',
          question: '退去申請はいつまでに行えばよいですか？',
          answer: '退去申請は退去希望日の1ヶ月前までにお申し込みください。契約書に記載された期間より早い退去の場合は、違約金が発生する場合があります。'
        },
        {
          id: 'tenant-2',
          question: '設備の不具合があった場合はどうすればよいですか？',
          answer: '設備の不具合が発生した場合は、24時間対応の緊急連絡先またはオンラインでお申し込みください。緊急時は24時間以内、通常時は3営業日以内に対応いたします。'
        },
        {
          id: 'tenant-3',
          question: '駐車場の利用は可能ですか？',
          answer: '駐車場完備の物件では、月額5,000円〜15,000円程度でご利用いただけます。空き状況や料金については、物件詳細ページまたはお問い合わせください。'
        },
        {
          id: 'tenant-4',
          question: '宅配ボックスは利用できますか？',
          answer: '宅配ボックス完備の物件では、24時間いつでも荷物の受け取りが可能です。不在時でも安心して宅配便をご利用いただけます。'
        }
      ]
    },
    {
      id: 'general',
      title: 'その他',
      icon: '❓',
      questions: [
        {
          id: 'general-1',
          question: '営業時間を教えてください。',
          answer: '営業時間は平日9:00-19:00、土日祝日10:00-18:00となっております。オンラインでのお問い合わせは24時間受け付けております。'
        },
        {
          id: 'general-2',
          question: '仲介手数料はいくらですか？',
          answer: '仲介手数料は、賃貸物件の場合家賃の0.5ヶ月分、売買物件の場合物件価格の3%+6万円（消費税別）となっております。詳細はお問い合わせください。'
        },
        {
          id: 'general-3',
          question: 'オンラインで契約手続きは可能ですか？',
          answer: 'はい、オンラインでの契約手続きも可能です。電子契約システムを使用し、書類のやり取りから契約まで全てオンラインで完結できます。'
        },
        {
          id: 'general-4',
          question: '不動産投資について相談できますか？',
          answer: 'はい、不動産投資についても専門スタッフがご相談をお受けしております。投資物件の選び方から収益計算、税務面でのアドバイスまで幅広くサポートいたします。'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            よくある質問
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            お客様からよくいただくご質問をまとめました。<br />
            お探しの情報が見つからない場合は、お気軽にお問い合わせください。
          </p>
        </div>

        {/* 検索バー */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="質問を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* FAQ カテゴリー */}
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">{category.icon}</span>
                  {category.title}
                  <Badge variant="secondary" className="ml-auto">
                    {category.questions.length}件
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {category.questions.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-b">
                      <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="pl-8 text-gray-700 leading-relaxed">
                          {item.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 検索結果が0件の場合 */}
        {searchQuery && filteredCategories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                該当する質問が見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-6">
                「{searchQuery}」に関する質問が見つかりませんでした。<br />
                別のキーワードで検索するか、お問い合わせください。
              </p>
              <Button onClick={() => setSearchQuery('')}>
                すべての質問を表示
              </Button>
            </CardContent>
          </Card>
        )}

        {/* お問い合わせセクション */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              お探しの情報が見つかりませんでしたか？
            </h2>
            <p className="text-blue-100 mb-6">
              専門スタッフがお客様のご質問にお答えします。<br />
              お気軽にお問い合わせください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                03-1234-5678
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-50">
                <Mail className="h-5 w-5" />
                メールで問い合わせ
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-50">
                <MessageCircle className="h-5 w-5" />
                オンラインチャット
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
