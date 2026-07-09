import type { List } from '../interfaces';

export const resolveConflict = (local: List, remote: List): List => {
  if (local.updatedAt && remote.updatedAt) {
    return local.updatedAt > remote.updatedAt ? local : remote;
  }
  if (local.createdAt && remote.createdAt) {
    return local.createdAt > remote.createdAt ? local : remote;
  }

  throw Error("updatedAt or createdAt prop doesn't exist");
};
