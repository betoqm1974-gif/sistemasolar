
// hover-speak.js - fala ao passar o rato/foco (sem clicar)
// FIX146_media_thumbs
// respeita o interruptor de leitura (localStorage tts_click_enabled)
(function(){
  const getEnabled = () => {
    try{
      const v = localStorage.getItem("tts_click_enabled");
      return (v === null) ? true : (v === "1");
    }catch(e){ return true; }
  };

  const canSpeak = () => {
    try{
      if(!getEnabled()) return false;
      if(!("speechSynthesis" in window)) return false;
      if(!window.__TTS || typeof window.__TTS.toggleSpeak !== "function") return false;
      // Não interromper leitura em curso: só fala em hover se não estiver a falar
      if(window.speechSynthesis.speaking || window.speechSynthesis.paused) return false;
      return true;
    }catch(e){ return false; }
  };

  const speakOnce = (el, text) => {
    if(!text || !canSpeak()) return;
    const now = Date.now();
    const last = parseInt(el.dataset.lastSpeak || "0", 10) || 0;
    if(now - last < 900) return; // anti-repetição
    el.dataset.lastSpeak = String(now);
    window.__TTS.toggleSpeak(text, false);
  };

  const planetNameFromBg = (bg) => {
    if(!bg) return "";
    const base = bg.split("/").pop().split("?")[0].toLowerCase();
    const map = {
      "mercurio.png":"Mercúrio",
      "venus.png":"Vénus",
      "terra.png":"Terra",
      "marte.png":"Marte",
      "jupiter.png":"Júpiter",
      "saturno.png":"Saturno",
      "urano.png":"Urano",
      "neptuno.png":"Neptuno",
      "02-sol.png":"Sol",
      "sol.png":"Sol"
    };
    return map[base] || "";
  };

  const addHover = (el, text) => {
    if(!el) return;
    const onEnter = () => { el.classList.add("is-hover"); speakOnce(el, text); };
    const onLeave = () => { el.classList.remove("is-hover"); };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focus", onEnter);
    el.addEventListener("blur", onLeave);
  };

  document.addEventListener("DOMContentLoaded", ()=>{
    // Imagem principal (Home)
    document.querySelectorAll('[data-hover-say]').forEach(el=>{
      const t = (el.getAttribute("data-hover-say")||"").trim();
      if(t) addHover(el, t);
    });

    // Curiosidades (Home) - ler nome do planeta com base na imagem de fundo
    document.querySelectorAll('.fact').forEach(f=>{
      const bg = f.getAttribute("data-bg") || "";
      const name = planetNameFromBg(bg);
      if(name) addHover(f, name);
    });

    // Botões "Ver detalhes" - hover lê o texto (quando existe)
    
    // FIX146_media_thumbs: falar ao passar o rato/foco nas miniaturas de vídeo e foto
    document.querySelectorAll('.video-thumb, .photo-thumb').forEach(el=>{
      const t = (el.getAttribute("data-modal-title") || el.getAttribute("aria-label") || "").trim();
      if(t) addHover(el, t);
    });

    document.querySelectorAll('a.say, button.say, .btn.say').forEach(el=>{
      const t = (el.getAttribute("data-say") || el.getAttribute("aria-label") || el.textContent || "").trim();
      if(t) addHover(el, t);
    });
  });
})();
