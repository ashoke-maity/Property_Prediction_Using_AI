import React, { useRef, useState } from 'react';
import Header from '../../components/web/Header';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars, PerspectiveCamera, Instances, Instance } from '@react-three/drei';
import ufoImg from '../../assets/logo.png';

// 3D UFO Component (kept for later animation)
function UFO({ position, scanning, onClick }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.x = position[0];
      mesh.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      mesh.current.position.z = position[2];
      mesh.current.rotation.y = Math.sin(clock.getElapsedTime()) * 0.2;
    }
  });
  // Rim lights positions (around the edge of the saucer)
  const rimLights = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return [Math.cos(angle) * 0.85, -0.09, Math.sin(angle) * 0.85];
  });
  return (
    <group ref={mesh} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Saucer base: wide, thin disk */}
      <mesh castShadow receiveShadow position={[0, 0, 0]} scale={[1.7, 0.18, 1.7]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.85} roughness={0.22} />
      </mesh>
      {/* Saucer bottom bulge (now cyan) */}
      <mesh position={[0, -0.18, 0]} scale={[1.1, 0.25, 1.1]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial color="#00e6ff" metalness={0.7} roughness={0.3} emissive="#00e6ff" emissiveIntensity={0.3} />
      </mesh>
      {/* Glass dome: true hemisphere, realistic glass */}
      <mesh position={[0, 0.18, 0]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#7ecfff"
          transparent
          opacity={0.55}
          roughness={0.07}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.03}
          reflectivity={0.85}
          transmission={0.85}
          ior={1.4}
          thickness={0.25}
        />
      </mesh>
      {/* Rim lights (no shadow) */}
      {rimLights.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={["#ffd600","#ff1744","#00e676","#2979ff"][i%4]} emissive={["#ffd600","#ff1744","#00e676","#2979ff"][i%4]} emissiveIntensity={1.2} />
        </mesh>
      ))}
      {/* Subtle glow underneath */}
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.85, 0.18, 16, 1, true]} />
        <meshStandardMaterial color="#7ecfff" transparent opacity={0.18} emissive="#7ecfff" emissiveIntensity={0.5} />
      </mesh>
      {/* Optional: scanning beam */}
      {scanning && (
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 1.5, 3, 16, 1, true]} />
          <meshStandardMaterial color="#7ecfff" transparent opacity={0.25} emissive="#7ecfff" emissiveIntensity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function Building({ position, color, height = 1.2 }) {
  // Add windows to all four sides
  const windowRows = Math.floor(height * 3);
  const windowCols = 3;
  const windowPositions = [];
  // Front and back
  for (let i = 0; i < windowRows; i++) {
    for (let j = 0; j < windowCols; j++) {
      // Front
      windowPositions.push([0.22 - 0.22 * j, height / 2 - 0.25 - i * 0.3, 0.36]);
      // Back
      windowPositions.push([0.22 - 0.22 * j, height / 2 - 0.25 - i * 0.3, -0.36]);
    }
  }
  // Left and right
  for (let i = 0; i < windowRows; i++) {
    for (let j = 0; j < windowCols; j++) {
      // Right
      windowPositions.push([0.36, height / 2 - 0.25 - i * 0.3, 0.22 - 0.22 * j]);
      // Left
      windowPositions.push([-0.36, height / 2 - 0.25 - i * 0.3, 0.22 - 0.22 * j]);
    }
  }
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.7, height, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {windowPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.18, 0.12, 0.01]} />
          <meshStandardMaterial color="#e3f2fd" emissive="#e3f2fd" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position, type = 0 }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.5, 12]} />
        <meshStandardMaterial color="#8d5524" />
      </mesh>
      {type === 0 && (
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.25, 0.5, 12]} />
          <meshStandardMaterial color="#3cb371" />
        </mesh>
      )}
      {type === 1 && (
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#388e3c" />
        </mesh>
      )}
      {type === 2 && (
        <mesh position={[0, 0.38, 0]}>
          <dodecahedronGeometry args={[0.22]} />
          <meshStandardMaterial color="#43a047" />
        </mesh>
      )}
    </group>
  );
}

function Grass({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.01, 0.03, 0.18, 6]} />
        <meshStandardMaterial color="#7cb342" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.01, 0.03, 0.15, 6]} />
        <meshStandardMaterial color="#8bc34a" />
      </mesh>
    </group>
  );
}

function Road({ position, length = 4, rotation = 0, roundabout = false, isHorizontal = false }) {
  return (
    <group>
      {/* Black road, wider to cover grid */}
      <mesh position={position} rotation={[0, rotation, 0]} receiveShadow>
        <boxGeometry args={[length, 0.09, 0.44]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Center dashed white line - break at intersections */}
      {[...Array(Math.floor(length * 2))].map((_, i) => {
        const localPos = -length / 2 + 0.5 + i;
        // Much simpler intersection detection
        // Skip lines that are at integer coordinates (where roads cross)
        const worldPos = [
          position[0] + Math.sin(rotation) * 0 + Math.cos(rotation) * localPos,
          position[1] + 0.055,
          position[2] + Math.cos(rotation) * 0 - Math.sin(rotation) * localPos
        ];
        const isAtIntersection = Math.abs(worldPos[0] - Math.round(worldPos[0])) < 0.2 && Math.abs(worldPos[2] - Math.round(worldPos[2])) < 0.2;
        if (isAtIntersection) return null;
        return (
          <mesh key={i} position={worldPos} rotation={[0, rotation, 0]}>
            <boxGeometry args={[0.4, 0.012, 0.05]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        );
      })}
      {roundabout && (
        <mesh position={[position[0], position[1] + 0.06, position[2]]}>
          <torusGeometry args={[0.7, 0.13, 16, 100]} />
          <meshStandardMaterial color="#bbb" />
        </mesh>
      )}
    </group>
  );
}

function Car({ position, color = '#1976d2', rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main car body - more realistic shape */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.12, 0.22]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Car roof/cabin */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.32, 0.08, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Front windshield */}
      <mesh position={[0.12, 0.06, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.02, 0.08, 0.16]} />
        <meshStandardMaterial color="#e3f2fd" transparent opacity={0.8} />
      </mesh>
      
      {/* Rear windshield */}
      <mesh position={[-0.12, 0.06, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.02, 0.08, 0.16]} />
        <meshStandardMaterial color="#e3f2fd" transparent opacity={0.8} />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[0, 0.06, 0.09]}>
        <boxGeometry args={[0.3, 0.06, 0.01]} />
        <meshStandardMaterial color="#e3f2fd" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.06, -0.09]}>
        <boxGeometry args={[0.3, 0.06, 0.01]} />
        <meshStandardMaterial color="#e3f2fd" transparent opacity={0.7} />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[0.15, -0.02, 0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, -0.02, -0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.15, -0.02, 0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.15, -0.02, -0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0.2, 0.02, 0.06]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#fffde4" emissive="#fffde4" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.2, 0.02, -0.06]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#fffde4" emissive="#fffde4" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-0.2, 0.02, 0.06]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.2, 0.02, -0.06]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Front grille */}
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.01, 0.06, 0.12]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      
      {/* License plate */}
      <mesh position={[-0.2, -0.02, 0]}>
        <boxGeometry args={[0.01, 0.03, 0.08]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}

function Streetlight({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 12]} />
        <meshStandardMaterial color="#bbb" />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#fffde4" emissive="#fffde4" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function Footpath({ position, length = 4, rotation = 0 }) {
  return (
    <group>
      {/* Gray footpath base */}
      <mesh position={position} rotation={[0, rotation, 0]} receiveShadow>
        <boxGeometry args={[length, 0.03, 0.18]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Yellow dashed lines on footpath */}
      {[...Array(Math.floor(length * 3))].map((_, i) => {
        const localPos = -length / 2 + 0.33 + i * 0.33;
        const dashPos = [
          position[0] + Math.sin(rotation) * 0 + Math.cos(rotation) * localPos,
          position[1] + 0.02,
          position[2] + Math.cos(rotation) * 0 - Math.sin(rotation) * localPos
        ];
        return (
          <mesh key={i} position={dashPos} rotation={[0, rotation, 0]}>
            <boxGeometry args={[0.2, 0.01, 0.06]} />
            <meshStandardMaterial color="#ffd600" />
          </mesh>
        );
      })}
    </group>
  );
}

function Person({ position, color = '#fbc02d', rotation = 0 }) {
  // Smaller, more human-like proportions
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Legs */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.11, 8]} />
        <meshStandardMaterial color="#795548" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.13, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.23, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ffe0b2" />
      </mesh>
      {/* Arms */}
      <mesh position={[0.045, 0.16, 0]} rotation={[0, 0, Math.PI / 7]}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.045, 0.16, 0]} rotation={[0, 0, -Math.PI / 7]}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Improved Cloud: fluffy, cartoon-like, layered in 3D
function Cloud({ position = [0,0,0], scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0,0,0]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.7,0.2,0.2]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.6,0.1,-0.2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.3,-0.1,-0.3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.3,-0.1,0.3]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}
// Improved Valley/Hill: smooth, visible, natural
function Valley({ position = [0,0,0], scale = 1, color = '#789262' }) {
  // Use a stretched sphere, higher and closer
  return (
    <mesh position={[position[0], position[1] - 0.2 * scale, position[2]]} scale={[scale * 3, scale * 0.7, scale * 2.2]} receiveShadow castShadow>
      <sphereGeometry args={[1, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}
// Sun
function Sun({ position = [0,0,0], scale = 1 }) {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <sphereGeometry args={[1.2, 24, 24]} />
      <meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={0.7} />
    </mesh>
  );
}

// Rock and Flower components
function Rock({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.13 + Math.random() * 0.08, 8, 8]} />
      <meshStandardMaterial color="#888" />
    </mesh>
  );
}
function Flower({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
        <meshStandardMaterial color="#43a047" />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={['#ff4081','#ffd600','#7c4dff','#00e676'][Math.floor(Math.random()*4)]} />
      </mesh>
    </group>
  );
}

// TrafficLight component
function TrafficLight({ position, rotation = 0, state = 'red' }) {
  // state: 'red', 'yellow', 'green'
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 10]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Light box */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.08, 0.18, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Red light */}
      <mesh position={[0, 0.36, 0.045]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#f44336" emissive="#f44336" emissiveIntensity={state === 'red' ? 1.2 : 0.2} />
      </mesh>
      {/* Yellow light */}
      <mesh position={[0, 0.28, 0.045]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ffd600" emissive="#ffd600" emissiveIntensity={state === 'yellow' ? 1.2 : 0.2} />
      </mesh>
      {/* Green light */}
      <mesh position={[0, 0.20, 0.045]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#43a047" emissive="#43a047" emissiveIntensity={state === 'green' ? 1.2 : 0.2} />
      </mesh>
    </group>
  );
}

// PedestrianCrossing component
function PedestrianCrossing({ position, rotation = 0, width = 0.52, length = 0.9, stripes = 6 }) {
  // Draws bold white stripes across the road
  const stripesArr = Array.from({ length: stripes });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {stripesArr.map((_, i) => (
        <mesh key={i} position={[(-length / 2) + (i + 0.5) * (length / stripes), 0.055, 0]}>
          <boxGeometry args={[length / stripes * 0.7, 0.018, width]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ))}
    </group>
  );
}

// City grid generator (roads beside every footpath, not two parallel roads)
function generateCityGrid(size = 7, blockSize = 2) {
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
      const prot = Math.random() * Math.PI * 2;
      footpathPeople.push([px, y + 0.045, pz, ['#fbc02d', '#ffb300', '#90caf9', '#e57373'][Math.floor(Math.random() * 4)], prot]);
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
        state: ['red', 'yellow', 'green'][Math.floor(Math.random() * 3)]
      });
      trafficLights.push({
        position: [x - offset, tlY, z + offset],
        rotation: (3 * Math.PI) / 4,
        state: ['red', 'yellow', 'green'][Math.floor(Math.random() * 3)]
      });
      trafficLights.push({
        position: [x + offset, tlY, z - offset],
        rotation: (-Math.PI) / 4,
        state: ['red', 'yellow', 'green'][Math.floor(Math.random() * 3)]
      });
      trafficLights.push({
        position: [x - offset, tlY, z - offset],
        rotation: (-3 * Math.PI) / 4,
        state: ['red', 'yellow', 'green'][Math.floor(Math.random() * 3)]
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
              color: ['#1976d2', '#e53935', '#43a047', '#ff9800', '#9c27b0', '#795548', '#607d8b'][Math.floor(Math.random() * 7)]
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
              color: ['#1976d2', '#e53935', '#43a047', '#ff9800', '#9c27b0', '#795548', '#607d8b'][Math.floor(Math.random() * 7)]
            });
          }
        }
      }
    }
  }
  
  // Roundabout at center
  roads.push([[0, 0.041, 0], [0, 0.041, 0, true]]);
  return { roads, buildings, footpaths, streetlights, trees, people, grasses, cars, footpathPeople, trafficLights, crossings };
}

function Scene({ onUfoClick }) {
  // UFO animation state (kept for later)
  const [ufoPos] = useState([0, 3, 0]);
  const [scanning] = useState(false);
  const [showResults] = useState(false);

  // Generate city grid
  const { roads, buildings, footpaths, streetlights, trees, people, grasses, cars, footpathPeople, trafficLights, crossings } = generateCityGrid(8, 2);

  // Valley ring positions (closer, higher, more visible)
  const valleyRing = [];
  const radius = 15;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    valleyRing.push({
      position: [x, 0.2, z],
      scale: 2.5 + Math.random() * 0.8,
      color: i % 2 === 0 ? '#8d9e6e' : '#b0bfa3',
    });
  }
  // Remove the clouds array and the rendering of Cloud components
  // (Do not render any Cloud components)

  // Helper to generate random positions on a hemisphere (for trees/grass/rocks/flowers on valleys)
  function randomPointsOnValley(center, scale, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 0.45;
      const x = center[0] + Math.cos(theta) * r * scale * 1.7;
      const z = center[2] + Math.sin(theta) * r * scale * 1.2;
      const y = center[1] + 0.7 * scale * (1 - r * 0.7);
      points.push([x, y, z]);
    }
    return points;
  }

  // Gather all tree positions/types (city + valley)
  const allTreeData = [
    ...trees.map(([x, y, z, t]) => ({ position: [x, y, z], type: t })),
    ...valleyRing.flatMap((v, i) =>
      randomPointsOnValley(v.position, v.scale, 18).map((pos, j) => ({ position: pos, type: Math.floor(Math.random() * 3) }))
    )
  ];
  // Split by type for foliage
  const trunkData = allTreeData;
  const coneData = allTreeData.filter(t => t.type === 0);
  const sphereData = allTreeData.filter(t => t.type === 1);
  const dodecaData = allTreeData.filter(t => t.type === 2);

  // Gather all grass positions (city + valley)
  const allGrassData = [
    ...grasses,
    ...valleyRing.flatMap((v, i) => randomPointsOnValley(v.position, v.scale, 6))
  ];

  // Gather all flower positions (city + valley)
  const allFlowerData = [
    ...valleyRing.flatMap((v, i) => randomPointsOnValley(v.position, v.scale, 3).map((pos, j) => ({ position: pos, color: ['#ff4081','#ffd600','#7c4dff','#00e676'][Math.floor(Math.random()*4)] })))
  ];
  // Group flowers by color for instancing
  const flowerColors = ['#ff4081','#ffd600','#7c4dff','#00e676'];
  const flowersByColor = flowerColors.map(color => allFlowerData.filter(f => f.color === color));
  // Gather all rock positions (city + valley)
  const allRockData = [
    ...valleyRing.flatMap((v, i) => randomPointsOnValley(v.position, v.scale, 2))
  ];

  // Gather all people positions/colors/rotations (city + footpaths)
  const allPeopleData = [
    ...footpathPeople,
    ...people.map(([x, y, z, c]) => [x, y, z, c, 0]) // add default rotation for city people
  ];
  // Gather all streetlight positions (city + footpaths)
  const allStreetlightData = streetlights;

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <Stars radius={60} depth={120} count={200} factor={3} fade speed={1} />
      {/* Large Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
      {/* Roads and Roundabout (render before footpaths) */}
      {roads.map(([[x1, y1, z1], [x2, y2, z2, roundabout]], i) => (
        <Road key={i} position={[(x1 + x2) / 2, y1, (z1 + z2) / 2]} length={Math.sqrt((x2-x1)**2 + (z2-z1)**2)} rotation={Math.atan2(x2-x1, z2-z1)} roundabout={!!roundabout} />
      ))}
      {/* Footpaths (render after roads, so roads are on top) */}
      {footpaths.map(([x, y, z, l, r], i) => (
        <Footpath key={i} position={[x, y, z]} length={l} rotation={r} />
      ))}
      {/* Buildings */}
      {buildings.map(([x, y, z, color, h], i) => (
        <Building key={i} position={[x, y, z]} color={color} height={h} />
      ))}
      {/* Tree trunks (instanced) */}
      <Instances limit={trunkData.length}>
        <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#8d5524" />
        {trunkData.map(({ position }, i) => (
          <Instance key={i} position={position} />
        ))}
      </Instances>
      {/* Tree foliage: cone */}
      <Instances limit={coneData.length}>
        <coneGeometry args={[0.25, 0.5, 8]} />
        <meshStandardMaterial color="#3cb371" />
        {coneData.map(({ position }, i) => (
          <Instance key={i} position={[position[0], position[1] + 0.35, position[2]]} />
        ))}
      </Instances>
      {/* Tree foliage: sphere */}
      <Instances limit={sphereData.length}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#388e3c" />
        {sphereData.map(({ position }, i) => (
          <Instance key={i} position={[position[0], position[1] + 0.4, position[2]]} />
        ))}
      </Instances>
      {/* Tree foliage: dodecahedron */}
      <Instances limit={dodecaData.length}>
        <dodecahedronGeometry args={[0.22]} />
        <meshStandardMaterial color="#43a047" />
        {dodecaData.map(({ position }, i) => (
          <Instance key={i} position={[position[0], position[1] + 0.38, position[2]]} />
        ))}
      </Instances>
      {/* Grass Tufts (instanced, two crossed cylinders per tuft) */}
      <Instances limit={allGrassData.length * 2}>
        <cylinderGeometry args={[0.01, 0.03, 0.18, 6]} />
        <meshStandardMaterial color="#7cb342" />
        {allGrassData.map((pos, i) => [
          <Instance key={i + '-a'} position={pos} rotation={[0, 0, Math.PI / 8]} />,
          <Instance key={i + '-b'} position={pos} rotation={[0, 0, -Math.PI / 8]} />
        ])}
      </Instances>
      {/* People (instanced, each body part) */}
      {/* Legs */}
      <Instances limit={allPeopleData.length}>
        <cylinderGeometry args={[0.025, 0.025, 0.11, 8]} />
        <meshStandardMaterial color="#795548" />
        {allPeopleData.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x, y + 0.06, z]} rotation={[0, rot, 0]} />
        ))}
      </Instances>
      {/* Body */}
      <Instances limit={allPeopleData.length}>
        <cylinderGeometry args={[0.035, 0.045, 0.13, 8]} />
        <meshStandardMaterial color="#fbc02d" />
        {allPeopleData.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x, y + 0.14, z]} rotation={[0, rot, 0]} />
        ))}
      </Instances>
      {/* Head */}
      <Instances limit={allPeopleData.length}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#ffe0b2" />
        {allPeopleData.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x, y + 0.23, z]} rotation={[0, rot, 0]} />
        ))}
      </Instances>
      {/* Arms (right) */}
      <Instances limit={allPeopleData.length}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color="#fbc02d" />
        {allPeopleData.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x + 0.045 * Math.cos(rot), y + 0.16, z + 0.045 * Math.sin(rot)]} rotation={[0, rot, Math.PI / 7]} />
        ))}
      </Instances>
      {/* Arms (left) */}
      <Instances limit={allPeopleData.length}>
        <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
        <meshStandardMaterial color="#fbc02d" />
        {allPeopleData.map(([x, y, z, c, rot], i) => (
          <Instance key={i} position={[x - 0.045 * Math.cos(rot), y + 0.16, z - 0.045 * Math.sin(rot)]} rotation={[0, rot, -Math.PI / 7]} />
        ))}
      </Instances>
      {/* Streetlights (instanced) */}
      <Instances limit={allStreetlightData.length}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 12]} />
        <meshStandardMaterial color="#bbb" />
        {allStreetlightData.map(([x, y, z], i) => (
          <Instance key={i} position={[x, y, z]} />
        ))}
      </Instances>
      {/* Streetlight heads (instanced) */}
      <Instances limit={allStreetlightData.length}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#fffde4" emissive="#fffde4" emissiveIntensity={1.2} />
        {allStreetlightData.map(([x, y, z], i) => (
          <Instance key={i} position={[x, y + 0.38, z]} />
        ))}
      </Instances>

      {/* Traffic lights at intersections */}
      {trafficLights.map((tl, i) => (
        <TrafficLight key={i} position={tl.position} rotation={tl.rotation} state={tl.state} />
      ))}
      {/* Cars (static) */}
      {cars.map((car, i) => (
        <Car key={i} position={car.position} color={car.color} rotation={car.rotation} />
      ))}
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
      <PerspectiveCamera makeDefault position={[0, 6.5, 9]} fov={40} />
      <OrbitControls enablePan={false} minAzimuthAngle={-Math.PI/2} maxAzimuthAngle={Math.PI/2} minPolarAngle={Math.PI/2.5} maxPolarAngle={Math.PI/2.5} minDistance={9} maxDistance={9} target={[0,2,0]} />
      {/* Valleys/Hills around the city, with more trees, grass, rocks, flowers */}
      {valleyRing.map((v, i) => (
        <React.Fragment key={i}>
          <Valley position={v.position} scale={v.scale} color={v.color} />
          {/* Dense forest of trees on valley */}
          {randomPointsOnValley(v.position, v.scale, 18).map((pos, j) => (
            <Tree key={`tree-${i}-${j}`} position={pos} type={Math.floor(Math.random()*3)} />
          ))}
          {/* More grass on valley */}
          {randomPointsOnValley(v.position, v.scale, 12).map((pos, j) => (
            <Grass key={`grass-${i}-${j}`} position={pos} />
          ))}
          {/* Rocks on valley */}
          {randomPointsOnValley(v.position, v.scale, 5).map((pos, j) => (
            <Rock key={`rock-${i}-${j}`} position={pos} />
          ))}
          {/* Flowers on valley */}
          {randomPointsOnValley(v.position, v.scale, 3).map((pos, j) => (
            <Flower key={`flower-${i}-${j}`} position={pos} />
          ))}
        </React.Fragment>
      ))}
      {/* Sun */}
      <Sun position={[8, 14, -18]} scale={1.7} />
      {/* Clouds removed */}
      {/* Flowers (instanced by color) */}
      {flowersByColor.map((flowerGroup, idx) => (
        <Instances key={idx} limit={flowerGroup.length}>
          {/* Stem */}
          <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
          <meshStandardMaterial color="#43a047" />
          {flowerGroup.map((f, i) => (
            <Instance key={i} position={f.position} />
          ))}
        </Instances>
      ))}
      {flowersByColor.map((flowerGroup, idx) => (
        <Instances key={'head-' + idx} limit={flowerGroup.length}>
          {/* Flower head */}
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={flowerColors[idx]} />
          {flowerGroup.map((f, i) => (
            <Instance key={i} position={[f.position[0], f.position[1] + 0.06, f.position[2]]} />
          ))}
        </Instances>
      ))}
      {/* Rocks (instanced) */}
      <Instances limit={allRockData.length}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#888" />
        {allRockData.map((pos, i) => (
          <Instance key={i} position={pos} />
        ))}
      </Instances>
    </>
  );
}

function MainLayout() {
  const [showHero, setShowHero] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [showGameBox, setShowGameBox] = useState(false);
  const handleUfoClick = () => {
    setShowGameBox(true);
    setShowHero(false);
  };
  const handleGetStarted = () => {
    setShowGameBox(false);
  };
  return (
    <>
      <Header />
      <section className="relative w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 p-0 m-0">
        <div className="w-full h-screen">
          <Canvas shadows dpr={[1, 1.5]} style={{ width: '100%', height: '100%' }}>
            <Scene onUfoClick={handleUfoClick} />
          </Canvas>
        </div>
        {/* Game Box Modal - appears when UFO is clicked */}
        {showGameBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="flex flex-col items-center">
              {/* UFO image as character */}
              <img src={ufoImg} alt="UFO" className="w-28 h-28 object-contain drop-shadow-xl mb-0" style={{ marginBottom: '-1.5rem', zIndex: 2 }} />
              {/* Speech bubble with tail */}
              <div className="relative bg-white rounded-3xl shadow-2xl px-10 pt-8 pb-7 flex flex-col items-center max-w-md w-full border-4 border-blue-200 animate-fade-in" style={{ zIndex: 1 }}>
                {/* Tail */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-b-[28px] border-b-white drop-shadow-md"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2 text-center">Unlock Property Insights</h2>
                <h3 className="text-lg md:text-xl font-semibold text-purple-600 mb-6 text-center">Using AI</h3>
                <button
                  className="mt-2 px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 text-white font-bold rounded-full text-lg shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 border-2 border-blue-400/30"
                  onClick={handleGetStarted}
                >
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">👾</span>
                    Get Started
                    <span className="animate-pulse">🤖</span>
                  </span>
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
              onClick={() => setShowInstruction(false)}
            >
              Understood
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default MainLayout;