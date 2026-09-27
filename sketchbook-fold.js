/* Page-fold geometry. Right-page coordinates; the renderer mirrors for backward turns. */
const EPS = 1e-7;
export function clipHalfPlane(polygon, midpoint, normal, side) {
  if (!polygon.length) return [];
  const result = [];
  const distance = p => side * ((p.x - midpoint.x) * normal.x + (p.y - midpoint.y) * normal.y);
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    const da = distance(a), db = distance(b);
    if (da >= -EPS) result.push(a);
    if ((da > EPS && db < -EPS) || (da < -EPS && db > EPS)) {
      const t = da / (da - db);
      result.push({x:a.x + (b.x - a.x) * t, y:a.y + (b.y - a.y) * t});
    }
  }
  return result;
}
export function constrainCorner(point, width, height, corner) {
  const half = width / 2;
  let p = {x:Math.max(0, Math.min(width - .01, point.x)), y:point.y};
  const cy = corner === 'top' ? 0 : height;
  // The grabbed corner cannot stretch beyond either endpoint of the spine.
  for (const [y,radius] of [[cy,half],[height-cy,Math.hypot(half,height)]]) {
    const dx=p.x-half, dy=p.y-y, distance=Math.hypot(dx,dy);
    if (distance > radius) p={x:half+dx*radius/distance,y:y+dy*radius/distance};
  }
  return p;
}
export function foldGeometry(point, width, height, corner='bottom') {
  const p=constrainCorner(point,width,height,corner);
  const c={x:width,y:corner==='top'?0:height};
  const length=Math.hypot(c.x-p.x,c.y-p.y);
  if(length<.05) return null;
  const n={x:(c.x-p.x)/length,y:(c.y-p.y)/length};
  const m={x:(c.x+p.x)/2,y:(c.y+p.y)/2};
  const reflect=q=>{
    const d=(q.x-m.x)*n.x+(q.y-m.y)*n.y;
    return {x:q.x-2*n.x*d,y:q.y-2*n.y*d};
  };
  const rect=[{x:width/2,y:0},{x:width,y:0},{x:width,y:height},{x:width/2,y:height}];
  const front=clipHalfPlane(rect,m,n,-1), flap=clipHalfPlane(rect,m,n,1);
  const back=flap.map(reflect);
  const line=[];
  for(const v of [...front,...flap]) {
    if(Math.abs((v.x-m.x)*n.x+(v.y-m.y)*n.y)<.01 && !line.some(q=>Math.hypot(q.x-v.x,q.y-v.y)<.01)) line.push(v);
  }
  const dot=m.x*n.x+m.y*n.y;
  return {point:p,normal:n,midpoint:m,front,flap,back,line,
    matrix:[1-2*n.x*n.x,-2*n.x*n.y,-2*n.x*n.y,1-2*n.y*n.y,2*n.x*dot,2*n.y*dot],reflect};
}
