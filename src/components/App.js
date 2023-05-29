import React, { useEffect, createRef, useRef, useState } from "react";
import "./App.css";
import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  Raycaster,
  Vector2,
  WebGLRenderer,
  MeshLambertMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";
import { IfcContainer } from "./IfcContainer";

export default function App() {
  const ifcContainer = createRef();
  const [canvas, setCanvas] = useState();
  const [camera, setCamera] = useState();
  const [sceneState, setScene] = useState();
  const [rendererState, setRenderer] = useState();
  const [ifcLoader, setIfcLoader] = useState();
  const [ifcModels, setIfcModels] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isClippingPaneSelected, setClippingPaneSelected] = useState(false);
  const [ifcLoadingErrorMessage, setIfcLoadingErrorMessage] = useState();

  useEffect(() => {
    if (ifcContainer.current) {
      const canvas = ifcContainer.current;

      //Creates the Three.js scene
      const scene = new Scene();
      //Creates the camera (point of view of the user)
      const camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight
      );
      camera.position.z = 15;
      camera.position.y = 13;
      camera.position.x = 8;

      //Creates the lights of the scene
      const lightColor = 0xffffff;

      const ambientLight = new AmbientLight(lightColor, 0.5);
      scene.add(ambientLight);

      const directionalLight = new DirectionalLight(lightColor, 1);
      directionalLight.position.set(0, 10, 0);
      directionalLight.target.position.set(-5, 0, 0);
      scene.add(directionalLight);
      scene.add(directionalLight.target);

      //Sets up the renderer, fetching the canvas of the HTML
      const renderer = new WebGLRenderer({
        canvas: canvas,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      //Creates grids and axes in the scene
      const grid = new GridHelper(50, 30);
      scene.add(grid);

      const axes = new AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 1;
      scene.add(axes);

      //Creates the orbit controls (to navigate the scene)
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.target.set(-2, 0, 0);

      //Animation loop
      const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      //Sets up the IFC loading
      const ifcLoader = new IFCLoader();
      ifcLoader.ifcManager.setWasmPath("../../wasm/");

      // Sets up optimized picking
      ifcLoader.ifcManager.setupThreeMeshBVH(
        computeBoundsTree,
        disposeBoundsTree,
        acceleratedRaycast
      );

      // change state
      setRenderer(renderer);
      setScene(scene);
      setIfcLoader(ifcLoader);
      setCamera(camera);
      setCanvas(canvas);

      //Adjust the viewport to the size of the browser
      function handleResize() {
        camera.updateProjectionMatrix();
        camera.aspect = window.innerWidth / window.innerHeight;
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", handleResize);
    }
  }, []);

  const ifcOnLoad = async (e) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (file && ifcLoader) {
      // reset
      setIfcLoadingErrorMessage("");
      setLoading(true);

      // load file
      const ifcURL = URL.createObjectURL(file);
      await ifcLoader.load(
        ifcURL,
        (ifcModel) => {
          setIfcModels((prev) => [...prev, ifcModel]);
          sceneState.add(ifcModel);
        },
        ifcOnLoadError
      );

      // update information
      setLoading(false);
    }
  };

  const ifcOnLoadError = async (err) => {
    setLoading(false);
    setIfcLoadingErrorMessage(err.toString());
  };

  return (
    <>
      <IfcContainer
        ref={ifcContainer}
        canvas={canvas}
        scene={sceneState}
        camera={camera}
        renderer={rendererState}
        ifcLoader={ifcLoader}
        ifcModels={ifcModels}
      />
      {isLoading ? (
        <div style={{ position: "absolute", top: "50%", left: "50%" }}>
          loading....
        </div>
      ) : null}
      <div className="side-nav">
        <label htmlFor="file-input" className="nav-btn">
          <input
            type="file"
            id="file-input"
            accept=".ifc"
            onChange={ifcOnLoad}
            hidden
          />
          +
        </label>
        <button className="nav-btn">//</button>
        <button className="nav-btn">--</button>
        <button className="nav-btn">C</button>
      </div>
    </>
  );
}
