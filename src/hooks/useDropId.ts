import { DropIdContext } from '@/contexts/dragging';
import { useContext } from 'solid-js';

const useDropId = () => useContext(DropIdContext);

export default useDropId;
