
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded-md ${className}`} 
      style={{
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear'
      }}
    />
  );
}

// Add shimmer animation to global CSS if needed, 
// but for now, we'll use a simple pulse which is standard in Tailwind.
