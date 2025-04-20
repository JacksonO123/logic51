import { dragging } from '@/contexts/dragging';
import { JSX, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

const DropArea = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [_, other] = splitProps(props, ['onDragOver']);

  return (
    <div
      class={twMerge(
        'w-6 h-6 rounded border-2 border-black/20 border-dashed duration-150',
        dragging() && 'border-white'
      )}
      onDragOver={(e) => e.preventDefault()}
      {...other}
    />
  );
};

export default DropArea;
