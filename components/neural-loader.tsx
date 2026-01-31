'use client';

interface NeuralLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NeuralLoader({ message = 'Loading...', size = 'md' }: NeuralLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const nodeSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Center pulsing core */}
        <div className="absolute inset-1/3 rounded-full bg-primary animate-pulse" />

        {/* Rotating nodes */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 animate-spin"
            style={{
              animationDuration: `${2 + i * 0.2}s`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
            }}
          >
            <div
              className={`absolute ${nodeSize[size]} rounded-full bg-primary/80`}
              style={{
                top: '0%',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </div>
        ))}
      </div>

      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}
