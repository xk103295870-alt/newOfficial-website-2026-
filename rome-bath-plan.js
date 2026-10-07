// Shared physical elevations: the water must never be coplanar with the podium.
export function bathLevels(base){
 return {podiumTop:base+.2,floor:base+.22,water:base+.30,copingTop:base+.72};
}

// Four rim strips meet edge-to-edge; their top faces must not overlap at corners.
export function bathCoping(w,d){
 const width=w*.30,depth=d*.16,t=.7;
 return [-1,1].flatMap(side=>[
  {u:side*(width+t)/2,v:0,w:t,d:depth},
  {u:0,v:side*(depth+t)/2,w:width+2*t,d:t}
 ]);
}
