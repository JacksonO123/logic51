import { ElementDragEvent, ElementDropEvent } from '@/types/events';
import { Relation, PathType, singleSlotRelations, Variable, DragData } from '@/types/relations';
import { createSignal, JSX, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import { LogicWrapper, VariableWrapper } from './item-wrapper';
import { dragging, getDraggingControls } from '@/contexts/dragging';

type DragTargetProps = JSX.HTMLAttributes<HTMLDivElement> & {
  onAreaDrop: (path: PathType[], data: Relation | Variable) => void;
  registerClearPath?: (path: PathType[]) => void;
  root?: boolean;
  data: Relation | Variable | null;
  path: PathType[];
};

const DragTarget = (props: DragTargetProps) => {
  const [local, other] = splitProps(props, ['class', 'onDragEnter', 'onDragLeave', 'children']);
  const [draggingOver, setDraggingOver] = createSignal(false);

  const handleDrop = (e: ElementDropEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingOver(false);

    if (!e.dataTransfer) return;

    const strData = e.dataTransfer.getData('text');
    const data = JSON.parse(strData) as DragData;

    if (data.fromPath && data.fromPath.length < props.path.length) return;

    props.onAreaDrop([], data.relation);
  };

  const handleDragStart = (e: ElementDragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer || !props.data) return;

    const dragData: DragData = {
      fromPath: props.path,
      relation: props.data
    };
    const str = JSON.stringify(dragData);
    e.dataTransfer.setData('text', str);
    if (!props.root) props.registerClearPath?.([]);
  };

  const handleDragEnter = () => setDraggingOver(true);

  const handleDragLeave = () => setDraggingOver(false);

  return (
    <div
      class={twMerge(
        'border-2 border-dashed duration-150 border-black/20',
        props.root && 'border-zinc-300 bg-background',
        dragging() && (props.root ? 'border-primary' : 'border-white'),
        draggingOver() && 'bg-white/50',
        local.class
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
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
              {!singleSlotRelations.includes(props.data.type) && (
                <DragTarget
                  class="min-w-6 min-h-6 rounded"
                  onAreaDrop={(path, data) => props.onAreaDrop(['first', ...path], data)}
                  registerClearPath={(path) => props.registerClearPath?.(['first', ...path])}
                  data={props.data?.first ?? null}
                  path={[...props.path, 'first']}
                />
              )}
              {props.data?.type}
              <DragTarget
                class="min-w-6 min-h-6 rounded"
                onAreaDrop={(path, data) => props.onAreaDrop(['last', ...path], data)}
                registerClearPath={(path) => props.registerClearPath?.(['last', ...path])}
                data={props.data?.last ?? null}
                path={[...props.path, 'last']}
              />
            </LogicWrapper>
          )}
        </>
      )}
      {local.children}
    </div>
  );
};

export default DragTarget;
