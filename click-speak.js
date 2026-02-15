(function(){
  const KEY = "tts_click_enabled";
  const VOICE_KEY = "tts_voice_name";

  function canSpeak(){
    return ("speechSynthesis" in window) && window.SpeechSynthesisUtterance;
  }

  function isEnabled(){
    const v = localStorage.getItem(KEY);
    return v === null ? true : v === "1";
  }
  function setEnabled(on){
    localStorage.setItem(KEY, on ? "1" : "0");
    updateToggleUI();
  }

  function getVoices(){
    try{ return window.speechSynthesis.getVoices() || []; }catch(e){ return []; }
  }

  async function ensureVoices(){
    if(!canSpeak()) return;
    try{ window.speechSynthesis.getVoices(); }catch(_){}
    for(let i=0;i<12;i++){
      if(getVoices().length) return;
      await new Promise(r=>setTimeout(r, 150));
      try{ window.speechSynthesis.getVoices(); }catch(_){}
    }
  }

  function pickVoice(){
    const voices = getVoices();
    const pt = voices.filter(v => (v.lang||"").toLowerCase().startsWith("pt"));
    if(!pt.length) return null;

    const saved = localStorage.getItem(VOICE_KEY);
    if(saved){
      const v = pt.find(x=>x.name===saved);
      if(v) return v;
    }

    const femaleHints = ["female","mulher","femin","maria","ines","inês","joana","catarina","ana","beatriz","helena"];
    const vf = pt.find(v => femaleHints.some(h => (v.name||"").toLowerCase().includes(h)));
    const choice = vf || pt[0];
    localStorage.setItem(VOICE_KEY, choice.name);
    return choice;
  }

  async function speak(text, {force=false, restart=true} = {}){
    if(!canSpeak()) return;
    if(!force && !isEnabled()) return;

    await ensureVoices();
    const voice = pickVoice();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-PT";
    if(voice) u.voice = voice;

    try{
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      if (restart && window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    }catch(_){}

    setTimeout(()=>{
      try{
        window.speechSynthesis.speak(u);
        setTimeout(()=>{ try{ window.speechSynthesis.resume(); }catch(_){ } }, 80);
      }catch(_){}
    }, 120);
  }


  function stopSpeak(){
    try{ if(canSpeak()) window.speechSynthesis.cancel(); }catch(_){}
  }

  // Toggle: 1º clique lê, 2º clique pára, 3º lê, ...
  async function toggleSpeak(text, {force=false} = {}){
    if(!canSpeak()) return;
    if(!force && !isEnabled()) return;
    try{
      if(window.speechSynthesis.speaking || window.speechSynthesis.paused){
        stopSpeak();
        return;
      }
    }catch(_){}
    return speak(text, {force, restart:true});
  }

  function updateToggleUI(){
    const btn = document.getElementById("ttsToggle");
    if(!btn) return;
    const on = isEnabled();
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "Leitura: ligada" : "Leitura: desligada";
    btn.setAttribute("aria-label", on ? "Desativar leitura em voz" : "Ativar leitura em voz");
  }

  
  // Falar no menu antes de navegar (Chrome pode cortar o áudio ao mudar de página)
  document.addEventListener("pointerdown", (e)=>{
    if(!isEnabled()) return;
    const el = e.target.closest("nav a, nav button, .main-nav a, .main-nav button");
    if(!el) return;
    if (el.id === "ttsToggle") return;
    if (el.hasAttribute("data-speak") || el.hasAttribute("data-speak-female")) return;
    const text = labelOf(el);
    if(text) toggleSpeak(text, {force:false});
  }, true);

  document.addEventListener("click", (e)=>{
    
  // FIX107_modal_skip: não interferir com botões que abrem pop-up
  const _modalBtn = e.target && e.target.closest ? e.target.closest("[data-modal-type]") : null;
  if(_modalBtn){ return; }
const btn = e.target.closest("#ttsToggle");
    if(!btn) return;
    setEnabled(!isEnabled());
    speak(isEnabled() ? "Leitura ligada" : "Leitura desligada", {force:true, restart:true});
  });

  // Explicit speak buttons always work
  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-speak],[data-speak-female]");
    if(!btn) return;
    const id = btn.getAttribute("data-speak-female") || btn.getAttribute("data-speak");
    const el = id ? document.getElementById(id) : null;
    if(!el) return;
    const text = (el.innerText || el.textContent || "").replace(/\s+/g," ").trim();
    if(text) toggleSpeak(text, {force:true});
  });

  // Click-to-speak (menu + all buttons/links) when enabled
  function labelOf(el){
    const aria = el.getAttribute("aria-label");
    if (aria) return aria.trim();
    const t = (el.innerText || el.textContent || "").replace(/\s+/g," ").trim();
    return t || "";
  }
  document.addEventListener("click", (e)=>{
    if(!isEnabled()) return;
    const el = e.target.closest("a, button, summary, [role='button']");
    if(e.target.closest(".read-btn")) return;
    if(!el) return;
    if (el.id === "ttsToggle") return;
    if (el.hasAttribute("data-speak") || el.hasAttribute("data-speak-female")) return;
    const text = labelOf(el);
    if(text) toggleSpeak(text, {force:false});
  });

  // Warm-up voices on first gesture (Chrome)
  const warmup = async ()=>{
    document.removeEventListener("pointerdown", warmup, true);
    await ensureVoices();
  };
  document.addEventListener("pointerdown", warmup, true);

  updateToggleUI();
  window.__TTS = { speakFemale: (t)=>speak(t,{force:true, restart:true}), toggleSpeak: (t,force=false)=>toggleSpeak(t,{force}), stop: stopSpeak };
})();