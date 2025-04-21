import { createEffect, createSignal } from 'solid-js';
import Input from '@/components/input';
import Button from '@/components/button';
import { ChangeEvent } from '@/types/input';
import Table from '@/components/table';
import { Relation, Variable } from './types/relations';
import { logic } from './lib/utils';
import CreateExpression from './components/create-expression';

const App = () => {
  const [vars, setVars] = createSignal<string[]>(['p', 'q', 'r', 's']);
  const [relations, setRelations] = createSignal<Relation[]>([
    {
      relatedVars: ['q'],
      relatedIds: [],
      type: 'if',
      first: {
        relatedVars: ['s'],
        relatedIds: [],
        type: 'or',
        first: {
          relatedVars: ['r'],
          relatedIds: [],
          type: 'and',
          first: {
            relatedVars: ['p', 'q'],
            relatedIds: [],
            type: 'or',
            first: {
              type: 'var',
              name: 'p'
            },
            last: {
              type: 'var',
              name: 'q'
            }
          },
          last: {
            type: 'var',
            name: 'r'
          }
        },
        last: { type: 'var', name: 's' }
      },
      last: {
        type: 'var',
        name: 'q'
      }
    }
  ]);
  const [hasConclusion, setHasConclusion] = createSignal(false);
  const [deconstructions, setDeconstructions] = createSignal<Record<number, Relation>>({});
  const [table, setTable] = createSignal<boolean[][]>([]);
  const [varName, setVarName] = createSignal('');
  const allRelations = () =>
    Object.entries(deconstructions())
      .sort((a, b) => +a[0] - +b[0])
      .map((item) => item[1])
      .concat(...relations());
  let deconId = 0;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.slice(0, 1);
    e.currentTarget.value = value;
    setVarName(value);
  };

  const evaluateRelation = (rel: Relation, table: boolean[][], row: number): boolean => {
    let first = false;
    let last = false;

    if (rel.first.type === 'var') {
      const varIndex = vars().indexOf(rel.first.name);
      first = table[varIndex][row];
    } else {
      first = evaluateRelation(rel.first, table, row);
    }

    if (rel.last.type === 'var') {
      const varIndex = vars().indexOf(rel.last.name);
      last = table[varIndex][row];
    } else {
      last = evaluateRelation(rel.last, table, row);
    }

    return logic[rel.type](first, last);
  };

  const fillTable = (vars: string[], relations: Relation[]) => {
    const numRows = Math.pow(2, relations.length + vars.length);
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

  const relationsEqual = (rel1: Relation | Variable, rel2: Relation | Variable): boolean => {
    if (rel1.type !== rel2.type) return false;
    if (rel1.type === 'var' || rel2.type === 'var') {
      if ((rel1 as Variable).name !== (rel2 as Variable).name) return false;
      return true;
    }

    if (rel1.relatedVars.length !== rel2.relatedVars.length) return false;
    return relationsEqual(rel1.first, rel2.first) && relationsEqual(rel1.last, rel2.last);
  };

  const isUnique = (relations: Relation[], rel: Relation) => {
    for (let i = 0; i < relations.length; i++) {
      if (relationsEqual(relations[i], rel)) return false;
    }

    return true;
  };

  const deconstruct = (decons: Record<number, Relation>, relation: Relation) => {
    relation.relatedIds = [];

    if (relation.first.type !== 'var') {
      deconstruct(decons, relation.first);

      const shallowCopy = { ...relation.first };
      shallowCopy.deconId = deconId;

      if (isUnique(Object.values(decons), shallowCopy)) {
        decons[deconId] = shallowCopy;
      }

      relation.relatedIds.push(deconId);
      deconId++;
    }

    if (relation.last.type !== 'var') {
      deconstruct(decons, relation.last);

      const shallowCopy = { ...relation.last };
      shallowCopy.deconId = deconId;

      if (isUnique(Object.values(decons), shallowCopy)) {
        decons[deconId] = shallowCopy;
      }

      relation.relatedIds.push(deconId);
      deconId++;
    }
  };

  const deconstructMany = (relations: Relation[]) => {
    const res: Record<number, Relation> = {};

    relations.forEach((rel) => {
      deconstruct(res, rel);
    });

    return res;
  };

  createEffect(() => {
    deconId = 0;

    setDeconstructions(deconstructMany(relations()));
    fillTable(vars(), allRelations());
  });

  const addVariable = () => {
    if (varName().length === 0) return;
    setVars([...vars(), varName()]);
    setVarName('');
  };

  const handleSubmit = (rel: Relation, conclusion: boolean) => {
    const prevHasConclusion = hasConclusion();
    if (conclusion) setHasConclusion(conclusion);

    if (!prevHasConclusion) {
      setRelations((prev) => [...prev, rel]);
      return;
    }

    if (conclusion) {
      setRelations((prev) => {
        prev[prev.length - 1] = rel;
        return [...prev];
      });
    } else {
      setRelations((prev) => {
        const last = prev.splice(prev.length - 1)[0];
        prev.push(rel, last);
        return [...prev];
      });
    }
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
        relations={allRelations()}
        numDefined={relations().length}
        hasConclusion={hasConclusion()}
      />
      <CreateExpression
        vars={vars()}
        onSubmit={handleSubmit}
      />
    </main>
  );
};

export default App;
