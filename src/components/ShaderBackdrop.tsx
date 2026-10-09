import { useEffect, useRef } from 'react'
import { accents, getState, hexToRgb, on, useStore } from '../lib/store'

const vertex = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

// Animated topographic contour field. Contours bend away from the pointer
// and glow in the accent color near it; scroll drifts the terrain.
const fragment = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform vec3 uAccent;
uniform float uPulse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5 * uRes) / uRes.y;
  float d = length(uv - m);
  float t = uTime * 0.04;

  vec2 q = vec2(fbm(uv * 1.3 + t), fbm(uv * 1.3 + vec2(5.2, 1.3) - t));
  vec2 w = uv + q * 1.2 + normalize(uv - m + 1e-4) * 0.18 * exp(-d * 4.0) * (1.0 + uPulse * 3.0);
  float h = fbm(w * 1.8 + vec2(0.0, uScroll * 0.35));

  float bands = 14.0;
  float c = fract(h * bands);
  float line = 1.0 - smoothstep(0.0, 0.07, min(c, 1.0 - c));
  float c5 = fract(h * bands / 5.0);
  float major = 1.0 - smoothstep(0.0, 0.03, min(c5, 1.0 - c5));

  float glow = exp(-d * 2.6) + uPulse * 0.6;
  vec3 col = vec3(0.039, 0.039, 0.035) + vec3(0.03) * h;
  vec3 lineCol = mix(vec3(0.17, 0.165, 0.15), uAccent, clamp(glow, 0.0, 1.0));
  col += lineCol * line * 0.55;
  col += uAccent * major * 0.25 * glow;
  col += uAccent * 0.06 * exp(-d * 5.0);

  float vig = smoothstep(1.25, 0.35, length(uv * vec2(0.8, 1.0)));
  col *= 0.55 + 0.45 * vig;
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader error')
  return shader
}

export function ShaderBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accent = useStore((s) => s.accent)
  const accentRef = useRef(hexToRgb(accents[getState().accent]))

  useEffect(() => {
    accentRef.current = hexToRgb(accents[accent])
  }, [accent])

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!canvas || !gl) {
      canvas?.classList.add('shader-fallback')
      return
    }

    let program: WebGLProgram
    try {
      program = gl.createProgram()!
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment))
      gl.linkProgram(program)
      gl.useProgram(program)
    } catch {
      canvas.classList.add('shader-fallback')
      return
    }

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = (name: string) => gl.getUniformLocation(program, name)
    const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse'), uScroll = u('uScroll'), uAccent = u('uAccent'), uPulse = u('uPulse')

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scale = Math.min(window.devicePixelRatio || 1, 1) * 0.5
    const mouse = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.4 }
    const eased = { ...mouse }
    const color = [...accentRef.current]
    let pulse = 0
    let raf = 0
    let running = true

    const resize = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * scale))
      canvas.height = Math.max(1, Math.floor(window.innerHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (reduce) draw(0)
    }

    const draw = (time: number) => {
      eased.x += (mouse.x - eased.x) * 0.06
      eased.y += (mouse.y - eased.y) * 0.06
      pulse *= 0.94
      for (let i = 0; i < 3; i++) color[i] += (accentRef.current[i] - color[i]) * 0.05
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, time / 1000)
      gl.uniform2f(uMouse, eased.x * scale, canvas.height - eased.y * scale)
      gl.uniform1f(uScroll, window.scrollY / window.innerHeight)
      gl.uniform3f(uAccent, color[0], color[1], color[2])
      gl.uniform1f(uPulse, pulse)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = (time: number) => {
      draw(time)
      if (running) raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onVisibility = () => {
      cancelAnimationFrame(raf)
      running = !document.hidden && !reduce
      if (running) raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    const offPulse = on('scatter', () => { pulse = 1 })
    const offConfetti = on('confetti', () => { pulse = 1 })
    if (reduce) draw(0)
    else raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      offPulse()
      offConfetti()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="shader" aria-hidden="true" />
}
