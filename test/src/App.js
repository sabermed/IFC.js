import React, { useEffect, createRef, useState } from "react";

import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import { Color } from "three";
import {
  Alert,
  Backdrop,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  CircularProgress,
  CssBaseline,
  IconButton,
  Toolbar,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  FolderOpenOutlined,
  CompareArrowsSharp,
  HelpOutline,
  GitHub,
} from "@mui/icons-material";

import { IfcViewerAPI } from "web-ifc-viewer";
import { IfcContainer } from "./IfcContainer";

// interface AppBarProps extends MuiAppBarProps {
//   open?: boolean;
// }

function App() {
  const theme = useTheme();

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [isClippingPaneSelected, setClippingPaneSelected] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const ifcContainer = createRef();
  const [viewer, setViewer] = useState();
  const [ifcLoadingErrorMessage, setIfcLoadingErrorMessage] = useState();

  const drawerWidth = 240;

  const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  });

  const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
  });

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

  useEffect(() => {
    if (ifcContainer.current) {
      const container = ifcContainer.current;
      const ifcViewer = new IfcViewerAPI({
        container,
        backgroundColor: new Color(0xffffff),
      });
      ifcViewer.addAxes();
      ifcViewer.addGrid();
      ifcViewer.IFC.loader.ifcManager.applyWebIfcConfig({
        COORDINATE_TO_ORIGIN: true,
        USE_FAST_BOOLS: false,
      });
      setViewer(ifcViewer);
    }
  }, []);

  const ifcOnLoad = async (e) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (file && viewer) {
      // reset
      setIfcLoadingErrorMessage("");
      setLoading(true);

      // load file
      const model = await viewer.IFC.loadIfc(file, true, ifcOnLoadError);
      await viewer.shadowDropper.renderShadow(model.modelID);

      // update information
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const ifcOnLoadError = async (err) => {
    setIfcLoadingErrorMessage(err.toString());
  };

  const toggleClippingPlanes = () => {
    if (viewer) {
      viewer.toggleClippingPlanes();
      if (viewer.clipper.active) {
        setClippingPaneSelected(true);
      } else {
        setClippingPaneSelected(false);
      }
    }
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={isDrawerOpen}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setDrawerOpen(true)}
              edge="start"
              sx={{
                marginRight: "36px",
                ...(isDrawerOpen && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              React IFC Viewer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={isDrawerOpen}>
          <DrawerHeader>
            <IconButton onClick={() => setDrawerOpen(false)}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <input
              type="file"
              id="file"
              accept=".ifc"
              onChange={ifcOnLoad}
              style={{ display: "none" }}
            />
            <label htmlFor="file">
              <ListItem button key={"openFile"}>
                <ListItemIcon>
                  <FolderOpenOutlined />
                </ListItemIcon>
                <ListItemText primary={"Open File"} />
              </ListItem>
            </label>
            <ListItem
              button
              key={"showPlane"}
              onClick={() => toggleClippingPlanes()}
              selected={isClippingPaneSelected}
            >
              <ListItemIcon>
                <CompareArrowsSharp />
              </ListItemIcon>
              <ListItemText primary={"Clipping Planes"} />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button key={"About"} onClick={() => setDialogOpen(true)}>
              <ListItemIcon>
                <HelpOutline />
              </ListItemIcon>
              <ListItemText primary={"About"} />
            </ListItem>
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <DrawerHeader />
          <IfcContainer ref={ifcContainer} viewer={viewer} />
        </Box>
      </Box>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog onClose={() => setDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>About</DialogTitle>
        <DialogContent>
          <List dense>
            <ListItem>
              <ListItemText primary="right-click" secondary="Create a Plan" />
            </ListItem>
            <ListItem>
              <ListItemText primary="double-click" secondary="Pick an Item" />
            </ListItem>
          </List>
          <GitHub />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        {ifcLoadingErrorMessage ? (
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            Error loading the IFC File. Check the console for more information.
          </Alert>
        ) : (
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            IFC File loaded successfully!
          </Alert>
        )}
      </Snackbar>
    </>
  );
}

export { App };
