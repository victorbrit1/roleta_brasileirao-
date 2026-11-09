"use strict";
const G=window.Game;
const $=s=>document.querySelector(s);
const safe=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const svg=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const storage="roleta-brasileirao-v1";
const checkpoint=storage+"-checkpoint";
function read(key){try{const value=JSON.parse(localStorage.getItem(key));return value?.version===1?value:null;}catch{return null;}}
let state=read(storage)??G.fresh(), locked=false, turns=0, toastTimer;
const pages=[
 ["roleta","wheel","Roleta"],["elenco","shirt","Meu elenco"],["competicoes","cup","Competições"],["regioes","map","Mapa regional"],
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
const regionNames=["Norte","Nordeste","Sudeste","Sul"];
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
 const best=state.record.liga?.w??0;
 return '<div class="side-goal"><span class="goal-icon">'+svg("cup")+'</span><span class="overline">META DA TEMPORADA</span><strong>O sonho do 38–0</strong><div class="meter"><i style="width:'+best/38*100+'%"></i></div><small>'+best+' / 38 vitórias</small><a href="#competicoes">Ver campanha '+svg("arrow")+'</a></div>';
}
function render(){
 const current=page(), run=state.run;
 $("#top-actions").innerHTML='<span class="money">'+svg("coin")+' <b>'+cash(state.bank)+'</b></span>'+action("save",svg("save")+' <span>Salvar</span>',"btn mini");
 $("#nav").innerHTML=pages.map(([id,icon,label])=>'<a href="#'+id+'" class="'+(current===id?"active":"")+'" '+(current===id?'aria-current="page"':"")+'>'+svg(icon)+' <span>'+label+'</span>'+(id==="mercado"&&state.events.length?'<b class="nav-count">'+state.events.length+'</b>':"")+'</a>').join("");
 $("#side-goal").innerHTML=progress();
 const screens={roleta:home,elenco:squad,competicoes:competitions,regioes:regions,mercado:market,itens:items,historico:history};
 $("#main").innerHTML=screens[current](run);
 if(current==="roleta")drawWheel();
 save();
}
function drawWheel(){
 const holder=$("#wheel-art");
 if(!holder)return;
 const sector=360/slices.length, rad=a=>a*Math.PI/180;
 const point=(r,a)=>[180+Math.cos(rad(a))*r,180+Math.sin(rad(a))*r];
 const dots=Array.from({length:40},(_,i)=>{const [x,y]=point(172,i*9);return '<circle cx="'+x+'" cy="'+y+'" r="'+(i%5===0?2.1:1.2)+'" fill="'+(i%5===0?"#ffe89a":"#a28b4e")+'"/>';}).join("");
 const paths=slices.map(([label,icon,color],i)=>{
  const center=i*sector-90, [x1,y1]=point(164,center-sector/2),[x2,y2]=point(164,center+sector/2);
  const [tx,ty]=point(124,center),[ix,iy]=point(98,center);
  return '<path d="M180 180L'+x1+' '+y1+'A164 164 0 0 1 '+x2+' '+y2+'Z" fill="'+color+'" stroke="#81bf9c" stroke-opacity=".38"/><g transform="rotate('+i*sector+' '+tx+' '+ty+')"><text x="'+tx+'" y="'+ty+'" text-anchor="middle" dominant-baseline="middle">'+label+'</text></g><use href="#i-'+icon+'" x="'+(ix-9)+'" y="'+(iy-9)+'" width="18" height="18" stroke="#d2eadc" fill="none" stroke-width="1.6" transform="rotate('+i*sector+' '+ix+' '+iy+')"/>';
 }).join("");
 holder.innerHTML='<svg class="wheel-svg" viewBox="0 0 360 360" aria-hidden="true"><defs><radialGradient id="wheelLight"><stop offset="0" stop-color="#011810" stop-opacity=".7"/><stop offset="1" stop-color="#54ffae" stop-opacity=".12"/></radialGradient><linearGradient id="rim" x2="1" y2="1"><stop stop-color="#ffe5a2"/><stop offset=".5" stop-color="#9f7833"/><stop offset="1" stop-color="#eecb6e"/></linearGradient></defs><circle cx="180" cy="180" r="178" fill="#151e17" stroke="url(#rim)" stroke-width="2"/>'+paths+'<circle cx="180" cy="180" r="164" fill="url(#wheelLight)" stroke="url(#rim)" stroke-width="1.5"/>'+dots+'</svg>';
}
function home(run){
 const mode=G.modes[state.mode], ready=G.starters(state).filter(Boolean).length;
 const last=state.last;
 return '<section class="hero"><div class="hero-inner"><span class="hero-label">'+svg("ball")+' SIMULADOR DE FUTEBOL</span><h1>ROLETA DO<br><em>BRASILEIRÃO</em></h1><p>Monte seu elenco, encare o imprevisto e faça história no futebol brasileiro.</p><div class="hero-tags">'+tag("20 CLUBES")+' '+tag("TEMPORADA 2026")+' '+tag("CAMINHO À TRÍPLICE COROA")+'</div></div><div class="hero-stamp"><b>26</b><small>SÉRIE A</small></div></section>'+
 '<div class="section-kicker"><span><i></i> DIA DE JOGO</span><span>BRASIL <b> / </b> TEMPORADA 2026</span></div>'+
 '<div class="dashboard"><section class="card roulette"><div class="panel-head"><div class="head-icon">'+svg("wheel")+'</div><div><h2>Roleta de eventos</h2><p>O próximo giro pode mudar tudo.</p></div>'+tag("AO VIVO","green")+'</div><div class="wheel-area"><div class="wheel-wrap"><div class="pointer"></div><div id="wheel-art"></div><div class="wheel-hub">'+svg("ball")+'</div></div></div><div class="wheel-footer">'+action("spin",svg("wheel")+" GIRAR ROLETA","btn primary spin-btn",(locked?"disabled":""))+'<p>'+(state.draft?"Você tem uma escolha pendente.":"Elenco, reforços e surpresas a cada giro")+'</p></div></section>'+
 '<div class="match-column">'+match(run)+
 '<section class="card compact"><div class="panel-head"><div class="head-icon">'+svg("shirt")+'</div><div><h2>Seu elenco</h2><p>Formação '+safe(state.formation)+' · '+(ready===11?"Pronto para jogar":"Em montagem")+'</p></div><strong class="line-count">'+ready+'<small>/11</small></strong></div><div class="meter"><i style="width:'+ready/11*100+'%"></i></div><div class="compact-foot"><a href="#elenco">Gerenciar escalação '+svg("arrow")+'</a><span>'+G.rating(state)+' OVR</span></div></section>'+
 '<section class="card compact ticker"><div class="panel-head"><div class="head-icon gold">'+svg("zap")+'</div><div><h2>Central de eventos</h2><p>'+(state.events.length?state.events.length+' evento(s) aguardando decisão':last?'Último jogo · '+last.score.join(" × ")+' '+safe(nameOf(last.rival)):'Os eventos da campanha aparecem aqui.')+'</p></div></div><a href="#mercado">Abrir central '+svg("arrow")+'</a></section></div></div>'+
 '<section class="card bottom-stat"><span>'+svg("cup")+' <b>'+(state.record.liga?.w??0)+'/38</b> melhor Brasileirão</span><span>'+svg("zap")+' <b>'+state.streak+'/82</b> sequência atual</span><span>'+svg("map")+' <b>'+Object.values(state.regions).flat().length+'/20</b> clubes vencidos na Série A</span></section>';
}
function match(run){
 const rival=G.opponent(state), own=G.getClub(state.emblem), mode=G.modes[state.mode], round=(run?.played??0)+1;
 const derby=G.isDerby(state,rival);
 const ready=G.starters(state).filter(Boolean).length===11;
 return '<section class="card match"><div class="panel-head"><div class="head-icon gold">'+svg("cup")+'</div><div><h2>'+(run?.done?"Campanha encerrada":"Próxima partida")+'</h2><p>'+mode.name+' · '+mode.short+'</p></div>'+tag(run?.done?"FINAL":String(round).padStart(2,"0")+" / "+mode.length,derby?"gold":"")+'</div>'+
 (rival?'<div class="versus"><div>'+crest(own)+'<strong>'+safe(own.name)+'</strong><small>SEU EMBLEMA</small></div><b>VS</b><div>'+crest(rival)+'<strong>'+safe(rival.name)+'</strong><small>'+rival.ovr+' OVR</small></div></div><div class="stadium">'+svg("pin")+' '+safe(state.stadium)+(derby?" · Clássico":"")+'</div><div class="match-foot">'+action("play",svg("ball")+" Jogar partida","btn play")+'<small>'+(ready?pct(G.odds(state,rival))+' de chance de vitória':'Escale 11 titulares para jogar')+'</small></div>':
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
 const cards=Object.entries(G.modes).map(([id,m])=>{
  const closed=id==="lib"&&!G.unlocked(state);
  const record=state.record[id], active=state.mode===id&&state.run&&!state.run.done;
  const desc=id==="liga"?"38 rodadas. O título no simulador pede 76 pontos. Vença as 38 para liberar a Libertadores.":id==="copa"?"Mata-mata compacto. Vença sete partidas seguidas para levantar a taça.":"Seis jogos na fase de grupos e sete no mata-mata. A fase de grupos exige três vitórias.";
  return tile(closed?"lock":"cup",m.name,desc,(record?.title?tag("CAMPEÃO","gold"):"")+(active?tag("EM ANDAMENTO","green"):"")+
   '<div class="actions">'+action("mode",closed?"Bloqueada":active?"Continuar":state.run?.done&&state.mode===id?"Nova campanha":"Selecionar","btn "+(active?"primary":""),'data-id="'+id+'" '+(closed?"disabled":""))+'</div>',closed?"locked":"");
 }).join("");
 const unlocked=G.unlocked(state), triple=!!(state.record.liga?.perfect&&state.record.copa?.title&&state.record.lib?.title);
 return heading("SALA DE TROFÉUS","Competições","Do campeonato nacional à glória continental.")+
 '<div class="split"><div class="stack">'+cards+'</div><section class="card content goals"><h2>Desafios da campanha</h2>'+tag(triple?"TRÍPLICE COROA CONQUISTADA":unlocked?"LIBERTADORES LIBERADA":"RUMO À TRÍPLICE COROA","gold")+
 '<div class="goal-row"><b>38–0 no Brasileirão</b><strong>'+(state.record.liga?.w??0)+' / 38</strong></div><div class="goal-row"><b>Campeão da Copa do Brasil</b><strong>'+(state.record.copa?.title?"✓":"—")+'</strong></div><div class="goal-row"><b>82 vitórias seguidas</b><strong>'+Math.min(82,state.best)+' / 82</strong></div><p class="muted">A sequência de 82 pode atravessar competições e temporadas. Empates ou derrotas zeram a sequência atual.</p><label class="field-label">Restrição de OVR<select id="challenge" '+(state.run&&!state.run.done?"disabled":"")+'><option value="open">Sem restrição</option><option value="sub78" '+(state.challenge==="sub78"?"selected":"")+'>Até 78 OVR</option><option value="elite" '+(state.challenge==="elite"?"selected":"")+'>A partir de 80 OVR</option></select></label></section></div>';
}
function regions(){
 return heading("EXPEDIÇÃO NACIONAL","Mapa regional","Vença cada clube para completar sua coleção. As quatro regiões têm representantes na Série A de 2026.")+
 '<div class="region-grid">'+regionNames.map(r=>{
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
function openDraft(){
 if(!state.draft){
  const pos=state.draftMode==="position"?G.proposedRole(state):null;
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
 if(state.team.length<11){turns=0;}
 const sector=state.team.length<11||!G.starters(state).every(Boolean)&&turns%2===0?0:G.choose([0,0,0,1,2,3,4,5,6,7]);
 turns++;locked=true;
 const art=$("#wheel-art"), spinButton=$(".spin-btn");
 spinButton.disabled=true;
 art.style.transform="rotate("+(360*4-sector*45)+"deg)";
 const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
 setTimeout(()=>{
  locked=false;
  if(sector===0){openDraft();render();return;}
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
 },reduce?50:1750);
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
function kick(){
 if(state.bank<0){toast("Caixa negativo. Venda um jogador ou resolva eventos antes de jogar.");return;}
 if(state.events.some(e=>["sale","trade","exit"].includes(e.type))){toast("Resolva os eventos obrigatórios na diretoria.");go("mercado");return;}
 if(G.starters(state).some(p=>!p)){toast("Escale 11 jogadores saudáveis antes da partida.");go("elenco");return;}
 const result=G.play(state);
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
 if(id===state.mode&&!state.run?.done){go("roleta");return;}
 if(state.run&&!state.run.done){
  dialog("Trocar de competição?",'<p class="muted">A campanha atual será encerrada. O elenco, a sequência de vitórias e os troféus já conquistados ficam no seu save.</p><div class="actions">'+action("mode-confirm","Trocar competição","btn primary",'data-id="'+id+'"')+action("close","Voltar","btn")+'</div>');
  return;
 }
 setMode(id);
}
function setMode(id){
 state.mode=id;state.run=null;state.last=null;state.market=null;close();go("roleta");
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
 play:kick,mode:switchMode,"mode-confirm":setMode,
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
 "restore-confirm":()=>{const restored=read(checkpoint);if(restored){state=restored;close();render();toast("Checkpoint recuperado.");}},
 reset:()=>dialog("Apagar sua campanha?",'<p class="muted">Esta ação remove a campanha e seu checkpoint deste navegador.</p><div class="actions">'+action("reset-confirm","Apagar campanha","btn danger")+action("close","Cancelar","btn")+'</div>'),
 "reset-confirm":()=>{state=G.fresh();try{localStorage.removeItem(checkpoint);}catch{}close();go("roleta");}
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
window.addEventListener("hashchange",()=>{render();window.scrollTo({top:0});});
render();
