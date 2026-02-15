const planetas = window.PLANETAS;
const params = new URLSearchParams(location.search);
const id = params.get("id") || "terra";
const p = planetas.find(x => x.id === id) || planetas[2];

const title = document.querySelector("#planetTitle");
const img = document.querySelector("#planetImg");
const badge = document.querySelector("#planetType");
const list = document.querySelector("#facts");
const prevA = document.querySelector("#prev");
const nextA = document.querySelector("#next");

title.textContent = p.nome;
badge.textContent = p.tipo;
img.src = p.imagem;
img.alt = p.alt;

// legenda para o popup
const popBtn = img.closest?.(".imgpop");
if (popBtn) {
  popBtn.setAttribute("data-caption", `${p.nome} - imagem (NASA/JPL).`);
  popBtn.setAttribute("data-name", p.nome);
  popBtn.setAttribute("aria-label", p.nome);
}



list.innerHTML = "";
p.curiosidades.forEach(c => {
  const li = document.createElement("li");
  li.textContent = c;
  list.appendChild(li);
});

const idx = planetas.findIndex(x => x.id === p.id);
const prev = planetas[(idx - 1 + planetas.length) % planetas.length];
const next = planetas[(idx + 1) % planetas.length];

prevA.href = `planeta.html?id=${encodeURIComponent(prev.id)}`;
prevA.textContent = `← ${prev.nome}`;
nextA.href = `planeta.html?id=${encodeURIComponent(next.id)}`;
nextA.textContent = `${next.nome} →`;

document.title = `${p.nome} - Sistema Solar`;
