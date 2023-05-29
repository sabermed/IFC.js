import { Raycaster, Vector2 } from "three";

export default function cast(event, canvas, camera, ifcModels) {
  const raycaster = new Raycaster();
  raycaster.firstHitOnly = true;
  const mouse = new Vector2();
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
