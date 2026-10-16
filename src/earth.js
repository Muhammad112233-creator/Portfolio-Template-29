import * as THREE from 'three';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function drawLand(ctx, width, height, points, color, seed = 0) {
  const px = (point) => [point[0] * width, point[1] * height];
  ctx.beginPath();
  points.forEach((point, index) => {
    const [x, y] = px(point);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  const gradient = ctx.createLinearGradient(width * 0.25, height * 0.2, width * 0.85, height * 0.9);
  gradient.addColorStop(0, color[0]);
  gradient.addColorStop(0.56, color[1]);
  gradient.addColorStop(1, color[2]);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(207, 255, 226, .76)';
  ctx.lineWidth = Math.max(1.4, width / 1300);
  ctx.stroke();

  // Fine, low-contrast elevation contours make the map feel engraved rather than flat.
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = 'rgba(18, 54, 76, .8)';
  ctx.lineWidth = Math.max(1, width / 1800);
  const baseX = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const baseY = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  for (let ring = 0; ring < 7; ring += 1) {
    ctx.beginPath();
    const rx = width * (0.018 + ring * 0.009 + (seed % 3) * 0.004);
    const ry = height * (0.018 + ring * 0.012);
    ctx.ellipse(baseX * width, baseY * height, rx, ry, (seed % 5) * 0.12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function createEarthMap() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const ocean = ctx.createLinearGradient(0, 0, width, height);
  ocean.addColorStop(0, '#064366');
  ocean.addColorStop(0.31, '#1386a1');
  ocean.addColorStop(0.64, '#155a85');
  ocean.addColorStop(1, '#182d62');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  // Underwater color blooms and very fine sea-lines add depth to the sphere.
  for (let i = 0; i < 22; i += 1) {
    const x = ((i * 293 + 83) % width);
    const y = ((i * 197 + 121) % height);
    const radius = 70 + ((i * 47) % 170);
    const glow = ctx.createRadialGradient(x, y, 1, x, y, radius);
    glow.addColorStop(0, i % 2 ? 'rgba(72, 220, 206, .17)' : 'rgba(104, 111, 231, .17)');
    glow.addColorStop(1, 'rgba(16, 80, 124, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const landPalette = ['#b7edb0', '#56c7a4', '#f1bc76'];
  const continents = [
    // North America
    [[.087,.205],[.114,.164],[.16,.151],[.181,.126],[.227,.14],[.244,.18],[.278,.191],[.306,.234],[.287,.273],[.302,.309],[.28,.342],[.274,.386],[.247,.4],[.226,.44],[.201,.414],[.187,.377],[.153,.351],[.141,.309],[.107,.279]],
    // South America
    [[.265,.425],[.305,.406],[.337,.431],[.348,.482],[.33,.538],[.344,.584],[.322,.64],[.31,.704],[.283,.762],[.271,.729],[.266,.659],[.245,.594],[.246,.529],[.228,.478]],
    // Greenland
    [[.295,.105],[.337,.087],[.368,.115],[.362,.164],[.339,.193],[.306,.177]],
    // Europe
    [[.455,.243],[.484,.219],[.514,.233],[.542,.223],[.566,.25],[.557,.281],[.528,.296],[.507,.325],[.479,.307],[.455,.284]],
    // Africa
    [[.464,.328],[.506,.305],[.547,.321],[.574,.367],[.57,.425],[.545,.485],[.535,.553],[.509,.624],[.484,.637],[.46,.585],[.449,.523],[.43,.468],[.433,.399]],
    // Asia
    [[.548,.235],[.584,.197],[.636,.19],[.679,.159],[.741,.174],[.782,.206],[.834,.212],[.87,.251],[.849,.289],[.811,.3],[.782,.34],[.751,.349],[.73,.388],[.688,.384],[.656,.355],[.621,.375],[.588,.346],[.565,.307]],
    // India / south-east Asia
    [[.617,.359],[.649,.377],[.663,.423],[.649,.465],[.631,.443],[.612,.404]],
    // Japan
    [[.832,.36],[.846,.37],[.842,.403],[.831,.42],[.823,.393]],
    // Australia
    [[.763,.595],[.804,.574],[.847,.587],[.871,.625],[.858,.674],[.824,.697],[.784,.687],[.759,.651]],
    // Madagascar
    [[.577,.611],[.588,.623],[.584,.66],[.574,.653]],
    // Antarctica
    [[.055,.845],[.102,.831],[.166,.85],[.218,.837],[.271,.85],[.331,.829],[.397,.848],[.465,.827],[.526,.849],[.596,.834],[.662,.853],[.731,.832],[.799,.85],[.863,.832],[.943,.849],[.958,.9],[.904,.921],[.827,.906],[.766,.929],[.701,.912],[.631,.93],[.559,.911],[.485,.928],[.416,.911],[.347,.928],[.276,.909],[.196,.929],[.124,.908],[.064,.92]],
  ];
  continents.forEach((shape, index) => drawLand(ctx, width, height, shape, landPalette, index + 1));

  // Ice, shallow seas, and island chains — deliberately stylized, not a navigational map.
  ctx.fillStyle = 'rgba(225, 252, 230, .72)';
  ctx.beginPath();
  ctx.ellipse(width * .345, height * .145, width * .019, height * .038, -.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(230, 246, 221, .56)';
  [[.69,.45],[.71,.48],[.73,.47],[.75,.5],[.776,.475],[.797,.49],[.815,.456],[.858,.54],[.368,.501],[.38,.53],[.402,.55],[.428,.281]].forEach(([x,y], index) => {
    ctx.beginPath();
    ctx.ellipse(width * x, height * y, 6 + (index % 4) * 3, 4 + (index % 3) * 2, .3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Longitude and latitude lines; they read as a fine cartographic engraving.
  ctx.save();
  ctx.strokeStyle = 'rgba(222, 250, 255, .16)';
  ctx.lineWidth = 1.5;
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const center = (lon / 360) * width;
    ctx.beginPath();
    ctx.ellipse(center, height / 2, width * 0.018, height * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // A subtle stipple keeps the texture from looking too digitally smooth.
  let seed = 1421;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 16000; i += 1) {
    const x = random() * width;
    const y = random() * height;
    ctx.fillStyle = random() > 0.52 ? 'rgba(220,255,235,.15)' : 'rgba(9,31,71,.12)';
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createCloudMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let seed = 91;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 125; i += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const rx = 10 + random() * 34;
    const ry = 3 + random() * 9;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, rx);
    cloud.addColorStop(0, 'rgba(255,255,255,.48)');
    cloud.addColorStop(.48, 'rgba(218,250,255,.24)');
    cloud.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, random() * .4, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createStarfield(scene) {
  const count = 650;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorOptions = [new THREE.Color('#f8e7d9'), new THREE.Color('#a9e9f2'), new THREE.Color('#f6c177'), new THREE.Color('#d7c9ff')];
  let seed = 321;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i += 1) {
    const radius = 11 + random() * 17;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    const color = colorOptions[Math.floor(random() * colorOptions.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.045, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.88, depthWrite: false });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

export function createEarthScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia('(max-width: 680px)').matches ? 1.45 : 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  scene.add(new THREE.AmbientLight(0xb4d9ff, 1.05));
  const keyLight = new THREE.DirectionalLight(0xffe5c3, 3.1);
  keyLight.position.set(-4.2, 4.4, 6.5);
  scene.add(keyLight);
  const coolLight = new THREE.PointLight(0x45c9ff, 58, 18, 2);
  coolLight.position.set(4.3, -1.8, 3.5);
  scene.add(coolLight);
  const rimLight = new THREE.PointLight(0xff775e, 36, 14, 2);
  rimLight.position.set(-4, -3, -3);
  scene.add(rimLight);

  const starfield = createStarfield(scene);
  const earthSystem = new THREE.Group();
  scene.add(earthSystem);
  const earth = new THREE.Group();
  earthSystem.add(earth);

  const radius = 1.86;
  const geometry = new THREE.SphereGeometry(radius, 96, 72);
  const earthTexture = createEarthMap();
  const earthMaterial = new THREE.MeshPhysicalMaterial({
    map: earthTexture,
    roughness: 0.48,
    metalness: 0.11,
    clearcoat: 0.64,
    clearcoatRoughness: 0.32,
    emissive: new THREE.Color('#09254a'),
    emissiveIntensity: 0.15,
  });
  const globe = new THREE.Mesh(geometry, earthMaterial);
  earth.add(globe);

  const cloudTexture = createCloudMap();
  const cloudSphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.012, 72, 56),
    new THREE.MeshStandardMaterial({ map: cloudTexture, transparent: true, opacity: 0.52, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
  );
  earth.add(cloudSphere);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.105, 72, 64),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color('#83dfff') }, warmColor: { value: new THREE.Color('#ff8c79') } },
      vertexShader: `varying vec3 vNormal; varying vec3 vPosition; void main(){ vNormal = normalize(normalMatrix * normal); vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vPosition = -mvPosition.xyz; gl_Position = projectionMatrix * mvPosition; }`,
      fragmentShader: `uniform vec3 glowColor; uniform vec3 warmColor; varying vec3 vNormal; varying vec3 vPosition; void main(){ vec3 viewDir = normalize(vPosition); float rim = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0); float glow = pow(rim, 2.6); vec3 color = mix(glowColor, warmColor, smoothstep(.35, .9, vNormal.y)); gl_FragColor = vec4(color, glow * .56); }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  earth.add(atmosphere);

  const ringMaterial = new THREE.LineBasicMaterial({ color: '#f8d2b9', transparent: true, opacity: 0.58 });
  const ringCurve = new THREE.EllipseCurve(0, 0, 2.55, 0.94, 0, Math.PI * 2, false, 0.22);
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringCurve.getPoints(180).map((point) => new THREE.Vector3(point.x, point.y, 0)));
  const orbit = new THREE.LineLoop(ringGeometry, ringMaterial);
  orbit.rotation.set(0.72, -0.42, -0.28);
  earthSystem.add(orbit);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.09, 0.009, 6, 160),
    new THREE.MeshBasicMaterial({ color: '#81e1d1', transparent: true, opacity: 0.4 }),
  );
  innerRing.rotation.set(0.98, 0.32, 0.16);
  earthSystem.add(innerRing);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 20, 16),
    new THREE.MeshStandardMaterial({ color: '#ff896d', emissive: '#d44d42', emissiveIntensity: 1.4, roughness: 0.25, metalness: 0.15 }),
  );
  earthSystem.add(moon);
  const moonGlow = new THREE.PointLight(0xff715b, 5.5, 2.5, 2);
  moon.add(moonGlow);

  const haloGeometry = new THREE.RingGeometry(2.45, 2.47, 160);
  const halo = new THREE.Mesh(haloGeometry, new THREE.MeshBasicMaterial({ color: '#ffd99f', transparent: true, opacity: 0.22, side: THREE.DoubleSide }));
  halo.rotation.set(1.23, 0.1, 0.12);
  earthSystem.add(halo);

  const pointer = { x: 0, y: 0 };
  const targetPointer = { x: 0, y: 0 };
  const scroll = { progress: 0 };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => window.matchMedia('(max-width: 680px)').matches;
  let active = true;
  let rafId = 0;
  let lastTime = 0;

  const handlePointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    targetPointer.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    targetPointer.y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  };
  const handlePointerLeave = () => { targetPointer.x = 0; targetPointer.y = 0; };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, bounds.height, false);
    if (isSmall()) {
      earthSystem.position.set(0, 0.66, 0);
      earthSystem.scale.setScalar(0.48);
    } else {
      earthSystem.position.set(1.18, -0.04, 0);
      earthSystem.scale.setScalar(1);
    }
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement || canvas);
  resize();

  function render(time) {
    rafId = requestAnimationFrame(render);
    if (!active || document.hidden) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;
    const elapsed = time * 0.001;

    pointer.x += (targetPointer.x - pointer.x) * 0.045;
    pointer.y += (targetPointer.y - pointer.y) * 0.045;
    const scrollEase = scroll.progress * scroll.progress;
    const baseSpin = reduceMotion ? 0.075 : 0.12;
    earth.rotation.y = elapsed * baseSpin + pointer.x * 0.3 + scrollEase * 2.9;
    earth.rotation.x = pointer.y * 0.12 + Math.sin(elapsed * 0.23) * 0.025 + scroll.progress * 0.26;
    cloudSphere.rotation.y = earth.rotation.y - elapsed * 0.018;
    cloudSphere.rotation.x = earth.rotation.x + Math.sin(elapsed * 0.18) * 0.018;
    earthSystem.rotation.z = Math.sin(elapsed * 0.12) * 0.018 + scroll.progress * 0.1;
    starfield.rotation.y = elapsed * 0.003;
    moon.position.set(Math.cos(elapsed * 0.36) * 2.58, Math.sin(elapsed * 0.36) * 0.94, Math.sin(elapsed * 0.36) * 0.72);
    moon.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.08);

    const zoom = 1 + scrollEase * 1.02;
    earthSystem.scale.setScalar((isSmall() ? 0.48 : 1) * zoom);
    earthSystem.position.y = (isSmall() ? 0.66 : -0.04) + Math.sin(elapsed * 0.42) * 0.055 + scrollEase * -0.08;
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(render);

  const observer = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) lastTime = 0;
  }, { rootMargin: '100px' });
  observer.observe(canvas);
  canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
  canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true });

  return {
    setProgress(value) { scroll.progress = clamp(value, 0, 1); },
    setActive(value) { active = value; },
    dispose() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      observer.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      geometry.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      earthMaterial.dispose();
      renderer.dispose();
    },
  };
}
