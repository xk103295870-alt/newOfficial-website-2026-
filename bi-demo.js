'use strict';
// All series below are synthetic, deterministic examples, not customer records.
(() => {
  const states = {shopping: 0, stores: 0};
  const en = () => document.documentElement.lang === 'en';
  const tr = (zh, english) => en() ? english : zh;
  const num = n => n.toLocaleString(en() ? 'en-US' : 'zh-CN');
  const datasets = {
    shopping: [
      {visits: [3200,3800,3500,4400,4100,4800,5200], fresh: 4200, channel: [42,26,18,14], ages:[12,28,34,18,8]},
      {visits: [2900,3100,3600,3300,3900,4200,4500], fresh: 3600, channel: [38,30,20,12], ages:[14,30,31,17,8]}
    ],
    stores: [
      {sales:[76000,69000,62000,55000,48000], margins:[58,56,60,54,57], costs:[44,28,18,10], trend:[38000,42000,46000,41000,48000,47000,48000]},
      {sales:[68000,65000,57000,51000,44000], margins:[56,55,58,53,55], costs:[42,30,17,11], trend:[35000,37000,39000,40000,43000,44000,47000]}
    ]
  };
  const panel = (title, body) => '<section class="bi-panel"><h4>'+title+'</h4>'+body+'</section>';
  const bars = (labels, values, suffix='%') => '<div class="bi-bars">'+values.map((v,i)=>'<div class="bi-bar-row"><span>'+labels[i]+'</span><div><i style="width:'+(v/Math.max(...values)*100)+'%"></i></div><strong>'+num(v)+suffix+'</strong></div>').join('')+'</div>';
  const metric = (label,value,unit='') => '<div class="bi-metric"><span>'+label+'</span><strong>'+value+'<small>'+unit+'</small></strong></div>';
  function trend(values) {
    const max=Math.max(...values)*1.12;
    const points=values.map((v,i)=>(20+i*70)+','+(155-v/max*125)).join(' ');
    return '<svg class="bi-trend" viewBox="0 0 460 185" role="img" aria-label="'+tr('七个时段的模拟趋势，详细数值见下表','Simulated trend over seven periods; values in the table below')+'"><path d="M20 30H440M20 90H440M20 155H440" fill="none" stroke="#ffffff18"/><polyline points="'+points+'" fill="none" stroke="var(--demo-accent)" stroke-width="3"/>'+values.map((v,i)=>'<circle cx="'+(20+i*70)+'" cy="'+(155-v/max*125)+'" r="4" fill="var(--demo-accent)"/><text x="'+(20+i*70)+'" y="179" text-anchor="middle" fill="#a7b4c7" font-size="10">0'+(i+1)+'</text>').join('')+'</svg><details class="bi-values"><summary>'+tr('查看趋势数值','View trend values')+'</summary><table><thead><tr><th>'+tr('时段','Period')+'</th><th>'+tr('模拟值','Demo value')+'</th></tr></thead><tbody>'+values.map((v,i)=>'<tr><td>0'+(i+1)+'</td><td>'+num(v)+'</td></tr>').join('')+'</tbody></table></details>';
  }
  function render(host) {
    const kind=host.dataset.demo, index=states[kind], d=datasets[kind][index], shopping=kind==='shopping';
    host.classList.toggle('bi-demo-stores',!shopping);
    const title=shopping?tr('重庆悦地购物中心 · 访问分析','Chongqing Yuedi Shopping Center · Audience analytics'):tr('朱三伯火锅 · 门店经营分析','Zhu San Bo Hot Pot · Store analytics');
    let body='';
    if(shopping) {
      const total=d.visits.reduce((a,b)=>a+b,0);
      body='<div class="bi-metrics">'+metric(tr('访问量','Visits'),num(total))+metric(tr('新增用户','New users'),num(d.fresh))+metric(tr('访问渠道','Channels'),'4')+metric(tr('分析时段','Reporting periods'),'7')+'</div><div class="bi-panel-grid">'+panel(tr('访问渠道占比','Acquisition channel share'),bars([tr('线下扫码','QR scan'),tr('小程序入口','Mini program'),tr('社交分享','Social sharing'),tr('搜索入口','Search')],d.channel))+panel(tr('用户年龄分布','Audience age distribution'),bars(['18–24','25–34','35–44','45–54','55+'],d.ages))+panel(tr('访问量趋势 · 演示周期','Visits · Demo period'),trend(d.visits))+'</div>';
    } else {
      const total=d.sales.reduce((a,b)=>a+b,0), gross=d.sales.reduce((a,v,i)=>a+v*d.margins[i]/100,0);
      body='<div class="bi-metrics">'+metric(tr('营业额','Revenue'),num(total),'¥')+metric(tr('加权毛利率','Weighted gross margin'),(gross/total*100).toFixed(1),'%')+metric(tr('演示门店','Demo stores'),'5')+metric(tr('平均店营收','Average store revenue'),num(total/5),'¥')+'</div><div class="bi-panel-grid">'+panel(tr('门店营业额 · 元','Store revenue · CNY'),bars([tr('回龙湾','Huilongwan'),tr('微电园','Weidianyuan'),tr('万象城','MixC'),tr('南坪万达','Nanping Wanda'),tr('合川','Hechuan')],d.sales,''))+panel(tr('进货品类占比','Purchasing mix'),bars([tr('荤菜','Meat'),tr('素菜','Vegetables'),tr('锅底','Soup base'),tr('其他','Other')],d.costs))+panel(tr('营业额趋势 · 演示周期','Revenue · Demo period'),trend(d.trend))+'</div>';
    }
    host.innerHTML='<div class="bi-demo-top"><h3>'+title+'</h3><span class="bi-demo-badge">'+tr('模拟数据 / DEMO','SIMULATED / DEMO')+'</span></div><div class="bi-demo-toolbar"><p>'+tr('可切换周期，体验不同数据视图。','Switch periods to explore the dashboard.')+'</p><div role="group" aria-label="'+tr('演示周期','Demo period')+'">'+[0,1].map(i=>'<button type="button" data-period="'+i+'" aria-pressed="'+(i===index)+'">'+(i===0?tr('本期演示','Current demo'):tr('上期演示','Previous demo'))+'</button>').join('')+'</div></div><p class="bi-demo-status" role="status">'+tr('当前显示：','Showing: ')+(index===0?tr('本期模拟数据','current simulated period'):tr('上期模拟数据','previous simulated period'))+'</p>'+body+'<p class="bi-demo-foot">'+tr('所有数值均为模拟数据，不代表客户实际经营情况；无实时数据连接。','All values are synthetic and do not represent actual client operations. No live data connection.')+'</p>';
  }
  const hosts=[...document.querySelectorAll('[data-demo]')];
  hosts.forEach(host=>{
    render(host);
    host.addEventListener('click',event=>{
      const button=event.target.closest('[data-period]');
      if(!button)return;
      states[host.dataset.demo]=Number(button.dataset.period);
      render(host);
      host.querySelector('[data-period="'+states[host.dataset.demo]+'"]').focus({preventScroll:true});
    });
  });
  new MutationObserver(()=>hosts.forEach(render)).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
