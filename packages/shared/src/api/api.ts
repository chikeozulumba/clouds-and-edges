import { Result } from "@project/essentials";
import { Projections } from "../projections/projections";
import { DurableObjectIdentifier, QueryStorageAPI } from "@project/workers-es";
import { StoredEvent } from "@project/workers-es";
import { AggregateKinds } from "../aggregates/aggregates";

export type API = {
  "projections.users.findUserById": Projections["users"]["findUserById"];
  "admin.queryStorage": {
    input: {
      identifier: DurableObjectIdentifier;
      input: QueryStorageAPI["input"];
    };
    output: QueryStorageAPI["output"];
  };
  "projections.proposals.getProposals": Projections["proposals"]["getProposals"];
  "event-store.events": {
    input: {};
    output: {
      events: StoredEvent[];
    };
  };
  "auth.signup": {
    input: {
      name: string;
    };
    output: {
      userId: string;
    };
  };
  command: {
    input: {
      aggregate: AggregateKinds;
      aggregateId?: string;
      command: string;
      payload: unknown;
    };
    output: Result<{
      aggregateId: string;
    }>;
  };
};

export type APIOperations = keyof API;

export type APIOperationInput<TOperation extends APIOperations> = API[TOperation]["input"];
export type APIOperationOutput<TOperation extends APIOperations> = API[TOperation]["output"];
