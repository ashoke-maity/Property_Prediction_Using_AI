import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';
import { SHARED_GEOMETRIES } from '../../utils/threeJsAssets';

const Building = React.memo(function Building({ position, color, height = 1.2 }) {
  const windowPositions = useMemo(() => {
    const positions = [];
    const windowRows = Math.floor(height * 3);
    for (let i = 0; i < windowRows; i++) {
      for (let j = 0; j < 3; j++) {
        const y = height / 2 - 0.25 - i * 0.3;
        const x = 0.22 - 0.22 * j;
        positions.push([x, y, 0.36], [x, y, -0.36], [0.36, y, x], [-0.36, y, x]);
      }
    }
    return positions;
  }, [height]);
  
  const buildingMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow geometry={SHARED_GEOMETRIES.box} material={buildingMaterial} scale={[0.7, height, 0.7]} />
      <Instances limit={windowPositions.length}>
        <boxGeometry args={[0.18, 0.12, 0.01]} />
        <meshStandardMaterial color="#e3f2fd" emissive="#e3f2fd" emissiveIntensity={0.5} />
        {windowPositions.map((pos, i) => <Instance key={i} position={pos} />)}
      </Instances>
    </group>
  );
});

export default Building;