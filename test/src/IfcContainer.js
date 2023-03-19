import React, { useEffect, createRef, useState, forwardRef } from "react";

import { Popover, Grid, Typography } from "@mui/material";

import { IFCSLAB } from "web-ifc";
import { IfcViewerAPI } from "web-ifc-viewer";

// interface IfcRecord {
//   [key: string]: string;
// }

// interface IfcContainerProps {
//   viewer?: IfcViewerAPI;
// }
const IfcContainer = forwardRef((props, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [curIfcRecords, setIfcRecords] = useState();

  const viewer = props.viewer;
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const ifcOnClick = async (event) => {
    if (viewer) {
      const result = await viewer.IFC.pickIfcItem(true);
      if (result) {
        const props = await viewer.IFC.getProperties(
          result.modelID,
          result.id,
          false
        );
        console.log(props);
        const type = await viewer.IFC.loader.ifcManager.getIfcType(
          result.modelID,
          result.id
        );
        // convert props to record
        if (props) {
          let ifcRecords = {};
          ifcRecords["Entity Type"] = type;
          ifcRecords["GlobalId"] = props.GlobalId && props.GlobalId?.value;
          ifcRecords["Name"] = props.Name && props.Name?.value;
          ifcRecords["ObjectType"] =
            props.ObjectType && props.ObjectType?.value;
          ifcRecords["PredefinedType"] =
            props.PredefinedType && props.PredefinedType?.value;
          setIfcRecords(ifcRecords);
        }

        setAnchorEl(event.target);
      }
    }
  };

  const ifcOnRightClick = async () => {
    if (viewer) {
      viewer.clipper.deleteAllPlanes();
      viewer.clipper.createPlane();
    }
  };

  return (
    <>
      <div
        className={"ifcContainer"}
        ref={ref}
        onDoubleClick={ifcOnClick}
        onContextMenu={ifcOnRightClick}
        onMouseMove={viewer && (() => viewer.IFC.selector.prePickIfcItem())}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Grid container component="dl" spacing={2} sx={{ p: 2 }}>
          <Grid item>
            {curIfcRecords &&
              Object.keys(curIfcRecords).map(
                (key) =>
                  curIfcRecords[key] && (
                    <React.Fragment key={key}>
                      <Typography component="dt" variant="body2">
                        {key}
                      </Typography>
                      <Typography sx={{ pb: 1 }} component="dd">
                        {curIfcRecords[key]}
                      </Typography>
                    </React.Fragment>
                  )
              )}
          </Grid>
        </Grid>
      </Popover>
    </>
  );
});

export { IfcContainer };
