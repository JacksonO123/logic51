import { JSX, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

type ItemWrapperProps = JSX.HTMLAttributes<HTMLDivElement>;

export const ItemWrapper = (props: ItemWrapperProps) => {
  const [local, other] = splitProps(props, ['class']);

  return (
    <div
      class={twMerge(
        'min-h-8 py-2 bg-violet-600 rounded text-primary-foreground flex items-center justify-center cursor-move select-none',
        local.class
      )}
      {...other}
    />
  );
};

export const VariableWrapper = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [local, other] = splitProps(props, ['class']);

  return (
    <ItemWrapper
      class={twMerge('bg-violet-500 w-6 px-1 py-0', local.class)}
      {...other}
    />
  );
};

type LogicWrapperProps = JSX.HTMLAttributes<HTMLDivElement>;

export const LogicWrapper = (props: LogicWrapperProps) => {
  const [local, other] = splitProps(props, ['class']);

  return (
    <ItemWrapper
      class={twMerge('bg-green-600 px-2 flex gap-2 w-fit cursor-grab', local.class)}
      {...other}
    />
  );
};
