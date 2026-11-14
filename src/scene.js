/* ---------- 場景 ---------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));   // 高解析度螢幕上限 1.5 倍：肉眼幾乎看不出差別，但省很多運算
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#95cfea');
scene.fog = new THREE.Fog('#e3f1f6', 70, 150);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
camera.position.set(0, 31, 36);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.maxPolarAngle = 1.35; controls.minDistance = 6; controls.maxDistance = 58;
controls.target.set(0, 0, 0);

// 天空：漸層天幕（頭頂天藍，接近地平線越來越淺）
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(110,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:`varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 v;void main(){float h=clamp(v.y,0.,1.);vec3 top=vec3(.36,.68,.92),mid=vec3(.62,.84,.96),low=vec3(.93,.96,.97);
    vec3 c=h<.18?mix(low,mid,smoothstep(0.,.18,h)):mix(mid,top,smoothstep(.18,.75,h));gl_FragColor=vec4(c,1.);}`}));
skyDome.renderOrder=-2; scene.add(skyDome);
// 大片的 2D 雲朵，環狀圍在遠方，慢慢飄
function cloudTexture(seed){ const c=document.createElement('canvas'); c.width=512; c.height=256; const g=c.getContext('2d'); let s=seed;
  const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const puffs=[]; for(let k=0;k<9;k++){const x=90+r()*330, y=150-Math.sin((x-90)/330*Math.PI)*70*(0.6+r()*.5), rad=45+r()*45; puffs.push([x,y,rad]);}
  puffs.push([110,175,50],[400,175,55],[250,180,70]);
  puffs.forEach(([x,y,rad])=>{const gr=g.createRadialGradient(x,y-rad*.25,rad*.1,x,y,rad); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.7,'rgba(250,250,255,.95)'); gr.addColorStop(1,'rgba(240,244,255,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,rad,0,Math.PI*2); g.fill();});
  // 底部淡淡的粉藍陰影，增加立體感
  g.globalCompositeOperation='source-atop'; const sh=g.createLinearGradient(0,90,0,230); sh.addColorStop(0,'rgba(255,255,255,0)'); sh.addColorStop(1,'rgba(205,215,240,.65)'); g.fillStyle=sh; g.fillRect(0,0,512,256);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
const clouds=[];
for(let k=0;k<14;k++){ const ang=k/14*Math.PI*2+Math.random()*.2, rad=72+Math.random()*16, w=26+Math.random()*20;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/2),new THREE.MeshBasicMaterial({map:cloudTexture(1234+k*977),transparent:true,depthWrite:false,fog:false}));
  m.position.set(Math.cos(ang)*rad,6+Math.random()*16,Math.sin(ang)*rad); m.lookAt(0,m.position.y*.6,0); m.renderOrder=-1; scene.add(m);
  clouds.push({m,ang,rad,sp:(.004+Math.random()*.004)*(k%2?1:-1)}); }

// 白天的光線：明亮但柔和
scene.add(new THREE.HemisphereLight('#e8f4ff', '#6b7a52', 1.15));
scene.add(new THREE.AmbientLight('#ffffff', .25));
const sun = new THREE.DirectionalLight('#fff3dc', 1.6);
sun.position.set(-18, 22, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25}); scene.add(sun);

// 水面：三層三色的波浪，一層一層往外，各自起伏
const waterU={uTime:{value:0}};
function waveLayer(r1,r2,y,color,amp,freq,speed,seg){
  const geo=new THREE.RingGeometry(r1,r2,seg,8); const mat=new THREE.MeshStandardMaterial({color,roughness:.45,flatShading:true});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uTime=waterU.uTime;
    sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',
      `#include <begin_vertex>
       float a=atan(position.y,position.x), d=length(position.xy);
       transformed.z+=sin(a*${freq.toFixed(1)}+uTime*${speed.toFixed(2)})*${amp.toFixed(2)}+sin(d*.5-uTime*${(speed*1.3).toFixed(2)})*${(amp*.6).toFixed(2)};`); };
  const m=new THREE.Mesh(geo,mat); m.rotation.x=-Math.PI/2; m.position.y=y; scene.add(m); return m; }
waveLayer(21,37,-.45,'#9fe0ef',.12,22,1.1,96);   // 近岸：淺藍
waveLayer(33,62,-.62,'#5fbfdf',.22,16,.8,96);    // 中間：湖藍
waveLayer(59,112,-.8,'#3a93c4',.3,12,.6,80);     // 外圍：深藍
const water={position:{y:-.6}};

// 島（六角形）；ISLAND＝六角形頂點到中心的距離
const ISLAND = 20.5, ISLAND_IN = ISLAND*Math.cos(Math.PI/6);   // 頂點距離／邊的中點距離
const island = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND, ISLAND+1.5, 1.2, 6), new THREE.MeshStandardMaterial({ color:'#6f8a55', roughness:.95, flatShading:true }));
island.position.y = -0.6; island.receiveShadow = true; scene.add(island);
const cliff = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND+1.5, ISLAND+.5, 1.4, 6), new THREE.MeshStandardMaterial({ color:'#8a7158', flatShading:true }));
cliff.position.y = -1.9; scene.add(cliff);

// 環狀步道（半徑 R）。步道內側到中央花叢之間留一圈空地，之後可以擺小攤車、告示牌
const R = 13;
const path = new THREE.Mesh(new THREE.RingGeometry(R-0.9, R+0.9, 64), new THREE.MeshStandardMaterial({ color:'#d8c7a4', roughness:1 }));
path.rotation.x = -Math.PI/2; path.position.y = 0.01; path.receiveShadow = true; scene.add(path);

// 中央：紀念樹
const tree = new THREE.Group();
const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.35,.55,3.2,8), new THREE.MeshStandardMaterial({color:'#6b4a33',flatShading:true}));
trunk.position.y=1.6; trunk.castShadow=true; tree.add(trunk);
[[0,4.2,0,2.4],[1.2,3.6,.4,1.6],[-1.1,3.7,-.3,1.7],[.2,5.2,.2,1.5]].forEach(([x,y,z,s])=>{
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,0),new THREE.MeshStandardMaterial({color:'#8fae6a',flatShading:true}));
  m.position.set(x,y,z); m.castShadow=true; tree.add(m); });
scene.add(tree);

// 不會動的花草樹圍籬：先照常建立，最後由 mergeStatic() 依顏色合併（繪圖次數從上千次降到幾十次）
const STATIC=[]; const __staticStart=scene.children.length;
// 散落的樹與石頭（程式拼出）
const rnd = (a,b)=>a+Math.random()*(b-a);
for(let i=0;i<34;i++){
  const a=rnd(0,Math.PI*2), r=rnd(R+2.1,ISLAND_IN-.8), x=Math.cos(a)*r, z=Math.sin(a)*r;
  const t=new THREE.Group(); const h=rnd(1.2,2.4);
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,h*.5,6),new THREE.MeshStandardMaterial({color:'#5d4330'}));tr.position.y=h*.25;t.add(tr);
  const cn=new THREE.Mesh(new THREE.ConeGeometry(rnd(.6,.9),h,7),new THREE.MeshStandardMaterial({color:i%3?'#5f8350':'#7a9a58',flatShading:true}));cn.position.y=h*.5+h*.4;cn.castShadow=true;t.add(cn);
  t.position.set(x,0,z); scene.add(t);
}
// 島的中間：花叢和草叢造景（不放石頭）
const FLOWER_COLS=['#ffb3c7','#fff3f6','#ffd36b','#ff9a76','#c9a7ff','#ff6f91','#ffffff'];
function flowerBush(x,z,sz){ const g=new THREE.Group(); g.position.set(x,0,z);
  const leaf=new THREE.MeshStandardMaterial({color:['#5f8a4a','#6c9a52','#55803f'][Math.floor(Math.random()*3)],roughness:.9});
  const n=3+Math.floor(Math.random()*3); for(let k=0;k<n;k++){const b=new THREE.Mesh(new THREE.SphereGeometry(sz*(.6+Math.random()*.4),10,8),leaf);
    b.position.set((Math.random()-.5)*sz*1.2,sz*.45,(Math.random()-.5)*sz*1.2); b.scale.y=.75; b.castShadow=true; g.add(b);}
  const fc=FLOWER_COLS[Math.floor(Math.random()*FLOWER_COLS.length)], fm=new THREE.MeshStandardMaterial({color:fc,emissive:fc,emissiveIntensity:.15});
  for(let k=0;k<18;k++){const u=Math.random()*Math.PI*2,v=Math.random()*1.1; const f=new THREE.Mesh(new THREE.SphereGeometry(sz*.15,6,5),fm);
    f.position.set(Math.cos(u)*Math.sin(v)*sz*.95,sz*.5+Math.cos(v)*sz*.6,Math.sin(u)*Math.sin(v)*sz*.95); g.add(f);}
  scene.add(g); }
function grassTuft(x,z){ const g=new THREE.Group(); g.position.set(x,0,z); const m=new THREE.MeshStandardMaterial({color:Math.random()<.5?'#7fa35a':'#93b565'});
  for(let k=0;k<7;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(.04,.3+Math.random()*.25,4),m); const a=Math.random()*Math.PI*2,r=Math.random()*.15;
    c.position.set(Math.cos(a)*r,.15,Math.sin(a)*r); c.rotation.set((Math.random()-.5)*.5,0,(Math.random()-.5)*.5); g.add(c);} scene.add(g); }
for(let i=0;i<14;i++){const a=i/14*Math.PI*2+rnd(-.15,.15),r=rnd(3.2,6.4); flowerBush(Math.cos(a)*r,Math.sin(a)*r,rnd(.32,.5));}
for(let i=0;i<8;i++){const a=i/8*Math.PI*2; flowerBush(Math.cos(a)*2.1,Math.sin(a)*2.1,.26);}   // 紀念樹下圍一圈小花
for(let i=0;i<40;i++){const a=rnd(0,Math.PI*2),r=rnd(2.4,6.8); grassTuft(Math.cos(a)*r,Math.sin(a)*r);}
STATIC.push(...scene.children.slice(__staticStart));   // 上面這些花草樹不會動，稍後合併成少數幾個物件一次畫
