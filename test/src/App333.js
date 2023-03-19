import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { IFCLoader } from "web-ifc-three/IFCLoader";

function App() {
  const [file, setFile] = useState(null);
  const canvasRef = useRef(null);
  // const sceneRef = useRef(null);
  // const controlsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
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
    // const threeCanvas = document.getElementById("three-canvas");
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
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    //Sets up the IFC loading
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath("/wasm/");

    const input = document.getElementById("file-input");
    input.addEventListener(
      "change",
      (changed) => {
        const ifcURL = URL.createObjectURL(changed.target.files[0]);
        ifcLoader.load(ifcURL, (ifcModel) => scene.add(ifcModel));
      },
      false
    );
  }, []);

  return (
    <div className="App">
      <input
        type="file"
        id="file-input"
        onChange={(e) => setFile(e.target.files[0])}
        accept=".ifc, .ifcXML, .ifcZIP"
      />
      <canvas id="three-canvas" ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
