import React from 'react';

interface SectionHeadingProps {
  en?: string;
  ja: string;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * サイト共通セクション見出し
 * 横幅全体に薄いグリーン帯を敷き、左ボーダーアクセント付き
 */
const SectionHeading: React.FC<SectionHeadingProps> = ({ en, ja, align = 'left', className = '' }) => {
  const isCenter = align === 'center';
  return (
    <div className={`w-full ${className}`}>
      {/* フル幅の帯 */}
      <div className={`w-full bg-green-50 border-y border-green-100 py-4 px-6 flex ${isCenter ? 'justify-center' : 'justify-start'} items-center gap-4`}>
        {/* 左アクセントライン（左揃えのみ） */}
        {!isCenter && <div className="w-1.5 h-8 bg-green-700 rounded-full flex-shrink-0"/>}
        <div className={isCenter ? 'text-center' : ''}>
          {en && (
            <p className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">{en}</p>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a] leading-snug">{ja}</h2>
        </div>
      </div>
    </div>
  );
};

export default SectionHeading;
