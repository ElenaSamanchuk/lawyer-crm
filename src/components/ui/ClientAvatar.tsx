import { clientInitials } from '../../lib/initials';

type ClientAvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_CLASS = {
  sm: 'h-9 w-9 min-h-9 min-w-9 max-h-9 max-w-9 text-[0.625rem]',
  md: 'h-10 w-10 min-h-10 min-w-10 max-h-10 max-w-10 text-xs',
  lg: 'h-12 w-12 min-h-12 min-w-12 max-h-12 max-w-12 text-sm',
} as const;

export function ClientAvatar({ name, size = 'md' }: ClientAvatarProps) {
  return (
    <span
      className={`client-avatar aspect-square shrink-0 overflow-hidden rounded-full ${SIZE_CLASS[size]}`}
      aria-hidden="true"
    >
      {clientInitials(name)}
    </span>
  );
}
