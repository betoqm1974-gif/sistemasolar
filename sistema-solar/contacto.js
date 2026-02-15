
(function(){
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");
  if(!form) return;

  // Email ofuscado (não visível no HTML)
  const u = "betoqm1974";
  const d = "gmail.com";
  const to = `${u}@${d}`;

  function setStatus(msg, ok){
    status.textContent = msg;
    status.className = ok ? "small ok" : "small err";
    try{
      if (window.__TTS && window.__TTS.speakFemale) window.__TTS.speakFemale(msg);
    }catch(_){}
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();

    const data = {
      name: form.nome.value.trim(),
      email: form.email.value.trim(),
      subject: form.assunto.value.trim(),
      message: form.mensagem.value.trim(),
      _subject: "Contacto - Sistema Solar",
      _template: "table"
    };

    if(!data.name || !data.email || !data.subject || !data.message){
      setStatus("Por favor, preencha todos os campos.", false);
      return;
    }

    setStatus("A enviar…", true);

    try{
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
        method: "POST",
        headers: {"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(()=>({}));
      if(res.ok){
        form.reset();
        setStatus("Mensagem enviada com sucesso. Obrigado!", true);
      }else{
        setStatus("Não foi possível enviar. Tente novamente mais tarde.", false);
      }
    }catch(err){
      setStatus("Falha de rede ao enviar. Verifique a ligação e tente novamente.", false);
    }
  });
})();


// Ditado (Speech Recognition) - útil para utilizadores sem braços.
(function(){
  const btn = document.getElementById("dictateBtn");
  const statusEl = document.getElementById("dictateStatus");
  const target = document.getElementById("mensagem");
  if(!btn || !target) return;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    btn.disabled = true;
    btn.setAttribute("aria-disabled","true");
    if(statusEl) statusEl.textContent = "Ditado indisponível neste browser.";
    return;
  }

  const rec = new SR();
  rec.lang = "pt-PT";
  rec.interimResults = true;
  rec.continuous = false;

  let listening = false;
  function setStatus(t){ if(statusEl) statusEl.textContent = t; }

  btn.addEventListener("click", ()=>{
    try{
      if(!listening){
        listening = true;
        setStatus("A ouvir…");
        rec.start();
        try{ if (window.__TTS && window.__TTS.speakFemale) window.__TTS.speakFemale("Ditado iniciado."); }catch(_){}
      }else{
        rec.stop();
      }
    }catch(e){}
  });

  rec.onresult = (ev)=>{
    let text = "";
    for (let i=ev.resultIndex; i<ev.results.length; i++){
      text += ev.results[i][0].transcript;
    }
    target.value = (target.value ? target.value + " " : "") + text.trim();
  };
  rec.onend = ()=>{
    listening = false;
    setStatus("Ditado terminado.");
    try{ if (window.__TTS && window.__TTS.speakFemale) window.__TTS.speakFemale("Ditado terminado."); }catch(_){}
  };
  rec.onerror = ()=>{
    listening = false;
    setStatus("Erro no ditado. Verifique permissões do microfone.");
  };
})();
