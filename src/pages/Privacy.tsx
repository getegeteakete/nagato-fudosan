import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-gray-500 mb-8">最終更新日：2024年1月1日</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. 個人情報の取り扱いについて</h2>
          <p className="text-gray-600 leading-relaxed">
            有限会社長門不動産（以下「当社」）は、お客様の個人情報の保護を重要な責務と考え、
            個人情報保護法その他関連法令を遵守し、適切な取り扱いに努めます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. 収集する個人情報</h2>
          <p className="text-gray-600 leading-relaxed">当社は、以下の情報を収集することがあります。</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
            <li>氏名、住所、電話番号、メールアドレス</li>
            <li>お問い合わせ内容・相談内容</li>
            <li>物件の閲覧履歴・検索条件</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. 個人情報の利用目的</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>不動産物件に関するご案内・ご提案</li>
            <li>お問い合わせへの対応</li>
            <li>各種サービスの提供・改善</li>
            <li>法令に基づく対応</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. 個人情報の第三者提供</h2>
          <p className="text-gray-600 leading-relaxed">
            当社は、法令に定める場合を除き、お客様の同意なく個人情報を第三者に提供しません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. 個人情報の管理</h2>
          <p className="text-gray-600 leading-relaxed">
            当社は、個人情報の漏洩、滅失、毀損の防止のため、適切な安全管理措置を講じます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. お問い合わせ</h2>
          <p className="text-gray-600 leading-relaxed">
            個人情報に関するお問い合わせは、下記までご連絡ください。
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm space-y-1">
            <p className="font-semibold">有限会社 長門不動産</p>
            <p>〒759-4101 山口県長門市東深川2684番地5</p>
            <p>TEL: 0837-22-3321</p>
            <p>E-mail: nag3321@sage.ocn.ne.jp</p>
          </div>
        </section>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm">← トップページへ戻る</Link>
      </div>
    </div>
  );
};

export default Privacy;
