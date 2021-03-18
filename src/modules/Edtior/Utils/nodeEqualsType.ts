import {Node as PMNode, NodeType} from 'prosemirror-model';

export default function nodeEqualsType({types, node}: {types: NodeType | NodeType[]; node: PMNode}) {
  return (Array.isArray(types) && types.includes(node.type)) || node.type === types;
}
