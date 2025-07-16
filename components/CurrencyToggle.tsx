'use client';

import { Coins, DollarSign } from 'lucide-react';

export type CurrencyToggleProps = {
  value: number;
  currency: 'ARS' | 'USD';
  onClick?: () => void;
};

export function CurrencyToggle({
  value,
  currency,
  onClick,
}: CurrencyToggleProps) {
  return (
    <span
      style={{
        fontSize: 16,
        opacity: 0.7,
        cursor: onClick ? 'pointer' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
      onClick={onClick}
    >
      {currency === 'USD' ? (
        <DollarSign
          size={28}
          style={{ marginRight: 4 }}
        />
      ) : (
        <Coins
          size={28}
          style={{ marginRight: 4 }}
        />
      )}
      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  );
}
