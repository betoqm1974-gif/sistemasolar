// 
(function(){
  const btn = document.getElementById("backToTop");
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    const top = document.getElementById("topo");
    window.scrollTo({top: 0, behavior: "smooth"});
    // mover foco para o topo para acessibilidade
    if(top && top.focus) setTimeout(()=>top.focus(), 350);
    try{
      if(window.__TTS && window.__TTS.speakFemale) window.__TTS.speakFemale("Topo");
    }catch(_){}
  });
})();
