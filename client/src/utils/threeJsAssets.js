import * as THREE from 'three';

// Precomputed colors
export const RIM_LIGHT_COLORS = ["#ffd600", "#ff1744", "#00e676", "#2979ff"];
export const CAR_COLORS = ['#1976d2', '#e53935', '#43a047', '#ff9800', '#9c27b0', '#795548', '#607d8b'];
export const PERSON_COLORS = ['#fbc02d', '#ffb300', '#90caf9', '#e57373'];
export const FLOWER_COLORS = ['#ff4081', '#ffd600', '#7c4dff', '#00e676'];

// Shared geometries for performance optimization
export const SHARED_GEOMETRIES = {
  sphere: new THREE.SphereGeometry(1, 16, 16),
  box: new THREE.BoxGeometry(1, 1, 1),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
  cone: new THREE.ConeGeometry(1, 1, 12),
  torus: new THREE.TorusGeometry(1, 0.3, 16, 100),
  dodecahedron: new THREE.DodecahedronGeometry(1),
  plane: new THREE.PlaneGeometry(1, 1),
  ufoBase: new THREE.SphereGeometry(0.6, 16, 16),
  ufoGlass: new THREE.SphereGeometry(0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  rimLight: new THREE.SphereGeometry(0.07, 8, 8),
  carBody: new THREE.BoxGeometry(0.4, 0.12, 0.22),
  carRoof: new THREE.BoxGeometry(0.32, 0.08, 0.18),
  carWindow: new THREE.BoxGeometry(0.02, 0.08, 0.16),
  carSideWindow: new THREE.BoxGeometry(0.3, 0.06, 0.01),
  carWheel: new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8),
  carLight: new THREE.SphereGeometry(0.02, 8, 8),
  treeTrunk: new THREE.CylinderGeometry(0.08, 0.12, 0.5, 8),
  treeCone: new THREE.ConeGeometry(0.25, 0.5, 8),
  treeSphere: new THREE.SphereGeometry(0.22, 12, 12),
  treeDodeca: new THREE.DodecahedronGeometry(0.22),
  streetlightPole: new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8),
  streetlightBulb: new THREE.SphereGeometry(0.07, 8, 8),
  ufoBeam: new THREE.CylinderGeometry(0.3, 2.5, 6, 16, 1, true)
};

// Shared materials for performance optimization
export const SHARED_MATERIALS = {
  metal: new THREE.MeshStandardMaterial({ color: '#b0b0b0', metalness: 0.85, roughness: 0.22 }),
  metalCyan: new THREE.MeshStandardMaterial({ color: '#00e6ff', metalness: 0.7, roughness: 0.3, emissive: '#00e6ff', emissiveIntensity: 0.3 }),
  glass: new THREE.MeshPhysicalMaterial({ color: '#7ecfff', transparent: true, opacity: 0.55, roughness: 0.07, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03, reflectivity: 0.85, transmission: 0.85, ior: 1.4, thickness: 0.25 }),
  carGlass: new THREE.MeshStandardMaterial({ color: '#e3f2fd', transparent: true, opacity: 0.8 }),
  carGlassSide: new THREE.MeshStandardMaterial({ color: '#e3f2fd', transparent: true, opacity: 0.7 }),
  white: new THREE.MeshStandardMaterial({ color: '#ffffff' }),
  black: new THREE.MeshStandardMaterial({ color: '#111111' }),
  darkGray: new THREE.MeshStandardMaterial({ color: '#333333' }),
  gray: new THREE.MeshStandardMaterial({ color: '#888888' }),
  lightGray: new THREE.MeshStandardMaterial({ color: '#bbbbbb' }),
  ground: new THREE.MeshStandardMaterial({ color: '#4caf50' }),
  road: new THREE.MeshStandardMaterial({ color: '#888' }),
  footpath: new THREE.MeshStandardMaterial({ color: '#e0e0e0' }),
  cyanLight: new THREE.MeshStandardMaterial({ color: '#00ffff', transparent: true, opacity: 1, emissive: '#00ffff', emissiveIntensity: 2 }),
  streetLight: new THREE.MeshStandardMaterial({ color: '#fffde4', emissive: '#fffde4', emissiveIntensity: 1.2 }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: '#8d5524' }),
  treeCone: new THREE.MeshStandardMaterial({ color: '#3cb371' }),
  treeSphere: new THREE.MeshStandardMaterial({ color: '#388e3c' }),
  treeDodeca: new THREE.MeshStandardMaterial({ color: '#43a047' }),
  carHeadlight: new THREE.MeshStandardMaterial({ color: '#fffde4', emissive: '#fffde4', emissiveIntensity: 0.5 }),
  carTaillight: new THREE.MeshStandardMaterial({ color: '#ff1744', emissive: '#ff1744', emissiveIntensity: 0.3 }),
  ufoGlow: new THREE.MeshStandardMaterial({ color: '#7ecfff', transparent: true, opacity: 0.18, emissive: '#7ecfff', emissiveIntensity: 0.5 })
};