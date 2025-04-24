import { createEffect, createSignal } from 'solid-js';
import Input from '@/components/input';
import Button from '@/components/button';
import { ChangeEvent } from '@/types/input';
import Table from '@/components/table';
import { Relation, Variable } from './types/relations';
import { deepCopy, logic } from './lib/utils';
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

  const [tempRelation, setTempRelation] = createSignal<Relation | null>(null);
  const [showingCreate, setShowingCreate] = createSignal(false);
  const [hasConclusion, setHasConclusion] = createSignal(false);
  const [deconstructions, setDeconstructions] = createSignal<Record<number, Relation>>({});
  const [table, setTable] = createSignal<boolean[][]>([]);
  const [varName, setVarName] = createSignal('');
  const [editIndex, setEditIndex] = createSignal<number | null>(null);

  let deconId = 0;

  const isEditing = () => editIndex() !== null;

  const allRelations = () =>
    Object.entries(deconstructions())
      .sort((a, b) => +a[0] - +b[0])
      .map((item) => item[1])
      .concat(...relations());

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.slice(0, 1);
    e.currentTarget.value = value;
    setVarName(value);
  };

  const evaluateRelation = (rel: Relation, table: boolean[][], row: number): boolean => {
    let first = false;
    let last = false;

    if (rel.first?.type === 'var') {
      const varIndex = vars().indexOf(rel.first.name);
      first = table[varIndex][row];
    } else if (rel.first) {
      first = evaluateRelation(rel.first, table, row);
    }

    if (rel.last?.type === 'var') {
      const varIndex = vars().indexOf(rel.last.name);
      last = table[varIndex][row];
    } else if (rel.last) {
      last = evaluateRelation(rel.last, table, row);
    }

    return logic[rel.type](first, last);
  };

  const fillTable = (vars: string[], relations: Relation[]) => {
    const numRows = Math.pow(2, vars.length);
    const table: boolean[][] = Array(relations.length + vars.length)
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

  const relationsEqual = (rel1?: Relation | Variable, rel2?: Relation | Variable): boolean => {
    if (rel1 === undefined && rel2 === undefined) return true;
    if (!rel1 || !rel2) return false;

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

    if (relation.first && relation.first.type !== 'var') {
      deconstruct(decons, relation.first);

      const shallowCopy = { ...relation.first };
      shallowCopy.deconId = deconId;

      if (isUnique(Object.values(decons), shallowCopy)) {
        decons[deconId] = shallowCopy;
      }

      relation.relatedIds.push(deconId);
      deconId++;
    }

    if (relation.last && relation.last.type !== 'var') {
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
    if (vars().includes(varName())) return;
    if (varName().length === 0) return;
    setVars([...vars(), varName()]);
    setVarName('');
  };

  const handleSubmit = (conclusion: boolean) => {
    const rel = tempRelation();
    if (!rel) return;

    const prevHasConclusion = hasConclusion();
    if (conclusion) setHasConclusion(conclusion);

    if (!prevHasConclusion) {
      setRelations((prev) => {
        const index = editIndex();

        if (index !== null) {
          prev[index] = rel;

          if (conclusion) {
            const temp = prev[index];
            prev[index] = prev[prev.length - 1];
            prev[prev.length - 1] = temp;
          }
        } else {
          return [...prev, rel];
        }

        return [...prev];
      });

      return;
    }

    const index = editIndex();

    if (index !== null) {
      if (conclusion) {
        setRelations((prev) => {
          prev[index] = rel;
          const temp = prev[index];
          prev[index] = prev[prev.length - 1];
          prev[prev.length - 1] = temp;
          return [...prev];
        });
      } else {
        setRelations((prev) => {
          prev[index] = rel;
          return [...prev];
        });

        if (index === relations().length - 1) {
          setHasConclusion(false);
        }
      }
    } else {
      setRelations((prev) => {
        if (!hasConclusion()) {
          prev.push(rel);
        } else {
          const last = prev.splice(prev.length - 1)[0];
          prev.push(rel, last);
        }

        return [...prev];
      });
    }

    setTempRelation(null);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setTempRelation(deepCopy(relations()[index]));
    setShowingCreate(true);
  };

  const removeRelation = (index: number) => {
    const editIdx = editIndex();
    if (editIdx && index < editIdx) {
      setEditIndex((prev) => (prev !== null ? prev - 1 : prev));
    }

    setRelations((prev) => {
      prev.splice(index, 1);
      return [...prev];
    });
  };

  const isRelated = (rel: Relation, varName: string): boolean => {
    if (rel.relatedVars.includes(varName)) return true;

    let first = false;
    let last = false;

    if (rel.first && rel.first.type !== 'var') first = isRelated(rel.first, varName);
    if (rel.last && rel.last?.type !== 'var') last = isRelated(rel.last, varName);

    return first || last;
  };

  const removeVar = (index: number) => {
    const v = vars()[index];
    setRelations((prev) => prev.filter((rel) => !isRelated(rel, v)));
    setVars((vars) => {
      vars.splice(index, 1);
      return [...vars];
    });
    setTempRelation(null);
  };

  const handleSetShowing = (showing: boolean) => {
    if (!showing && isEditing()) setEditIndex(null);
    setShowingCreate(showing);
  };

  const copyRelation = (index: number) => {
    setTempRelation(deepCopy(relations()[index]));
    setShowingCreate(true);
  };

  return (
    <main class="p-4 flex flex-col gap-12">
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
        editRelation={handleEdit}
        removeRelation={removeRelation}
        removeVar={removeVar}
        copyRelation={copyRelation}
      />
      <CreateExpression
        vars={vars()}
        onSubmit={handleSubmit}
        relation={tempRelation()}
        setRelation={(rel) => setTempRelation(rel)}
        showing={showingCreate()}
        setShowing={handleSetShowing}
        editIndex={editIndex()}
        hasConclusion={hasConclusion()}
        numRelations={relations().length}
      />
    </main>
  );
};

export default App;
