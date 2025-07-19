import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SHARED_GEOMETRIES, SHARED_MATERIALS, RIM_LIGHT_COLORS } from '../../utils/threeJsAssets';

const UFO = React.memo(function UFO({ position, scanning, onClick }) {
  const mesh = useRef();
  const beamRef = useRef();
  
  const rimLights = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * (Math.PI * 2);
      return [Math.cos(angle) * 0.85, -0.09, Math.sin(angle) * 0.85];
    }), []
  );

  const rimLightMaterials = useMemo(() => 
    RIM_LIGHT_COLORS.map(color => new THREE.MeshStandardMaterial({ 
      color, 
      emissive: color, 
      emissiveIntensity: 1.2 
    })), []
  );

  useFrame(({ clock }) => {
    if (mesh.current) {
      const elapsed = clock.getElapsedTime();
      mesh.current.position.y = position[1] + Math.sin(elapsed * 2) * 0.2;
      mesh.current.rotation.y = Math.sin(elapsed) * 0.2;
    }
    if (scanning && beamRef.current?.material) {
      beamRef.current.material.opacity = 0.9 + 0.1 * Math.sin(clock.getElapsedTime() * 2);
    }
  });
  
  return (
    <group ref={mesh} position={position} onClick={onClick}>
      <mesh castShadow receiveShadow scale={[1.7, 0.18, 1.7]} geometry={SHARED_GEOMETRIES.ufoBase} material={SHARED_MATERIALS.metal} />
      <mesh position={[0, -0.18, 0]} scale={[1.1, 0.25, 1.1]} geometry={SHARED_GEOMETRIES.ufoBase} material={SHARED_MATERIALS.metalCyan} />
      <mesh position={[0, 0.18, 0]} geometry={SHARED_GEOMETRIES.ufoGlass} material={SHARED_MATERIALS.glass} />
      {rimLights.map((pos, i) => (
        <mesh key={i} position={pos} geometry={SHARED_GEOMETRIES.rimLight} material={rimLightMaterials[i % 4]} />
      ))}
      {scanning && (
        <mesh ref={beamRef} position={[0, -2.5, 0]} geometry={SHARED_GEOMETRIES.ufoBeam} material={SHARED_MATERIALS.cyanLight} />
      )}
    </group>
  );
});

export default UFO;