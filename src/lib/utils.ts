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
