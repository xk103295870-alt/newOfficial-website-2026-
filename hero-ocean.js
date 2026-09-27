'use strict';

/* WNTC hero ocean. Original implementation, inspired by the VGPU FFT ocean.
 * Phillips spectrum → Hermitian time evolution → 2D inverse FFT → GPU particles.
 * WebGL2 keeps the static site build-free. No pointer interaction or remote assets.
 */
(() => {
  const canvas = document.querySelector('.hero-ocean');
  const hero = canvas?.closest('.hero');
  const toggle = hero?.querySelector('.hero-ocean-toggle');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(pointer: coarse)').matches;
  let gl, program, texture, vao, resizeObserver, observer;
  let frame = 0, last = 0, time = 0, visible = false, paused = false, failed = false;
  const N = compact ? 64 : 128;
  const count = N * N;
  const spectrumR = new Float32Array(count), spectrumI = new Float32Array(count);
  const omega = new Float32Array(count), real = new Float32Array(count), imag = new Float32Array(count);
  const pixels = new Float32Array(count);
  const reverse = new Uint16Array(N), cos = new Float32Array(N / 2), sin = new Float32Array(N / 2);
  let amplitude = 1;
  const size = 64;
  let seed = 92817;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed + 1) / 4294967297; }
  function gaussian() { return Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random()); }
  const bits = Math.log2(N);
  for (let i = 0; i < N; i++) {
    let r = 0, v = i;
    for (let bit = 0; bit < bits; bit++) { r = (r << 1) | (v & 1); v >>= 1; }
    reverse[i] = r;
    if (i < N / 2) { cos[i] = Math.cos(2 * Math.PI * i / N); sin[i] = Math.sin(2 * Math.PI * i / N); }
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const kx = (x <= N / 2 ? x : x - N) * 2 * Math.PI / size;
    const ky = (y <= N / 2 ? y : y - N) * 2 * Math.PI / size;
    const k2 = kx * kx + ky * ky, i = y * N + x;
    if (!k2) continue;
    const wind = (kx * .86 + ky * .51) / Math.sqrt(k2);
    const energy = Math.exp(-1 / (k2 * 15 * 15)) / (k2 * k2) * (.15 + .85 * wind * wind) * Math.exp(-k2 * .24);
    const a = Math.sqrt(energy / 2);
    spectrumR[i] = gaussian() * a; spectrumI[i] = gaussian() * a;
    omega[i] = Math.sqrt(9.81 * Math.sqrt(k2));
  }
  // In-place radix-2 inverse transforms along rows and columns.
  function inverse(offset, stride) {
    for (let j = 0; j < N; j++) {
      const k = reverse[j];
      if (k <= j) continue;
      const a = offset + j * stride, b = offset + k * stride;
      let tmp = real[a]; real[a] = real[b]; real[b] = tmp;
      tmp = imag[a]; imag[a] = imag[b]; imag[b] = tmp;
    }
    for (let len = 2; len <= N; len *= 2) {
      const half = len / 2, step = N / len;
      for (let block = 0; block < N; block += len) for (let j = 0; j < half; j++) {
        const a = offset + (block + j) * stride, b = a + half * stride;
        const c = cos[j * step], s = sin[j * step];
        const tr = real[b] * c - imag[b] * s, ti = real[b] * s + imag[b] * c;
        real[b] = real[a] - tr; imag[b] = imag[a] - ti;
        real[a] += tr; imag[a] += ti;
      }
    }
  }
  function simulate(t, normalize = false) {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x, opposite = ((N - y) % N) * N + (N - x) % N;
      const a = omega[i] * t, c = Math.cos(a), s = Math.sin(a);
      real[i] = (spectrumR[i] + spectrumR[opposite]) * c - (spectrumI[i] + spectrumI[opposite]) * s;
      imag[i] = (spectrumR[i] - spectrumR[opposite]) * s + (spectrumI[i] - spectrumI[opposite]) * c;
    }
    for (let i = 0; i < N; i++) inverse(i * N, 1);
    for (let i = 0; i < N; i++) inverse(i, N);
    if (normalize) {
      let variance = 0;
      for (let i = 0; i < count; i++) variance += real[i] * real[i] / (count * count);
      amplitude = .68 / Math.sqrt(variance / count);
    }
    for (let i = 0; i < count; i++) pixels[i] = real[i] * amplitude / count;
  }
  const vertexSource = `#version 300 es
  precision highp float;
  uniform sampler2D u_height;
  uniform vec2 u_resolution;
  uniform vec2 u_grid;
  uniform float u_dpr;
  out float v_alpha;
  out vec3 v_color;
  float heightAt(vec2 p) {
    vec2 uv = fract(p / 64.0) * float(textureSize(u_height, 0).x) - .5;
    vec2 f = fract(uv), base = floor(uv);
    float n = float(textureSize(u_height, 0).x);
    float a = texture(u_height, (base + .5) / n).r;
    float b = texture(u_height, (base + vec2(1.5,.5)) / n).r;
    float c = texture(u_height, (base + vec2(.5,1.5)) / n).r;
    float d = texture(u_height, (base + 1.5) / n).r;
    return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
  }
  void main() {
    float id = float(gl_VertexID);
    vec2 uv = vec2(mod(id,u_grid.x),floor(id/u_grid.x)) / (u_grid - 1.0);
    // Stagger the samples for a fine-grained surface, without a rigid square grid.
    uv.x += mod(floor(id/u_grid.x),2.0) * .5 / u_grid.x;
    vec2 p = vec2((uv.x-.5)*90.0, uv.y*94.0-8.0);
    float h = heightAt(p);
    vec3 normal = normalize(vec3(heightAt(p-vec2(.35,0.0))-heightAt(p+vec2(.35,0.0)),.7,
      heightAt(p-vec2(0.0,.35))-heightAt(p+vec2(0.0,.35))));
    vec3 pos = vec3(p.x,h,p.y);
    vec3 cam = vec3(0.0,10.0,-15.0);
    vec3 forward = normalize(vec3(0.0,-.32,1.0));
    vec3 up = vec3(0.0,forward.z,-forward.y);
    vec3 rel = pos-cam;
    float depth = dot(rel,forward);
    float aspect = u_resolution.x / u_resolution.y;
    vec2 projected = vec2(rel.x/max(aspect,.65),dot(rel,up))*1.6/depth;
    projected.y -= .11;
    gl_Position = vec4(projected, .2, 1.0);
    gl_PointSize = clamp(55.0/depth, .85, 2.05)*u_dpr;
    float light = pow(max(dot(normal,normalize(vec3(-.4,.8,-.6))),0.0),5.0);
    float fade = (1.0-smoothstep(42.0,83.0,p.y))*smoothstep(-1.03,-.75,projected.y);
    fade *= 1.0-smoothstep(.83,1.18,abs(projected.x));
    v_alpha = fade * (.26 + light*.5);
    v_color = mix(vec3(.40,.49,.55),vec3(.65,.73,.77),light);
  }`;
  const fragmentSource = `#version 300 es
  precision highp float;
  in float v_alpha;
  in vec3 v_color;
  out vec4 color;
  void main() {
    float d = length(gl_PointCoord-.5);
    float a = (1.0-smoothstep(.12,.5,d))*v_alpha;
    color = vec4(v_color*a,a);
  }`;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Ocean shader compilation failed'); }
    return shader;
  }
  function halt() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function fallback() {
    failed = true; halt(); hero.dataset.ocean = 'fallback'; if (toggle) toggle.hidden = true;
    if (gl && !gl.isContextLost()) {
      if (texture) gl.deleteTexture(texture);
      if (program) gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
    }
  }
  if (reduced.matches || navigator.connection?.saveData) { hero.dataset.ocean = 'fallback'; return; }
  try {
    gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return fallback();
    const vs = compile(gl.VERTEX_SHADER, vertexSource), fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Ocean program link failed');
    gl.useProgram(program);
    vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    simulate(0, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, N, N, 0, gl.RED, gl.FLOAT, pixels);
    gl.uniform1i(gl.getUniformLocation(program, 'u_height'), 0);
    const gridX = compact ? 300 : 600, gridY = compact ? 180 : 360;
    gl.uniform2f(gl.getUniformLocation(program, 'u_grid'), gridX, gridY);
    const resolution = gl.getUniformLocation(program, 'u_resolution'), dprUniform = gl.getUniformLocation(program, 'u_dpr');
    const dpr = Math.min(devicePixelRatio || 1, compact ? 1.25 : 1.5);
    function resize() {
      canvas.width = Math.max(1, Math.round(hero.clientWidth*dpr));
      canvas.height = Math.max(1, Math.round(hero.clientHeight*dpr));
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform2f(resolution,canvas.width,canvas.height); gl.uniform1f(dprUniform,dpr);
    }
    function draw() {
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,N,N,gl.RED,gl.FLOAT,pixels);
      gl.drawArrays(gl.POINTS,0,gridX*gridY);
    }
    function allowed() { return !failed && visible && !document.hidden && !paused && !reduced.matches; }
    function tick(now) {
      frame = 0;
      if (!allowed()) return;
      if (!last || now-last >= 1000/30) {
        time += last ? Math.min((now-last)/1000,.08)*.48 : 0;
        last = now;
        simulate(time); draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      if (toggle) toggle.hidden = failed || reduced.matches;
      if (reduced.matches) hero.dataset.ocean = 'fallback';
      else if (!failed) hero.dataset.ocean = 'ready';
      if (allowed() && !frame) frame = requestAnimationFrame(tick);
      else if (!allowed()) halt();
    }
    resize(); draw(); hero.dataset.ocean = 'ready'; if (toggle) toggle.hidden = false;
    resizeObserver = new ResizeObserver(() => { if (!failed) { resize(); draw(); } });
    resizeObserver.observe(hero);
    observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(hero);
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',sync);
    if (toggle) toggle.addEventListener('click',() => { paused = !paused; toggle.setAttribute('aria-pressed',String(paused)); sync(); });
    canvas.addEventListener('webglcontextlost',event => { event.preventDefault(); fallback(); });
    addEventListener('pagehide',halt);
    addEventListener('pageshow',sync);
  } catch (error) { fallback(); }
})();
