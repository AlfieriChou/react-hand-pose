import React, { useRef, useEffect } from 'react';
import '@tensorflow/tfjs-backend-webgl';
import * as handPose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';

import './App.css';

const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// const drawPoint = ({ y, x, r }, canvas) => {
//   canvas.beginPath();
//   canvas.arc(x, y, r, 0, 2 * Math.PI);
//   canvas.fill();
// };

const drawPath = (points, closePath, canvas) => {
  // eslint-disable-next-line no-undef
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  // eslint-disable-next-line arrow-parens
  points.forEach(point => {
    region.lineTo(point[0], point[1]);
  });
  if (closePath) {
    region.closePath();
  }
  canvas.stroke(region);
};

const drawKeyPoints = (keyPoints, canvas) => {
  // eslint-disable-next-line arrow-parens
  // keyPoints.forEach(keyPoint => {
  //   const y = keyPoint[0];
  //   const x = keyPoint[1];
  //   drawPoint({ x, y, r: 3 }, canvas);
  // });

  const fingers = Object.keys(fingerLookupIndices);
  // eslint-disable-next-line arrow-parens
  fingers.forEach(finger => {
    drawPath(fingerLookupIndices[finger].map(idx => keyPoints[idx]), false, canvas);
  });
};

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const detect = async (model) => {
    // eslint-disable-next-line semi
    const camInfo = webcamRef.current
    if (
      typeof camInfo !== 'undefined'
      && camInfo !== null
      && camInfo.video.readyState === 4
    ) {
      const { video } = camInfo;
      const { videoWidth, videoHeight } = video;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const canvas = canvasRef.current.getContext('2d');
      const predictions = await model.estimateHands(video);

      if (predictions.length) {
        const [{ landmarks }] = predictions;
        drawKeyPoints(landmarks, canvas);
      }
    }
  };

  const runCoco = async () => {
    const model = await handPose.load();
    setInterval(() => {
      detect(model);
    }, 100);
  };

  useEffect(() => { runCoco(); }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
