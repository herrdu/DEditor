import {NodeType, Node as ProseMirrorNode} from 'prosemirror-model';

export default function equalNodeType(nodeType: NodeType | NodeType[], node: ProseMirrorNode) {
  return (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) || node.type === nodeType;
}
