'use client';

import { Settings } from 'lucide-react';

export type SettingsButtonProps = {
  onClick: () => void;
};

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label='Settings'
      style={{
        fontSize: 32,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Settings size={36} />
    </button>
  );
}
