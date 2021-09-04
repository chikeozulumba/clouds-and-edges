import * as React from "react";
import { ProjectionKinds } from "@project/shared";
import { Button, VStack } from "@chakra-ui/react";
import { ConnectedInspectableStorage } from "../storage/ConnectedInspectableStorage";

interface Props {
  projection: ProjectionKinds;
}

export const ConnectedProjectionInfo: React.FC<Props> = ({ projection }) => {
  //const { rebuild, state, storageContents } = useProjectionAdmin(projection);

  //if (!state || !storageContents) return null;

  return (
    <VStack maxHeight={600} overflowY={"auto"}>
      <Button onClick={() => {}}>Rebuild</Button>
      <ConnectedInspectableStorage identifier={{ kind: "projection", name: projection }} />
    </VStack>
  );
};
