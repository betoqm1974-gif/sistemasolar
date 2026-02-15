// menu-tts.js - lê itens do menu ao passar o rato e ao receber foco (Tab)
// Respeita o estado do botão "Leitura: ligada/desligada".
(function(){
  const KEY = "tts_click_enabled";

  function isEnabled(){
    try{
      const v = localStorage.getItem(KEY);
      return v === null ? true : v === "1";
    }catch(e){
      return true;
    }
  }

  function speakingNow(){
    try{
      return ("speechSynthesis" in window) && (window.speechSynthesis.speaking || window.speechSynthesis.paused);
    }catch(e){ return false; }
  }

  function speakLabel(label){
    const text = String(label||"").replace(/\s+/g," ").trim();
    if(!text) return;
    if(!isEnabled()) return;
    // não interromper leituras em curso (evita "cortar" a leitura do conteúdo)
    if(speakingNow()) return;

    try{
      if(window.__TTS && typeof window.__TTS.toggleSpeak === "function"){
        // força=false -> respeita o modo desligado (e não obriga leitura)
        window.__TTS.toggleSpeak(text, false);
      }
    }catch(e){}
  }

  function getLabel(el){
    if(!el) return "";
    return (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g," ").trim();
  }

  function init(){
    const nav = document.querySelector("nav");
    if(!nav) return;
    const items = nav.querySelectorAll("a, button");
    items.forEach((el)=>{
      if(el.__menuTTSBound) return;
      el.__menuTTSBound = true;

      el.addEventListener("mouseenter", ()=>{ speakLabel(getLabel(el)); }, {passive:true});
      el.addEventListener("focus", ()=>{ speakLabel(getLabel(el)); }, {passive:true});
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();