import { ElementDragEvent, ElementDropEvent } from '@/types/events';
import { CreatingRelation, PathType, Variable } from '@/types/relations';
import { JSX, Show, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import { LogicWrapper, VariableWrapper } from './item-wrapper';
import { dragging, getDraggingControls } from '@/contexts/dragging';

type DragTargetProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> & {
  onAreaDrop: (path: PathType[], data: CreatingRelation | Variable) => void;
  registerClearPath: (path: PathType[]) => void;
  root?: boolean;
  data: CreatingRelation | Variable | null;
};

const DragTarget = (props: DragTargetProps) => {
  const [local, other] = splitProps(props, ['class', 'onDragEnter', 'onDragLeave']);

  const handleDrop = (e: ElementDropEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!e.dataTransfer) return;

    const strData = e.dataTransfer.getData('text');
    const data = JSON.parse(strData) as CreatingRelation | Variable;
    props.onAreaDrop([], data);
  };

  const handleDragStart = (e: ElementDragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer || !props.data) return;

    const str = JSON.stringify(props.data);
    e.dataTransfer.setData('text', str);
    if (!props.root) props.registerClearPath([]);
  };

  return (
    <div
      class={twMerge(
        'border-2 border-dashed duration-150 border-black/20',
        props.root && 'border-zinc-300 bg-background',
        dragging() && (props.root ? 'border-primary' : 'border-white'),
        local.class
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      {...other}
    >
      {props.data && (
        <>
          {props.data?.type === 'var' ? (
            <VariableWrapper
              draggable="true"
              {...getDraggingControls({
                onDragStart: handleDragStart
              })}
            >
              {props.data.name}
            </VariableWrapper>
          ) : (
            <LogicWrapper
              draggable="true"
              {...getDraggingControls({
                onDragStart: handleDragStart
              })}
            >
              <DragTarget
                class="min-w-6 min-h-6 rounded"
                onAreaDrop={(path, data) => props.onAreaDrop(['first', ...path], data)}
                registerClearPath={(path) => props.registerClearPath(['first', ...path])}
                data={props.data?.first ?? null}
              />
              {props.data?.type}
              <DragTarget
                class="min-w-6 min-h-6 rounded"
                onAreaDrop={(path, data) => props.onAreaDrop(['last', ...path], data)}
                registerClearPath={(path) => props.registerClearPath(['last', ...path])}
                data={props.data?.last ?? null}
              />
            </LogicWrapper>
          )}
        </>
      )}
    </div>
  );
};

export default DragTarget;
