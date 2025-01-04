/*
Copyright (C) 2025 nudel contributors
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
// The standard fullscreen vertex shader.
const vertexShader = `#version 300 es
precision highp float;
layout(location=0) in vec2 position;
void main() {
  gl_Position = vec4(position, 1, 1);
}
`;

// Make the fragment source, similar to the one from shadertoy.
function mkFragmentShader(code) {
  return `#version 300 es
precision highp float;
out vec4 oColor;
uniform float iTime;
uniform vec2 iResolution;

#define NUDEL 1

${code}

void main(void) {
  mainImage(oColor, gl_FragCoord.xy);
}
`;
}

// Helper class to handle uniform updates
class UniformValue {
  constructor(count, draw) {
    this.draw = draw;
    this.value = new Array(count).fill(0);
    this.frameModifier = new Array(count).fill(null);
  }

  // Helper to perform a simple increment
  incr(value, pos = 0) {
    const idx = pos % this.value.length;
    this.value[idx] += value;
    this.frameModifier[idx] = null;
    this.draw();
  }

  // The value can be a function that will be called for each rendering frame
  set(value, pos = 0) {
    const idx = pos % this.value.length;
    if (typeof value === "function") {
      this.frameModifier[idx] = value(this.value[idx]);
    } else {
      this.value[idx] = value;
      this.frameModifier[idx] = null;
    }
    this.draw();
  }

  get(pos = 0) {
    return this.value[pos % this.value.length];
  }

  // This function is called for every frame, allowing to run a smooth modifier
  _frameUpdate(elapsed) {
    this.value = this.value.map((value, idx) =>
      this.frameModifier[idx] ? this.frameModifier[idx](value, elapsed) : value
    );
    return this.value;
  }

  // When the shader is update, this function adjust the number of values, preserving the current one
  _resize(count) {
    if (count != this.count) {
      count = Math.max(1, count);
      resizeArray(this.value, count, 0);
      resizeArray(this.frameModifier, count, null);
    }
  }
}

// Shrink or extend an array
function resizeArray(arr, size, defval) {
  if (arr.length > size) arr.length = size;
  else arr.push(...new Array(size - arr.length).fill(defval));
}

// Setup the instance's uniform after shader compilation.
function setupUniforms(instance) {
  const newUniforms = new Set();
  const draw = () => {
    // Start the drawing loop
    instance.age = 0;
    if (!instance.drawing) {
      instance.drawing = requestAnimationFrame(instance.update);
    }
  };

  // Collect every available uniforms
  let gl = instance.gl;
  const numUniforms = instance.gl.getProgramParameter(
    instance.program,
    gl.ACTIVE_UNIFORMS,
  );
  for (let i = 0; i < numUniforms; ++i) {
    const inf = gl.getActiveUniform(instance.program, i);

    // Arrays have a `[0]` suffix in their name, drop that
    const name = inf.name.replace("[0]", "");

    // Figure out how many values is this uniform, and how to update it.
    let count = inf.size;
    let updateFunc = "uniform1fv";
    switch (inf.type) {
      case gl.FLOAT_VEC2:
        count *= 2;
        updateFunc = "uniform2fv";
        break;
      case gl.FLOAT_VEC3:
        count *= 3;
        updateFunc = "uniform3fv";
        break;
      case gl.FLOAT_VEC4:
        count *= 4;
        updateFunc = "uniform4fv";
        break;
    }

    // This is a new uniform
    if (!instance.uniforms[name]) {
      instance.uniforms[name] = new UniformValue(count, draw);
    } // This is a known uniform, make sure it's size is correct
    else instance.uniforms[name]._resize(count);

    // Record it's location for the 'updateUniforms' below.
    instance.uniforms[name].loc = gl.getUniformLocation(
      instance.program,
      inf.name,
    );
    instance.uniforms[name].updateFunc = updateFunc;

    // Record the name so that unused uniform can be deleted below
    newUniforms.add(name);
  }

  // Remove deleted uniforms
  Object.keys(instance.uniforms).forEach((name) => {
    if (!newUniforms.has(name)) delete instance.uniforms[name];
  });
}

// Update the uniforms for a given drawFrame call.
function updateUniforms(gl, now, elapsed, uniforms) {
  Object.entries(uniforms).forEach(([name, uniform]) => {
    try {
      if (name == "iTime") {
        gl.uniform1f(uniform.loc, now);
      } else if (name == "iResolution") {
        gl.uniform2f(uniform.loc, gl.canvas.width, gl.canvas.height);
      } else {
        const value = uniform._frameUpdate(elapsed);
        // Send the value to the GPU
        // console.log('updateUniforms:', name, uniform.updateFunc, value);
        gl[uniform.updateFunc](uniform.loc, value);
      }
    } catch (err) {
      console.warn("uniform error");
      console.error(err);
    }
  });
}

// Setup the canvas and return the WebGL context.
function setupContext(canvas) {
  // TODO: support custom size
  const width = 400;
  const height = 300;
  canvas.width = width;
  canvas.height = height;
  const top = 60;
  canvas.style =
    `pointer-events:none;width:${width}px;height:${height}px;position:fixed;top:${top}px;left:23px`;
  return canvas.getContext("webgl2");
}

function createProgram(gl, vertex, fragment) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw err;
    }
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw err;
  }
  gl.useProgram(program);
  return program;
}

// Setup the shader instance
function initializeShaderInstance(gl, code) {
  // Two triangle to cover the whole canvas
  const mkPositionArray = () => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(buf, 2, gl.FLOAT, false, 0, 0);
    return vao;
  };

  let array = mkPositionArray();
  let program = createProgram(gl, vertexShader, code);
  const instance = { gl, code, program, array, uniforms: {} };
  setupUniforms(instance);
  // Render frame logic
  let prev = performance.now() / 1000;
  instance.age = 0;
  instance.update = () => {
    const now = performance.now() / 1000;
    const elapsed = instance.age == 0 ? 1 / 60 : now - prev;
    prev = now;
    // console.log('drawing!');

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(array);

    // Send the uniform values to the GPU
    updateUniforms(instance.gl, now, elapsed, instance.uniforms);

    // Draw the quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // After sometime, if no update happened, stop the animation loop to save cpu cycles
    if (instance.uniforms.iTime || instance.age++ < 100) requestAnimationFrame(instance.update);
    else instance.drawing = false;
  };
  instance.update();
  return instance;
}

// Update the instance program
function reloadShaderInstanceCode(instance, code) {
  const program = createProgram(instance.gl, vertexShader, code);
  instance.gl.deleteProgram(instance.program);
  instance.program = program;
  instance.code = code;
  setupUniforms(instance);
  instance.update();
}

export class ShaderSession {
  constructor({ onError, canvas }) {
    this.onError = onError;
    this.canvas = canvas;
    this.gl = setupContext(canvas);
    this.instance = null;
  }
  resize() {
    console.log("Not Implemented shader resize");
  }
  async eval(msg) {
    const code = mkFragmentShader(msg.body);
    try {
      if (!this.instance) {
        this.instance = initializeShaderInstance(this.gl, code);
      } else {
        reloadShaderInstanceCode(this.instance, code);
      }
      this.uniforms = this.instance.uniforms;
      console.log("Shader updated!")
    } catch (err) {
      this.onError(`${err}`, msg.docId);
    }
  }
}
