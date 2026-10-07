import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../assets/vendor/three.module.min.js';
import {PANTHEON,pantheonDomeGeometry,pantheonDrumDoorGeometry,drawPantheon,drawTrevi} from '../rome-monuments.js';
import {LANDMARKS} from '../rome-city-layout.js';
const g=pantheonDomeGeometry(),p=g.attributes.position;
for(let i=0;i<p.count;i++){
 assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));
 assert(Math.hypot(p.getX(i),p.getZ(i))>=PANTHEON.oculusRadius-1e-5,'Oculus must remain an open hole');
}
const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(g,material);mesh.updateMatrixWorld(true);
const ray=new THREE.Raycaster(new THREE.Vector3(0,30,0),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(mesh).length,0);
ray.ray.origin.x=5;assert(ray.intersectObject(mesh).length>0);
assert.equal(PANTHEON.drumHeight,PANTHEON.radius);
assert(Math.abs(PANTHEON.oculusRadius/PANTHEON.radius-8.92/43.3)<1e-10);
assert.equal(PANTHEON.cofferRings*PANTHEON.coffersPerRing,140);
// Exercise both builders without a DOM or renderer, reject invalid transforms.
const local=(x,z,a,u,v)=>[x+u*Math.cos(a)+v*Math.sin(a),z-u*Math.sin(a)+v*Math.cos(a)];
const counts={shafts:0,inscriptions:0};
const H={
 local,
 add(geo,x,y,z,angle){assert([x,y,z,angle].every(Number.isFinite));if(geo.type==='CylinderGeometry'&&geo.parameters.height===6.35)counts.shafts++;geo.dispose();},
 lbox(...args){assert(args.slice(1).every(Number.isFinite));},column(...args){assert(args.slice(1).every(Number.isFinite));},
 roof(){},ring(...args){assert(args.every(v=>typeof v==='boolean'||Number.isFinite(v)));},line(points){assert(points.flat().every(Number.isFinite));},ellipseBand(){},
 inscription(...args){assert(typeof args[6]==='string');counts.inscriptions++;}
};
drawPantheon(LANDMARKS.find(m=>m.id==='pantheon'),.18,H);
drawTrevi(LANDMARKS.find(m=>m.id==='trevi'),.18,H);
assert.equal(counts.shafts,16);assert.equal(counts.inscriptions,2);
assert.equal(LANDMARKS.find(m=>m.id==='trevi').era,'18th-century addition');
const html=await readFile(new URL('../rome-city.html',import.meta.url),'utf8');
const scene=await readFile(new URL('../rome-city-scene.js',import.meta.url),'utf8');
assert(!html.includes('data-landmark="country"'));assert(!scene.includes("id==='country'"));
assert(scene.includes('createCountrysidePlan()'),'Keep countryside geometry after removing its tab');
assert(html.includes('许愿池 · 18世纪'));assert(scene.includes('for(const texture of monumentTextures)texture.dispose()'));
g.dispose();material.dispose();
console.log('PASS: true open Pantheon oculus, dome proportions, 16 columns, 140 coffer frames, finite monument geometry, Trevi era label, rural tab removed but scenery retained.');

const doorway=pantheonDrumDoorGeometry(),doorMesh=new THREE.Mesh(doorway,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));doorMesh.updateMatrixWorld(true);
const entranceRay=new THREE.Raycaster(new THREE.Vector3(0,2,-15),new THREE.Vector3(0,0,1),0,5);
assert.equal(entranceRay.intersectObject(doorMesh).length,0,'Portico doorway must pass through lower drum');
entranceRay.ray.origin.x=4;assert(entranceRay.intersectObject(doorMesh).length>0,'Adjacent drum must remain solid');
doorway.dispose();doorMesh.material.dispose();
console.log('PASS: Pantheon lower drum includes a real entrance opening.');
