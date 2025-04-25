import { createEffect, createSignal } from 'solid-js';
import Button from './button';
import { Check, Minus, Plus, Trash } from 'lucide-solid';
import {
  DragData,
  DraggableType,
  PathType,
  Relation,
  relations,
  RelationType,
  singleSlotRelations,
  Variable
} from '@/types/relations';
import { ElementDragEvent, ElementDropEvent } from '@/types/events';
import DragTarget from './drag-target';
import { LogicWrapper, VariableWrapper } from './item-wrapper';
import DropArea from './drop-area';
import { dragging, getDraggingControls } from '@/contexts/dragging';
import { twMerge } from 'tailwind-merge';
import ClearButton from './clear-button';
import ExpandHeight from './expand-height';

type CreateExpressionProps = {
  vars: string[];
  relation: Relation | null;
  showing: boolean;
  editIndex: number | null;
  setShowing: (showing: boolean) => void;
  onSubmit: (isConclusion: boolean) => void;
  setRelation: (rel: Relation | null) => void;
  hasConclusion: boolean;
  numRelations: number;
};

const CreateExpression = (props: CreateExpressionProps) => {
  const [isConclusion, setIsConclusion] = createSignal(false);
  let dropEvent: (() => void) | null = null;
  const isEditing = () => props.editIndex !== null;

  createEffect(() => {
    if (!props.showing) setIsConclusion(false);
  });

  createEffect(() => {
    setIsConclusion(props.hasConclusion && props.editIndex === props.numRelations - 1);
  });

  const setDragging = (e: ElementDragEvent<HTMLDivElement>, blockType: DraggableType) => {
    if (!e.dataTransfer) return;

    let data: Relation | Variable;

    if (blockType.startsWith('var')) {
      const name = blockType.split('-')[1];
      data = {
        type: 'var',
        name
      };
    } else {
      data = {
        relatedVars: [],
        relatedIds: [],
        type: blockType as RelationType
      };
    }

    const dragData: DragData = {
      fromPath: null,
      relation: data
    };
    const str = JSON.stringify(dragData);
    e.dataTransfer.setData('text', str);
  };

  const handleDrop = (path: PathType[], data: Relation | Variable | null) => {
    const event = dropEvent;
    dropEvent = null;
    event?.();

    if (path.length === 0) {
      if (!data) {
        props.setRelation(null);
        return;
      }

      if (data.type === 'var') return;

      props.setRelation(data);
      return;
    }

    const lastPath = path.splice(path.length - 1)[0];

    let obj = props.relation;
    if (obj === null) return;
    const orig = obj;

    for (const part of path) {
      obj = obj[part] as Relation;
    }

    if (!data) {
      obj[lastPath] = undefined;
      props.setRelation({ ...orig });

      return;
    }

    if (data.type === 'var') {
      obj[lastPath] = {
        type: 'var',
        name: data.name
      };
    } else {
      obj[lastPath] = data;
    }

    props.setRelation({ ...orig });
  };

  const registerClearPath = (path: PathType[]) => {
    dropEvent = () => {
      handleDrop(path, null);
    };
  };

  const surround = (e: ElementDropEvent<HTMLDivElement>, pos: PathType, blockType: RelationType) => {
    if (!e.dataTransfer) return;

    const obj = JSON.parse(e.dataTransfer.getData('text')) as DragData;
    const res: Relation = {
      relatedVars: [],
      relatedIds: [],
      type: blockType,
      [pos]: obj.relation
    };
    props.setRelation(res);
  };

  const scanExpr = (rel: Relation | Variable): boolean => {
    const isSingleSlot = singleSlotRelations.includes(rel.type);

    if (rel.type === 'var') return true;
    if (!isSingleSlot && !rel.first) return false;
    if (!rel.last) return false;

    const first = isSingleSlot ? true : scanExpr(rel.first!);
    return first && scanExpr(rel.last);
  };

  const ableToCreate = () => {
    const rel = props.relation;
    if (!rel) return false;
    return scanExpr(rel);
  };

  const propagateRelatedVars = (rel: Relation) => {
    if (rel.first?.type === 'var') {
      rel.relatedVars = [rel.first.name];
    } else {
      if (rel.first) propagateRelatedVars(rel.first);
    }

    if (rel.last?.type === 'var') {
      rel.relatedVars.push(rel.last.name);
    } else {
      if (rel.last) propagateRelatedVars(rel.last);
    }
  };

  const createExpression = () => {
    const rel = props.relation as Relation;
    if (!rel) return;
    propagateRelatedVars(rel);
    props.onSubmit(isConclusion());
    props.setRelation(null);
    props.setShowing(false);
  };

  const trashDrop = (e: ElementDropEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!e.dataTransfer) return;

    const value = e.dataTransfer.getData('text');
    const dragData = JSON.parse(value) as DragData;
    if (!dragData.fromPath) return;

    console.log(dragData.fromPath);
    handleDrop(dragData.fromPath, null);
  };

  const toggleIsConclusion = () => {
    setIsConclusion((prev) => !prev);
  };

  const handleClose = () => {
    if (isEditing()) props.setRelation(null);
    props.setShowing(false);
  };

  return (
    <div id="wrapper">
      {props.showing ? (
        <div class="fixed right-4 top-4 rounded-md border bg-background/50 backdrop-blur-sm min-w-[200px]">
          <div class="relative flex flex-col items-end gap-4 p-2">
            <div class="flex gap-2">
              {props.vars.map((v) => (
                <VariableWrapper
                  draggable="true"
                  {...getDraggingControls({
                    onDragStart: (e) => setDragging(e, `var-${v}`)
                  })}
                >
                  {v}
                </VariableWrapper>
              ))}
            </div>
            <div class="flex gap-2">
              {relations.map((rel) => (
                <LogicWrapper
                  draggable="true"
                  {...getDraggingControls({
                    onDragStart: (e) => setDragging(e, rel)
                  })}
                >
                  {!singleSlotRelations.includes(rel) && (
                    <DropArea onDrop={(e) => surround(e, 'first', rel)} />
                  )}
                  {rel}
                  <DropArea onDrop={(e) => surround(e, 'last', rel)} />
                </LogicWrapper>
              ))}
            </div>
            <DragTarget
              class="w-full min-h-[45px] p-3 rounded-md relative"
              onAreaDrop={handleDrop}
              registerClearPath={registerClearPath}
              data={props.relation}
              path={[]}
              root
            >
              <ClearButton onClick={() => props.setRelation(null)}>Clear</ClearButton>
            </DragTarget>
            <div class="flex w-full">
              <ExpandHeight
                class={twMerge('w-full', dragging() && 'pb-4')}
                expanded={dragging()}
              >
                <DragTarget
                  class={twMerge(
                    'w-[80px] h-[35px] rounded-md bg-destructive/15 border-2 border-dashed !border-destructive/20 flex justify-center items-center',
                    dragging() ? 'opacity-100' : 'opacity-0'
                  )}
                  onDrop={trashDrop}
                  onAreaDrop={() => {}}
                  data={null}
                  path={[]}
                >
                  <div class="flex gap-1">
                    <Trash
                      size={18}
                      class="stroke-foreground"
                    />
                    <span class="text-sm">Trash</span>
                  </div>
                </DragTarget>
              </ExpandHeight>
              <div class="w-full flex flex-col items-end gap-2">
                <div class="flex px-1 gap-2 items-center">
                  <button
                    class={twMerge(
                      'w-4 h-4 border flex justify-center items-center rounded border-black cursor-pointer duration-150',
                      isConclusion() ? 'bg-black border-black' : 'bg-background'
                    )}
                    onClick={toggleIsConclusion}
                  >
                    <Check
                      size={12}
                      strokeWidth={4}
                      stroke="white"
                    />
                  </button>
                  <label
                    class="whitespace-normal text-nowrap break-keep"
                    for="conclusion"
                  >
                    Is conclusion
                  </label>
                </div>
                <Button
                  onClick={createExpression}
                  class="w-fit"
                  disabled={!ableToCreate()}
                >
                  <Plus />
                  {isEditing() ? 'Submit' : 'Create'}
                </Button>
              </div>
            </div>

            <Button
              class="rounded-full absolute bottom-0 left-0 translate-x-[-60%] translate-y-[60%]"
              size="icon"
              variant="outline"
              onClick={handleClose}
            >
              <Minus />
            </Button>

            {isEditing() && (
              <div class="absolute rounded-full bottom-0 left-0 translate-y-[50%] translate-x-[2rem] bg-yellow-100 px-2 border border-yellow-600 text-yellow-700">
                Editing
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button
          class="rounded-full fixed right-4 top-4"
          size="icon"
          onClick={() => props.setShowing(true)}
        >
          <Plus />
        </Button>
      )}
    </div>
  );
};

export default CreateExpression;
