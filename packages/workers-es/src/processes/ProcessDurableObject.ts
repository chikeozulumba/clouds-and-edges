import { RPCDurableObject } from "../durableObjects/RPCDurableObject";
import { findInObj, getLogger, Logger } from "@project/essentials";
import { RPCApiHandler, RPCHandler } from "../durableObjects/rpc";
import { createDurableObjectRPCProxy } from "../durableObjects/createDurableObjectRPCProxy";
import { BaseEventStore } from "../events/BaseEventStore";
import { EventInput, StoredEvent } from "../events/events";
import { Command } from "../commands/commands";
import {
  ProcessAdminState,
  ProcessEventHandler,
  ProcessEventHandlers,
  processUserId,
} from "./processes";
import { executeCommand } from "../commands/executeCommand";
import { Env } from "../env";
import { System } from "../system/system";

export type ProcessDurableObjectAPI = {
  onEvent: {
    input: {
      event: StoredEvent;
    };
    output: {};
  };
  getAdminState: {
    input: {};
    output: ProcessAdminState;
  };
  getStorageContents: {
    input: {};
    output: {
      contents: Record<string, unknown>;
    };
  };
  rebuild: {
    input: {};
    output: {};
  };
};

type API = ProcessDurableObjectAPI;

export class ProcessDurableObject<TEnv = Env>
  extends RPCDurableObject<TEnv>
  implements RPCApiHandler<API>
{
  protected logger: Logger;
  protected storage: DurableObjectStorage;

  protected adminState: ProcessAdminState = {
    status: "not-built",
  };

  constructor(
    protected objectState: DurableObjectState,
    protected handlers: ProcessEventHandlers,
    protected env: Env,
    protected system: System
  ) {
    super();
    this.storage = objectState.storage;
    this.logger = getLogger(`${this.constructor.name}`);
  }

  protected async init() {
    const stored: ProcessAdminState = await this.storage.get("adminState");
    this.adminState = stored ?? this.adminState;
  }

  onEvent: RPCHandler<API, "onEvent"> = async ({ event }) => {
    this.logger.debug(`handling event`, event);

    const handler: ProcessEventHandler = findInObj(this.handlers, event.kind);
    if (!handler) {
      this.logger.debug(`Process unable to handle event '${event.kind}'`);
      return {};
    }

    await handler({
      event: event as any,
      storage: this.storage,
      effects: {
        executeCommand: async (command) =>
          executeCommand({
            env: this.env,
            command,
            userId: processUserId,
            system: this.system,
          }),
      },
    });

    return {};
  };

  getAdminState: RPCHandler<API, "getAdminState"> = async ({}) => {
    return this.adminState;
  };

  getStorageContents: RPCHandler<API, "getStorageContents"> = async ({}) => {
    return {
      contents: await this.storage.list().then(Object.fromEntries),
    };
  };

  rebuild: RPCHandler<API, "rebuild"> = async ({}) => {
    this.logger.debug(`rebuilding..`);
    await this.storage.deleteAll();

    this.adminState = {
      status: "building",
    };
    await this.storage.put("adminState", this.adminState);

    // This should be done as a cronjob response
    const doRebuild = async () => {
      // Without waiting for the response lets rebuild, hopefully this promise isnt killed..
      const { events } = await this.system.getEventStore(this.env).getEvents({});
      for (let event of events) await this.onEvent({ event });
    };

    await doRebuild();

    this.adminState = {
      status: "built",
    };
    await this.storage.put("adminState", this.adminState);

    return {};
  };
}