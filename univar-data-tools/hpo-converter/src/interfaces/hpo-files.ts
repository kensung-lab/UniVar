export interface HPOFile {
  graphs: Graph[];
}
export interface Graph {
  id: string;
  meta: Meta;
  nodes: Node[];
  edges: Edge[];
  propertyChainAxioms: PropertyChainAxiom[];
}
export interface PropertyChainAxiom {
  predicateId: string;
  chainPredicateIds: string[];
}
export interface Edge {
  sub: string;
  pred: string;
  obj: string;
}
export interface Node {
  id: string;
  lbl?: string;
  type?: string;
  meta?: Meta2;
}
export interface Meta2 {
  xrefs?: Xref[];
  basicPropertyValues?: BasicPropertyValue[];
  comments?: string[];
  definition?: Definition;
  synonyms?: Synonym[];
  subsets?: string[];
  deprecated?: boolean;
}
export interface Synonym {
  pred: string;
  val: string;
  synonymType?: string;
  xrefs?: string[];
}
export interface Definition {
  val: string;
  xrefs?: string[];
}
export interface Xref {
  val: string;
}
export interface Meta {
  basicPropertyValues: BasicPropertyValue[];
  version: string;
}
export interface BasicPropertyValue {
  pred: string;
  val: string;
}