import { bem } from '../utils/bem';

interface PressButtonProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  icon: React.ReactNode;
}

const b = bem('press-button');

export function PressButton({
  label,
  icon,
  className = '',
  ...props
}: PressButtonProps) {
  return (
    <span
      className={`${b()} ${className}`}
      role="button"
      tabIndex={0}
      {...props}
    >
      {icon}
      <i className="absolute right-[1px] bottom-[1px] text-[8px]">{label}</i>
    </span>
  );
}
