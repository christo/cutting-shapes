import {useState} from "react";
import {SidePanel} from './components/SidePanel.tsx';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Contact from './components/Contact';
import About from './components/About';
import {Config} from "./Config.ts";

function App() {

  const [config, setConfig] = useState(new Config());
  config.perf = true;
  config.camera = true;
  return (
    <Router>
      <div className="App">
        <SidePanel setConfig={setConfig} config={config} />
      </div>
      <Routes>
        <Route path="/" element={<Home config={config} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
