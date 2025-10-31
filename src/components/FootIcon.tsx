interface FootIconProps {
  isLeft?: boolean;
  className?: string;
  fill?: string;
}

export const FootIcon = ({ isLeft = false, className = "", fill = "currentColor" }: FootIconProps) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      style={{ transform: isLeft ? 'scaleX(-1)' : 'none' }}
    >
      <path
        d="M8.5 3C7.5 3 6.5 4 6.5 5.5C6.5 7 7.5 8 8.5 8C9.5 8 10.5 7 10.5 5.5C10.5 4 9.5 3 8.5 3Z M6 9C5 9 4 10 4 11.5C4 13 5 14 6 14C7 14 8 13 8 11.5C8 10 7 9 6 9Z M11 9C10 9 9 10 9 11.5C9 13 10 14 11 14C12 14 13 13 13 11.5C13 10 12 9 11 9Z M8.5 15C7 15 5.5 16.5 5.5 18.5C5.5 20.5 6.5 22 8.5 22C10.5 22 12.5 20.5 12.5 18.5C12.5 16.5 11 15 8.5 15Z"
        fill={fill}
      />
    </svg>
  );
};
