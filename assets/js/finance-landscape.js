const domainById=Object.fromEntries(DATA.domains.map(d=>[d.id,d]));
const levelOrder=DATA.levelDefs.map(x=>x.name);
const state={pillar:"",domain:"",process:"",value:"",nature:"",level:"",role:"",ai:"",search:"",view:"table"};
let roleViewRole="";

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function uniq(a){return [...new Set(a)].sort((x,y)=>x.localeCompare(y,"zh-CN"));}

function renderAiEmbedPoints(points,compact=false){
  const list=(points&&points.length)?points:[];
  return `<ul class="ai-embed-list ${compact?"compact":""}">${list.map(p=>{
    const cap=typeof p==="string"?"AI增强":p.capability;
    const txt=typeof p==="string"?p:p.text;
    return `<li><span class="embed-cap">${esc(cap)}</span><span class="embed-text">${esc(txt)}</span></li>`;
  }).join("")}</ul>`;
}
function fitClass(v){return v==="AI核心"?"core":v==="AI增强"?"enhance":"erp";}
function taskAiCaps(t){return (t.aiCapabilities&&t.aiCapabilities.length)?t.aiCapabilities:[t.ai];}


function taskRoles(t){return uniq(["A","R","C","I"].flatMap(k=>(t.raci&&t.raci[k])||[]));}
function allRoles(){return uniq([...DATA.tasks.flatMap(taskRoles),...Object.keys(DATA.roleProfiles||{})]);}
function relationForRole(t,role){return ["A","R","C","I"].filter(k=>((t.raci&&t.raci[k])||[]).includes(role));}
function renderRaci(t){
  const labels={A:"最终负责",R:"执行",C:"协同",I:"知会"};
  return `<div class="raci-wrap">${["A","R","C","I"].map(k=>{
    const names=(t.raci&&t.raci[k])||[];
    return names.length?`<div class="raci-line"><span class="raci-code ${k.toLowerCase()}" title="${labels[k]}">${k}</span><span class="raci-names">${names.map(esc).join("、")}</span></div>`:"";
  }).join("")}</div>`;
}

function renderDomains(){
  const grid=document.getElementById("domainGrid");
  grid.innerHTML=DATA.domains.map(d=>{
    const count=DATA.tasks.filter(t=>t.domain===d.id).length;
    return `<article class="domain-card ${state.domain===d.id?"active":""}" style="--c:${d.color}" data-id="${d.id}">
      <div class="domain-top"><div class="domain-id">${d.id}</div><div class="domain-name">${esc(d.name)}</div></div>
      <div class="domain-summary">${esc(d.summary)}</div>
      <div class="domain-question">${esc(d.question)}</div>
      <div class="domain-core">${d.core.map(x=>`<span>${esc(x)}</span>`).join("")}</div>
      <div class="domain-foot"><span>${esc(d.pillar||"")}</span><span class="domain-count">${count}项</span></div>
    </article>`;
  }).join("");
  grid.querySelectorAll(".domain-card").forEach(el=>el.onclick=()=>{
    state.domain=state.domain===el.dataset.id?"":el.dataset.id;
    document.getElementById("domainFilter").value=state.domain;
    renderAll();
    document.getElementById("explorer").scrollIntoView({behavior:"smooth",block:"start"});
  });
}

function renderAIOverview(){
  const grid=document.getElementById("aiCapabilityGrid");
  if(!grid)return;
  grid.innerHTML=DATA.aiDefs.map(def=>{
    const matched=DATA.tasks.filter(t=>taskAiCaps(t).includes(def.name));
    const examples=matched.slice(0,3).map(t=>t.name).join("、");
    return `<button class="ai-cap-card ${state.ai===def.name?"active":""}" data-ai="${esc(def.name)}">
      <div class="ai-cap-top">
        <span class="ai-cap-mark">${esc(def.mark)}</span>
        <span class="ai-cap-count">${matched.length}项任务</span>
      </div>
      <div class="ai-cap-name">${esc(def.name)}</div>
      <span class="ai-cap-focus">${esc(def.focus)}</span>
      <div class="ai-cap-desc">${esc(def.desc)}</div>
      <div class="ai-cap-examples">示例：${esc(examples||"暂无任务")}</div>
    </button>`;
  }).join("");
  grid.querySelectorAll(".ai-cap-card").forEach(card=>card.onclick=()=>{
    state.ai=state.ai===card.dataset.ai?"":card.dataset.ai;
    renderAll();
    document.getElementById("explorer").scrollIntoView({behavior:"smooth",block:"start"});
  });
  const clearBtn=document.getElementById("clearAiOverview");
  clearBtn.disabled=!state.ai;
  clearBtn.style.opacity=state.ai?"1":".55";
}

function renderCrosswalk(){
  document.getElementById("crosswalkGrid").innerHTML=DATA.crosswalks.map(g=>`<article class="crosswalk-card"><h3>${esc(g.title)}</h3>${g.items.map(it=>`<div class="cross-item">
    <div class="cross-name">${esc(it.name)}</div>
    <div class="cross-domains">${it.domains.map(id=>{const d=domainById[id];return `<span class="mini-domain" style="--c:${d.color}">${id} ${esc(d.short)}</span>`}).join("")}</div>
    <div class="cross-desc">${esc(it.desc)}</div>
  </div>`).join("")}</article>`).join("");
}
function renderLevels(){
  document.getElementById("levelGuide").innerHTML=DATA.levelDefs.map((x,i)=>`<article class="level-card"><div class="level-no">LEVEL 0${i+1}</div><h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p></article>`).join("");
  const body=document.getElementById("roleMatrixBody");
  body.innerHTML=DATA.domains.map(d=>`<tr><td><span class="tag domain-tag" style="--c:${d.color}">${d.id}</span> ${esc(d.name)}</td>${levelOrder.map(l=>`<td>${(DATA.roleMatrix[d.id][l]||[]).map(r=>`<span class="role-pill">${esc(r)}</span>`).join("")}</td>`).join("")}</tr>`).join("");
}
function fillSelect(id,items,labelFn=x=>x,valueFn=x=>x){
  const el=document.getElementById(id),first=el.options[0].outerHTML;
  el.innerHTML=first+items.map(x=>`<option value="${esc(valueFn(x))}">${esc(labelFn(x))}</option>`).join("");
}
function renderChips(id,items,key){
  const el=document.getElementById(id);
  el.innerHTML=items.map(x=>`<button class="chip ${state[key]===x?"active":""}" data-v="${esc(x)}">${esc(x)}</button>`).join("");
  el.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{state[key]=state[key]===b.dataset.v?"":b.dataset.v;renderAll();});
}
function filteredTasks(){
  const q=(state.search||"").trim().toLowerCase();
  return DATA.tasks.filter(t=>{
    const raciText=["A","R","C","I"].flatMap(k=>(t.raci&&t.raci[k])||[]).join(" ");
    const aiPointText=(t.aiEmbedPoints||[]).map(p=>typeof p==="string"?p:`${p.capability} ${p.text}`).join(" ");
    const hay=[t.name,t.object,t.output,t.action,taskAiCaps(t).join(" "),t.aiFit,t.automationBoundary,aiPointText,t.process,t.value,t.nature,t.role,raciText,t.pillar,...t.levels,domainById[t.domain].name].join(" ").toLowerCase();
    return (!state.pillar||t.pillar===state.pillar)&&(!state.domain||t.domain===state.domain)&&(!state.process||t.process===state.process)
      &&(!state.value||t.value===state.value)&&(!state.nature||t.nature===state.nature)&&(!state.level||t.levels.includes(state.level))
      &&(!state.role||taskRoles(t).includes(state.role))&&(!state.ai||taskAiCaps(t).includes(state.ai))&&(!q||hay.includes(q));
  });
}
function tagLevels(levels){return levels.map(x=>`<span class="tag level-tag">${esc(x)}</span>`).join("");}
function renderTasks(){
  const items=filteredTasks();
  document.getElementById("resultCount").textContent=items.length;
  const active=[];
  [["支柱",state.pillar],["能力域",state.domain?domainById[state.domain].short:""],["流程",state.process],["价值深度",state.value],["任务角色",state.nature],["层级",state.level],["角色责任",state.role],["AI",state.ai]].forEach(([k,v])=>{if(v)active.push(`${k}：${v}`)});
  if(state.search)active.push(`关键词：${state.search}`);
  document.getElementById("activeSummary").textContent=active.length?active.join(" ｜ "):"未设置筛选条件";
  document.getElementById("taskTableBody").innerHTML=items.map((t,i)=>{
    const d=domainById[t.domain];
    return `<tr data-i="${DATA.tasks.indexOf(t)}">
      <td><span class="tag domain-tag" style="--c:${d.color}">${d.id} ${esc(d.short)}</span></td>
      <td class="task-name">${esc(t.name)}</td>
      <td class="task-structure-cell">
        <div class="task-structure-step input"><b>输入</b><span>${esc(t.object)}</span></div>
        <div class="task-structure-arrow">↓</div>
        <div class="task-structure-step action"><b>动作</b><span>${esc(t.action)}</span></div>
        <div class="task-structure-arrow">↓</div>
        <div class="task-structure-step output"><b>输出</b><span>${esc(t.output)}</span></div>
      </td>
      <td><div class="ai-cap-stack"><span class="ai-fit ${fitClass(t.aiFit)}">${esc(t.aiFit)}</span>${taskAiCaps(t).map(x=>`<span class="tag ai-tag">${esc(x)}</span>`).join("")}</div></td>
      <td class="ai-logic-cell"><div class="ai-boundary">${esc(t.automationBoundary)}</div>${renderAiEmbedPoints(t.aiEmbedPoints,true)}</td>
      <td><span class="tag value-tag">${esc(t.value)}</span></td>
      <td><span class="tag nature-tag">${esc(t.nature)}</span></td>
      <td>${tagLevels(t.levels)}</td>
      <td>${renderRaci(t)}</td>
      <td><span class="tag flow-tag">${esc(t.process)}</span></td>
    </tr>`;
  }).join("");
  document.querySelectorAll("#taskTableBody tr").forEach(r=>r.onclick=()=>openDetail(DATA.tasks[Number(r.dataset.i)]));
  const cards=document.getElementById("cardList");
  cards.innerHTML=items.map(t=>{
    const d=domainById[t.domain],idx=DATA.tasks.indexOf(t);
    return `<article class="task-card" data-i="${idx}"><h3>${esc(t.name)}</h3><div class="meta">
      <span class="tag domain-tag" style="--c:${d.color}">${d.id} ${esc(d.short)}</span>
      <span class="tag value-tag">${esc(t.value)}</span><span class="tag nature-tag">${esc(t.nature)}</span><span class="ai-fit ${fitClass(t.aiFit)}">${esc(t.aiFit)}</span>${taskAiCaps(t).map(x=>`<span class="tag ai-tag">${esc(x)}</span>`).join("")}
      </div><dl><dt>任务结构</dt><dd><div class="card-task-structure"><div><b>输入：</b>${esc(t.object)}</div><div><b>动作：</b>${esc(t.action)}</div><div><b>输出：</b>${esc(t.output)}</div></div></dd><dt>AI适用判断</dt><dd><span class="ai-fit ${fitClass(t.aiFit)}">${esc(t.aiFit)}</span><div class="ai-boundary">${esc(t.automationBoundary)}</div></dd><dt>AI能力</dt><dd>${taskAiCaps(t).map(x=>`<span class="tag ai-tag">${esc(x)}</span>`).join("")}</dd><dt>AI场景嵌入点</dt><dd>${renderAiEmbedPoints(t.aiEmbedPoints)}</dd><dt>所属流程</dt><dd>${esc(t.process)}</dd><dt>人员层级</dt><dd>${esc(t.levels.join("、"))}</dd><dt>角色责任</dt><dd>${["A","R","C","I"].map(k=>`${k}：${esc(((t.raci&&t.raci[k])||[]).join("、")||"—")}`).join("<br>")}</dd></dl></article>`;
  }).join("");
  cards.querySelectorAll(".task-card").forEach(c=>c.onclick=()=>openDetail(DATA.tasks[Number(c.dataset.i)]));
  const empty=document.getElementById("emptyState");
  empty.style.display=items.length?"none":"block";
  document.getElementById("tableWrap").style.display=state.view==="table"&&items.length?"block":"none";
  cards.style.display=state.view==="card"&&items.length?"grid":"none";
}
function syncControls(){
  document.getElementById("pillarFilter").value=state.pillar;
  document.getElementById("domainFilter").value=state.domain;
  document.getElementById("processFilter").value=state.process;
  document.getElementById("roleFilter").value=state.role;
  document.getElementById("localSearch").value=state.search;
  document.getElementById("globalSearch").value=state.search;
  renderChips("valueChips",DATA.valueDepths,"value");
  renderChips("natureChips",DATA.natureDefs.map(x=>x.name),"nature");
  renderChips("levelChips",levelOrder,"level");
  renderChips("aiChips",DATA.aiCaps,"ai");
  document.getElementById("tableViewBtn").classList.toggle("active",state.view==="table");
  document.getElementById("cardViewBtn").classList.toggle("active",state.view==="card");
}
function renderAll(){renderDomains();renderAIOverview();syncControls();renderTasks();saveState();}
function openDetail(t){
  const d=domainById[t.domain];
  const dom=document.getElementById("modalDomain");
  dom.className="tag domain-tag";dom.style.setProperty("--c",d.color);dom.textContent=`${d.id} ${d.name}`;
  document.getElementById("modalTitle").textContent=t.name;
  const taskStructureHtml=`<div class="detail-task-structure"><div><b>输入</b><span>${esc(t.object)}</span></div><div><b>动作</b><span>${esc(t.action)}</span></div><div><b>输出</b><span>${esc(t.output)}</span></div></div>`;
  const rows=[
    ["四大支柱",t.pillar],["财务任务角色",t.nature],["任务结构",taskStructureHtml,true],["AI适用判断",`<span class="ai-fit ${fitClass(t.aiFit)}">${esc(t.aiFit)}</span><div class="ai-boundary">${esc(t.automationBoundary)}</div>`,true],["AI能力",taskAiCaps(t).map(x=>`<span class="tag ai-tag">${esc(x)}</span>`).join(""),true],["AI场景嵌入点",renderAiEmbedPoints(t.aiEmbedPoints),true],["所属流程",t.process],
    ["价值深度",t.value],["适配层级",t.levels.join("、")],["A 最终负责",((t.raci&&t.raci.A)||[]).join("、")],["R 执行",((t.raci&&t.raci.R)||[]).join("、")],["C 协同",((t.raci&&t.raci.C)||[]).join("、")],["I 知会",((t.raci&&t.raci.I)||[]).join("、")]
  ];
  document.getElementById("detailGrid").innerHTML=rows.map(([k,v,isHtml])=>`<div class="k">${esc(k)}</div><div class="v">${isHtml?v:esc(v)}</div>`).join("");
  document.getElementById("modalFormula").innerHTML=`<b>原子任务结构：</b>输入“${esc(t.object)}”，执行“${esc(t.action)}”，依据企业制度、会计政策、业务规则或监管要求，输出“${esc(t.output)}”。`;
  document.getElementById("detailModal").classList.add("open");
}
function closeModal(){document.getElementById("detailModal").classList.remove("open");}
function exportCSV(){
  const items=filteredTasks();
  const head=["能力域","原子任务","任务结构（输入→动作→输出）","AI适用判断","AI应用边界","AI能力","AI场景嵌入点","价值深度","财务任务角色","人员层级","A最终负责","R执行","C协同","I知会","流程"];
  const rows=items.map(t=>[domainById[t.domain].name,t.name,`输入：${t.object}｜动作：${t.action}｜输出：${t.output}`,t.aiFit,t.automationBoundary,taskAiCaps(t).join("；"),(t.aiEmbedPoints||[]).map(p=>`${p.capability}：${p.text}`).join("；"),t.value,t.nature,t.levels.join("；"),(t.raci.A||[]).join("；"),(t.raci.R||[]).join("；"),(t.raci.C||[]).join("；"),(t.raci.I||[]).join("；"),t.process]);
  const csv=[head,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="企业财务原子任务_当前筛选.csv";a.click();URL.revokeObjectURL(a.href);
}

function inferRoleProfile(role,linked){
  const domains=uniq(linked.map(x=>domainById[x.task.domain].name)).slice(0,4);
  const processes=uniq(linked.map(x=>x.task.process)).slice(0,5);
  const levels=uniq(linked.flatMap(x=>x.task.levels));
  return {
    positioning:`该角色通过RACI责任关系参与${linked.length}项原子任务，主要覆盖${domains.join("、")||"相关财务能力"}。`,
    levels:levels,
    scope:[...domains,...processes].slice(0,7),
    outputs:uniq(linked.map(x=>x.task.output)).slice(0,6),
    boundary:"本画像由任务库中的责任关系自动归纳，用于理解角色责任组合；同一人员可以兼任多个角色，企业可结合规模和授权体系合并或拆分。"
  };
}
function renderRoleExplorer(){
  const input=document.getElementById("roleViewInput");
  if(!input)return;
  const role=(roleViewRole||"").trim();
  if(role)input.value=role;
  const linked=DATA.tasks.map(task=>({task,relations:relationForRole(task,role)})).filter(x=>x.relations.length);
  const profile=(DATA.roleProfiles&&DATA.roleProfiles[role])||inferRoleProfile(role,linked);
  const profilePanel=document.getElementById("roleProfilePanel");
  const taskPanel=document.getElementById("roleTaskPanel");
  if(!role){
    profilePanel.innerHTML="";taskPanel.innerHTML='<div class="role-no-result">请选择或搜索一个财务角色。</div>';return;
  }
  profilePanel.innerHTML=`<div class="role-profile">
    <div class="role-profile-head">
      <div><h3>${esc(role)}</h3><div class="role-positioning">${esc(profile.positioning)}</div></div>
      <div class="role-levels">${(profile.levels||[]).map(x=>`<span class="tag level-tag">${esc(x)}</span>`).join("")}</div>
    </div>
    <div class="role-profile-grid">
      <div class="profile-box"><b>主要职责范围</b><div>${(profile.scope||[]).map(x=>`<span class="tag role-tag">${esc(x)}</span>`).join("")}</div></div>
      <div class="profile-box"><b>典型交付成果</b><ul class="profile-list">${(profile.outputs||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="profile-box"><b>责任关系说明</b><ul class="profile-list"><li>A：对结果最终负责</li><li>R：直接执行任务</li><li>C：参与协同与专业输入</li><li>I：需要知悉结果</li></ul></div>
    </div>
    <div class="role-boundary"><b>角色边界：</b>${esc(profile.boundary||"")}</div>
  </div>`;
  if(!linked.length){
    taskPanel.innerHTML=`<div class="role-no-result">当前任务库中尚未建立“${esc(role)}”的责任关联。角色未建立关联，不代表企业不能设置、合并或由其他人员兼任。</div>`;
    return;
  }
  const counts={A:0,R:0,C:0,I:0};
  linked.forEach(x=>x.relations.forEach(k=>counts[k]++));
  const rows=linked.sort((a,b)=>{
    const order={A:0,R:1,C:2,I:3};
    return Math.min(...a.relations.map(x=>order[x]))-Math.min(...b.relations.map(x=>order[x])) ||
      a.task.domain.localeCompare(b.task.domain) || a.task.name.localeCompare(b.task.name,"zh-CN");
  });
  taskPanel.innerHTML=`<div class="role-stats">
    ${["A","R","C","I"].map(k=>`<div class="role-stat"><div class="n">${counts[k]}</div><div class="t">${k==="A"?"最终负责":k==="R"?"执行":k==="C"?"协同":"知会"}任务</div></div>`).join("")}
  </div>
  <div class="role-task-head"><h4>关联原子任务（${linked.length}项）</h4><div class="role-task-note">同一任务可能同时具有多种责任关系</div></div>
  <div class="role-task-table-wrap"><table class="role-task-table"><thead><tr><th>责任</th><th>能力域</th><th>原子任务</th><th>流程</th><th>人员层级</th><th>主要输出</th></tr></thead><tbody>
    ${rows.map(x=>{const d=domainById[x.task.domain];return `<tr data-role-task="${DATA.tasks.indexOf(x.task)}">
      <td><div class="relation-badge">${x.relations.map(k=>`<span class="${k}">${k}</span>`).join("")}</div></td>
      <td><span class="tag domain-tag" style="--c:${d.color}">${d.id} ${esc(d.short)}</span></td>
      <td class="task-name">${esc(x.task.name)}</td><td>${esc(x.task.process)}</td>
      <td>${tagLevels(x.task.levels)}</td><td>${esc(x.task.output)}</td></tr>`}).join("")}
  </tbody></table></div>`;
  taskPanel.querySelectorAll("[data-role-task]").forEach(r=>r.onclick=()=>openDetail(DATA.tasks[Number(r.dataset.roleTask)]));
}
function initRoleExplorer(){
  const input=document.getElementById("roleViewInput");
  const panel=document.getElementById("roleOptionsPanel");
  const arrow=document.getElementById("roleDropdownBtn");
  const combo=document.getElementById("roleCombobox");
  const roles=allRoles();
  function draw(filter=""){
    const q=filter.trim().toLowerCase();
    const list=roles.filter(r=>!q||r.toLowerCase().includes(q));
    panel.innerHTML=list.length?list.map(r=>{
      const count=DATA.tasks.filter(t=>taskRoles(t).includes(r)).length;
      return `<button type="button" class="role-option ${r===roleViewRole?"active":""}" data-role="${esc(r)}"><span>${esc(r)}</span><small>${count}项任务</small></button>`;
    }).join(""):'<div class="role-option-empty">没有匹配角色，可继续输入完整名称。</div>';
    panel.querySelectorAll(".role-option").forEach(btn=>btn.onclick=()=>{
      roleViewRole=btn.dataset.role;input.value=roleViewRole;panel.classList.remove("open");renderRoleExplorer();
    });
  }
  function openPanel(){draw(input.value);panel.classList.add("open");}
  input.value="";
  input.addEventListener("focus",openPanel);
  input.addEventListener("click",openPanel);
  input.addEventListener("input",()=>{roleViewRole="";draw(input.value);panel.classList.add("open");});
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      const exact=roles.find(r=>r===input.value.trim())||roles.find(r=>r.toLowerCase()===input.value.trim().toLowerCase());
      if(exact){roleViewRole=exact;input.value=exact;panel.classList.remove("open");renderRoleExplorer();}
    }
    if(e.key==="Escape")panel.classList.remove("open");
  });
  arrow.onclick=()=>{panel.classList.contains("open")?panel.classList.remove("open"):openPanel();input.focus();};
  document.addEventListener("click",e=>{if(!combo.contains(e.target))panel.classList.remove("open");});
  draw();renderRoleExplorer();
}

function saveState(){try{localStorage.setItem("financeLandscapeState",JSON.stringify(state));}catch(e){}}
function loadState(){try{const x=JSON.parse(localStorage.getItem("financeLandscapeState")||"null");if(x)Object.assign(state,x);if(state.nature&&!DATA.natureDefs.some(d=>d.name===state.nature))state.nature="";}catch(e){}}

fillSelect("pillarFilter",DATA.pillars);
fillSelect("domainFilter",DATA.domains,d=>`${d.id} ${d.name}`,d=>d.id);
fillSelect("processFilter",uniq(DATA.tasks.map(t=>t.process)));
fillSelect("roleFilter",allRoles());
loadState();
document.getElementById("pillarFilter").onchange=e=>{state.pillar=e.target.value;renderAll();};
document.getElementById("domainFilter").onchange=e=>{state.domain=e.target.value;renderAll();};
document.getElementById("processFilter").onchange=e=>{state.process=e.target.value;renderAll();};
document.getElementById("roleFilter").onchange=e=>{state.role=e.target.value;renderAll();};
document.getElementById("localSearch").oninput=e=>{state.search=e.target.value;document.getElementById("globalSearch").value=state.search;renderTasks();saveState();};
document.getElementById("globalSearch").oninput=e=>{state.search=e.target.value;document.getElementById("localSearch").value=state.search;renderTasks();saveState();};
document.getElementById("clearAiOverview").onclick=()=>{
  state.ai="";
  renderAll();
  document.getElementById("explorer").scrollIntoView({behavior:"smooth",block:"start"});
};
document.getElementById("resetBtn").onclick=()=>{Object.assign(state,{pillar:"",domain:"",process:"",value:"",nature:"",level:"",role:"",ai:"",search:""});renderAll();};
document.getElementById("tableViewBtn").onclick=()=>{state.view="table";renderAll();};
document.getElementById("cardViewBtn").onclick=()=>{state.view="card";renderAll();};
document.getElementById("exportBtn").onclick=exportCSV;
document.getElementById("modalClose").onclick=closeModal;
document.getElementById("detailModal").onclick=e=>{if(e.target.id==="detailModal")closeModal();};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  document.getElementById(b.dataset.target).scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("taskCountStat").textContent=DATA.tasks.length;renderCrosswalk();renderLevels();renderAll();initRoleExplorer();
