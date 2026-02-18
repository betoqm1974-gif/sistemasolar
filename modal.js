(function(){
  function qs(sel, el=document){ return el.querySelector(sel); }
  function qsa(sel, el=document){ return Array.from(el.querySelectorAll(sel)); }

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "modal";
  backdrop.setAttribute("aria-hidden","true");
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalDesc">
      <div class="modal-header">
        <h2 id="modalTitle">Conteúdo</h2>
        <div class="modal-tools">
          <button type="button" class="btn" id="zoomOut" aria-label="Reduzir zoom">−</button>
          <button type="button" class="btn" id="zoomReset" aria-label="Repor zoom">1×</button>
          <button type="button" class="btn" id="zoomIn" aria-label="Aumentar zoom">+</button>
          <button type="button" class="btn" id="readDesc" aria-label="Ler descrição" data-speak-female="modalDesc">Ler descrição</button>
          <button type="button" class="btn" id="modalClose" aria-label="Fechar popup">Fechar</button>
        </div>
      </div>
      <p id="modalDesc" class="small"></p>
      <div class="modal-body" id="modalBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const panel   = qs(".modal", backdrop);
  const titleEl = qs("#modalTitle", backdrop);
  const descEl  = qs("#modalDesc", backdrop);
  const bodyEl  = qs("#modalBody", backdrop);
  const btnClose= qs("#modalClose", backdrop);
  const zoomIn  = qs("#zoomIn", backdrop);
  const zoomOut = qs("#zoomOut", backdrop);
  const zoomReset = qs("#zoomReset", backdrop);
  const readDesc = qs("#readDesc", backdrop);

  let lastFocus = null;
  let scale = 1;

  function setScale(v){
    scale = Math.max(1, Math.min(3, v));
    const media = qs(".modal-media", bodyEl);
    if(media){
      media.style.transform = `scale(${scale})`;
      zoomReset.textContent = `${scale.toFixed(1).replace(".0","")}×`;
    }
  }

  function closeModal(){
    backdrop.setAttribute("aria-hidden","true");
    panel.classList.remove("modal-xl");
    bodyEl.innerHTML = "";
    setScale(1);
    try{ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); }catch(_){ }
    lastFocus = null;
  }

  function openModal({type, src, title, desc, alt, size}){
    lastFocus = document.activeElement;
    backdrop.setAttribute("aria-hidden","false");
    panel.classList.toggle("modal-xl", size === "xl");

    titleEl.textContent = title || "Conteúdo";
    descEl.textContent = desc || "";

    // ler descrição automaticamente (se disponível)
    try{ if(window.__TTS && window.__TTS.speakFemale && descEl.textContent){ window.__TTS.speakFemale(descEl.textContent); } }catch(_){ }

    bodyEl.innerHTML = "";
    setScale(1);

    if(type === "image"){
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt || title || "Imagem";
      img.className = "modal-media";
      bodyEl.appendChild(img);
    } else if(type === "video"){
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = title || "Vídeo";
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.className = "modal-media";
      bodyEl.appendChild(iframe);
    }

    // Focus close for keyboard users
    setTimeout(()=>{ try{ btnClose.focus(); }catch(_){} }, 60);
  }

  function getTriggerData(btn){
    return {
      type: btn.dataset.modalType || "image",
      src: btn.dataset.modalSrc || "",
      title: btn.dataset.modalTitle || "",
      desc: btn.dataset.modalDesc || "",
      alt: btn.dataset.modalAlt || "",
      size: btn.dataset.modalSize || ""
    };
  }

  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-modal-type]");
    if(btn){
      e.preventDefault();
      openModal(getTriggerData(btn));
      return;
    }
    if(e.target === backdrop){
      closeModal();
    }
  });

  btnClose.addEventListener("click", closeModal);
  zoomIn.addEventListener("click", ()=>setScale(scale + 0.2));
  zoomOut.addEventListener("click", ()=>setScale(scale - 0.2));
  zoomReset.addEventListener("click", ()=>setScale(1));

  document.addEventListener("keydown", (e)=>{
    if(backdrop.getAttribute("aria-hidden") === "true") return;
    if(e.key === "Escape"){
      e.preventDefault();
      closeModal();
    }
    // basic focus trap
    if(e.key === "Tab"){
      const focusables = qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel)
        .filter(el => !el.hasAttribute("disabled"));
      if(!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length-1];
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }
  });

// FIX107_close_speak: ler "Fechar pop-up" ao clicar em Fechar
document.addEventListener("click", (e)=>{
  const btn = e.target && e.target.closest ? e.target.closest("#modalClose") : null;
  if(!btn) return;
  try{
    if(window.__TTS && typeof window.__TTS.toggleSpeak==="function"){
      window.__TTS.toggleSpeak("Fechar pop-up", true);
    }else{
      const u=new SpeechSynthesisUtterance("Fechar pop-up");
      u.lang="pt-PT";
      window.speechSynthesis.speak(u);
    }
  }catch(err){}
}, true);
  // FIX110_CLOSE_ONCLICK: garantir que "Fechar pop-up" é lido 1x e mesmo durante leitura
  try{
    let _closeGuard = 0;
    btnClose.onclick = (e)=>{
      try{ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }catch(_e){}
      const now = Date.now();
      if(now - _closeGuard < 500){ return false; } // evita duplicações
      _closeGuard = now;

      // parar qualquer leitura atual
      try{ window.speechSynthesis.cancel(); }catch(_e){}
      try{ if(window.__TTS && typeof window.__TTS.stop === "function"){ window.__TTS.stop(); } }catch(_e){}

      let closed = false;
      const doClose = ()=>{
        if(closed) return;
        closed = true;
        try{ closeModal(); }catch(_e){}
      };

      try{
        const u = new SpeechSynthesisUtterance("Fechar pop-up");
        u.lang = "pt-PT";
        u.onend = ()=>{ setTimeout(doClose, 30); };
        u.onerror = ()=>{ setTimeout(doClose, 30); };
        window.speechSynthesis.speak(u);
        // fallback: se não disparar onend, fecha ao fim de 900ms
        setTimeout(doClose, 900);
      }catch(_e){
        setTimeout(doClose, 30);
      }
      return false;
    };
  }catch(e){}

  // FIX111_ZOOM_SPEAK: voz consistente nos botões de zoom (1x, mesmo durante leitura)
  try{
    function _speakOnce(label){
      try{ window.speechSynthesis.cancel(); }catch(_e){}
      try{
        const u = new SpeechSynthesisUtterance(label);
        u.lang = "pt-PT";
        window.speechSynthesis.speak(u);
      }catch(_e){}
    }
    function _guardedAction(btn, label, actionFn){
      if(!btn) return;
      let last = 0;
      btn.onclick = (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }catch(_e){}
        const now = Date.now();
        if(now - last < 350) return false;
        last = now;
        _speakOnce(label);
        try{ actionFn(); }catch(_e){}
        return false;
      };
    }
    _guardedAction(qs("#zoomIn"), "Ampliar", ()=>zoomBy(1.2));
    _guardedAction(qs("#zoomOut"), "Reduzir", ()=>zoomBy(1/1.2));
    _guardedAction(qs("#zoomReset"), "Repor zoom", ()=>resetZoom());
  }catch(e){}

})();