import { createEffect, createSignal } from "solid-js";
import Input from "@/components/input";
import Button from "@/components/button";
import { ChangeEvent } from "@/types/input";
import Table from "@/components/table";

const App = () => {
  const [vars, setVars] = createSignal<string[]>(["a", "b"]);
  const [table, setTable] = createSignal<boolean[][]>([]);
  const [varName, setVarName] = createSignal("");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.slice(0, 1);
    e.currentTarget.value = value;
    setVarName(value);
  };

  const fillTable = (vars: string[]) => {
    const numCols = Math.pow(2, vars.length);
    const table: boolean[][] = Array(vars.length)
      .fill(null)
      .map(() => Array(numCols).fill(false));

    let group = 1;
    for (let i = vars.length - 1; i >= 0; i--) {
      let j = 0;

      while (j < numCols) {
        for (let k = 0; k < group; k++) {
          table[i][j + k] = true;
        }

        j += group * 2;
      }

      group *= 2;
    }

    setTable(table);
  };

  createEffect(() => console.log(...table()));

  createEffect(() => {
    fillTable(vars());
  });

  const addVariable = () => {
    if (varName().length === 0) return;
    setVars([...vars(), varName()]);
    setVarName("");
  };

  return (
    <main class="p-4 flex flex-col gap-4">
      <div class="flex gap-2">
        <Input
          onInput={handleNameChange}
          value={varName()}
          class="w-fit"
          placeholder="Enter variable name"
        />
        <Button onClick={addVariable}>Add</Button>
      </div>
      <Table table={table()} vars={vars()} />
    </main>
  );
};

export default App;
