import { createSignal, JSX, splitProps } from 'solid-js';
import Button from './button';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-solid';
import ExpandWidth from './expand-width';

const ClearButton = (props: JSX.HTMLAttributes<HTMLButtonElement>) => {
  const [local, other] = splitProps(props, ['class', 'onMouseEnter', 'onMouseLeave']);
  const [hovering, setHovering] = createSignal(false);

  return (
    <Button
      size="sm"
      variant="outline"
      class={twMerge(
        'absolute left-0 top-0 translate-x-[-6px] translate-y-[-50%] h-6 p-1 !px-0.75 rounded-full gap-0 overflow-hidden has-[>svg]:px-0 duration-150',
        local.class,
        hovering() && '!pr-1.25'
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      {...other}
    >
      <X />
      <ExpandWidth expanded={hovering()}>
        <span class={twMerge('text-sm duration-150', hovering() ? 'opacity-100' : 'opacity-0')}>
          {props.children}
        </span>
      </ExpandWidth>
    </Button>
  );
};

export default ClearButton;
