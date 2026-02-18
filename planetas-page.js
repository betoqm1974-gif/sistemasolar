const planetas = window.PLANETAS;
const lista = document.querySelector("#lista");
const tipo = document.querySelector("#tipo");
const clearBtn = document.querySelector("#clearFilters");
const q = document.querySelector("#q");
const live = document.querySelector("#live");

const PAGINAS_PLANETAS = {
  mercurio: "mercurio.html",
  jupiter: "jupiter.html",
  terra: "terra.html",
  urano: "urano.html",
  marte: "marte.html",
  venus: "venus.html",
  saturno: "Saturno.html",
  neptuno: "Neptuno.html"
};

function hrefPlaneta(id){
  const key = String(id || "").toLowerCase();
  return PAGINAS_PLANETAS[key] || ("planeta.html?id=" + encodeURIComponent(id));
}


function render(){
  const t = tipo.value;
  const term = q.value.trim().toLowerCase();

  const filtrados = planetas.filter(p => {
    const okTipo = (t === "todos") || (p.tipo === t);
    const text = (p.nome + " " + p.curiosidades.join(" ")).toLowerCase();
    const okTerm = !term || text.includes(term);
    return okTipo && okTerm;
  });

  lista.innerHTML = "";
  filtrados.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("role","listitem");
    card.dataset.name = p.nome;

    card.innerHTML = `
      <a class="planet-thumb" href="${hrefPlaneta(p.id)}" aria-label="${p.nome}">
        <img src="${p.imagem}" alt="${p.alt}">
        <span class="badge planet-type planet-type-overlay" tabindex="0" role="button" aria-label="${p.tipo}">${p.tipo}</span>
        <span class="planet-name-overlay" aria-hidden="true">${p.nome}</span>
      </a>
    `;

    // Hover do "tipo" com voz (mantém comportamento atual)
    const typeEl = card.querySelector(".planet-type");
    if(typeEl){
      typeEl.addEventListener("mouseenter", ()=>{
        if(window.__TTS && window.__TTS.isEnabled && window.__TTS.isEnabled()){
          window.__TTS.toggleSpeak(p.tipo, false);
        }
      });
    }

    lista.appendChild(card);
  });


  // FIX130_hover: ao passar o rato, ler nome do planeta / tipo (sem clicar)
  const canHoverSpeak = () => {
    try{
      const v = localStorage.getItem("tts_click_enabled");
      const enabled = (v === null) ? true : (v === "1");
      if(!enabled) return false;
      if(!("speechSynthesis" in window)) return false;
      if(window.speechSynthesis.speaking || window.speechSynthesis.paused) return false;
      return !!window.__TTS;
    }catch(e){ return false; }
  };
  const speakHover = (t) => { if(canHoverSpeak()) window.__TTS.toggleSpeak(t, false); };

  // Delegação: cards
  lista.querySelectorAll(".card").forEach(card=>{
    const name = (card.dataset.name || card.querySelector(".planet-name-overlay")?.textContent || card.querySelector("h2 a")?.textContent || "").trim();
    const thumb = card.querySelector(".planet-thumb");
    const badge = card.querySelector(".planet-type");
    if(thumb){
      thumb.addEventListener("pointerenter", ()=>{ thumb.classList.add("is-hover"); if(name) speakHover(name); });
      thumb.addEventListener("focus", ()=>{ thumb.classList.add("is-hover"); if(name) speakHover(name); });
      thumb.addEventListener("pointerleave", ()=>{ thumb.classList.remove("is-hover"); });
      thumb.addEventListener("blur", ()=>{ thumb.classList.remove("is-hover"); });
    }
    const details = card.querySelector("a.say");
    if(details){
      details.addEventListener("pointerenter", ()=>{ details.classList.add("is-hover"); speakHover("Ver detalhes"); });
      details.addEventListener("pointerleave", ()=>{ details.classList.remove("is-hover"); });
      details.addEventListener("focus", ()=>{ details.classList.add("is-hover"); speakHover("Ver detalhes"); });
      details.addEventListener("blur", ()=>{ details.classList.remove("is-hover"); });
    }
    // FIX132_hover_ver_detalhes
    if(badge){
      const tipoTxt = (badge.textContent||"").trim();
      badge.addEventListener("pointerenter", ()=>{ if(tipoTxt) speakHover(tipoTxt); badge.classList.add("is-hover"); });
      badge.addEventListener("pointerleave", ()=>{ badge.classList.remove("is-hover"); });
      badge.addEventListener("focus", ()=>{ if(tipoTxt) speakHover(tipoTxt); badge.classList.add("is-hover"); });
      badge.addEventListener("blur", ()=>{ badge.classList.remove("is-hover"); });
      badge.addEventListener("click", (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); }catch(_e){}
        try{
          const pEl = card.querySelector("p");
          const txt = pEl ? (pEl.innerText||pEl.textContent||"").replace(/\s+/g," ").trim() : "";
          if(txt && window.__TTS){ window.__TTS.toggleSpeak(txt, true); }
        }catch(_e){}
      }); // FIX131_click_type_reads_fact
    }
  });

  if (live) live.textContent = `A mostrar ${filtrados.length} planeta${filtrados.length===1?"":"s"}.`;
}

tipo.addEventListener("change", ()=>{
    render();
    try{
      const sel = tipo.options[tipo.selectedIndex];
      const txt = (sel ? (sel.textContent||sel.label||"") : "").trim();
      if(txt && window.__TTS && ("speechSynthesis" in window)){
        // respeitar o interruptor de leitura
        const v = localStorage.getItem("tts_click_enabled");
        const enabled = (v === null) ? true : (v === "1");
        if(enabled) window.__TTS.toggleSpeak(txt, false);
      }
    }catch(e){}
  }); // FIX144_speak_filter_choice
  if(clearBtn){
    clearBtn.addEventListener("click", ()=>{
      if(tipo) tipo.value = "todos";
      if(q) q.value = "";
      render();
      // focar o campo de pesquisa
      try{ q && q.focus(); }catch(e){}
    });
  }
q.addEventListener("input", render);
render();
