'use client';

import { useEffect, useState } from 'react';
import { EarningsDisplay } from '../components/EarningsDisplay';
import { SalarySetup } from '../components/SalarySetup';
import { useEarningsCalculator } from '../hooks/useEarningsCalculator';

// Claves para localStorage
const STORAGE_KEY = 'paystream-salary-setup';

type SalaryData = {
  salary: number;
  currency: 'ARS' | 'USD';
  rate: number;
};

function getStoredSalary(): SalaryData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredSalary(data: SalaryData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function Home() {
  const DEFAULT_SALARY = 1200;
  const DEFAULT_CURRENCY = 'USD';
  const DEFAULT_RATE = 1000;
  const [salaryData, setSalaryData] = useState<SalaryData | null>({
    salary: DEFAULT_SALARY,
    currency: DEFAULT_CURRENCY,
    rate: DEFAULT_RATE,
  });
  const [showSetup, setShowSetup] = useState(false);

  // Cargar datos al montar solo si hay en localStorage
  useEffect(() => {
    const stored = getStoredSalary();
    if (stored) {
      setSalaryData(stored);
    }
  }, []);

  // Handler para confirmar setup
  const handleConfirm = (
    salary: number,
    currency: 'ARS' | 'USD',
    rate: number
  ) => {
    const data = { salary, currency, rate };
    setStoredSalary(data);
    setSalaryData(data);
    setShowSetup(false);
  };

  // Handler para volver al setup
  const handleSettings = () => {
    setShowSetup(true);
  };

  // Calcular ganancias en tiempo real SIEMPRE para mantener el orden de hooks
  const { earnings, otherCurrencyEarnings, monthProgress } =
    useEarningsCalculator({
      salary: salaryData?.salary ?? DEFAULT_SALARY,
      currency: salaryData?.currency ?? DEFAULT_CURRENCY,
      rate: salaryData?.rate ?? DEFAULT_RATE,
    });

  // Mostrar siempre primero EarningsDisplay
  if (!showSetup) {
    return (
      <main
        style={{
          paddingTop: 'clamp(1rem, 4vw, 3rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <EarningsDisplay
          salary={salaryData!.salary}
          currency={salaryData!.currency}
          rate={salaryData!.rate}
          earnings={earnings}
          otherCurrencyEarnings={otherCurrencyEarnings}
          onSettings={handleSettings}
          monthProgress={monthProgress}
        />
      </main>
    );
  }

  // Si showSetup es true, mostrar SalarySetup
  return (
    <main
      style={{
        paddingTop: 'clamp(1rem, 4vw, 3rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SalarySetup
        onConfirm={handleConfirm}
        defaultSalary={salaryData?.salary}
        defaultCurrency={salaryData?.currency}
        defaultRate={salaryData?.rate}
      />
    </main>
  );
}
