import { UserAggregateState } from "./state";
import { AggregateReducers } from "@project/workers-es";
import { UserEvents } from "./events";

export const reducers: AggregateReducers<UserAggregateState, UserEvents> = {
  "user-created": (state, { aggregateId, payload: { name } }) => ({
    id: aggregateId,
    createdAt: Date.now(),
    name,
  }),
  "user-name-set": (state, { aggregateId, payload: { name } }) => ({
    ...state,
    name,
  }),
};
