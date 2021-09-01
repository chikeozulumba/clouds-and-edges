import { APIOperations } from "@project/shared/dist";
import { useAppState } from "../state/appState";
import { performRPCOperation } from "./performRPCOperation";

export const useRPCOperation = <TOperation extends APIOperations>(operation: TOperation) => {
  const [{ userId }] = useAppState();
  return performRPCOperation(operation, userId);
};