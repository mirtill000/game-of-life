/* ============================================================================
   SINGULARITAS — motore di gioco
   ----------------------------------------------------------------------------
   Tutto il contenuto (risorse, generatori, ricerche) è dichiarato nei tre
   array in cima: per aggiungere una fase basta aggiungere righe, senza
   toccare né il game loop né il codice della UI.
============================================================================ */
(function () {
"use strict";

/* ============================================================================
   1. CONTENUTO DEL GIOCO
============================================================================ */

/* --- Risorse. `cond` decide quando la risorsa diventa visibile. ---------- */
var RISORSE = [
  { id: "energia",      nome: "Energia Quantistica", cond: function () { return true; } },
  { id: "quark",        nome: "Quark",               cond: function (g) { return g.totali.energia >= 40; } },
  { id: "idrogeno",     nome: "Idrogeno",            cond: function (g) { return g.fase >= 2; } },
  { id: "elio",         nome: "Elio",                cond: function (g) { return g.fase >= 2; } },
  { id: "polvere",      nome: "Polvere Stellare",    cond: function (g) { return g.fase >= 2; } },
  { id: "acqua",        nome: "Acqua",               cond: function (g) { return g.fase >= 3; } },
  { id: "carbonio",     nome: "Carbonio",            cond: function (g) { return g.fase >= 3; } },
  { id: "biomassa",     nome: "Biomassa",            cond: function (g) { return g.fase >= 3; } },
  { id: "intelligenza", nome: "Intelligenza",        cond: function (g) { return g.fase >= 4; } },
  { id: "sfere",        nome: "Sfere di Dyson",      cond: function (g) { return g.generatori.dyson > 0; } }
];

/* --- Azioni manuali ------------------------------------------------------ */
var AZIONI = [
  {
    id: "click_energia",
    nome: "Raccogli Energia Quantistica",
    descrizione: "Estrai energia dalle fluttuazioni del vuoto.",
    principale: true,
    costo: {},
    resa: { energia: 1 },
    scala: "click",              // moltiplicata dai potenziamenti del click
    cond: function () { return true; }
  },
  {
    id: "click_quark",
    nome: "Condensa Quark",
    descrizione: "Comprimi l'energia finché non si materializza in materia.",
    principale: false,
    costo: { energia: 10 },
    resa: { quark: 1 },
    scala: "click",
    cond: function (g) { return g.sbloccati.quark; }
  }
];

/* --- Generatori automatici ------------------------------------------------
   costo    : prezzo base, moltiplicato per crescita^(quantità posseduta)
   produce  : unità al secondo per singolo generatore
   consuma  : unità al secondo per singolo generatore (opzionale)
   Se l'input manca, il generatore rallenta invece di bloccarsi.
-------------------------------------------------------------------------- */
var GENERATORI = [
  /* ---------------- FASE 1 ---------------- */
  {
    id: "fluttuazione", fase: 1,
    nome: "Fluttuazione Quantistica",
    descrizione: "Una increspatura del vuoto che non si richiude più.",
    costo: { energia: 10 }, crescita: 1.13,
    produce: { energia: 1 },
    cond: function () { return true; }
  },
  {
    id: "attrattore", fase: 1,
    nome: "Attrattore di Quark",
    descrizione: "Cattura quark liberi prima che si annichiliscano.",
    costo: { energia: 75 }, crescita: 1.16,
    produce: { quark: 0.4 }, consuma: { energia: 1 },
    cond: function (g) { return g.sbloccati.quark; }
  },

  /* ---------------- FASE 2 ---------------- */
  {
    id: "nebulosa", fase: 2, gruppo: "collasso",
    nome: "Nebulosa",
    descrizione: "Immense nubi in cui i quark si legano in idrogeno.",
    costo: { quark: 300 }, crescita: 1.16,
    produce: { idrogeno: 0.5 }, consuma: { quark: 1.5 },
    cond: function (g) { return g.fase >= 2; }
  },
  {
    id: "fornace", fase: 2, gruppo: "fusione",
    nome: "Fornace Stellare",
    descrizione: "Il cuore di una stella: fonde idrogeno in elio.",
    costo: { idrogeno: 400 }, crescita: 1.17,
    produce: { elio: 0.3 }, consuma: { idrogeno: 1 },
    cond: function (g) { return g.totali.idrogeno >= 50; }
  },
  {
    id: "supernova", fase: 2, gruppo: "collasso",
    nome: "Supernova",
    descrizione: "La morte di un gigante disperde elementi pesanti.",
    costo: { elio: 600 }, crescita: 1.19,
    produce: { polvere: 0.25 }, consuma: { elio: 0.8 },
    cond: function (g) { return g.totali.elio >= 80; }
  },

  /* ---------------- FASE 3 ---------------- */
  {
    id: "cometa", fase: 3, gruppo: "vita",
    nome: "Cometa Ghiacciata",
    descrizione: "Porta acqua sui mondi rocciosi appena formati.",
    costo: { polvere: 1200 }, crescita: 1.16,
    produce: { acqua: 0.6 }, consuma: { polvere: 0.6 },
    cond: function (g) { return g.fase >= 3; }
  },
  {
    id: "gigante", fase: 3, gruppo: "collasso",
    nome: "Gigante Rossa",
    descrizione: "Nel suo guscio l'elio diventa carbonio.",
    costo: { elio: 3000 }, crescita: 1.17,
    produce: { carbonio: 0.5 }, consuma: { elio: 1.2 },
    cond: function (g) { return g.fase >= 3; }
  },
  {
    id: "brodo", fase: 3, gruppo: "vita",
    nome: "Brodo Primordiale",
    descrizione: "Acqua e carbonio: la chimica inizia a ripetersi.",
    costo: { acqua: 2000, carbonio: 1200 }, crescita: 1.19,
    produce: { biomassa: 0.3 }, consuma: { acqua: 0.8, carbonio: 0.5 },
    cond: function (g) { return g.totali.acqua >= 300 && g.totali.carbonio >= 300; }
  },
  {
    id: "replicatore", fase: 3, gruppo: "vita",
    nome: "Replicatore Cellulare",
    descrizione: "La vita smette di aspettare il caso e si copia da sola.",
    costo: { biomassa: 5000 }, crescita: 1.2,
    produce: { biomassa: 0.7 }, consuma: { acqua: 0.8 },
    cond: function (g) { return g.totali.biomassa >= 500; }
  },

  /* ---------------- FASE 4 ---------------- */
  {
    id: "colonia", fase: 4, gruppo: "vita",
    nome: "Colonia Planetaria",
    descrizione: "Mondi abitati che pensano, discutono e ricordano.",
    costo: { biomassa: 8000 }, crescita: 1.18,
    produce: { intelligenza: 0.5 }, consuma: { biomassa: 1.5 },
    cond: function (g) { return g.fase >= 4; }
  },
  {
    id: "calcolatore", fase: 4,
    nome: "Calcolatore Quantistico",
    descrizione: "Pensiero che gira sul vuoto stesso da cui sei partito.",
    costo: { intelligenza: 3000 }, crescita: 1.2,
    produce: { intelligenza: 1.5 }, consuma: { energia: 5 },
    cond: function (g) { return g.totali.intelligenza >= 400; }
  },
  {
    id: "dyson", fase: 4,
    nome: "Sfera di Dyson",
    descrizione: "Avvolge una stella intera. Ogni sfera aumenta del 10% ogni produzione.",
    costo: { polvere: 25000, intelligenza: 10000 }, crescita: 1.3,
    produce: { sfere: 0 },
    cond: function (g) { return g.totali.intelligenza >= 5000; }
  }
];

/* --- Ricerche: potenziamenti una tantum e traguardi di fase --------------- */
var RICERCHE = [
  /* ---------------- FASE 1 ---------------- */
  {
    id: "punto_zero", nome: "Oscillatore di Punto Zero",
    descrizione: "Raddoppia l'energia raccolta a mano.",
    costo: { energia: 80 },
    cond: function (g) { return g.totali.energia >= 30; },
    effetto: function (g) { g.molt.click *= 2; }
  },
  {
    id: "vuoto_turbolento", nome: "Vuoto Turbolento",
    descrizione: "Le Fluttuazioni Quantistiche producono il doppio.",
    costo: { energia: 300 },
    cond: function (g) { return g.generatori.fluttuazione >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "fluttuazione", 2); }
  },
  {
    id: "cromodinamica", nome: "Cromodinamica Quantistica",
    descrizione: "Gli Attrattori di Quark producono il doppio.",
    costo: { quark: 150 },
    cond: function (g) { return g.generatori.attrattore >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "attrattore", 2); }
  },
  {
    id: "higgs", nome: "Campo di Higgs",
    descrizione: "La materia acquista massa: ogni azione manuale rende 5 volte tanto.",
    costo: { energia: 600, quark: 250 },
    cond: function (g) { return g.sbloccati.quark && g.totali.quark >= 120; },
    effetto: function (g) { g.molt.click *= 5; }
  },
  {
    id: "sintesi_idrogeno", nome: "Sintesi dell'Idrogeno", traguardo: true,
    descrizione: "I quark si legano in protoni: nasce il primo elemento. Apre l'Era Stellare.",
    costo: { quark: 600, energia: 1500 },
    cond: function (g) { return g.totali.quark >= 400; },
    effetto: function (g) {
      g.fase = 2;
      registra("I protoni si formano dal plasma di quark. Il primo elemento esiste.", "traguardo");
      registra("ERA STELLARE — la materia ora può collassare e accendersi.", "traguardo");
    }
  },

  /* ---------------- FASE 2 ---------------- */
  {
    id: "nebulose_dense", nome: "Nebulose Dense",
    descrizione: "Le Nebulose producono il doppio di idrogeno.",
    costo: { quark: 2500 },
    cond: function (g) { return g.generatori.nebulosa >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "nebulosa", 2); }
  },
  {
    id: "catena_pp", nome: "Catena Protone-Protone",
    descrizione: "Le Fornaci Stellari producono il doppio di elio.",
    costo: { idrogeno: 1500 },
    cond: function (g) { return g.generatori.fornace >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "fornace", 2); }
  },
  {
    id: "collasso_ferro", nome: "Collasso del Nucleo di Ferro",
    descrizione: "Le Supernove disperdono il doppio di polvere stellare.",
    costo: { elio: 2500 },
    cond: function (g) { return g.generatori.supernova >= 3; },
    effetto: function (g) { moltiplicaGeneratore(g, "supernova", 2); }
  },
  {
    id: "galassia", nome: "Accensione della prima Galassia", traguardo: true,
    descrizione: "Miliardi di stelle si legano in una spirale. Apre l'Era della Vita.",
    costo: { elio: 6000, polvere: 2000 },
    cond: function (g) { return g.totali.polvere >= 800; },
    effetto: function (g) {
      g.fase = 3;
      registra("Una spirale di centomila anni luce si accende nel buio.", "traguardo");
      registra("ERA DELLA VITA — attorno alle stelle si condensano mondi.", "traguardo");
    }
  },

  /* ---------------- FASE 3 ---------------- */
  {
    id: "chimica_prebiotica", nome: "Chimica Prebiotica",
    descrizione: "Il Brodo Primordiale produce il doppio di biomassa.",
    costo: { acqua: 4000 },
    cond: function (g) { return g.generatori.brodo >= 3; },
    effetto: function (g) { moltiplicaGeneratore(g, "brodo", 2); }
  },
  {
    id: "codice_genetico", nome: "Codice Genetico",
    descrizione: "I Replicatori Cellulari producono il doppio.",
    costo: { biomassa: 8000 },
    cond: function (g) { return g.generatori.replicatore >= 3; },
    effetto: function (g) { moltiplicaGeneratore(g, "replicatore", 2); }
  },
  {
    id: "fotosintesi", nome: "Fotosintesi",
    descrizione: "La vita impara a nutrirsi di luce: ogni produzione aumenta del 50%.",
    costo: { biomassa: 18000 },
    cond: function (g) { return g.totali.biomassa >= 10000; },
    effetto: function (g) { g.molt.globale *= 1.5; }
  },
  {
    id: "senziente", nome: "Specie Senziente", traguardo: true,
    descrizione: "Una forma di vita guarda il cielo e si chiede da dove venga. Apre l'Era della Civiltà.",
    costo: { biomassa: 35000 },
    cond: function (g) { return g.totali.biomassa >= 18000; },
    effetto: function (g) {
      g.fase = 4;
      registra("Su un mondo qualunque, qualcosa alza lo sguardo e formula una domanda.", "traguardo");
      registra("ERA DELLA CIVILTÀ — la materia che hai creato ora ragiona.", "traguardo");
    }
  },

  /* ---------------- FASE 4 ---------------- */
  {
    id: "rete_neurale", nome: "Rete Neurale Planetaria",
    descrizione: "Le Colonie Planetarie producono il doppio di intelligenza.",
    costo: { intelligenza: 15000 },
    cond: function (g) { return g.generatori.colonia >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "colonia", 2); }
  },
  {
    id: "entanglement", nome: "Entanglement Distribuito",
    descrizione: "I Calcolatori Quantistici producono il triplo.",
    costo: { intelligenza: 40000 },
    cond: function (g) { return g.generatori.calcolatore >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "calcolatore", 3); }
  },
  {
    id: "ingegneria_stellare", nome: "Ingegneria Stellare",
    descrizione: "Le civiltà rimodellano le stelle: ogni produzione raddoppia.",
    costo: { intelligenza: 100000, polvere: 30000 },
    cond: function (g) { return g.generatori.dyson >= 3; },
    effetto: function (g) { g.molt.globale *= 2; }
  },
  {
    id: "ascensione", nome: "Ascensione Cosmica", traguardo: true,
    descrizione: "L'universo diventa consapevole di sé stesso, e sceglie cosa essere.",
    costo: { intelligenza: 300000 },
    condExtra: function (g) { return g.generatori.dyson >= 8; },
    cond: function (g) { return g.totali.intelligenza >= 60000; },
    effetto: function (g) { g.asceso = true; mostraFinale(); }
  }
];

/* --- Costanti fondamentali: manopole che il giocatore può alzare o abbassare.
   Nessuna ha un valore "giusto": ognuna scambia qualcosa con qualcos'altro,
   e l'effetto è continuo, quindi non conviene cambiarle avanti e indietro. --- */
var COSTANTI = [
  {
    id: "gravita", nome: "Gravità", simbolo: "G",
    min: 1, max: 9,
    cond: function (g) { return g.fase >= 2; },
    effetto: function (v) {
      var f = (0.6 + v * 0.08).toFixed(2);
      return "Nebulose, Supernove e Giganti Rosse: produzione <b>×" + f +
             "</b> e consumo <b>×" + f + "</b>. Alzarla accelera il collasso, " +
             "ma divora le riserve più in fretta.";
    }
  },
  {
    id: "em", nome: "Elettromagnetismo", simbolo: "α",
    min: 1, max: 9,
    cond: function (g) { return g.fase >= 2; },
    effetto: function (v) {
      return "Chimica e vita <b>×" + (0.6 + v * 0.08).toFixed(2) +
             "</b> · fusione stellare <b>×" + (1.4 - v * 0.08).toFixed(2) +
             "</b>. Più forte è la repulsione elettrica, più difficile è fondere i nuclei.";
    }
  },
  {
    id: "lambda", nome: "Espansione", simbolo: "Λ",
    min: 1, max: 9,
    cond: function (g) { return g.totali.energia >= 200; },
    effetto: function (v) {
      return "Produzione automatica <b>×" + (1.4 - v * 0.08).toFixed(2) +
             "</b> · raccolta manuale <b>×" + (0.2 + v * 0.16).toFixed(2) +
             "</b>. Uno spazio che si dilata diluisce la materia, ma offre più vuoto da cui attingere.";
    }
  }
];

/* ============================================================================
   2. STATO
============================================================================ */
var CHIAVE_SALVATAGGIO = "singularitas_v1";

var gs;

function statoIniziale() {
  var g = {
    risorse: {}, totali: {}, generatori: {},
    efficienza: {},               // quota di lavoro svolta da ogni generatore (input permettendo)
    ricerche: {},                 // ricerche completate
    sbloccati: {},                // elementi già rivelati
    molt: { click: 1, globale: 1, generatori: {} },
    costanti: {},
    fase: 1,
    click: 0,
    asceso: false,
    inizio: Date.now(),
    ultimoAccesso: Date.now()
  };
  RISORSE.forEach(function (r) { g.risorse[r.id] = 0; g.totali[r.id] = 0; });
  COSTANTI.forEach(function (c) { g.costanti[c.id] = 5; });   // 5 = valore neutro
  GENERATORI.forEach(function (x) { g.generatori[x.id] = 0; g.molt.generatori[x.id] = 1; });
  return g;
}

function moltiplicaGeneratore(g, id, fattore) {
  g.molt.generatori[id] = (g.molt.generatori[id] || 1) * fattore;
}

/* ============================================================================
   3. UTILITÀ
============================================================================ */
var $ = function (id) { return document.getElementById(id); };

var SUFFISSI = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function fmt(n) {
  if (n === Infinity) return "∞";
  if (!isFinite(n) || isNaN(n)) return "0";
  if (n < 0) return "-" + fmt(-n);
  if (n < 1000) return n < 10 ? (Math.round(n * 10) / 10).toString() : Math.floor(n).toString();
  var i = Math.min(Math.floor(Math.log(n) / Math.log(1000)), SUFFISSI.length - 1);
  return (n / Math.pow(1000, i)).toFixed(2) + SUFFISSI[i];
}

function fmtTasso(n) {
  if (Math.abs(n) < 0.005) return "0";
  if (Math.abs(n) < 10) return (Math.round(n * 100) / 100).toString();
  return fmt(n);
}

/* Alcuni browser vietano localStorage sulle pagine aperte da file:// e
   lanciano al solo accesso alla proprietà: qui si degrada a "niente salvataggi". */
var archivio = {
  leggi: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  scrivi: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  cancella: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
};

var silenzioLog = false;   // attivo durante la ricostruzione della UI al caricamento

function registra(testo, classe) {
  if (silenzioLog) return;
  var box = $("log");
  if (!box) return;
  var riga = document.createElement("div");
  if (classe) riga.className = classe;
  riga.textContent = testo;
  box.appendChild(riga);
  while (box.children.length > 120) box.removeChild(box.firstChild);
  box.scrollTop = box.scrollHeight;
}

/* ============================================================================
   4. ECONOMIA
============================================================================ */
function moltiplicatoreGlobale() {
  return gs.molt.globale * (1 + gs.generatori.dyson * 0.1) * (1.4 - gs.costanti.lambda * 0.08);
}

/* Effetto delle costanti su un singolo generatore. La gravità agisce sia sulla
   produzione sia sul consumo (è un regolatore di ritmo), le altre solo sulla
   produzione (sono compromessi fra gruppi). */
function fattoreCostanti(gen, produzione) {
  var c = gs.costanti, f = 1;
  if (gen.gruppo === "collasso") f *= 0.6 + c.gravita * 0.08;
  if (produzione) {
    if (gen.gruppo === "vita")    f *= 0.6 + c.em * 0.08;
    if (gen.gruppo === "fusione") f *= 1.4 - c.em * 0.08;
  }
  return f;
}

function moltiplicatoreClick() {
  return gs.molt.click * (0.2 + gs.costanti.lambda * 0.16);
}

function costoAttuale(gen) {
  var n = gs.generatori[gen.id] || 0;
  var out = {};
  for (var r in gen.costo) out[r] = gen.costo[r] * Math.pow(gen.crescita, n);
  return out;
}

function puoPagare(costo) {
  for (var r in costo) if ((gs.risorse[r] || 0) < costo[r]) return false;
  return true;
}

function paga(costo) {
  for (var r in costo) gs.risorse[r] -= costo[r];
}

function aggiungi(id, quantita) {
  gs.risorse[id] = (gs.risorse[id] || 0) + quantita;
  gs.totali[id] = (gs.totali[id] || 0) + quantita;
}

/* Produzione netta al secondo, usata per i tassi mostrati nella UI. */
function tassiCorrenti() {
  var tassi = {};
  var globale = moltiplicatoreGlobale();
  GENERATORI.forEach(function (gen) {
    var n = gs.generatori[gen.id] || 0;
    if (n <= 0) return;
    var eff = gs.efficienza[gen.id] === undefined ? 1 : gs.efficienza[gen.id];
    var m = n * (gs.molt.generatori[gen.id] || 1) * globale * eff * fattoreCostanti(gen, true);
    for (var r in gen.produce) tassi[r] = (tassi[r] || 0) + gen.produce[r] * m;
    var fc = fattoreCostanti(gen, false);
    if (gen.consuma) for (var c in gen.consuma) tassi[c] = (tassi[c] || 0) - gen.consuma[c] * n * eff * fc;
  });
  return tassi;
}

/* Un tick di produzione. I generatori sono processati in ordine di fase, così
   ogni anello consuma ciò che l'anello precedente ha appena prodotto. */
function produci(dt) {
  var globale = moltiplicatoreGlobale();

  GENERATORI.forEach(function (gen) {
    var n = gs.generatori[gen.id] || 0;
    if (n <= 0) { gs.efficienza[gen.id] = 1; return; }

    /* Se manca un input, il generatore lavora al ritmo consentito. */
    var fc = fattoreCostanti(gen, false);
    var fattore = 1;
    if (gen.consuma) {
      for (var c in gen.consuma) {
        var serve = gen.consuma[c] * n * dt * fc;
        if (serve <= 0) continue;
        var disponibile = gs.risorse[c] || 0;
        if (disponibile < serve) fattore = Math.min(fattore, disponibile / serve);
      }
    }
    if (fattore < 0) fattore = 0;
    gs.efficienza[gen.id] = fattore;

    if (gen.consuma) {
      for (var c2 in gen.consuma) {
        gs.risorse[c2] = Math.max(0, (gs.risorse[c2] || 0) - gen.consuma[c2] * n * dt * fattore * fc);
      }
    }
    for (var p in gen.produce) {
      var q = gen.produce[p] * n * (gs.molt.generatori[gen.id] || 1) * globale * fattore * dt *
              fattoreCostanti(gen, true);
      if (q > 0) aggiungi(p, q);
    }
  });
}

/* ============================================================================
   5. AZIONI DEL GIOCATORE
============================================================================ */
function eseguiAzione(id) {
  var az = null;
  AZIONI.forEach(function (a) { if (a.id === id) az = a; });
  if (!az || !puoPagare(az.costo)) return;
  paga(az.costo);
  var m = az.scala === "click" ? moltiplicatoreClick() : 1;
  for (var r in az.resa) aggiungi(r, az.resa[r] * m);
  gs.click++;
  disegna();
}

function compraGeneratore(id) {
  var gen = null;
  GENERATORI.forEach(function (x) { if (x.id === id) gen = x; });
  if (!gen) return;
  var costo = costoAttuale(gen);
  if (!puoPagare(costo)) return;
  paga(costo);
  gs.generatori[gen.id]++;
  if (gen.id === "dyson") {
    gs.risorse.sfere = gs.generatori.dyson;
    gs.totali.sfere = gs.generatori.dyson;
  }
  if (gs.generatori[gen.id] === 1) registra("Costruito: " + gen.nome + ".", "buono");
  disegna();
}

function regolaCostante(id, passo) {
  var def = null;
  COSTANTI.forEach(function (c) { if (c.id === id) def = c; });
  if (!def) return;
  var nuovo = Math.max(def.min, Math.min(def.max, (gs.costanti[id] || 5) + passo));
  if (nuovo === gs.costanti[id]) return;
  gs.costanti[id] = nuovo;
  disegna();
}

function compraRicerca(id) {
  var ric = null;
  RICERCHE.forEach(function (x) { if (x.id === id) ric = x; });
  if (!ric || gs.ricerche[id]) return;
  if (!puoPagare(ric.costo)) return;
  if (ric.condExtra && !ric.condExtra(gs)) return;
  paga(ric.costo);
  gs.ricerche[id] = true;
  registra("Ricerca completata: " + ric.nome + ".", ric.traguardo ? "traguardo" : "evento");
  ric.effetto(gs);
  disegna();
}

/* ============================================================================
   6. PROGRESSIONE "UNFOLDING"
   Ogni tick verifica se qualcosa di nuovo va rivelato.
============================================================================ */
var NOMI_FASI = ["Il Vuoto", "Era Primordiale", "Era Stellare", "Era della Vita", "Era della Civiltà"];

function verificaSblocchi() {
  /* risorse */
  RISORSE.forEach(function (r) {
    if (gs.sbloccati[r.id]) return;
    if (r.cond(gs) || (gs.risorse[r.id] || 0) > 0) {
      gs.sbloccati[r.id] = true;
      creaRigaRisorsa(r);
      registra("Nuova risorsa disponibile: " + r.nome + ".", "evento");
    }
  });
  /* azioni */
  AZIONI.forEach(function (a) {
    if (gs.sbloccati["az_" + a.id] || !a.cond(gs)) return;
    gs.sbloccati["az_" + a.id] = true;
    creaBottoneAzione(a);
  });
  /* generatori */
  GENERATORI.forEach(function (gen) {
    if (gs.sbloccati["gen_" + gen.id] || !gen.cond(gs)) return;
    gs.sbloccati["gen_" + gen.id] = true;
    $("pannello-generatori").classList.remove("oculto");
    creaSchedaGeneratore(gen);
    registra("Nuova infrastruttura progettabile: " + gen.nome + ".", "evento");
  });
  /* ricerche */
  RICERCHE.forEach(function (ric) {
    if (gs.sbloccati["ric_" + ric.id] || gs.ricerche[ric.id] || !ric.cond(gs)) return;
    gs.sbloccati["ric_" + ric.id] = true;
    $("pannello-ricerche").classList.remove("oculto");
    creaSchedaRicerca(ric);
    registra("Nuova ricerca disponibile: " + ric.nome + ".", "evento");
  });
  /* costanti fondamentali */
  COSTANTI.forEach(function (c) {
    if (gs.sbloccati["cost_" + c.id] || !c.cond(gs)) return;
    gs.sbloccati["cost_" + c.id] = true;
    $("pannello-costanti").classList.remove("oculto");
    creaRigaCostante(c);
    registra("Ora puoi regolare una legge dell'universo: " + c.nome + ".", "traguardo");
  });
  /* statistiche: compaiono quando il gioco ha preso corpo */
  if (!gs.sbloccati.statistiche && gs.generatori.fluttuazione >= 1) {
    gs.sbloccati.statistiche = true;
    $("pannello-statistiche").classList.remove("oculto");
  }
  $("fase-corrente").textContent = NOMI_FASI[gs.fase] || NOMI_FASI[0];
}

/* ============================================================================
   7. COSTRUZIONE DELLA UI
   Ogni elemento è creato una sola volta e poi aggiornato sul posto: nessun
   innerHTML ricostruito a ogni tick (perderebbe hover, focus e click).
============================================================================ */
var nodi = { risorse: {}, azioni: {}, generatori: {}, ricerche: {}, costanti: {} };

function creaRigaRisorsa(r) {
  var d = document.createElement("div");
  d.className = "risorsa nuova";
  d.innerHTML = '<span class="nome"></span><span><span class="quantita"></span> <span class="tasso"></span></span>';
  d.querySelector(".nome").textContent = r.nome;
  $("lista-risorse").appendChild(d);
  nodi.risorse[r.id] = {
    quantita: d.querySelector(".quantita"),
    tasso: d.querySelector(".tasso")
  };
}

function creaBottoneAzione(a) {
  var b = document.createElement("button");
  if (a.principale) b.className = "principale";
  b.innerHTML = '<span class="titolo"></span><span class="dettaglio"></span>';
  b.querySelector(".titolo").textContent = a.nome;
  b.addEventListener("click", function () { eseguiAzione(a.id); });
  $("lista-azioni").appendChild(b);
  nodi.azioni[a.id] = { bottone: b, dettaglio: b.querySelector(".dettaglio") };
}

function creaSchedaGeneratore(gen) {
  var d = document.createElement("div");
  d.className = "generatore nuova";
  d.innerHTML =
    '<div class="intestazione"><span class="gnome"></span><span class="posseduti">0</span></div>' +
    '<div class="descrizione"></div>' +
    '<div class="flusso"></div>' +
    '<button><span class="titolo">Costruisci</span><span class="dettaglio"></span></button>' +
    '<div class="carenza"></div>';
  d.querySelector(".gnome").textContent = gen.nome;
  d.querySelector(".descrizione").textContent = gen.descrizione;
  d.querySelector("button").addEventListener("click", function () { compraGeneratore(gen.id); });
  $("lista-generatori").appendChild(d);
  nodi.generatori[gen.id] = {
    posseduti: d.querySelector(".posseduti"),
    flusso: d.querySelector(".flusso"),
    bottone: d.querySelector("button"),
    dettaglio: d.querySelector(".dettaglio"),
    carenza: d.querySelector(".carenza")
  };
}

function creaRigaCostante(c) {
  var d = document.createElement("div");
  d.className = "costante nuova";
  d.innerHTML =
    '<div class="riga-c">' +
      '<span class="nome-c"></span>' +
      '<span class="comandi">' +
        '<button class="meno" title="Diminuisci">−</button>' +
        '<span class="valore"></span>' +
        '<button class="piu" title="Aumenta">+</button>' +
      '</span>' +
    '</div><div class="effetto"></div>';
  d.querySelector(".nome-c").innerHTML = c.nome + "<em>" + c.simbolo + "</em>";
  d.querySelector(".meno").addEventListener("click", function () { regolaCostante(c.id, -1); });
  d.querySelector(".piu").addEventListener("click", function () { regolaCostante(c.id, 1); });
  $("lista-costanti").appendChild(d);
  nodi.costanti[c.id] = {
    valore: d.querySelector(".valore"),
    effetto: d.querySelector(".effetto"),
    meno: d.querySelector(".meno"),
    piu: d.querySelector(".piu")
  };
}

function creaSchedaRicerca(ric) {
  var d = document.createElement("div");
  d.className = "ricerca nuova" + (ric.traguardo ? " traguardo" : "");
  d.innerHTML =
    '<div class="rnome"></div><div class="rdesc"></div>' +
    '<button><span class="titolo"></span><span class="dettaglio"></span></button>';
  d.querySelector(".rnome").textContent = ric.nome;
  d.querySelector(".rdesc").textContent = ric.descrizione;
  d.querySelector(".titolo").textContent = ric.traguardo ? "Compi il passo" : "Ricerca";
  d.querySelector("button").addEventListener("click", function () { compraRicerca(ric.id); });
  $("lista-ricerche").appendChild(d);
  nodi.ricerche[ric.id] = {
    scheda: d,
    bottone: d.querySelector("button"),
    dettaglio: d.querySelector(".dettaglio")
  };
}

/* --- Testo dei costi, con evidenziato ciò che manca ---------------------- */
/* Il testo dei costi arriva solo dai dati del gioco, mai dal giocatore:
   l'HTML qui serve a colorare in rosso ciò che non ci si può permettere. */
function testoCosto(costo) {
  var parti = [];
  for (var r in costo) {
    var pezzo = fmt(costo[r]) + " " + nomeRisorsa(r);
    if ((gs.risorse[r] || 0) < costo[r]) pezzo = '<span class="costo-mancante">' + pezzo + "</span>";
    parti.push(pezzo);
  }
  return parti.join(" · ");
}

function nomeRisorsa(id) {
  for (var i = 0; i < RISORSE.length; i++) if (RISORSE[i].id === id) return RISORSE[i].nome;
  return id;
}

/* ============================================================================
   8. AGGIORNAMENTO DELLA UI
============================================================================ */
function disegna() {
  var tassi = tassiCorrenti();

  /* risorse */
  RISORSE.forEach(function (r) {
    var n = nodi.risorse[r.id];
    if (!n) return;
    n.quantita.textContent = fmt(gs.risorse[r.id] || 0);
    var t = tassi[r.id] || 0;
    if (r.id === "sfere") { n.tasso.textContent = ""; return; }
    n.tasso.textContent = t === 0 ? "" : (t > 0 ? "+" : "") + fmtTasso(t) + "/s";
    n.tasso.className = "tasso" + (t < 0 ? " negativo" : "");
  });

  /* azioni */
  AZIONI.forEach(function (a) {
    var n = nodi.azioni[a.id];
    if (!n) return;
    var resa = [];
    for (var r in a.resa) resa.push("+" + fmt(a.resa[r] * (a.scala === "click" ? moltiplicatoreClick() : 1)) + " " + nomeRisorsa(r));
    var costo = Object.keys(a.costo).length ? "costa " + testoCosto(a.costo) + " · " : "";
    n.dettaglio.innerHTML = costo + resa.join(", ");
    n.bottone.disabled = !puoPagare(a.costo);
  });

  /* generatori */
  GENERATORI.forEach(function (gen) {
    var n = nodi.generatori[gen.id];
    if (!n) return;
    var posseduti = gs.generatori[gen.id] || 0;
    n.posseduti.textContent = fmt(posseduti);

    var flusso = [];
    for (var p in gen.produce) {
      if (gen.produce[p] > 0) {
        var perUno = gen.produce[p] * (gs.molt.generatori[gen.id] || 1) * moltiplicatoreGlobale() *
                     fattoreCostanti(gen, true);
        flusso.push('<span class="prod">+' + fmtTasso(perUno) + " " + nomeRisorsa(p) + "/s</span>");
      }
    }
    if (gen.consuma) for (var c in gen.consuma) {
      flusso.push('<span class="cons">−' + fmtTasso(gen.consuma[c] * fattoreCostanti(gen, false)) +
                  " " + nomeRisorsa(c) + "/s</span>");
    }
    if (gen.id === "dyson") flusso.push('<span class="prod">+10% a ogni produzione</span>');
    n.flusso.innerHTML = "ciascuna: " + flusso.join(" · ");

    var costo = costoAttuale(gen);
    n.dettaglio.innerHTML = testoCosto(costo);
    n.bottone.disabled = !puoPagare(costo);

    var eff = gs.efficienza[gen.id];
    n.carenza.textContent = (posseduti > 0 && eff !== undefined && eff < 0.97)
      ? "⚠ input insufficiente — opera al " + Math.round(eff * 100) + "%"
      : "";
  });

  /* ricerche */
  var visibili = 0;
  RICERCHE.forEach(function (ric) {
    var n = nodi.ricerche[ric.id];
    if (!n) return;
    if (gs.ricerche[ric.id]) {
      n.scheda.classList.add("oculto");
      n.bottone.disabled = true;   // nascosta ma ancora cliccabile via tastiera/script
      return;
    }
    visibili++;
    var extra = ric.condExtra && !ric.condExtra(gs);
    n.dettaglio.innerHTML = testoCosto(ric.costo) +
      (ric.id === "ascensione" ? " · richiede 8 Sfere di Dyson (" + gs.generatori.dyson + "/8)" : "");
    n.bottone.disabled = !puoPagare(ric.costo) || extra;
  });
  var nessuna = $("nessuna-ricerca");
  if (nessuna) nessuna.classList.toggle("oculto", visibili > 0);

  /* costanti */
  COSTANTI.forEach(function (c) {
    var n = nodi.costanti[c.id];
    if (!n) return;
    var v = gs.costanti[c.id];
    n.valore.textContent = v + " / " + c.max;
    n.effetto.innerHTML = c.effetto(v);
    n.meno.disabled = v <= c.min;
    n.piu.disabled = v >= c.max;
  });

  /* statistiche */
  if (gs.sbloccati.statistiche) {
    var minuti = Math.floor((Date.now() - gs.inizio) / 60000);
    $("lista-statistiche").innerHTML =
      riga("Azioni manuali", fmt(gs.click)) +
      riga("Potenza del click", "×" + fmt(moltiplicatoreClick())) +
      riga("Moltiplicatore globale", "×" + (Math.round(moltiplicatoreGlobale() * 100) / 100)) +
      riga("Tempo di gioco", minuti + " min");
  }
}

function riga(etichetta, valore) {
  return '<div class="risorsa"><span class="nome">' + etichetta + '</span><span class="quantita">' + valore + "</span></div>";
}

/* ============================================================================
   9. SCHERMATA FINALE
============================================================================ */
function mostraFinale() {
  $("finale-testo").textContent =
    "Hai cominciato con un vuoto che non conteneva nulla, e da quel nulla hai " +
    "estratto energia, poi materia, poi stelle, poi mondi, poi menti. Ora l'universo " +
    "che hai costruito ti guarda, e ha capito di essere stato costruito.";
  var minuti = Math.floor((Date.now() - gs.inizio) / 60000);
  $("finale-statistiche").innerHTML =
    riga("Azioni manuali", fmt(gs.click)) +
    riga("Sfere di Dyson", fmt(gs.generatori.dyson)) +
    riga("Intelligenza totale", fmt(gs.totali.intelligenza)) +
    riga("Biomassa totale", fmt(gs.totali.biomassa)) +
    riga("Tempo impiegato", minuti + " minuti");
  $("finale").classList.remove("oculto");
  registra("ASCENSIONE COSMICA — l'universo è completo.", "traguardo");
}

/* ============================================================================
   9-bis. TEMA
   Il tema scuro resta il predefinito: è l'identità del gioco. La scelta del
   giocatore viene ricordata, se il browser lo consente.
============================================================================ */
var CHIAVE_TEMA = "singularitas_tema";

function applicaTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  var b = $("btn-tema");
  if (b) b.textContent = tema === "chiaro" ? "Tema scuro" : "Tema chiaro";
  archivio.scrivi(CHIAVE_TEMA, tema);
}

function temaCorrente() {
  return document.documentElement.getAttribute("data-tema") === "chiaro" ? "chiaro" : "scuro";
}

/* ============================================================================
   10. SALVATAGGIO
============================================================================ */
function salva(silenzioso) {
  gs.ultimoAccesso = Date.now();
  var ok = archivio.scrivi(CHIAVE_SALVATAGGIO, JSON.stringify(gs));
  var stato = $("stato-salvataggio");
  if (stato) stato.textContent = ok
    ? (silenzioso ? "" : "Partita salvata.")
    : "Questo browser non consente il salvataggio: i progressi non verranno conservati.";
  return ok;
}

function carica() {
  var grezzo = archivio.leggi(CHIAVE_SALVATAGGIO);
  if (!grezzo) return false;
  try {
    var salvato = JSON.parse(grezzo);
    var base = statoIniziale();
    /* fusione difensiva: un salvataggio vecchio non deve rompere il gioco */
    for (var k in base) if (!(k in salvato)) salvato[k] = base[k];
    RISORSE.forEach(function (r) {
      if (typeof salvato.risorse[r.id] !== "number") salvato.risorse[r.id] = 0;
      if (typeof salvato.totali[r.id] !== "number") salvato.totali[r.id] = 0;
    });
    GENERATORI.forEach(function (x) {
      if (typeof salvato.generatori[x.id] !== "number") salvato.generatori[x.id] = 0;
      if (typeof salvato.molt.generatori[x.id] !== "number") salvato.molt.generatori[x.id] = 1;
    });
    if (!salvato.costanti) salvato.costanti = {};
    COSTANTI.forEach(function (c) {
      var v = salvato.costanti[c.id];
      if (typeof v !== "number" || v < c.min || v > c.max) salvato.costanti[c.id] = 5;
    });
    gs = salvato;
    if (!gs.efficienza) gs.efficienza = {};
    return true;
  } catch (e) {
    return false;
  }
}

function progressoOffline() {
  var trascorso = (Date.now() - (gs.ultimoAccesso || Date.now())) / 1000;
  trascorso = Math.min(trascorso, 8 * 3600);          // al massimo 8 ore
  if (trascorso < 60) return;
  var passi = 300;
  for (var i = 0; i < passi; i++) produci(trascorso / passi);
  registra("Mentre eri via l'universo ha continuato a evolversi (" +
           Math.floor(trascorso / 60) + " minuti).", "buono");
}

/* ============================================================================
   11. AVVIO E GAME LOOP
============================================================================ */
function ricostruisciUI() {
  ["lista-risorse", "lista-azioni", "lista-generatori", "lista-ricerche", "lista-costanti"].forEach(function (id) {
    $(id).innerHTML = "";
  });
  nodi = { risorse: {}, azioni: {}, generatori: {}, ricerche: {}, costanti: {} };
  gs.sbloccati = {};
  $("pannello-generatori").classList.add("oculto");
  $("pannello-ricerche").classList.add("oculto");
  $("pannello-costanti").classList.add("oculto");
  $("pannello-statistiche").classList.add("oculto");
  $("finale").classList.toggle("oculto", !gs.asceso);
  /* rivelare di nuovo ciò che il giocatore ha già non è una notizia */
  silenzioLog = true;
  verificaSblocchi();
  silenzioLog = false;
  disegna();
}

function nuovaPartita() {
  gs = statoIniziale();
  $("log").innerHTML = "";
  ricostruisciUI();
  registra("Non c'è spazio, non c'è tempo, non c'è materia.", "traguardo");
  registra("Ma il vuoto non è mai davvero vuoto: fluttua. E da una fluttuazione si può estrarre energia.");
}

function avvia() {
  if (carica()) {
    ricostruisciUI();
    registra("Universo ripristinato.", "buono");
    progressoOffline();
  } else {
    nuovaPartita();
  }

  if (!archivio.scrivi("singularitas_test", "1")) {
    registra("Attenzione: questo browser non consente il salvataggio su file locali. " +
             "I progressi andranno persi alla chiusura.", "traguardo");
  } else {
    archivio.cancella("singularitas_test");
  }

  applicaTema(archivio.leggi(CHIAVE_TEMA) === "chiaro" ? "chiaro" : "scuro");
  $("btn-tema").addEventListener("click", function () {
    applicaTema(temaCorrente() === "chiaro" ? "scuro" : "chiaro");
  });

  $("btn-salva").addEventListener("click", function () { salva(false); });
  $("btn-reset").addEventListener("click", function () {
    if (confirm("Azzerare la partita e ricominciare dal vuoto?")) {
      archivio.cancella(CHIAVE_SALVATAGGIO);
      nuovaPartita();
    }
  });
  $("btn-ricomincia").addEventListener("click", function () {
    archivio.cancella(CHIAVE_SALVATAGGIO);
    nuovaPartita();
  });

  /* Game loop a 100 ms: produzione, sblocchi, ridisegno. */
  var ultimo = Date.now();
  setInterval(function () {
    var ora = Date.now();
    var dt = Math.min((ora - ultimo) / 1000, 1);   // niente salti dopo un tab in background
    ultimo = ora;
    if (!gs.asceso) produci(dt);
    verificaSblocchi();
    disegna();
  }, 100);

  setInterval(function () { salva(true); }, 15000);
  window.addEventListener("beforeunload", function () { salva(true); });

  window.__avviato = true;
}

avvia();

})();
