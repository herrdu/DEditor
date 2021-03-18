import {Schema} from 'prosemirror-model';

export default function getTableNodeTypes(schema: Schema) {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes;
  }

  const roles: {[key: string]: any} = {};

  Object.keys(schema.nodes).forEach(type => {
    const nodeType = schema.nodes[type];

    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType;
    }
  });

  // eslint-disable-next-line
  schema.cached.tableNodeTypes = roles;

  return roles;
}
