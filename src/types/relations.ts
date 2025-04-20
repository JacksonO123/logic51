export const relations = ['and', 'or', 'if'] as const;

export type RelationType = (typeof relations)[number];

export type BlockTypes = RelationType | 'var';

export type DraggableType = RelationType | `var-${string}`;

export type PathType = 'first' | 'last';

export type Variable = {
  type: 'var';
  name: string;
};

export type Relation = {
  relatedVars: string[];
  relatedIds: number[];
  deconId?: number;
  type: RelationType;
  first: Relation | Variable;
  last: Relation | Variable;
};

export type CreatingRelation = Omit<Relation, 'first' | 'last'> & {
  first?: CreatingRelation | Variable;
  last?: CreatingRelation | Variable;
};
