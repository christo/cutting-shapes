
# Cutting Shapes

Interactive art installation with motion capture. People moving in the camera
field control humanoid figures on the projector screen which composites these with
visual effects and interactive elements.

## How to Run

### Install dependencies
`bun install`

### Check Prettier
`bun run prettier`

### Format code using Prettier
`bun run format-code`

### Run Linter
`bun run lint`

### Start locally
`bun run dev`
* Open your browser and go to `http://localhost:5173` to see the application running

## TODO

* [x] `bun test` on github
* [ ] faster on-screen composition control (switches for each view already in the space-bar side panel)
  * [ ] single-key shortcuts per view: bespoke, camera, diagnostics text, mesh
  * [ ] minimalist on-screen buttons, hidden in show mode
  * [ ] presets, e.g. show (bespoke only) and dev (everything)
* [ ] obs integration MVP to evaluate easy scene composition
  * [ ] server: pass `OBS_PASSWORD` from `server/.env` to `obs.connect` (currently unused)
  * [ ] find previous OBS scenes
  * obs scene rotation
  * obs scene control integration
  * how does obs load interact with GPU for vision?
* [ ] read https://temugeb.github.io/python/computer_vision/2021/09/14/bodypose3d.html
* [x] multiple figures (1 or 2)
* figure out:
  * [ ] camera dimensions / aspect ratio
  * [ ] render canvas dimensions and aspect ratio
  * [ ] composited scene dimensions (can be larger)
  * [ ] how to do camera adjustment to ensure camera field is in desired hot box
* [ ] test scene with more than two people (or more than max if max is greater than two):
  * [ ] how stable is the choice of which one or two people are tracked?
  * [ ] how to indicate that the person being tracked has changed
  * [ ] how to smooth transition between vastly different poses?
    * e.g. puff of smoke, disappear/reappear, zoom in etc.
* [ ] transport controls: live, browse (server-side videos), record, play, pause, stop
  * [ ] record only on live source; no pause on live; source locked while recording; all disabled while saving
  * [ ] file playback loops
  * [ ] mode -> enabled buttons defined in one colocated table in code
  * [ ] keyboard shortcuts: L live, O browse, R record, Space / K play/pause, S stop; also hardware media keys
    * [x] move side panel key from Space to backtick
    * Esc kept free to exit fullscreen
    * avoid keys planned for composition view shortcuts
* [ ] fullscreen, no scrollbars; F toggles fullscreen
  * [ ] show on mouse move, hide after idle timeout (not while hovered / browsing); hide cursor too
  * [ ] recording indicator: controls hidden = small red dot in corner; shown = red record symbol + elapsed timer
* [ ] video recording: record raw camera input, save to configured recordings folder on server
  * [x] `RECORDINGS_DIR` in `server/.env` (bun auto-loads); commit `server/.env.example`
  * [x] timestamp filenames, e.g. `2026-11-24T14-03-22.webm`
* [ ] upload video files from client to recordings folder
  * [ ] `MediaRecorder` on camera stream, high bitrate, camera's negotiated res/fps
  * [ ] audio (incidental testimonial commentary): request mic separately so camera still works if mic denied/absent
  * [ ] mute button, when recording UI is designed
  * [ ] playback muted by default (autoplay policy)
  * [x] server remuxes webm (`ffmpeg -c copy`) so it is seekable
* [x] video playback: video file as input source (see SettingsPanel TODO)
  * [x] same `<video>` element via `src` instead of `srcObject`, rest of pipeline unchanged
* [ ] motion recording and playback: joint positions per frame
  * [ ] replay recorded joint positions in tests through `PoseSystem` / `BespokeRenderer` (coverage, swallowed pose bug)
* [ ] deployment perf benchmark: find cheapest viable install hardware (raspi, old laptop, passive intel box)
  * [ ] prerequisites: video recording + playback, motion recording, above
  * [ ] capture test videos with video recording: 0, 1, 2, 3+ people; known person count per segment; one still-pose clip
  * [ ] benchmark mode: play test video set, auto-log
    * [ ] 1 warm-up pass per video x model (discarded: model load, shader compile, JIT, GPU clock ramp), then 5 recorded runs; report median + spread across runs; add runs if spread is wide
    * [ ] accuracy (frame-stepped) runs: 2 per combo, 2nd confirms determinism
    * [ ] soak run: 1 x 60 min loop per machine, heaviest viable combo (thermal throttling, leaks)
    * [ ] matrix: each video x each model variant (lite, full, heavy)
  * [ ] live mode: log same stats from camera input during normal running
  * [ ] bucket all stats by detected skeleton count
  * [ ] metrics
    * [ ] latency: frame capture to drawn, via `requestVideoFrameCallback` metadata
    * [ ] glass-to-glass latency (camera mode only): film LED + screen with phone slow-mo
    * [ ] vision / transform / render ms (existing `PerfTime`)
    * [ ] p50 / p95 / p99 / max + jitter, not just mean
    * [ ] vision Hz vs camera fps vs display refresh; dropped/duplicate frames
    * [ ] long tasks (`PerformanceObserver` `longtask`)
    * [ ] JS heap over time (leak check, multi-hour runs)
    * [ ] render errors (swallowed pose bug)
    * [ ] CPU %, RAM, CPU/GPU temp, clock throttling over long run (passive cooling)
    * [ ] power draw (external meter)
    * [ ] startup: time to first pose (model load)
  * [ ] accuracy (per model variant, test videos only)
    * [ ] frame-stepped mode: process every video frame, not realtime, so all machines/models see the same frames
    * [ ] save per-frame landmarks to server, compute accuracy offline (reuse motion recording format)
    * [ ] skeleton count vs known count; dropouts (frames with person missing)
    * [ ] ID swaps
    * [ ] jitter: landmark movement on still-pose clip
    * [ ] heavy model on fast machine as reference: per-joint error vs reference, normalised by torso length (PCK)
    * [ ] later, if needed: hand-annotate sample frames as true ground truth (e.g. CVAT)
  * [ ] context logged per run: client + server stats both, together = full perf profile (usually same machine)
    * [ ] front end: UA, browser version, WebGL renderer string, MediaPipe delegate (GPU/CPU), model variant, numPoses, `hardwareConcurrency`, `deviceMemory`, screen res / DPR / refresh, canvas size
    * [ ] camera: device label, negotiated res/fps (`track.getSettings()`)
    * [ ] back end (bun server): CPU model/cores, RAM, GPU, OS/kernel, power mode, git commit
  * [ ] client POSTs results, server saves them (JSONL per run)
* [ ] collect perf results across machines into comparison table
* deployment test on candidate installation machines
  * external camera
  * raspi 4 test
  * low-end box with integrated gpu
  * computer must fit in protective housing with thermal exhaust and weather protection
    although this may not be the same box as the camera
* developer config
* remote monitoring/config
* automatic startup / shutdown
* OBS scenes
  * formation figure replication (V shape)
  * motion echo
  * delay trail
  * brady-bunch grid
* scene definition
* figure rendering alternatives
* camera test
  * logitech
  * go pro
  * ?
* specific testing
  * dark test - sufficient lighting
    * ground rope lights in front of subjects
    * side key lights
    * prevent light spill direct into camera
  * power loss test
  * resolution test - performance impact
* gear checklist
  * black semi-transparent screen (from photosynthesiser)
  * white projection screen sheet
  * projector (borrow? hire?)
  * hdmi cables
  * screen poles
  * tie-down ropes/straps
  * heavy anchor pegs
  * hdmi capture (2-computer setup) or network stream
  * wifi base station (for mobile web controller)
  * on-site repair hardware and tools
  * rope lights
  * tape, clamps, pole stands, light guards, tarps, tent poles
  * road cases, bags
  * labels, pens, velcro straps, adapters
  * small tent for storage
  * padlocks for peli cases
* installation plan:
  * power board, access,
  * which projector?
    * hire
    * buy
    * borrow
  * screen - size, fixture, material, height
  * facing screen ignoring camera position, does the POV make sense?
  * cooling
  * weather safety
  * projector + camera + computer in one box?
  * evaluate rear projection
  * evaluate laser projector (hire?)
  * housing design
    * ground below screen?
    * overhead truss short throw projector
      * camera with projector?
      * where does computer go?
    * rear vs front projection?
    * gazebo?
    * rain proofing
    * wind proofing
  * back of subject semi-transparent black screen to obscure crowd from camera field
  * subject lighting
  * dance floor should be robust against mud!
* configuration
  * point of view translation
  * continuity loss smoothing
  * chromakey for compositing background separately?
* visual effects
  * particles - sparks, confetti, butterflies, blossoms, bubbles
    * https://doc.babylonjs.com/features/featuresDeepDive/mesh/trailMesh/
    * https://doc.babylonjs.com/features/featuresDeepDive/particles/
    * https://doc.babylonjs.com/features/featuresDeepDive/physics/
    * https://doc.babylonjs.com/features/featuresDeepDive/animation/animation_introduction/
  * on fire
  * footfall splash / radial emission
  * god rays
  * fat outline
  * dayglo pastel halftone overlay
  * physics sim:
    * hairy suit, fringing
    * tail
    * flowtoy stream
    * blobby costume
  * pulsing / morphing
  * plasma goo
  * physiological distortion transform
  * motion transform - amplification
  * translation detection - moonwalk, background tracking
  * hats, costumes, characters, "filters"
* different models:
  * silhouette
  * pose estimation
  * multi-figure vs single?
  * detect hotspot
  * key pose detection for interaction trigger
* 3d model rendering
* 3d scene test
* 3d engine evaluation - performance on deployment target
* beat detection
* fault detection, auto restart
* capture wifi access point
* event styling
* logging
  * events
  * faults
  * stats
  * performance
* create redundancy checklist
* [ ] https://github.com/SnowdenWintermute/babylonjs-modular-characters-proof-of-concept and
    https://www.youtube.com/watch?v=bjBzns0KOws

## Scene Ideas

* Moon
* Space station
* Hyperspace
* Jackson 5 feedback void
* virtual space
* jungle (maybe alien planet)
* under the ocean
* shrunken people on a desk
* Lego Land
* beach

## Notes

* 3d model formats
  * VRM format is popular for V-tubers: https://sketchfab.com/search?q=tag%3Avrm&sort_by=-likeCount&type=models
    * https://doc.babylonjs.com/communityExtensions/Babylon.js+ExternalLibraries/BabylonJS_and_VRM/ https://github.com/virtual-cast/babylon-vrm-loader "supports .vrm and .vci file loading"
  * gltf (text) and glb (binary) are supported by babylonjs
  * fbx is a popular proprietary format not directly supported for loading at runtime. The editor supports loading it and it can be transformed with an npm module, blender or "Mixamo" according to this: https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter/
  * "MMD is a Japanese 3D animation creation software that has its own 3D model format, PMD/PMX, and motion formats, VPD and VMD." https://doc.babylonjs.com/communityExtensions/mmdLoader

## References

* https://mediapipe-studio.webapps.google.com/demo/pose_landmarker
* https://devpost.com/software/boxing-simulator
* https://playground.babylonjs.com/#ZZUZEG detect poses and render key points in babylon
* [ ] check phantom dev:
  * https://github.com/phantom-software-AZ
  * [ ] https://github.com/phantom-software-AZ/v3d-web?tab=readme-ov-file
  * [ ] https://www.phantom-dev.com/demo
* 3d character sources [models.md](./models.md)


