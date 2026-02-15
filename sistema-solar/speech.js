
(function(){
  function canSpeak(){
    return ("speechSynthesis" in window) && window.SpeechSynthesisUtterance;
  }
  function pickVoice(u){
    try{
      const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      const pt = voices.find(v => (v.lang || "").toLowerCase().startsWith("pt"));
      if (pt) u.voice = pt;
    }catch(e){}
  }
  function speak(text){
    if (!canSpeak()) return;
    const clean = (""+text).replace(/\s+/g," ").trim();
    if(!clean) return;

    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "pt-PT";

    const doSpeak = ()=>{
      try{ pickVoice(u); }catch(e){}
      try{ window.speechSynthesis.cancel(); }catch(e){}
      // folga pequena para evitar cortes/interferências no Chrome
      setTimeout(()=>{ 
        try{ window.speechSynthesis.speak(u); }catch(e){} 
      }, 90);
    };

    try{
      const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      if(voices && voices.length){
        doSpeak();
      }else{
        let fired = false;
        const handler = ()=>{
          if(fired) return;
          fired = true;
          window.speechSynthesis.onvoiceschanged = null;
          doSpeak();
        };
        window.speechSynthesis.onvoiceschanged = handler;
        setTimeout(handler, 250);
      }
    }catch(e){
      doSpeak();
    }
  }
  function stop(){
    if (!canSpeak()) return;
    try{ window.speechSynthesis.cancel(); }catch(e){}
  }

  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-speak]");
    if (!btn) return;
    const id = btn.getAttribute("data-speak");
    const el = document.getElementById(id);
    if (!el) return;
    const text = (el.innerText || el.textContent || "").replace(/\s+/g," ").trim();
    if (text) speak(text);
  });

  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-stop-speak]");
    if (!btn) return;
    stop();
  });

  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-speak-details]");
    if (!btn) return;
    const id = btn.getAttribute("data-speak-details");
    const det = document.getElementById(id);
    if (!det) return;
    const text = (det.innerText || det.textContent || "").replace(/\s+/g," ").trim();
    if (text) speak(text);
  });

  if ("speechSynthesis" in window){
    window.speechSynthesis.onvoiceschanged = () => {};
  }
})();
