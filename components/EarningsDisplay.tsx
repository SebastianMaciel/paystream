'use client';

import { Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export type EarningsDisplayProps = {
  salary: number;
  currency: 'ARS' | 'USD';
  rate: number;
  earnings: number;
  otherCurrencyEarnings: number;
  onSettings: () => void;
  monthProgress: number; // 0-1
};

// Componente para animar el flip de cada dígito (salida y entrada)
function DigitFlip({
  value,
  style,
  isDecimal,
}: {
  value: string;
  style?: React.CSSProperties;
  isDecimal?: boolean;
}) {
  const prev = useRef(value);
  const [flipping, setFlipping] = React.useState(false);
  const [oldValue, setOldValue] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (prev.current !== value) {
      setOldValue(prev.current);
      setFlipping(true);
      const timeout = setTimeout(() => {
        setFlipping(false);
        setOldValue(null);
        prev.current = value;
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [value]);
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 'auto',
        minWidth: '1ch',
        ...style,
      }}
    >
      {/* Dígito viejo, sin animación de salida */}
      {flipping && oldValue !== null && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0,
          }}
        >
          {oldValue}
        </span>
      )}
      {/* Dígito nuevo, animación de entrada solo si no es decimal */}
      <span
        className={flipping && !isDecimal ? 'digit-flip-in' : ''}
        style={{ zIndex: 2, position: 'relative' }}
      >
        {value}
      </span>
    </span>
  );
}

// Animación CSS
const style = `<style>
@keyframes flip-in {
  0% { transform: translateY(-100%); opacity: 0; color: #7CFC9A; }
  80% { color: #7CFC9A; }
  100% { transform: translateY(0); opacity: 1; color: #fff; }
}
.digit-flip-in {
  animation: flip-in 0.35s cubic-bezier(.4,0,.2,1);
  display: inline-block;
  color: #fff;
  transition: color 1s;
}
</style>`;

export function EarningsDisplay({
  salary,
  currency,
  rate,
  earnings,
  otherCurrencyEarnings,
  onSettings,
}: // monthProgress,
EarningsDisplayProps) {
  // DEBUG: Forzar día para debug visual
  const DEBUG_DAY: number | null = null; // Cambia a 1, 15, 31, etc. para forzar el día

  // Calcular el valor máximo que se puede mostrar al final del mes
  const maxEarnings = salary;
  const maxOther = currency === 'ARS' ? salary / rate : salary * rate;
  // Formatear ambos con 2 decimales y obtener el string más largo
  const maxEarningsStr = `${currency} ${maxEarnings.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const maxOtherStr = `${
    currency === 'ARS' ? 'USD' : 'ARS'
  } ${maxOther.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  // Medir el string más largo
  const maxLen = Math.max(maxEarningsStr.length, maxOtherStr.length);
  // Usar ch para minWidth (1ch = width de un caracter 0-9), pero nunca más que 100%
  const minWidth = `min(100%, calc(${maxLen}ch + 1.5rem))`;

  // Calcular ganancia por segundo, minuto y hora
  const secondsInMonth = 30 * 24 * 60 * 60; // Aproximado
  const perSecond = salary / secondsInMonth;
  const perMinute = perSecond * 60;
  const perHour = perMinute * 60;
  const perSecondOther =
    (currency === 'ARS' ? salary / rate : salary * rate) / secondsInMonth;
  const perMinuteOther = perSecondOther * 60;
  const perHourOther = perMinuteOther * 60;

  // Función para mostrar al menos un decimal distinto de cero
  function formatPerSecond(value: number, currency: string) {
    let str = value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
    // Buscar la parte decimal
    const match = str.match(/([.,])(\d+)/);
    if (match) {
      const decs = match[2];
      // Si los dos primeros decimales son 0, buscar el primer dígito distinto de cero
      if (decs.length > 2 && decs[0] === '0' && decs[1] === '0') {
        let i = 2;
        while (i < decs.length && decs[i] === '0') i++;
        // Mostrar hasta el primer dígito distinto de cero (mínimo 3, máximo 4 decimales)
        const decCount = Math.max(Math.min(i + 1, 5), 3); // 3 a 5 caracteres después de la coma
        str = str.replace(/([.,]\d{2})\d*/, match[0].slice(0, decCount));
        // Si sigue sin verse, forzar 4 decimales
        if (/([.,]0{3,}$)/.test(str)) {
          str = value.toLocaleString(undefined, {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          });
        }
      } else {
        // Si hay un dígito distinto de cero en los dos primeros, mostrar solo 2 decimales
        str = value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
    }
    return `${currency} ${str} / seg`;
  }

  // Helper para renderizar monto con flip
  function renderFlippingAmount(amount: number) {
    // Formatear con separador de miles y 2 decimales
    const str = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const parts = str.split('');
    const decimalIndex =
      str.indexOf(',') !== -1 ? str.indexOf(',') : str.indexOf('.');
    return (
      <span style={{ letterSpacing: '-0.04em', display: 'inline-block' }}>
        {parts.map((char, i) => (
          <DigitFlip
            key={i}
            value={char}
            isDecimal={decimalIndex !== -1 && i > decimalIndex}
            style={
              /[.,\s]/.test(char)
                ? { letterSpacing: '-0em', width: 'auto', minWidth: 0 }
                : { minWidth: 0, width: 'auto' }
            }
          />
        ))}
      </span>
    );
  }

  // Fade cíclico entre los tres
  const [visibleIndex, setVisibleIndex] = useState(0); // 0: seg, 1: min, 2: hora
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((i) => (i + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper para mostrar el texto correcto
  function getPerText(
    value: number,
    currency: string,
    type: 'seg' | 'min' | 'hora'
  ) {
    const label =
      type === 'seg' ? '/ seg' : type === 'min' ? '/ min' : '/ hora';
    // Usar el mismo formateo de miles y decimales que en los montos grandes
    const formatted = formatPerSecond(value, currency).replace(
      /([\d]+([.,][\d]+)?)/,
      (num) => {
        // Extraer parte numérica y formatear con separador de miles
        const n = Number(num.replace(/[^\d.,-]/g, '').replace(',', '.'));
        if (isNaN(n)) return num;
        // Detectar cuántos decimales tiene el string original
        const decs = (num.split(/[.,]/)[1] || '').length;
        return n.toLocaleString(undefined, {
          minimumFractionDigits: decs,
          maximumFractionDigits: decs,
        });
      }
    );
    return formatted.replace(/\/ seg$/, ` ${label}`);
  }

  // Estado para el tooltip interactivo
  const [hovering, setHovering] = useState(false);
  const [hoverX, setHoverX] = useState(0); // posición X relativa al contenedor
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Calcular el porcentaje de hover
  let hoverPercent = 0;
  let hoveredDay = 1;
  // Día actual y último día del mes (usando DEBUG_DAY si está definido)
  const today = DEBUG_DAY
    ? new Date(new Date().getFullYear(), new Date().getMonth(), DEBUG_DAY)
    : new Date();
  const currentDay = DEBUG_DAY ?? today.getDate();
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  // Calcular el progreso del mes basado en el día actual
  const monthProgress = (currentDay - 1) / (lastDayOfMonth - 1);

  if (hovering && progressBarRef.current) {
    const rect = progressBarRef.current.getBoundingClientRect();
    hoverPercent = Math.min(Math.max((hoverX - rect.left) / rect.width, 0), 1);
    hoveredDay = Math.round(hoverPercent * (lastDayOfMonth - 1)) + 1;
  } else {
    hoveredDay = 1;
  }
  // Calcular earnings en ambos hasta el día hovered
  const hoverEarnings = (salary / lastDayOfMonth) * hoveredDay;
  const hoverOther =
    ((currency === 'ARS' ? salary / rate : salary * rate) / lastDayOfMonth) *
    hoveredDay;

  // Helper para formatear
  function formatAmount(value: number, currency: string) {
    return `${currency} ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <>
      {/* Inyectar el CSS de la animación solo una vez */}
      {typeof window !== 'undefined' &&
        document &&
        document.head &&
        !document.head.querySelector('#flipdown-style') && (
          <>
            {document.head.insertAdjacentHTML(
              'beforeend',
              style.replace('<style>', '<style id="flipdown-style">')
            )}
          </>
        )}
      <div
        style={{ padding: 'clamp(1rem, 4vw, 3rem)' }}
        className='flex flex-col gap-12 items-center shadow-lg border bg-card/80 transition-all duration-300 min-h-fit justify-center rounded-xl min-w-[350px]'
      >
        <div className='flex flex-row items-center justify-between w-full px-0 pb-0'>
          <div className='text-2xl font-semibold tracking-tight'>PayStream</div>
          <Button
            onClick={onSettings}
            variant='ghost'
            size='icon'
            aria-label='Settings'
            className='transition-colors cursor-pointer'
          >
            <Settings className='w-6 h-6' />
          </Button>
        </div>
        <div className='flex flex-col items-center gap-10 px-0 w-full'>
          <div className='flex flex-col items-center gap-2 w-full'>
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground'
              style={{
                fontSize: 'clamp(1.25rem, 4vw, 3.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
              }}
            >
              {currency}
            </span>
            <span
              className='font-bold tabular-nums transition-all duration-500'
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 7rem)',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                width: '100%',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                overflowWrap: 'break-word',
                overflow: 'hidden',
              }}
            >
              {renderFlippingAmount(earnings)}
            </span>
            {/* Switch cíclico debajo del monto grande principal, sin stacking */}
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground fade-switch'
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                display: visibleIndex === 0 ? 'block' : 'none',
              }}
            >
              {getPerText(perSecond, currency, 'seg')}
            </span>
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground fade-switch'
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                display: visibleIndex === 1 ? 'block' : 'none',
              }}
            >
              {getPerText(perMinute, currency, 'min')}
            </span>
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground fade-switch'
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                display: visibleIndex === 2 ? 'block' : 'none',
              }}
            >
              {getPerText(perHour, currency, 'hora')}
            </span>
          </div>
          <div className='flex flex-col items-center gap-2 w-full'>
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground'
              style={{
                fontSize: 'clamp(1.25rem, 4vw, 3.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
              }}
            >
              {currency === 'ARS' ? 'USD' : 'ARS'}
            </span>
            <span
              className='font-bold tabular-nums transition-all duration-500'
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 7rem)',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                width: '100%',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                overflowWrap: 'break-word',
                overflow: 'hidden',
              }}
            >
              {renderFlippingAmount(otherCurrencyEarnings)}
            </span>
            {/* Switch cíclico debajo del monto grande secundario, sin stacking */}
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground fade-switch'
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                display: visibleIndex === 0 ? 'block' : 'none',
              }}
            >
              {getPerText(
                perSecondOther,
                currency === 'ARS' ? 'USD' : 'ARS',
                'seg'
              )}
            </span>
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground fade-switch'
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                display: visibleIndex === 1 ? 'block' : 'none',
              }}
            >
              {getPerText(
                perMinuteOther,
                currency === 'ARS' ? 'USD' : 'ARS',
                'min'
              )}
            </span>
            <span
              className='font-bold tabular-nums transition-all duration-500 text-muted-foreground fade-switch'
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
                textAlign: 'center',
                minWidth,
                maxWidth: '100%',
                lineHeight: 1.1,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'hidden',
                display: visibleIndex === 2 ? 'block' : 'none',
              }}
            >
              {getPerText(
                perHourOther,
                currency === 'ARS' ? 'USD' : 'ARS',
                'hora'
              )}
            </span>
          </div>

          <div className='w-full flex flex-col items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  ref={progressBarRef}
                  className='w-full h-3 rounded-full transition-all duration-500 relative cursor-pointer'
                  onMouseMove={(e) => {
                    setHovering(true);
                    setHoverX(e.clientX);
                  }}
                  onMouseLeave={() => setHovering(false)}
                  onMouseEnter={(e) => {
                    setHovering(true);
                    setHoverX(e.clientX);
                  }}
                >
                  <Progress
                    value={monthProgress * 100}
                    className='w-full h-8 rounded-full transition-all duration-500'
                  />
                  {/* Tooltip flotante custom, solo visible en hover */}
                  {hovering && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `calc(${Math.min(
                          Math.max(
                            ((hoverX -
                              (progressBarRef.current?.getBoundingClientRect()
                                .left ?? 0)) /
                              (progressBarRef.current?.offsetWidth ?? 1)) *
                              100,
                            0
                          ),
                          100
                        )}%)`,
                        top: '-2.5rem',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none',
                        zIndex: 50,
                      }}
                    >
                      <TooltipContent
                        side='top'
                        sideOffset={8}
                        className='px-4 py-2 text-base min-w-[10rem] text-center'
                      >
                        <div className='flex flex-col gap-1'>
                          <span className='font-semibold text-xs mb-1'>
                            Día {hoveredDay}
                          </span>
                          <span className='font-bold'>
                            {formatAmount(hoverEarnings, currency)}
                          </span>
                          <span className='text-muted-foreground'>
                            {formatAmount(
                              hoverOther,
                              currency === 'ARS' ? 'USD' : 'ARS'
                            )}
                          </span>
                        </div>
                      </TooltipContent>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
            </Tooltip>

            <div className='w-full flex justify-between text-xs text-muted-foreground mt-6'>
              <>
                <span>Día 1</span>
                <span>Día {lastDayOfMonth}</span>
              </>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
