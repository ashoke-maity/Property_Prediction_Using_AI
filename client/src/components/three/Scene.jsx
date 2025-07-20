import React, { useState, useMemo, useCallback } from 'react';
import { Stars, PerspectiveCamera, OrbitControls, Instances, Instance, Html } from '@react-three/drei';
import { SHARED_GEOMETRIES, SHARED_MATERIALS } from '../../utils/threeJsAssets';

// Import all the individual components
import UFO from './UFO';
import Building from './Building';
import Car from './Car';

// Enhanced Tree component with variety
const Tree = React.memo(function Tree({ position, variant = 0 }) {
  const treeVariants = [
    // Cone tree
    () => (
      <group position={position}>
        <mesh 
          geometry={SHARED_GEOMETRIES.treeTrunk} 
          material={SHARED_MATERIALS.treeTrunk} 
          scale={[1, 1, 1]} 
          position={[0, 0.25, 0]} 
          castShadow 
          receiveShadow 
        />
        <mesh 
          geometry={SHARED_GEOMETRIES.treeCone} 
          material={SHARED_MATERIALS.treeCone} 
          scale={[1.2, 1.5, 1.2]} 
          position={[0, 0.8, 0]} 
          castShadow 
        />
      </group>
    ),
    // Sphere tree
    () => (
      <group position={position}>
        <mesh 
          geometry={SHARED_GEOMETRIES.treeTrunk} 
          material={SHARED_MATERIALS.treeTrunk} 
          scale={[0.8, 1, 0.8]} 
          position={[0, 0.25, 0]} 
          castShadow 
          receiveShadow 
        />
        <mesh 
          geometry={SHARED_GEOMETRIES.treeSphere} 
          material={SHARED_MATERIALS.treeSphere} 
          scale={[1.3, 1.3, 1.3]} 
          position={[0, 0.75, 0]} 
          castShadow 
        />
      </group>
    ),
    // Dodecahedron tree
    () => (
      <group position={position}>
        <mesh 
          geometry={SHARED_GEOMETRIES.treeTrunk} 
          material={SHARED_MATERIALS.treeTrunk} 
          scale={[0.9, 1.1, 0.9]} 
          position={[0, 0.3, 0]} 
          castShadow 
          receiveShadow 
        />
        <mesh 
          geometry={SHARED_GEOMETRIES.treeDodeca} 
          material={SHARED_MATERIALS.treeDodeca} 
          scale={[1.1, 1.1, 1.1]} 
          position={[0, 0.8, 0]} 
          castShadow 
        />
      </group>
    )
  ];

  return treeVariants[variant % treeVariants.length]();
});

// Traffic Signal component
const TrafficSignal = React.memo(function TrafficSignal({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Signal pole */}
      <mesh
        geometry={SHARED_GEOMETRIES.streetlightPole}
        material={SHARED_MATERIALS.darkGray}
        scale={[1, 1.2, 1]}
        position={[0, 0.42, 0]}
        castShadow
      />
      {/* Signal box */}
      <mesh
        geometry={SHARED_GEOMETRIES.box}
        material={SHARED_MATERIALS.black}
        scale={[0.15, 0.25, 0.08]}
        position={[0, 0.65, 0]}
        castShadow
      />
      {/* Traffic lights */}
      <mesh
        geometry={SHARED_GEOMETRIES.sphere}
        material={SHARED_MATERIALS.carTaillight}
        position={[0, 0.72, 0.05]}
        scale={0.04}
      />
      <mesh
        geometry={SHARED_GEOMETRIES.sphere}
        material={SHARED_MATERIALS.streetLight}
        position={[0, 0.65, 0.05]}
        scale={0.04}
      />
      <mesh
        geometry={SHARED_GEOMETRIES.sphere}
        material={SHARED_MATERIALS.treeCone}
        position={[0, 0.58, 0.05]}
        scale={0.04}
      />
    </group>
  );
});

// Keep scene-specific helpers here
const BUILDING_COLORS = [
  '#e57373', '#ba68c8', '#64b5f6', '#4db6ac', '#81c784', '#ffd54f', '#ffb74d', '#a1887f', '#90a4ae', '#f06292', '#7986cb', '#aed581', '#fff176', '#ff8a65', '#d7ccc8', '#b0bec5'
];

const generateCityGrid = (size = 10, baseHeight = 1.5) => {
  const buildings = [];
  const roads = [];
  const signals = [];
  const trees = [];
  const streetlights = [];
  const cars = [];
  const emptyChance = 0.15; // 15% chance for empty land
  const treeChance = 0.85; // 85% of empty lands get a tree (increased)
  const roadEvery = 4; // Every 4th row/col is a road
  const streetlightEvery = 8; // Streetlights every 8 units along roads
  const carChance = 0.3; // 30% chance of car on road segments

  const blockSize = 4; // distance between roads (size of a block)
  const buildingSpacing = 2; // spacing between buildings (if you want more than one per block, but here we use one per block)
  const halfBlock = blockSize / 2;

  // Draw roads at every multiple of blockSize
  for (let i = -size; i <= size; i += blockSize) {
    // Horizontal roads (along Z-axis)
    for (let z = -size; z <= size; z += 0.5) {
      roads.push([i, 0.02, z]);
    }
    // Vertical roads (along X-axis)
    for (let x = -size; x <= size; x += 0.5) {
      roads.push([x, 0.02, i]);
    }
  }

  // Place buildings centered in each green block (never on roads)
  for (let x = -size; x < size; x += blockSize) {
    for (let z = -size; z < size; z += blockSize) {
      // Center of the block
      const bx = x + halfBlock;
      const bz = z + halfBlock;
      // Optionally, skip some blocks for empty land/trees
      if (Math.random() < emptyChance) {
        if (Math.random() < treeChance) {
          const treeVariant = Math.floor(Math.random() * 3);
          trees.push([
            bx + (Math.random() - 0.5) * 1.2,
            0,
            bz + (Math.random() - 0.5) * 1.2,
            treeVariant
          ]);
        }
        continue;
      }
      // Place building at center of block
      const color = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
      const buildingHeight = baseHeight + Math.random() * 3;
      buildings.push([
        bx,
        0,
        bz,
        color,
        buildingHeight
      ]);
    }
  }
  // Place cars randomly on roads (not at intersections)
  for (let i = -size + blockSize; i < size; i += blockSize) {
    for (let j = -size + blockSize; j < size; j += blockSize) {
      // Horizontal road (along z)
      if (Math.random() < 0.4) {
        const carZ = j + halfBlock;
        const carX = i;
        const carRot = [0, Math.PI / 2 * Math.floor(Math.random() * 4), 0];
        cars.push([
          carX,
          0.02,
          carZ + (Math.random() - 0.5) * (blockSize - 1),
          carRot
        ]);
      }
      // Vertical road (along x)
      if (Math.random() < 0.4) {
        const carX = j + halfBlock;
        const carZ = i;
        const carRot = [0, Math.PI / 2 * Math.floor(Math.random() * 4), 0];
        cars.push([
          carX + (Math.random() - 0.5) * (blockSize - 1),
          0.02,
          carZ,
          carRot
        ]);
      }
    }
  }

  // Place a few traffic signals beside the roads (not at every intersection)
  for (let i = -size + blockSize; i < size; i += blockSize) {
    for (let j = -size + blockSize; j < size; j += blockSize) {
      if (Math.random() < 0.5) {
        // Place signal beside horizontal road
        const signalRot = [0, Math.PI / 2 * Math.floor(Math.random() * 4), 0];
        signals.push([i + 0.7, 0, j + halfBlock + 1.2, signalRot]);
      }
      if (Math.random() < 0.5) {
        // Place signal beside vertical road
        const signalRot = [0, Math.PI / 2 * Math.floor(Math.random() * 4), 0];
        signals.push([j + halfBlock + 1.2, 0, i + 0.7, signalRot]);
      }
    }
  }
  return { buildings, roads, signals, trees, streetlights, cars };
};
// Streetlight component
const Streetlight = React.memo(function Streetlight({ position }) {
  return (
    <group position={position}>
      <mesh
        geometry={SHARED_GEOMETRIES.streetlightPole}
        material={SHARED_MATERIALS.darkGray}
        scale={[1, 1.5, 1]}
        position={[0, 0.525, 0]}
        castShadow
      />
      <mesh
        geometry={SHARED_GEOMETRIES.streetlightBulb}
        material={SHARED_MATERIALS.streetLight}
        position={[0, 1.1, 0]}
        scale={[1.2, 1.2, 1.2]}
      />
    </group>
  );
});


export const Scene = React.memo(function Scene({ onUfoClick, showUfoSpeechBubble, showHowSpeechBubble, showContactSpeechBubble, onCloseUfoSpeechBubble, onCloseHowSpeechBubble, onCloseContactSpeechBubble }) {
  const [ufoPos] = useState([0, 4, 0]);

  const cityData = useMemo(() => generateCityGrid(10, 1.5), []);
  const { buildings, roads, signals, trees, streetlights, cars } = cityData;

  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[15, 25, 15]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.3} />
      <Stars radius={80} depth={150} count={300} factor={4} fade speed={0.5} />
      
      {/* Ground plane */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={SHARED_GEOMETRIES.plane}
        material={SHARED_MATERIALS.ground}
        scale={22}
        position={[0, -0.01, 0]}
      />
      
      {/* Render roads with proper materials */}
      {roads && roads.map(([x, y, z], i) => (
        <mesh
          key={`road-${i}`}
          position={[x, y, z]}
          geometry={SHARED_GEOMETRIES.plane}
          material={SHARED_MATERIALS.road}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={1}
          receiveShadow
        />
      ))}
      
      {/* Render buildings */}
      {buildings && buildings.map(([x, y, z, color, h], i) => (
        <Building key={`building-${i}`} position={[x, y, z]} color={color} height={h} />
      ))}
      
      {/* Render trees with variants */}
      {trees && trees.map(([x, y, z, variant], i) => (
        <Tree key={`tree-${i}`} position={[x, y, z]} variant={variant || 0} />
      ))}
      
      {/* Render traffic signals */}
      {signals && signals.map(([x, y, z, rotation], i) => (
        <TrafficSignal key={`signal-${i}`} position={[x, y, z]} rotation={rotation || [0, 0, 0]} />
      ))}
      
      {/* Render streetlights */}
      {streetlights && streetlights.map(([x, y, z], i) => (
        <Streetlight key={`streetlight-${i}`} position={[x, y, z]} />
      ))}
      
      {/* Render cars */}
      {cars && cars.map(([x, y, z, rotation], i) => (
        <Car key={`car-${i}`} position={[x, y, z]} rotation={rotation || [0, 0, 0]} />
      ))}
      
      <UFO position={ufoPos} scanning={false} onClick={onUfoClick} />
      {/* UFO Speech Bubbles (centered on screen) */}
      {showUfoSpeechBubble && (
        <Html fullscreen style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{
            background: 'white',
            borderRadius: '1.2em',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            padding: '1.1em 1.5em',
            minWidth: 260,
            maxWidth: 340,
            fontSize: '1.05em',
            color: '#222',
            position: 'relative',
            textAlign: 'center',
            fontWeight: 500,
            margin: 'auto'
          }}>
            <button
              onClick={onCloseUfoSpeechBubble}
              style={{ position: 'absolute', top: 8, right: 14, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}
              aria-label="Close"
            >×</button>
            <div style={{ fontSize: '1.3em', marginBottom: 8 }}>👽</div>
            <div>
              Welcome to <b>Property Prediction AI</b>!<br/>
              This interactive 3D city lets you explore, analyze, and predict property prices using AI.<br/>
              Click the UFO or fill out the form to get started. Enjoy exploring!
            </div>
          </div>
        </Html>
      )}
      {showHowSpeechBubble && (
        <Html fullscreen style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{
            background: 'white',
            borderRadius: '1.2em',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            padding: '1.1em 1.5em',
            minWidth: 260,
            maxWidth: 340,
            fontSize: '1.05em',
            color: '#222',
            position: 'relative',
            textAlign: 'center',
            fontWeight: 500,
            margin: 'auto'
          }}>
            <button
              onClick={onCloseHowSpeechBubble}
              style={{ position: 'absolute', top: 8, right: 14, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}
              aria-label="Close"
            >×</button>
            <div style={{ fontSize: '1.3em', marginBottom: 8 }}>👽</div>
            <div>
              <b>How it works:</b><br/>
              1. Click the UFO or "Get Started" to open the property form.<br/>
              2. Enter your property details and location.<br/>
              3. Our AI predicts the property price instantly!<br/>
              4. Explore the 3D city and try different scenarios.
            </div>
          </div>
        </Html>
      )}
      {showContactSpeechBubble && (
        <Html fullscreen style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{
            background: 'white',
            borderRadius: '1.2em',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            padding: '1.1em 1.5em',
            minWidth: 260,
            maxWidth: 340,
            fontSize: '1.05em',
            color: '#222',
            position: 'relative',
            textAlign: 'center',
            fontWeight: 500,
            margin: 'auto'
          }}>
            <button
              onClick={onCloseContactSpeechBubble}
              style={{ position: 'absolute', top: 8, right: 14, background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}
              aria-label="Close"
            >×</button>
            <div style={{ fontSize: '1.3em', marginBottom: 8 }}>👽</div>
            <div>
              <b>Contact Us</b><br/>
              Have questions or feedback?<br/>
              Email: <a href="mailto:support@propertyai.com" style={{ color: '#2563eb', textDecoration: 'underline' }}>support@propertyai.com</a><br/>
              We’d love to hear from you!
            </div>
          </div>
        </Html>
      )}
      {/* Improved camera and controls */}
      <PerspectiveCamera makeDefault position={[8, 12, 8]} fov={45} />
      <OrbitControls
        minDistance={8}
        maxDistance={14}
        enablePan={true}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
});