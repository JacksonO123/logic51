import { createSignal } from 'solid-js';
import Button from './button';
import { Minus, Plus } from 'lucide-solid';
import {
  CreatingRelation,
  DraggableType,
  PathType,
  Relation,
  relations,
  RelationType,
  Variable
} from '@/types/relations';
import { ElementDragEvent, ElementDropEvent } from '@/types/events';
import DragTarget from './drag-target';
import { LogicWrapper, VariableWrapper } from './item-wrapper';
import DropArea from './drop-area';
import { getDraggingControls } from '@/contexts/dragging';

type CreateExpressionProps = {
  vars: string[];
  onSubmit: (rel: Relation) => void;
};

const CreateExpression = (props: CreateExpressionProps) => {
  const [showing, setShowing] = createSignal(false);
  const [relation, setRelation] = createSignal<CreatingRelation | null>(null);
  let dropEvent: (() => void) | null = null;

  const setDragging = (e: ElementDragEvent<HTMLDivElement>, blockType: DraggableType) => {
    if (!e.dataTransfer) return;

    let data: CreatingRelation | Variable;

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

  const handleDrop = (path: PathType[], data: CreatingRelation | Variable | null) => {
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
      obj = obj[part] as CreatingRelation;
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

    const obj = JSON.parse(e.dataTransfer.getData('text')) as CreatingRelation | Variable;
    const res: CreatingRelation = {
      relatedVars: [],
      relatedIds: [],
      type: blockType,
      [pos]: obj
    };
    setRelation(res);
  };

  const scanExpr = (rel: CreatingRelation | Variable): boolean => {
    if (rel.type === 'var') return true;
    if (!rel.first) return false;
    if (!rel.last) return false;

    return scanExpr(rel.first) && scanExpr(rel.last);
  };

  const ableToCreate = () => {
    const rel = relation();
    if (!rel) return false;
    return scanExpr(rel);
  };

  const propagateRelatedVars = (rel: Relation) => {
    if (rel.first.type === 'var') {
      rel.relatedVars = [rel.first.name];
    } else {
      propagateRelatedVars(rel.first);
    }

    if (rel.last.type === 'var') {
      rel.relatedVars.push(rel.last.name);
    } else {
      propagateRelatedVars(rel.last);
    }
  };

  const createExpression = () => {
    const rel = relation() as Relation;
    if (!rel) return;
    propagateRelatedVars(rel);
    props.onSubmit(rel);
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
                  <DropArea onDrop={(e) => surround(e, 'first', rel)} />
                  {rel}
                  <DropArea onDrop={(e) => surround(e, 'last', rel)} />
                </LogicWrapper>
              ))}
            </div>
            <DragTarget
              class="w-full min-h-[35px] p-2 rounded-md"
              onAreaDrop={handleDrop}
              registerClearPath={registerClearPath}
              data={relation()}
              root
            />
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
