import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './components/About';
import Home from './components/Home';
import { SidePanel } from './components/SidePanel.tsx';
import { Config } from './Config.ts';
import { PUPPETS } from './mocap/Puppet.ts';
import { Persist } from './Persist.ts';
import { StateSetter } from './StateSetter.ts';

const KEY_CONFIG = "cs-config";

function defaultConfig() {
  let cfg = new Config();
  cfg.diag = true;
  cfg.camera = true;
  cfg.smoothing = 0.5;
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
    // console.log("loaded config");
    // console.dir(cfg);
  }
  const [config, setConfig] = useState(cfg);
  // limit update frequency
  const MIN_UPDATE_MS = 300;
  let timeout: number | null = null;
  const safeStoreConfig = (cfg: Config): void => {
    if (timeout) {
      window.clearTimeout(timeout);
      timeout = null;
    }
    timeout = window.setTimeout(() => {
      // console.log("persisting config");
      Persist.store(KEY_CONFIG, cfg);
    }, MIN_UPDATE_MS);
  }
  const persistentSetConfig: StateSetter<Config> = value => {
    let v = (typeof value == "function") ? value(config) : value;
    safeStoreConfig(v);
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
      </Routes>
    </Router>
  );
}

export default App;
