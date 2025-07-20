import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';
import { SHARED_GEOMETRIES, SHARED_MATERIALS } from '../../utils/threeJsAssets';

const Building = React.memo(function Building({ position, color, height = 1.2 }) {
  const windowPositions = useMemo(() => {
    const positions = [];
    const windowRows = Math.max(1, Math.floor(height * 2.5));
    const windowCols = 3;
    
    for (let i = 0; i < windowRows; i++) {
      for (let j = 0; j < windowCols; j++) {
        const y = height / 2 - 0.2 - i * (height / windowRows * 0.8);
        const x = 0.2 - 0.2 * j;
        
        // Add windows on all four sides
        positions.push(
          [x, y, 0.36],     // Front
          [x, y, -0.36],    // Back
          [0.36, y, x],     // Right
          [-0.36, y, x]     // Left
        );
      }
    }
    return positions;
  }, [height]);
  
  const buildingMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color,
      roughness: 0.8,
      metalness: 0.1
    }), [color]);
  
  return (
    <group position={position}>
      {/* Main building structure */}
      <mesh 
        castShadow 
        receiveShadow 
        geometry={SHARED_GEOMETRIES.box} 
        material={buildingMaterial} 
        scale={[0.8, height, 0.8]} 
        position={[0, height / 2, 0]}
      />
      
      {/* Windows */}
      <Instances limit={windowPositions.length}>
        <boxGeometry args={[0.15, 0.1, 0.02]} />
        <meshStandardMaterial 
          color="#e3f2fd" 
          emissive="#e3f2fd" 
          emissiveIntensity={0.3}
          transparent={true}
          opacity={0.9}
        />
        {windowPositions.map((pos, i) => (
          <Instance key={i} position={[pos[0], pos[1] + height / 2, pos[2]]} />
        ))}
      </Instances>
      
      {/* Building base/foundation */}
      <mesh
        receiveShadow
        geometry={SHARED_GEOMETRIES.box}
        material={SHARED_MATERIALS.darkGray}
        scale={[0.85, 0.1, 0.85]}
        position={[0, 0.05, 0]}
      />
    </group>
  );
});

export default Building;