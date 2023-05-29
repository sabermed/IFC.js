import React, { useState, forwardRef } from "react";
import cast from "../functions/Cast";

const IfcContainer = forwardRef(
  ({ canvas, scene, camera, renderer, ifcLoader, ifcModels }, ref) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [curIfcRecords, setIfcRecords] = useState();
    const [mesaureOpen, setMesaureOpen] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);

    async function ifcOnDoubleClick(event) {
      const found = cast(event, canvas, camera, ifcModels)[0];
      if (found) {
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const ifc = ifcLoader.ifcManager;
        const id = ifc.getExpressId(geometry, index);
        const modelID = found.object.modelID;
        console.log(id);
        console.log(modelID);
        const props = await ifc.getItemProperties(modelID, id);
        console.log(props);
      }
    }

    return (
      <>
        <canvas
          className={"ifcContainer"}
          ref={ref}
          onDoubleClick={ifcOnDoubleClick}
        />
      </>
    );
  }
);

export { IfcContainer };
