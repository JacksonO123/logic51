import { ElementDragEvent } from '@/types/events';
import { createSignal, createContext } from 'solid-js';

const [dragging, setDragging] = createSignal(false);

export { dragging };

export const getDraggingControls = <T extends HTMLElement>(options?: {
  onDragStart?: (e: ElementDragEvent<T>) => void;
  onDragEnd?: (e: ElementDragEvent<T>) => void;
}) => {
  return {
    onDragStart(e: ElementDragEvent<T>) {
      e.stopPropagation();
      options?.onDragStart?.(e);
      setDragging(true);
    },
    onDragEnd(e: ElementDragEvent<T>) {
      e.stopPropagation();
      options?.onDragEnd?.(e);
      setDragging(false);
    }
  };
};

export const DropIdContext = createContext('');
