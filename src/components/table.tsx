import { Relation, RelationType, Variable } from "@/types/relations";
import { ChevronDown, ChevronUp, Plus } from "lucide-solid";
import { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

type ItemWrapperProps = {
  children: JSX.Element;
  noBorderBottom?: boolean;
  noBorderRight?: boolean;
  dimBorder?: boolean;
  value?: boolean;
  first?: boolean;
  last?: boolean;
  header?: boolean;
};

const ItemWrapper = (props: ItemWrapperProps) => {
  return (
    <div
      class={twMerge(
        "px-1 py-0.5 flex items-center",
        !props.noBorderBottom &&
          `border-b ${props.dimBorder ? "border-b-primary/25" : "border-b-primary"}`,
        !props.noBorderRight &&
          `border-r ${props.dimBorder ? "border-r-primary/25" : "border-r-primary"}`,
        props.first && "pt-1",
        props.last && "pb-1",
        props.header && "h-12",
      )}
    >
      <div
        class={`px-3 py-1 rounded w-full text-center ${props.value === undefined ? "" : props.value ? "bg-green-500/25" : "bg-destructive/25"}`}
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
    or: <Or />,
  };

  if (props.rel.type === "var") {
    return <span class="leading-0">{props.rel.name}</span>;
  }

  return (
    <div
      class={twMerge(
        "flex items-center rounded p-1",
        !props.root && "border border-primary my-[-1px]",
      )}
    >
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
};

const Table = (props: TableProps) => {
  return (
    <div class="flex border border-primary w-fit rounded">
      {props.table.map((col, colIndex) => (
        <div class="flex flex-col">
          <ItemWrapper noBorderRight header>
            {colIndex >= props.vars.length ? (
              <RelationEl
                rel={props.relations[colIndex - props.vars.length]}
                root
              />
            ) : (
              props.vars[colIndex]
            )}
          </ItemWrapper>
          {col.map((item, index) => (
            <ItemWrapper
              first={index === 0}
              last={index === col.length - 1}
              dimBorder
              noBorderBottom
              noBorderRight={colIndex === props.table.length - 1}
              value={item}
            >
              {item ? "T" : "F"}
            </ItemWrapper>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Table;
