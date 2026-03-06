import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">利用規約</h1>
      <p className="text-sm text-gray-500 mb-8">最終更新日：2024年1月1日</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">第1条（適用）</h2>
          <p className="text-gray-600 leading-relaxed">
            本規約は、有限会社長門不動産（以下「当社」）が提供するウェブサービス（以下「本サービス」）の
            利用に関する条件を定めるものです。ユーザーの皆様は本規約に同意の上、本サービスをご利用ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">第2条（禁止事項）</h2>
          <p className="text-gray-600 leading-relaxed mb-2">利用者は以下の行為を行ってはなりません。</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>虚偽の情報を入力・送信する行為</li>
            <li>当社または第三者の権利・利益を侵害する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>不正アクセスまたはその試み</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">第3条（免責事項）</h2>
          <p className="text-gray-600 leading-relaxed">
            当社は、本サービスに掲載する情報の正確性・完全性を保証しません。
            掲載情報の利用により生じた損害について、当社は責任を負いません。
            物件情報は変更・削除される場合がありますので、最新情報はお問い合わせください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">第4条（知的財産権）</h2>
          <p className="text-gray-600 leading-relaxed">
            本サービスに掲載されているすべてのコンテンツ（文章、画像、デザイン等）は
            当社または正当な権利者に帰属します。無断転用・複製を禁じます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">第5条（規約の変更）</h2>
          <p className="text-gray-600 leading-relaxed">
            当社は、必要に応じて本規約を変更することがあります。
            変更後の規約は、本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">第6条（準拠法・管轄）</h2>
          <p className="text-gray-600 leading-relaxed">
            本規約は日本法に準拠し、山口地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">お問い合わせ</h2>
          <div className="p-4 bg-gray-50 rounded-lg text-gray-700 text-sm space-y-1">
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

export default Terms;
