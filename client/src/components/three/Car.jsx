import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SHARED_GEOMETRIES, SHARED_MATERIALS, CAR_COLORS } from '../../utils/threeJsAssets';

const Car = React.memo(function Car({ position, rotation = [0, 0, 0], color }) {
  const carColor = useMemo(() => 
    color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)], [color]);
  
  const carMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: carColor,
      metalness: 0.6,
      roughness: 0.4
    }), [carColor]);

  return (
    <group position={position} rotation={rotation}>
      {/* Car body */}
      <mesh
        geometry={SHARED_GEOMETRIES.carBody}
        material={carMaterial}
        position={[0, 0.06, 0]}
        castShadow
      />
      
      {/* Car roof */}
      <mesh
        geometry={SHARED_GEOMETRIES.carRoof}
        material={carMaterial}
        position={[0, 0.14, 0]}
        castShadow
      />
      
      {/* Windshield */}
      <mesh
        geometry={SHARED_GEOMETRIES.carWindow}
        material={SHARED_MATERIALS.carGlass}
        position={[0.19, 0.14, 0]}
      />
      
      {/* Rear window */}
      <mesh
        geometry={SHARED_GEOMETRIES.carWindow}
        material={SHARED_MATERIALS.carGlass}
        position={[-0.19, 0.14, 0]}
      />
      
      {/* Side windows */}
      <mesh
        geometry={SHARED_GEOMETRIES.carSideWindow}
        material={SHARED_MATERIALS.carGlassSide}
        position={[0, 0.14, 0.09]}
      />
      <mesh
        geometry={SHARED_GEOMETRIES.carSideWindow}
        material={SHARED_MATERIALS.carGlassSide}
        position={[0, 0.14, -0.09]}
      />
      
      {/* Wheels */}
      <mesh
        geometry={SHARED_GEOMETRIES.carWheel}
        material={SHARED_MATERIALS.black}
        position={[0.12, 0.04, 0.12]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
      <mesh
        geometry={SHARED_GEOMETRIES.carWheel}
        material={SHARED_MATERIALS.black}
        position={[0.12, 0.04, -0.12]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
      <mesh
        geometry={SHARED_GEOMETRIES.carWheel}
        material={SHARED_MATERIALS.black}
        position={[-0.12, 0.04, 0.12]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
      <mesh
        geometry={SHARED_GEOMETRIES.carWheel}
        material={SHARED_MATERIALS.black}
        position={[-0.12, 0.04, -0.12]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
      
      {/* Headlights */}
      <mesh
        geometry={SHARED_GEOMETRIES.carLight}
        material={SHARED_MATERIALS.carHeadlight}
        position={[0.21, 0.08, 0.08]}
      />
      <mesh
        geometry={SHARED_GEOMETRIES.carLight}
        material={SHARED_MATERIALS.carHeadlight}
        position={[0.21, 0.08, -0.08]}
      />
      
      {/* Taillights */}
      <mesh
        geometry={SHARED_GEOMETRIES.carLight}
        material={SHARED_MATERIALS.carTaillight}
        position={[-0.21, 0.08, 0.08]}
      />
      <mesh
        geometry={SHARED_GEOMETRIES.carLight}
        material={SHARED_MATERIALS.carTaillight}
        position={[-0.21, 0.08, -0.08]}
      />
    </group>
  );
});

export default Car;