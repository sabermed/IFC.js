import cast from "./Cast";

export default function highlight(
  event,
  canvas,
  camera,
  material,
  model,
  ifcLoader
) {
  const ifc = ifcLoader.ifcManager;
  const found = cast(event, canvas, camera, ifcModels)[0];
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
