// ui-guards.js - voz consistente em botões gerais (ex.: Ir para o topo)
(function(){
  function speak(label){
    try{ window.speechSynthesis.cancel(); }catch(e){}
    try{
      const u=new SpeechSynthesisUtterance(label);
      u.lang="pt-PT";
      window.speechSynthesis.speak(u);
    }catch(e){}
  }

  function init(){
    const btns = Array.from(document.querySelectorAll('button[id*="top"], button.to-top, .to-top button')).filter(Boolean);
    btns.forEach((btn)=>{
      if(btn.__guarded) return;
      btn.__guarded = true;
      let last=0;
      btn.addEventListener("click", (e)=>{
        const now=Date.now();
        if(now-last<350) return;
        last=now;
        speak("Ir para o topo");
        // deixa o comportamento normal (scroll) acontecer
      }, true);
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();