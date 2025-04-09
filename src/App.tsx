import { createEffect, createSignal } from "solid-js";
import Input from "@/components/input";
import Button from "@/components/button";
import { ChangeEvent } from "@/types/input";
import Table from "@/components/table";
import { Relation } from "./types/relations";

const App = () => {
  const [vars, setVars] = createSignal<string[]>(["p", "q", "r", "s"]);
  const [relations, setRelations] = createSignal<Relation[]>([
    {
      type: "or",
      first: {
        type: "and",
        first: {
          type: "or",
          first: {
            type: "var",
            name: "p",
          },
          last: {
            type: "var",
            name: "q",
          },
        },
        last: {
          type: "var",
          name: "r",
        },
      },
      last: {
        type: "var",
        name: "s",
      },
    },
  ]);
  const [deconstructions, setDeconstructions] = createSignal<Relation[]>([]);
  const [table, setTable] = createSignal<boolean[][]>([]);
  const [varName, setVarName] = createSignal("");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.slice(0, 1);
    e.currentTarget.value = value;
    setVarName(value);
  };

  const evaluateRelation = (
    rel: Relation,
    table: boolean[][],
    row: number,
  ): boolean => {
    let first = false;
    let last = false;

    if (rel.first.type === "var") {
      const varIndex = vars().indexOf(rel.first.name);
      first = table[varIndex][row];
    } else {
      first = evaluateRelation(rel.first, table, row);
    }

    if (rel.last.type === "var") {
      const varIndex = vars().indexOf(rel.last.name);
      last = table[varIndex][row];
    } else {
      last = evaluateRelation(rel.last, table, row);
    }

    if (rel.type === "and") return first && last;
    if (rel.type === "or") return first || last;

    return false;
  };

  const fillTable = (vars: string[], ...relations: Relation[]) => {
    const numRows = Math.pow(2, vars.length);
    const table: boolean[][] = Array(vars.length + relations.length)
      .fill(null)
      .map(() => Array(numRows).fill(false));

    let group = 1;
    for (let i = vars.length - 1; i >= 0; i--) {
      let j = 0;

      while (j < numRows) {
        for (let k = 0; k < group; k++) {
          table[i][j + k] = true;
        }

        j += group * 2;
      }

      group *= 2;
    }

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < relations.length; j++) {
        table[vars.length + j][i] = evaluateRelation(relations[j], table, i);
      }
    }

    setTable(table);
  };

  const deconstruct = (relation: Relation) => {
    const res: Relation[] = [];

    if (relation.first.type !== "var") {
      res.push(...deconstruct(relation.first), relation.first);
    }

    if (relation.last.type !== "var") {
      res.push(...deconstruct(relation.last), relation.last);
    }

    return res;
  };

  const deconstructMany = (relations: Relation[]) => {
    const res: Relation[] = [];

    relations.forEach((rel) => {
      res.push(...deconstruct(rel));
    });

    return res;
  };

  createEffect(() => {
    fillTable(vars(), ...deconstructions(), ...relations());
  });

  createEffect(() => {
    setDeconstructions(deconstructMany(relations()));
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
      <Table
        table={table()}
        vars={vars()}
        relations={[...deconstructions(), ...relations()]}
      />
    </main>
  );
};

export default App;
