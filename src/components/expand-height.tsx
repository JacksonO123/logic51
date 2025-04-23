import { JSX, createEffect, createSignal, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

type ExpandHeightProps = JSX.HTMLAttributes<HTMLDivElement> & {
  expanded: boolean;
};

const ExpandHeight = (props: ExpandHeightProps) => {
  const [local, other] = splitProps(props, ['class']);
  const [height, setHeight] = createSignal<number | null>(null);
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

  createEffect(() => {
    const el = ref();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHeight(rect.height);
  });

  return (
    <div
      class={twMerge('overflow-hidden duration-150', local.class)}
      style={{ height: `${height() === null ? 'auto' : props.expanded ? height() : 0}px` }}
      {...other}
    >
      <div ref={setRef}>{other.children}</div>
    </div>
  );
};

export default ExpandHeight;
