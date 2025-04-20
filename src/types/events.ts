import { DOMElement } from 'solid-js/jsx-runtime';

export type ElementDragEvent<T extends HTMLElement> = DragEvent & {
  currentTarget: T;
  target: DOMElement;
};

export type ElementDropEvent<T extends HTMLElement> = DragEvent & {
  currentTarget: T;
  target: DOMElement;
};
