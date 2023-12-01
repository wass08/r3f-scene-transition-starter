import {
  CameraControls,
  Environment,
  PerspectiveCamera,
  useFBO,
  useGLTF,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";

const nbModes = 3;

export const Experience = () => {
  const viewport = useThree((state) => state.viewport);
  const renderedScene = useRef();
  const exampleScene = useRef();

  const renderTarget = useFBO();
  const renderTarget2 = useFBO();
  const renderMaterial = useRef();
  const [mode, setMode] = useState(0);
  const [prevMode, setPrevMode] = useState(0);

  const { scene: modernKitchenScene, materials } = useGLTF(
    "/models/modern_kitchen.glb"
  );

  const itemsToChangeMaterial = useRef([]);
  const modeGroups = useRef([]);
  useEffect(() => {
    const items = ["Wall", "Floor", "Chair", "Cupboard"];
    items.forEach((item) => {
      const obj = modernKitchenScene.getObjectByName(item);
      if (obj) {
        itemsToChangeMaterial.current.push(obj);
      }
    });
    for (let i = 0; i < nbModes; i++) {
      const group = modernKitchenScene.getObjectByName(`Mode${i}`);
      if (group) {
        modeGroups.current.push(group);
      }
    }
  }, [modernKitchenScene]);

  useEffect(() => {
    if (mode === prevMode) {
      return;
    }
    renderMaterial.current.progression = 0;
  }, [mode]);

  useFrame(({ gl, scene }, delta) => {
    renderedScene.current.visible = true;
    exampleScene.current.visible = false;

    gl.setRenderTarget(renderTarget);

    itemsToChangeMaterial.current.forEach((item) => {
      item.material = materials[item.name + prevMode];
    });
    modeGroups.current.forEach((group, index) => {
      group.visible = index === prevMode;
    });
    renderMaterial.current.progression = MathUtils.lerp(
      renderMaterial.current.progression,
      progressionTarget,
      delta * transitionSpeed
    );
    gl.render(scene, renderCamera.current);
    gl.setRenderTarget(renderTarget2);

    // EXAMPLE
    // renderedScene.current.visible = false;
    // exampleScene.current.visible = true;
    // END EXAMPLE

    itemsToChangeMaterial.current.forEach((item) => {
      item.material = materials[item.name + mode];
    });
    modeGroups.current.forEach((group, index) => {
      group.visible = index === mode;
    });
    gl.render(scene, renderCamera.current);
    renderedScene.current.visible = false;
    exampleScene.current.visible = false;

    gl.setRenderTarget(null);
    renderMaterial.current.map = renderTarget.texture;
  });

  const renderCamera = useRef();
  const controls = useRef();

  useEffect(() => {
    controls.current.camera = renderCamera.current;
    controls.current.setLookAt(
      2.0146122041349432,
      2.822796205893349,
      10.587088991637922,
      1.0858141754116573,
      1.9366397611967157,
      1.7546919697281576
    );
  }, []);

  const { progressionTarget, transitionSpeed } = useControls({
    transitionSpeed: {
      value: 2,
      min: 0.3,
      max: 10,
    },
    progressionTarget: {
      value: 1,
    },
    mode: {
      value: mode,
      options: [...Array(nbModes).keys()],
      onChange: (value) => {
        setMode((mode) => {
          setPrevMode(mode);
          return value;
        });
      },
    },
    transition: {
      value: 0,
      options: {
        Horizontal: 0,
        Vertical: 1,
      },
      onChange: (value) => {
        renderMaterial.current.transition = value;
      },
    },
  });

  useEffect(() => {
    modernKitchenScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [modernKitchenScene]);

  return (
    <>
      <PerspectiveCamera near={0.5} ref={renderCamera} />
      <CameraControls
        enablePan={false}
        minPolarAngle={DEG2RAD * 70}
        maxPolarAngle={DEG2RAD * 85}
        minAzimuthAngle={DEG2RAD * -30}
        maxAzimuthAngle={DEG2RAD * 30}
        minDistance={5}
        maxDistance={9}
        ref={controls}
      />

      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        {/* <meshBasicMaterial toneMapped={false} ref={renderMaterial} /> */}
        <transitionMaterial
          ref={renderMaterial}
          tex={renderTarget.texture}
          tex2={renderTarget2.texture}
          toneMapped={false}
        />
      </mesh>
      <group ref={renderedScene}>
        <primitive object={modernKitchenScene} rotation-y={Math.PI / 2} />
      </group>
      <group ref={exampleScene}>
        <mesh position-x={1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position-x={-1}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>
      <Environment preset="sunset" blur={0.4} background />
    </>
  );
};

useGLTF.preload("/models/modern_kitchen.glb");
