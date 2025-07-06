import React, { useRef, useState, useMemo, useCallback } from 'react';
import Header from '../../components/web/Header';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars, PerspectiveCamera, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import ufoImg from '../../assets/logo.png';
import trendChart from '../../assets/trend-chart.svg';
import comparisonChart from '../../assets/comparison-chart.svg';
import featureImportance from '../../assets/feature-importance.svg';
import similarProperties from '../../assets/similar-properties.svg';

// Optimized constants to avoid recalculations
const MATH_PI_2 = Math.PI * 2;
const MATH_PI_DIV_2 = Math.PI / 2;
const MATH_PI_DIV_8 = Math.PI / 8;
const MATH_PI_DIV_6 = Math.PI / 6;
const MATH_PI_DIV_7 = Math.PI / 7;

// Precomputed colors
const RIM_LIGHT_COLORS = ["#ffd600", "#ff1744", "#00e676", "#2979ff"];
const PERSON_COLORS = ['#fbc02d', '#ffb300', '#90caf9', '#e57373'];
const CAR_COLORS = ['#1976d2', '#e53935', '#43a047', '#ff9800', '#9c27b0', '#795548', '#607d8b'];
const FLOWER_COLORS = ['#ff4081', '#ffd600', '#7c4dff', '#00e676'];
const TRAFFIC_LIGHT_STATES = ['red', 'yellow', 'green'];

// Shared geometries for performance optimization
const SHARED_GEOMETRIES = {
  // Basic shapes
  sphere: new THREE.SphereGeometry(1, 16, 16),
  sphereLow: new THREE.SphereGeometry(1, 8, 8),
  box: new THREE.BoxGeometry(1, 1, 1),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
  cylinderLow: new THREE.CylinderGeometry(1, 1, 1, 8),
  cylinderHigh: new THREE.CylinderGeometry(1, 1, 1, 32),
  cone: new THREE.ConeGeometry(1, 1, 12),
  torus: new THREE.TorusGeometry(1, 0.3, 16, 100),
  dodecahedron: new THREE.DodecahedronGeometry(1),
  plane: new THREE.PlaneGeometry(1, 1),
  
  // Specific shapes
  ufoBase: new THREE.SphereGeometry(0.6, 16, 16),
  ufoGlass: new THREE.SphereGeometry(0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  rimLight: new THREE.SphereGeometry(0.07, 8, 8),
  buildingWindow: new THREE.BoxGeometry(0.18, 0.12, 0.01),
  grassBlade: new THREE.CylinderGeometry(0.01, 0.03, 0.18, 6),
  roadDash: new THREE.BoxGeometry(0.4, 0.012, 0.05),
  footpathDash: new THREE.BoxGeometry(0.2, 0.01, 0.06),
  crossingStripe: new THREE.BoxGeometry(1, 0.018, 1),
  
  // Car parts
  carBody: new THREE.BoxGeometry(0.4, 0.12, 0.22),
  carRoof: new THREE.BoxGeometry(0.32, 0.08, 0.18),
  carWindow: new THREE.BoxGeometry(0.02, 0.08, 0.16),
  carSideWindow: new THREE.BoxGeometry(0.3, 0.06, 0.01),
  carWheel: new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8),
  carLight: new THREE.SphereGeometry(0.02, 8, 8),
  carGrille: new THREE.BoxGeometry(0.01, 0.06, 0.12),
  carPlate: new THREE.BoxGeometry(0.01, 0.03, 0.08),
  
  // Person parts
  personLeg: new THREE.CylinderGeometry(0.025, 0.025, 0.11, 8),
  personBody: new THREE.CylinderGeometry(0.035, 0.045, 0.13, 8),
  personHead: new THREE.SphereGeometry(0.045, 8, 8),
  personArm: new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8),
  
  // Tree parts
  treeTrunk: new THREE.CylinderGeometry(0.08, 0.12, 0.5, 8),
  treeCone: new THREE.ConeGeometry(0.25, 0.5, 8),
  treeSphere: new THREE.SphereGeometry(0.22, 12, 12),
  treeDodeca: new THREE.DodecahedronGeometry(0.22),
  
  // Flower parts
  flowerStem: new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6),
  flowerHead: new THREE.SphereGeometry(0.04, 8, 8),
  
  // Streetlight parts
  streetlightPole: new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8),
  streetlightBulb: new THREE.SphereGeometry(0.07, 8, 8),
  
  // Traffic light parts
  trafficLightPole: new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8),
  trafficLightBox: new THREE.BoxGeometry(0.08, 0.18, 0.08),
  trafficLightBulb: new THREE.SphereGeometry(0.025, 8, 8),
  
  // Rock
  rock: new THREE.SphereGeometry(0.15, 8, 8),
  
  // UFO beam
  ufoBeam: new THREE.CylinderGeometry(0.3, 2.5, 6, 16, 1, true)
};

// Shared materials for performance optimization
const SHARED_MATERIALS = {
  // Basic materials
  metal: new THREE.MeshStandardMaterial({ color: '#b0b0b0', metalness: 0.85, roughness: 0.22 }),
  metalCyan: new THREE.MeshStandardMaterial({ color: '#00e6ff', metalness: 0.7, roughness: 0.3, emissive: '#00e6ff', emissiveIntensity: 0.3 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: '#7ecfff',
    transparent: true,
    opacity: 0.55,
    roughness: 0.07,
    metalness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    reflectivity: 0.85,
    transmission: 0.85,
    ior: 1.4,
    thickness: 0.25
  }),
  glassWindow: new THREE.MeshStandardMaterial({ color: '#e3f2fd', emissive: '#e3f2fd', emissiveIntensity: 0.5 }),
  carGlass: new THREE.MeshStandardMaterial({ color: '#e3f2fd', transparent: true, opacity: 0.8 }),
  carGlassSide: new THREE.MeshStandardMaterial({ color: '#e3f2fd', transparent: true, opacity: 0.7 }),
  
  // Common colors
  white: new THREE.MeshStandardMaterial({ color: '#ffffff' }),
  black: new THREE.MeshStandardMaterial({ color: '#111111' }),
  darkGray: new THREE.MeshStandardMaterial({ color: '#333333' }),
  gray: new THREE.MeshStandardMaterial({ color: '#888888' }),
  lightGray: new THREE.MeshStandardMaterial({ color: '#bbbbbb' }),
  ground: new THREE.MeshStandardMaterial({ color: '#4caf50' }),
  road: new THREE.MeshStandardMaterial({ color: '#111' }),
  footpath: new THREE.MeshStandardMaterial({ color: '#e0e0e0' }),
  
  // Lights
  yellowLight: new THREE.MeshStandardMaterial({ color: '#ffd600', emissive: '#ffd600', emissiveIntensity: 1.2 }),
  redLight: new THREE.MeshStandardMaterial({ color: '#ff1744', emissive: '#ff1744', emissiveIntensity: 1.2 }),
  greenLight: new THREE.MeshStandardMaterial({ color: '#00e676', emissive: '#00e676', emissiveIntensity: 1.2 }),
  blueLight: new THREE.MeshStandardMaterial({ color: '#2979ff', emissive: '#2979ff', emissiveIntensity: 1.2 }),
  cyanLight: new THREE.MeshStandardMaterial({ color: '#00ffff', transparent: true, opacity: 1, emissive: '#00ffff', emissiveIntensity: 2 }),
  streetLight: new THREE.MeshStandardMaterial({ color: '#fffde4', emissive: '#fffde4', emissiveIntensity: 1.2 }),
  
  // Traffic lights
  trafficRed: new THREE.MeshStandardMaterial({ color: '#f44336', emissive: '#f44336', emissiveIntensity: 0.2 }),
  trafficRedActive: new THREE.MeshStandardMaterial({ color: '#f44336', emissive: '#f44336', emissiveIntensity: 1.2 }),
  trafficYellow: new THREE.MeshStandardMaterial({ color: '#ffd600', emissive: '#ffd600', emissiveIntensity: 0.2 }),
  trafficYellowActive: new THREE.MeshStandardMaterial({ color: '#ffd600', emissive: '#ffd600', emissiveIntensity: 1.2 }),
  trafficGreen: new THREE.MeshStandardMaterial({ color: '#43a047', emissive: '#43a047', emissiveIntensity: 0.2 }),
  trafficGreenActive: new THREE.MeshStandardMaterial({ color: '#43a047', emissive: '#43a047', emissiveIntensity: 1.2 }),
  
  // Nature
  treeTrunk: new THREE.MeshStandardMaterial({ color: '#8d5524' }),
  treeCone: new THREE.MeshStandardMaterial({ color: '#3cb371' }),
  treeSphere: new THREE.MeshStandardMaterial({ color: '#388e3c' }),
  treeDodeca: new THREE.MeshStandardMaterial({ color: '#43a047' }),
  grassGreen: new THREE.MeshStandardMaterial({ color: '#7cb342' }),
  grassLightGreen: new THREE.MeshStandardMaterial({ color: '#8bc34a' }),
  flowerStem: new THREE.MeshStandardMaterial({ color: '#43a047' }),
  
  // People
  personLegs: new THREE.MeshStandardMaterial({ color: '#795548' }),
  personBody: new THREE.MeshStandardMaterial({ color: '#fbc02d' }),
  personHead: new THREE.MeshStandardMaterial({ color: '#ffe0b2' }),
  
  // Car lights
  carHeadlight: new THREE.MeshStandardMaterial({ color: '#fffde4', emissive: '#fffde4', emissiveIntensity: 0.5 }),
  carTaillight: new THREE.MeshStandardMaterial({ color: '#ff1744', emissive: '#ff1744', emissiveIntensity: 0.3 }),
  
  // Misc
  footpathDash: new THREE.MeshStandardMaterial({ color: '#ffd600' }),
  ufoGlow: new THREE.MeshStandardMaterial({ color: '#7ecfff', transparent: true, opacity: 0.18, emissive: '#7ecfff', emissiveIntensity: 0.5 })
};

// Create materials for different car colors
CAR_COLORS.forEach(color => {
  SHARED_MATERIALS[`car_${color.replace('#', '')}`] = new THREE.MeshStandardMaterial({ color });
});

// Create materials for different person colors
PERSON_COLORS.forEach(color => {
  SHARED_MATERIALS[`person_${color.replace('#', '')}`] = new THREE.MeshStandardMaterial({ color });
});

// Create materials for different flower colors
FLOWER_COLORS.forEach(color => {
  SHARED_MATERIALS[`flower_${color.replace('#', '')}`] = new THREE.MeshStandardMaterial({ color });
});

// Create materials for different valley colors
const VALLEY_COLORS = ['#8d9e6e', '#b0bfa3', '#bfcfb3'];
VALLEY_COLORS.forEach(color => {
  SHARED_MATERIALS[`valley_${color.replace('#', '')}`] = new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 });
});

// Create shared materials for flower heads
FLOWER_COLORS.forEach(color => {
  SHARED_MATERIALS[`flowerHead_${color.replace('#', '')}`] = new THREE.MeshStandardMaterial({ color });
});

// Cleanup function for disposing geometries and materials
const disposeThreeJsResources = () => {
  Object.values(SHARED_GEOMETRIES).forEach(geometry => {
    if (geometry && geometry.dispose) geometry.dispose();
  });
  Object.values(SHARED_MATERIALS).forEach(material => {
    if (material && material.dispose) material.dispose();
  });
};

// Add cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', disposeThreeJsResources);
}

// Performance monitoring
const PERFORMANCE_CONFIG = {
  maxFPS: 60,
  targetFPS: 30,
  enablePerformanceMonitoring: true,
  autoQualityAdjustment: true
};

// Quality settings for different performance levels
const QUALITY_SETTINGS = {
  high: { shadowMapSize: 2048, instanceLimit: 1000, detailDistance: 20 },
  medium: { shadowMapSize: 1024, instanceLimit: 500, detailDistance: 15 },
  low: { shadowMapSize: 512, instanceLimit: 200, detailDistance: 10 }
};

// Optimized UFO Component with shared geometries and materials
const UFO = React.memo(function UFO({ position, scanning, onClick }) {
  const mesh = useRef();
  const beamRef = useRef();
  
  // Memoized rim lights positions
  const rimLights = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * MATH_PI_2;
      return [Math.cos(angle) * 0.85, -0.09, Math.sin(angle) * 0.85];
    }), []
  );

  // Memoized rim light materials
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
      mesh.current.position.x = position[0];
      mesh.current.position.y = position[1] + Math.sin(elapsed * 2) * 0.2;
      mesh.current.position.z = position[2];
      mesh.current.rotation.y = Math.sin(elapsed) * 0.2;
    }
    // Animate beam opacity if scanning
    if (scanning && beamRef.current && beamRef.current.material) {
      const pulse = 0.9 + 0.1 * Math.sin(clock.getElapsedTime() * 2);
      beamRef.current.material.opacity = pulse;
    }
  });
  
  return (
    <group ref={mesh} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Saucer base: wide, thin disk */}
      <mesh castShadow receiveShadow position={[0, 0, 0]} scale={[1.7, 0.18, 1.7]} 
            geometry={SHARED_GEOMETRIES.ufoBase} material={SHARED_MATERIALS.metal} />
      
      {/* Saucer bottom bulge (now cyan) */}
      <mesh position={[0, -0.18, 0]} scale={[1.1, 0.25, 1.1]} 
            geometry={SHARED_GEOMETRIES.ufoBase} material={SHARED_MATERIALS.metalCyan} />
      
      {/* Glass dome: true hemisphere, realistic glass */}
      <mesh position={[0, 0.18, 0]} scale={[1, 1, 1]} 
            geometry={SHARED_GEOMETRIES.ufoGlass} material={SHARED_MATERIALS.glass} />
      
      {/* Rim lights (no shadow) */}
      {rimLights.map((pos, i) => (
        <mesh key={i} position={pos} 
              geometry={SHARED_GEOMETRIES.rimLight} 
              material={rimLightMaterials[i % 4]} />
      ))}
      
      {/* Subtle glow underneath */}
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.85, 0.18, 16, 1, true]} />
        <primitive object={SHARED_MATERIALS.ufoGlow} />
      </mesh>
      
      {/* Extremely visible scanning beam */}
      {scanning && (
        <mesh ref={beamRef} position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} 
              geometry={SHARED_GEOMETRIES.ufoBeam} material={SHARED_MATERIALS.cyanLight} />
      )}
    </group>
  );
});

// Optimized Building Component with shared geometries and instanced windows
const Building = React.memo(function Building({ position, color, height = 1.2 }) {
  const windowPositions = useMemo(() => {
    const positions = [];
    const windowRows = Math.floor(height * 3);
    const windowCols = 3;
    
    // Generate windows for all four sides
    for (let i = 0; i < windowRows; i++) {
      for (let j = 0; j < windowCols; j++) {
        const y = height / 2 - 0.25 - i * 0.3;
        const x = 0.22 - 0.22 * j;
        // Front, back, right, left
        positions.push(
          [x, y, 0.36],
          [x, y, -0.36],
          [0.36, y, 0.22 - 0.22 * j],
          [-0.36, y, 0.22 - 0.22 * j]
        );
      }
    }
    return positions;
  }, [height]);
  
  // Memoized building material
  const buildingMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow 
            geometry={SHARED_GEOMETRIES.box} 
            material={buildingMaterial} 
            scale={[0.7, height, 0.7]} />
      
      {/* Instanced windows */}
      <Instances limit={windowPositions.length}>
        <boxGeometry args={[0.18, 0.12, 0.01]} />
        <meshStandardMaterial color="#e3f2fd" emissive="#e3f2fd" emissiveIntensity={0.5} />
        {windowPositions.map((pos, i) => (
          <Instance key={i} position={pos} />
        ))}
      </Instances>
    </group>
  );
});

// Optimized Tree Component with shared geometries and materials
const Tree = React.memo(function Tree({ position, type = 0 }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow 
            geometry={SHARED_GEOMETRIES.treeTrunk} 
            material={SHARED_MATERIALS.treeTrunk} />
      
      {type === 0 && (
        <mesh position={[0, 0.35, 0]} 
              geometry={SHARED_GEOMETRIES.treeCone} 
              material={SHARED_MATERIALS.treeCone} />
      )}
      {type === 1 && (
        <mesh position={[0, 0.4, 0]} 
              geometry={SHARED_GEOMETRIES.treeSphere} 
              material={SHARED_MATERIALS.treeSphere} />
      )}
      {type === 2 && (
        <mesh position={[0, 0.38, 0]} 
              geometry={SHARED_GEOMETRIES.treeDodeca} 
              material={SHARED_MATERIALS.treeDodeca} />
      )}
    </group>
  );
});

// Optimized Grass Component with shared geometries and materials
const Grass = React.memo(function Grass({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, MATH_PI_DIV_8]} 
            geometry={SHARED_GEOMETRIES.grassBlade} 
            material={SHARED_MATERIALS.grassGreen} />
      <mesh rotation={[0, 0, -MATH_PI_DIV_8]} 
            material={SHARED_MATERIALS.grassLightGreen}>
        <cylinderGeometry args={[0.01, 0.03, 0.15, 6]} />
      </mesh>
    </group>
  );
});

// Optimized Road Component with shared geometries and materials
const Road = React.memo(function Road({ position, length = 4, rotation = 0, roundabout = false, isHorizontal = false }) {
  const dashPositions = useMemo(() => {
    const positions = [];
    const dashCount = Math.floor(length * 2);
    
    for (let i = 0; i < dashCount; i++) {
      const localPos = -length / 2 + 0.5 + i;
      const worldPos = [
        position[0] + Math.sin(rotation) * 0 + Math.cos(rotation) * localPos,
        position[1] + 0.055,
        position[2] + Math.cos(rotation) * 0 - Math.sin(rotation) * localPos
      ];
      
      // Skip dashes at intersections
      const isAtIntersection = Math.abs(worldPos[0] - Math.round(worldPos[0])) < 0.2 && 
                              Math.abs(worldPos[2] - Math.round(worldPos[2])) < 0.2;
      if (!isAtIntersection) {
        positions.push(worldPos);
      }
    }
    return positions;
  }, [position, length, rotation]);

  // Memoized road geometry
  const roadGeometry = useMemo(() => new THREE.BoxGeometry(length, 0.09, 0.44), [length]);

  return (
    <group>
      <mesh position={position} rotation={[0, rotation, 0]} receiveShadow 
            geometry={roadGeometry} material={SHARED_MATERIALS.road} />
      
      {/* Instanced road dashes */}
      <Instances limit={dashPositions.length}>
        <boxGeometry args={[0.4, 0.012, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
        {dashPositions.map((pos, i) => (
          <Instance key={i} position={pos} rotation={[0, rotation, 0]} />
        ))}
      </Instances>
      
      {roundabout && (
        <mesh position={[position[0], position[1] + 0.06, position[2]]} 
              geometry={SHARED_GEOMETRIES.torus} 
              material={SHARED_MATERIALS.lightGray} 
              scale={[0.7, 0.13, 0.7]} />
      )}
    </group>
  );
});

// Optimized Car Component with shared geometries and materials
const Car = React.memo(function Car({ position, color = '#1976d2', rotation = [0, 0, 0] }) {
  // Memoized car body material
  const carBodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Main car body - more realistic shape */}
      <mesh castShadow geometry={SHARED_GEOMETRIES.carBody} material={carBodyMaterial} />
      
      {/* Car roof/cabin */}
      <mesh position={[0, 0.08, 0]} geometry={SHARED_GEOMETRIES.carRoof} material={carBodyMaterial} />
      
      {/* Front windshield */}
      <mesh position={[0.12, 0.06, 0]} rotation={[0, 0, Math.PI / 6]} 
            geometry={SHARED_GEOMETRIES.carWindow} material={SHARED_MATERIALS.carGlass} />
      
      {/* Rear windshield */}
      <mesh position={[-0.12, 0.06, 0]} rotation={[0, 0, -Math.PI / 6]} 
            geometry={SHARED_GEOMETRIES.carWindow} material={SHARED_MATERIALS.carGlass} />
      
      {/* Side windows */}
      <mesh position={[0, 0.06, 0.09]} 
            geometry={SHARED_GEOMETRIES.carSideWindow} material={SHARED_MATERIALS.carGlassSide} />
      <mesh position={[0, 0.06, -0.09]} 
            geometry={SHARED_GEOMETRIES.carSideWindow} material={SHARED_MATERIALS.carGlassSide} />
      
      {/* Wheels */}
      <mesh position={[0.15, -0.02, 0.08]} 
            geometry={SHARED_GEOMETRIES.carWheel} material={SHARED_MATERIALS.darkGray} />
      <mesh position={[0.15, -0.02, -0.08]} 
            geometry={SHARED_GEOMETRIES.carWheel} material={SHARED_MATERIALS.darkGray} />
      <mesh position={[-0.15, -0.02, 0.08]} 
            geometry={SHARED_GEOMETRIES.carWheel} material={SHARED_MATERIALS.darkGray} />
      <mesh position={[-0.15, -0.02, -0.08]} 
            geometry={SHARED_GEOMETRIES.carWheel} material={SHARED_MATERIALS.darkGray} />
      
      {/* Headlights */}
      <mesh position={[0.2, 0.02, 0.06]} 
            geometry={SHARED_GEOMETRIES.carLight} material={SHARED_MATERIALS.carHeadlight} />
      <mesh position={[0.2, 0.02, -0.06]} 
            geometry={SHARED_GEOMETRIES.carLight} material={SHARED_MATERIALS.carHeadlight} />
      
      {/* Taillights */}
      <mesh position={[-0.2, 0.02, 0.06]} 
            geometry={SHARED_GEOMETRIES.carLight} material={SHARED_MATERIALS.carTaillight} />
      <mesh position={[-0.2, 0.02, -0.06]} 
            geometry={SHARED_GEOMETRIES.carLight} material={SHARED_MATERIALS.carTaillight} />
      
      {/* Front grille */}
      <mesh position={[0.2, 0, 0]} 
            geometry={SHARED_GEOMETRIES.carGrille} material={SHARED_MATERIALS.gray} />
      
      {/* License plate */}
      <mesh position={[-0.2, -0.02, 0]} 
            geometry={SHARED_GEOMETRIES.carPlate} material={SHARED_MATERIALS.white} />
    </group>
  );
});

// Optimized Streetlight Component with shared geometries and materials
const Streetlight = React.memo(function Streetlight({ position }) {
  return (
    <group position={position}>
      <mesh geometry={SHARED_GEOMETRIES.streetlightPole} material={SHARED_MATERIALS.lightGray} />
      <mesh position={[0, 0.38, 0]} 
            geometry={SHARED_GEOMETRIES.streetlightBulb} material={SHARED_MATERIALS.streetLight} />
    </group>
  );
});

// Optimized Footpath Component with shared geometries and materials
const Footpath = React.memo(function Footpath({ position, length = 4, rotation = 0 }) {
  const dashPositions = useMemo(() => {
    const positions = [];
    const dashCount = Math.floor(length * 3);
    
    for (let i = 0; i < dashCount; i++) {
      const localPos = -length / 2 + 0.33 + i * 0.33;
      positions.push([
        position[0] + Math.sin(rotation) * 0 + Math.cos(rotation) * localPos,
        position[1] + 0.02,
        position[2] + Math.cos(rotation) * 0 - Math.sin(rotation) * localPos
      ]);
    }
    return positions;
  }, [position, length, rotation]);

  // Memoized footpath geometry
  const footpathGeometry = useMemo(() => new THREE.BoxGeometry(length, 0.03, 0.18), [length]);

  return (
    <group>
      <mesh position={position} rotation={[0, rotation, 0]} receiveShadow 
            geometry={footpathGeometry} material={SHARED_MATERIALS.footpath} />
      
      {/* Instanced footpath dashes */}
      <Instances limit={dashPositions.length}>
        <boxGeometry args={[0.2, 0.01, 0.06]} />
        <meshStandardMaterial color="#ffd600" />
        {dashPositions.map((dashPos, i) => (
          <Instance key={i} position={dashPos} rotation={[0, rotation, 0]} />
        ))}
      </Instances>
    </group>
  );
});

// Optimized Person Component with shared geometries and materials
const Person = React.memo(function Person({ position, color = '#fbc02d', rotation = 0 }) {
  // Memoized person body material
  const personBodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Legs */}
      <mesh position={[0, 0.06, 0]} 
            geometry={SHARED_GEOMETRIES.personLeg} material={SHARED_MATERIALS.personLegs} />
      
      {/* Body */}
      <mesh position={[0, 0.14, 0]} 
            geometry={SHARED_GEOMETRIES.personBody} material={personBodyMaterial} />
      
      {/* Head */}
      <mesh position={[0, 0.23, 0]} 
            geometry={SHARED_GEOMETRIES.personHead} material={SHARED_MATERIALS.personHead} />
      
      {/* Arms */}
      <mesh position={[0.045, 0.16, 0]} rotation={[0, 0, MATH_PI_DIV_7]} 
            geometry={SHARED_GEOMETRIES.personArm} material={personBodyMaterial} />
      <mesh position={[-0.045, 0.16, 0]} rotation={[0, 0, -MATH_PI_DIV_7]} 
            geometry={SHARED_GEOMETRIES.personArm} material={personBodyMaterial} />
    </group>
  );
});

// Optimized Cloud Component with shared geometries and materials
const Cloud = React.memo(function Cloud({ position = [0,0,0], scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0,0,0]} geometry={SHARED_GEOMETRIES.sphere} material={SHARED_MATERIALS.white} scale={[0.7, 0.7, 0.7]} />
      <mesh position={[0.7,0.2,0.2]} geometry={SHARED_GEOMETRIES.sphere} material={SHARED_MATERIALS.white} scale={[0.5, 0.5, 0.5]} />
      <mesh position={[-0.6,0.1,-0.2]} geometry={SHARED_GEOMETRIES.sphere} material={SHARED_MATERIALS.white} scale={[0.4, 0.4, 0.4]} />
      <mesh position={[0.3,-0.1,-0.3]} geometry={SHARED_GEOMETRIES.sphere} material={SHARED_MATERIALS.white} scale={[0.3, 0.3, 0.3]} />
      <mesh position={[-0.3,-0.1,0.3]} geometry={SHARED_GEOMETRIES.sphere} material={SHARED_MATERIALS.white} scale={[0.25, 0.25, 0.25]} />
    </group>
  );
});

// Optimized Valley Component with shared geometries and materials
const Valley = React.memo(function Valley({ position = [0,0,0], scale = 1, color = '#bfcfb3' }) {
  // Memoized valley material
  const valleyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 }), [color]);
  
  return (
    <mesh position={[position[0], position[1] - 0.2 * scale, position[2]]} scale={[scale * 3, scale * 0.7, scale * 2.2]}>
      <sphereGeometry args={[1, 16, 12, 0, MATH_PI_2, 0, MATH_PI_DIV_2]} />
      <primitive object={valleyMaterial} />
    </mesh>
  );
});

// Optimized Rock Component with shared geometries and materials
const Rock = React.memo(function Rock({ position }) {
  // Memoized rock scale
  const rockScale = useMemo(() => 0.13 + Math.random() * 0.08, []);
  
  return (
    <mesh position={position} geometry={SHARED_GEOMETRIES.rock} material={SHARED_MATERIALS.gray} scale={[rockScale, rockScale, rockScale]} />
  );
});

// Optimized Flower Component with shared geometries and materials
const Flower = React.memo(function Flower({ position, color }) {
  // Memoized flower material
  const flowerMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: color || FLOWER_COLORS[Math.floor(Math.random() * 4)] }), [color]);
  
  return (
    <group position={position}>
      <mesh geometry={SHARED_GEOMETRIES.flowerStem} material={SHARED_MATERIALS.flowerStem} />
      <mesh position={[0, 0.06, 0]} geometry={SHARED_GEOMETRIES.flowerHead} material={flowerMaterial} />
    </group>
  );
});

// Optimized TrafficLight component with shared geometries and materials
function TrafficLight({ position, rotation = 0, state = 'red' }) {
  // Memoized traffic light materials based on state
  const redMaterial = useMemo(() => state === 'red' ? SHARED_MATERIALS.trafficRedActive : SHARED_MATERIALS.trafficRed, [state]);
  const yellowMaterial = useMemo(() => state === 'yellow' ? SHARED_MATERIALS.trafficYellowActive : SHARED_MATERIALS.trafficYellow, [state]);
  const greenMaterial = useMemo(() => state === 'green' ? SHARED_MATERIALS.trafficGreenActive : SHARED_MATERIALS.trafficGreen, [state]);
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh geometry={SHARED_GEOMETRIES.trafficLightPole} material={SHARED_MATERIALS.gray} />
      
      {/* Light box */}
      <mesh position={[0, 0.28, 0]} geometry={SHARED_GEOMETRIES.trafficLightBox} material={SHARED_MATERIALS.black} />
      
      {/* Red light */}
      <mesh position={[0, 0.36, 0.045]} geometry={SHARED_GEOMETRIES.trafficLightBulb} material={redMaterial} />
      
      {/* Yellow light */}
      <mesh position={[0, 0.28, 0.045]} geometry={SHARED_GEOMETRIES.trafficLightBulb} material={yellowMaterial} />
      
      {/* Green light */}
      <mesh position={[0, 0.20, 0.045]} geometry={SHARED_GEOMETRIES.trafficLightBulb} material={greenMaterial} />
    </group>
  );
}

// Optimized PedestrianCrossing component with shared geometries and materials
function PedestrianCrossing({ position, rotation = 0, width = 0.52, length = 0.9, stripes = 6 }) {
  // Memoized stripe positions
  const stripePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < stripes; i++) {
      positions.push([(-length / 2) + (i + 0.5) * (length / stripes), 0.055, 0]);
    }
    return positions;
  }, [length, stripes]);
  
  // Memoized stripe geometry
  const stripeGeometry = useMemo(() => new THREE.BoxGeometry(length / stripes * 0.7, 0.018, width), [length, stripes, width]);
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Instances limit={stripePositions.length}>
        <boxGeometry args={[length / stripes * 0.7, 0.018, width]} />
        <meshStandardMaterial color="#ffffff" />
        {stripePositions.map((pos, i) => (
          <Instance key={i} position={pos} />
        ))}
      </Instances>
    </group>
  );
}

// City grid generator function (moved inside Scene component)
const generateCityGrid = (size = 7, blockSize = 2) => {
  const roads = [];
  const buildings = [];
  const footpaths = [];
  const trees = [];
  const people = [];
  const grasses = [];
  
  // Generate roads first - roads go along the edges of blocks
  for (let x = -size; x <= size; x += blockSize) {
    for (let z = -size; z <= size; z += blockSize) {
      // For each block edge, add a road and a footpath beside it (not two roads)
      if (Math.abs(x) !== size) {
        // Road on x edge
        roads.push([[x + blockSize / 2, 0.041, z], [x + blockSize / 2, 0.041, z + blockSize]]);
        // Footpath beside road
        footpaths.push([x + blockSize / 2 + 0.32, 0.02, z + blockSize / 2, blockSize, Math.PI / 2]);
      }
      if (Math.abs(z) !== size) {
        // Road on z edge
        roads.push([[x, 0.041, z + blockSize / 2], [x + blockSize, 0.041, z + blockSize / 2]]);
        // Footpath beside road
        footpaths.push([x + blockSize / 2, 0.02, z + blockSize / 2 + 0.32, blockSize, 0]);
      }
    }
  }
  
  // Now place buildings in garden plots - use a completely different approach
  // Place buildings at integer coordinates, but skip the ones that are on roads
  for (let x = -size + 2; x < size; x += 2) {
    for (let z = -size + 2; z < size; z += 2) {
      // Skip center area (roundabout)
      if (Math.abs(x) <= 2 && Math.abs(z) <= 2) continue;
      
      // Place building at this garden position (these are guaranteed to be off roads)
      const buildingX = x;
      const buildingZ = z;
      
      // Add some randomization within the garden plot
      const offsetX = (Math.random() - 0.5) * 0.3;
      const offsetZ = (Math.random() - 0.5) * 0.3;
      buildings.push([buildingX + offsetX, 0.6, buildingZ + offsetZ, `hsl(${(x+z+size)*20},70%,60%)`, 1.1 + 0.6 * Math.random()]);
      
      // Place trees around the building in the garden
      trees.push([buildingX - 0.4, 0.25, buildingZ - 0.4, Math.floor(Math.random()*3)]);
      trees.push([buildingX + 0.4, 0.25, buildingZ + 0.4, Math.floor(Math.random()*3)]);
      trees.push([buildingX - 0.4, 0.25, buildingZ + 0.4, Math.floor(Math.random()*3)]);
      trees.push([buildingX + 0.4, 0.25, buildingZ - 0.4, Math.floor(Math.random()*3)]);
      
      // Grass in the garden
      grasses.push([buildingX + 0.2, 0.01, buildingZ + 0.2]);
      grasses.push([buildingX - 0.2, 0.01, buildingZ - 0.2]);
      grasses.push([buildingX + 0.2, 0.01, buildingZ - 0.2]);
      grasses.push([buildingX - 0.2, 0.01, buildingZ + 0.2]);
      
      if (Math.random() > 0.7) people.push([buildingX + 0.1, 0.15, buildingZ - 0.1, '#fbc02d']);
    }
  }
  
  // Place people on footpaths
  const footpathPeople = [];
  footpaths.forEach(([x, y, z, l, r]) => {
    // Place 0-2 people per footpath
    const count = Math.random() > 0.7 ? 2 : Math.random() > 0.5 ? 1 : 0;
    for (let i = 0; i < count; i++) {
      const t = Math.random() * l - l / 2;
      // Offset from center of footpath
      const px = x + Math.cos(r) * t + Math.sin(r) * (0.09 + Math.random() * 0.05);
      const pz = z - Math.sin(r) * t + Math.cos(r) * (0.09 + Math.random() * 0.05);
      const prot = Math.random() * MATH_PI_2;
      footpathPeople.push([px, y + 0.045, pz, PERSON_COLORS[Math.floor(Math.random() * 4)], prot]);
    }
  });

  // Place streetlights on footpaths (not in gardens)
  const streetlights = [];
  footpaths.forEach(([x, y, z, l, r]) => {
    // Place a streetlight at the start of each footpath
    const sx = x + Math.cos(r) * (-l / 2 + 0.3);
    const sz = z - Math.sin(r) * (-l / 2 + 0.3);
    streetlights.push([sx, y, sz]);
  });

  // Add crossings and update traffic light placement
  const crossings = [];
  const trafficLights = [];
  const roadWidth = 0.7; // matches road geometry
  const crossingWidth = 0.52; // footpath-to-footpath span
  for (let x = -size; x < size; x += blockSize) {
    for (let z = -size; z < size; z += blockSize) {
      // For each intersection, place one crossing per road direction
      const y = 0.055;
      // Across vertical road (along X, crossing Z)
      crossings.push({
        position: [x + blockSize / 2, y, z],
        rotation: Math.PI / 2,
        width: crossingWidth,
        length: roadWidth
      });
      // Across horizontal road (along Z, crossing X)
      crossings.push({
        position: [x, y, z + blockSize / 2],
        rotation: 0,
        width: crossingWidth,
        length: roadWidth
      });
      // Place traffic lights at four footpath corners
      const tlY = 0.02;
      const footpathOffset = 0.32;
      const offset = blockSize / 2 + footpathOffset;
      trafficLights.push({
        position: [x + offset, tlY, z + offset],
        rotation: Math.PI / 4,
        state: TRAFFIC_LIGHT_STATES[Math.floor(Math.random() * 3)]
      });
      trafficLights.push({
        position: [x - offset, tlY, z + offset],
        rotation: (3 * Math.PI) / 4,
        state: TRAFFIC_LIGHT_STATES[Math.floor(Math.random() * 3)]
      });
      trafficLights.push({
        position: [x + offset, tlY, z - offset],
        rotation: (-Math.PI) / 4,
        state: TRAFFIC_LIGHT_STATES[Math.floor(Math.random() * 3)]
      });
      trafficLights.push({
        position: [x - offset, tlY, z - offset],
        rotation: (-3 * Math.PI) / 4,
        state: TRAFFIC_LIGHT_STATES[Math.floor(Math.random() * 3)]
      });
    }
  }
  
  // Generate cars on roads
  const cars = [];
  for (let x = -size; x <= size; x += blockSize) {
    for (let z = -size; z <= size; z += blockSize) {
      // Place cars on roads (not in gardens)
      if (Math.abs(x) !== size) {
        // Cars on horizontal roads
        const roadY = 0.13;
        const carSpacing = 3; // Space between cars
        for (let offset = 0; offset < blockSize; offset += carSpacing) {
          if (Math.random() > 0.6) { // 40% chance of car on this road segment
            cars.push({
              position: [x + blockSize / 2, roadY, z + offset],
              rotation: [0, Math.PI / 2, 0], // Face along the road
              color: CAR_COLORS[Math.floor(Math.random() * 7)]
            });
          }
        }
      }
      if (Math.abs(z) !== size) {
        // Cars on vertical roads
        const roadY = 0.13;
        const carSpacing = 3; // Space between cars
        for (let offset = 0; offset < blockSize; offset += carSpacing) {
          if (Math.random() > 0.6) { // 40% chance of car on this road segment
            cars.push({
              position: [x + offset, roadY, z + blockSize / 2],
              rotation: [0, 0, 0], // Face along the road
              color: CAR_COLORS[Math.floor(Math.random() * 7)]
            });
          }
        }
      }
    }
  }
  
  // Roundabout at center
  roads.push([[0, 0.041, 0], [0, 0.041, 0, true]]);
  return { roads, buildings, footpaths, streetlights, trees, people, grasses, cars, footpathPeople, trafficLights, crossings };
};

// Utility function to check if a point is inside any valley
function isInsideAnyValley(x, z, valleyRing) {
  return valleyRing.some(v => {
    const dx = x - v.position[0];
    const dz = z - v.position[2];
    const rx = v.scale * 3;
    const rz = v.scale * 2.2;
    return (dx * dx) / (rx * rx) + (dz * dz) / (rz * rz) < 1;
  });
}

// Optimized Scene Component
const Scene = React.memo(function Scene({ onUfoClick }) {
  // UFO animation state (kept for later)
  const [ufoPos] = useState([0, 3, 0]);
  const [scanning] = useState(false);
  const [showResults] = useState(false);

  // Memoized city grid generation
  const cityData = useMemo(() => generateCityGrid(8, 2), []);
  const { roads, buildings, footpaths, streetlights, trees, people, grasses, cars, footpathPeople, trafficLights, crossings } = cityData;

  // Memoized valley ring
  const valleyRing = useMemo(() => {
    const ring = [];
    const radius = 15;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * MATH_PI_2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      ring.push({
        position: [x, 0.2, z],
        scale: 2.5 + Math.random() * 0.8,
        color: i % 2 === 0 ? '#8d9e6e' : '#b0bfa3',
      });
    }
    return ring;
  }, []);
  // Remove the clouds array and the rendering of Cloud components
  // (Do not render any Cloud components)

  // Optimized random points generation
  const randomPointsOnValley = useCallback((center, scale, count) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * MATH_PI_2;
      const r = 0.5 + Math.random() * 0.45;
      const x = center[0] + Math.cos(theta) * r * scale * 1.7;
      const z = center[2] + Math.sin(theta) * r * scale * 1.2;
      const y = center[1] + 0.7 * scale * (1 - r * 0.7);
      points.push([x, y, z]);
    }
    return points;
  }, []);

  // Memoized instanced data
  const instancedData = useMemo(() => {
    const allTreeData = [
      ...trees.map(([x, y, z, t]) => ({ position: [x, y, z], type: t })),
      ...valleyRing.flatMap((v, i) =>
        randomPointsOnValley(v.position, v.scale, 18).map((pos, j) => ({ position: pos, type: Math.floor(Math.random() * 3) }))
      )
    ];

    const allGrassData = [
      ...grasses,
      ...valleyRing.flatMap((v, i) => randomPointsOnValley(v.position, v.scale, 6))
    ];

    const allFlowerData = [
      ...valleyRing.flatMap((v, i) => randomPointsOnValley(v.position, v.scale, 3).map((pos, j) => ({ position: pos, color: FLOWER_COLORS[Math.floor(Math.random() * 4)] })))
    ];

    const allRockData = [
      ...valleyRing.flatMap((v, i) => randomPointsOnValley(v.position, v.scale, 2))
    ];

    const allPeopleData = [
      ...footpathPeople,
      ...people.map(([x, y, z, c]) => [x, y, z, c, 0])
    ];

    return {
      trees: {
        all: allTreeData,
        cone: allTreeData.filter(t => t.type === 0),
        sphere: allTreeData.filter(t => t.type === 1),
        dodeca: allTreeData.filter(t => t.type === 2)
      },
      grass: allGrassData,
      flowers: allFlowerData,
      rocks: allRockData,
      people: allPeopleData,
      streetlights: streetlights,
      flowersByColor: FLOWER_COLORS.map(color => allFlowerData.filter(f => f.color === color))
    };
  }, [valleyRing, trees, grasses, people, footpathPeople, streetlights, randomPointsOnValley]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Stars radius={60} depth={120} count={200} factor={3} fade speed={1} />
      {/* Large Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} 
            geometry={SHARED_GEOMETRIES.plane} material={SHARED_MATERIALS.ground} 
            scale={[24, 24, 1]} 
            frustumCulled={false} />
      {/* Roads and Roundabout (render before footpaths) */}
      {roads.map(([[x1, y1, z1], [x2, y2, z2, roundabout]], i) => {
        // Only render if both endpoints are not inside any valley
        if (isInsideAnyValley((x1 + x2) / 2, (z1 + z2) / 2, valleyRing)) return null;
        return (
          <Road key={i} position={[(x1 + x2) / 2, y1, (z1 + z2) / 2]} length={Math.sqrt((x2-x1)**2 + (z2-z1)**2)} rotation={Math.atan2(x2-x1, z2-z1)} roundabout={!!roundabout} />
        );
      })}
      {/* Footpaths (render after roads, so roads are on top) */}
      {footpaths.map(([x, y, z, l, r], i) => {
        if (isInsideAnyValley(x, z, valleyRing)) return null;
        return <Footpath key={i} position={[x, y, z]} length={l} rotation={r} />;
      })}
      {/* Buildings */}
      {buildings.map(([x, y, z, color, h], i) => {
        if (isInsideAnyValley(x, z, valleyRing)) return null;
        return (
          <Building key={i} position={[x, y, z]} color={color} height={h} />
        );
      })}
      {/* Instanced tree trunks */}
      <Instances limit={instancedData.trees.all.length}>
        <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#8d5524" />
        {instancedData.trees.all.map(({ position }, i) => (
          <Instance key={i} position={position} />
        ))}
      </Instances>
      
      {/* Instanced tree foliage - cone */}
      <Instances limit={instancedData.trees.cone.length}>
        <coneGeometry args={[0.25, 0.5, 8]} />
        <meshStandardMaterial color="#3cb371" />
        {instancedData.trees.cone.map(({ position }, i) => (
          <Instance key={i} position={[position[0], position[1] + 0.35, position[2]]} />
        ))}
      </Instances>
      
      {/* Instanced tree foliage - sphere */}
      <Instances limit={instancedData.trees.sphere.length}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#388e3c" />
        {instancedData.trees.sphere.map(({ position }, i) => (
          <Instance key={i} position={[position[0], position[1] + 0.4, position[2]]} />
        ))}
      </Instances>
      
      {/* Instanced tree foliage - dodecahedron */}
      <Instances limit={instancedData.trees.dodeca.length}>
        <dodecahedronGeometry args={[0.22]} />
        <meshStandardMaterial color="#43a047" />
        {instancedData.trees.dodeca.map(({ position }, i) => (
          <Instance key={i} position={[position[0], position[1] + 0.38, position[2]]} />
        ))}
      </Instances>
      
      {/* Instanced grass - first blade */}
      <Instances limit={instancedData.grass.length}>
        <cylinderGeometry args={[0.01, 0.03, 0.18, 6]} />
        <meshStandardMaterial color="#7cb342" />
        {instancedData.grass.map((pos, i) => (
          <Instance key={i} position={pos} rotation={[0, 0, MATH_PI_DIV_8]} />
        ))}
      </Instances>
      
      {/* Instanced grass - second blade */}
      <Instances limit={instancedData.grass.length}>
        <cylinderGeometry args={[0.01, 0.03, 0.18, 6]} />
        <meshStandardMaterial color="#8bc34a" />
        {instancedData.grass.map((pos, i) => (
          <Instance key={i} position={pos} rotation={[0, 0, -MATH_PI_DIV_8]} scale={[1, 0.83, 1]} />
        ))}
      </Instances>
      {/* Instanced people parts */}
      {/* Legs */}
      <Instances limit={instancedData.people.length}>
        <cylinderGeometry args={[0.025, 0.025, 0.11, 8]} />
        <meshStandardMaterial color="#795548" />
        {instancedData.people.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x, y + 0.06, z]} rotation={[0, rot, 0]} />
        ))}
      </Instances>
      
      {/* Body */}
      <Instances limit={instancedData.people.length}>
        <cylinderGeometry args={[0.035, 0.045, 0.13, 8]} />
        <meshStandardMaterial color="#fbc02d" />
        {instancedData.people.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x, y + 0.14, z]} rotation={[0, rot, 0]} />
        ))}
      </Instances>
      
      {/* Head */}
      <Instances limit={instancedData.people.length}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ffe0b2" />
        {instancedData.people.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x, y + 0.23, z]} rotation={[0, rot, 0]} />
        ))}
      </Instances>
      
      {/* Left Arms */}
      <Instances limit={instancedData.people.length}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color="#fbc02d" />
        {instancedData.people.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x + 0.045 * Math.cos(rot), y + 0.16, z + 0.045 * Math.sin(rot)]} rotation={[0, rot, MATH_PI_DIV_7]} />
        ))}
      </Instances>
      
      {/* Right Arms */}
      <Instances limit={instancedData.people.length}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color="#fbc02d" />
        {instancedData.people.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x - 0.045 * Math.cos(rot), y + 0.16, z - 0.045 * Math.sin(rot)]} rotation={[0, rot, -MATH_PI_DIV_7]} />
        ))}
      </Instances>
      {/* Instanced streetlight poles */}
      <Instances limit={instancedData.streetlights.length}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#bbbbbb" />
        {instancedData.streetlights.map(([x, y, z], i) => (
          <Instance key={i} position={[x, y, z]} />
        ))}
      </Instances>
      
      {/* Instanced streetlight bulbs */}
      <Instances limit={instancedData.streetlights.length}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#fffde4" emissive="#fffde4" emissiveIntensity={1.2} />
        {instancedData.streetlights.map(([x, y, z], i) => (
          <Instance key={i} position={[x, y + 0.38, z]} />
        ))}
      </Instances>

      {/* Traffic lights at intersections */}
      {trafficLights.map((tl, i) => {
        if (isInsideAnyValley(tl.position[0], tl.position[2], valleyRing)) return null;
        return <TrafficLight key={i} position={tl.position} rotation={tl.rotation} state={tl.state} />;
      })}
      {/* Cars (static) */}
      {cars.map((car, i) => {
        if (isInsideAnyValley(car.position[0], car.position[2], valleyRing)) return null;
        return <Car key={i} position={car.position} color={car.color} rotation={car.rotation} />;
      })}
      {/* UFO (clickable) */}
      <UFO position={ufoPos} scanning={scanning} onClick={onUfoClick} />
      {/* Results Overlay (kept for later) */}
      {showResults && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '24px 40px',
            borderRadius: '18px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            border: '2px solid #7ecfff',
            boxShadow: '0 8px 32px #000a',
            marginTop: '40px'
          }}>
            <div>🔍 SCANNING COMPLETE</div>
            <div>🌍 LANDS DETECTED: 40 PROPERTIES</div>
            <div>🤖 AI ANALYSIS: PREDICTION MODELS ACTIVE</div>
          </div>
        </Html>
      )}
      {/* Camera Controls - restrict to horizontal (X axis) rotation only */}
      <PerspectiveCamera makeDefault position={[0, 5.5, 7]} fov={40} />
      <OrbitControls 
        enablePan={false} 
        minAzimuthAngle={-Math.PI/2} 
        maxAzimuthAngle={Math.PI/2} 
        minPolarAngle={Math.PI/2.5} 
        maxPolarAngle={Math.PI/2.5} 
        minDistance={7} 
        maxDistance={7} 
        target={[0,2,0]}
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
      />
      {/* Valleys/Hills around the city, with more trees, grass, rocks, flowers */}
      {valleyRing.map((v, i) => (
        <React.Fragment key={i}>
          <Valley position={v.position} scale={v.scale} color={v.color} />
          {/* Only one tree per valley, foliage only */}
          {randomPointsOnValley(v.position, v.scale, 1).map((pos, j) => {
            const type = Math.floor(Math.random()*3);
            if (type === 0) {
              return (
                <mesh key={`tree-${i}-${j}`} position={[pos[0], pos[1] + 0.35, pos[2]]}>
                  <coneGeometry args={[0.25, 0.5, 12]} />
                  <meshStandardMaterial color="#3cb371" />
                </mesh>
              );
            } else if (type === 1) {
              return (
                <mesh key={`tree-${i}-${j}`} position={[pos[0], pos[1] + 0.4, pos[2]]}>
                  <sphereGeometry args={[0.22, 16, 16]} />
                  <meshStandardMaterial color="#388e3c" />
                </mesh>
              );
            } else {
              return (
                <mesh key={`tree-${i}-${j}`} position={[pos[0], pos[1] + 0.38, pos[2]]}>
                  <dodecahedronGeometry args={[0.22]} />
                  <meshStandardMaterial color="#43a047" />
                </mesh>
              );
            }
          })}
        </React.Fragment>
      ))}
      {/* Clouds removed */}
      {/* Instanced flower stems */}
      {instancedData.flowersByColor.map((flowerGroup, idx) => (
        <Instances key={idx} limit={flowerGroup.length}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
          <meshStandardMaterial color="#43a047" />
          {flowerGroup.map((f, i) => (
            <Instance key={i} position={f.position} />
          ))}
        </Instances>
      ))}
      
      {/* Instanced flower heads */}
      {instancedData.flowersByColor.map((flowerGroup, idx) => (
        <Instances key={'head-' + idx} limit={flowerGroup.length}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={FLOWER_COLORS[idx]} />
          {flowerGroup.map((f, i) => (
            <Instance key={i} position={[f.position[0], f.position[1] + 0.06, f.position[2]]} />
          ))}
        </Instances>
      ))}
      
      {/* Instanced rocks */}
      <Instances limit={instancedData.rocks.length}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#888888" />
        {instancedData.rocks.map((pos, i) => (
          <Instance key={i} position={pos} />
        ))}
      </Instances>
    </>
  );
});

// Optimized MainLayout Component
const MainLayout = React.memo(function MainLayout() {
  const [showHero, setShowHero] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [showGameBox, setShowGameBox] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  
  const handleUfoClick = useCallback(() => {
    setShowGameBox(true);
    setShowHero(false);
  }, []);
  
  const handleGetStarted = useCallback(() => {
    setShowGameBox(false);
    setShowFormModal(true);
    setFormStep(1);
  }, []);
  
  const handleDismissInstruction = useCallback(() => {
    setShowInstruction(false);
  }, []);

  // In MainLayout state, ensure you have a handler to close the game box
  const handleCloseGameBox = useCallback(() => {
    setShowGameBox(false);
    setUfoMovedAside(false);
  }, []);
  const handleCloseFormModal = useCallback(() => {
    setShowFormModal(false);
  }, []);
  const handleNextStep = useCallback(() => setFormStep(s => Math.min(s + 1, 5)), []);
  const handlePrevStep = useCallback(() => setFormStep(s => Math.max(s - 1, 1)), []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    setShowFormModal(false);
    setShowLoadingScreen(true);
    setTimeout(() => {
      setShowLoadingScreen(false);
      setShowResultScreen(true);
    }, 2000);
  }, []);
  const handleCloseResultScreen = useCallback(() => {
    setShowResultScreen(false);
  }, []);
  return (
    <>
      <Header />
      <section className="relative w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 p-0 m-0">
        <div className="w-full h-screen">
          <Canvas 
            shadows 
            dpr={[1, 1.5]} 
            style={{ width: '100%', height: '100%' }}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true
            }}
            camera={{ 
              fov: 75, 
              near: 0.1, 
              far: 1000, 
              position: [0, 5, 10] 
            }}
            onCreated={({ gl }) => {
              gl.setClearColor('#87CEEB', 1);
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              
              // Enable optimizations
              gl.outputEncoding = THREE.sRGBEncoding;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1;
              
              // Performance optimizations
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
              gl.physicallyCorrectLights = true;
            }}
          >
            <Scene onUfoClick={handleUfoClick} />
          </Canvas>
        </div>
        {/* Game Box Modal - appears when UFO is clicked */}
        {showGameBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="flex flex-col items-center">
              {/* UFO image as character */}
              <img src={ufoImg} alt="UFO" className="w-28 h-28 object-contain drop-shadow-xl mb-0" style={{ marginBottom: '-1.5rem', zIndex: 2 }} />
              {/* Dialogue box with close 'X' button */}
              <div className="relative bg-white rounded-2xl shadow-xl px-8 pt-8 pb-7 flex flex-col items-center max-w-md w-full border border-gray-200">
                {/* Close 'X' button */}
                <button
                  className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold focus:outline-none"
                  onClick={handleCloseGameBox}
                  aria-label="Close"
                >
                  ×
                </button>
                {/* Tail */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-b-[28px] border-b-white drop-shadow-md"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
                  Unlock Powerful Property Insights
                </h2>
                <h3 className="text-base md:text-lg font-medium text-gray-500 mb-4 text-center">
                  AI-driven analysis for smarter real estate decisions.
                </h3>
                <div className="mb-6 text-center text-blue-500 font-semibold text-base md:text-lg">
                  Start exploring your city’s potential.
                </div>
                <button
                  className="mt-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200 flex items-center gap-2"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* UFO click instruction overlay */}
        <div
          className={`fixed bottom-6 left-0 w-full flex justify-center z-50 transition-opacity duration-700 ${showInstruction ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="bg-white/90 text-gray-900 rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border border-blue-200 backdrop-blur-md">
            <span className="text-xl">👽</span>
            <span className="font-semibold">Click the UFO to get started!</span>
            <button
              className="ml-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow transition-all duration-200"
              onClick={handleDismissInstruction}
            >
              Understood
            </button>
          </div>
        </div>
        {/* Property Form Modal (Multi-step) */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="flex flex-col items-center">
              <div className="relative bg-white rounded-2xl shadow-xl px-8 pt-8 pb-7 flex flex-col items-center max-w-lg w-full border border-gray-200">
                {/* Close 'X' button */}
                <button
                  className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold focus:outline-none"
                  onClick={handleCloseFormModal}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Property Listing Form</h2>
                <div className="mb-4 text-gray-500 text-sm">Step {formStep} of 5</div>
                <form className="w-full space-y-6" onSubmit={handleFormSubmit}>
                  {/* Step 1: Basic Property Information */}
                  {formStep === 1 && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-2">🏠 Basic Property Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Property Title</label>
                          <input type="text" className="w-full border rounded px-3 py-2" defaultValue="3 BHK in New York City" />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Property Type</label>
                          <select className="w-full border rounded px-3 py-2" defaultValue="Apartment">
                            <option>Apartment</option>
                            <option>House</option>
                            <option>Villa</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Bedrooms (BHK)</label>
                          <select className="w-full border rounded px-3 py-2" defaultValue="3">
                            <option>1</option><option>2</option><option>3</option><option>4</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Bathrooms</label>
                          <select className="w-full border rounded px-3 py-2" defaultValue="2">
                            <option>1</option><option>2</option><option>3</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Area (sq.ft)</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="1200" />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Carpet Area (optional)</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="950" />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Year Built</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="2015" />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Furnishing Status</label>
                          <select className="w-full border rounded px-3 py-2" defaultValue="Furnished">
                            <option>Furnished</option>
                            <option>Semi-furnished</option>
                            <option>Unfurnished</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Floor Number</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="3" />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Total Floors</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="10" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Step 2: Location Details */}
                  {formStep === 2 && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-2">📍 Location Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">City</label>
                          <select className="w-full border rounded px-3 py-2" defaultValue="New York">
                            <option>New York</option>
                            <option>Mumbai</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Locality / Area</label>
                          <input type="text" className="w-full border rounded px-3 py-2" defaultValue="Manhattan" />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Pin Code / ZIP</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="10001" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Step 3: Amenities & Features */}
                  {formStep === 3 && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-2">🚪 Amenities & Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Parking Available</label>
                        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Power Backup</label>
                        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Lift / Elevator</label>
                        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Security / CCTV</label>
                        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Balcony</label>
                        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Gated Community</label>
                      </div>
                    </div>
                  )}
                  {/* Step 4: Pricing Information */}
                  {formStep === 4 && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-2">💰 Pricing Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Asking Price ($/₹)</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="120000" />
                        </div>
                        <div className="flex items-center gap-2 mt-6 md:mt-0">
                          <input type="checkbox" defaultChecked /> Negotiable
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Maintenance Fees (optional)</label>
                          <input type="number" className="w-full border rounded px-3 py-2" defaultValue="300" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Step 5: Media Upload */}
                  {formStep === 5 && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-2">📷 Media Upload (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Property Images</label>
                          <input type="file" className="w-full" multiple />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">Property Video Tour (YouTube link)</label>
                          <input type="text" className="w-full border rounded px-3 py-2" placeholder="https://youtube.com/..." defaultValue="https://youtube.com/mocktour" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Step Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {formStep > 1 ? (
                      <button type="button" onClick={handlePrevStep} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full text-base shadow-sm transition-all duration-200">Back</button>
                    ) : <span />}
                    {formStep < 5 ? (
                      <button type="button" onClick={handleNextStep} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200">Next</button>
                    ) : (
                      <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200">Submit</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Loading Screen with UFO scanning */}
        {showLoadingScreen && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
            <div className="flex flex-col items-center">
              <div style={{ height: 320, width: 320 }}>
                <Canvas camera={{ position: [0, 2, 4], fov: 40 }}>
                  <ambientLight intensity={1.2} />
                  <directionalLight position={[10, 20, 10]} intensity={1.2} />
                  <UFO position={[0, 1.2, 0]} scanning={true} />
                </Canvas>
              </div>
              <div className="mt-8 text-2xl text-blue-200 font-semibold animate-pulse">Analyzing property…</div>
            </div>
          </div>
        )}
        {/* Result Screen with comprehensive analysis */}
        {showResultScreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header with UFO */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div style={{ height: 60, width: 60 }}>
                    <Canvas camera={{ position: [0, 2, 4], fov: 40 }}>
                      <ambientLight intensity={1.2} />
                      <directionalLight position={[10, 20, 10]} intensity={1.2} />
                      <UFO position={[0, 1.2, 0]} scanning={false} />
                    </Canvas>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Property Analysis Complete</h2>
                    <p className="text-blue-100">AI-powered prediction results</p>
                  </div>
                </div>
                <button
                  className="text-white hover:text-red-200 text-2xl font-bold focus:outline-none"
                  onClick={handleCloseResultScreen}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Core Output Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Predicted Price */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="text-sm text-green-600 font-medium mb-1">🎯 Predicted Price</div>
                    <div className="text-2xl font-bold text-green-700">₹1.05 Cr</div>
                    <div className="text-sm text-green-600">$127,000</div>
                    <div className="text-xs text-green-500 mt-1">Price Range: ₹98L – ₹1.12 Cr</div>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium mb-1">📊 Confidence Score</div>
                    <div className="text-2xl font-bold text-blue-700">91%</div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                    <div className="text-xs text-blue-500 mt-1">High confidence prediction</div>
                  </div>

                  {/* Location */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="text-sm text-purple-600 font-medium mb-1">📍 Location</div>
                    <div className="text-lg font-bold text-purple-700">Andheri East</div>
                    <div className="text-sm text-purple-600">Mumbai, Maharashtra</div>
                    <div className="text-xs text-purple-500 mt-1">High demand zone</div>
                  </div>
                </div>

                {/* Property Summary */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-800 mb-3">📌 Property Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Property:</span>
                      <div className="font-medium">3 BHK Apartment</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Area:</span>
                      <div className="font-medium">1200 sq.ft</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Furnishing:</span>
                      <div className="font-medium">Semi-Furnished</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <div className="font-medium">8 Years Old</div>
                    </div>
                  </div>
                </div>

                {/* Visualizations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Trend */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">📈 Price Trend</h4>
                    <img src={trendChart} alt="Price Trend" className="w-full h-32 object-contain" />
                    <p className="text-xs text-gray-600 mt-2">Property prices in this locality increased 12% YoY</p>
                  </div>

                  {/* Locality Comparison */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">📍 Locality Comparison</h4>
                    <img src={comparisonChart} alt="Locality Comparison" className="w-full h-32 object-contain" />
                    <p className="text-xs text-gray-600 mt-2">Your area shows strong growth potential</p>
                  </div>

                  {/* Feature Importance */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">🏷 Feature Importance</h4>
                    <img src={featureImportance} alt="Feature Importance" className="w-full h-32 object-contain" />
                    <p className="text-xs text-gray-600 mt-2">Area and location are key factors</p>
                  </div>

                  {/* Similar Properties */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">🏠 Similar Properties</h4>
                    <img src={similarProperties} alt="Similar Properties" className="w-full h-32 object-contain" />
                    <p className="text-xs text-gray-600 mt-2">Based on 4 comparable properties</p>
                  </div>
                </div>

                {/* Top Factors */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-3">🏷 Top Factors Influencing Price</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Area (1200 sq.ft):</span>
                      <span className="font-medium text-amber-800">35% impact</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Locality (High Demand):</span>
                      <span className="font-medium text-amber-800">25% impact</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Floor (3/10):</span>
                      <span className="font-medium text-amber-800">20% impact</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Age (8 years):</span>
                      <span className="font-medium text-amber-800">12% impact</span>
                    </div>
                  </div>
                </div>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full text-sm transition-all duration-200">
                    🔁 Try Again
                  </button>
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-sm transition-all duration-200">
                    💾 Save as PDF
                  </button>
                  <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full text-sm transition-all duration-200">
                    🔗 Share Result
                  </button>
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full text-sm transition-all duration-200">
                    📞 Contact Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
});

export default MainLayout;