

import * as THREE from 'three';
import { BuildingType, TILE_SIZE } from '../types';
import { getBuildingSize } from '../constants';

const textureCache: Record<string, THREE.CanvasTexture> = {};

function getMaterial(style: 'wood' | 'brick' | 'concrete' | 'tech' | 'smooth' | 'glass' | 'metal' | 'fabric', colorHex: string, emissive: boolean = false): THREE.Material {
  const key = `${style}-${colorHex}-${emissive}`;
  if (!textureCache[key]) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, size, size);
      
      if (style === 'wood') {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for(let i=0; i<size; i+=8) ctx.fillRect(0, i, size, 1);
        for(let i=0; i<8; i++) ctx.fillRect(Math.random()*size, Math.random()*size, 2, 12);
      } else if (style === 'brick') {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        const h = 8, w = 16;
        for(let y=0; y<size; y+=h) {
          const off = (y/h)%2 === 0 ? 0 : w/2;
          for(let x=-w; x<size; x+=w) ctx.strokeRect(x+off, y, w, h);
        }
      } else if (style === 'concrete') {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for(let i=0; i<50; i++) ctx.fillRect(Math.random()*size, Math.random()*size, 2, 2);
      } else if (style === 'tech') {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, Math.random()*size); ctx.lineTo(size, Math.random()*size);
        ctx.moveTo(Math.random()*size, 0); ctx.lineTo(Math.random()*size, size);
        ctx.stroke();
      } else if (style === 'metal') {
          const grad = ctx.createLinearGradient(0,0,size,size);
          grad.addColorStop(0, 'rgba(255,255,255,0.1)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
          grad.addColorStop(1, 'rgba(255,255,255,0.1)');
          ctx.fillStyle = grad;
          ctx.fillRect(0,0,size,size);
      } else if (style === 'fabric') {
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          for(let i=0; i<size; i+=2) ctx.fillRect(i, 0, 1, size);
          for(let i=0; i<size; i+=2) ctx.fillRect(0, i, size, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    textureCache[key] = tex;
  }
  
  return new THREE.MeshStandardMaterial({
    map: textureCache[key],
    color: 0xffffff,
    emissive: emissive ? colorHex : 0x000000,
    emissiveIntensity: emissive ? 0.6 : 0,
    roughness: style === 'glass' ? 0.1 : (style === 'metal' ? 0.4 : 0.9),
    metalness: style === 'tech' || style === 'metal' ? 0.6 : 0.1,
    transparent: style === 'glass',
    opacity: style === 'glass' ? 0.6 : 1.0
  });
}

const addBox = (group: THREE.Group, w: number, h: number, d: number, y: number, mat: THREE.Material, x=0, z=0) => {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y + h/2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
};

// 0. TRIBAL CENTER: luxurious, open, columns, dome
const generateTribalCenter = (group: THREE.Group, level: number, sizeInTiles: number, squadColor: string) => {
    const totalW = sizeInTiles * TILE_SIZE;
    const baseW = totalW * 0.9;
    const marbleMat = getMaterial('smooth', '#f8fafc'); // White Marble
    const goldMat = getMaterial('metal', '#f59e0b', true); // Gold Accents
    const floorMat = getMaterial('brick', '#e2e8f0'); // Light stone

    // 1. Grand Base/Steps
    addBox(group, baseW, 0.4, baseW, 0, floorMat);
    addBox(group, baseW * 0.9, 0.3, baseW * 0.9, 0.4, marbleMat);

    // 2. Pillars (Circle or Square arrangement)
    const pillarH = 3.5;
    const pillarR = 0.25;
    const pillarGeo = new THREE.CylinderGeometry(pillarR, pillarR, pillarH, 16);
    const pillarCount = 8;
    const radius = (baseW * 0.35);

    for (let i = 0; i < pillarCount; i++) {
        const angle = (i / pillarCount) * Math.PI * 2;
        const px = Math.cos(angle) * radius;
        const pz = Math.sin(angle) * radius;
        const pillar = new THREE.Mesh(pillarGeo, marbleMat);
        pillar.position.set(px, 0.7 + pillarH/2, pz);
        pillar.castShadow = true;
        group.add(pillar);
    }

    // 3. Central Feature (Knowledge Flame / Globe)
    const globeGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const globeMat = getMaterial('tech', '#6366f1', true); // Indigo
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globe.position.set(0, 2.5, 0);
    globe.userData = { animate: 'spin' };
    group.add(globe);

    const standGeo = new THREE.CylinderGeometry(0.5, 0.8, 1.0, 8);
    const stand = new THREE.Mesh(standGeo, goldMat);
    stand.position.set(0, 0.7 + 0.5, 0);
    group.add(stand);

    // 4. Roof / Ring (Open air)
    const ringGeo = new THREE.TorusGeometry(radius, 0.4, 16, 32);
    const ring = new THREE.Mesh(ringGeo, marbleMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.7 + pillarH, 0);
    group.add(ring);

    // 5. Gold Dome Frame (Wireframe style)
    const domeGeo = new THREE.SphereGeometry(radius * 1.1, 8, 6, 0, Math.PI * 2, 0, Math.PI/2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 0.7 + pillarH, 0);
    group.add(dome);
};

// 1. GOVERNANCE: "Casa da Administração" (Prefeitura)
const generateGovernance = (group: THREE.Group, level: number, sizeInTiles: number, squadColor: string) => {
    const totalW = sizeInTiles * TILE_SIZE;
    const baseW = totalW * 0.7;
    let y = 0;

    addBox(group, baseW + 0.4, 0.2, baseW + 0.4, y, getMaterial('concrete', '#94a3b8')); y+=0.2;
    addBox(group, baseW + 0.2, 0.2, baseW + 0.2, y, getMaterial('concrete', '#cbd5e1')); y+=0.2;

    const pillarMat = getMaterial('concrete', '#e2e8f0');
    const pillarH = 1.5 + (level * 0.2);
    const pillarR = 0.15;
    const pillarGeo = new THREE.CylinderGeometry(pillarR, pillarR, pillarH, 8);
    
    [-1, -0.3, 0.3, 1].forEach(offset => {
        const mesh = new THREE.Mesh(pillarGeo, pillarMat);
        mesh.position.set(offset * (baseW/2.5), y + pillarH/2, baseW/2 - 0.2);
        mesh.castShadow = true;
        group.add(mesh);
    });

    addBox(group, baseW * 0.9, pillarH, baseW * 0.7, y, getMaterial('concrete', '#f1f5f9'), 0, -0.2);
    
    y += pillarH;

    const roofH = 0.8;
    const roofGeo = new THREE.ConeGeometry(baseW * 0.8, roofH, 4);
    const roofMat = getMaterial('concrete', '#475569'); // Dark Slate
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, y + roofH/2, -0.1);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, 0.8);
    group.add(roof);

    const poleH = 1.5;
    addBox(group, 0.05, poleH, 0.05, y + roofH/2, getMaterial('metal', '#64748b'));
    addBox(group, 0.6, 0.4, 0.05, y + roofH + 0.8, getMaterial('fabric', squadColor), 0.3);
};

// 2. PEOPLE & CULTURE: "Centro Comunitário"
const generatePeople = (group: THREE.Group, level: number, sizeInTiles: number, squadColor: string) => {
    const totalW = sizeInTiles * TILE_SIZE;
    const baseW = totalW * 0.8;
    const wallMat = getMaterial('brick', '#fca5a5'); // Warm pinkish/brick
    const roofMat = getMaterial('wood', '#9f1239');  // Dark Red Wood
    
    const wingW = baseW * 0.3;
    const wingD = baseW;
    const wingH = 1.2 + (level * 0.1);

    addBox(group, wingW, wingH, wingD, 0, wallMat, -baseW/2 + wingW/2, 0);
    addBox(group, wingW, wingH, wingD, 0, wallMat, baseW/2 - wingW/2, 0);
    addBox(group, baseW - (wingW*2) + 0.1, wingH, wingW, 0, wallMat, 0, -baseW/2 + wingW/2);

    addBox(group, wingW+0.1, 0.2, wingD+0.1, wingH, roofMat, -baseW/2 + wingW/2, 0);
    addBox(group, wingW+0.1, 0.2, wingD+0.1, wingH, roofMat, baseW/2 - wingW/2, 0);
    addBox(group, baseW - (wingW*2) + 0.2, 0.2, wingW+0.1, wingH, roofMat, 0, -baseW/2 + wingW/2);

    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6);
    const trunk = new THREE.Mesh(trunkGeo, getMaterial('wood', '#5d4037'));
    trunk.position.set(0, 0.3, 0.2);
    group.add(trunk);

    const leavesGeo = new THREE.DodecahedronGeometry(0.4);
    const leaves = new THREE.Mesh(leavesGeo, getMaterial('concrete', '#16a34a')); // Green
    leaves.position.set(0, 0.8, 0.2);
    group.add(leaves);
    
    addBox(group, 0.4, 0.6, 0.02, wingH/2, getMaterial('fabric', squadColor), -baseW/2 - 0.05, 0.5);
};

// 3. PRODUCT & INNOVATION: "Laboratório Criativo"
const generateProduct = (group: THREE.Group, level: number, sizeInTiles: number, squadColor: string) => {
    const totalW = sizeInTiles * TILE_SIZE;
    
    addBox(group, totalW * 0.5, 1.5, totalW * 0.5, 0, getMaterial('concrete', '#e0f2fe'), -0.5, -0.5);
    
    const towerH = 2.5 + (level * 0.3);
    addBox(group, totalW * 0.3, towerH, totalW * 0.3, 0, getMaterial('glass', '#38bdf8'), 0.5, 0.5);
    
    addBox(group, totalW * 0.8, 0.5, 0.5, 0.5, getMaterial('tech', '#94a3b8'), 0, 0);

    addBox(group, 0.1, 1.0, 0.1, towerH, getMaterial('metal', '#cbd5e1'), 0.5, 0.5); // Antenna
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, 0.1, 8), getMaterial('tech', squadColor, true));
    dish.position.set(0.5, towerH + 1, 0.5);
    dish.userData = { animate: 'spin' };
    group.add(dish);

    addBox(group, 0.8, 0.1, 0.8, 1.5, getMaterial('metal', '#1e293b'), -0.5, -0.5);
    const holoGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const holo = new THREE.Mesh(holoGeo, getMaterial('tech', squadColor, true));
    holo.position.set(-0.5, 2.0, -0.5);
    holo.userData = { animate: 'pulse' };
    group.add(holo);
};

// 4. MARKET & RELATIONSHIP: "Pavilhão de Mercado"
const generateMarket = (group: THREE.Group, level: number, sizeInTiles: number, squadColor: string) => {
    const totalW = sizeInTiles * TILE_SIZE;
    const baseW = totalW * 0.8;
    
    addBox(group, baseW, 0.2, baseW, 0, getMaterial('brick', '#fbbf24')); // Yellowish stone

    const postMat = getMaterial('wood', '#78350f');
    const postH = 1.8;
    const offset = baseW/2 - 0.1;
    addBox(group, 0.1, postH, 0.1, 0, postMat, offset, offset);
    addBox(group, 0.1, postH, 0.1, 0, postMat, -offset, offset);
    addBox(group, 0.1, postH, 0.1, 0, postMat, offset, -offset);
    addBox(group, 0.1, postH, 0.1, 0, postMat, -offset, -offset);

    const roofGroup = new THREE.Group();
    const roofGeo = new THREE.ConeGeometry(baseW * 0.6, 1.0, 4);
    const roofMat = getMaterial('fabric', '#f59e0b'); // Orange main
    const accentMat = getMaterial('fabric', squadColor); // Squad accent strip

    const mainRoof = new THREE.Mesh(roofGeo, roofMat);
    mainRoof.rotation.y = Math.PI/4;
    mainRoof.position.y = postH + 0.5;
    roofGroup.add(mainRoof);
    
    group.add(roofGroup);

    addBox(group, 0.8, 0.6, 0.6, 0.2, getMaterial('wood', '#b45309'), -0.5, 0);
    addBox(group, 0.8, 0.6, 0.6, 0.2, getMaterial('wood', '#b45309'), 0.5, 0.5);
    
    addBox(group, 1.2, 0.4, 0.05, postH, accentMat, 0, offset);
};

// 5. RESOURCES & INFRASTRUCTURE: "Depósito Central"
const generateResources = (group: THREE.Group, level: number, sizeInTiles: number, squadColor: string) => {
    const totalW = sizeInTiles * TILE_SIZE;
    const baseW = totalW * 0.8;
    
    const hangarH = 1.5 + (level * 0.2);
    addBox(group, baseW * 0.6, hangarH, baseW * 0.9, 0, getMaterial('metal', '#475569'), -0.4, 0); // Dark Metal

    addBox(group, 0.1, hangarH * 0.7, 0.8, 0, getMaterial('tech', '#94a3b8'), -0.4 + (baseW*0.3), 0.2);

    const contW = 0.6; const contH = 0.6; const contD = 1.2;
    addBox(group, contW, contH, contD, 0, getMaterial('metal', squadColor), 0.6, -0.5);
    addBox(group, contW, contH, contD, 0, getMaterial('metal', '#d97706'), 0.6, 0.8);
    addBox(group, contW, contH, contD, contH, getMaterial('metal', '#1e40af'), 0.6, 0.0);

    addBox(group, 0.4, 0.3, 0.4, hangarH, getMaterial('tech', '#cbd5e1'), -0.4, 0);
    
    addBox(group, 0.2, hangarH + 1, 0.2, 0, getMaterial('metal', '#facc15'), 1.2, -1); // Yellow crane post
};

// --- EXISTING RESIDENTIAL & HQ GENERATORS (Tweaked for compatibility) ---

const generateResidential = (group: THREE.Group, level: number, sizeInTiles: number, squadColor: string) => {
    const w = 1.4;
    addBox(group, w, 1, w, 0, getMaterial('wood', '#d4a373'));
    addBox(group, w+0.2, 0.2, w+0.2, 1, getMaterial('brick', '#9f1239')); // Roof base
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), getMaterial('brick', '#9f1239'));
    roof.position.y = 1.5;
    roof.rotation.y = Math.PI/4;
    group.add(roof);

    const pole = addBox(group, 0.05, 2, 0.05, 0, getMaterial('wood', '#5c4033'), 0.5, 0.5);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), getMaterial('fabric', squadColor));
    flag.position.set(0.8, 1.8, 0.5);
    flag.userData = { animate: 'wave' };
    group.add(flag);
};

const generateSquadHQ = (group: THREE.Group, level: number, sizeInTiles: number, squadColor?: string) => {
    const totalW = sizeInTiles * TILE_SIZE;
    const baseW = totalW * 0.8;

    const baseColor = squadColor || '#f1f5f9';

    addBox(group, baseW, 0.6, baseW, 0, getMaterial('concrete', baseColor));
    addBox(group, baseW * 0.7, 0.8, baseW * 0.7, 0.6, getMaterial('tech', '#ecfccb')); 
    
    const towerW = baseW * 0.3;
    addBox(group, towerW, 2.5, towerW, 1.4, getMaterial('smooth', '#ffffff')); 
    
    const dishGeo = new THREE.CylinderGeometry(0.1, 0.8, 0.2, 8);
    const dishMat = getMaterial('smooth', squadColor || '#fbbf24', true);
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 4.2, 0);
    dish.userData = { animate: 'pulse' }; 
    dish.castShadow = true;
    group.add(dish);

    const ringGeo = new THREE.TorusGeometry(0.6, 0.05, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 3, 0);
    ring.rotation.x = Math.PI / 2;
    ring.userData = { animate: 'spin' };
    group.add(ring);
};


export const createProceduralBuilding = (type: BuildingType, level: number, squadColor?: string): THREE.Group => {
  const group = new THREE.Group();
  const sizeInTiles = getBuildingSize(level, type);
  const color = squadColor || '#94a3b8'; // Default grey if missing
  
  switch (type) {
      case BuildingType.TRIBAL_CENTER:
          generateTribalCenter(group, level, sizeInTiles, '#f59e0b');
          break;
      case BuildingType.SQUAD_HQ:
          generateSquadHQ(group, level, sizeInTiles, color);
          break;
      case BuildingType.RESIDENTIAL:
          generateResidential(group, level, sizeInTiles, color);
          break;
      case BuildingType.GOVERNANCE:
          generateGovernance(group, level, sizeInTiles, color);
          break;
      case BuildingType.PEOPLE:
          generatePeople(group, level, sizeInTiles, color);
          break;
      case BuildingType.PRODUCT:
          generateProduct(group, level, sizeInTiles, color);
          break;
      case BuildingType.MARKET:
          generateMarket(group, level, sizeInTiles, color);
          break;
      case BuildingType.RESOURCES:
          generateResources(group, level, sizeInTiles, color);
          break;
      default:
          addBox(group, 1, 1, 1, 0, getMaterial('concrete', '#ffffff'));
          break;
  }

  // Common Base Plate (Foundation) - ALWAYS SQUAD COLORED
  const baseGeo = new THREE.BoxGeometry(sizeInTiles * TILE_SIZE, 0.1, sizeInTiles * TILE_SIZE);
  const baseMat = new THREE.MeshStandardMaterial({ color: type === BuildingType.TRIBAL_CENTER ? '#f8fafc' : color }); 
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.05;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  return group;
};