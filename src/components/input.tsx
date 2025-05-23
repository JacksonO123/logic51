import { JSX, splitProps } from 'solid-js';
import { cn } from '@/lib/utils';

const Input = (props: JSX.InputHTMLAttributes<HTMLInputElement>) => {
  const [local, others] = splitProps(props, ['class', 'disabled']);

  return (
    <input
      class={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        local.class
      )}
      {...others}
    />
  );
};

export default Input;
