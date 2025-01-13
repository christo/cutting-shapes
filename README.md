
# Cutting Shapes

Interactive art installation with motion capture. People moving in the camera
field control humanoid figures on the projector screen which composites these with
visual effects and interactive elements.

## TODO

* [ ] vertical slice
  * [ ] essential page elements
  * [ ] realtime mocap render default pose markers
  * animate custom stick figure puppet
  * multiple figures (1 or 2)
  * obs integration MVP to evaluate easy scene composition
* [ ] test scene with more than two people:
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
* obs integration for compositing
* formation figure replication (V shape)
* motion echo
* delay trail
* scene definition
* brady-bunch grid
* figure rendering alternatives
* camera test
  * logitech
  * go pro
  * ?
* x-flip (mirror mode)
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
  * projector (jasper? hire?)
  * hdmi cables
  * screen poles
  * tie-down ropes/straps
  * heavy anchor pegs
  * on-site repair hardware and tools
  * hdmi capture (2-computer setup) or network stream
  * wifi base station (for mobile web controller)
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
  * dance area should be robust against mud!
* configuration
  * point of view translation
  * continuity loss smoothing
  * chromakey for compositing background separately?
* visual effects
  * particles - sparks, confetti, butterflies, blossoms, bubbles
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
  * obs scene rotation
  * obs scene control integration
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
* event branding
* logging
  * events
  * faults
  * stats
  * performance
* create redundancy checklist

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

## References

* https://mediapipe-studio.webapps.google.com/demo/pose_landmarker
* https://devpost.com/software/boxing-simulator
* https://playground.babylonjs.com/#ZZUZEG
* [ ] check phantom dev:
  * https://github.com/phantom-software-AZ
  * [ ] https://github.com/phantom-software-AZ/v3d-web?tab=readme-ov-file
  * [ ] https://www.phantom-dev.com/demo
* 3d character sources:
  * https://www.cgtrader.com/rigged-3d-models
  * https://www.mixamo.com/#/?limit=96&page=1&type=Character
  * https://sketchfab.com/3d-models/teddy-bears-e84b12b4ac20402aaf4d40f2219cd0e2
  * https://sketchfab.com/3d-models/shy-leopard-hunter-hand-painted-5208a216aded482a893874f9f68d8037
  * https://sketchfab.com/3d-models/asset-cartoons-animal-pig-rig-3d-model-f2dd8a5f25824d81a52d59eef5966b60
  * https://sketchfab.com/3d-models/tripo-astronaut-2-stylized-and-animated-fe594ac4364942e8abad34744e507038
  * https://sketchfab.com/3d-models/gangster-mafia-pbr-game-ready-7cec2b8537e14591946189de222ace92
  * https://sketchfab.com/3d-models/hyper-casual-stickman-pack-fb97fbbf72b94713b14212f6550c5eae
  * https://sketchfab.com/3d-models/low-poly-falling-astronaut-3december-df27a4d72cc74c5080bb95289f5778ca
  * https://sketchfab.com/3d-models/astro13-shoot-b78b1f5c5815452d91e0fdfdabdcebc5
  * https://sketchfab.com/3d-models/puffin-64f8d2ee800b48cf97a1489546f8a48e
  * https://sketchfab.com/3d-models/blender-chan-7d732af0a882476daaebeb6869cec1c0
  * https://amarilloarts.itch.io/blender-chan
  * https://www.cgtrader.com/3d-models/character/anatomy/cartoon-characters-3-02
  * https://www.cgtrader.com/3d-models/exterior/sci-fi-exterior/polygon-sci-fi-pack
  * https://www.cgtrader.com/3d-models/character/anatomy/characters-6-01
  * https://www.cgtrader.com/3d-models/character/anatomy/characters-6-09
  * https://www.cgtrader.com/3d-models/character/other/cartoon-characters-3-06-professions
  * https://www.cgtrader.com/3d-models/character/sci-fi-character/mx01-sci-fi-suit-male-7b343d2a-7bc5-41c9-877a-10d73739722b
  * https://www.cgtrader.com/3d-models/character/anatomy/cartoon-characters-3-03
  * https://www.cgtrader.com/3d-models/character/other/cartoon-characters-5-01



  


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
