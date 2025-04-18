import { Relation, RelationType, Variable } from '@/types/relations';
import { createSignal, JSX } from 'solid-js';
import { twMerge } from 'tailwind-merge';

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
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
};

const ItemWrapper = (props: ItemWrapperProps) => {
  return (
    <div
      class={twMerge(
        'px-1 py-0.5 flex items-center cursor-default',
        !props.noBorderBottom && `border-b ${props.dimBorder ? 'border-b-primary/25' : 'border-b-primary'}`,
        !props.noBorderRight && `border-r ${props.dimBorder ? 'border-r-primary/25' : 'border-r-primary'}`,
        props.first && 'pt-1',
        props.last && 'pb-1',
        props.header ? 'h-12' : 'hover:[&_div]:border-black'
      )}
      onMouseOver={props.onMouseOver}
      onMouseLeave={props.onMouseLeave}
    >
      <div
        class={twMerge(
          'px-3 py-1 rounded w-full text-center border-2 border-transparent duration-75',
          props.value === undefined ? '' : props.value ? 'bg-green-500/25' : 'bg-destructive/25',
          props.highlight && 'border-blue-500'
        )}
      >
        {props.children}
      </div>
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
  root?: boolean;
};

const RelationEl = (props: RelationElProps) => {
  const icons: Record<RelationType, JSX.Element> = {
    and: <And />,
    or: <Or />
  };

  if (props.rel.type === 'var') {
    return <span class="leading-0">{props.rel.name}</span>;
  }

  return (
    <div class={twMerge('flex items-center rounded p-1', !props.root && 'border border-primary my-[-1px]')}>
      <RelationEl rel={props.rel.first} />
      {icons[props.rel.type]}
      <RelationEl rel={props.rel.last} />
    </div>
  );
};

type TableProps = {
  table: boolean[][];
  vars: string[];
  relations: Relation[];
  mappings: number[][];
};

const Table = (props: TableProps) => {
  const [hovering, setHovering] = createSignal<[number, number]>([-1, -1]);

  const handleHover = (col: number, row: number) => {
    setHovering([col, row]);
  };

  const cancelHover = () => setHovering([-1, -1]);

  const isRelated = (col: number, row: number) => {
    if (row != hovering()[1]) return false;

    const related = props.relations[hovering()[0]].related;
    return related.includes(props.vars[col]);
  };

  const isMapped = (col: number, row: number) => {
    if (row != hovering()[1]) return false;

    const mapping = props.mappings[hovering()[0]];
    return mapping.includes(col);
  };

  return (
    <div class="flex border border-primary w-fit rounded">
      {props.table.slice(0, props.vars.length).map((col, colIndex) => (
        <div class="flex flex-col">
          <ItemWrapper
            noBorderRight
            header
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
      {props.table.slice(props.vars.length).map((col, colIndex) => (
        <div class="flex flex-col">
          <ItemWrapper
            noBorderRight
            header
          >
            <RelationEl
              rel={props.relations[colIndex]}
              root
            />
          </ItemWrapper>
          {col.map((item, index) => (
            <ItemWrapper
              first={index === 0}
              last={index === col.length - 1}
              dimBorder
              noBorderBottom
              noBorderRight={colIndex === props.table.length - 1}
              value={item}
              onMouseOver={() => handleHover(colIndex, index)}
              onMouseLeave={cancelHover}
              highlight={isMapped(colIndex, index)}
            >
              {item ? 'T' : 'F'}
            </ItemWrapper>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Table;
