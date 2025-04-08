export type ChangeEvent<T extends HTMLElement> = InputEvent & {
  currentTarget: T;
  target: T;
};
