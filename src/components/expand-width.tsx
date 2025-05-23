import { JSX, createEffect, createSignal, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

type ExpandWidthProps = JSX.HTMLAttributes<HTMLDivElement> & {
  expanded: boolean;
};

const ExpandWidth = (props: ExpandWidthProps) => {
  const [local, other] = splitProps(props, ['class']);
  const [width, setWidth] = createSignal<number | null>(null);
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

  createEffect(() => {
    const el = ref();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setWidth(rect.width);
  });

  return (
    <div
      class={twMerge('overflow-hidden duration-150', local.class)}
      style={{ width: `${width() === null ? 'auto' : props.expanded ? width() : 0}px` }}
      {...other}
    >
      <div ref={setRef}>{other.children}</div>
    </div>
  );
};

export default ExpandWidth;
