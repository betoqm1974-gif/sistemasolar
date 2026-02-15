(function(){
  const L=document.getElementById("backToTopLeft");
  const R=document.getElementById("backToTopRight");
  function go(){ window.scrollTo({top:0, behavior:"smooth"}); }
  if(L) L.addEventListener("click", go);
  if(R) R.addEventListener("click", go);
})();