import {useState} from 'react';
import {Box, Typography} from "@mui/material";
import {VideoCamera, VisionConsumer} from "../mocap/VideoCamera.tsx";

function mkPunterDetector(): VisionConsumer {
  return {
    video: async (_video: HTMLVideoElement, _startTimeMs: number, _deltaMs: number): Promise<void> => {
      //console.log(`consumeVideo: start ${startTimeMs}ms ${deltaMs} ms`);
      return Promise.resolve();
    },
    image: async (_image: HTMLImageElement): Promise<void> => {
      console.log(`consumeImage`);
      return Promise.resolve();
    }
  };
}

const Home = () => {

  const tempVc: VisionConsumer[] = [mkPunterDetector()];
  const [count, setCount] = useState(0);
  return (
    <div className="App-body">
      <Typography variant="h2">Cutting Shapes</Typography>
      <Box className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      </Box>
      <Box>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </Box>
      <Box sx={{border: "orange dotted thick", p: 5}}>
        <canvas id="main_view"></canvas>
        <VideoCamera consumers={tempVc}/>
      </Box>
    </div>
  );
};

export default Home;
