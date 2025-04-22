import { JSX, createSignal, splitProps } from 'solid-js';
import Button from './button';
import { Check, Minus, Plus, X } from 'lucide-solid';
import {
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
import { getDraggingControls } from '@/contexts/dragging';
import { twMerge } from 'tailwind-merge';
import ExpandWidth from './expand-width';

const ClearButton = (props: Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'children'>) => {
  const [local, other] = splitProps(props, ['class', 'onMouseEnter', 'onMouseLeave']);
  const [hovering, setHovering] = createSignal(false);

  return (
    <Button
      size="sm"
      variant="outline"
      class={twMerge(
        'absolute left-0 top-0 translate-x-[-6px] translate-y-[-50%] h-6 p-1 px-0 has-[>svg]:px-1 rounded-full gap-0 overflow-hidden',
        local.class
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      {...other}
    >
      <X />
      <ExpandWidth expanded={hovering()}>
        <span class="text-sm">Clear</span>
      </ExpandWidth>
    </Button>
  );
};

type CreateExpressionProps = {
  vars: string[];
  onSubmit: (rel: Relation, isConclusion: boolean) => void;
};

const CreateExpression = (props: CreateExpressionProps) => {
  const [showing, setShowing] = createSignal(false);
  const [relation, setRelation] = createSignal<Relation | null>(null);
  const [isConclusion, setIsConclusion] = createSignal(false);
  let dropEvent: (() => void) | null = null;

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

    const str = JSON.stringify(data);
    e.dataTransfer.setData('text', str);
  };

  const handleDrop = (path: PathType[], data: Relation | Variable | null) => {
    const event = dropEvent;
    dropEvent = null;
    event?.();

    if (path.length === 0) {
      if (!data) {
        setRelation(null);
        return;
      }

      if (data.type === 'var') return;

      setRelation(data);
      return;
    }

    const lastPath = path.splice(path.length - 1, path.length)[0];

    let obj = relation();
    if (obj === null) return;
    const orig = obj;

    for (const part of path) {
      obj = obj[part] as Relation;
    }

    if (!data) {
      obj[lastPath] = undefined;
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

    setRelation({ ...orig });
  };

  const registerClearPath = (path: PathType[]) => {
    dropEvent = () => {
      handleDrop(path, null);
    };
  };

  const surround = (e: ElementDropEvent<HTMLDivElement>, pos: PathType, blockType: RelationType) => {
    if (!e.dataTransfer) return;

    const obj = JSON.parse(e.dataTransfer.getData('text')) as Relation | Variable;
    const res: Relation = {
      relatedVars: [],
      relatedIds: [],
      type: blockType,
      [pos]: obj
    };
    setRelation(res);
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
    const rel = relation();
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
    const rel = relation() as Relation;
    if (!rel) return;
    propagateRelatedVars(rel);
    props.onSubmit(rel, isConclusion());
    setRelation(null);
    setShowing(false);
  };

  return (
    <div id="wrapper">
      {showing() ? (
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
              class="w-full min-h-[35px] p-3 rounded-md relative"
              onAreaDrop={handleDrop}
              registerClearPath={registerClearPath}
              data={relation()}
              root
            >
              <ClearButton onClick={() => setRelation(null)} />
            </DragTarget>
            <div class="w-full flex justify-start px-1 gap-2 items-center">
              <button
                class={twMerge(
                  'w-4 h-4 border flex justify-center items-center rounded border-black cursor-pointer duration-150',
                  isConclusion() ? 'bg-black border-black' : 'bg-background'
                )}
                onClick={() => setIsConclusion((prev) => !prev)}
              >
                <Check
                  size={12}
                  strokeWidth={4}
                  stroke="white"
                />
              </button>
              <label for="conclusion">Is conclusion</label>
            </div>
            <Button
              onClick={createExpression}
              class="w-fit"
              disabled={!ableToCreate()}
            >
              <Plus />
              Create
            </Button>

            <Button
              class="rounded-full absolute bottom-0 left-0 translate-x-[-60%] translate-y-[60%]"
              size="icon"
              variant="outline"
              onClick={() => setShowing(false)}
            >
              <Minus />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          class="rounded-full fixed right-4 top-4"
          size="icon"
          onClick={() => setShowing(true)}
        >
          <Plus />
        </Button>
      )}
    </div>
  );
};

export default CreateExpression;
