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
        viewBox="0 0 40 50" 
        className={className}
        style={{ transform: isLeft ? 'scaleX(-1)' : 'none' }}
      >
        <ellipse
          cx="20"
          cy="25"
          rx="18"
          ry="24"
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
