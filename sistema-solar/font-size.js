
(function(){
  const KEY = "font_size_level"; // "1" | "2" | "3"
  const levels = ["1","2","3"];

  function apply(level){
    const l = levels.includes(String(level)) ? String(level) : "1";
    document.documentElement.classList.remove("fs-1","fs-2","fs-3");
    document.documentElement.classList.add(`fs-${l}`);
    localStorage.setItem(KEY, l);

    const group = document.getElementById("fontControls");
    if(!group) return;
    group.querySelectorAll("button[data-font]").forEach(btn=>{
      const on = btn.getAttribute("data-font") === l;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-font]");
    if(!btn) return;
    apply(btn.getAttribute("data-font"));
    // feedback sonoro se existir TTS
    try{
      if (window.__TTS_CLICK__ && window.__TTS_CLICK__.speakForce){
        const msg = btn.getAttribute("data-font")==="1" ? "Texto normal" :
                    btn.getAttribute("data-font")==="2" ? "Texto grande" : "Texto muito grande";
        window.__TTS_CLICK__.speakForce(msg);
      }
    }catch(_){}
  });

  // init
  const saved = localStorage.getItem(KEY) || "1";
  apply(saved);
})();
