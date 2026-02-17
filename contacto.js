
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
  rec.continuous = true; // mantém a escuta ativa, mesmo com pequenas pausas

  let listening = false;
  let manualStop = false;

  // Buffers para evitar duplicações (problema típico com interimResults)
  let baseText = "";
  let finalBuffer = "";

  function setStatus(t){ if(statusEl) statusEl.textContent = t; }

  function normalizeSpaces(s){
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function start(){
    manualStop = false;
    baseText = normalizeSpaces(target.value);
    finalBuffer = "";
    listening = true;
    setStatus("A ouvir… (clique novamente para parar)");
    try{ rec.start(); }catch(_){}
    try{ if (window.__TTS && window.__TTS.speakFemale) window.__TTS.speakFemale("Ditado iniciado."); }catch(_){}
  }

  function stop(){
    manualStop = true;
    listening = false;
    setStatus("A parar…");
    try{ rec.stop(); }catch(_){}
  }

  btn.addEventListener("click", ()=>{
    if(!listening) start();
    else stop();
  });

  rec.onresult = (ev)=>{
    let interim = "";
    for (let i=ev.resultIndex; i<ev.results.length; i++){
      const r = ev.results[i];
      const transcript = (r[0] && r[0].transcript) ? r[0].transcript : "";
      if(r.isFinal){
        finalBuffer = normalizeSpaces(finalBuffer + " " + transcript);
      }else{
        interim = normalizeSpaces(interim + " " + transcript);
      }
    }
    const combined = normalizeSpaces([baseText, finalBuffer, interim].filter(Boolean).join(" "));
    target.value = combined;
  };

  rec.onend = ()=>{
    // Se terminou por silêncio e o utilizador não pediu para parar, recomeça.
    if(listening && !manualStop){
      setStatus("A ouvir…");
      try{ rec.start(); }catch(_){}
      return;
    }
    listening = false;
    setStatus("Ditado terminado.");
    try{ if (window.__TTS && window.__TTS.speakFemale) window.__TTS.speakFemale("Ditado terminado."); }catch(_){}
  };

  rec.onerror = (e)=>{
    listening = false;
    manualStop = true;
    setStatus("Erro no ditado. Verifique permissões do microfone.");
  };
})();
