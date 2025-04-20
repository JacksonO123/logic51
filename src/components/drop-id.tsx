import { JSX } from 'solid-js';

type DropIdProps = {
  children: (id: string) => JSX.Element;
};

const DropId = (props: DropIdProps) => {
  const id = crypto.randomUUID();
  return props.children(id);
};

export default DropId;
