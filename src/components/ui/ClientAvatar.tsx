import { clientInitials } from '../../lib/initials';

type ClientAvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
};

export function ClientAvatar({ name, size = 'md' }: ClientAvatarProps) {
  return (
    <span className={`client-avatar client-avatar--${size}`} aria-hidden="true">
      {clientInitials(name)}
    </span>
  );
}
