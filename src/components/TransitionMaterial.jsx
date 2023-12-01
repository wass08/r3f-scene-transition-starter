import { shaderMaterial } from "@react-three/drei";

export const TransitionMaterial = shaderMaterial(
  {
    progression: 1,
    tex: undefined,
    tex2: undefined,
    transition: 0,
  },
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  /*glsl*/ ` 
    varying vec2 vUv;
    uniform sampler2D tex;
    uniform sampler2D tex2;
    uniform float progression;
    uniform int transition;

   

    void main() {
      vec2 uv = vUv;

      vec4 _texture = texture2D(tex, uv);
      vec4 _texture2 = texture2D(tex2, uv);

      
      vec4 finalTexture;
      if (transition == 0) { // HORIZONTAL
       finalTexture = mix(_texture2, _texture, step(progression, uv.x));
      }
      if (transition == 1) { // VERTICAL
        finalTexture = mix(_texture2, _texture, step(progression, uv.y));
      }
      gl_FragColor = finalTexture;
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`
);
