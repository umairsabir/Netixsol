import { Schema, Document } from 'mongoose';

const deleteAtPath = (obj: any, path: string[], index: number) => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  deleteAtPath(obj[path[index]], path, index + 1);
};

const toJSON = (schema: Schema) => {
  let transform: any;
  if ((schema as any).options.toJSON && (schema as any).options.toJSON.transform) {
    transform = (schema as any).options.toJSON.transform;
  }

  schema.set('toJSON', {
    transform(doc: any, ret: any, options: any) {
      Object.keys(schema.paths).forEach((path) => {
        if ((schema.paths[path] as any).options && (schema.paths[path] as any).options.private) {
          deleteAtPath(ret, path.split('.'), 0);
        }
      });

      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      // Keep createdAt and updatedAt for display purposes (e.g., user join date)
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

export default toJSON;
