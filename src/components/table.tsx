import { Relation, RelationType, Variable } from '@/types/relations';
import { Copy, MoveHorizontal, MoveRight, Pencil, X } from 'lucide-solid';
import { createMemo, createSignal, JSX } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import Button from './button';
import { numBools } from '@/lib/utils';

type ItemWrapperProps = {
  children: JSX.Element;
  noBorderBottom?: boolean;
  noBorderRight?: boolean;
  dimBorder?: boolean;
  value?: boolean;
  first?: boolean;
  last?: boolean;
  header?: boolean;
  highlight?: boolean;
  showControls?: boolean;
  isCritical?: boolean;
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
  onRemove?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
};

const ItemWrapper = (props: ItemWrapperProps) => {
  return (
    <div
      class={twMerge(
        'px-1 py-0.5 flex items-center cursor-default relative',
        !props.noBorderBottom && `border-b ${props.dimBorder ? 'border-b-primary/25' : 'border-b-primary'}`,
        !props.noBorderRight && `border-r ${props.dimBorder ? 'border-r-primary/25' : 'border-r-primary'}`,
        props.first && 'pt-1',
        props.last && 'pb-1',
        props.header ? 'h-14' : 'hover:[&_div]:border-black'
      )}
      onMouseOver={props.onMouseOver}
      onMouseLeave={props.onMouseLeave}
    >
      <div
        class={twMerge(
          'px-3 py-1 rounded w-full text-center border-2 border-transparent duration-75',
          props.value === undefined ? '' : props.value ? 'bg-green-500/25' : 'bg-destructive/25',
          props.highlight && 'border-blue-500',
          props.isCritical && 'bg-amber-400/45'
        )}
      >
        {props.children}
      </div>
      {props.showControls && (props.onRemove || props.onEdit) && (
        <div
          class={twMerge(
            'absolute top-0 left-[50%] translate-x-[-50%] translate-y-[-110%] rounded-full p-1 bg-background flex gap-1',
            numBools([!!props.onRemove, !!props.onEdit]) > 1 && 'border'
          )}
        >
          {props.onRemove && (
            <Button
              class="h-6 w-6 rounded-full !px-0.75 has-[>svg]:px-0"
              onClick={() => props.onRemove?.()}
              size="icon"
              variant="outline"
            >
              <X />
            </Button>
          )}
          {props.onEdit && (
            <Button
              class="h-6 w-6 rounded-full !px-0.75 has-[>svg]:px-0"
              onClick={() => props.onEdit?.()}
              size="icon"
              variant="outline"
            >
              <Pencil />
            </Button>
          )}
          {props.onCopy && (
            <Button
              class="h-6 w-6 rounded-full !px-0.75 has-[>svg]:px-0"
              onClick={() => props.onCopy?.()}
              size="icon"
              variant="outline"
            >
              <Copy />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const And = () => {
  return (
    <div class="relative mx-4 w-0 h-4">
      <div class="bg-primary h-full w-0.5 rotate-[20deg] rounded-full absolute top-0 origin-top" />
      <div class="bg-primary h-full w-0.5 rotate-[-20deg] rounded-full absolute top-0 origin-top" />
    </div>
  );
};

const Or = () => {
  return (
    <div class="relative mx-4 w-0 h-4">
      <div class="bg-primary h-full w-0.5 rotate-[20deg] rounded-full absolute top-0 origin-bottom" />
      <div class="bg-primary h-full w-0.5 rotate-[-20deg] rounded-full absolute top-0 origin-bottom" />
    </div>
  );
};

type RelationElProps = {
  rel: Relation | Variable;
  defined?: boolean;
  conclusion?: boolean;
  root?: boolean;
};

const RelationEl = (props: RelationElProps) => {
  const icons: Record<RelationType, JSX.Element> = {
    and: <And />,
    or: <Or />,
    if: <MoveRight class="mx-2" />,
    iff: <MoveHorizontal class="mx-2" />,
    not: <span class="font-semibold text-xl mx-2">~</span>
  };

  if (props.rel && props.rel.type === 'var') {
    return <span class="leading-0 px-2">{props.rel.name}</span>;
  }

  return (
    <div
      class={twMerge(
        'flex items-center rounded p-1',
        !props.root && 'border border-primary my-[-1px]',
        props.conclusion ? 'bg-purple-400/30' : props.defined && 'bg-blue-300/60'
      )}
    >
      {props.rel && (
        <>
          {props.rel.first && <RelationEl rel={props.rel.first} />}
          {icons[props.rel.type]}
          {props.rel.last && <RelationEl rel={props.rel.last} />}
        </>
      )}
    </div>
  );
};

type TableProps = {
  table: boolean[][];
  vars: string[];
  relations: Relation[];
  numDefined: number;
  hasConclusion: boolean;
  criticalRows: number[];
  editRelation: (index: number) => void;
  removeRelation: (index: number) => void;
  removeVar: (index: number) => void;
  copyRelation: (index: number) => void;
};

const Table = (props: TableProps) => {
  const [hovering, setHovering] = createSignal<[number, number]>([-1, -1]);
  const relations = createMemo(() => props.table.slice(props.vars.length));

  const handleHover = (col: number, row: number) => {
    setHovering([col, row]);
  };

  const cancelHover = () => setHovering([-1, -1]);

  const isRelated = (col: number, row: number) => {
    if (row != hovering()[1]) return false;

    const related = props.relations[hovering()[0]].relatedVars;
    return related.includes(props.vars[col]);
  };

  const isMapped = (col: number, row: number) => {
    if (row != hovering()[1]) return false;

    const rel = props.relations[col];
    if (rel.deconId === undefined) return false;

    const relatedIds = props.relations[hovering()[0]].relatedIds;
    if (relatedIds.includes(rel.deconId)) return true;

    return false;
  };

  const relativeRelationIndex = (index: number) => {
    return props.numDefined - (relations().length - index);
  };

  return (
    <div class="flex border border-primary w-fit rounded">
      {props.table.slice(0, props.vars.length).map((col, colIndex) => (
        <div class="flex flex-col">
          <ItemWrapper
            noBorderRight
            header
            showControls
            onRemove={() => props.removeVar(colIndex)}
          >
            {props.vars[colIndex]}
          </ItemWrapper>
          {col.map((item, index) => (
            <ItemWrapper
              first={index === 0}
              last={index === col.length - 1}
              dimBorder
              noBorderBottom
              noBorderRight={colIndex === props.table.length - 1}
              value={item}
              onMouseOver={cancelHover}
              onMouseLeave={cancelHover}
              highlight={isRelated(colIndex, index)}
            >
              {item ? 'T' : 'F'}
            </ItemWrapper>
          ))}
        </div>
      ))}
      {relations().map((col, colIndex) => (
        <div class="flex flex-col">
          <ItemWrapper
            noBorderRight
            header
            showControls={relations().length - colIndex <= props.numDefined}
            onEdit={() => props.editRelation(relativeRelationIndex(colIndex))}
            onRemove={() => props.removeRelation(relativeRelationIndex(colIndex))}
            onCopy={() => props.copyRelation(relativeRelationIndex(colIndex))}
          >
            <RelationEl
              rel={props.relations[colIndex]}
              defined={relations().length - colIndex <= props.numDefined}
              conclusion={props.hasConclusion && colIndex === relations().length - 1}
              root
            />
          </ItemWrapper>
          {col.map((item, index) => (
            <ItemWrapper
              first={index === 0}
              last={index === col.length - 1}
              dimBorder
              noBorderBottom
              noBorderRight={colIndex === relations().length - 1}
              value={item}
              onMouseOver={() => handleHover(colIndex, index)}
              onMouseLeave={cancelHover}
              highlight={isMapped(colIndex, index)}
              isCritical={
                relations().length - colIndex <= props.numDefined &&
                props.criticalRows.includes(index) &&
                props.hasConclusion &&
                colIndex !== relations().length - 1
              }
            >
              {item ? 'T' : 'F'}
            </ItemWrapper>
          ))}
        </div>
      ))}
      {props.table.length === 0 && <div class="px-2">Empty</div>}
    </div>
  );
};

export default Table;
