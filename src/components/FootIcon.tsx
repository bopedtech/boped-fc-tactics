interface FootIconProps {
  isLeft?: boolean;
  className?: string;
  fill?: string;
  rating?: number;
}

export const FootIcon = ({ isLeft = false, className = "", fill = "currentColor", rating }: FootIconProps) => {
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        viewBox="0 0 40 60" 
        className={className}
        style={{ transform: isLeft ? 'scaleX(-1)' : 'none' }}
      >
        <path
          d="M20 5 Q 30 8, 32 20 Q 33 35, 30 45 Q 25 58, 20 58 Q 15 58, 10 45 Q 7 35, 8 20 Q 10 8, 20 5 Z"
          fill={fill}
        />
      </svg>
      {rating && (
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
          {rating}
        </span>
      )}
    </div>
  );
};
