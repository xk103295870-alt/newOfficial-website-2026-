import assert from 'node:assert/strict';
import {DEFAULT_YAW, DEFAULT_PITCH, viewAngles, wrapAngle, advanceAngles, orbitDirection, rotationDegrees} from '../rome-camera-controls.js';

const near=(a,b)=>assert(Math.abs(a-b)<1e-9, `${a} ≠ ${b}`);
const initial=viewAngles('all');
assert.deepEqual(initial,{yaw:DEFAULT_YAW,pitch:DEFAULT_PITCH});
assert.deepEqual(viewAngles('circus'),initial);
const direction=orbitDirection(initial), length=Math.hypot(1,.98,1);
direction.forEach((v,i)=>near(v,[1,.98,1][i]/length));
for(let yaw=-8;yaw<8;yaw+=.2) {
 near(Math.hypot(...orbitDirection({yaw,pitch:DEFAULT_PITCH})),1);
 assert(rotationDegrees(yaw)>=0 && rotationDegrees(yaw)<360);
 assert(Number.isInteger(rotationDegrees(yaw)));
}
const front=orbitDirection(viewAngles('pantheon'));
assert(front[0]<0 && front[2]<0,'Pantheon preset must face its entrance');
near(wrapAngle(Math.PI*2+.1),.1);
const current={yaw:179*Math.PI/180,pitch:.4},target={yaw:-179*Math.PI/180,pitch:.6};
const next=advanceAngles(current,target,.016);
assert(wrapAngle(next.yaw-current.yaw)>0,'Cross ±180° on the shortest arc');
assert(next.pitch>.4 && next.pitch<.6);
near(advanceAngles(current,target,0).yaw,current.yaw);
near(advanceAngles(current,target,-1).pitch,current.pitch);
assert.deepEqual(advanceAngles(current,target,.016,true),target);
let state=current;
for(let i=0;i<240;i++)state=advanceAngles(state,target,1/60);
near(wrapAngle(state.yaw-target.yaw),0);
near(state.pitch,target.pitch);
assert.equal(rotationDegrees(DEFAULT_YAW),0);
assert.equal(rotationDegrees(DEFAULT_YAW+Math.PI/6),30);
assert.equal(rotationDegrees(DEFAULT_YAW-Math.PI/6),330);
assert.equal(rotationDegrees(DEFAULT_YAW+2*Math.PI),0);
console.log('Rome camera: presets, unit vectors, shortest-arc easing, reduced motion and bearing passed.');
