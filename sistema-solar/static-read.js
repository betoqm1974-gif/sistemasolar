// static-read.js - lê botões existentes com data-read (ex.: ajudas fora de molduras)
(function(){
  function collectText(sel){
    const parts = [];
    (sel||"").split(",").map(s=>s.trim()).filter(Boolean).forEach(s=>{
      const el = document.querySelector(s);
      if(!el) return;
      const t = (el.innerText || el.textContent || "").replace(/\s+/g," ").trim();
      if(t) parts.push(t);
    });
    return parts.join(" ").replace(/\s+/g," ").trim();
  }

  document.addEventListener("click", (e)=>{
    const btn = e.target && e.target.closest ? e.target.closest("button[data-read]") : null;
    if(!btn) return;
    // só para botões de leitura (evita interferir com outros)
    if(!(btn.classList && btn.classList.contains("read-btn"))) return;

    e.preventDefault();
    e.stopPropagation();

    const sel = (btn.getAttribute("data-read")||"").trim();
    const text = collectText(sel);
    if(!text) return;

    try{
      if(window.__TTS && typeof window.__TTS.toggleSpeak === "function"){
        window.__TTS.toggleSpeak(text, true);
      }else{
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "pt-PT";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    }catch(err){}
  }, true);
})();