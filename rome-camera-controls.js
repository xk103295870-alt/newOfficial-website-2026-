export const DEFAULT_YAW=Math.PI/4;
export const DEFAULT_PITCH=Math.atan(.98/Math.SQRT2);
export const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function viewAngles(id){
 return ['pantheon','marcellus','capitoline','claudius'].includes(id)?{yaw:Math.atan2(-.8,-1),pitch:Math.atan(.92/Math.hypot(.8,1))}:{yaw:DEFAULT_YAW,pitch:DEFAULT_PITCH};
}
export function advanceAngles(current,target,dt,reducedMotion=false){
 const ease=reducedMotion?1:1-Math.exp(-Math.max(0,dt)*9);
 return {yaw:wrapAngle(current.yaw+wrapAngle(target.yaw-current.yaw)*ease),pitch:current.pitch+(target.pitch-current.pitch)*ease};
}
export function orbitDirection({yaw,pitch}){return [Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)];}
export function rotationDegrees(yaw){return Math.round(((yaw-DEFAULT_YAW)*180/Math.PI%360+360)%360)%360;}
