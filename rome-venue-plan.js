// Building form, not just the label, must distinguish athletics from chariot racing.
// References and reconstruction limits: notes/rome-reconstruction.md
export const VENUE_FEATURES = {
 circus: { use:'chariot-racing', roundedEnds:1, spina:true, obelisk:true, startingGates:12, turningPosts:6 },
 stadium: { use:'athletics', roundedEnds:1, spina:false, obelisk:false, startingGates:0, turningPosts:0 }
};
export function venuePlan(m) {
 const stadium=m.type==='stadium';
 if(!VENUE_FEATURES[m.type])throw new Error(`Unsupported venue: ${m.type}`);
 return {...VENUE_FEATURES[m.type],length:stadium?m.d:m.w,width:stadium?m.w:m.d,
  angle:m.angle+(stadium?Math.PI/2:0),straightEndSkew:stadium?.075:.045};
}
