import React, { useState, useEffect, useRef } from "react";
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

function App() {
  const canvasRef = useRef(null);
  // const sceneRef = useRef(null);
  // const controlsRef = useRef(null);

  useEffect(() => {
    const canvas = document.getElementById("three-canvas");
    // const canvas = canvasRef.current;
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
    const renderer = new WebGLRenderer({ canvas: canvas, alpha: true });
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

    //Adjust the viewport to the size of the browser
    function handleResize() {
      camera.updateProjectionMatrix();
      camera.aspect = window.innerWidth / window.innerHeight;
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    //Sets up the IFC loading
    const ifcModels = [];
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath("../../wasm/");

    function handleFileChange(e) {
      const ifcURL = URL.createObjectURL(e.target.files[0]);
      ifcLoader.load(ifcURL, (ifcModel) => {
        ifcModels.push(ifcModel);
        scene.add(ifcModel);
      });
    }
    const input = document.getElementById("file-input");
    input.addEventListener("change", handleFileChange, false);

    // Sets up optimized picking
    ifcLoader.ifcManager.setupThreeMeshBVH(
      computeBoundsTree,
      disposeBoundsTree,
      acceleratedRaycast
    );

    const raycaster = new Raycaster();
    raycaster.firstHitOnly = true;
    const mouse = new Vector2();

    function cast(event) {
      // Computes the position of the mouse on the screen
      const bounds = canvas.getBoundingClientRect();

      const x1 = event.clientX - bounds.left;
      const x2 = bounds.right - bounds.left;
      mouse.x = (x1 / x2) * 2 - 1;

      const y1 = event.clientY - bounds.top;
      const y2 = bounds.bottom - bounds.top;
      mouse.y = -(y1 / y2) * 2 + 1;

      // Places it on the camera pointing to the mouse
      raycaster.setFromCamera(mouse, camera);

      // Casts a ray
      return raycaster.intersectObjects(ifcModels);
    }

    const output = document.getElementById("id-output");
    async function pick(event) {
      const found = cast(event)[0];
      if (found) {
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const ifc = ifcLoader.ifcManager;
        const id = ifc.getExpressId(geometry, index);
        const modelID = found.object.modelID;
        console.log(id);
        console.log(modelID);
        const props = await ifc.getItemProperties(modelID, id);
        output.innerHTML = JSON.stringify(props, null, 2);
      }
    }

    window.ondblclick = pick;

    // Creates subset material
    const preselectMat = new MeshLambertMaterial({
      transparent: true,
      opacity: 0.6,
      color: 0xff88ff,
      depthTest: false,
    });

    const ifc = ifcLoader.ifcManager;
    // Reference to the previous selection
    let highlightModel = { id: -1 };

    function highlight(event, material, model) {
      const found = cast(event)[0];
      if (found) {
        // Gets model ID
        model.id = found.object.modelID;

        // Gets Express ID
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const id = ifc.getExpressId(geometry, index);

        // Creates subset
        ifcLoader.ifcManager.createSubset({
          modelID: model.id,
          ids: [id],
          material: material,
          scene: scene,
          removePrevious: true,
        });
      } else {
        // Remove previous highlight
        ifc.removeSubset(model.id, scene, material);
      }
    }

    window.onmousemove = (event) =>
      highlight(event, preselectMat, highlightModel);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("change", handleFileChange);
      output.innerHTML = "None";
      renderer.dispose();
    };
  }, []);

  return (
    <div className="App">
      <div className="side-nav">
        <label htmlFor="file-input" className="nav-btn">
          <input
            type="file"
            id="file-input"
            accept=".ifc, .ifcXML, .ifcZIP"
            hidden
          />
          +
        </label>
        <button className="nav-btn">A</button>
        <button className="nav-btn">B</button>
        <button className="nav-btn">C</button>
      </div>
      <div className="message-container">
        <p className="message">Properties:</p>
        <pre className="message" id="id-output">
          None
        </pre>
      </div>
      <canvas id="three-canvas" ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
