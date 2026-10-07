import * as THREE from './assets/vendor/three.module.min.js';

export function gradedBoxGeometry(w,h,d,grade=0){
 const g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position;
 for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+grade*p.getX(i));
 return g;
}

// A true open-bottom semicircular arch, rather than a dark arch painted on a wall.
export function archWallGeometry(span,depth,spring,opening,top,grade=0){
 const r=opening/2;
 if(opening<=0||opening>=span||spring<0||top-Math.abs(grade)*span/2<=spring+r)
  throw new RangeError('Arch crown must fit below the wall top, with solid side piers');
 const shape=new THREE.Shape();
 shape.moveTo(-span/2,0);shape.lineTo(-span/2,top-grade*span/2);
 shape.lineTo(span/2,top+grade*span/2);shape.lineTo(span/2,0);
 shape.lineTo(r,0);shape.lineTo(r,spring);shape.absarc(0,spring,r,0,Math.PI,false);
 shape.lineTo(-r,0);shape.closePath();
 const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});
 g.translate(0,0,-depth/2);return g;
}
