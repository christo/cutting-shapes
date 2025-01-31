import {useState} from "react";
import {SidePanel} from './components/SidePanel.tsx';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Contact from './components/Contact';
import About from './components/About';
import {Config} from "./Config.ts";
import { PUPPETS } from './mocap/Puppet.ts';
import { Persist } from './Persist.ts';
import { StateSetter } from './StateSetter.ts';

const KEY_CONFIG = "cs-config";

function defaultConfig() {
  let cfg = new Config();
  cfg.diag = true;
  cfg.camera = true;
  cfg.smoothing = true;
  cfg.debug = true;
  return cfg;
}

function App() {

  let cfg = Persist.load<Config>(KEY_CONFIG);
  if (!cfg) {
    console.log("no persistent config, using default");
    cfg = defaultConfig();
    Persist.store(KEY_CONFIG, cfg);
  } else {
    console.log("loaded config");
    console.dir(cfg);
  }
  const [config, setConfig] = useState(cfg);
  const persistentSetConfig: StateSetter<Config> = value => {
    if (typeof value == "function") {
      console.log("set config via function");
      Persist.store(KEY_CONFIG, value(config));
    } else {
      console.log("set config via value");
      Persist.store(KEY_CONFIG, value); // TODO confirm we will get new config here
    }
    setConfig(value);
  }
  return (
    <Router>
      <div className="App">
        <SidePanel setConfig={persistentSetConfig} config={config} />
      </div>
      <Routes>
        <Route path="/" element={<Home config={config} />} />
        <Route path="/about" element={<About puppets={PUPPETS}/>} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
