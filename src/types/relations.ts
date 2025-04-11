export type RelationType = 'and' | 'or';

export type Variable = {
  type: 'var';
  name: string;
};

export type Relation = {
  related: string[];
  type: RelationType;
  first: Relation | Variable;
  last: Relation | Variable;
};
