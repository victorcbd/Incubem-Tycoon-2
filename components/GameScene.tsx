
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GRID_SIZE, TILE_SIZE, GameState, BuildingType } from '../types';
import { createProceduralBuilding } from '../services/buildingGenerator';
import { GridPosition } from '../types';
import { getBuildingSize, BUILDING_METADATA } from '../constants';

// High-resolution text label helper
function createLabel(text: string, subText: string, color: string): THREE.Sprite {
    const hdScale = 4;
    const w = 300 * hdScale;
    const h = 128 * hdScale;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; 
        ctx.strokeStyle = color;
        ctx.lineWidth = 4 * hdScale;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(4 * hdScale, 4 * hdScale, w - (8 * hdScale), h - (8 * hdScale), 24 * hdScale);
        } else {
            ctx.rect(4 * hdScale, 4 * hdScale, w - (8 * hdScale), h - (8 * hdScale));
        }
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowColor = 'rgba(0,0,0,1)';
        ctx.shadowBlur = 4 * hdScale;
        ctx.shadowOffsetX = 2 * hdScale;
        ctx.shadowOffsetY = 2 * hdScale;

        ctx.font = `900 ${22 * hdScale}px "Roboto", sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text.toUpperCase(), w / 2, h * 0.35);

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0; 
        ctx.shadowOffsetY = 0;
        ctx.font = `700 ${18 * hdScale}px "Roboto", sans-serif`;
        ctx.fillStyle = '#cbd5e1'; 
        ctx.fillText(subText.toUpperCase(), w / 2, h * 0.72);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter; 
    tex.magFilter = THREE.LinearFilter;
    
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(5, 2.1, 1);
    sprite.renderOrder = 999; 
    sprite.visible = false; // Hidden by default
    return sprite;
}

// Pseudo-random deterministic function
const pseudoRandom = (x: number, z: number) => {
    return Math.abs((Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1);
};

// --- NATURE GENERATORS ---
const createTree = (x: number, z: number, scale = 1): THREE.Group => {
    const group = new THREE.Group();
    const seed = pseudoRandom(x, z);
    
    // Trunk
    const trunkH = 0.6 + seed * 0.4;
    const trunkGeo = new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, trunkH * scale, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 1 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = (trunkH * scale) / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Leaves
    const leavesGeo = new THREE.DodecahedronGeometry(0.5 * scale);
    const leafColor = seed > 0.8 ? 0xf472b6 : (seed > 0.3 ? 0x22c55e : 0x15803d); // Pink, Light Green, Dark Green
    const leavesMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = (trunkH * scale) + (0.3 * scale);
    leaves.castShadow = true;
    group.add(leaves);

    group.position.set(0, 0, 0);
    // Random rotation
    group.rotation.y = seed * Math.PI * 2;
    
    // Animate gentle sway
    group.userData = { animate: 'sway', offset: seed * 100 };

    return group;
};

const createBush = (x: number, z: number): THREE.Mesh => {
    const seed = pseudoRandom(x, z);
    const geo = new THREE.DodecahedronGeometry(0.2 + seed * 0.15);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.2;
    mesh.rotation.y = seed * Math.PI;
    mesh.castShadow = true;
    return mesh;
};

const createRock = (x: number, z: number): THREE.Mesh => {
    const seed = pseudoRandom(x, z);
    const geo = new THREE.DodecahedronGeometry(0.15 + seed * 0.2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.1;
    mesh.rotation.set(seed, seed, seed);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
};

const createBridge = (direction: 'N'|'S'|'E'|'W'): THREE.Group => {
    const group = new THREE.Group();
    // Plank color
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa87132 });
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

    const length = 6;
    const width = 2;

    const mainGeo = new THREE.BoxGeometry(width, 0.2, length);
    const main = new THREE.Mesh(mainGeo, woodMat);
    main.receiveShadow = true;
    group.add(main);

    // Rails
    const railGeo = new THREE.BoxGeometry(0.1, 0.5, length);
    const railL = new THREE.Mesh(railGeo, woodMat);
    railL.position.set(-width/2 + 0.1, 0.35, 0);
    group.add(railL);

    const railR = new THREE.Mesh(railGeo, woodMat);
    railR.position.set(width/2 - 0.1, 0.35, 0);
    group.add(railR);

    // Neon Strips
    const stripGeo = new THREE.BoxGeometry(0.05, 0.05, length);
    const stripL = new THREE.Mesh(stripGeo, neonMat);
    stripL.position.set(-width/2, 0.6, 0);
    group.add(stripL);

    const stripR = new THREE.Mesh(stripGeo, neonMat);
    stripR.position.set(width/2, 0.6, 0);
    group.add(stripR);

    if (direction === 'N') group.position.set(0, 0, -GRID_SIZE/2 * TILE_SIZE - length/2);
    if (direction === 'S') group.position.set(0, 0, GRID_SIZE/2 * TILE_SIZE + length/2);
    if (direction === 'E') {
        group.rotation.y = Math.PI/2;
        group.position.set(GRID_SIZE/2 * TILE_SIZE + length/2, 0, 0);
    }
    if (direction === 'W') {
        group.rotation.y = Math.PI/2;
        group.position.set(-GRID_SIZE/2 * TILE_SIZE - length/2, 0, 0);
    }

    return group;
}

interface GameSceneProps {
  gameState: GameState;
  zoomLevel: number;
  onTileClick: (pos: GridPosition) => void;
  onBuildingClick: (buildingId: string) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ gameState, zoomLevel, onTileClick, onBuildingClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const labelsGroupRef = useRef<THREE.Group | null>(null);
  const vegetationGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null); 
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  const buildingMeshesRef = useRef<Map<string, { mesh: THREE.Group; level: number; squadColor?: string }>>(new Map());
  const labelSpritesRef = useRef<Map<string, THREE.Sprite>>(new Map());
  
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const groundPlaneRef = useRef<THREE.Mesh | null>(null);
  const highlightMeshRef = useRef<THREE.Mesh | null>(null);
  const reqAnimRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Interaction State
  const panOffset = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef<{x: number, y: number} | null>(null);
  
  const hoveredBuildingId = useRef<string | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const isLongPressed = useRef(false);

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // Brighter Solarpunk Sky
    const skyColor = 0xcffafe; 
    scene.background = new THREE.Color(skyColor);
    // Slight golden haze instead of heavy fog
    scene.fog = new THREE.FogExp2(0xfffbeb, 0.005); 
    sceneRef.current = scene;

    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight || 1;
    const d = 20;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(20, 20, 20); 
    camera.lookAt(scene.position);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (Solarpunk Warmth)
    const ambientLight = new THREE.HemisphereLight(0xe0f2fe, 0xfcd34d, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaeb, 1.3); 
    dirLight.position.set(30, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const shadowSize = 40;
    dirLight.shadow.camera.left = -shadowSize;
    dirLight.shadow.camera.right = shadowSize;
    dirLight.shadow.camera.top = shadowSize;
    dirLight.shadow.camera.bottom = -shadowSize;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Expanded Ground Plane
    const planeGeometry = new THREE.PlaneGeometry(GRID_SIZE * TILE_SIZE * 4, GRID_SIZE * TILE_SIZE * 4);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x86efac, // Light lush green
        roughness: 1,
        metalness: 0
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
    groundPlaneRef.current = plane;

    // Bridges
    const bridges = new THREE.Group();
    bridges.add(createBridge('N'));
    bridges.add(createBridge('S'));
    bridges.add(createBridge('E'));
    bridges.add(createBridge('W'));
    scene.add(bridges);

    // Grid Helper (Subtle)
    const gridHelper = new THREE.GridHelper(GRID_SIZE * TILE_SIZE, GRID_SIZE, 0xffffff, 0xffffff);
    gridHelper.position.y = 0.02;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);

    // Particles (Solar Motes/Pollen)
    const particlesCount = 500;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const range = GRID_SIZE * TILE_SIZE * 2;
    for(let i=0; i<particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * range; 
        if (i % 3 === 1) posArray[i] = Math.random() * 15 + 2; // Keep above ground
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.2,
        color: 0xfef9c3, // Light yellow pollen
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);
    particlesRef.current = particlesMesh;

    // Highlight
    const highlightGeo = new THREE.BoxGeometry(TILE_SIZE, 0.2, TILE_SIZE);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
    const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    highlightMesh.visible = false;
    scene.add(highlightMesh);
    highlightMeshRef.current = highlightMesh;

    // Groups
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    const labelsGroup = new THREE.Group();
    scene.add(labelsGroup);
    labelsGroupRef.current = labelsGroup;

    const vegetationGroup = new THREE.Group();
    scene.add(vegetationGroup);
    vegetationGroupRef.current = vegetationGroup;

    // Animation Loop
    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.015;

      // Camera Pan
      if (cameraRef.current) {
          const baseX = 20;
          const baseY = 20;
          const baseZ = 20;
          cameraRef.current.position.set(baseX + panOffset.current.x, baseY, baseZ + panOffset.current.z);
          cameraRef.current.lookAt(panOffset.current.x, 0, panOffset.current.z);
      }

      // Particles float
      if (particlesRef.current) {
          particlesRef.current.rotation.y = timeRef.current * 0.02; 
          particlesRef.current.position.y = Math.sin(timeRef.current) * 0.5;
      }

      // Vegetation Sway
      if (vegetationGroupRef.current) {
          vegetationGroupRef.current.children.forEach(child => {
              if (child.userData.animate === 'sway') {
                  child.rotation.z = Math.sin(timeRef.current * 2 + child.userData.offset) * 0.05;
              }
          });
      }

      // Buildings & Labels
      buildingsGroupRef.current?.children.forEach(building => {
          const id = building.userData.id;
          
          if (id === gameState.selectedBuildingId) {
             building.position.y = Math.sin(timeRef.current * 4) * 0.2 + 0.2;
          } else {
             building.position.y = 0;
          }
          building.traverse((child) => {
              if (child.userData.animate === 'spin') child.rotation.y += 0.05;
              else if (child.userData.animate === 'wave') child.rotation.z = Math.sin(timeRef.current * 3) * 0.1;
              else if (child.userData.animate === 'pulse') {
                  const s = 1 + Math.sin(timeRef.current * 2) * 0.1;
                  child.scale.set(s, 1, s);
              }
          });

          const label = labelSpritesRef.current.get(id);
          if (label) {
              const isHovered = (id === hoveredBuildingId.current);
              label.visible = isHovered;
              
              if (isHovered) {
                  const sizeInTiles = getBuildingSize(building.userData.level || 1, building.userData.type || BuildingType.RESIDENTIAL);
                  const baseY = sizeInTiles + 3;
                  label.position.y = baseY + Math.sin(timeRef.current * 2) * 0.1;
              }
          }
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
         rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
         if (entry.contentRect.width > 0 && entry.contentRect.height > 0 && cameraRef.current && rendererRef.current) {
            const width = entry.contentRect.width;
            const height = entry.contentRect.height;
            const asp = width / height;
            
            cameraRef.current.left = -d * asp;
            cameraRef.current.right = d * asp;
            cameraRef.current.top = d;
            cameraRef.current.bottom = -d;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
         }
      }
    });

    resizeObserver.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(reqAnimRef.current);
      resizeObserver.disconnect();
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []); 

  // Zoom
  useEffect(() => {
      if (cameraRef.current) {
          cameraRef.current.zoom = zoomLevel;
          cameraRef.current.updateProjectionMatrix();
      }
  }, [zoomLevel]);

  // Sync Buildings, Labels & POPULATE VEGETATION
  useEffect(() => {
    if (!buildingsGroupRef.current || !labelsGroupRef.current || !vegetationGroupRef.current) return;

    // --- 1. SYNC BUILDINGS & LABELS (Existing Logic) ---
    const currentIds = new Set(gameState.buildings.map(b => b.id));
    
    // Occupied Tiles Map
    const occupiedTiles = new Set<string>();
    
    gameState.buildings.forEach(building => {
        const size = getBuildingSize(building.level, building.type);
        for(let x=0; x<size; x++) {
            for(let z=0; z<size; z++) {
                occupiedTiles.add(`${building.position.x + x},${building.position.z + z}`);
            }
        }
    });

    buildingMeshesRef.current.forEach((value, id) => {
      if (!currentIds.has(id)) {
        buildingsGroupRef.current?.remove(value.mesh);
        buildingMeshesRef.current.delete(id);
        const lbl = labelSpritesRef.current.get(id);
        if (lbl) {
            labelsGroupRef.current?.remove(lbl);
            labelSpritesRef.current.delete(id);
        }
      }
    });
    
    gameState.buildings.forEach(building => {
      const sizeInTiles = getBuildingSize(building.level, building.type);
      const offset = (sizeInTiles * TILE_SIZE) / 2;
      const wx = (building.position.x - GRID_SIZE / 2) * TILE_SIZE + offset;
      const wz = (building.position.z - GRID_SIZE / 2) * TILE_SIZE + offset;

      let squadId = building.squadId;
      if (building.type === BuildingType.RESIDENTIAL) {
          const owner = gameState.users.find(u => u.id === building.ownerId);
          if (owner) squadId = owner.squadId;
      }
      const squad = gameState.squads.find(s => s.id === squadId);
      const squadColor = squad?.color || '#ffffff';
      const squadName = squad?.name || 'Unknown Squad';

      let existing = buildingMeshesRef.current.get(building.id);
      
      if (existing && (existing.level !== building.level || existing.squadColor !== squadColor)) {
          buildingsGroupRef.current?.remove(existing.mesh);
          existing = undefined;
      }

      let mesh: THREE.Group;
      if (!existing) {
        mesh = createProceduralBuilding(building.type, building.level, squadColor);
        mesh.userData = { id: building.id, type: building.type, level: building.level };
        buildingsGroupRef.current?.add(mesh);
        buildingMeshesRef.current.set(building.id, { mesh, level: building.level, squadColor });
      } else {
        mesh = existing.mesh;
      }
      mesh.position.x = wx;
      mesh.position.z = wz;

      // Label Update
      let title = "";
      let sub = "";
      if (building.type === BuildingType.SQUAD_HQ) {
          title = `${squadName}`;
          sub = "SQUAD HQ";
      } else if (building.type === BuildingType.RESIDENTIAL) {
          title = "BASE";
          sub = gameState.users.find(u => u.id === building.ownerId)?.name || "Desconhecido";
      } else {
          title = BUILDING_METADATA[building.type]?.title || "Projeto";
          sub = squadName;
      }
      
      let label = labelSpritesRef.current.get(building.id);
      if (!label) {
          label = createLabel(title, sub, squadColor);
          labelsGroupRef.current?.add(label);
          labelSpritesRef.current.set(building.id, label);
      }
      label.position.set(wx, sizeInTiles + 3, wz);
    });

    // --- 2. POPULATE VEGETATION ---
    vegetationGroupRef.current.clear();
    
    // Inner Grid Flora
    for(let x=0; x<GRID_SIZE; x++) {
        for(let z=0; z<GRID_SIZE; z++) {
            if (occupiedTiles.has(`${x},${z}`)) continue;
            
            const seed = pseudoRandom(x, z);
            const wx = (x - GRID_SIZE / 2) * TILE_SIZE + TILE_SIZE / 2;
            const wz = (z - GRID_SIZE / 2) * TILE_SIZE + TILE_SIZE / 2;

            if (seed > 0.95) { // 5% Tree
                const tree = createTree(x, z);
                tree.position.set(wx, 0, wz);
                vegetationGroupRef.current.add(tree);
            } else if (seed > 0.90) { // 5% Bush
                const bush = createBush(x, z);
                bush.position.set(wx + (seed-0.9)*10, 0, wz + (seed-0.9)*-5);
                vegetationGroupRef.current.add(bush);
            } else if (seed < 0.02) { // 2% Rock
                const rock = createRock(x, z);
                rock.position.set(wx, 0, wz);
                vegetationGroupRef.current.add(rock);
            }
        }
    }

    // Outer Dense Forest Ring (Surroundings)
    const forestRange = 8; // Extra tiles outside grid
    for(let x = -forestRange; x < GRID_SIZE + forestRange; x++) {
        for(let z = -forestRange; z < GRID_SIZE + forestRange; z++) {
            // Skip inner grid
            if (x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE) continue;
            
            const seed = pseudoRandom(x, z);
            const wx = (x - GRID_SIZE / 2) * TILE_SIZE + TILE_SIZE / 2;
            const wz = (z - GRID_SIZE / 2) * TILE_SIZE + TILE_SIZE / 2;
            
            // Denser placement outside
            if (seed > 0.4) { 
                const scale = 1.2 + seed * 0.5;
                const tree = createTree(x, z, scale);
                tree.position.set(wx, 0, wz);
                vegetationGroupRef.current.add(tree);
            } else if (seed < 0.2) {
                const rock = createRock(x, z);
                rock.scale.set(2,2,2);
                rock.position.set(wx, 0, wz);
                vegetationGroupRef.current.add(rock);
            }
        }
    }

  }, [gameState.buildings, gameState.users, gameState.currentUser, gameState.squads]);

  // --- INPUT HANDLERS ---

  const handlePointerDown = (e: React.PointerEvent) => {
      isDragging.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      (e.target as Element).setPointerCapture(e.pointerId);
      
      if (hoveredBuildingId.current) {
          longPressTimer.current = window.setTimeout(() => {
              isLongPressed.current = true;
          }, 800); 
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!mountRef.current || !highlightMeshRef.current || !groundPlaneRef.current || !cameraRef.current) return;
    
    if (dragStart.current) {
         const moveDist = Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
         if (moveDist > 10) {
             if (longPressTimer.current) clearTimeout(longPressTimer.current);
             isLongPressed.current = false;
         }
    }

    if (dragStart.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            isDragging.current = true;
        }
        if (isDragging.current) {
            const speed = 0.05 / zoomLevel;
            const deltaX = (dx + dy) * speed * -1;
            const deltaZ = (dy - dx) * speed * -1;
            panOffset.current.x += deltaX;
            panOffset.current.z += deltaZ;
            dragStart.current = { x: e.clientX, y: e.clientY };
        }
    }

    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);

    if (buildingsGroupRef.current) {
        const intersects = raycaster.current.intersectObjects(buildingsGroupRef.current.children, true);
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && obj.parent !== buildingsGroupRef.current) {
                obj = obj.parent;
            }
            if (obj.userData.id) {
                hoveredBuildingId.current = obj.userData.id;
            }
        } else {
            if (!isLongPressed.current) hoveredBuildingId.current = null;
        }
    }

    if (!isDragging.current) {
        const intersectsGround = raycaster.current.intersectObject(groundPlaneRef.current);
        if (intersectsGround.length > 0) {
            const intersect = intersectsGround[0];
            const x = Math.floor((intersect.point.x + (GRID_SIZE * TILE_SIZE)/2) / TILE_SIZE);
            const z = Math.floor((intersect.point.z + (GRID_SIZE * TILE_SIZE)/2) / TILE_SIZE);
            if (x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE) {
                highlightMeshRef.current.visible = true;
                highlightMeshRef.current.position.set(
                (x - GRID_SIZE / 2) * TILE_SIZE + TILE_SIZE / 2,
                0.1,
                (z - GRID_SIZE / 2) * TILE_SIZE + TILE_SIZE / 2
                );
            } else {
                highlightMeshRef.current.visible = false;
            }
        } else {
            highlightMeshRef.current.visible = false;
        }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    isLongPressed.current = false;
    dragStart.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
    
    if (!isDragging.current) {
        handleClick(e);
    }
    setTimeout(() => { isDragging.current = false; }, 0);
  };

  const handleClick = (e: React.PointerEvent) => {
    if (!cameraRef.current || !buildingsGroupRef.current || !groundPlaneRef.current) return;
    
    const intersectsBuildings = raycaster.current.intersectObjects(buildingsGroupRef.current.children, true);
    if (intersectsBuildings.length > 0) {
      let obj = intersectsBuildings[0].object;
      while (obj.parent && obj.parent !== buildingsGroupRef.current) {
        obj = obj.parent;
      }
      if (obj.userData.id) {
        onBuildingClick(obj.userData.id);
        return; 
      }
    }

    const intersectsGround = raycaster.current.intersectObject(groundPlaneRef.current);
    if (intersectsGround.length > 0) {
       const intersect = intersectsGround[0];
       const x = Math.floor((intersect.point.x + (GRID_SIZE * TILE_SIZE)/2) / TILE_SIZE);
       const z = Math.floor((intersect.point.z + (GRID_SIZE * TILE_SIZE)/2) / TILE_SIZE);
       if (x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE) {
         onTileClick({ x, z });
       }
    }
  };

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
export default GameScene;
