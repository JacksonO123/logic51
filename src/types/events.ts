import { DOMElement } from 'solid-js/jsx-runtime';

export type ElementInputEvent<T extends HTMLInputElement | HTMLTextAreaElement> = InputEvent & {
  currentTarget: T;
  target: T;
};

export type ElementDragEvent<T extends HTMLElement> = DragEvent & {
  currentTarget: T;
  target: DOMElement;
};

export type ElementDropEvent<T extends HTMLElement> = DragEvent & {
  currentTarget: T;
  target: DOMElement;
};
