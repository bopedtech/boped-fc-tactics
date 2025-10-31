interface FootIconProps {
  isLeft?: boolean;
  className?: string;
  fill?: string;
  rating?: number;
}

export const FootIcon = ({ isLeft = false, className = "", fill = "currentColor", rating }: FootIconProps) => {
  const rotation = isLeft ? -10 : 10;
  const translateX = isLeft ? 10 : 0;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        viewBox="0 0 150 220" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path 
            id="foot-shape" 
            d="M 50, 200 C -20, 150, 0, 40, 60, 20 C 100, 0, 140, 50, 120, 100 C 90, 150, 110, 180, 90, 210 Q 70, 220, 50, 200 Z" 
          />
        </defs>
        
        <g transform={`rotate(${rotation} 70 190) translate(${translateX} 0) ${isLeft ? '' : 'scale(-1 1) translate(-140 0)'}`}>
          <use href="#foot-shape" fill={fill}/>
          <text 
            x="70" 
            y="120" 
            fill="white" 
            fontSize="7rem" 
            fontWeight="900" 
            fontFamily="Inter, sans-serif"
            textAnchor="middle"
            transform={isLeft ? '' : 'scale(-1 1) translate(-140 0)'}
          >
            {rating}
          </text>
        </g>
      </svg>
    </div>
  );
};
