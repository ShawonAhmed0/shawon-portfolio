/**
 * The hero's post-processing pass.
 *
 * HeroCanvas paints its bloom field into an offscreen 2D canvas; this uploads
 * that as a texture and runs it through a fragment shader for the things 2D
 * canvas cannot express: per-channel lens dispersion, halation bleeding out of
 * the highlights, barrel distortion, and grain generated in screen space so it
 * stays the same size no matter how large the field is drawn.
 *
 * Returns null when WebGL is unavailable, and the caller falls back to
 * blitting the 2D canvas straight to the screen. The field still looks right
 * without this — it just loses the film character.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_vel;
uniform float u_light;
varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 c = v_uv - 0.5;
  float r2 = dot(c, c);

  // Barrel distortion. Tiny — this should register as the field having a lens
  // in front of it, not as a fisheye.
  vec2 uv = 0.5 + c * (1.0 + 0.05 * r2);

  // Lateral dispersion: zero at the optical axis, growing toward the corners,
  // and opening up further the faster the page is moving.
  float amt = (0.0009 + u_vel * 0.0075) * (r2 * 4.0);
  vec3 col;
  col.r = texture2D(u_tex, uv + vec2(amt, 0.0)).r;
  col.g = texture2D(u_tex, uv).g;
  col.b = texture2D(u_tex, uv - vec2(amt, 0.0)).b;

  // Halation: sample a cross, keep only what is already bright, add it back.
  // Real halation is light scattering back off the film base, so it only
  // shows around highlights — hence the threshold rather than a flat blur.
  vec3 bl = texture2D(u_tex, uv + vec2(0.005, 0.0)).rgb;
  bl += texture2D(u_tex, uv - vec2(0.005, 0.0)).rgb;
  bl += texture2D(u_tex, uv + vec2(0.0, 0.005)).rgb;
  bl += texture2D(u_tex, uv - vec2(0.0, 0.005)).rgb;
  bl *= 0.25;
  col += max(bl - 0.62, 0.0) * 0.5;

  // Grain in screen space, so it stays fixed-size like real emulsion instead
  // of scaling with the field.
  float g = hash(gl_FragCoord.xy + fract(u_time) * 100.0) - 0.5;
  col += g * mix(0.030, 0.016, u_light);

  // Vignette, lighter on paper than on ink.
  col *= 1.0 - r2 * mix(0.32, 0.14, u_light);

  gl_FragColor = vec4(col, 1.0);
}`;

export type HeroPost = {
  resize(w: number, h: number): void;
  render(source: TexImageSource, time: number, vel: number, light: number): void;
  dispose(): void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function createHeroPost(canvas: HTMLCanvasElement): HeroPost | null {
  const gl = (canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  }) ?? null) as WebGLRenderingContext | null;
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = vs && fs ? gl.createProgram() : null;
  if (!vs || !fs || !prog) return null;

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // CLAMP_TO_EDGE matters: distortion and dispersion both sample outside the
  // unit square at the corners, and REPEAT would wrap the far edge into view.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const uTime = gl.getUniformLocation(prog, "u_time");
  const uVel = gl.getUniformLocation(prog, "u_vel");
  const uLight = gl.getUniformLocation(prog, "u_light");

  return {
    resize(w, h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    },
    render(source, time, vel, light) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uVel, vel);
      gl.uniform1f(uLight, light);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
