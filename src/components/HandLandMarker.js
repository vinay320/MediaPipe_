import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const HandLandMarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    // path/to/wasm/root
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
         delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });


  return handLandmarker;
};

export default HandLandMarker;
