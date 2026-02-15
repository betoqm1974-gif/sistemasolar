(function(){
  // Botões "Ler" (voz): comportamento normal em todas as páginas.
  // Na Home (index.html): apenas botões nos títulos; ao clicar lê o título + parágrafos/itens da secção.
  // Curiosidades (Home): 1 botão por curiosidade (alinhado à direita) que lê o título+texto da curiosidade.

  function makeButton(textProvider, {label="Ler"} = {}){
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn read-btn";
    b.textContent = label;
    b.setAttribute("aria-label","Ler texto");
    b.addEventListener("click", (ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      const t = (typeof textProvider === "function") ? textProvider() : "";
      const text = (t||"").replace(/\s+/g," ").trim();
      if(!text) return;
      try{
        if(window.__TTS && window.__TTS.toggleSpeak) window.__TTS.toggleSpeak(text, true);
        else if(window.__TTS && window.__TTS.speakFemale) window.__TTS.speakFemale(text);
      }catch(_){}
    });
    return b;
  }

  function isHome(){
    const path = (location.pathname||"").toLowerCase();
    return path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("index.html") || document.body.classList.contains("page-home");
  }

  function getSectionTextFromHeading(h){
    // SPECIAL_HOME_H1: na Home, o H1 "Sistema Solar" deve ler apenas o parágrafo de introdução (introText).
    try{
      if(isHome() && (h.tagName||"").toUpperCase()==="H1"){
        const intro = document.getElementById("introText");
        const title = (h.textContent||"").trim();
        const body = (intro ? (intro.innerText||intro.textContent||"") : "").replace(/\s+/g," ").trim();
        if(title && body) return title + "… " + body;
      }
    }catch(e){}

    // recolhe texto a partir de um heading até ao próximo heading do mesmo nível (ou superior)
    const level = parseInt(h.tagName.substring(1), 10) || 2;
    const parts = [];
    parts.push((h.textContent || "") + "…");

    let el = h.parentElement; // read-heading wrapper
    // procurar o nó "real" a seguir ao wrapper
    let next = el.nextElementSibling;

    while(next){
      // se encontrarmos um H1/H2/H3... termina conforme nível
      const tag = (next.tagName || "").toUpperCase();
      if(/^H[1-6]$/.test(tag)){
        const nl = parseInt(tag.substring(1), 10);
        if(nl <= level) break;
      }
      // se for um bloco com lista ou parágrafos, recolher texto
      const text = (next.innerText || next.textContent || "").trim();
      if(text){
        // remover rótulos de botões "Ler" eventualmente presentes (fallback)
        parts.push(text.replace(/\bLer\b/g, "").replace(/\s+/g," ").trim());
      }
      next = next.nextElementSibling;
    }

    return parts.join(" ");
  }

  function enhanceHeading(el, homeMode=false){
    if(el.closest("nav, header")) return;
    if(el.classList.contains("no-read")) return;
    if(el.parentElement && el.parentElement.classList && el.parentElement.classList.contains("read-heading")) return;

    const wrap = document.createElement("div");
    wrap.className = "read-heading";
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);

    const provider = homeMode
      ? ()=>((el.id==="titCuriosidades") ? el.textContent : getSectionTextFromHeading(el))
      : ()=>{
          const title = (el.textContent||"").trim();
          if((el.id||"")==="planetasTitle"){
            const introEl = document.querySelector("#planetasIntro");
            const intro = introEl ? (introEl.innerText || introEl.textContent || "").replace(/\s+/g," ").trim() : "";
            if(intro){
              // pausa maior entre título e frase
              return (title.replace(/[\.!?]\s*$/,"") + ". " + " ".repeat(10) + intro).replace(/\s+/g," ").trim();
            }
          }
          if((el.id||"")==="titVideos"){
            try{
              const sec = el.closest("section");
              const instrEl = sec ? sec.querySelector("p.video-instr") : document.querySelector("p.video-instr");
              const instr = instrEl ? (instrEl.innerText || instrEl.textContent || "").replace(/\s+/g," ").trim() : "";
              if(instr){
                return (title.replace(/[\.!?]\s*$/,"") + ". " + " ".repeat(10) + instr).replace(/\s+/g," ").trim();
              }
            }catch(e){}
          }

          
          // FIX133_force_card_read: em cartões de planeta, ler também a curiosidade (primeiro parágrafo)
          try{
            const card = el.closest ? el.closest(".card") : null;
            if(card){
              const p = card.querySelector("p.no-read") || card.querySelector("p");
              const t = p ? (p.innerText||p.textContent||"").replace(/\s+/g," ").trim() : "";
              if(t) return (title.replace(/[\.!?]\s*$/,"") + ". " + " ".repeat(10) + t).replace(/\s+/g," ").trim();
            }
          }catch(e){}
return title;
        }; // FIX128_planetas_title_reads_intro
    const btn = makeButton(provider);
    btn.classList.add("read-btn-heading");
    wrap.appendChild(btn);

    el.setAttribute("tabindex","0");
  }

  function enhancePara(el){
    if(el.closest("nav, header, footer")) return;
    if(el.classList.contains("no-read")) return;
    if(el.querySelector && (el.querySelector("#backToTopRight") || el.querySelector("#backToTopLeft"))) return;
    if(el.querySelector && el.querySelector(".read-btn")) return;
    const txt = (el.textContent||"").trim();
    if(!txt) return;

    const wrap = document.createElement("div");
    wrap.className = "read-row";
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
    wrap.appendChild(makeButton(()=>el.textContent));
  }

  function enhanceLi(li){
    if(li.closest("nav, header, footer")) return;
    if(li.classList.contains("no-read")) return;
    if(li.querySelector && li.querySelector(".read-btn")) return;

    const txt = (li.textContent||"").replace(/\s+/g," ").trim();
    if(!txt) return;

    const inner = document.createElement("div");
    inner.className = "read-li-inner";

    const span = document.createElement("span");
    span.className = "li-text";
    span.textContent = txt;

    inner.appendChild(span);
    inner.appendChild(makeButton(()=>span.textContent));

    li.innerHTML = "";
    li.classList.add("read-li");
    li.appendChild(inner);
  }

  function enhanceHomeCuriosidades(main){
    const facts = main.querySelectorAll(".facts .fact");
    facts.forEach((card)=>{
      if(card.querySelector(".fact-read")) return;
      const h3 = card.querySelector("h3");
      const p  = card.querySelector("p");
      if(!h3 && !p) return;

      const btn = makeButton(()=>`${h3 ? (h3.textContent + "…") : ""} ${p ? p.textContent : ""}`);
      btn.classList.add("fact-read");
      // colocar alinhado à direita no topo do cartão
      const head = document.createElement("div");
      head.className = "fact-head";
      head.appendChild(btn);
      card.insertBefore(head, card.firstChild);
    });
  }

  function run(){
    const main = document.querySelector("main");
    if(!main) return;

    const homeMode = isHome();

    // headings sempre com botão (na home, lê a secção completa)
    main.querySelectorAll("h1, h2").forEach(h => enhanceHeading(h, homeMode));

    if(homeMode){
      // Home: não colocar botões "Ler" em todos os parágrafos - apenas curiosidades com 1 botão por cartão
      enhanceHomeCuriosidades(main);
      return;
    }

    // Outras páginas: mantém comportamento geral (parágrafos + listas)
    main.querySelectorAll("p").forEach(enhancePara);
    main.querySelectorAll("li").forEach(enhanceLi);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

// FIX99_FALLBACK: garantir leitura em botões com data-read (ex.: ajuda da imagem na Home)
document.addEventListener("click", (e)=>{
  const btn = e.target && e.target.closest ? e.target.closest("button[data-read]") : null;
  if(!btn) return;
  if(btn.classList && btn.classList.contains("read-btn")) return; // já tratado
  try{
    if(window.__TTS && typeof window.__TTS.toggleSpeak === "function"){
      const sel = (btn.getAttribute("data-read")||"").trim();
      if(!sel) return;
      const nodes = sel.split(",").map(s=>document.querySelector(s.trim())).filter(Boolean);
      const pauseMs = parseInt(btn.getAttribute("data-read-pause")||"0",10) || 0;
      const parts = nodes.map(n => (n.innerText || n.textContent || "")).map(t=>(t||"").replace(/\s+/g," ").trim()).filter(Boolean);
      const text = parts.join(" ").replace(/\s+/g," ").trim();
      if(pauseMs>0 && parts.length>=2){
        // inserir pausa audível simples: pontuação + espaço extra
        const first = parts[0].replace(/[\.!?]\s*$/,"");
        const rest = parts.slice(1).join(" ");
        const withPause = (first + ". " + " ".repeat(6) + rest).replace(/\s+/g," ").trim();
        if(withPause) { window.__TTS.toggleSpeak(withPause, true); return; }
      }
      
      if(text) window.__TTS.toggleSpeak(text, true);
      // FIX124_pause

    }
  }catch(err){}
}, true);

// FIX127_planetas_intro

// FIX130_card_heading_reads_next

// FIX132_card_read_curiosity

// FIX133_force_card_read
