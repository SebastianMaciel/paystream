'use client';

import { useEffect, useRef, useState } from 'react';

export function useEarningsCalculator({
  salary,
  currency,
  rate,
}: {
  salary: number;
  currency: 'ARS' | 'USD';
  rate: number;
}) {
  // Calcular el valor real actual
  function getCurrentEarnings() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    const totalMs = end.getTime() - start.getTime();
    const elapsedMs = now.getTime() - start.getTime();
    const progress = Math.min(1, Math.max(0, elapsedMs / totalMs));
    const earned = salary * progress;
    const other = currency === 'ARS' ? earned / rate : earned * rate;
    return { earned, other, progress };
  }

  const initial = getCurrentEarnings();
  const [displayEarnings, setDisplayEarnings] = useState(initial.earned);
  const [displayOtherCurrencyEarnings, setDisplayOtherCurrencyEarnings] =
    useState(initial.other);
  const [monthProgress, setMonthProgress] = useState(initial.progress);
  const targetEarningsRef = useRef(initial.earned);
  const targetOtherRef = useRef(initial.other);

  useEffect(() => {
    // Al cambiar parámetros, inicializar al valor real actual
    const { earned, other, progress } = getCurrentEarnings();
    setDisplayEarnings(earned);
    setDisplayOtherCurrencyEarnings(other);
    setMonthProgress(progress);
    targetEarningsRef.current = earned;
    targetOtherRef.current = other;
    function update() {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
        0,
        0,
        0,
        0
      );
      const totalMs = end.getTime() - start.getTime();
      const elapsedMs = now.getTime() - start.getTime();
      const progress = Math.min(1, Math.max(0, elapsedMs / totalMs));
      setMonthProgress(progress);
      const earned = salary * progress;
      targetEarningsRef.current = earned;
      if (currency === 'ARS') {
        targetOtherRef.current = earned / rate;
      } else {
        targetOtherRef.current = earned * rate;
      }
    }
    update();
    const interval = setInterval(() => {
      update();
      // Animar earnings centavo a centavo
      setDisplayEarnings((prev) => {
        const target = targetEarningsRef.current;
        if (Math.abs(prev - target) < 0.01) return target;
        return prev + Math.sign(target - prev) * 0.01;
      });
      setDisplayOtherCurrencyEarnings((prev) => {
        const target = targetOtherRef.current;
        if (Math.abs(prev - target) < 0.01) return target;
        return prev + Math.sign(target - prev) * 0.01;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [salary, currency, rate]);

  return {
    earnings: displayEarnings,
    otherCurrencyEarnings: displayOtherCurrencyEarnings,
    monthProgress,
  };
}
