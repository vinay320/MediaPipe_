import React, { useEffect, useRef } from "react";
import HandLandMarker from "./components/HandLandMarker";
import { DrawingUtils, HandLandmarker as abc } from "@mediapipe/tasks-vision";

const App = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const inputVideoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const videoRef = inputVideoRef.current;
    let gesture = "";

    if (canvas) {
      contextRef.current = canvas.getContext("2d");
    }

    if (contextRef.current && canvas && videoRef) {
      createHandLandmarker().then((handLandmarker) => {
        console.log(handLandmarker);
        const drawingUtils = new DrawingUtils(contextRef.current);
        let lastVideoTime = -1;
        let results = undefined;

        function predict() {
          canvas.style.width = videoRef.videoWidth;
          canvas.style.height = videoRef.videoHeight;
          canvas.width = videoRef.videoWidth;
          canvas.height = videoRef.videoHeight;

          let startTimeMs = performance.now();
          if (lastVideoTime !== videoRef.currentTime) {
            lastVideoTime = videoRef.currentTime;
            results = handLandmarker.detectForVideo(videoRef, startTimeMs);
            console.log(results);
            // Perform gesture recognition
            const recognizedGesture = recognizeGesture(results);
            gesture = recognizedGesture ? recognizedGesture : "";
          }

          contextRef.current.save();
          contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
          if (results.landmarks) {
            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(landmarks, abc.HAND_CONNECTIONS, {
                color: "#FFF000",
                lineWidth: 5,
              });

              drawingUtils.drawLandmarks(landmarks, {
                color: "#00FF00",
                lineWidth: 5,
              });
            }
          }

          // Display recognized gesture
          contextRef.current.font = "30px Arial";
          contextRef.current.fillStyle = "#00FF00";
          contextRef.current.fillText(`Recognized Gesture: ${gesture}`, 10, 30);
          contextRef.current.restore();

          window.requestAnimationFrame(predict);
        }

        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          videoRef.srcObject = stream;
          videoRef.addEventListener("loadeddata", predict);
        });
      });
    }
  }, []);

  const createHandLandmarker = async () => {
    const handLandmarker = await HandLandMarker();
    return handLandmarker;
  };

  const recognizeGesture = (results) => {
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      
      

      if (landmarks.length >= 21) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

       

        const fingerTips = [thumbTip, indexTip, middleTip, ringTip, pinkyTip];
        

        const raisedThreshold = 0.06;
        

        const distances = fingerTips.map((fingerTip) => {
          const dx = fingerTip.x - thumbTip.x;
          const dy = fingerTip.y - thumbTip.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance;
        });
        
        const raisedFingers = distances.map(
          (distance) => distance > raisedThreshold
        );
        

        if (
          raisedFingers[1] &&
          !raisedFingers[2] &&
          !raisedFingers[3] &&
          !raisedFingers[4]
        ) {
          return "A";
        } else if (
          raisedFingers[1] &&
          !raisedFingers[2] &&
          !raisedFingers[3] &&
          raisedFingers[4]
        ) {
          return "I";
        } else if (
          raisedFingers[1] &&
          !raisedFingers[2] &&
          raisedFingers[3] &&
          !raisedFingers[4]
        ) {
          return "L";
        } else if (
          raisedFingers[1] &&
          raisedFingers[2] &&
          !raisedFingers[3] &&
          raisedFingers[4]
        ) {
          return "V";
        }else if (
          raisedFingers[1] &&
          raisedFingers[2] &&
          raisedFingers[3] &&
          !raisedFingers[4]
        ) {
          return "W";
        } else if (
          !raisedFingers[1] &&
          !raisedFingers[2] &&
          !raisedFingers[3] &&
          !raisedFingers[4]
        ) {
          return "O";
        } else {
          return "";
        }

        // console.log(raisedFingers[1]);
        // let sum =
        //   (raisedFingers[1] === true ? 1 : 0) +
        //   (raisedFingers[2] === true ? 1 : 0) +
        //   (raisedFingers[3] === true ? 1 : 0) +
        //   (raisedFingers[4] === true ? 1 : 0);
       
          
        // return sum;
      }

      
     
      
    }

    return "";
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <video
          id="webcam"
          style={{ position: "absolute" }}
          autoPlay
          playsInline
          ref={inputVideoRef}
        ></video>
        <canvas
          ref={canvasRef}
          id="output_canvas"
          style={{ position: "absolute", left: "0px", top: "0px" }}
        ></canvas>
      </div>
    </>
  );
};

export default App;
