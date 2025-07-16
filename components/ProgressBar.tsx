'use client';

export type ProgressBarProps = {
  progress: number; // 0-1
};

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <progress
      value={progress}
      max={1}
      style={{ width: '100%' }}
    />
  );
}
