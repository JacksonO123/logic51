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
};

const ItemWrapper = (props: ItemWrapperProps) => {
  console.log(props.value);

  return (
    <div
      class={twMerge(
        "px-1 py-0.5",
        props.noBorderBottom === true
          ? ""
          : `border-b ${props.dimBorder ? "border-b-primary/25" : "border-b-primary"}`,
        props.noBorderRight === true
          ? ""
          : `border-r ${props.dimBorder ? "border-r-primary/25" : "border-r-primary"}`,
        props.first === true ? "pt-1" : "",
        props.last === true ? "pb-1" : "",
      )}
    >
      <div
        class={`px-3 py-1 rounded text-center ${props.value === undefined ? "" : props.value ? "bg-green-500/25" : "bg-destructive/25"}`}
      >
        {props.children}
      </div>
    </div>
  );
};

type TableProps = {
  table: boolean[][];
  vars: string[];
};

const Table = (props: TableProps) => {
  return (
    <div class="flex border border-primary w-fit rounded">
      {props.table.map((col, colIndex) => (
        <div class="flex flex-col">
          <ItemWrapper noBorderRight>{props.vars[colIndex]}</ItemWrapper>
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
