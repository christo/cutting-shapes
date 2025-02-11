
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

* [ ] `bun test` on github
* [ ] obs integration MVP to evaluate easy scene composition
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
* deployment test on candidate installation machines
  * external camera
  * raspi 4 test
  * low-end box with integrated gpu
  * computer must fit in protective housing with thermal exhaust and weather protection
    although this may not be the same box as the camera
* motion recording and playback
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


