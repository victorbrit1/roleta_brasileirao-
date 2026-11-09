"use strict";
const G=window.Game;
const $=s=>document.querySelector(s);
const safe=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const svg=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const storage="roleta-brasileirao-v1";
const checkpoint=storage+"-checkpoint";
function read(key){try{const value=JSON.parse(localStorage.getItem(key));return value?.version===1?value:null;}catch{return null;}}
function loadCampaign(saved){
 const campaign={...G.fresh(),...saved};
 delete campaign.streak;
 delete campaign.best;
 delete campaign.achievements;
 if(campaign.run&&!campaign.run.done&&(
  (campaign.run.mode==="liga"&&!campaign.run.league)||
  (campaign.run.mode==="copa"&&campaign.run.seq.length!==1)
 )){
  campaign.run=null;
  campaign.last=null;
  campaign.eventRolled=false;
  campaign.entered=false;
  G.write(campaign,"Formato da competição atualizado","Escolha uma competição para começar no formato novo. Seu elenco e seus troféus estão disponíveis.");
 }
 return campaign;
}
let state=loadCampaign(read(storage)), locked=false, toastTimer, phase="event";
const pages=[
 ["roleta","wheel","Roleta"],["elenco","shirt","Meu elenco"],["competicoes","cup","Competições"],["classificacao","cup","Classificação"],["regioes","map","Mapa regional"],
 ["mercado","shop","Mercado"],["itens","box","Itens"],["historico","history","Histórico"]
];
const slices=[
 ["ELENCO","shirt","#126b53"],["TÉCNICO","user","#174b3e"],["ESTÁDIO","pin","#156249"],["AGENTE","user","#183b32"],
 ["EMBLEMA","shield","#126b53"],["ÍTEM","box","#174b3e"],["ÍDOLO","star","#156249"],["MULTIEVENTO","zap","#183b32"]
];
const cash=n=>"R$ "+n+" mi";
const pct=n=>Math.round(n*100)+"%";
const nameOf=id=>G.getClub(id)?.name??"Meu clube";
function crest(team){
 if(!team)return '<span class="crest">'+svg("shield")+'</span>';
 return '<span class="crest" style="--club:'+team.color+'">'+(team.crest?'<img alt="" src="'+team.crest+'" onerror="this.hidden=true">':'')+'<b>'+team.id+'</b></span>';
}
const action=(id,label,css="",attrs="")=>'<button type="button" class="'+css+'" data-act="'+id+'" '+attrs+'>'+label+'</button>';
const tile=(icon,title,detail,controls="",cls="")=>'<article class="card tile '+cls+'"><span class="tile-icon">'+svg(icon)+'</span><div class="tile-content"><h3>'+title+'</h3><p>'+detail+'</p>'+controls+'</div></article>';
const empty=msg=>'<div class="empty">'+msg+'</div>';
const tag=(label,kind="")=>'<span class="tag '+kind+'">'+label+'</span>';
const regionNames=G.regionalOrder;
function save(show=false){
 try{localStorage.setItem(storage,JSON.stringify(state));if(show)toast("Campanha salva neste navegador.");}
 catch{if(show)toast("O navegador bloqueou o armazenamento.");}
}
function toast(msg){
 $("#toast").textContent=msg;$("#toast").classList.add("show");
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("#toast").classList.remove("show"),3200);
}
function dialog(title,body,kicker="CENTRAL DO JOGO"){
 $("#modal-body").innerHTML='<div class="modal-head"><div><span class="overline">'+kicker+'</span><h2>'+title+'</h2></div>'+action("close","×","close",'aria-label="Fechar"')+'</div>'+body;
 if(!$("#modal").open)$("#modal").showModal();
}
function close(){if($("#modal").open)$("#modal").close();}
function page(){const hash=location.hash.slice(1);return pages.some(p=>p[0]===hash)?hash:"roleta";}
function go(where){if(page()===where)render();else location.hash=where;}
function progress(){
 const titles=["liga","copa"].filter(id=>state.record[id]?.title).length;
 return '<div class="side-goal"><span class="goal-icon">'+svg("cup")+'</span><span class="overline">RUMO À LIBERTADORES</span><strong>'+titles+' / 2 títulos nacionais</strong><div class="meter"><i style="width:'+titles*50+'%"></i></div><a href="#competicoes">Ver competições '+svg("arrow")+'</a></div>';
}
function render(){
 const current=page(), run=state.run;
 document.body.classList.toggle("journey",current==="roleta");
 $("#top-actions").innerHTML='<span class="money">'+svg("coin")+' <b>'+cash(state.bank)+'</b></span>'+action("save",svg("save")+' <span>Salvar</span>',"btn mini");
 $("#nav").innerHTML=pages.map(([id,icon,label])=>'<a href="#'+id+'" class="'+(current===id?"active":"")+'" '+(current===id?'aria-current="page"':"")+'>'+svg(icon)+' <span>'+label+'</span>'+(id==="mercado"&&state.events.length?'<b class="nav-count">'+state.events.length+'</b>':"")+'</a>').join("");
 $("#side-goal").innerHTML=progress();
 const screens={roleta:home,elenco:squad,competicoes:competitions,classificacao:classification,regioes:regions,mercado:market,itens:items,historico:history};
 $("#main").innerHTML=screens[current](run);
 if(current==="roleta")drawWheel();
 save();
}

function wheelSectors(){
 const starters=G.starters(state);
 const open=G.slotRoles(state.formation).filter((_,i)=>!starters[i]);
 let entries=slices.map(([label,icon,color])=>({label,icon,color}));
 if(phase==="match"){
  const {win,draw,loss}=G.probabilities(state,G.opponent(state));
  entries=[{label:"VITÓRIA",icon:"cup",color:"#218453",weight:win}];
  if(draw)entries.push({label:draw>.07?"EMPATE":"",icon:"ball",color:"#896831",weight:draw});
  entries.push({label:loss>.07?"DERROTA":"",icon:"shield",color:"#853a3d",weight:loss});
 }else if(open.length){
  const positions=state.draftMode==="position"?[...new Set(open)]:Object.keys(G.role);
  entries=positions.map((p,i)=>({label:G.role[p].toUpperCase(),icon:p==="G"?"shield":"shirt",color:["#15845f","#3869b1","#967831","#8c4d69"][i],pos:p,weight:state.draftMode==="position"?open.filter(x=>x===p).length/open.length:1/positions.length}));
 }
 if(entries.length===1)entries=[{...entries[0],weight:.5},{...entries[0],weight:.5}];
 let start=-90-(entries[0].weight??1/entries.length)*180;
 return entries.map(e=>{const from=start;start+=(e.weight??1/entries.length)*360;return {...e,from,to:start,center:(from+start)/2};});
}
function weightedSector(sectors,roll){
 let cumulative=0;
 return sectors.find(s=>{cumulative+=s.weight;return roll<cumulative;})??sectors.at(-1);
}
function animateWheel(sector,finish){
 locked=true;
 const button=$(".spin-btn");
 button.disabled=true;
 $("#wheel-art").style.transform="rotate("+(360*4-sector.center-90)+"deg)";
 setTimeout(()=>{locked=false;finish();},matchMedia("(prefers-reduced-motion: reduce)").matches?50:1750);
}

function drawWheel(){
 const holder=$("#wheel-art");
 if(!holder)return;
 const sectors=wheelSectors(), rad=a=>a*Math.PI/180;
 const point=(r,a)=>[180+Math.cos(rad(a))*r,180+Math.sin(rad(a))*r];
 const dots=Array.from({length:40},(_,i)=>{const [x,y]=point(172,i*9);return '<circle cx="'+x+'" cy="'+y+'" r="'+(i%5===0?2.1:1.2)+'" fill="'+(i%5===0?"#ffe89a":"#a28b4e")+'"/>';}).join("");
 const paths=sectors.map(({label,icon,color,center,from,to})=>{
  const [x1,y1]=point(164,from),[x2,y2]=point(164,to);
  const angle=(center+90+360)%360, rotate=angle>95&&angle<265?angle-180:angle;
  const [tx,ty]=point(124,center),[ix,iy]=point(98,center);
  return '<path d="M180 180L'+x1+' '+y1+'A164 164 0 '+(to-from>180?1:0)+' 1 '+x2+' '+y2+'Z" fill="'+color+'" stroke="#81bf9c" stroke-opacity=".38"/><g transform="rotate('+rotate+' '+tx+' '+ty+')"><text x="'+tx+'" y="'+ty+'" text-anchor="middle" dominant-baseline="middle">'+label+'</text></g><use href="#i-'+icon+'" x="'+(ix-9)+'" y="'+(iy-9)+'" width="18" height="18" stroke="#d2eadc" fill="none" stroke-width="1.6" transform="rotate('+rotate+' '+ix+' '+iy+')"/>';
 }).join("");
 holder.innerHTML='<svg class="wheel-svg" viewBox="0 0 360 360" aria-hidden="true"><defs><radialGradient id="wheelLight"><stop offset="0" stop-color="#011810" stop-opacity=".7"/><stop offset="1" stop-color="#54ffae" stop-opacity=".12"/></radialGradient><linearGradient id="rim" x2="1" y2="1"><stop stop-color="#ffe5a2"/><stop offset=".5" stop-color="#9f7833"/><stop offset="1" stop-color="#eecb6e"/></linearGradient></defs><circle cx="180" cy="180" r="178" fill="#151e17" stroke="url(#rim)" stroke-width="2"/>'+paths+'<circle cx="180" cy="180" r="164" fill="url(#wheelLight)" stroke="url(#rim)" stroke-width="1.5"/>'+dots+'</svg>';
}

function routeCards(){
 return regionNames.map((name,i)=>{
  const won=state.regionalTitles.includes(name), enabled=i===0||state.regionalTitles.includes(regionNames[i-1]);
  const count=G.clubs.filter(c=>c.region===name).length;
  return action("route",'<span class="route-icon">'+svg(enabled?"map":"lock")+'</span><span><b>'+name+'</b><small>'+(won?"Insígnia conquistada":enabled?count+" "+(count===1?"desafio":"desafios"):"Vença a região "+regionNames[i-1])+'</small></span>',"route-card "+(won?"won":""),'data-id="'+name+'" '+(enabled?"":"disabled"));
 }).join("");
}
function intro(){
 return '<section class="journey-intro"><span class="overline">O FUTEBOL BRASILEIRO EM UMA ROLETA</span><h1>Escolha sua competição</h1><p>Monte seus 11 titulares e conquiste os dois títulos nacionais para liberar a Libertadores.</p>'+
 '<div class="intro-modes">'+action("begin",svg("cup")+' <b>Brasileirão</b><small>20 clubes · 38 rodadas · pontos corridos</small>',"intro-mode",'data-id="liga"')+
 action("begin",svg("shield")+' <b>Copa do Brasil</b><small>Uma partida · vitória ou derrota</small>',"intro-mode",'data-id="copa"')+'</div>'+
 (G.unlocked(state)?action("begin",svg("cup")+' Disputar a Libertadores',"btn primary",'data-id="lib"'):"")+'</section>';
}
function dugout(){
 const roles=G.slotRoles(state.formation);
 const slots=G.starters(state).map((p,i)=>'<span class="dugout-player '+(p?"filled":"")+'" title="'+safe(p?p.name+" · "+p.ovr+" OVR":G.role[roles[i]])+'">'+(p?'<b>'+p.ovr+'</b><small>'+safe(p.name)+'</small>':svg("shirt"))+'</span>').join("");
 const pins=regionNames.map(name=>'<span class="medal '+(state.regionalTitles.includes(name)?"earned":"")+'" title="'+name+'">'+({Norte:"N",Nordeste:"NE",Sul:"S",Sudeste:"SE"}[name])+'</span>').join("");
 const cups=["liga","copa","lib"].map(id=>'<span class="medal '+(state.record[id]?.title?"earned":"")+'" title="'+G.modes[id].name+'">'+svg("cup")+'</span>').join("");
 const bag=Object.entries(G.items).filter(([id])=>state.items[id]>0).map(([id,it])=>action("use-item",svg(it.icon)+" "+it.name+" ×"+state.items[id],"bag-item",'data-id="'+id+'" title="'+safe(it.desc)+'"')).join("");
 return '<aside class="dugout" aria-label="Equipe, insígnias e mochila"><section class="card content"><div class="between"><h2>Equipe</h2>'+tag(G.rating(state)+" OVR","green")+'</div><div class="dugout-team">'+slots+'</div><a href="#elenco" class="btn mini">'+svg("shirt")+' Gerenciar elenco</a></section>'+
 '<section class="card content"><h2>Insígnias</h2><div class="medals">'+pins+cups+'</div><a href="#regioes">Ver rota regional '+svg("arrow")+'</a></section>'+
 '<section class="card content"><div class="between"><h2>Mochila</h2>'+tag(Object.values(state.items).reduce((a,b)=>a+b,0)+" ITENS")+'</div><div class="bag">'+(bag||'<small class="muted">Mochila vazia.</small>')+'</div><a href="#itens">Abrir inventário '+svg("arrow")+'</a></section></aside>';
}
function home(run){
 if(!state.entered)return '<div class="adventure">'+intro()+dugout()+'</div>';
 const mode=G.modes[state.mode], ready=G.starters(state).filter(Boolean).length;
 const round=(run?.played??0)+1, rival=G.opponent(state);
 const title=run?.done?(run.won?"Campanha conquistada!":"Fim da tentativa"):phase==="match"?"Vai começar a partida!":ready<11?"Quem entra em campo?":state.eventRolled?"Hora da partida":"O que acontece nesta rodada?";
 const context=state.mode==="regional"?state.region:mode.name;
 const nextRegion=run?.won&&state.mode==="regional"?regionNames[regionNames.indexOf(state.region)+1]:null;
 const caption=run?.done?run.w+' vitórias · '+run.d+' empates · '+run.l+' derrotas':phase==="match"?"A roleta decide o resultado. Sua equipe e seus itens mudam as chances.":ready<11?"Gire e escolha um reforço para completar sua escalação.":'Próximo desafio: '+rival?.name+' · '+state.stadium;
 return '<div class="adventure"><section class="journey-stage"><div class="stage-title"><span class="overline">'+safe(context)+' · '+(run?.done?"FIM DA CAMPANHA":"DESAFIO "+round+"/"+G.rounds(state))+'</span><h1>'+title+'</h1><p>'+safe(caption)+'</p></div>'+
 (run?.done?'<div class="end-stage">'+svg(run.won?"cup":"history")+'<div class="actions">'+(nextRegion?action("route","Avançar para "+nextRegion,"btn primary",'data-id="'+nextRegion+'"'):action("retry","Nova tentativa","btn primary"))+'<a href="#competicoes" class="btn">Competições</a><a href="#regioes" class="btn">Mapa regional</a></div></div>':
 '<div class="wheel-area"><div class="wheel-wrap"><div class="pointer"></div><div id="wheel-art"></div><div class="wheel-hub">'+svg("ball")+'</div></div></div><div class="wheel-footer">'+
 (phase==="match"?action("resolve-match",svg("ball")+" GIRAR PARTIDA","btn primary spin-btn",locked?"disabled":""):action("spin",svg("wheel")+(state.draft?" RETOMAR ESCOLHA":ready<11?" GIRAR REFORÇO":state.eventRolled?" EVENTO CONCLUÍDO":" GIRAR EVENTO"),"btn primary spin-btn",locked||(ready===11&&state.eventRolled&&!state.draft)?"disabled":""))+
 (phase==="match"?'<p>'+chanceText(rival)+'</p>':"")+'</div>')+
 (phase==="match"||run?.done?"":match(run))+
 (state.mode==="liga"?'<div class="standings-link"><a class="btn" href="#classificacao">Ver classificação '+svg("arrow")+'</a></div>':"")+'</section>'+dugout()+'</div>';
}

function chanceText(rival){
 const {win,draw,loss}=G.probabilities(state,rival);
 return pct(win)+' vitória'+(draw?' · '+pct(draw)+' empate':"")+' · '+pct(loss)+' derrota';
}
function match(run){
 const rival=G.opponent(state), own=G.getClub(state.emblem), mode=G.modes[state.mode], round=(run?.played??0)+1;
 const derby=G.isDerby(state,rival);
 const ready=G.starters(state).filter(Boolean).length===11;
 return '<section class="card match"><div class="panel-head"><div class="head-icon gold">'+svg("cup")+'</div><div><h2>'+(run?.done?"Campanha encerrada":"Próxima partida")+'</h2><p>'+mode.name+' · '+mode.short+'</p></div>'+tag(run?.done?"FINAL":String(round).padStart(2,"0")+" / "+G.rounds(state),derby?"gold":"")+'</div>'+
 (rival?'<div class="versus"><div>'+crest(own)+'<strong>'+safe(own.name)+'</strong><small>SEU EMBLEMA</small></div><b>VS</b><div>'+crest(rival)+'<strong>'+safe(rival.name)+'</strong><small>'+G.opponentRating(state,rival)+' OVR</small></div></div><div class="stadium">'+svg("pin")+' '+safe(state.stadium)+(derby?" · Clássico":"")+'</div><div class="match-foot">'+action("play",svg("ball")+" Jogar partida","btn play")+'<small>'+(ready?chanceText(rival):'Escale 11 titulares para jogar')+'</small></div>':
 '<div class="empty"><strong>'+(run?.won?"Troféu conquistado":"Tente outra campanha")+'</strong><br>'+run.w+' V · '+run.d+' E · '+run.l+' D</div><div class="match-foot"><a class="btn play" href="#competicoes">Ver competições '+svg("arrow")+'</a></div>')+'</section>';
}
function heading(label,title,desc){
 return '<header class="page-head"><span class="overline">'+label+'</span><h1>'+title+'</h1><p>'+desc+'</p></header>';
}
function playerRow(p,controls=""){
 const fatigue=p.streak>=3?' · fadiga '+p.streak:"";
 const health=p.injury?' · lesão '+p.injury+' j.':p.unhappy?' · insatisfeito':fatigue;
 return '<div class="player"><span class="player-ovr">'+p.ovr+'</span><span><strong>'+safe(p.name)+'</strong><small>'+G.role[p.pos]+' · '+safe(nameOf(p.club))+health+(p.contract===undefined?"":" · contrato "+p.contract+" j.")+'</small></span>'+controls+'</div>';
}
function squad(){
 const lineup=G.slotRoles(state.formation), picked=new Set(state.slots.filter(Boolean)), coach=G.coaches[state.coach];
 const rows=["A","M","D","G"].map(pos=>'<div class="pitch-row">'+lineup.map((p,i)=>p===pos?'<button class="slot '+(state.slots[i]?"filled":"")+'" data-act="slot" data-id="'+i+'">'+svg(pos==="G"?"shield":"shirt")+'<b>'+safe(state.team.find(x=>x.id===state.slots[i])?.name??({A:"ATA",D:"DEF",M:"MEI",G:"GOL"}[pos]))+'</b></button>':"").join("")+'</div>').join("");
 const form=Object.keys(G.formations).map(f=>'<option '+(f===state.formation?"selected":"")+'>'+f+'</option>').join("");
 const current=G.getClub(state.emblem);
 const all=G.clubs.map(c=>'<option value="'+c.id+'" '+(c.id===current.id?"selected":"")+'>'+safe(c.name)+'</option>').join("");
 return heading("VESTIÁRIO","Meu elenco","Escolha sua formação, prepare o banco e poupe quem está cansado.")+
 '<div class="split"><section class="card content"><div class="between"><h2>Escalação titular</h2>'+tag(G.rating(state)+" OVR","gold")+'</div><div class="fields"><label>Formação<select id="formation">'+form+'</select></label><label>Recrutamento<select id="draft-mode"><option value="position" '+(state.draftMode==="position"?"selected":"")+'>Sortear posição</option><option value="player" '+(state.draftMode==="player"?"selected":"")+'>Escolher jogador e função</option></select></label></div><div class="pitch">'+rows+'</div><div class="actions">'+action("auto","Escalar automaticamente","btn")+action("draft","Recrutar jogador","btn primary")+'</div></section>'+
 '<div class="stack">'+tile("shield","Emblema","Altera clássicos e define o mando de campo.",'<label class="field-label">Clube<select id="emblem" '+(state.run&&!state.run.done?'disabled':"")+'>'+all+'</select></label>')+tile("user",safe(coach.name),coach.passive,action("coach","Sortear técnico","btn mini"))+
 tile("pin","Estádio",safe(state.stadium),'<div class="actions">'+action("stadium","Sortear","btn mini")+'<select aria-label="Frequência do estádio" id="stadium-mode"><option value="every" '+(state.stadiumMode==="every"?"selected":"")+'>A cada jogo</option><option value="fixed" '+(state.stadiumMode==="fixed"?"selected":"")+'>Fixo</option></select></div>')+'</div></div>'+
 '<section class="card content"><div class="between"><h2>Plantel e contratos</h2>'+tag(state.team.length+" JOGADORES")+'</div>'+(state.team.length?state.team.map(p=>playerRow(p,(picked.has(p.id)?tag("TITULAR","green"):"")+action("renew","Renovar","btn mini",'data-id="'+p.id+'"'))).join(""):empty("Seu elenco ainda está vazio. Recrute jogadores para começar."))+'</section>'+
 '<section class="card content"><div class="between"><h2>Registros da Série A 2026</h2>'+tag("FONTE CBF")+'</div><p class="muted">Atletas que constavam com o clube atual correspondente na CBF. A roleta usa uma seleção desses nomes, com posições agrupadas e OVR próprios.</p><div class="club-grid">'+G.clubs.map(c=>action("club",crest(c)+'<span>'+safe(c.name)+'<small>'+c.names.length+' atletas</small></span>',"club-card",'data-id="'+c.id+'"')).join("")+'</div></section>';
}
function competitions(){
 const cards=Object.entries(G.modes).filter(([id])=>id!=="regional").map(([id,m])=>{
  const closed=id==="lib"&&!G.unlocked(state);
  const record=state.record[id], active=state.mode===id&&state.run&&!state.run.done;
  const desc=id==="liga"?"20 clubes em 38 rodadas. O líder da classificação final conquista o título.":id==="copa"?"Uma partida decide a taça. A roleta tem chances de vitória e derrota.":"Conquiste o Brasileirão e a Copa do Brasil para liberar a disputa continental.";
  return tile(closed?"lock":"cup",m.name,desc,(record?.title?tag("CAMPEÃO","gold"):"")+(active?tag("EM ANDAMENTO","green"):"")+
   '<div class="actions">'+action("mode",closed?"Bloqueada":active?"Continuar":state.run?.done&&state.mode===id?"Nova campanha":"Selecionar","btn "+(active?"primary":""),'data-id="'+id+'" '+(closed?"disabled":""))+'</div>',closed?"locked":"");
 }).join("");
 const unlocked=G.unlocked(state), triple=!!(unlocked&&state.record.lib?.title);
 return heading("SALA DE TROFÉUS","Competições","Do campeonato nacional à glória continental.")+
 '<div class="split"><div class="stack">'+cards+'</div><section class="card content goals"><h2>Desafios da campanha</h2>'+tag(triple?"TRÍPLICE COROA CONQUISTADA":unlocked?"LIBERTADORES LIBERADA":"RUMO À TRÍPLICE COROA","gold")+
 '<div class="goal-row"><b>Campeão do Brasileirão</b><strong>'+(state.record.liga?.title?"✓":"—")+'</strong></div><div class="goal-row"><b>Campeão da Copa do Brasil</b><strong>'+(state.record.copa?.title?"✓":"—")+'</strong></div><label class="field-label">Restrição de OVR<select id="challenge" '+(state.run&&!state.run.done?"disabled":"")+'><option value="open">Sem restrição</option><option value="sub78" '+(state.challenge==="sub78"?"selected":"")+'>Até 78 OVR</option><option value="elite" '+(state.challenge==="elite"?"selected":"")+'>A partir de 80 OVR</option></select></label></section></div>';
}
function classification(){
 const league=state.run?.league??state.lastLeague;
 const rows=G.standings(state);
 const emblem=league?.emblem??state.emblem;
 const played=rows[0].played;
 const title=played===38?"CLASSIFICAÇÃO FINAL":"RODADA "+played+" / 38";
 const columns=["Pos.","Clube","OVR","PTS","J","V","E","D","GP","GC","SG"];
 return heading("SÉRIE A 2026","Classificação do Brasileirão","Os outros nove jogos são simulados a cada rodada com base no overall dos titulares de cada clube.")+
 '<section class="card content"><div class="between"><h2>Tabela de pontos corridos</h2>'+tag(title,"green")+'</div><p class="muted">Desempate por vitórias, saldo de gols e gols marcados. O primeiro colocado ao fim das 38 rodadas fica com a taça.</p>'+
 '<div class="table-scroll" tabindex="0" role="region" aria-label="Classificação dos 20 clubes"><table class="league-table"><thead><tr>'+columns.map(label=>'<th scope="col">'+label+'</th>').join("")+'</tr></thead><tbody>'+
 rows.map((r,i)=>'<tr class="'+(r.id===emblem?"own-row":"")+'"><td>'+(i+1)+'</td><th scope="row">'+crest(G.getClub(r.id))+safe(nameOf(r.id))+(r.id===emblem?' <small>Seu time</small>':"")+'</th>'+
 [r.ovr??(G.rating(state)||"—"),r.points,r.played,r.w,r.d,r.l,r.gf,r.ga,r.gd].map(value=>'<td>'+value+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></section>'+
 (league?.results.length?'<section class="card content"><h2>Resultados da rodada '+played+'</h2><div class="round-results">'+league.results.map(({home,away,hg,ag})=>'<div><span>'+safe(nameOf(home))+'</span><b>'+hg+' × '+ag+'</b><span>'+safe(nameOf(away))+'</span></div>').join("")+'</div></section>':"");
}
function regions(){
 return heading("EXPEDIÇÃO NACIONAL","Mapa regional","Vença cada clube para completar sua coleção. As quatro regiões têm representantes na Série A de 2026.")+
 '<section class="card content"><h2>Desafios em ordem</h2><div class="route-list">'+routeCards()+'</div></section><div class="region-grid">'+regionNames.map(r=>{
  const clubs=G.clubs.filter(c=>c.region===r), done=state.regions[r]??[];
  return '<section class="card content region"><div class="between"><h2>'+r+'</h2>'+tag(done.length===clubs.length?"CONQUISTADA":done.length+" / "+clubs.length,done.length===clubs.length?"gold":"green")+'</div><div class="meter"><i style="width:'+done.length/clubs.length*100+'%"></i></div><div class="club-grid">'+clubs.map(c=>'<div class="club-card '+(done.includes(c.id)?"conquered":"")+'">'+crest(c)+'<span>'+safe(c.name)+'<small>'+c.uf+' · '+(done.includes(c.id)?"Vencido":"Pendente")+'</small></span></div>').join("")+'</div></section>';
 }).join("")+'</div>';
}
function market(){
 const open=G.windowOpen(state);
 return heading("DIRETORIA","Mercado","Negocie reforços e decida o futuro dos jogadores.")+
 '<section class="card content"><div class="between"><h2>Central de eventos</h2>'+tag(state.events.length+" PENDENTES",state.events.length?"gold":"")+'</div>'+
 (state.events.length?state.events.map((e,i)=>tile(e.type==="legend"?"star":"zap",safe(e.title),safe(e.desc),'<div class="actions">'+action("event",e.type==="exit"?"Resolver":e.type==="agent"||e.type==="legend"?"Negociar":"Confirmar","btn",'data-id="'+i+'"')+(["agent","legend"].includes(e.type)?action("dismiss","Recusar","btn mini",'data-id="'+i+'"'):"")+'</div>')).join(""):empty("Nenhum evento pendente. Jogue partidas ou gire a roleta para encontrar oportunidades."))+'</section>'+
 '<section class="card content"><div class="between"><h2>Janela de transferências</h2>'+tag(open?"ABERTA":"FECHADA",open?"green":"gold")+'</div><p class="muted">Abre nas primeiras três partidas de cada bloco de 12 e entre campanhas.</p>'+
 (open?G.market(state).map(p=>!state.team.some(t=>t.id===p.id)?playerRow(p,action("buy-player",cash(price(p)),"btn mini",'data-id="'+p.id+'"')):"").join(""):empty("Aguarde a próxima janela para contratar."))+'</section>'+
 '<section class="card content"><h2>Vendas voluntárias</h2>'+(open&&state.team.length?state.team.map(p=>playerRow(p,action("sell",cash(Math.max(2,price(p)-5)),"btn mini",'data-id="'+p.id+'"'))).join(""):empty("Venda jogadores quando a janela estiver aberta."))+'</section>';
}
function price(p){return Math.max(4,Math.ceil((p.ovr-58)/2));}
function items(){
 return heading("INVENTÁRIO","Itens","Gaste o caixa da campanha para dar fôlego ao elenco.")+
 '<div class="region-grid">'+Object.entries(G.items).map(([id,it])=>tile(it.icon,it.name+' '+tag("×"+state.items[id]),it.desc,'<div class="actions">'+action("buy-item","Comprar · "+cash(it.cost),"btn mini",'data-id="'+id+'"')+action("use-item","Usar","btn mini primary",'data-id="'+id+'" '+(!state.items[id]?"disabled":""))+'</div>')).join("")+'</div>'+
 '<section class="card content"><h2>Checkpoint da campanha</h2><p class="muted">O jogo salva a campanha automaticamente. Use um item Save para guardar uma versão que pode ser recuperada após um resultado ruim.</p><div class="actions">'+action("restore","Recuperar checkpoint","btn")+'</div></section>';
}
function history(){
 return heading("ARQUIVO","Histórico","Acompanhe placares, lesões, transferências e conquistas.")+
 '<section class="card content"><div class="between"><h2>Registro da campanha</h2>'+tag(state.wins+" VITÓRIAS","green")+'</div>'+
 (state.log.length?state.log.map(e=>'<div class="log '+e.kind+'"><i></i><div><b>'+safe(e.title)+'</b><p>'+safe(e.desc)+'</p></div></div>').join(""):empty("O registro começa quando você recruta ou joga sua primeira partida."))+
 '<div class="actions">'+action("reset","Apagar campanha atual","btn danger")+'</div></section>';
}
function showDraft(){
 const d=state.draft;
 if(!d)return;
 const pos=d.pos?G.role[d.pos]:"Posição livre";
 const list=d.options.map(p=>playerRow(p,action("pick","Escolher","btn mini primary",'data-id="'+p.id+'"'))).join("");
 dialog("Escolha seu jogador",'<p class="muted">'+(d.pos?"Posição sorteada: "+pos+".":"Escolha o jogador e depois a posição dele no seu time.")+'</p>'+list+(list?"":empty("Todos os jogadores desta posição já foram contratados.")), "RESULTADO DA ROLETA");
}
function openDraft(forcedPosition=null){
 if(!state.draft){
  const pos=state.draftMode==="position"?(typeof forcedPosition==="string"&&G.role[forcedPosition]?forcedPosition:G.proposedRole(state)):null;
  const options=G.draft(state,pos);
  if(!options.length){toast("Nenhum atleta novo para esta posição.");return;}
  state.draft={pos,options};save();
 }
 showDraft();
}
function randomCoach(){
 state.coach=G.choose(G.coaches.map((_,i)=>i).filter(i=>i!==state.coach));
 const c=G.coaches[state.coach];
 G.write(state,"Novo técnico",c.name+" · "+c.passive);
 return [c.name,c.passive];
}
function randomStadium(){
 state.stadium=G.choose(G.clubs.filter(c=>c.stadium!==state.stadium)).stadium;
 G.write(state,"Estádio sorteado",state.stadium);
 return [state.stadium,"O próximo jogo será neste estádio."];
}
function spin(){
 if(locked)return;
 if(state.draft){showDraft();return;}
 const sectors=wheelSectors(), needsPlayers=!G.starters(state).every(Boolean);
 if(!needsPlayers&&state.eventRolled)return;
 const choice=needsPlayers?weightedSector(sectors,Math.random()):sectors[G.choose([0,0,0,1,2,3,4,5,6,7])];
 const sector=needsPlayers?0:sectors.indexOf(choice);
 animateWheel(choice,()=>{
  if(!needsPlayers)state.eventRolled=true;
  if(sector===0){if(page()==="roleta")openDraft(choice.pos);render();return;}
  let result;
  if(sector===1)result=randomCoach();
  if(sector===2)result=randomStadium();
  if(sector===3){
   if(state.events.length<4)state.events.push({type:"agent",title:"Empresário bateu à porta",desc:"Pague R$ 3 mi. 20% de chance de raro, 35% de bagre e 45% de titular."});
   result=["Empresário na área","Abra o Mercado para negociar a oferta."];
  }
  if(sector===4){
   const next=G.choose(G.clubs.filter(c=>c.id!==state.emblem));
   if(!state.run||state.run.done){
    state.emblem=next.id;result=["Novo emblema",next.name+" é o novo escudo da sua campanha."];
   }else{
    state.items.bicho++;result=["Torcida do "+next.name,"O escudo sorteado rendeu um Bicho. Seu emblema atual está registrado na competição."];
   }
  }
  if(sector===5){const id=G.choose(Object.keys(G.items));state.items[id]++;result=[G.items[id].name,"O item foi adicionado ao inventário."];}
  if(sector===6){
   if(state.events.length<4)state.events.push({type:"legend",title:"Ídolo disponível",desc:"Pague R$ 10 mi para contratar um ícone disponível."});
   result=["Um ídolo voltou","Confira a oportunidade na Central de eventos."];
  }
  if(sector===7){
   const venue=randomStadium()[0];state.items.kit++;state.bank+=2;
   result=["Multievento","Novo estádio: "+venue+". Você recebeu um kit médico e R$ 2 mi."];
  }
  G.write(state,result[0],result[1],"good");render();
  if(page()==="roleta")dialog(safe(result[0]),'<p class="muted">'+safe(result[1])+'</p><div class="actions">'+action("close","Continuar","btn primary")+'</div>',"RESULTADO DA ROLETA");
 });
}
function playerChoice(id){
 const d=state.draft,p=d?.options.find(x=>x.id===id);
 if(!p)return;
 if(d.pos){finishDraft(p,p.pos);return;}
 dialog("Defina a posição",playerRow(p)+'<p class="muted">A posição original mantém o OVR. Uma posição adaptada custa 5 pontos.</p><div class="actions">'+Object.entries(G.role).map(([pos,label])=>action("pick-role",label,"btn "+(p.pos===pos?"primary":""),'data-id="'+p.id+'" data-pos="'+pos+'"')).join("")+'</div>',"RESULTADO DA ROLETA");
}
function finishDraft(p,pos){
 const slot=G.recruit(state,{...p,pos,ovr:p.ovr-(p.pos===pos?0:5)});
 if(!slot)return;
 state.draft=null;
 G.write(state,"Reforço contratado",p.name+" · "+G.role[pos]+" · "+nameOf(p.club),"good");
 close();render();toast(p.name+" chegou ao elenco.");
}
function selectSlot(i){
 const pos=G.slotRoles(state.formation)[i];
 const candidates=state.team.filter(p=>p.pos===pos&&!p.injury);
 dialog(G.role[pos],'<p class="muted">Escolha o titular para esta vaga. Lesionados ficam de fora.</p>'+
  (candidates.length?candidates.map(p=>playerRow(p,action("assign",state.slots[i]===p.id?"Escalado":"Escalar","btn mini",'data-id="'+p.id+'" data-slot="'+i+'"'))).join(""):empty("Nenhum jogador disponível nesta posição."))+
  '<div class="actions">'+action("bench","Deixar vaga livre","btn",'data-id="'+i+'"')+'</div>',"ESCALAÇÃO");
}
function spend(n){
 if(state.bank<n){toast("Caixa insuficiente. Venda jogadores para levantar dinheiro.");return false;}
 state.bank-=n;return true;
}
function resolve(i){
 const e=state.events[i];
 if(!e)return;
 if(e.type==="exit"){renewDialog(e.id,true);return;}
 let detail=e.desc;
 if(e.type==="agent"){
  if(!spend(3))return;
  const roll=Math.random(), tier=roll<.2?"Raro":roll<.55?"Bagre":"Titular";
  const n=state.log.length+"-"+Date.now(), pos=G.proposedRole(state);
  const p={id:"agent-"+n,name:tier==="Raro"?"Ícaro Valente":tier==="Bagre"?"Zé Canela":"Luan Batista",club:state.emblem,pos,ovr:tier==="Raro"?91:tier==="Bagre"?62:78,generated:true};
  G.recruit(state,p);detail=tier+" · "+p.name+" · "+p.ovr+" OVR";
 }
 if(e.type==="legend"){
  const p=G.choose(G.legends.filter(x=>!state.team.some(y=>y.id===x.id)));
  if(!p){toast("Você já contratou todos os ídolos.");state.events.splice(i,1);render();return;}
  if(!spend(10))return;
  G.recruit(state,p);detail=p.name+" · "+p.ovr+" OVR";
 }
 if(e.type==="board")state.bank+=4;
 if(e.type==="trade"||e.type==="sale"){
  if(e.type==="sale")state.bank+=8;
  G.remove(state,e.id);
  if(e.type==="trade"&&e.incoming)G.recruit(state,e.incoming);
 }else state.events.splice(i,1);
 G.write(state,e.title,detail,"good");
 render();toast(detail);
}
function renewDialog(id,forced=false){
 const p=state.team.find(x=>x.id===id);
 if(!p)return;
 const r=G.renewal(state,p);
 dialog("Contrato de "+safe(p.name),'<p class="muted">Renove por mais 14 jogos. A taxa de '+cash(r.cost)+' é cobrada na tentativa. Um caixa maior aumenta a chance de acordo.</p>'+tag(pct(r.chance)+" DE ACORDO","green")+
 '<div class="actions">'+action("renew-confirm","Tentar acordo","btn primary",'data-id="'+id+'"')+(forced?action("exit-sell","Aceitar saída · R$ 4 mi","btn",'data-id="'+id+'"'):"")+'</div>',"DIRETORIA");
}
function use(id){
 if(!state.items[id])return;
 if(id==="bicho"&&state.bicho){toast("Bicho já ativo para o próximo jogo.");return;}
 if(id==="cruise"&&state.cruise){toast("O Cruzeiro ainda está fazendo efeito.");return;}
 if(id==="kit"&&!state.team.some(p=>p.injury)){toast("Nenhum jogador está lesionado.");return;}
 if(id==="renewal"){toast("O item será consumido na próxima tentativa de renovação.");return;}
 state.items[id]--;
 if(id==="bicho")state.bicho=true;
 if(id==="kit")for(const p of state.team)if(p.injury){p.injury=0;p.streak=0;}
 if(id==="cruise"){state.cruise=3;for(const p of state.team)p.streak=0;}
 if(id==="youth")G.recruit(state,{id:"base-"+Date.now(),name:"Promessa da Base",club:state.emblem,pos:G.proposedRole(state),ovr:84,generated:true});
 if(id==="save"){
  try{localStorage.setItem(checkpoint,JSON.stringify(state));}
  catch{state.items.save++;toast("O navegador bloqueou o checkpoint.");return;}
 }
 G.write(state,G.items[id].name,"Item usado.","good");render();toast(G.items[id].name+" ativado.");
}
function validateMatch(){
 if(state.bank<0){toast("Caixa negativo. Venda um jogador ou resolva eventos antes de jogar.");return;}
 if(state.events.some(e=>["sale","trade","exit"].includes(e.type))){toast("Resolva os eventos obrigatórios na diretoria.");go("mercado");return;}
 if(G.starters(state).some(p=>!p)){toast("Escale 11 jogadores saudáveis antes da partida.");go("elenco");return;}
 return true;
}
function kick(){
 if(!validateMatch()||!G.opponent(state))return;
 if(!state.eventRolled){toast("Gire o evento da rodada para liberar a partida.");return;}
 if(state.draft){showDraft();return;}
 if((state.challenge==="sub78"&&G.rating(state)>78)||(state.challenge==="elite"&&G.rating(state)<80)){toast("A escalação não atende à restrição de OVR.");return;}
 phase="match";render();
}
function resolveMatch(){
 if(locked||!validateMatch())return;
 const roll=Math.random(), sector=weightedSector(wheelSectors(),roll);
 animateWheel(sector,()=>{phase="event";finishMatch(roll);});
}
function finishMatch(roll){
 const result=G.play(state,roll);
 if(!result){toast("A escalação não atende à restrição de OVR desta campanha.");return;}
 const rival=G.getClub(result.rival), title=result.result==="V"?"Vitória!":result.result==="E"?"Empate":"Derrota";
 render();
 dialog(title,'<div class="result"><span>'+safe(nameOf(state.emblem))+'</span><strong>'+result.score.join(" × ")+'</strong><span>'+safe(rival.name)+'</span></div><p class="muted">'+safe(result.stadium)+' · Prêmio '+cash(result.cash)+' · Despesa de jogo R$ 1 mi</p>'+
 (result.injuries.length?'<p class="muted">Lesões: '+safe(result.injuries.join(", "))+'</p>':"")+
 (state.run?.done?'<p>'+ (state.run.won?"Você conquistou o título!":"A campanha terminou.")+'</p>':"")+
 '<div class="actions">'+action("close","Continuar","btn primary")+'</div>',"PLACAR FINAL");
}
function switchMode(id){
 if(id==="lib"&&!G.unlocked(state))return;
 if(id===state.mode&&!state.run?.done){state.entered=true;go("roleta");return;}
 if(state.run&&!state.run.done){
  dialog("Trocar de competição?",'<p class="muted">A campanha atual será encerrada. Seu elenco e seus troféus continuam no save.</p><div class="actions">'+action("mode-confirm","Trocar competição","btn primary",'data-id="'+id+'"')+action("close","Voltar","btn")+'</div>');
  return;
 }
 setMode(id);
}
function setMode(id){
 if(state.run)state.attempt++;
 phase="event";state.entered=true;state.mode=id;state.run=null;state.last=null;state.market=null;state.eventRolled=false;
 state.region=id==="regional"?state.nextRegion:null;
 state.firstOpponent=id==="regional"?G.choose(G.clubs.filter(c=>c.region===state.region)).id:id==="liga"?(state.emblem==="COR"?"FLA":"COR"):id==="lib"?"BOC":G.choose(G.clubs.filter(c=>c.id!==state.emblem)).id;
 if(state.stadiumMode==="every")state.stadium=G.choose(G.clubs).stadium;
 close();go("roleta");
}

function route(name){
 const i=regionNames.indexOf(name);
 if(i<0||i>0&&!state.regionalTitles.includes(regionNames[i-1]))return;
 if(state.mode==="regional"&&state.region===name&&state.run&&!state.run.done){go("roleta");return;}
 state.nextRegion=name;
 if(state.run&&!state.run.done){
  dialog("Entrar no desafio regional?",'<p class="muted">A tentativa atual será encerrada. Seu elenco e suas conquistas continuam no save.</p><div class="actions">'+action("mode-confirm","Entrar em "+name,"btn primary",'data-id="regional"')+action("close","Voltar","btn")+'</div>');
 }else setMode("regional");
}

function sell(id,value){
 const p=state.team.find(x=>x.id===id);
 if(!p)return;
 G.remove(state,id);state.bank+=value;
 G.write(state,"Saída confirmada",p.name+" · "+cash(value));close();render();toast(cash(value)+" adicionados ao caixa.");
}
const actions={
 close,save:()=>save(true),spin,draft:openDraft,pick:playerChoice,
 "pick-role":(id,el)=>{const p=state.draft?.options.find(x=>x.id===id);if(p)finishDraft(p,el.dataset.pos);},
 slot:id=>selectSlot(Number(id)),
 assign:(id,el)=>{
  const i=Number(el.dataset.slot);
  state.slots=state.slots.map(x=>x===id?null:x);
  state.slots[i]=id;close();render();
 },
 bench:id=>{state.slots[Number(id)]=null;close();render();},
 auto:()=>{G.auto(state);render();toast("Escalação atualizada. A seleção prioriza jogadores descansados.");},
 coach:()=>{const r=randomCoach();render();toast(r.join(" · "));},
 stadium:()=>{const r=randomStadium();render();toast(r[0]);},
 play:kick,"resolve-match":resolveMatch,route,begin:setMode,retry:()=>{if(state.mode==="regional")state.nextRegion=state.region;setMode(state.mode);},mode:switchMode,"mode-confirm":setMode,
 club:id=>{
  const c=G.getClub(id);
  dialog(safe(c.name),'<p class="muted">'+c.names.length+' registros com este clube no campo Clube Atual. <a href="'+c.source+'" target="_blank" rel="noopener">Consultar na CBF '+svg("arrow")+'</a></p><ul class="names">'+c.names.map(p=>'<li>'+safe(p)+'</li>').join("")+'</ul>',"SÉRIE A 2026");
 },
 event:id=>resolve(Number(id)),
 dismiss:id=>{state.events.splice(Number(id),1);render();},
 renew:id=>renewDialog(id),
 "renew-confirm":id=>{
  const p=state.team.find(x=>x.id===id);if(!p)return;
  const {cost,chance}=G.renewal(state,p);
  if(!spend(cost))return;
  if(state.items.renewal)state.items.renewal--;
  const success=Math.random()<chance;
  if(success){p.contract=14;p.unhappy=false;p.bench=0;state.events=state.events.filter(e=>e.type!=="exit"||e.id!==id);}
  G.write(state,success?"Contrato renovado":"Proposta recusada",p.name+" · taxa "+cash(cost),success?"good":"bad");
  close();render();toast(success?"Contrato renovado por 14 jogos.":"A proposta foi recusada.");
 },
 "exit-sell":id=>sell(id,4),
 sell:id=>{if(G.windowOpen(state)){const p=state.team.find(x=>x.id===id);if(p)sell(id,Math.max(2,price(p)-5));}},
 "buy-player":id=>{
  const p=G.market(state).find(x=>x.id===id);
  if(!p||!G.windowOpen(state)||state.team.some(x=>x.id===id)||!spend(price(p)))return;
  G.recruit(state,p);G.write(state,"Contratação",p.name+" · "+cash(price(p)),"good");render();toast(p.name+" contratado.");
 },
 "buy-item":id=>{if(spend(G.items[id].cost)){state.items[id]++;render();toast(G.items[id].name+" no inventário.");}},
 "use-item":use,
 restore:()=>{
  if(!read(checkpoint)){toast("Nenhum checkpoint foi criado.");return;}
  dialog("Recuperar checkpoint?",'<p class="muted">O progresso após o checkpoint será substituído.</p><div class="actions">'+action("restore-confirm","Recuperar","btn primary")+action("close","Voltar","btn")+'</div>');
 },
 "restore-confirm":()=>{const restored=read(checkpoint);if(restored){state=loadCampaign(restored);phase="event";close();render();toast("Checkpoint recuperado.");}},
 reset:()=>dialog("Apagar sua campanha?",'<p class="muted">Esta ação remove a campanha e seu checkpoint deste navegador.</p><div class="actions">'+action("reset-confirm","Apagar campanha","btn danger")+action("close","Cancelar","btn")+'</div>'),
 "reset-confirm":()=>{state=G.fresh();phase="event";try{localStorage.removeItem(checkpoint);}catch{}close();go("roleta");}
};
document.addEventListener("click",e=>{
 const el=e.target.closest("[data-act]");
 if(el&&!el.disabled&&(!locked||el.dataset.act==="save"))actions[el.dataset.act]?.(el.dataset.id,el);
});
document.addEventListener("change",e=>{
 const el=e.target;
 if(el.id==="formation"){state.formation=el.value;G.auto(state);}
 else if(el.id==="draft-mode")state.draftMode=el.value;
 else if(el.id==="emblem"&&(!state.run||state.run.done))state.emblem=el.value;
 else if(el.id==="stadium-mode")state.stadiumMode=el.value;
 else if(el.id==="challenge"&&(!state.run||state.run.done))state.challenge=el.value;
 else return;
 render();
});
$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))close();});
window.addEventListener("hashchange",()=>{if(!locked)phase="event";render();window.scrollTo({top:0});});
render();




