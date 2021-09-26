import { createSimpleDb } from "@project/workers-es";

type Entities = {
  user: {
    id: string;
    name: string;
    activeMatches: number;
    color: string;
    avatar: string;
  };
};

export const createDb = (storage: DurableObjectStorage) => createSimpleDb<Entities>({ storage });

export type Db = ReturnType<typeof createDb>;
