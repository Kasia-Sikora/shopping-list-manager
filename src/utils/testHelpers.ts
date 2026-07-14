import type { List } from "../interfaces";
import type { DbAction } from "../services/interfaces";

export const makeList = (id: string, overrides: Partial<List> = {}): List => ({
  id,
  title: `List ${id}`,
  content: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const makeCreateAction = (id: string): DbAction => ({
  action: 'create',
  data: makeList(id),
});