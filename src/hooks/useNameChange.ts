import { ChangeEvent } from '@/types/input';
import { createSignal } from 'solid-js';

const useNameChange = () => {
  const [name, setName] = createSignal('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    setName(value);
  };

  return [name, handleChange] as const;
};

export default useNameChange;
