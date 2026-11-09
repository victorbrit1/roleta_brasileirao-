"use strict";
(() => {
const rosterGroups = [
["Mycael|Santos","Léo|Arthur Dias|Lucas Esquivel|Gaston Benavidez|Lucas Marezi|Aguirre|Teran","João Cruz|Zapelli|Felipinho|Portilla|Alejandro Garcia","Kevin Viveros|Mendoza|Alemão|Isaac|Kerwin Vargas|Chiqueti"],
["Everson|Gabriel Delfim","Renan Lodi|Angelo Preciado|Lyanco|Vitor Hugo|Ruan|Natanael Milouski","Gustavo Scarpa|Alan Franco|Igor Gomes|Maycon|Alexsander|Reinier|Bernard|Victor Hugo","Cassierra|Cuello|Alan Minda|Dudu|Thiago Borbas"],
["Guido Herrera|Leo Vieira","Luciano Juba|Kanu|David Duarte|Marcos Victor|Zé Guilherme|Marco Moreno","Éverton Ribeiro|Jean Lucas|Caio Alexandre|Acevedo|Rodrigo Nestor|Michel Araujo|Erick","Willian José|Ademir|Erick Pulga|Sanabria|Kike Olivera|Everaldo|Ruan Pablo|Artur"],
["Warleson|Cristhian Loor","Vitinho|Marçal|Alex Telles|Ferraresi|Lucas Villalba|Mateo Ponte|Jhoan Hernandez","Danilo Santos|Allan|Edenilson|Montoro|Cristian Medina|Jordan Barrera|Wallace Davi","Tiquinho|Ziyech|Matheus Martins|Arthur"],
["Rafael Santos|Heitor Rodrigues","Bruno Pacheco|R. Thyere|Victor Caetano|Edu Doma|Mancha|Marcinho","Vinicius Balieiro|Rafael Carvalheira|Giovanni Augusto|Yago Felipe|Camilo","Bolasie|Garcez|KEVIN RAMIREZ|Bruno Tubarão|Italo|Rubens"],
["Hugo Souza|Felipe Longo","Matheuzinho|Matheus Bidu|Fabrizio Angileri|Pedro Milans","RODRIGO GARRO|Raniele|Breno Bidon|Andre Carrillo|Charles|Alex Santana|Jesse Lingard|Dieguinho","Yuri Alberto|Memphis Depay|Pedro Raul|Vitinho|Kayke|Nícollas Melo"],
["Pedro Morisco|Pedro Rangel|Keiller","Rodrigo Moledo|Maicon|Bruno Melo|Bustos|Tiago Coser|Tinga|Jacy","Sebastian Gomez|Josue|Vini Paulista|Nicolas Fonseca|Thiago Santos","Lucas Ronier|Keno|Pedro Rocha|Brian Ocampo|Lavega|Breno"],
["Cássio|Otávio|Leo Aragão","Fabrício Bruno|Kaiki Bruno|Jonathan Jesus|Joao Marcelo|Villalba|William|Fagner|Vitão","Matheus Pereira|Lucas Romero|Gerson|Lucas Silva|Matheus Henrique","Kaio Jorge|Sinisterra|WANDERSON|Gabriel Pec|Luciano Rodriguez|Arroyo|Marquinhos"],
["ROSSI|Dyogo|Andrew","Leo Pereira|Léo Ortiz|Danilo|Vitão|Alex Sandro|Ayrton Lucas|Emerson|Varela","De Arrascaeta|Lucas Paquetá|Jorge|Erick Pulgar|DE LA CRUZ|Saul|Evertton|Carrascal","Pedro|Samuel Lino|Bruno Henrique|Plata|Luiz|Luiz Guilherme|Valencia"],
["Fabio|Marcelo Pitaluga|Vitor Eudes","Thiago Silva|Guilherme Arana|Samuel Xavier|Freytes|Ignacio|Guga|Jemmes|Renê|Igor Rabello","HERCULES|Lucho Acosta|Martinelli|Nonato|PH GANSO|Otavio|Savarino","German Cano|Hulk|John Kennedy|Canobbio|Kevin Serna|Soteldo|Castillo"],
["Weverton|Gabriel Grando","Kannemann|Adrielson|Marlon|Joao Pedro|Balbuena|G. Martins|Zortéa|Marcos Rocha","Villasanti|Monsalve|Dodi|Nardoni|Krovinovic|Erick Noriega","Braithwaite|Tete|Amuzu|Pavon|Enamorado|Matheus Nascimento"],
["Sergio Rochet|Anthoni Souza|Matheus Cunha","Gabriel Mercado|Bernabei|Braian Aguirre|Victor Gabriel|Luiz Felipe|Maripan|Felix Torres|Matheus Bahia","Alan Patrick|Bruno Gomes|Thiago Maia|Rodrigo Villagra|Bruno Henrique|Calebe","Carbonero|Alerrandro|Vitinho|Tony Sanabria|ELIASSON|Raykkonen"],
["Alex Muralha|Georgemy","Reinaldo|Daniel Borges|Willian Machado|Lucas Oliveira|Igor","Shaylon|Jose Aldo|Neto|Wallisson|Chico","Negueba|Edson Carioca|Mosquito|Zé Roberto|Carlos Eduardo|Alesson|Fernandinho"],
["Marcelo Lomba|Bruno Bertinato","Gustavo Gomez|Joaquin Piquerez|Murilo|Bruno Fuchs|Khellven|Giay|Alexander Barboza|Jefté","Jhon Arias|Andreas Pereira|Marlon Freitas|Mauricio|Evangelista|Martinez|Felipe Anderson","Vitor Roque|Lopez|Paulinho|RAMON SOSA|Luighi|Eduardo Conceição"],
["Cleiton|Tiago Volpi","J. Capixaba|Alix Vinicius|Vanderlan|Andres Hurtado|Agustín Sant'Anna|Gustavo Marques","Gabriel Girotto|Eric Ramires|Matheus Fernandes|Fabinho|Nacho Sosa|Rodriguinho","Sasha|Isidro Pitta|Lucas Barbosa|Henry Mosquera|Bruno Gonçalves|Wallace Yan"],
["Ivan Quaresma|Ygor Vinhas","Marllon|Ze Ivaldo|Leo Andrade|Matheus Alexandre|Joao Lucas|Mayk|Matheus Felipe|Cristian Tassano","Vitor Bueno|Jaderson|Zé Ricardo|Picco|Edson Fernando|Welison","Poveda|Galeano|Edu|Jajá|Paulo Sérgio Junior"],
["Gabriel Brazão|Joao Paulo","Luan Peres|Lucas Verissimo|Escobar|Rodinei|Igor Vinicius|Vini Lira|Gustavo Henrique","Philippe Coutinho|Gabriel Bontempo|Arthur Melo|João Schmidt|Gabriel Menino|Willian Arao|Rollheiser","Neymar Jr|Gabriel Barbosa|Everton Cebolinha|Rony|Barreal|Caballero|Mateus Xavier"],
["Rafael|Carlos Coronel","Arboleda|Toloi|Enzo Díaz|Cédric|Wendell|Sabino|Domingos Duarte|Lucas Ramon","Lucas Moura|Pablo Maia|Marcos Antônio|Damián Bobadilla|Cauly|Igor Gomes","Calleri|Luciano|Ferreira|Artur|Ryan Francisco|Tete"],
["Léo Jardim|Daniel Fuzato","Lucas Piton|Paulo Henrique|Cuesta|Robert Renan|João Vitor|Puma Rodriguez|Cuiabano","Thiago Mendes|Tche Tche|Barros|Jair|Guilherme Estrella|LESCANO|Mateus Carvalho","Adson|Brenner|Spinelli|David|Hinestroza|Bruno Duarte|Gabriel Santos"],
["Lucas Arcanjo|Fintelman|Yuri Sena","Camutanga|Edu|Luan Candido|Jamerson|Riccieli|Nathan Mendes|Matheuzinho","Matheusinho|Dudu|Gabriel Baralhas|Emmanuel Martinez|Pochettino|Ramon","Renato Kayzer|Osvaldo|Marinho|Nacho Laquintana|Diego Tarzia|Erick"]
];
const info = [
["Athletico-PR","CAP","Sul","Arena da Baixada","#d4454f",76,"PR"],
["Atlético-MG","CAM","Sudeste","Arena MRV","#aab5ba",79,"MG"],
["Bahia","BAH","Nordeste","Fonte Nova","#4074dc",78,"BA"],
["Botafogo","BOT","Sudeste","Nilton Santos","#c3c8ca",78,"RJ"],
["Chapecoense","CHA","Sul","Arena Condá","#58a871",69,"SC"],
["Corinthians","COR","Sudeste","Neo Química Arena","#bdc0c2",78,"SP"],
["Coritiba","CFC","Sul","Couto Pereira","#4da978",71,"PR"],
["Cruzeiro","CRU","Sudeste","Mineirão","#4f77de",80,"MG"],
["Flamengo","FLA","Sudeste","Maracanã","#d2474c",83,"RJ"],
["Fluminense","FLU","Sudeste","Maracanã","#9f576b",79,"RJ"],
["Grêmio","GRE","Sul","Arena do Grêmio","#55a8d7",77,"RS"],
["Internacional","INT","Sul","Beira-Rio","#dd5358",76,"RS"],
["Mirassol","MIR","Sudeste","Maião","#ddbb4c",71,"SP"],
["Palmeiras","PAL","Sudeste","Allianz Parque","#4bad78",82,"SP"],
["RB Bragantino","RBB","Sudeste","Cícero de Souza Marques","#cbb5ab",74,"SP"],
["Remo","REM","Norte","Mangueirão","#6f83d1",70,"PA"],
["Santos","SAN","Sudeste","Vila Belmiro","#d3d6d3",78,"SP"],
["São Paulo","SAO","Sudeste","Morumbi","#d85459",78,"SP"],
["Vasco","VAS","Sudeste","São Januário","#b0b6bb",76,"RJ"],
["Vitória","VIT","Nordeste","Barradão","#d2544a",72,"BA"]
];
const role = {G:"Goleiro",D:"Defesa",M:"Meio-campo",A:"Ataque"};
const clubs = info.map(([name,code,region,stadium,color,ovr,uf],index) => ({
 id:code,name,region,stadium,color,ovr,uf, ...ROSTERS[index],
 crest:"https://conteudo.cbf.com.br/clubes/"+ROSTERS[index].source.split("/").pop()+"/escudo.jpg"
}));
const players = clubs.flatMap((club,i) => rosterGroups[i].flatMap((group,j) =>
 group.split("|").filter(name=>club.names.includes(name)).map((name,k)=>({
 id:club.id+"-"+j+"-"+k,name,club:club.id,pos:"GDMA"[j],ovr:Math.min(89,club.ovr+Math.max(-5,5-2*k)+(name==="Neymar Jr"?3:0))
 }))
));
const legends = [
 {id:"icon-pele",name:"Pelé",club:"SAN",pos:"A",ovr:96},
 {id:"icon-zico",name:"Zico",club:"FLA",pos:"M",ovr:94},
 {id:"icon-ceni",name:"Rogério Ceni",club:"SAO",pos:"G",ovr:91},
 {id:"icon-capita",name:"Carlos Alberto Torres",club:"FLU",pos:"D",ovr:93},
 {id:"icon-ronaldo",name:"Ronaldo Fenômeno",club:"CRU",pos:"A",ovr:95}
];
const continental = [
 ["Boca Juniors","BOC",82],["River Plate","RIV",84],["Peñarol","PEN",79],["Nacional","NAC",77],
 ["Olimpia","OLI",75],["LDU","LDU",76],["Atlético Nacional","ATN",78],["Colo-Colo","COL",77]
].map(([name,id,ovr])=>({name,id,ovr,color:"#d5af54",region:"Continental",stadium:"Arena Continental"}));
const teams=[...clubs,...continental];
const formations={"4-3-3":[4,3,3],"4-4-2":[4,4,2],"3-5-2":[3,5,2],"5-3-2":[5,3,2],"4-2-4":[4,2,4]};
const coaches=[
 {name:"O Estrategista",passive:"+5 p.p. de vitória",win:0.05},
 {name:"O Preparador",passive:"40% menos risco de lesão",heal:0.6},
 {name:"O Motivador",passive:"+9 p.p. de vitória em clássicos",derby:0.09},
 {name:"O Formador",passive:"+2 OVR efetivos para reforços",youth:2}
];
const modes={
 liga:{name:"Brasileirão",short:"Série A",length:38},
 copa:{name:"Copa do Brasil",short:"Mata-mata",length:7},
 lib:{name:"Libertadores",short:"Continental",length:13}
};
const items={
 bicho:{name:"Bicho",icon:"coin",cost:5,desc:"+15 pontos percentuais de chance de vitória no próximo jogo."},
 kit:{name:"Kit médico",icon:"zap",cost:4,desc:"Cura as lesões e zera a sequência de jogos dos lesionados."},
 save:{name:"Save",icon:"save",cost:7,desc:"Registra um checkpoint para recuperar a campanha."},
 youth:{name:"Revelação",icon:"star",cost:8,desc:"Promove uma promessa fictícia da base."},
 cruise:{name:"Cruzeiro do Neymar",icon:"ball",cost:12,desc:"Reduz a fadiga e concede +8 p.p. de vitória por três jogos."},
 renewal:{name:"Renegociação",icon:"shield",cost:6,desc:"Garante 100% de chance na próxima renovação, com a taxa do contrato à parte."}
};
const choose=a=>a[Math.floor(Math.random()*a.length)];
const mix=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const getClub=id=>teams.find(c=>c.id===id);
const healthy=p=>p.injury===0;
const live=p=>({...p,injury:0,streak:0,bench:0,contract:12,unhappy:false});
const slotRoles=f=>["G",...formations[f].flatMap((n,i)=>Array(n).fill("DMA"[i]))];
function calendar(mode,emblem){
 const pool=mix(clubs.filter(c=>c.id!==emblem)).map(c=>c.id);
 if(mode==="liga") return [...pool,...pool];
 if(mode==="copa") return pool.slice(0,7);
 return [...mix(continental).map(c=>c.id),...mix([...continental.map(c=>c.id),...pool.slice(0,4)]).slice(0,5)];
}
function fresh(){
 return {version:1,mode:"liga",formation:"4-3-3",draftMode:"position",emblem:"FLA",coach:0,team:[],slots:Array(11).fill(null),bank:24,
  items:{bicho:1,kit:1,save:1,youth:0,cruise:0,renewal:0},bicho:false,cruise:0,record:{},run:null,draft:null,events:[],log:[],regions:{},streak:0,best:0,wins:0,achievements:{},market:null,last:null,
  firstOpponent:"COR", stadium:"Maracanã",stadiumMode:"every",challenge:"open"};
}
function write(s,title,desc,kind="info"){s.log.unshift({title,desc,kind});if(s.log.length>160)s.log.pop();}
function emptyRole(s,pos){return s.slots.findIndex((id,i)=>!id&&slotRoles(s.formation)[i]===pos);}
function recruit(s,p){
 if(s.team.some(x=>x.id===p.id))return;
 const ready=live(p);
 s.team.push(ready);
 const index=emptyRole(s,p.pos);
 if(index!==-1)s.slots[index]=p.id;
 return ready;
}
function auto(s){
 const order=s.team.filter(healthy).sort((a,b)=>(b.ovr-b.streak*1.8)-(a.ovr-a.streak*1.8));
 s.slots=slotRoles(s.formation).map(pos=>{
  const i=order.findIndex(p=>p.pos===pos);
  return i===-1?null:order.splice(i,1)[0].id;
 });
}
function proposedRole(s){
 const open=slotRoles(s.formation).filter((_,i)=>!s.slots[i]);
 return choose(open.length?open:Object.keys(role));
}
function draft(s,pos){
 const own=new Set(s.team.map(p=>p.id));
 const pool=players.filter(p=>(!pos||p.pos===pos)&&!own.has(p.id));
 const result=[];
 for(const c of mix(clubs)){
  const options=pool.filter(p=>p.club===c.id).sort((a,b)=>b.ovr-a.ovr);
  if(options.length)result.push(choose(options.slice(0,Math.min(4,options.length))));
  if(result.length===4)break;
 }
 return result;
}
function start(s){
 if(s.run)return;
 const seq=calendar(s.mode,s.emblem);
 if(s.mode==="liga"&&s.firstOpponent!==s.emblem&&s.firstOpponent){
  const n=seq.indexOf(s.firstOpponent);
  if(n>=0){const first=seq[n];seq.splice(n,1);seq.unshift(first);}
 }
 s.run={mode:s.mode,seq,played:0,w:0,d:0,l:0,done:false,won:false};
 s.firstOpponent=null;
}
function opponent(s){
 if(s.run?.done)return null;
 return getClub(s.run?.seq[s.run.played]??(s.firstOpponent===s.emblem?"FLA":s.firstOpponent)??(s.emblem==="FLA"?"COR":"FLA"));
}
function isDerby(s,other){
 const own=getClub(s.emblem);
 const rivals=[["CAP","CFC"],["CAM","CRU"],["BAH","VIT"],["GRE","INT"],["BOT","FLA","FLU","VAS"],["COR","PAL","SAN","SAO"]];
 return !!(own&&other&&own.id!==other.id&&(rivals.some(list=>list.includes(own.id)&&list.includes(other.id))||own.stadium===other.stadium));
}
const starters=s=>s.slots.map(id=>s.team.find(p=>p.id===id&&healthy(p))??null);
const rating=s=>Math.round(starters(s).reduce((sum,p)=>sum+(p?.ovr??0),0)/11);
function odds(s,other){
 const eleven=starters(s).filter(Boolean);
 if(!eleven.length||!other)return 0;
 const effective=eleven.reduce((sum,p)=>sum+p.ovr-p.streak*.8-(p.unhappy?3:0)+(p.bonus||0)+(p.generated?(coaches[s.coach]?.youth??0):0),0)/eleven.length;
 const coach=coaches[s.coach];
 return clamp(.64+(effective-other.ovr)*.019+(coach?.win??0)+(isDerby(s,other)?(coach?.derby??0)-.025:0)+(s.bicho?.15:0)+(s.cruise?.08:0)+(s.stadium===getClub(s.emblem)?.stadium?0.04:0),.13,.995);
}
function complete(s,won){
 const r=s.run;
 r.done=true;r.won=won;
 const best=s.record[r.mode]??{title:false,perfect:false,w:0};
 s.record[r.mode]={title:best.title||won,perfect:best.perfect||(r.mode==="liga"&&r.w===38),w:Math.max(best.w,r.w)};
 write(s,won?"Campeão de "+modes[r.mode].name:"Campanha encerrada",r.w+" vitórias, "+r.d+" empates e "+r.l+" derrotas.",won?"good":"bad");
}
function addEvent(s,other){
 if(s.events.length>=3)return;
 const candidates=s.team.filter(p=>!s.events.some(e=>e.id===p.id));
 const p=choose(candidates.filter(p=>p.unhappy))??choose(candidates);
 const next=choose(["agent","sale","trade","board","legend"]);
 if((next==="sale"||next==="trade")&&s.team.length<12)return;
 const reinforcement=choose(players.filter(x=>!s.team.some(y=>y.id===x.id)&&(!p||x.pos===p.pos)));
 const events={
  agent:{type:"agent",title:"Empresário bateu à porta",desc:"Pague R$ 3 mi para conhecer a aposta dele. 20% de raro, 35% de bagre e 45% de titular."},
  sale:{type:"sale",id:p?.id,title:"Venda forçada",desc:p?.name+" entrou na mira de outro clube. A diretoria aceitou R$ 8 mi."},
  trade:{type:"trade",id:p?.id,incoming:reinforcement,title:"Troca obrigatória",desc:p?.name+" sai por "+reinforcement?.name+" em uma troca aprovada pela diretoria."},
  board:{type:"board",title:"Patrocínio regional",desc:"A vitória no estádio de "+other.name+" rendeu R$ 4 mi extras."},
  legend:{type:"legend",title:"Ídolo disponível",desc:"Um ícone quer voltar aos gramados. Contrate por R$ 10 mi."}
 };
 s.events.push(events[next]);
}
function play(s){
 const next=opponent(s), selected=starters(s);
 if(!next||s.events.some(e=>["sale","trade","exit"].includes(e.type))||selected.some(p=>!p)||s.bank<0)return null;
 if((s.challenge==="sub78"&&rating(s)>78)||(s.challenge==="elite"&&rating(s)<80))return null;
 if(!s.run)start(s);
 const r=s.run, rival=opponent(s);
 if(!rival)return null;
 const chance=odds(s,rival), roll=Math.random();
 const result=roll<chance?"V":roll<chance+(1-chance)*.52&&s.mode==="liga"?"E":"D";
 const goals=Math.floor(Math.random()*3), score=result==="V"?[goals+1,goals]:result==="E"?[goals,goals]:[goals,goals+1];
 const cash=result==="V"?6:result==="E"?2:0;
 s.bank+=cash-1;
 r.played++;
 r[result==="V"?"w":result==="E"?"d":"l"]++;
 s.bicho=false;s.cruise=Math.max(0,s.cruise-1);
 const active=new Set(selected.map(p=>p.id)), injuries=[];
 for(const p of s.team){
  if(active.has(p.id)){
   p.streak++;p.bench=0;
   
   if(p.streak>=3&&Math.random()<Math.min(.22,.013*(p.streak-2))*(coaches[s.coach]?.heal??1)){
    p.injury=2+Math.floor(Math.random()*2);injuries.push(p.name);
   }
  }else{
   p.streak=0;
   if(p.injury)p.injury--;
   else p.bench++;
  }
  p.contract=Math.max(0,p.contract-1);
  if(p.bench>=6)p.unhappy=true;
 }
 const departure=s.team.find(p=>p.unhappy&&(p.bench>=10||p.contract===0)&&!s.events.some(e=>e.id===p.id));
 if(departure)s.events.push({type:"exit",id:departure.id,title:"Jogador força saída",desc:departure.name+" exige uma solução. Renove o contrato ou aceite R$ 4 mi pela saída."});
 if(r.played%3===0||isDerby(s,rival))addEvent(s,rival);
 if(r.played%7===0)addEvent(s,rival);
 if(result==="V"){
  s.wins++;s.streak++;s.best=Math.max(s.best,s.streak);
  if(s.streak>=82)s.achievements.perfect82=true;
  if(!s.regions[rival.region])s.regions[rival.region]=[];
  if(!s.regions[rival.region].includes(rival.id))s.regions[rival.region].push(rival.id);
 }else s.streak=0;
 if((s.mode==="copa"&&result==="D")||(s.mode==="lib"&&r.played>6&&result==="D"))complete(s,false);
 else if(r.played===r.seq.length)complete(s,s.mode==="liga"?r.w*3+r.d>=76:s.mode==="lib"?r.w>=10:true);
 else if(s.mode==="lib"&&r.played===6&&r.w<3)complete(s,false);
 s.last={result,score,rival:rival.id,cash,injuries,stadium:s.stadium,mode:s.mode};
 write(s,(result==="V"?"Vitória":result==="E"?"Empate":"Derrota")+" · "+score.join(" × ")+" "+rival.name,"R$ "+cash+" mi em prêmios. "+(injuries.length?"Lesões: "+injuries.join(", ")+".":""),result==="V"?"good":result==="D"?"bad":"info");
 if(s.stadiumMode==="every")s.stadium=choose(clubs).stadium;
 s.market=null;
 return s.last;
}
function remove(s,id){
 s.team=s.team.filter(p=>p.id!==id);s.slots=s.slots.map(x=>x===id?null:x);
 s.events=s.events.filter(e=>e.id!==id);
}
function renewal(s,p){
 const cost=3+Math.max(0,Math.floor((p.ovr-72)/5));
 const chance=s.items.renewal?1:clamp(.47+(s.bank-cost)*.026,.25,1);
 return {cost,chance};
}
function windowOpen(s){return !s.run||s.run.done||s.run.played%12<3;}
function market(s){
 if(!s.market)s.market=mix(players.filter(p=>!s.team.some(t=>t.id===p.id))).slice(0,8);
 return s.market;
}
function unlocked(s){return !!(s.record.liga?.perfect&&s.record.copa?.title);}
window.Game={clubs,players,legends,role,formations,coaches,modes,items,getClub,fresh,choose,mix,clamp,slotRoles,recruit,auto,proposedRole,draft,opponent,isDerby,starters,rating,odds,play,remove,renewal,windowOpen,market,unlocked,write};
})();


