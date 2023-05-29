// Delete Measurements
export function deleteMeasurements(scene) {
  let e = document.querySelectorAll(".measurementLabel");
  e.forEach((tag) => {
    tag.innerHTML = "";
  });
  scene.traverse(function (child) {
    if (child.isLineSegments) {
      if (child.name == "measurementLine") {
        scene.remove(child);
      }
    }
  });
}
