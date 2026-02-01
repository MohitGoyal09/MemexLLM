'use client';
import { useState, MouseEvent, ComponentProps } from 'react';
import { Button } from './ui/button';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

type ButtonProps = ComponentProps<typeof Button>;

export function RippleButton({ children, onClick, ...props }: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  return (
    <Button {...props} onClick={handleClick} className={`relative overflow-hidden ${props.className}`}>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-[ripple_0.6s_ease-out]"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      {children}
    </Button>
  );
}
