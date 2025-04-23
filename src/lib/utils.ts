import { RelationType } from '@/types/relations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logic: Record<RelationType, (first: boolean, last: boolean) => boolean> = {
  and: (first, last) => first && last,
  or: (first, last) => first || last,
  if: (first, last) => {
    if (first && !last) return false;
    return true;
  },
  iff: (first, last) => {
    if (first === last) return true;
    return false;
  },
  not: (_, last) => !last
};

export const deepCopy = <T>(obj: T, keyTransformation: (key: string) => any = (key) => key): T => {
  if (Array.isArray(obj)) {
    return obj.map((value) => deepCopy(value)) as T;
  } else if (typeof obj === 'object' && obj !== null) {
    const layer = { ...obj };

    Object.entries(layer).forEach(([key, value]) => {
      // @ts-ignore
      layer[keyTransformation(key)] = deepCopy(value);
    });

    return layer;
  }

  return obj;
};

export const numBools = (bools: boolean[]) => bools.map(Number).reduce((acc, curr) => acc + curr, 0);
