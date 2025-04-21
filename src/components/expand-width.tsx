import { ParentComponent, createEffect, createSignal } from 'solid-js';

const ExpandWidth: ParentComponent<{ expanded: boolean }> = (props) => {
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
      class="overflow-hidden duration-150"
      style={{ width: `${width() === null ? 'auto' : props.expanded ? width() : 0}px` }}
    >
      <div ref={setRef}>{props.children}</div>
    </div>
  );
};

export default ExpandWidth;
