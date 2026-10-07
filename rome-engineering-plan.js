export const BRIDGE_DECK=3.7;
export const BRIDGE_APPROACH=8;
export const AQUEDUCT_SLOPE=.006;
export function bridgeDeckAt(x,z,bridge){
 const dx=x-bridge.x,dz=z-bridge.z,c=Math.cos(bridge.angle),s=Math.sin(bridge.angle);
 const u=dx*c-dz*s,v=dx*s+dz*c,edge=Math.abs(u)-bridge.w/2;
 if(Math.abs(v)>bridge.d/2||edge>BRIDGE_APPROACH)return null;
 return edge<=0?BRIDGE_DECK:.12+(BRIDGE_DECK-.12)*(1-edge/BRIDGE_APPROACH);
}
export function streetHeight(x,z,bridges,ground){
 let y=ground+.12;for(const bridge of bridges){const h=bridgeDeckAt(x,z,bridge);if(h!==null)y=Math.max(y,h);}return y;
}
export function channelHeight(distance){return 8.2+distance*AQUEDUCT_SLOPE;}
