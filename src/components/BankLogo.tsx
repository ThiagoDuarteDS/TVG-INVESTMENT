import React from 'react';

export interface BankInfo {
  name: string;
  slug: string;
  code: string;
  color: string;
  logoSrc: string;
}

export const BANK_DIRECTORY: Record<string, BankInfo> = {
  bb: {
    name: 'Banco do Brasil',
    slug: 'bb',
    code: '001',
    color: '#fde100',
    logoSrc: '/banks/bb.svg',
  },
  bradesco: {
    name: 'Bradesco',
    slug: 'bradesco',
    code: '237',
    color: '#cc092f',
    logoSrc: '/banks/bradesco.svg',
  },
  itau: {
    name: 'Itaú Unibanco',
    slug: 'itau',
    code: '341',
    color: '#FF6200',
    logoSrc: '/banks/itau.svg',
  },
  santander: {
    name: 'Santander Brasil',
    slug: 'santander',
    code: '033',
    color: '#EA1D25',
    logoSrc: '/banks/santander.svg',
  },
  nubank: {
    name: 'Nubank',
    slug: 'nubank',
    code: '260',
    color: '#820ad1',
    logoSrc: '/banks/nubank.svg',
  },
  caixa: {
    name: 'Caixa Econômica',
    slug: 'caixa',
    code: '104',
    color: '#f7941d',
    logoSrc: '/banks/caixa.svg',
  },
  inter: {
    name: 'Banco Inter',
    slug: 'inter',
    code: '077',
    color: '#ff7a00',
    logoSrc: '/banks/inter.svg',
  },
  btg: {
    name: 'BTG Pactual',
    slug: 'btg',
    code: '208',
    color: '#001e3d',
    logoSrc: '/banks/btg.svg',
  },
  xp: {
    name: 'XP Investimentos',
    slug: 'xp',
    code: '102',
    color: '#0084d5',
    logoSrc: '/banks/xp.svg',
  },
  c6: {
    name: 'C6 Bank',
    slug: 'c6',
    code: '336',
    color: '#242424',
    logoSrc: '/banks/c6.svg',
  },
  safra: {
    name: 'Banco Safra',
    slug: 'safra',
    code: '422',
    color: '#c9a050',
    logoSrc: '/banks/safra.svg',
  },
  sicredi: {
    name: 'Sicredi',
    slug: 'sicredi',
    code: '748',
    color: '#00853f',
    logoSrc: '/banks/sicredi.svg',
  },
  sicoob: {
    name: 'Sicoob',
    slug: 'sicoob',
    code: '756',
    color: '#00ae9d',
    logoSrc: '/banks/sicoob.svg',
  },
};

export function getBankInfo(bankIdentifier: string): BankInfo {
  const norm = (bankIdentifier || '').toLowerCase().trim();

  if (norm.includes('nu') || norm.includes('260')) return BANK_DIRECTORY.nubank;
  if (norm.includes('ita') || norm.includes('341')) return BANK_DIRECTORY.itau;
  if (norm.includes('brasil') || norm.includes('bb') || norm.includes('001')) return BANK_DIRECTORY.bb;
  if (norm.includes('bradesco') || norm.includes('237')) return BANK_DIRECTORY.bradesco;
  if (norm.includes('santander') || norm.includes('033')) return BANK_DIRECTORY.santander;
  if (norm.includes('caixa') || norm.includes('104')) return BANK_DIRECTORY.caixa;
  if (norm.includes('inter') || norm.includes('077')) return BANK_DIRECTORY.inter;
  if (norm.includes('btg') || norm.includes('208')) return BANK_DIRECTORY.btg;
  if (norm.includes('xp') || norm.includes('102')) return BANK_DIRECTORY.xp;
  if (norm.includes('c6') || norm.includes('336')) return BANK_DIRECTORY.c6;
  if (norm.includes('safra') || norm.includes('422')) return BANK_DIRECTORY.safra;
  if (norm.includes('sicredi') || norm.includes('748')) return BANK_DIRECTORY.sicredi;
  if (norm.includes('sicoob') || norm.includes('756')) return BANK_DIRECTORY.sicoob;

  // Default fallback
  return {
    name: bankIdentifier,
    slug: 'bank',
    code: '000',
    color: '#10b981',
    logoSrc: '/banks/itau.svg',
  };
}

interface BankLogoProps {
  bankName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  transparentBg?: boolean;
}

export const BankLogo: React.FC<BankLogoProps> = ({
  bankName,
  size = 'md',
  className = '',
  transparentBg = false,
}) => {
  const bank = getBankInfo(bankName);

  // Sizing definitions designed for visual balance across horizontal and square logos (Requirement 7 & 8)
  // No random white boxes; integrated directly into the dark interface design.
  const containerSizes = {
    sm: 'w-8 h-8 rounded-lg p-1',
    md: 'w-11 h-11 rounded-xl p-1.5',
    lg: 'w-14 h-14 rounded-2xl p-2',
    xl: 'w-16 h-16 rounded-2xl p-2.5',
  };

  const imgMaxDimensions = {
    sm: 'max-h-6 max-w-[28px]',
    md: 'max-h-7 max-w-[38px]',
    lg: 'max-h-9 max-w-[48px]',
    xl: 'max-h-11 max-w-[56px]',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none transition-all duration-200 ${
        containerSizes[size]
      } ${
        transparentBg
          ? 'bg-transparent'
          : 'bg-slate-900/90 border border-slate-800 shadow-sm'
      } ${className}`}
      title={bank.name}
    >
      <img
        src={bank.logoSrc}
        alt={`Logo oficial do ${bank.name}`}
        className={`object-contain ${imgMaxDimensions[size]} transition-transform duration-200`}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'block';
        }}
      />
    </div>
  );
};
