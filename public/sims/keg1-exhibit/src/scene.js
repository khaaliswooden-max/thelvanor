import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

// KEG-1 Solar Cluster exhibit, adapted from the R-4360 engineering exhibit template.
// Geometry, materials, diagrams and motion are generated here; no baked model is used.
//
// ILLUSTRATIVE, PRE-BUILD. Nothing on this page is a measurement. The geometry follows
// drawing K1-SOL-EXP-01 rev C. The numbers come from one small planning model (see
// "Simulation" below) built on the site's published figures, so this page and the
// pages around it give the same answers.
//
// Two ways in:
//   index.html             the full exhibit, a page of its own
//   index.html?mode=hero   the model alone, framed inside the home page hero
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const HERO = Q.get('mode') === 'hero';
const EMBEDDED = window.parent !== window;
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.toggle('hero', HERO);
document.body.classList.toggle('embedded', EMBEDDED);
document.body.classList.toggle('poster', Q.get('poster') === '1');
if (!EMBEDDED) document.documentElement.classList.add('standalone');
// Tell the host page when the model is on screen, or that it cannot run here.
function tellHost(state){
  if(!EMBEDDED)return;
  try{window.parent.postMessage({type:'keg1-exhibit:state',state},window.location.origin);}catch{}
}
const DURATION = 120;
const TAU = Math.PI * 2;
const SVGNS = 'http://www.w3.org/2000/svg';
const RB = (w, h, d, r = .02, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
function mulberry32(a){return function(){a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const rand = mulberry32(11092026);

let renderer;
try{
  renderer = new THREE.WebGLRenderer({antialias:true});
}catch(err){
  $('fallback').hidden = false;
  tellHost('unavailable');
  throw err;
}
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
renderer.domElement.setAttribute('aria-label','Interactive three-dimensional KEG-1 Solar Cluster. Drag to orbit and click a component to inspect.');
renderer.domElement.setAttribute('role','img');
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xececef);
scene.fog = new THREE.Fog(0xececef, 24, 64);
const camera = new THREE.PerspectiveCamera(35, innerWidth/innerHeight, .08, 180);
camera.position.set(9.2, 6.4, 12.8);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(.35, 2.6, 0);
controls.enableDamping = true;
controls.dampingFactor = .075;
controls.maxDistance = 28;
controls.minDistance = 1.4;
controls.maxPolarAngle = Math.PI * .88;
if(HERO){
  // Inside the page hero the wheel and vertical swipes belong to the page, not the model.
  // With zoom off, OrbitControls leaves wheel events alone, so the page scrolls through.
  controls.enableZoom = false;
  controls.enablePan = false;
  renderer.domElement.style.touchAction = 'pan-y';
}

const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment(renderer);
const env = pmrem.fromScene(room, .035);
scene.environment = env.texture;
room.dispose(); pmrem.dispose();

scene.add(new THREE.HemisphereLight(0xf8fbff, 0xc5cbd2, 1.05));
const key = new THREE.DirectionalLight(0xfff1df, 2.65);
key.position.set(-6, 12, 8); key.castShadow = true;
key.shadow.mapSize.set(2048,2048);
key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=10;key.shadow.camera.bottom=-5;
key.shadow.camera.near=.5;key.shadow.camera.far=30;key.shadow.normalBias=.025;
scene.add(key);
const fill = new THREE.DirectionalLight(0xdbeaff, 1.05); fill.position.set(8,5,3); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.35); rim.position.set(2,7,-7); scene.add(rim);

function noiseTexture(){
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  const g=cv.getContext('2d');g.fillStyle='#858585';g.fillRect(0,0,128,128);
  for(let i=0;i<1900;i++){
    const v=105+Math.floor(rand()*55),x=rand()*128,y=rand()*128,r=.25+rand()*1.15;
    g.fillStyle=`rgba(${v},${v},${v},.32)`;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  }
  const tex=new THREE.CanvasTexture(cv);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,3);return tex;
}
const CAST_BUMP=noiseTexture();
const clipMats=[];
const reg=m=>{clipMats.push(m);return m;};
const M={
  alu:reg(new THREE.MeshStandardMaterial({color:0xaeb8c1,metalness:.92,roughness:.28,envMapIntensity:1.05})),
  steel:reg(new THREE.MeshStandardMaterial({color:0x87919b,metalness:.95,roughness:.3,bumpMap:CAST_BUMP,bumpScale:.006,envMapIntensity:1.0})),
  polished:reg(new THREE.MeshStandardMaterial({color:0xd6dde3,metalness:.98,roughness:.16,envMapIntensity:1.15})),
  orange:reg(new THREE.MeshPhysicalMaterial({color:0xe8650a,metalness:.24,roughness:.34,clearcoat:.55,clearcoatRoughness:.3,envMapIntensity:.8})),
  orangeGhost:reg(new THREE.MeshPhysicalMaterial({color:0xe8650a,metalness:.08,roughness:.28,transparent:true,opacity:.21,depthWrite:false,side:THREE.DoubleSide})),
  steelGhost:reg(new THREE.MeshPhysicalMaterial({color:0x78838e,metalness:.15,roughness:.25,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide})),
  dark:reg(new THREE.MeshStandardMaterial({color:0x222a33,metalness:.58,roughness:.38,envMapIntensity:.8})),
  black:reg(new THREE.MeshStandardMaterial({color:0x111820,metalness:.18,roughness:.52})),
  pcb:reg(new THREE.MeshStandardMaterial({color:0x17653f,metalness:.12,roughness:.48})),
  pcbEdge:reg(new THREE.MeshStandardMaterial({color:0x0f3f2b,metalness:.18,roughness:.5})),
  gold:reg(new THREE.MeshStandardMaterial({color:0xc5a258,metalness:.88,roughness:.27})),
  brass:reg(new THREE.MeshStandardMaterial({color:0xc69c58,metalness:.92,roughness:.25})),
  blue:reg(new THREE.MeshStandardMaterial({color:0x2368bd,metalness:.12,roughness:.38})),
  red:reg(new THREE.MeshStandardMaterial({color:0xc9232e,metalness:.12,roughness:.4})),
  wireBlack:reg(new THREE.MeshStandardMaterial({color:0x171c22,metalness:.05,roughness:.55})),
  thermal:reg(new THREE.MeshStandardMaterial({color:0x9aa5ae,metalness:.93,roughness:.3})),
  pad:reg(new THREE.MeshStandardMaterial({color:0x68717c,metalness:.05,roughness:.75})),
  cell:new THREE.MeshPhysicalMaterial({color:0x142c59,metalness:.38,roughness:.24,clearcoat:1,clearcoatRoughness:.16,envMapIntensity:1.15}),
  glass:new THREE.MeshPhysicalMaterial({color:0x8bb4d8,metalness:.05,roughness:.16,transparent:true,opacity:.12,depthWrite:false}),
  screen:new THREE.MeshStandardMaterial({color:0x183c35,emissive:0x173d31,emissiveIntensity:.4,roughness:.35}),
  white:new THREE.MeshStandardMaterial({color:0xe8e7df,roughness:.75}),
  purple:new THREE.MeshStandardMaterial({color:0x7846c7,emissive:0x3c176d,emissiveIntensity:.25,roughness:.45}),
};
const cellMats=Array.from({length:4},(_,i)=>{const m=M.cell.clone();m.color.offsetHSL(0,0,(i-1.5)*.012);return m;});
const flowMats={
  solar:new THREE.MeshBasicMaterial({color:0xff8a32,transparent:true,opacity:.95,depthWrite:false}),
  battery:new THREE.MeshBasicMaterial({color:0xd92430,transparent:true,opacity:.95,depthWrite:false}),
  network:new THREE.MeshBasicMaterial({color:0x3c8cff,transparent:true,opacity:.9,depthWrite:false}),
  thermal:new THREE.MeshBasicMaterial({color:0xff6b35,transparent:true,opacity:.75,depthWrite:false}),
};

const floor=new THREE.Mesh(new THREE.CircleGeometry(70,64),new THREE.MeshStandardMaterial({color:0xececef,roughness:1,metalness:0}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.045;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(40,40,0xd4d9df,0xe2e5e9);grid.position.y=-.038;grid.material.transparent=true;grid.material.opacity=.32;scene.add(grid);
function contactTexture(){
  const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d');
  const grd=g.createRadialGradient(128,128,0,128,128,128);
  grd.addColorStop(0,'rgba(27,34,44,.32)');grd.addColorStop(.4,'rgba(27,34,44,.18)');grd.addColorStop(1,'rgba(27,34,44,0)');
  g.fillStyle=grd;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(cv);
}
const contactMat=new THREE.MeshBasicMaterial({map:contactTexture(),transparent:true,depthWrite:false,toneMapped:false});
function contact(x,z,w,d,opacity=1){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),contactMat.clone());m.material.opacity=opacity;m.rotation.x=-Math.PI/2;m.position.set(x,-.032,z);scene.add(m);return m;}
contact(0,0,4.1,3.6,.95);contact(3.35,.4,2.8,2.2,.8);

const modelRoot=new THREE.Group();scene.add(modelRoot);
const channelGroups={};
const pickOwners=new Map();
function register(group,channels,explode=0){
  group.userData.channels=Array.isArray(channels)?channels:[channels];
  group.userData.baseY=group.position.y;group.userData.explode=explode;
  group.userData.channels.forEach(c=>{(channelGroups[c]??=[]).push(group);});
  group.traverse(o=>{if(o.isMesh){pickOwners.set(o,group.userData.channels[0]);}});
  modelRoot.add(group);return group;
}
function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
function cylinder(rt,rb,h,mat,parent,x=0,y=0,z=0,segments=32){return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat,parent,x,y,z);}
function torus(r,t,mat,parent,x=0,y=0,z=0){const m=mesh(new THREE.TorusGeometry(r,t,8,64),mat,parent,x,y,z);m.rotation.x=Math.PI/2;return m;}
function labelTexture(title,sub='',bg='rgba(20,25,31,.92)',fg='#ffffff',accent='#d92430'){
  const cv=document.createElement('canvas');cv.width=512;cv.height=192;const g=cv.getContext('2d');
  g.fillStyle=bg;g.fillRect(0,0,512,192);g.fillStyle=accent;g.fillRect(0,0,512,10);
  g.fillStyle=fg;g.font='700 48px Arial';g.textAlign='center';g.fillText(title,256,91);
  if(sub){g.font='400 25px Arial';g.fillStyle='#d7dde4';g.fillText(sub,256,139);}
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tex;
}
function labelPlane(parent,title,sub,w,h,x,y,z,bg,fg,accent){
  const mat=new THREE.MeshBasicMaterial({map:labelTexture(title,sub,bg,fg,accent),transparent:true,side:THREE.DoubleSide,toneMapped:false});
  return mesh(new THREE.PlaneGeometry(w,h),mat,parent,x,y,z);
}
function sensorTag(parent,text,x,y,z){
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture(text,'SENSOR','rgba(111,57,184,.96)','#fff','#c6a5ff'),transparent:true,depthTest:true}));
  sp.position.set(x,y,z);sp.scale.set(.55,.21,1);parent.add(sp);return sp;
}

// 100 W photovoltaic module: frame, glazing, cell family, busbars and rear junction box.
const solarGroup=new THREE.Group();solarGroup.position.set(0,5.28,0);
mesh(RB(4.55,.11,2.8,.035),M.alu,solarGroup);
mesh(RB(4.38,.055,2.63,.02),M.dark,solarGroup,0,.065,0);
const busPoints=[];
for(let row=0;row<4;row++)for(let col=0;col<8;col++){
  const x=(col-3.5)*.535,z=(row-1.5)*.635;
  mesh(RB(.505,.018,.602,.009,2),cellMats[(row*3+col)%4],solarGroup,x,.105,z);
  for(const dx of[-.13,.13])busPoints.push(x+dx,.118,z-.27,x+dx,.118,z+.27);
}
const busGeo=new THREE.BufferGeometry();busGeo.setAttribute('position',new THREE.Float32BufferAttribute(busPoints,3));
const busLines=new THREE.LineSegments(busGeo,new THREE.LineBasicMaterial({color:0x94a9c4,transparent:true,opacity:.52}));solarGroup.add(busLines);
for(const z of[-1.36,1.36])mesh(RB(4.58,.16,.055,.012),M.polished,solarGroup,0,.015,z);
for(const x of[-2.245,2.245])mesh(RB(.055,.16,2.7,.012),M.polished,solarGroup,x,.015,0);
for(const x of[-1.5,1.5])mesh(RB(.09,.09,2.45,.015),M.dark,solarGroup,x,-.1,0);
mesh(RB(.46,.15,.32,.035),M.black,solarGroup,1.55,-.14,-1.05);
labelPlane(solarGroup,'100 W · 12 V','MONOCRYSTALLINE PV',1.12,.34,0,-.072,1.405,'rgba(235,238,241,.96)','#20252b','#e8650a').rotation.x=-Math.PI/2;
register(solarGroup,'PV',.72);

const standGroup=new THREE.Group();standGroup.position.y=4.42;
for(const x of[-1.72,1.72])for(const z of[-.9,.9]){
  cylinder(.065,.065,1.28,M.polished,standGroup,x,0,z,20);
  cylinder(.14,.14,.035,M.alu,standGroup,x,-.64,z,24);
  cylinder(.11,.11,.045,M.dark,standGroup,x,.64,z,24);
  cylinder(.028,.028,.07,M.gold,standGroup,x,.69,z,6);
}
register(standGroup,'PV',.32);

// Ball-lock lid, PRV, thermal plate, bosses and conformal pads.
const lidGroup=new THREE.Group();lidGroup.position.y=3.43;
cylinder(1.27,1.27,.12,M.steel,lidGroup,0,0,0,64);
torus(1.23,.045,M.dark,lidGroup,0,.015,0);torus(1.29,.035,M.polished,lidGroup,0,.055,0);
for(const x of[-.58,.58]){
  cylinder(.105,.13,.28,M.polished,lidGroup,x,.18,.05,24);torus(.112,.025,M.dark,lidGroup,x,.24,.05);
  cylinder(.05,.05,.09,M.dark,lidGroup,x,.355,.05,16);
}
cylinder(.055,.07,.16,M.brass,lidGroup,0,.12,.05,16);cylinder(.025,.025,.11,M.gold,lidGroup,0,.25,.05,12);
mesh(new THREE.SphereGeometry(.055,16,10),M.brass,lidGroup,0,.32,.05);
register(lidGroup,'THM',.12);

const plateGroup=new THREE.Group();plateGroup.position.y=3.04;
mesh(RB(2.16,.07,1.28,.025),M.alu,plateGroup);
for(const x of[-.92,.92])for(const z of[-.48,.48])cylinder(.035,.035,.025,M.dark,plateGroup,x,.05,z,12);
sensorTag(plateGroup,'P1',.78,.16,.38);
register(plateGroup,'THM',-.12);

const nodeGroups=[];
const nodeLedMats=[];
function makePiNode(index,y){
  const g=new THREE.Group();g.position.y=y;
  mesh(RB(1.52,.065,.94,.025),M.pcb,g);
  mesh(RB(1.47,.022,.89,.018),M.pcbEdge,g,0,-.042,0);
  mesh(RB(.43,.075,.39,.018),M.dark,g,-.2,.075,-.03);
  mesh(RB(.32,.035,.29,.012),M.alu,g,-.2,.13,-.03);
  labelPlane(g,`N${index}`,'Pi 5',.25,.12,-.2,.151,-.03,'rgba(32,39,45,.95)','#fff','#2f6f5e').rotation.x=-Math.PI/2;
  for(const z of[-.28,.03,.32]){
    mesh(RB(.25,.17,.22,.018),M.alu,g,.82,.055,z);
    mesh(RB(.012,.09,.15,.003),M.dark,g,.953,.055,z);
  }
  mesh(RB(.29,.19,.34,.015),M.alu,g,.81,.065,-.55);
  mesh(RB(.015,.11,.24,.003),M.blue,g,.965,.065,-.55);
  mesh(RB(.42,.12,.17,.015),M.dark,g,-.58,.065,-.5);
  for(let p=0;p<20;p++)for(const dz of[-.045,.045])cylinder(.009,.009,.09,M.gold,g,-.72+p*.071,.13,-.34+dz,6);
  for(const x of[-.63,.63])for(const z of[-.34,.34]){
    cylinder(.032,.032,.26,M.polished,g,x,.14,z,12);cylinder(.047,.047,.025,M.dark,g,x,.025,z,12);
  }
  const ledMat=new THREE.MeshStandardMaterial({color:0x59ff8d,emissive:0x2bff6b,emissiveIntensity:1.2,roughness:.3});
  nodeLedMats.push(ledMat);mesh(new THREE.SphereGeometry(.025,10,8),ledMat,g,.52,.08,.37);
  mesh(new THREE.SphereGeometry(.022,10,8),M.red,g,.45,.08,.37);
  sensorTag(g,index===2?'INA226 #2':`NODE ${index}`,-.32,.23,.46);
  register(g,`N${index}`,-.32-index*.12);
  nodeGroups.push(g);return g;
}
makePiNode(1,2.6);makePiNode(2,2.18);makePiNode(3,1.76);

const thermalStack=new THREE.Group();
nodeGroups.forEach(ng=>{
  const y=ng.position.y+.24;
  mesh(RB(.28,.16,.25,.018),M.alu,thermalStack,-.2,y,-.03);
  mesh(RB(.34,.035,.31,.008),M.pad,thermalStack,-.2,y-.1,-.03);
});
register(thermalStack,'THM',-.42);

function curvedBridge(){
  const s=new THREE.Shape();s.moveTo(0,-.09);s.bezierCurveTo(.2,-.09,.25,.15,.46,.13);s.bezierCurveTo(.65,.11,.72,-.04,.9,-.04);
  s.lineTo(.9,.09);s.bezierCurveTo(.69,.09,.66,.25,.45,.27);s.bezierCurveTo(.18,.29,.12,.05,0,.05);s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:12});geo.center();return geo;
}
const bridgeGeo=curvedBridge();
const bridgeGroups=[];
nodeGroups.forEach((ng,i)=>{
  const g=new THREE.Group();g.position.set(.72,ng.position.y+.02,0);
  const b=mesh(bridgeGeo,M.thermal,g);b.rotation.y=-.15;
  for(const x of[-.38,.38])cylinder(.035,.035,.04,M.dark,g,x,.02,.07,12);
  register(g,['THM',`N${i+1}`],-.32-i*.12);bridgeGroups.push(g);
});

const trayGroup=new THREE.Group();trayGroup.position.y=1.22;
mesh(RB(2.18,.09,1.36,.035),M.dark,trayGroup);
for(const x of[-1.04,1.04])mesh(RB(.07,.22,1.36,.018),M.black,trayGroup,x,.11,0);
for(const z of[-.64,.64])mesh(RB(2.12,.22,.07,.018),M.black,trayGroup,0,.11,z);
sensorTag(trayGroup,'BME280',.45,.22,.48);
register(trayGroup,'NET',-.68);

const switchGroup=new THREE.Group();switchGroup.position.set(0,1.43,.18);
mesh(RB(1.45,.32,.7,.055),M.dark,switchGroup);
for(let i=0;i<5;i++){
  const x=(i-2)*.245;
  mesh(RB(.19,.13,.025,.008),M.black,switchGroup,x,-.02,.363);
  mesh(RB(.13,.07,.012,.003),M.blue,switchGroup,x,-.02,.38);
  const lm=new THREE.MeshStandardMaterial({color:0x62da86,emissive:0x39d86a,emissiveIntensity:.7});
  mesh(new THREE.SphereGeometry(.015,8,6),lm,switchGroup,x,.085,.37);
}
labelPlane(switchGroup,'5-PORT','GIGABIT SWITCH',.65,.2,0,.17,-.1,'rgba(28,35,42,.94)','#fff','#3b82f6').rotation.x=-Math.PI/2;
register(switchGroup,'NET',-.78);

// 304 SS keg and safety-orange outer enclosure. The front service window remains open.
const shellGroup=new THREE.Group();
const shellSolid=[],shellGhost=[];
const steelBody=cylinder(1.255,1.255,3.22,M.steelGhost,shellGroup,0,1.62,0,64);
steelBody.geometry=new THREE.CylinderGeometry(1.255,1.255,3.22,64,1,true);
shellSolid.push({mesh:steelBody,mat:M.steel});shellGhost.push({mesh:steelBody,mat:M.steelGhost});
const orangeBody=mesh(new THREE.CylinderGeometry(1.29,1.29,2.95,64,1,true,.58,TAU-1.16),M.orangeGhost,shellGroup,0,1.61,0);
shellSolid.push({mesh:orangeBody,mat:M.orange});shellGhost.push({mesh:orangeBody,mat:M.orangeGhost});
for(const y of[.16,.52,2.72,3.12]){
  const band=mesh(new THREE.CylinderGeometry(1.315,1.315,.18,64,1,true),M.orangeGhost,shellGroup,0,y,0);
  shellSolid.push({mesh:band,mat:M.orange});shellGhost.push({mesh:band,mat:M.orangeGhost});
}
for(const y of[.06,.42,1.02,2.32,3.22])torus(1.29,.033,M.orange,shellGroup,0,y,0);
torus(1.24,.06,M.polished,shellGroup,0,3.27,0);torus(1.24,.05,M.dark,shellGroup,0,.05,0);
for(const x of[-1.27,1.27]){
  const handle=mesh(RB(.07,.26,.5,.05),M.dark,shellGroup,x,2.77,.05);handle.rotation.z=.08*Math.sign(x);
}
const desiccant=mesh(RB(.52,.06,.36,.06),M.white,shellGroup,-.25,1.85,.87);desiccant.rotation.x=-.32;desiccant.rotation.z=.12;
labelPlane(shellGroup,'KEG-1','304 SS · 212 ID',.78,.28,-.73,.62,1.08,'rgba(242,244,246,.94)','#20252b','#e8650a');
sensorTag(shellGroup,'P2',.66,2.1,1.08);sensorTag(shellGroup,'P4',.78,1.72,1.02);
register(shellGroup,'THM',0);

// MPPT, main fuse and LiFePO4 battery are independent inspectable subsystems.
const controllerGroup=new THREE.Group();controllerGroup.position.set(3.02,2.65,.12);
mesh(RB(1.08,1.25,.52,.075),M.dark,controllerGroup);
mesh(RB(.62,.38,.018,.025),M.black,controllerGroup,0,.13,.275);
mesh(RB(.48,.23,.012,.015),M.screen,controllerGroup,0,.14,.29);
labelPlane(controllerGroup,'12 V BUS','MPPT · SCHEMATIC',.43,.17,0,.14,.3,'rgba(20,55,45,.96)','#a9f0c8','#2f6f5e');
for(const x of[-.43,.43])for(const y of[-.5,.5])cylinder(.025,.025,.018,M.polished,controllerGroup,x,y,.28,12).rotation.x=Math.PI/2;
for(let i=0;i<6;i++){
  const x=(i-2.5)*.145;mesh(RB(.115,.14,.15,.012),M.pcb,controllerGroup,x,-.68,.05);
  cylinder(.025,.025,.02,M.gold,controllerGroup,x,-.68,.14,12).rotation.x=Math.PI/2;
}
labelPlane(controllerGroup,'MPPT','CHARGE CONTROLLER',.82,.25,0,-.3,.275,'rgba(28,35,42,.96)','#fff','#e8650a');
register(controllerGroup,'MPPT',0);

const fuseGroup=new THREE.Group();fuseGroup.position.set(3.0,1.6,.65);
mesh(RB(.24,.42,.22,.04),M.dark,fuseGroup);mesh(RB(.15,.22,.235,.025),M.red,fuseGroup,0,.02,0);
for(const y of[-.25,.25])cylinder(.045,.045,.15,M.red,fuseGroup,0,y,0,16);
register(fuseGroup,'MPPT',0);

const batteryGroup=new THREE.Group();batteryGroup.position.set(3.35,.77,.42);
mesh(RB(1.86,1.46,1.2,.1),M.dark,batteryGroup);
mesh(RB(1.78,.09,1.12,.035),M.black,batteryGroup,0,.76,0);
for(const x of[-.55,.55]){
  cylinder(.1,.12,.18,x<0?M.red:M.dark,batteryGroup,x,.88,0,20);
  cylinder(.045,.045,.12,M.brass,batteryGroup,x,1.0,0,16);
}
labelPlane(batteryGroup,'LiFePO4','12.8 V · 20 Ah · 256 Wh',1.4,.53,0,.05,.612,'rgba(28,35,42,.96)','#f1f3f5','#e8650a');
labelPlane(batteryGroup,'K1-ENERGY','MAIN FUSE FIRST',1.05,.32,0,-.42,.613,'rgba(28,35,42,.96)','#f1f3f5','#d92430');
register(batteryGroup,'BAT',0);

// Cable looms and bulkheads. Curves are shared by visible conductors and animated packets.
const flowPaths=[];
function makeWire(points,mat,r,channels,kind='',packets=0){
  const g=new THREE.Group();
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
  mesh(new THREE.TubeGeometry(curve,48,r,8,false),mat,g);
  const dots=[];
  for(let i=0;i<packets;i++){
    const d=mesh(new THREE.SphereGeometry(r*2.2,10,8),flowMats[kind]||flowMats.solar,g);dots.push(d);
  }
  register(g,channels,0);
  if(packets)flowPaths.push({curve,dots,kind,group:g});
  return curve;
}
makeWire([[1.55,5.12,-1.05],[2.25,5.05,-1.0],[2.55,4.3,-.45],[2.7,3.4,.05],[2.77,3.12,.15]],M.red,.027,'PV','solar',4);
makeWire([[1.43,5.1,-1.1],[2.05,4.92,-1.18],[2.35,4.2,-.62],[2.48,3.35,-.1],[2.55,3.12,.02]],M.wireBlack,.025,'PV');
makeWire([[2.8,1.77,.42],[2.62,1.82,.62],[2.83,1.72,.76],[3.0,1.75,.65],[3.15,1.45,.52],[3.02,2.02,.28]],M.red,.032,'BAT','battery',3);
makeWire([[3.9,1.76,.42],[4.02,2.05,.12],[3.65,2.28,-.05],[3.35,2.04,.02]],M.wireBlack,.03,'BAT');
makeWire([[2.72,2.08,.15],[2.25,1.92,.35],[1.72,1.72,.55],[1.25,1.66,.66],[1.08,1.64,.73]],M.red,.03,'MPPT','battery',3);
makeWire([[2.62,2.02,-.02],[2.12,1.78,.12],[1.62,1.58,.36],[1.22,1.55,.49]],M.wireBlack,.028,'MPPT');
const netCurves=[];
nodeGroups.forEach(ng=>{
  const y=ng.position.y+.02;
  netCurves.push(makeWire([[.52,1.46,.57],[.9,1.55,.82],[1.06,y-.08,.78],[.82,y,.48]],M.blue,.022,'NET','network',2));
});
makeWire([[.15,1.42,.55],[.55,1.18,.95],[1.05,1.18,1.12],[1.29,1.35,1.03]],M.blue,.025,'NET','network',2);
const glandGroup=new THREE.Group();
for(const y of[1.35,1.62]){
  const g=cylinder(.105,.105,.22,M.polished,glandGroup,1.29,y,.95,20);g.rotation.z=Math.PI/2;
  const n=cylinder(.13,.13,.07,M.dark,glandGroup,1.38,y,.95,6);n.rotation.z=Math.PI/2;
}
sensorTag(glandGroup,'INA226 #1',1.35,1.84,1.0);
register(glandGroup,['MPPT','NET'],0);

// Energy and thermal overlays remain schematic, explicitly separate from measured telemetry.
const solarRays=new THREE.Group();
for(let i=0;i<5;i++){
  const x=(i-2)*.72;
  cylinder(.018,.018,.48,flowMats.solar,solarRays,x,6.3,-.25,10);
  const cone=mesh(new THREE.ConeGeometry(.09,.2,12),flowMats.solar,solarRays,x,6.0,-.25);cone.rotation.z=Math.PI;
}
register(solarRays,'PV',0);
const heatRings=[];
nodeGroups.forEach((ng,i)=>{
  const g=new THREE.Group();g.position.set(0,ng.position.y,0);
  const mat=flowMats.thermal.clone();
  const ring=mesh(new THREE.TorusGeometry(.73,.018,8,48),mat,g);ring.rotation.x=Math.PI/2;
  register(g,['THM',`N${i+1}`],ng.userData.explode);
  heatRings.push({group:g,mat,phase:i*.7});
});

// Faint technical frames establish a far field without competing with the assembly.
const farField=new THREE.Group();
for(let i=0;i<3;i++){
  const geo=new THREE.EdgesGeometry(new THREE.BoxGeometry(7+i*3,6+i*2,.02));
  const line=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xdde2e7,transparent:true,opacity:.2-i*.04}));
  line.position.set(-5+i*5,3,-10-i*4);farField.add(line);
}
scene.add(farField);
modelRoot.traverse(o=>{
  if(!o.isMesh)return;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  const transparent=mats.some(m=>m?.transparent);
  o.castShadow=!transparent && !(o.geometry?.type==='TubeGeometry');
  o.receiveShadow=!transparent;
});

// ---------- Simulation: one 24-hour periodic clock drives every channel ----------
// Illustrative, not measured. One day of 5 peak sun hours, closed-form, built on published figures:
//   - the site's planning model (src/content/site.ts -> energyModel): 256 Wh battery,
//     51 Wh reserve, 12.8 W idle, 26.1 W full load at the bus;
//   - the harvest claim under test: about 70 Wh delivered per peak sun hour;
//   - the Keg-1 SOL twin's parameter register v0.2 for the per-device split and the
//     thermal resistances (/sims/keg1-sol/params/v0.2.json).
// The host page may pass the energyModel numbers in the query string, so editing
// site.ts moves this page too. The defaults below equal the published values.
const num=(key,fallback)=>{const v=Number(Q.get(key));return Q.has(key)&&Number.isFinite(v)&&v>0?v:fallback;};
const MODEL={
  nominalWh:num('wh',256),          // 12.8 V x 20 Ah
  reserveWh:num('reserve',51),      // 20 %, held back
  idleW:num('idle',12.8),           // three idle nodes, switch and sensors, at the bus
  fullW:num('full',26.1),           // three nodes at full load, at the bus
  psh:num('psh',5),                 // the day shown: peak sun hours. Break-even at idle is 4.4.
  panelW:100,                       // nameplate
  whPerPsh:70,                      // delivered after the controller, per peak sun hour
  mpptEff:.95,
  overheadW:2.8,                    // switch 2.0 W + sensors 0.8 W
  sunrise:360,sunset:1080,          // an equinox day, 06:00 to 18:00
  ambientC:25,
  rNodeStrip:2.6,rStripWall:.56,rWallAir:.5, // K/W
  throttleC:80,
};
const dayMin=m=>((m%1440)+1440)%1440;
// Where the sun is in its day: 0 at sunrise and sunset, 1 at solar noon.
function dayPhase(minute){
  const n=dayMin(minute);if(n<=MODEL.sunrise||n>=MODEL.sunset)return 0;
  return Math.sin((n-MODEL.sunrise)/(MODEL.sunset-MODEL.sunrise)*Math.PI);
}
// Irradiance in suns. The bell's height is set so the day adds up to MODEL.psh, and it is
// never taller than one sun: a clear day of this shape tops out near 7 peak sun hours.
const BELL=1.28;
const SUN_PEAK=(()=>{let hours=0;for(let i=0;i<1440;i++)hours+=Math.pow(dayPhase(i+.5),BELL)/60;return Math.min(1,MODEL.psh/hours);})();
const sunAt=minute=>SUN_PEAK*Math.pow(dayPhase(minute),BELL);
// Watts delivered to the bus after the controller, and watts at the panel terminals.
const harvestAt=minute=>MODEL.whPerPsh*sunAt(minute);
const solarAt=minute=>harvestAt(minute)/MODEL.mpptEff;
// Scheduled work sits in the middle of the day. Its size is not chosen: it is what is
// left of the day's harvest after 24 hours of idle draw, so the day balances and the
// battery ends where it began. Compute is fitted to the energy, which is the site's thesis.
const workShape=minute=>Math.pow(dayPhase(minute),2);
const DAY=(()=>{
  const N=1440,h=1/60;let harvestWh=0,shapeH=0,psh=0;
  for(let i=0;i<N;i++){const m=i+.5;harvestWh+=harvestAt(m)*h;shapeH+=workShape(m)*h;psh+=sunAt(m)*h;}
  const workW=Math.min(MODEL.fullW-MODEL.idleW,Math.max(0,(harvestWh-MODEL.idleW*24)/shapeH));
  const loadAt=minute=>MODEL.idleW+workW*workShape(minute);
  // Battery energy is the running integral of harvest minus load, with the day's peak pinned at full.
  const e=new Float64Array(N+1);
  for(let i=0;i<N;i++){const m=i+.5;e[i+1]=e[i]+(harvestAt(m)-loadAt(m))*h;}
  const drift=e[N]/N;for(let i=0;i<=N;i++)e[i]-=drift*i; // closes the loop when a day cannot balance
  let peak=-Infinity;for(let i=0;i<=N;i++)peak=Math.max(peak,e[i]);
  const wh=Float64Array.from(e,v=>MODEL.nominalWh-(peak-v));
  let minWh=Infinity;for(let i=0;i<=N;i++)minWh=Math.min(minWh,wh[i]);
  return{psh,harvestWh,workW,loadAt,wh,minWh,balanced:Math.abs(drift)<1e-6};
})();
const clusterAt=minute=>DAY.loadAt(minute);
function socWhAt(minute){const n=dayMin(minute),i=Math.floor(n),f=n-i;return DAY.wh[i]+(DAY.wh[Math.min(1440,i+1)]-DAY.wh[i])*f;}
const socAt=minute=>socWhAt(minute)/MODEL.nominalWh*100;
const nodePowerAt=minute=>Math.max(0,(clusterAt(minute)-MODEL.overheadW)/3);
// Steady-state chip temperature along node -> strip -> wall -> air. At full load this
// gives 72.9 C; the twin, which also models heat capacity, publishes 72.8. The three
// nodes share work evenly, so they read alike.
const wallAt=minute=>MODEL.ambientC+clusterAt(minute)*MODEL.rWallAir;
const stripAt=minute=>wallAt(minute)+clusterAt(minute)*MODEL.rStripWall;
const tempAt=minute=>stripAt(minute)+nodePowerAt(minute)*MODEL.rNodeStrip;
// Throughput is schematic: it tracks how much scheduled work is running.
const networkAt=minute=>4+240*(clusterAt(minute)-MODEL.idleW)/(MODEL.fullW-MODEL.idleW);
function simAt(minute){
  const solar=solarAt(minute),harvest=harvestAt(minute),load=clusterAt(minute),net=harvest-load;
  const socWh=socWhAt(minute);
  return {minute:dayMin(minute),solar,harvest,load,net,soc:socWh/MODEL.nominalWh*100,socWh,
    battery:Math.abs(net),charging:net>=0,temp:tempAt(minute),wall:wallAt(minute),network:networkAt(minute),
    nodePower:nodePowerAt(minute),harvesting:harvest>1};
}
const timeLabel=m=>`${String(Math.floor(((m%1440)+1440)%1440/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;

const CHANNELS=[
  {id:'PV',short:'PV',name:'SOLAR PANEL · 100 W 12 V',status:'HARVESTING'},
  {id:'MPPT',short:'MPPT',name:'MPPT + MAIN FUSE',status:'TRACKING'},
  {id:'BAT',short:'BAT',name:'LiFePO4 · 12.8 V 20 Ah',status:'BUFFERING'},
  {id:'N1',short:'N1',name:'NODE 1 · RASPBERRY PI 5',status:'ONLINE'},
  {id:'N2',short:'N2',name:'NODE 2 · RASPBERRY PI 5',status:'ONLINE'},
  {id:'N3',short:'N3',name:'NODE 3 · RASPBERRY PI 5',status:'ONLINE'},
  {id:'NET',short:'NET',name:'5-PORT GIGABIT NETWORK',status:'LINKED'},
  {id:'THM',short:'THM',name:'CONDUCTIVE THERMAL PATH',status:'CONDUCTING'},
];
let tracked=(CHANNELS.some(c=>c.id===Q.get('track'))?Q.get('track'):'N1');
let focused=null;
const fdots={};
CHANNELS.forEach(c=>{
  const b=document.createElement('button');b.type='button';b.className='fdot';b.textContent=c.short;b.setAttribute('aria-label',`Track ${c.name}`);
  b.onclick=()=>{tracked=c.id;onTrack();};$('fdots').appendChild(b);fdots[c.id]=b;
});
function channelMeta(id){return CHANNELS.find(c=>c.id===id)||CHANNELS[3];}
function onTrack(){
  const c=channelMeta(tracked);$('ccTitle').textContent=c.name;
  Object.entries(fdots).forEach(([id,b])=>b.classList.toggle('trk',id===tracked));
  document.body.dataset.tracked=tracked;
  applyModes();updateMetric(simAt(currentMinute));
}

// ---------- Projected engineering callouts with panel-safe collision relaxation ----------
const leaders=$('leaders');
function anchored(group,local){return()=>group.localToWorld(new THREE.Vector3(...local));}
const callouts=[
  {txt:'100 W solar module',sub:'8 × 4 CELL ARRAY · 12 V',a:anchored(solarGroup,[-1.7,.12,.8]),dx:-210,dy:-70,channel:'PV'},
  {txt:'Three-node compute stack',sub:'3 × RASPBERRY PI 5',a:anchored(nodeGroups[1],[-.55,.12,.25]),dx:-230,dy:-30,channel:'N2'},
  {txt:'Heat path, as drawn in rev C',sub:'SUPERSEDED BY THE REV E STRIP',a:anchored(plateGroup,[.6,.05,.2]),dx:155,dy:-85,channel:'THM'},
  {txt:'5-port gigabit switch',sub:'BLUE = NETWORK',a:anchored(switchGroup,[-.45,.1,.4]),dx:-220,dy:70,channel:'NET'},
  {txt:'MPPT charge controller',sub:'SOLAR / BATTERY / 12 V BUS',a:anchored(controllerGroup,[.3,.3,.28]),dx:140,dy:-60,channel:'MPPT'},
  {txt:'LiFePO4 battery',sub:'12.8 V · 20 Ah · 256 Wh',a:anchored(batteryGroup,[.55,.25,.62]),dx:140,dy:35,channel:'BAT'},
  {txt:'KEG shell',sub:'SAFETY ORANGE · 304 SS',a:anchored(shellGroup,[-1.1,.75,.55]),dx:-190,dy:70,channel:'THM'},
];
function svgEl(tag,attrs,parent){const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent.appendChild(e);return e;}
callouts.forEach(c=>{
  const d=document.createElement('div');d.className='co';d.innerHTML=`${c.txt}<small>${c.sub}</small>`;document.body.appendChild(d);c.el=d;
  c.ln=svgEl('line',{stroke:'#e8650a','stroke-width':1,'stroke-opacity':.6},leaders);
  c.dot=svgEl('circle',{r:2.5,fill:'#e8650a'},leaders);c.scale=1;c.onScreen=false;
});
function safeRect(){
  const sr={L:10,R:innerWidth-10,T:10,B:innerHeight-10},rects=[];
  document.querySelectorAll('.panel,#hint').forEach(el=>{if(el.offsetWidth&&getComputedStyle(el).display!=='none')rects.push(el.getBoundingClientRect());});
  rects.forEach(r=>{const cx=(r.left+r.right)/2;if(r.top>innerHeight*.75)return;
    if(cx<innerWidth*.4&&r.right<innerWidth*.55)sr.L=Math.max(sr.L,r.right+12);
    if(cx>innerWidth*.6&&r.left>innerWidth*.45)sr.R=Math.min(sr.R,r.left-12);});
  rects.forEach(r=>{if(r.left>=sr.R||r.right<=sr.L)return;if(r.top>innerHeight*.5)sr.B=Math.min(sr.B,r.top-12);if(r.bottom<innerHeight*.25)sr.T=Math.max(sr.T,r.bottom+8);});
  if(sr.R-sr.L<160){sr.L=10;sr.R=innerWidth-10;}if(sr.B-sr.T<120){sr.T=10;sr.B=innerHeight-10;}return sr;
}
const clampC=(c,sr)=>{c.x=clamp(c.x,sr.L,sr.R-c.w);c.y=clamp(c.y,sr.T,sr.B-c.h);};
function relax(items,sr){
  for(let it=0;it<24;it++){let moved=false;
    for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
      const a=items[i],b=items[j],pad=7;
      const ox=Math.min(a.x+a.w+pad,b.x+b.w+pad)-Math.max(a.x-pad,b.x-pad);
      const oy=Math.min(a.y+a.h+pad,b.y+b.h+pad)-Math.max(a.y-pad,b.y-pad);
      if(ox<=0||oy<=0)continue;moved=true;
      if(ox<oy){const dir=a.x+a.w/2<b.x+b.w/2?-1:1;a.x+=dir*(ox/2+.5);b.x-=dir*(ox/2+.5);}
      else{const dir=a.y+a.h/2<b.y+b.h/2?-1:1;a.y+=dir*(oy/2+.5);b.y-=dir*(oy/2+.5);}
    }items.forEach(c=>clampC(c,sr));if(!moved)break;
  }
}
const _pv=new THREE.Vector3();
function drawCallouts(){
  leaders.setAttribute('width',innerWidth);leaders.setAttribute('height',innerHeight);
  const sr=safeRect(),items=[];
  if(HERO){const tag=$('heroTag').getBoundingClientRect();if(tag.width)sr.T=Math.max(sr.T,tag.bottom+6);} // labels clear the tag
  callouts.forEach(c=>{
    const own=(channelGroups[c.channel]||[]).some(g=>g.visible);
    _pv.copy(c.a()).project(camera);c.ax=(_pv.x*.5+.5)*innerWidth;c.ay=(-_pv.y*.5+.5)*innerHeight;
    c.onScreen=state.ov.CALLOUTS&&own&&_pv.z<1&&c.ax>-60&&c.ax<innerWidth+60&&c.ay>-60&&c.ay<innerHeight+60;
    if(!c.onScreen){c.el.style.opacity=0;c.ln.style.opacity=0;c.dot.style.opacity=0;return;}
    c.w=c.el.offsetWidth;c.h=c.el.offsetHeight;c.x=c.dx<0?c.ax+c.dx-c.w:c.ax+c.dx;c.y=c.ay+c.dy;clampC(c,sr);items.push(c);
  });
  relax(items,sr);
  items.forEach(c=>{
    c.el.style.opacity=1;c.ln.style.opacity=1;c.dot.style.opacity=1;c.el.style.left=c.x+'px';c.el.style.top=c.y+'px';
    const ex=clamp(c.ax,c.x,c.x+c.w),ey=clamp(c.ay,c.y,c.y+c.h);
    c.ln.setAttribute('x1',c.ax);c.ln.setAttribute('y1',c.ay);c.ln.setAttribute('x2',ex);c.ln.setAttribute('y2',ey);
    c.dot.setAttribute('cx',c.ax);c.dot.setAttribute('cy',c.ay);
  });
}

// ---------- Linked SVG mechanism diagrams ----------
const dcDyn={};
function buildDcSvg(){
  const s=$('dcSvg');s.innerHTML='';
  const box=(id,x,y,w,h,title,sub,col='#111214')=>{
    const g=svgEl('g',{},s);svgEl('rect',{x,y,width:w,height:h,rx:2,fill:'#ffffff',stroke:'#c9cbd0'},g);
    const t=svgEl('text',{x:x+w/2,y:y+17,'text-anchor':'middle','font-size':9,'font-weight':700,fill:col},g);t.textContent=title;
    const st=svgEl('text',{x:x+w/2,y:y+31,'text-anchor':'middle','font-size':7,fill:'#78818b'},g);st.textContent=sub;
    dcDyn[id]=st;return g;
  };
  box('pv',5,8,52,39,'PV','0.0 W','#e8650a');box('fuse',76,8,42,39,'FUSE','MAIN');box('mppt',135,8,50,39,'MPPT','12 V');
  box('bat',10,103,62,39,'BATTERY','62 %');box('bus',105,103,74,39,'12 V BUS','0.0 W','#2f6f5e');
  const paths=[['M57 27H76','solar'],['M118 27H135','solar'],['M160 47V76H142V103','solar'],['M72 122H105','battery'],['M160 103V87H183V27','busPath']];
  paths.forEach(([d,kind])=>{const p=svgEl('path',{d,fill:'none',stroke:kind==='battery'?'#d92430':'#e8650a','stroke-width':2,'stroke-dasharray':'5 4'},s);(dcDyn[kind]??=[]).push(p);});
  const l1=svgEl('text',{x:7,y:66,'font-size':7,fill:'#78818b'},s);l1.textContent='PANEL → MPPT';
  const l2=svgEl('text',{x:7,y:78,'font-size':7,fill:'#78818b'},s);l2.textContent='BATTERY ↔ BUS';
  const l3=svgEl('text',{x:7,y:90,'font-size':7,fill:'#d92430'},s);l3.textContent='FUSE POSITIVE FIRST';
  dcDyn.mode=svgEl('text',{x:183,y:88,'text-anchor':'end','font-size':7,'font-weight':700,fill:'#d92430'},s);
}
const thermalDyn={nodes:[],flow:[]};
function buildThermalSvg(){
  const s=$('thermalSvg');s.innerHTML='';
  svgEl('rect',{x:28,y:8,width:130,height:8,fill:'#aeb8c1',stroke:'#78838e'},s);
  const plate=svgEl('text',{x:163,y:15,'font-size':6.5,fill:'#5c6168'},s);plate.textContent='PLATE';
  svgEl('rect',{x:24,y:18,width:5,height:105,fill:'#87919b'},s);
  const wall=svgEl('text',{x:9,y:70,'font-size':6.5,fill:'#5c6168',transform:'rotate(-90 9 70)'},s);wall.textContent='SS WALL';
  for(let i=0;i<3;i++){
    const y=32+i*31;
    svgEl('rect',{x:54,y,width:57,height:17,rx:2,fill:'#17653f',stroke:'#0f3f2b'},s);
    const n=svgEl('text',{x:82.5,y:y+11,'text-anchor':'middle','font-size':7,'font-weight':700,fill:'#fff'},s);n.textContent=`NODE ${i+1}`;
    svgEl('rect',{x:69,y:y-6,width:26,height:5,fill:'#68717c'},s);svgEl('rect',{x:73,y:y-12,width:18,height:6,fill:'#aeb8c1'},s);
    const p=svgEl('path',{d:`M111 ${y+8} C130 ${y-4},134 ${y+20},151 ${y+5}`,fill:'none',stroke:'#9aa5ae','stroke-width':4},s);thermalDyn.flow.push(p);
    const t=svgEl('text',{x:157,y:y+12,'font-size':7,fill:'#d92430'},s);thermalDyn.nodes.push(t);
  }
  thermalDyn.wall=svgEl('text',{x:36,y:127,'font-size':6.5,fill:'#5c6168'},s);
}
const flowDyn={paths:{},labels:{}};
function buildFlowSvg(){
  const s=$('flowSvg');s.innerHTML='';const cx=152;
  const nodes=[['PV',55,30,'#e8650a'],['MPPT',152,30,'#d92430'],['BAT',249,84,'#d92430'],['BUS',152,138,'#2f6f5e'],['3×PI',55,138,'#2f6f5e']];
  const edges=[['solar','M78 30H126'],['mppt','M152 44V57H224V70'],['battery','M224 98H178V124'],['bus','M126 138H81'],['direct','M152 44V124']];
  edges.forEach(([id,d])=>{
    flowDyn.paths[id]=svgEl('path',{d,fill:'none',stroke:id==='bus'?'#2f6f5e':id==='battery'?'#d92430':'#e8650a','stroke-width':2,'stroke-opacity':.65},s);
  });
  nodes.forEach(([id,x,y,col])=>{
    svgEl('circle',{cx:x,cy:y,r:23,fill:'#ffffff',stroke:col,'stroke-width':1.5},s);
    const t=svgEl('text',{x,y:y+3,'text-anchor':'middle','font-size':8,'font-weight':700,fill:'#111214'},s);t.textContent=id;
    const v=svgEl('text',{x,y:y+36,'text-anchor':'middle','font-size':7,fill:'#5c6168'},s);flowDyn.labels[id]=v;
  });
  flowDyn.status=svgEl('text',{x:cx,y:85,'text-anchor':'middle','font-size':7,'font-weight':700,fill:'#5c6168'},s);
}
const TACHS=[
  {nm:'SOLAR INPUT',rt:'100 W',unit:'W',f:s=>s.solar,max:100,color:'#e8650a'},
  {nm:'BATTERY SOC',rt:'256 Wh',unit:'%',f:s=>s.soc,max:100,color:'#d92430'},
  {nm:'CLUSTER LOAD',rt:'3 × Pi',unit:'W',f:s=>s.load,max:MODEL.fullW,color:'#2f6f5e'},
  {nm:'NETWORK',rt:'1 GbE',unit:'Mb/s',f:s=>s.network,max:250,color:'#3b82f6'},
];
const tachDoms=[];
TACHS.forEach(t=>{
  const row=document.createElement('div');row.className='tachRow';
  row.innerHTML=`<span class="nm">${t.nm}</span><svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="none" stroke="#e4e5e8" stroke-width="1.5"/><path d="M8 29A16 16 0 0 1 32 29" fill="none" stroke="#c9cbd0" stroke-width="1.5"/><line class="ndl" x1="20" y1="20" x2="20" y2="7" stroke="${t.color}" stroke-width="2"/><circle cx="20" cy="20" r="2" fill="#111214"/></svg><span class="rt">${t.rt}</span><span class="vl">0 ${t.unit}</span>`;
  $('tachRows').appendChild(row);tachDoms.push({ndl:row.querySelector('.ndl'),vl:row.querySelector('.vl'),t});
});
function drawDiagrams(s){
  if(dcDyn.pv){dcDyn.pv.textContent=`${s.solar.toFixed(1)} W`;dcDyn.mppt.textContent=`${s.harvest.toFixed(1)} W`;
    dcDyn.bat.textContent=`${s.soc.toFixed(0)} % · ${s.socWh.toFixed(0)} Wh`;dcDyn.bus.textContent=`${s.load.toFixed(1)} W`;
    dcDyn.mode.textContent=s.solar<1?'BATTERY SUPPLY':s.charging?'SOLAR + CHARGE':'SOLAR + BATTERY';
    ['solar','battery','busPath'].forEach((k,i)=>(dcDyn[k]||[]).forEach(p=>{p.style.strokeDashoffset=String(-s.minute*(i+1)*.04);p.style.opacity=(k==='solar'&&s.solar<1)?.18:1;}));
  }
  thermalDyn.nodes.forEach(t=>t.textContent=`${s.temp.toFixed(1)}°`);
  thermalDyn.flow.forEach(p=>{p.style.stroke=`color-mix(in srgb, #d92430 ${clamp((s.temp-40)*2.6,15,85)}%, #9aa5ae)`;});
  if(thermalDyn.wall)thermalDyn.wall.textContent=`wall ${s.wall.toFixed(1)}°C · simulated`;
  $('thermalDelta').textContent=`Δ ${(s.temp-MODEL.ambientC).toFixed(1)}°C`;
  if(flowDyn.paths.solar){
    flowDyn.labels.PV.textContent=`${s.solar.toFixed(1)} W`;flowDyn.labels.MPPT.textContent=`${s.harvest.toFixed(1)} W`;
    flowDyn.labels.BAT.textContent=`${s.battery.toFixed(1)} W ${s.charging?'IN':'OUT'}`;flowDyn.labels.BUS.textContent=`${s.load.toFixed(1)} W`;
    flowDyn.labels['3×PI'].textContent=`${s.nodePower.toFixed(1)} W each`;flowDyn.status.textContent=s.solar<1?'NIGHT · BATTERY':s.charging?'HARVEST + STORE':'HARVEST + BATTERY';
    flowDyn.paths.solar.style.opacity=s.solar<1?.15:1;flowDyn.paths.mppt.style.opacity=s.solar<1?.15:1;
    flowDyn.paths.battery.style.opacity=s.battery<.2?.15:1;flowDyn.paths.direct.style.opacity=s.solar<1?.12:.8;
    flowDyn.paths.battery.setAttribute('stroke-dasharray',s.charging?'none':'4 3');
  }
  tachDoms.forEach(({ndl,vl,t})=>{const v=t.f(s);ndl.setAttribute('transform',`rotate(${-125+clamp(v/t.max,0,1)*250} 20 20)`);vl.textContent=`${v.toFixed(t.unit==='Mb/s'?0:1)} ${t.unit}`;});
}

// ---------- Canvas charts; the right chart is also a scrub surface ----------
const energyCan=$('energyCan'),energyX=energyCan.getContext('2d');
const cycleCan=$('cycleCan'),cycleX=cycleCan.getContext('2d');
const CYCLE={l:22,r:8,t:15,b:18};
function prepCanvas(can,g){
  const w=can._w||280,h=can._h||130,dpr=Math.min(devicePixelRatio,2);
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);return{w,h,dpr};
}
function drawEnergy(s){
  const{w,h}=prepCanvas(energyCan,energyX),g=energyX,k=Math.max(.65,h/110),L=18*k,R=5*k,T=10*k,B=15*k;
  const X=m=>L+(w-L-R)*m/1440,Y=v=>T+(h-T-B)*(1-v/80);
  g.strokeStyle='#e4e5e8';g.lineWidth=1;g.strokeRect(L,T,w-L-R,h-T-B);
  g.font=`${6.5*k}px "IBM Plex Mono",ui-monospace,monospace`;g.fillStyle='#78818b';g.textAlign='center';
  [0,360,720,1080,1440].forEach(m=>g.fillText(timeLabel(m),X(m),h-4*k));
  const area=(fn,col,fill)=>{g.beginPath();for(let m=0;m<=1440;m+=12){const x=X(m),y=Y(fn(m));if(m===0)g.moveTo(x,y);else g.lineTo(x,y);}g.strokeStyle=col;g.lineWidth=1.25*k;g.stroke();
    if(fill){g.lineTo(X(1440),Y(0));g.lineTo(X(0),Y(0));g.closePath();g.fillStyle=fill;g.fill();}};
  area(harvestAt,'#e8650a','rgba(232,101,10,.08)');area(clusterAt,'#2f6f5e',null);
  g.strokeStyle='#111214';g.lineWidth=.8*k;g.beginPath();g.moveTo(X(s.minute),T);g.lineTo(X(s.minute),h-B);g.stroke();
  g.fillStyle='#111214';g.beginPath();g.arc(X(s.minute),Y(s.harvest),2.3*k,0,TAU);g.fill();
  g.textAlign='left';g.fillStyle='#e8650a';g.fillText('HARVEST',L+3*k,T+8*k);g.fillStyle='#2f6f5e';g.fillText('LOAD',L+44*k,T+8*k);
}
function drawCycle(s){
  const{w,h}=prepCanvas(cycleCan,cycleX),g=cycleX,k=Math.max(.65,h/140);
  const L=CYCLE.l=22*k,R=CYCLE.r=8*k,T=CYCLE.t=15*k,B=CYCLE.b=18*k;
  const X=m=>L+(w-L-R)*m/1440,Y=v=>T+(h-T-B)*(1-v/100);
  g.strokeStyle='#e4e5e8';g.lineWidth=1;g.strokeRect(L,T,w-L-R,h-T-B);
  for(const m of[0,360,720,1080,1440]){g.strokeStyle='#e4e5e8';g.beginPath();g.moveTo(X(m),T);g.lineTo(X(m),h-B);g.stroke();g.fillStyle='#78818b';g.font=`${6.5*k}px "IBM Plex Mono",ui-monospace,monospace`;g.textAlign=m===0?'left':m===1440?'right':'center';g.fillText(timeLabel(m),X(m),h-5*k);}
  const plot=(fn,col)=>{g.strokeStyle=col;g.lineWidth=1.2*k;g.beginPath();for(let m=0;m<=1440;m+=12){const x=X(m),y=Y(fn(m));if(m===0)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();};
  // The reserve the planning model holds back: the battery line should never reach it.
  const reserve=MODEL.reserveWh/MODEL.nominalWh*100;
  g.save();g.setLineDash([3*k,3*k]);g.strokeStyle='#9aa5ae';g.lineWidth=.8*k;g.beginPath();g.moveTo(L,Y(reserve));g.lineTo(w-R,Y(reserve));g.stroke();g.restore();
  g.fillStyle='#78818b';g.font=`${6*k}px "IBM Plex Mono",ui-monospace,monospace`;g.textAlign='right';g.fillText(`RESERVE ${reserve.toFixed(0)} %`,w-R-3*k,Y(reserve)+8*k);
  plot(socAt,'#d92430');plot(m=>tempAt(m),'#e8650a');plot(m=>clusterAt(m)*2,'#3b82f6');
  g.strokeStyle='#111214';g.lineWidth=.7*k;g.beginPath();g.moveTo(X(s.minute),T);g.lineTo(X(s.minute),h-B);g.stroke();
  for(const[v,col]of[[s.soc,'#d92430'],[s.temp,'#e8650a'],[s.load*2,'#3b82f6']]){g.fillStyle=col;g.beginPath();g.arc(X(s.minute),Y(v),2*k,0,TAU);g.fill();}
  g.fillStyle='#78818b';g.textAlign='center';g.font=`${6*k}px "IBM Plex Mono",ui-monospace,monospace`;g.fillText('SOC % · CHIP °C · LOAD W ×2',(L+w-R)/2,T-4*k);
  $('vtSoc').textContent=Math.round(s.soc);$('vtLoad').textContent=s.load.toFixed(1);$('vtTemp').textContent=s.temp.toFixed(1);
}

// ---------- Camera, component focus and cutaway/isolation modes ----------
const CAMS={
  HERO:{p:[9.2,6.4,12.8],l:[.35,2.55,0],frame:[.84,.73,.01,.015]},
  TOP:{p:[.4,15.5,4.2],l:[.3,2.2,0],frame:[.9,.72,0,0]},
  SIDE:{p:[13.8,4.7,1.0],l:[.55,2.45,0],frame:[.72,.74,0,.01]},
  CORE:{p:[4.2,3.65,5.4],l:[0,2.15,.1],frame:[.54,.58,0,0]},
};
let camTween=null;
function flyTo(p,l){camTween={p0:camera.position.clone(),l0:controls.target.clone(),p1:new THREE.Vector3(...p),l1:new THREE.Vector3(...l),t:0};}
function frameCamera(){
  const sr=safeRect(),cx=(sr.L+sr.R)/2,cy=(sr.T+sr.B)/2;
  const name=document.querySelector('[data-cam].on')?.dataset.cam||'HERO';
  const f=focused?[.55,.62,0,0]:CAMS[name].frame;
  camera.zoom=Math.min(HERO?1.22:1.08,.985*(sr.R-sr.L)/(innerHeight*f[0]),.985*(sr.B-sr.T)/(innerHeight*f[1]));
  camera.setViewOffset(innerWidth,innerHeight,innerWidth/2-cx+(f[2]||0)*innerHeight*camera.zoom,
    innerHeight/2-cy+(f[3]||0)*innerHeight*camera.zoom,innerWidth,innerHeight);
  camera.updateProjectionMatrix();
}
function syncFocusUI(cam='FOCUS'){
  document.body.dataset.focus=focused||'';document.body.dataset.camera=cam;
  $('hint').textContent=focused?(HERO?`${channelMeta(focused).short} CLOSE-UP · CLICK AGAIN TO EXIT`:`${channelMeta(focused).short} CLOSE-UP · CLICK AGAIN / ESC TO EXIT · DRAG TO ORBIT`):
    (HERO?'DRAG TO ORBIT · CLICK A PART':'CLICK COMPONENT TO FOCUS · DRAG TO ORBIT · H HIDES HUD');
}
function setCam(name){
  focused=null;syncFocusUI(name);applyModes();
  document.querySelectorAll('[data-cam]').forEach(b=>b.classList.toggle('on',b.dataset.cam===name));
  if(name==='CORE'){tracked='N2';onTrack();}
  const c=CAMS[name];frameCamera();flyTo(c.p,c.l);
}
document.querySelectorAll('[data-cam]').forEach(b=>b.onclick=()=>setCam(b.dataset.cam));
renderer.domElement.addEventListener('pointerdown',()=>camTween=null);
function focusPose(id){
  if(id==='PV')return{p:[4.8,7.8,6.4],l:[0,solarGroup.position.y,0]};
  if(id==='MPPT')return{p:[5.5,3.8,4.4],l:[3.02,2.55,.12]};
  if(id==='BAT')return{p:[5.7,2.4,4.4],l:[3.35,.9,.42]};
  if(id==='NET')return{p:[3.5,2.7,4.6],l:[0,1.45,.2]};
  if(id==='THM')return{p:[4.1,4.15,5.0],l:[0,2.8,0]};
  const n=nodeGroups[Number(id.slice(1))-1]||nodeGroups[0];return{p:[3.5,n.position.y+1.0,4.5],l:[0,n.position.y,0]};
}
function focusChannel(id){
  focused=id;tracked=id;onTrack();document.querySelectorAll('[data-cam]').forEach(b=>b.classList.remove('on'));
  syncFocusUI();frameCamera();const pose=focusPose(id);flyTo(pose.p,pose.l);
}
function exitFocus(){if(focused)setCam('HERO');}

const state={cut:'GLASS',ov:{CALLOUTS:innerWidth>720,ENERGY:true,FLOW:true,EXPLODE:false,ISOLATE:false,CHARTS:!HERO}};
const CLIP=new THREE.Plane(new THREE.Vector3(-1,0,0),.02);
function applyModes(){
  const iso=state.ov.ISOLATE,selected=focused||tracked;
  modelRoot.children.forEach(g=>{
    const ch=g.userData.channels||[];g.visible=!iso||ch.includes(selected);
  });
  const glass=state.cut==='GLASS';
  shellGhost.forEach(({mesh,mat})=>mesh.material=glass?mat:shellSolid.find(s=>s.mesh===mesh).mat);
  clipMats.forEach(m=>{const section=state.cut==='SECTION';m.clippingPlanes=section?[CLIP]:null;m.side=section?THREE.DoubleSide:(m.transparent?THREE.DoubleSide:THREE.FrontSide);m.needsUpdate=true;});
  document.querySelectorAll('.co').forEach(e=>e.style.visibility=state.ov.CALLOUTS?'':'hidden');
  leaders.style.visibility=state.ov.CALLOUTS?'':'hidden';
  ['dcPanel','thermalPanel','energyPanel','flowPanel','tachPanel','cyclePanel'].forEach(id=>$(id).style.display=state.ov.CHARTS?'':'none');
  flowPaths.forEach(p=>p.dots.forEach(d=>d.visible=state.ov.FLOW));
}
document.querySelectorAll('[data-cut]').forEach(b=>b.onclick=()=>{
  state.cut=b.dataset.cut;document.querySelectorAll('[data-cut]').forEach(x=>x.classList.toggle('on',x===b));applyModes();
});
document.querySelectorAll('[data-ov]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.ov;state.ov[k]=!state.ov[k];b.classList.toggle('onR',state.ov[k]);
  if(k==='ISOLATE'&&state.ov.ISOLATE&&!focused)focusChannel(tracked);
  if(k==='ISOLATE'&&!state.ov.ISOLATE&&focused){focused=null;syncFocusUI('HERO');document.querySelector('[data-cam="HERO"]').classList.add('on');setCam('HERO');}
  applyModes();layout();frameCamera();
});

const pickRay=new THREE.Raycaster(),pickPoint=new THREE.Vector2();
const pickSurfaces=[...pickOwners.keys()].filter(o=>!o.material?.transparent||o.material===M.orangeGhost||o.material===M.steelGhost);
function pickChannel(x,y){
  const r=renderer.domElement.getBoundingClientRect();pickPoint.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);pickRay.setFromCamera(pickPoint,camera);
  const hits=pickRay.intersectObjects(pickSurfaces,false);
  for(const h of hits){let visible=true;for(let o=h.object;o;o=o.parent)if(!o.visible){visible=false;break;}if(!visible)continue;return pickOwners.get(h.object);}
  return null;
}
let pointerStart=null;const activePointers=new Set();
renderer.domElement.addEventListener('pointerdown',e=>{activePointers.add(e.pointerId);pointerStart=e.isPrimary&&e.button===0&&activePointers.size===1?{id:e.pointerId,x:e.clientX,y:e.clientY,drag:false}:null;});
renderer.domElement.addEventListener('pointermove',e=>{if(pointerStart?.id===e.pointerId&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>6)pointerStart.drag=true;});
renderer.domElement.addEventListener('pointerup',e=>{
  activePointers.delete(e.pointerId);const start=pointerStart;pointerStart=null;if(!start||start.id!==e.pointerId||start.drag||e.button!==0)return;
  const id=pickChannel(e.clientX,e.clientY);if(id&&focused!==id)focusChannel(id);else exitFocus();
});
renderer.domElement.addEventListener('pointercancel',e=>{activePointers.delete(e.pointerId);pointerStart=null;});

// ---------- Transport, slow motion, one-hour steps and linked cycle scrubbing ----------
let currentMinute=Q.has('phase')?Number(Q.get('phase')):600;
let paused=Q.get('paused')==='1'||Q.has('t')||(HERO&&REDUCED_MOTION);
// The full exhibit opens in slow motion; the hero runs a day in two minutes so the flows read at a glance.
let speed=Number(Q.get('speed')||(HERO?100:10))/100;
const FLOW_SPAN=HERO?45:180; // simulated minutes for a packet to cross its wire
const daySld=$('daySld'),spdSld=$('spdSld'),crkSld=$('crkSld');
if(Q.get('day'))daySld.value=Q.get('day');spdSld.value=Math.round(speed*100);crkSld.value=Math.round(currentMinute);
function syncPause(){$('btnPause').textContent=paused?'▶ RUN':'❚❚ PAUSE';$('btnPause').setAttribute('aria-pressed',String(paused));}
$('btnPause').onclick=()=>{paused=!paused;syncPause();};
$('btnBack').onclick=()=>{currentMinute=((currentMinute-60)%1440+1440)%1440;};
$('btnFwd').onclick=()=>{currentMinute=(currentMinute+60)%1440;};
daySld.oninput=()=>$('dayVal').textContent=`${daySld.value} S / DAY`;
spdSld.oninput=()=>{speed=Number(spdSld.value)/100;$('spdVal').textContent=`1 / ${Math.round(100/Number(spdSld.value))} SPEED`;};
let crkDrag=false;crkSld.addEventListener('pointerdown',()=>crkDrag=true);addEventListener('pointerup',()=>crkDrag=false);
crkSld.oninput=()=>{currentMinute=Number(crkSld.value);$('crkVal').textContent=timeLabel(currentMinute);};
let scrubbing=false;
const scrubTo=e=>{const r=cycleCan.getBoundingClientRect(),x=e.clientX-r.left,w=cycleCan._w||r.width;currentMinute=clamp((x-CYCLE.l)/(w-CYCLE.l-CYCLE.r)*1440,0,1440);};
cycleCan.addEventListener('pointerdown',e=>{scrubbing=true;cycleCan.setPointerCapture(e.pointerId);scrubTo(e);});
cycleCan.addEventListener('pointermove',e=>{if(scrubbing)scrubTo(e);});
cycleCan.addEventListener('pointerup',()=>scrubbing=false);cycleCan.addEventListener('pointercancel',()=>scrubbing=false);
addEventListener('keydown',e=>{
  if(e.key==='Escape')exitFocus();
  if(HERO)return; // in the page hero, the keyboard belongs to the page
  if(e.key==='h'||e.key==='H')document.body.classList.toggle('hudOff');
  if(e.key==='e'||e.key==='E')document.querySelector('[data-ov="EXPLODE"]').click();
  if(e.key===' '&&e.target===document.body){e.preventDefault();paused=!paused;syncPause();}
});
if(Q.get('hud')==='0')document.body.classList.add('hudOff');

function updateMetric(s){
  const c=channelMeta(tracked);let value=s.nodePower,unit='W',max=8,label='NODE POWER · ILLUSTRATIVE',status=c.status,color='#2f6f5e';
  if(tracked==='PV'){value=s.solar;max=100;label='PANEL OUTPUT · ILLUSTRATIVE';status=s.solar>1?'HARVESTING':'NIGHT';color='#e8650a';}
  else if(tracked==='MPPT'){value=s.harvest;max=100;label='DELIVERED · ILLUSTRATIVE';status=s.solar>1?'TRACKING':'BATTERY BUS';color='#e8650a';}
  else if(tracked==='BAT'){value=s.soc;unit='%';max=100;label='STATE OF CHARGE · ILLUSTRATIVE';status=s.charging?'CHARGING':'DISCHARGING';color='#d92430';}
  else if(tracked==='NET'){value=s.network;unit='Mb/s';max=250;label='THROUGHPUT · SCHEMATIC';color='#3b82f6';}
  else if(tracked==='THM'){value=s.temp;unit='°C';max=MODEL.throttleC;label='CHIP TEMP · SIMULATED · LIMIT 80 °C';status='CONDUCTING';color='#d92430';}
  else if(/^N[123]$/.test(tracked)){status=s.nodePower>(MODEL.idleW-MODEL.overheadW)/3+.15?'WORKING':'IDLE';}
  $('ccState').textContent=status;$('ccState').style.color=color;$('ccDeg').textContent=timeLabel(s.minute);
  $('metricNum').innerHTML=`${value.toFixed(1)}<small> ${unit}</small>`;$('metricNum').style.color=color;
  $('metricLabel').textContent=label;$('metricFill').style.width=`${clamp(value/max*100,0,100)}%`;$('metricFill').style.background=color;
  $('solarNum').innerHTML=`${s.solar.toFixed(1)}<small> W</small>`;$('solarFill').style.width=`${s.solar}%`;
  $('dayLab').textContent=`${timeLabel(s.minute)} · ${s.solar<1?'battery supply':s.charging?'harvest + store':'harvest + battery'} · ${DAY.psh.toFixed(1)} PSH day${DAY.balanced?'':' · does not balance'}`;
  if(!crkDrag)crkSld.value=Math.round(s.minute);$('crkVal').textContent=timeLabel(s.minute);
  document.querySelectorAll('#nodeCard .ck').forEach(el=>{
    const k=Number(el.dataset.s),on=k===0||(k===1&&(tracked==='PV'?s.solar>1:true))||(k===2&&(tracked==='NET'||/^N/.test(tracked)))||(k===3&&tracked==='THM');
    el.classList.toggle('on',on);
  });
  CHANNELS.forEach(ch=>{
    const active=ch.id==='PV'?s.solar>1:ch.id==='BAT'?s.battery>.2:ch.id==='NET'?s.network>40:/^N/.test(ch.id)?s.load>MODEL.idleW+.5:true;
    fdots[ch.id].classList.toggle('active',active);
  });
  $('flowNow').textContent=s.solar<1?'BATTERY SUPPLY':s.charging?'CHARGING':'SOLAR + BATTERY';
}
// Hero mode shows three numbers and the scrub bar; nothing else on the HUD is drawn.
const heroText={};
function setText(id,text){if(heroText[id]!==text){heroText[id]=text;$(id).textContent=text;}}
function updateHero(s){
  setText('hrSolar',`${s.harvest.toFixed(1)} W`);setText('hrSoc',`${s.soc.toFixed(0)} %`);setText('hrLoad',`${s.load.toFixed(1)} W`);
  if(!crkDrag)crkSld.value=Math.round(s.minute);setText('crkVal',timeLabel(s.minute));
}
function updateAssembly(dt,immediate=false){
  const f=immediate?1:1-Math.exp(-dt*7);
  modelRoot.children.forEach(g=>{
    if(!g.userData.explode)return;const target=g.userData.baseY+(state.ov.EXPLODE?g.userData.explode:0);g.position.y=lerp(g.position.y,target,f);
  });
  heatRings.forEach((r,i)=>{r.group.userData.baseY=nodeGroups[i].position.y;});
}
function updateScene(s){
  const selected=focused||tracked;
  const inSelection=g=>!state.ov.ISOLATE||g.userData.channels.includes(selected);
  solarRays.visible=state.ov.ENERGY&&inSelection(solarRays)&&s.solar>1;
  solarRays.position.y=solarGroup.position.y-5.28;
  heatRings.forEach((r,i)=>{
    r.group.visible=state.ov.ENERGY&&inSelection(r.group);
    r.group.position.y=nodeGroups[i].position.y;r.mat.opacity=state.ov.ENERGY?.12+.38*clamp((s.temp-40)/30,0,1):0;
    const pulse=1+.035*Math.sin(s.minute/1440*TAU*4+r.phase);r.group.scale.setScalar(pulse);
  });
  flowPaths.forEach(p=>p.dots.forEach((d,i)=>{
    let on=state.ov.FLOW&&p.group.visible;if(p.kind==='solar'&&s.solar<1)on=false;
    d.visible=on;if(!on)return;let u=(s.minute/FLOW_SPAN+i/p.dots.length)%1;
    if(p.kind==='battery'&&!s.charging)u=1-u;d.position.copy(p.curve.getPoint(u));
  }));
  nodeLedMats.forEach((m,i)=>m.emissiveIntensity=.65+.75*(.5+.5*Math.sin(s.minute/1440*TAU*6+i)));
  if(HERO)updateHero(s);else{updateMetric(s);drawDiagrams(s);if(state.ov.CHARTS){drawEnergy(s);drawCycle(s);}}
  if(state.ov.CALLOUTS)drawCallouts();
}

// ---------- Responsive panel layout ----------
const LAY_GAP=10;
function stackCol(ids,top,bottom){
  const els=ids.map(id=>$(id)).filter(e=>getComputedStyle(e).display!=='none');if(!els.length)return;
  const used=els.reduce((sum,e)=>sum+e.offsetHeight,0),gap=els.length>1?Math.max(4,(bottom-top-used)/(els.length-1)):0;
  let y=top;els.forEach(e=>{e.style.top=y+'px';y+=e.offsetHeight+gap;});
}
function setCanSize(can,cssH,dpr){
  cssH=Math.max(48,Math.round(cssH));can.style.height=cssH+'px';const cssW=can.clientWidth||280;
  can.width=Math.max(2,Math.round(cssW*dpr));can.height=Math.max(2,Math.round(cssH*dpr));can._w=cssW;can._h=cssH;
}
// Each column holds what fits. On a short window the least essential panels step aside,
// so nothing overlaps the controls. The day chart on the left goes first (the scrub chart on
// the right carries the same story), then the thermal panel; on the right, the gauges, then routing.
const COLUMN_PANELS=['dcPanel','thermalPanel','energyPanel','nodeCard','flowPanel','tachPanel','cyclePanel'];
const shown=id=>getComputedStyle($(id)).display!=='none';
function fitColumn(ids,dropOrder,canvasPanel,can,minCan,space){
  const need=()=>{
    const live=ids.filter(shown);
    let h=live.reduce((sum,id)=>sum+$(id).offsetHeight,0)+Math.max(0,live.length-1)*4; // stackCol's tightest gap
    if(live.includes(canvasPanel))h+=minCan-can.getBoundingClientRect().height; // that panel at its smallest
    return h;
  };
  for(const id of dropOrder){if(need()<=space)break;$(id).classList.add('nofit');}
}
function layout(){
  const H=innerHeight,W=innerWidth,edge=Math.round(Math.min(24,Math.max(12,W*.012))),dpr=Math.min(devicePixelRatio,2);
  COLUMN_PANELS.forEach(id=>$(id).classList.remove('nofit'));
  if(W<=720){$('nodeCard').style.top='150px';$('channelTrack').style.bottom='';return;}
  $('nodeCard').style.top='';
  const ctlH=Math.max($('transport').offsetHeight,$('modes').offsetHeight);$('channelTrack').style.bottom=(edge+ctlH+8)+'px';
  const topR=edge,botR=H-edge-$('modes').offsetHeight-12;
  fitColumn(['nodeCard','flowPanel','tachPanel','cyclePanel'],['tachPanel','flowPanel'],'cyclePanel',cycleCan,80,botR-topR);
  const chromeCycle=$('cyclePanel').offsetHeight-cycleCan.getBoundingClientRect().height;
  const aboveR=['nodeCard','flowPanel','tachPanel'].filter(shown);
  const fixedR=aboveR.reduce((sum,id)=>sum+$(id).offsetHeight,0);
  setCanSize(cycleCan,Math.max(80,botR-topR-aboveR.length*LAY_GAP-fixedR-chromeCycle),dpr);
  stackCol(['nodeCard','flowPanel','tachPanel','cyclePanel'],topR,botR);
  const topL=edge+$('topleft').offsetHeight+14,botL=H-edge-$('transport').offsetHeight-12;
  fitColumn(['dcPanel','thermalPanel','energyPanel'],['energyPanel','thermalPanel'],'energyPanel',energyCan,60,botL-topL);
  const chromeEnergy=$('energyPanel').offsetHeight-energyCan.getBoundingClientRect().height;
  const aboveL=['dcPanel','thermalPanel'].filter(shown);
  const fixedL=aboveL.reduce((sum,id)=>sum+$(id).offsetHeight,0);
  setCanSize(energyCan,Math.max(60,botL-topL-aboveL.length*LAY_GAP-fixedL-chromeEnergy),dpr);
  stackCol(['dcPanel','thermalPanel','energyPanel'],topL,botL);
}

// Deep links retain the template's inspection workflow.
{
  const cut=Q.get('cut');if(cut&&['GLASS','SECTION','SOLID'].includes(cut)){state.cut=cut;document.querySelectorAll('[data-cut]').forEach(x=>x.classList.toggle('on',x.dataset.cut===cut));}
  (Q.get('ovOff')||'').split(',').forEach(k=>{if(k in state.ov){state.ov[k]=false;document.querySelector(`[data-ov="${k}"]`)?.classList.remove('onR');}});
  if(Q.get('explode')==='1'){state.ov.EXPLODE=true;document.querySelector('[data-ov="EXPLODE"]').classList.add('onR');}
  if(Q.get('iso')==='1'){state.ov.ISOLATE=true;document.querySelector('[data-ov="ISOLATE"]').classList.add('onR');focused=tracked;}
}

document.querySelector('[data-ov="CALLOUTS"]').classList.toggle('onR',state.ov.CALLOUTS);
buildDcSvg();buildThermalSvg();buildFlowSvg();onTrack();applyModes();layout();
camera.position.fromArray(CAMS.HERO.p);controls.target.fromArray(CAMS.HERO.l);frameCamera();syncFocusUI('HERO');
const initialCam=Q.get('cam');if(initialCam&&CAMS[initialCam])setCam(initialCam);
if(Q.get('focus')&&CHANNELS.some(c=>c.id===Q.get('focus')))focusChannel(Q.get('focus'));
updateAssembly(0,true);updateScene(simAt(currentMinute));controls.update();renderer.render(scene,camera);

const clock=new THREE.Clock();let frames=0,fps=60,lastFpsTime=performance.now();
function drawLive(){
  const dt=Math.min(clock.getDelta(),.06);
  if(!paused)currentMinute=(currentMinute+dt*1440/Number(daySld.value)*speed)%1440;
  updateAssembly(dt);updateScene(simAt(currentMinute));
  if(camTween){camTween.t=Math.min(1,camTween.t+dt/.85);const k=camTween.t*camTween.t*(3-2*camTween.t);camera.position.lerpVectors(camTween.p0,camTween.p1,k);controls.target.lerpVectors(camTween.l0,camTween.l1,k);if(camTween.t>=1)camTween=null;}
  controls.update();renderer.render(scene,camera);
  frames++;const now=performance.now();if(now-lastFpsTime>1000){fps=frames*1000/(now-lastFpsTime);frames=0;lastFpsTime=now;}
}
// Render only while the model can be seen. Inside a frame, an observer with no root
// reports against the top-level viewport, so scrolling the host page past the hero stops the loop.
let onScreen=true,frozen=Q.has('t');
function syncLoop(){
  const run=!frozen&&onScreen&&!document.hidden;
  if(run)clock.getDelta();
  renderer.setAnimationLoop(run?drawLive:null);
  window.__KEG_RUNNING__=run;
}
if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{onScreen=entries[entries.length-1].isIntersecting;syncLoop();}).observe(renderer.domElement);
}
document.addEventListener('visibilitychange',syncLoop);
syncLoop();
window.__seek=t=>{
  const v=Number(t);paused=true;frozen=true;syncLoop();currentMinute=(Number.isFinite(v)&&v>0?v:0)*1440/DURATION%1440;
  updateAssembly(0,true);updateScene(simAt(currentMinute));controls.update();renderer.render(scene,camera);syncPause();
};
window.__play=()=>{paused=false;frozen=false;syncPause();syncLoop();};
window.__KEG_METRICS__=()=>({fps:Number(fps.toFixed(1)),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
  geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,tracked,camera:document.body.dataset.camera,paused,minute:currentMinute});
const T_PARAM=Q.get('t');if(T_PARAM!==null)window.__seek(T_PARAM);
window.__KEG_MODEL__=()=>({model:MODEL,psh:DAY.psh,harvestWh:DAY.harvestWh,workW:DAY.workW,minWh:DAY.minWh,balanced:DAY.balanced});
window.__KEG_SIM__=minute=>simAt(minute); // the model's answer at a minute of the day, for checks
window.__SCENE_READY__=true;
tellHost('ready');
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
  if(innerWidth<=720&&state.ov.CALLOUTS){state.ov.CALLOUTS=false;document.querySelector('[data-ov="CALLOUTS"]').classList.remove('onR');applyModes();}
  layout();frameCamera();updateScene(simAt(currentMinute));renderer.render(scene,camera);
});
