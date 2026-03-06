import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const params = new URLSearchParams(window.location.search);
  const propertyParam = params.get("property") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: propertyParam ? `【物件問い合わせ】${propertyParam}` : "",
    message: propertyParam ? `物件名：${propertyParam}\n\nお問い合わせ内容：\n` : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:nag3321@sage.ocn.ne.jp?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`お名前：${formData.name}\nメール：${formData.email}\n電話：${formData.phone}\n\n${formData.message}`)}`;
    window.location.href = mailtoLink;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-green-700 font-semibold text-sm tracking-widest uppercase mb-2">CONTACT</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">お問い合わせ</h1>
          <div className="w-16 h-1 bg-green-700 mx-auto mb-4 rounded-full"></div>
          <p className="text-lg text-gray-600">
            ご質問やご相談がございましたら、お気軽にお問い合わせください。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* お問い合わせフォーム */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせフォーム</CardTitle>
                <CardDescription>
                  以下のフォームにご記入の上、送信してください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        お名前 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="山田太郎"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        電話番号
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0837-22-3321"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        件名 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="物件についてのご相談"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      お問い合わせ内容 <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="お問い合わせ内容をご記入ください..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    送信する
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 連絡先情報 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>連絡先情報</CardTitle>
                <CardDescription>
                  お電話でのお問い合わせも承っております。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">電話番号</p>
                    <p className="text-gray-600">0837-22-3321</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">メールアドレス</p>
                    <p className="text-gray-600">nag3321@sage.ocn.ne.jp</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mt-0.5">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">所在地</p>
                    <p className="text-gray-600">
                      〒759-4101<br />
                      山口県長門市東深川2684番地5
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">営業時間</p>
                    <p className="text-gray-600">
                      平日 9:00-18:00<br />
                      土日祝 10:00-17:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>よくある質問</CardTitle>
                <CardDescription>
                  お問い合わせ前にご確認ください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    • 物件の詳細について
                  </p>
                  <p className="text-sm text-gray-600">
                    • 査定の流れについて
                  </p>
                  <p className="text-sm text-gray-600">
                    • 契約手続きについて
                  </p>
                  <p className="text-sm text-gray-600">
                    • その他のご質問
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <a href="/faq">よくある質問を見る</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
