'use client';

import { useEffect, useState } from 'react';
import { getDolarValue } from './services/dolar.service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export type SalarySetupProps = {
  onConfirm: (salary: number, currency: 'ARS' | 'USD', rate: number) => void;
  defaultSalary?: number;
  defaultCurrency?: 'ARS' | 'USD';
  defaultRate?: number;
};

export function SalarySetup({
  onConfirm,
  defaultSalary = 0,
  defaultCurrency = 'ARS',
  defaultRate = 1000,
}: SalarySetupProps) {
  const [salary, setSalary] = useState(defaultSalary);
  const [currency, setCurrency] = useState<'ARS' | 'USD'>(defaultCurrency);
  const [rate, setRate] = useState(defaultRate);
  const [dolarValue, setDolarValue] = useState<number>(0);

  useEffect(() => {
    const fetchDolarValue = async () => {
      const value = await getDolarValue();
      setDolarValue(Math.ceil(value));
    };

    fetchDolarValue();
  }, []);

  return (
    <div
      style={{ padding: 'clamp(40px, 4vw, 10px)' }}
      className='w-full max-w-[600px] flex flex-col gap-12 items-center shadow-lg border bg-card/80 transition-all duration-300 min-h-[50vh] justify-center rounded-xl'
    >
      <div className='text-2xl font-semibold tracking-tight mb-4 text-center'>
        Configuración de sueldo
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (salary < 1 || rate < 1) return;
          onConfirm(salary, currency, rate);
        }}
        className='flex flex-col gap-6 mx-auto w-full max-w-[300px]'
      >
        <div className='flex gap-4'>
          <div className='flex flex-col gap-2 flex-1'>
            <Label htmlFor='salary'>Sueldo mensual</Label>
            <Input
              id='salary'
              type='tel'
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              min={1}
              required
            />
          </div>
          <div className='flex flex-col gap-2 w-fit'>
            <Label htmlFor='currency'>Moneda</Label>
            <Select
              value={currency}
              onValueChange={(v) => setCurrency(v as 'ARS' | 'USD')}
            >
              <SelectTrigger id='currency'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ARS'>ARS</SelectItem>
                <SelectItem value='USD'>USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='rate'>Cambio USD/ARS</Label>
          <Input
            id='rate'
            type='tel'
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min={1}
            required
          />
          {dolarValue > 0 && (
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                Dólar oficial ${dolarValue.toLocaleString('es-AR')}
              </p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setRate(dolarValue)}
                  className='text-xs text-white hover:text-white/50 underline cursor-pointer'
                >
                  Usar
                </button>
                <button
                  type='button'
                  onClick={async () => {
                    const value = await getDolarValue();
                    setDolarValue(Math.ceil(value));
                  }}
                  className='text-xs ml-2 text-white hover:text-white/50 underline cursor-pointer'
                >
                  Actualizar
                </button>
              </div>
            </div>
          )}
        </div>
        <Button
          type='submit'
          className='mt-2 w-full cursor-pointer'
        >
          Confirmar
        </Button>
      </form>
    </div>
  );
}
