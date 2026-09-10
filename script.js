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
/* `unita` e `perUnita` servono solo a leggere le quantità: un'unità di gioco di
   elio vale un milione di masse solari, così accendere una galassia costa
   miliardi di masse solari invece di un implausibile "6k". Il bilanciamento
   interno resta espresso nelle unità di gioco e non cambia. */
var RISORSE = [
  { id: "energia",      nome: "Energia Quantistica", cond: function () { return true; } },
  { id: "quark",        nome: "Quark",
    cond: function (g) { return g.totali.energia >= 40; } },
  { id: "idrogeno",     nome: "Idrogeno", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 2; } },
  { id: "elio",         nome: "Elio", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 2; } },
  { id: "polvere",      nome: "Polvere Stellare", unita: "M☉", perUnita: 1e3,
    cond: function (g) { return g.fase >= 2; } },
  { id: "acqua",        nome: "Acqua", unita: "M⊕", perUnita: 1,
    cond: function (g) { return g.fase >= 3; } },
  { id: "carbonio",     nome: "Carbonio", unita: "M⊕", perUnita: 1,
    cond: function (g) { return g.fase >= 3; } },
  { id: "biomassa",     nome: "Biomassa", unita: "Gt", perUnita: 1e3,
    cond: function (g) { return g.fase >= 3; } },
  { id: "intelligenza", nome: "Intelligenza", unita: "menti", perUnita: 1e6,
    cond: function (g) { return g.fase >= 4; } },
  { id: "sfere",        nome: "Sfere di Dyson",      cond: function (g) { return g.generatori.dyson > 0; } }
];

/* --- Azioni manuali ------------------------------------------------------ */
/* `secondi` àncora la resa alla produzione automatica del momento: senza,
   un'azione manuale che dà +1 diventa irrilevante appena i generatori
   producono migliaia al secondo. Si prende sempre il maggiore fra la resa
   fissa e quel tanto di produzione. */
var AZIONI = [
  {
    id: "click_energia",
    nome: "Raccogli Energia Quantistica",
    descrizione: "Estrai energia dalle fluttuazioni del vuoto.",
    principale: true,
    costo: {},
    resa: { energia: 1 },
    secondi: 2,
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
    secondi: 2,
    scala: "click",
    cond: function (g) { return g.sbloccati.quark; }
  },
  {
    id: "click_idrogeno",
    nome: "Comprimi una Nube",
    descrizione: "Stringi a mano una nube fredda finché non si accende.",
    principale: false,
    costo: { quark: 40 },
    resa: { idrogeno: 2 },
    secondi: 3,
    scala: "click",
    cond: function (g) { return g.fase >= 2; }
  },
  {
    id: "click_polvere",
    nome: "Innesca una Supernova",
    descrizione: "Spingi una stella morente oltre il limite e raccogline le ceneri.",
    principale: false,
    costo: { elio: 60 },
    resa: { polvere: 3 },
    secondi: 3,
    scala: "click",
    cond: function (g) { return g.totali.polvere >= 50; }
  },
  {
    id: "click_biomassa",
    nome: "Semina un Mondo",
    descrizione: "Deponi la prima chimica replicante su un pianeta tiepido.",
    principale: false,
    costo: { acqua: 50, carbonio: 30 },
    resa: { biomassa: 2 },
    secondi: 3,
    scala: "click",
    cond: function (g) { return g.fase >= 3 && g.totali.biomassa >= 20; }
  },
  {
    id: "click_intelligenza",
    nome: "Ispira una Civiltà",
    descrizione: "Suggerisci un'idea a chi sta già guardando il cielo.",
    principale: false,
    costo: { biomassa: 200 },
    resa: { intelligenza: 2 },
    secondi: 3,
    scala: "click",
    cond: function (g) { return g.fase >= 4; }
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
  /* --------- Ripetibili: costo crescente, effetto che si accumula --------- */
  {
    id: "armonia", nome: "Armonia Quantistica", ripetibile: true, crescitaCosto: 5,
    descrizione: "Sintonizza il vuoto con la materia: ogni livello aumenta del 25% tutta la produzione automatica.",
    costo: { energia: 20000 },
    cond: function (g) { return g.fase >= 2; },
    effetto: function (g) { g.molt.globale *= 1.25; }
  },
  {
    id: "sinfonia", nome: "Sinfonia Stellare", ripetibile: true, crescitaCosto: 5,
    descrizione: "Coordina il ciclo delle stelle: ogni livello aumenta del 35% tutta la produzione automatica.",
    costo: { polvere: 30000 },
    cond: function (g) { return g.fase >= 3; },
    effetto: function (g) { g.molt.globale *= 1.35; }
  },
  {
    id: "pensiero", nome: "Pensiero Profondo", ripetibile: true, crescitaCosto: 5,
    descrizione: "Le menti ripensano le leggi da capo: ogni livello aumenta del 50% tutta la produzione automatica.",
    costo: { intelligenza: 60000 },
    cond: function (g) { return g.fase >= 4; },
    effetto: function (g) { g.molt.globale *= 1.5; }
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

/* --- Eventi cosmici: ogni tanto il cosmo propone una scelta con due esiti
   davvero diversi. `bonus` applica un moltiplicatore temporaneo, `subito`
   agisce all'istante sulle risorse. --------------------------------------- */
var EVENTI = [
  {
    id: "nube",
    titolo: "Nube molecolare in transito",
    testo: "Una nube fredda e densa attraversa la regione. Puoi catturarla ora o " +
           "lasciarla condensare da sé.",
    cond: function (g) { return g.fase >= 2; },
    scelte: [
      { testo: "Catturala subito", dettaglio: "guadagno immediato di idrogeno",
        applica: function (g) {
          var q = Math.max(200, g.risorse.idrogeno * 0.5 + tassiCorrenti().idrogeno * 120);
          aggiungi("idrogeno", q);
          return "La nube viene inghiottita: +" + fmt(q) + " Idrogeno.";
        } },
      { testo: "Lasciala collassare", dettaglio: "Nebulose ×3 per 90 secondi",
        applica: function () {
          attivaBonus("nebulosa", 3, 90, "Nebulose ×3");
          return "La nube collassa da sé: le Nebulose lavorano al triplo per 90 secondi.";
        } }
    ]
  },
  {
    id: "vicina",
    titolo: "Supernova vicina",
    testo: "Una stella massiccia sta per esplodere a poca distanza dai mondi abitati.",
    cond: function (g) { return g.fase >= 3 && g.risorse.biomassa > 100; },
    scelte: [
      { testo: "Schermare i mondi", dettaglio: "costa metà della polvere stellare",
        applica: function (g) {
          var costo = g.risorse.polvere * 0.5;
          g.risorse.polvere -= costo;
          return "Scudi di polvere deviano la radiazione: −" + fmt(costo) + " Polvere Stellare, nessuna perdita.";
        } },
      { testo: "Lasciar fare alla natura", dettaglio: "perdi un quarto della biomassa, ma piovono metalli",
        applica: function (g) {
          var persa = g.risorse.biomassa * 0.25;
          g.risorse.biomassa -= persa;
          var guadagno = persa * 2;
          aggiungi("polvere", guadagno);
          return "Le atmosfere bruciano: −" + fmt(persa) + " Biomassa, +" + fmt(guadagno) + " Polvere Stellare.";
        } }
    ]
  },
  {
    id: "allineamento",
    titolo: "Allineamento gravitazionale",
    testo: "Per un breve intervallo le masse della regione cospirano nella stessa direzione.",
    cond: function (g) { return g.fase >= 2; },
    scelte: [
      { testo: "Sfruttarlo per comprimere", dettaglio: "Fornaci Stellari ×4 per 60 secondi",
        applica: function () {
          attivaBonus("fornace", 4, 60, "Fornaci Stellari ×4");
          return "La compressione accende le fornaci: ×4 per 60 secondi.";
        } },
      { testo: "Sfruttarlo per disperdere", dettaglio: "Supernove ×4 per 60 secondi",
        applica: function () {
          attivaBonus("supernova", 4, 60, "Supernove ×4");
          return "L'onda di marea squarcia le stelle morenti: Supernove ×4 per 60 secondi.";
        } }
    ]
  },
  {
    id: "cometario",
    titolo: "Sciame cometario",
    testo: "Migliaia di corpi ghiacciati entrano nel sistema interno.",
    cond: function (g) { return g.fase >= 3; },
    scelte: [
      { testo: "Dirigerli sui mondi aridi", dettaglio: "guadagno immediato di acqua",
        applica: function (g) {
          var q = Math.max(500, g.risorse.acqua * 0.6);
          aggiungi("acqua", q);
          return "Ghiaccio che diventa oceano: +" + fmt(q) + " Acqua.";
        } },
      { testo: "Frantumarli per estrarne carbonio", dettaglio: "guadagno immediato di carbonio",
        applica: function (g) {
          var q = Math.max(400, g.risorse.carbonio * 0.6);
          aggiungi("carbonio", q);
          return "Polvere organica ovunque: +" + fmt(q) + " Carbonio.";
        } }
    ]
  },
  {
    id: "domanda",
    titolo: "Una domanda dal basso",
    testo: "Una civiltà ha calcolato l'età dell'universo e chiede, rivolta al cielo, " +
           "se qualcuno stia ascoltando.",
    cond: function (g) { return g.fase >= 4 && g.risorse.intelligenza > 500; },
    scelte: [
      { testo: "Rispondere", dettaglio: "Colonie Planetarie ×3 per 120 secondi",
        applica: function () {
          attivaBonus("colonia", 3, 120, "Colonie Planetarie ×3");
          return "Qualcosa risponde. Le colonie fioriscono: ×3 per 120 secondi.";
        } },
      { testo: "Restare in silenzio", dettaglio: "Calcolatori Quantistici ×3 per 120 secondi",
        applica: function () {
          attivaBonus("calcolatore", 3, 120, "Calcolatori Quantistici ×3");
          return "Il silenzio li spinge a cercare da soli: Calcolatori ×3 per 120 secondi.";
        } }
    ]
  }
];

/* --- Bivi: ogni traguardo di fase apre una scelta fra due vie che si
   escludono a vicenda. Valgono per l'universo in corso, quindi due partite
   possono svilupparsi in modo diverso a parità di scelte iniziali. ------- */
var BIVI = [
  {
    id: "sintesi_idrogeno",
    titolo: "La prima materia",
    testo: "I protoni appena formati possono addensarsi in nubi immense o " +
           "accendersi subito in fornaci. Non potrai avere entrambe le cose.",
    scelte: [
      { nome: "Via della Materia", dettaglio: "Nebulose ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "nebulosa", 2); } },
      { nome: "Via della Luce", dettaglio: "Fornaci Stellari ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "fornace", 2); } }
    ]
  },
  {
    id: "galassia",
    titolo: "La forma della galassia",
    testo: "La spirale può bruciare in fretta le sue stelle massicce, oppure " +
           "custodire mondi freddi ai suoi margini.",
    scelte: [
      { nome: "Via delle Stelle", dettaglio: "Supernove ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "supernova", 2); } },
      { nome: "Via dei Mondi", dettaglio: "Comete Ghiacciate ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "cometa", 2); } }
    ]
  },
  {
    id: "senziente",
    titolo: "La natura della mente",
    testo: "Le prime menti sono nate dalla carne. Possono restarci, oppure " +
           "trasferirsi su un substrato che non invecchia.",
    scelte: [
      { nome: "Via della Carne", dettaglio: "Colonie Planetarie ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "colonia", 2); } },
      { nome: "Via della Macchina", dettaglio: "Calcolatori Quantistici ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "calcolatore", 2); } }
    ]
  }
];

/* ============================================================================
   2. STATO
============================================================================ */
var CHIAVE_LEGACY = "singularitas_v1";     // salvataggi anteriori agli slot
var CHIAVE_SLOT = "singularitas_slot";
var slotAttivo = 1;

function chiaveSalvataggio(slot) {
  return "singularitas_v1_s" + (slot || slotAttivo);
}

function caricaSlotAttivo() {
  var v = parseInt(archivio.leggi(CHIAVE_SLOT), 10);
  slotAttivo = (v >= 1 && v <= 3) ? v : 1;
  /* Una partita salvata prima degli slot diventa lo slot 1, così nessuno la perde. */
  var vecchio = archivio.leggi(CHIAVE_LEGACY);
  if (vecchio && !archivio.leggi(chiaveSalvataggio(1))) {
    archivio.scrivi(chiaveSalvataggio(1), vecchio);
    archivio.cancella(CHIAVE_LEGACY);
  }
}
var CHIAVE_META = "singularitas_meta";

/* Le Costanti Universali non appartengono a un universo: restano fra un ciclo
   e l'altro e sono l'unico progresso che la Trascendenza non azzera. */
var meta = { cu: 0, cicli: 0, ascensioni: 0, manager: {} };

function caricaMeta() {
  try {
    var grezzo = archivio.leggi(CHIAVE_META);
    if (!grezzo) return;
    var m = JSON.parse(grezzo);
    if (typeof m.cu === "number" && isFinite(m.cu)) meta.cu = Math.max(0, Math.floor(m.cu));
    if (typeof m.cicli === "number") meta.cicli = Math.max(0, Math.floor(m.cicli));
    if (typeof m.ascensioni === "number") meta.ascensioni = Math.max(0, Math.floor(m.ascensioni));
    if (m.manager && typeof m.manager === "object") meta.manager = m.manager;
  } catch (e) { /* meta illeggibile: si riparte da zero, non è un errore fatale */ }
}
function salvaMeta() { archivio.scrivi(CHIAVE_META, JSON.stringify(meta)); }

/* Bonus permanente: ogni Costante Universale vale +5% alla produzione
   automatica e +2% alla raccolta manuale. */
function bonusMeta()      { return 1 + meta.cu * 0.05; }
function bonusMetaClick() { return 1 + meta.cu * 0.02; }

/* Quanto renderebbe trascendere adesso. L'esponente sotto 1 evita che una
   partita lunghissima renda irrilevanti tutte le successive. */
function cuGuadagnate() {
  var base = gs.totali.intelligenza / 5000;
  if (base <= 1) return 0;
  return Math.floor(Math.pow(base, 0.6));
}

/* Il prezzo cresce con quanti manager sono già stati assunti: il primo è
   accessibile, l'automazione completa è un traguardo di lungo periodo. */
function quantiManager() {
  var n = 0;
  for (var k in meta.manager) if (meta.manager[k]) n++;
  return n;
}
function costoManager() { return 3 * Math.pow(2, quantiManager()); }

function assumiManager(idGeneratore) {
  if (meta.manager[idGeneratore]) return;
  var costo = costoManager();
  if (meta.cu < costo) return;
  meta.cu -= costo;
  meta.manager[idGeneratore] = true;
  salvaMeta();
  var g = null;
  GENERATORI.forEach(function (x) { if (x.id === idGeneratore) g = x; });
  registra("Manager assunto: " + (g ? g.nome : idGeneratore) +
           " verrà ricomprato da solo, in questo universo e nei prossimi.", "buono");
  disegna();
}

/* Un manager ricompra solo quando la spesa resta sotto un quarto della riserva:
   così non prosciuga mai la risorsa che serve agli anelli superiori. */
function agisciManager(dt) {
  gs.attesaManager = (gs.attesaManager || 0) - dt;
  if (gs.attesaManager > 0) return;
  gs.attesaManager = 1;                       // al più un acquisto al secondo
  GENERATORI.forEach(function (gen) {
    if (!meta.manager[gen.id] || !gs.sbloccati["gen_" + gen.id]) return;
    var costo = costoMultiplo(gen, 1);
    for (var r in costo) {
      if ((gs.risorse[r] || 0) < costo[r] * 4) return;
    }
    paga(costo);
    gs.generatori[gen.id] += 1;
  });
}

function trascendi(moltiplicatore) {
  var guadagno = cuGuadagnate() * (moltiplicatore || 1);
  meta.cu += guadagno;
  meta.cicli++;
  salvaMeta();
  archivio.cancella(chiaveSalvataggio());
  nuovaPartita();
  registra("Un nuovo Big Bang. Porti con te " + fmt(meta.cu) +
           " Costanti Universali: +" + Math.round((bonusMeta() - 1) * 100) +
           "% alla produzione di questo universo.", "traguardo");
  return guadagno;
}

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
    quantitaAcquisto: 1,
    bonus: [],                    // moltiplicatori temporanei attivi
    vie: {},                      // bivi già risolti: id del traguardo -> nome della via
    bivioAperto: null,
    eventoAttivo: null,
    prossimoEvento: 150,          // secondi al primo evento
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

var SUFFISSI = ["", "k", "M", "G", "T", "P", "E", "Z", "Y", "R", "Q"];
function fmt(n) {
  if (n === Infinity) return "∞";
  if (!isFinite(n) || isNaN(n)) return "0";
  if (n < 0) return "-" + fmt(-n);
  if (n < 1000) return n < 10 ? (Math.round(n * 10) / 10).toString() : Math.floor(n).toString();

  /* Il logaritmo in virgola mobile può sbagliare l'esponente di uno
     (log10(1e33) vale 32.999…), quindi la mantissa va ricontrollata. */
  var e = Math.floor(Math.log(n) / Math.LN10);
  var mantissa = n / Math.pow(10, e);
  if (Number(mantissa.toFixed(3)) >= 10) { mantissa /= 10; e++; }

  var i = Math.floor(e / 3);
  if (i < SUFFISSI.length) {
    var v = n / Math.pow(1000, i);
    if (Number(v.toFixed(2)) >= 1000 && i + 1 < SUFFISSI.length) { v /= 1000; i++; }
    return v.toFixed(2) + SUFFISSI[i];
  }
  /* Oltre l'ultimo suffisso: notazione esponenziale. */
  return mantissa.toFixed(2) + "e" + e;
}

/* Da secondi a una durata leggibile, per l'avviso di esaurimento. */
function fmtDurata(sec) {
  if (!isFinite(sec)) return "";
  if (sec < 60) return Math.max(1, Math.round(sec)) + " s";
  if (sec < 3600) return Math.round(sec / 60) + " min";
  if (sec < 86400) return Math.round(sec / 3600) + " h";
  return Math.round(sec / 86400) + " g";
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
  return gs.molt.globale * (1 + gs.generatori.dyson * 0.1) *
         (1.4 - gs.costanti.lambda * 0.08) * bonusMeta();
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
  return gs.molt.click * (0.2 + gs.costanti.lambda * 0.16) * bonusMetaClick();
}

/* Costo complessivo di k unità: il prezzo cresce di `crescita` a ogni pezzo,
   quindi la somma è quella di una progressione geometrica. */
function costoMultiplo(gen, k) {
  var n = gs.generatori[gen.id] || 0;
  var c = gen.crescita;
  var fattore = (Math.pow(c, k) - 1) / (c - 1);
  var out = {};
  for (var r in gen.costo) out[r] = gen.costo[r] * Math.pow(c, n) * fattore;
  return out;
}

/* Quante unità si possono comprare con le risorse attuali: si inverte la
   formula della somma geometrica, prendendo il vincolo più stretto. */
function massimoAcquistabile(gen) {
  var n = gs.generatori[gen.id] || 0;
  var c = gen.crescita;
  var k = Infinity;
  for (var r in gen.costo) {
    var prezzoProssimo = gen.costo[r] * Math.pow(c, n);
    var disponibile = gs.risorse[r] || 0;
    if (disponibile < prezzoProssimo) return 0;
    var possibili = Math.floor(Math.log(1 + (disponibile * (c - 1)) / prezzoProssimo) / Math.log(c));
    k = Math.min(k, possibili);
  }
  return Math.max(0, Math.min(k, 1000));   // un tetto evita acquisti assurdi in un solo colpo
}

/* Quante unità comprare secondo il selettore, mai più di quante se ne possano pagare. */
function quantitaDaComprare(gen) {
  var max = massimoAcquistabile(gen);
  if (gs.quantitaAcquisto === "max") return max;
  return Math.min(gs.quantitaAcquisto, max);
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
    var m = n * (gs.molt.generatori[gen.id] || 1) * globale * eff * fattoreCostanti(gen, true) *
            bonusTemporaneo(gen.id);
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
              fattoreCostanti(gen, true) * bonusTemporaneo(gen.id);
      if (q > 0) aggiungi(p, q);
    }
  });
}

/* ============================================================================
   5. AZIONI DEL GIOCATORE
============================================================================ */
/* Produzione lorda di una risorsa: solo i contributi positivi. Usare il flusso
   netto punirebbe proprio chi è in deficit, cioè chi ha più bisogno di
   raccogliere a mano. */
function produzioneLorda(risorsa) {
  var globale = moltiplicatoreGlobale(), totale = 0;
  GENERATORI.forEach(function (gen) {
    var n = gs.generatori[gen.id] || 0;
    if (n <= 0 || !gen.produce[risorsa]) return;
    var eff = gs.efficienza[gen.id] === undefined ? 1 : gs.efficienza[gen.id];
    totale += gen.produce[risorsa] * n * (gs.molt.generatori[gen.id] || 1) * globale * eff *
              fattoreCostanti(gen, true) * bonusTemporaneo(gen.id);
  });
  return totale;
}

/* Quanto rende davvero un'azione. La parte legata alla produzione non passa dal
   moltiplicatore del click: altrimenti, sommandosi a Λ e ai potenziamenti,
   un solo clic varrebbe minuti di produzione. */
function resaAzione(az, risorsa) {
  var m = az.scala === "click" ? moltiplicatoreClick() : 1;
  var fissa = az.resa[risorsa] * m;
  if (!az.secondi) return fissa;
  return Math.max(fissa, produzioneLorda(risorsa) * az.secondi);
}

function eseguiAzione(id) {
  var az = null;
  AZIONI.forEach(function (a) { if (a.id === id) az = a; });
  if (!az || !puoPagare(az.costo)) return;
  paga(az.costo);
  for (var r in az.resa) aggiungi(r, resaAzione(az, r));
  gs.click++;
  lampeggia("rgba(170,200,255,", 0.8);
  disegna();
}

function compraGeneratore(id) {
  var gen = null;
  GENERATORI.forEach(function (x) { if (x.id === id) gen = x; });
  if (!gen) return;
  var k = quantitaDaComprare(gen);
  if (k <= 0) return;
  var costo = costoMultiplo(gen, k);
  if (!puoPagare(costo)) return;
  paga(costo);
  gs.generatori[gen.id] += k;
  if (gen.id === "dyson") {
    gs.risorse.sfere = gs.generatori.dyson;
    gs.totali.sfere = gs.generatori.dyson;
  }
  if (gs.generatori[gen.id] === k) registra("Costruito: " + gen.nome + ".", "buono");
  lampeggia("rgba(255,220,150,", 1.6);
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

/* Livello di una ricerca: 0/1 per quelle una tantum, un contatore per le
   ripetibili, che sono il pozzo in cui riversare le risorse del finale. */
function livelloRicerca(id) {
  var v = gs.ricerche[id];
  return typeof v === "number" ? v : (v ? 1 : 0);
}

function costoRicerca(ric) {
  if (!ric.ripetibile) return ric.costo;
  var liv = livelloRicerca(ric.id);
  var out = {};
  for (var r in ric.costo) out[r] = ric.costo[r] * Math.pow(ric.crescitaCosto, liv);
  return out;
}

function compraRicerca(id) {
  var ric = null;
  RICERCHE.forEach(function (x) { if (x.id === id) ric = x; });
  if (!ric) return;
  if (!ric.ripetibile && gs.ricerche[id]) return;
  var costo = costoRicerca(ric);
  if (!puoPagare(costo)) return;
  if (ric.condExtra && !ric.condExtra(gs)) return;
  paga(costo);
  gs.ricerche[id] = ric.ripetibile ? livelloRicerca(id) + 1 : true;
  registra("Ricerca completata: " + ric.nome +
           (ric.ripetibile ? " (livello " + livelloRicerca(id) + ")" : "") + ".",
           ric.traguardo ? "traguardo" : "evento");
  ric.effetto(gs);
  if (definizioneBivio(id)) apriBivio(id);
  lampeggia("rgba(180,150,255,", 2.4);
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
    if (gs.sbloccati["ric_" + ric.id] || (!ric.ripetibile && gs.ricerche[ric.id]) || !ric.cond(gs)) return;
    gs.sbloccati["ric_" + ric.id] = true;
    $("pannello-ricerche").classList.remove("oculto");
    creaSchedaRicerca(ric);
    registra("Nuova ricerca disponibile: " + ric.nome + ".", "evento");
  });
  /* visualizzazione: appena esiste il primo generatore c'è qualcosa da mostrare */
  if (!gs.sbloccati.universo) {
    gs.sbloccati.universo = true;
    $("pannello-universo").classList.remove("oculto");
  }
  /* trascendenza: compare quando c'è abbastanza intelligenza perché renda */
  if (!gs.sbloccati.trascendenza && gs.totali.intelligenza >= 5000) {
    gs.sbloccati.trascendenza = true;
    $("pannello-trascendenza").classList.remove("oculto");
    registra("Le civiltà intuiscono che il loro universo è uno fra molti possibili.", "traguardo");
  }
  /* automazione: si sblocca quando esistono Costanti Universali da spendere */
  if (!gs.sbloccati.manager && (meta.cu > 0 || quantiManager() > 0)) {
    gs.sbloccati.manager = true;
    $("pannello-manager").classList.remove("oculto");
  }
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
var nodi = { risorse: {}, azioni: {}, generatori: {}, ricerche: {}, costanti: {}, manager: {} };

function creaRigaRisorsa(r) {
  var d = document.createElement("div");
  d.className = "risorsa nuova";
  d.innerHTML = '<span class="nome"></span><span class="grafico"></span>' +
                '<span><span class="quantita"></span> <span class="tasso"></span></span>' +
                '<span class="esaurimento"></span>';
  d.querySelector(".nome").textContent = r.nome;
  $("lista-risorse").appendChild(d);
  nodi.risorse[r.id] = {
    quantita: d.querySelector(".quantita"),
    tasso: d.querySelector(".tasso"),
    grafico: d.querySelector(".grafico"),
    esaurimento: d.querySelector(".esaurimento")
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
    titoloBottone: d.querySelector("button .titolo"),
    flusso: d.querySelector(".flusso"),
    bottone: d.querySelector("button"),
    dettaglio: d.querySelector(".dettaglio"),
    carenza: d.querySelector(".carenza")
  };
}

/* Come per le ricerche: il markup si ricostruisce solo quando cambia l'insieme
   delle righe, non a ogni tick, altrimenti un click può cadere nel vuoto. */
var chiaveManager = null;

function disegnaManager() {
  var elenco = GENERATORI.filter(function (gen) { return gs.sbloccati["gen_" + gen.id]; });
  var chiave = elenco.map(function (gen) {
    return gen.id + (meta.manager[gen.id] ? "!" : "");
  }).join(",");
  var box = $("lista-manager");

  if (chiave !== chiaveManager) {
    box.innerHTML = "";
    nodi.manager = {};
    if (!elenco.length) {
      box.innerHTML = '<div class="nota">Nessuna infrastruttura ancora disponibile.</div>';
    }
    elenco.forEach(function (gen) {
      var d = document.createElement("div");
      d.className = "manager";
      d.innerHTML = '<span class="mnome"></span>';
      d.querySelector(".mnome").textContent = gen.nome;
      if (meta.manager[gen.id]) {
        var stato = document.createElement("span");
        stato.className = "mstato";
        stato.textContent = "automatico";
        d.appendChild(stato);
      } else {
        var b = document.createElement("button");
        b.addEventListener("click", function () { assumiManager(gen.id); });
        d.appendChild(b);
        nodi.manager[gen.id] = b;
      }
      box.appendChild(d);
    });
    chiaveManager = chiave;
  }

  var costoM = costoManager();
  for (var id in nodi.manager) {
    nodi.manager[id].textContent = "assumi · " + fmt(costoM) + " CU";
    nodi.manager[id].disabled = meta.cu < costoM;
  }
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
    titoloScheda: d.querySelector(".rnome"),
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
    var d = defRisorsa(r);
    var pezzo = d && d.unita
      ? fmtQta(r, costo[r]) + " di " + nomeRisorsa(r)
      : fmt(costo[r]) + " " + nomeRisorsa(r);
    if ((gs.risorse[r] || 0) < costo[r]) pezzo = '<span class="costo-mancante">' + pezzo + "</span>";
    parti.push(pezzo);
  }
  return parti.join(" · ");
}

/* Quantità e flussi vanno sempre letti nell'unità della risorsa. */
function defRisorsa(id) {
  for (var i = 0; i < RISORSE.length; i++) if (RISORSE[i].id === id) return RISORSE[i];
  return null;
}

function fmtQta(id, v) {
  var d = defRisorsa(id);
  if (!d || !d.unita) return fmt(v);
  return fmt(v * (d.perUnita || 1)) + " " + d.unita;
}

/* Come sopra ma per i tassi, dove sotto la decina servono i decimali. */
function fmtFlusso(id, v) {
  var d = defRisorsa(id);
  var k = d && d.unita ? (d.perUnita || 1) : 1;
  var x = v * k;
  var testo = Math.abs(x) < 1000 ? fmtTasso(x) : fmt(x);
  return testo + (d && d.unita ? " " + d.unita : "");
}

function nomeRisorsa(id) {
  for (var i = 0; i < RISORSE.length; i++) if (RISORSE[i].id === id) return RISORSE[i].nome;
  return id;
}

/* ============================================================================
   8. AGGIORNAMENTO DELLA UI
============================================================================ */
var storiaDaRidisegnare = false;

function disegna() {
  var tassi = tassiCorrenti();

  /* risorse */
  RISORSE.forEach(function (r) {
    var n = nodi.risorse[r.id];
    if (!n) return;
    n.quantita.textContent = fmtQta(r.id, gs.risorse[r.id] || 0);
    var t = tassi[r.id] || 0;
    if (r.id === "sfere") { n.tasso.textContent = ""; return; }
    n.tasso.textContent = t === 0 ? "" : (t > 0 ? "+" : "") + fmtFlusso(r.id, t) + "/s";
    n.tasso.className = "tasso" + (t < 0 ? " negativo" : "");
    /* Il consumo netto negativo è il collo di bottiglia della catena: dire
       fra quanto la riserva finisce evita di doverlo dedurre scheda per scheda. */
    var quanto = gs.risorse[r.id] || 0;
    if (storiaDaRidisegnare) n.grafico.innerHTML = sparkline(r.id);
    n.esaurimento.textContent = (t < -0.001 && quanto > 0)
      ? "si esaurisce fra " + fmtDurata(quanto / -t)
      : (t < -0.001 ? "esaurita: la catena è ferma" : "");
  });

  /* azioni */
  AZIONI.forEach(function (a) {
    var n = nodi.azioni[a.id];
    if (!n) return;
    var resa = [];
    for (var r in a.resa) resa.push("+" + fmtQta(r, resaAzione(a, r)) + " " + nomeRisorsa(r));
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

    /* Il flusso segue il moltiplicatore selezionato: con ×10 si legge quanto
       renderebbero le dieci unità che si stanno per costruire, non una sola. */
    var k = quantitaDaComprare(gen);
    var kMostrato = Math.max(1, k);
    var flusso = [];
    for (var p in gen.produce) {
      if (gen.produce[p] > 0) {
        var reso = gen.produce[p] * kMostrato * (gs.molt.generatori[gen.id] || 1) *
                   moltiplicatoreGlobale() * fattoreCostanti(gen, true) * bonusTemporaneo(gen.id);
        flusso.push('<span class="prod">+' + fmtFlusso(p, reso) + " " + nomeRisorsa(p) + "/s</span>");
      }
    }
    if (gen.consuma) for (var c in gen.consuma) {
      flusso.push('<span class="cons">−' +
                  fmtFlusso(c, gen.consuma[c] * kMostrato * fattoreCostanti(gen, false)) +
                  " " + nomeRisorsa(c) + "/s</span>");
    }
    if (gen.id === "dyson") flusso.push('<span class="prod">+10% a ogni produzione</span>');
    n.flusso.innerHTML = (kMostrato > 1 ? "×" + kMostrato + ": " : "ciascuna: ") + flusso.join(" · ");

    var costo = costoMultiplo(gen, kMostrato);
    n.titoloBottone.textContent = kMostrato > 1 ? "Costruisci ×" + kMostrato : "Costruisci";
    n.dettaglio.innerHTML = testoCosto(costo);
    n.bottone.disabled = k <= 0;

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
    if (!ric.ripetibile && gs.ricerche[ric.id]) {
      n.scheda.classList.add("oculto");
      n.bottone.disabled = true;   // nascosta ma ancora cliccabile via tastiera/script
      return;
    }
    visibili++;
    var extra = ric.condExtra && !ric.condExtra(gs);
    var costoR = costoRicerca(ric);
    if (ric.ripetibile) n.titoloScheda.textContent = ric.nome + " · liv. " + livelloRicerca(ric.id);
    n.dettaglio.innerHTML = testoCosto(costoR) +
      (ric.id === "ascensione" ? " · richiede 8 Sfere di Dyson (" + gs.generatori.dyson + "/8)" : "");
    n.bottone.disabled = !puoPagare(costoR) || extra;
  });
  var nessuna = $("nessuna-ricerca");
  if (nessuna) nessuna.classList.toggle("oculto", visibili > 0);

  /* automazione */
  if (gs.sbloccati.manager) disegnaManager();

  /* trascendenza */
  if (gs.sbloccati.trascendenza) {
    var g2 = cuGuadagnate();
    $("riepilogo-trascendenza").innerHTML =
      riga("Costanti Universali", fmt(meta.cu)) +
      riga("Bonus attuale", "+" + Math.round((bonusMeta() - 1) * 100) + "% produzione") +
      riga("Trascendendo ora", "+" + fmt(g2) + " CU") +
      riga("Universi vissuti", fmt(meta.cicli));
    $("btn-trascendi").disabled = g2 <= 0;
    $("btn-trascendi").innerHTML = g2 > 0
      ? '<span class="titolo">Trascendi</span><span class="dettaglio">azzera l\'universo · +' + fmt(g2) + " Costanti Universali</span>"
      : '<span class="titolo">Trascendi</span><span class="dettaglio">serve più Intelligenza perché valga la pena</span>';
  }

  /* effetti temporanei in corso */
  var haEffetti = gs.bonus.length > 0;
  $("pannello-effetti").classList.toggle("oculto", !haEffetti);
  if (haEffetti) {
    $("lista-effetti").innerHTML = gs.bonus.map(function (b) {
      return '<div class="effetto-attivo"><span class="quanto">' + b.etichetta +
             '</span><span class="resta">' + Math.ceil(b.resta) + " s</span></div>";
    }).join("");
  }

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
      (meta.cu > 0 ? riga("Costanti Universali", fmt(meta.cu) + " (+" +
                          Math.round((bonusMeta() - 1) * 100) + "%)") : "") +
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
  var premio = cuGuadagnate() * 2;
  $("finale-statistiche").innerHTML +=
    riga("Costanti Universali guadagnate", "+" + fmt(premio) + " (doppie, per l'Ascensione)");
  $("btn-ricomincia").textContent = "Nuovo Big Bang · +" + fmt(premio) + " CU";
  $("finale").classList.remove("oculto");
  registra("ASCENSIONE COSMICA — l'universo è completo.", "traguardo");
}

/* ============================================================================
   8-ter. BIVI FRA LE ERE
============================================================================ */
function definizioneBivio(id) {
  for (var i = 0; i < BIVI.length; i++) if (BIVI[i].id === id) return BIVI[i];
  return null;
}

function apriBivio(id) {
  var b = definizioneBivio(id);
  if (!b || gs.vie[id]) return;
  gs.bivioAperto = id;
  mostraBivio(b);
  registra("Bivio: " + b.titolo + ". La scelta vale per tutto questo universo.", "traguardo");
}

function mostraBivio(b) {
  $("bivio-titolo").textContent = b.titolo;
  $("bivio-testo").textContent = b.testo;
  var box = $("bivio-scelte");
  box.innerHTML = "";
  b.scelte.forEach(function (sc, indice) {
    var bottone = document.createElement("button");
    bottone.innerHTML = '<span class="titolo"></span><span class="dettaglio"></span>';
    bottone.querySelector(".titolo").textContent = sc.nome;
    bottone.querySelector(".dettaglio").textContent = sc.dettaglio;
    bottone.addEventListener("click", function () { scegliBivio(indice); });
    box.appendChild(bottone);
  });
  $("pannello-bivio").classList.remove("oculto");
}

/* Il bivio non scade: resta aperto finché il giocatore non decide. */
function scegliBivio(indice) {
  if (!gs.bivioAperto) return;
  var b = definizioneBivio(gs.bivioAperto);
  if (!b) { gs.bivioAperto = null; $("pannello-bivio").classList.add("oculto"); return; }
  var scelta = b.scelte[indice];
  gs.vie[b.id] = scelta.nome;
  scelta.applica(gs);
  registra("Hai imboccato la " + scelta.nome + ": " + scelta.dettaglio + ".", "traguardo");
  lampeggia("rgba(180,220,255,", 3);
  gs.bivioAperto = null;
  $("pannello-bivio").classList.add("oculto");
  disegna();
}

/* ============================================================================
   8-bis. EVENTI COSMICI
============================================================================ */
function attivaBonus(generatore, fattore, durata, etichetta) {
  gs.bonus.push({ gen: generatore, fattore: fattore, resta: durata, etichetta: etichetta });
}

/* Moltiplicatore temporaneo che agisce su un generatore in questo istante. */
function bonusTemporaneo(idGeneratore) {
  var f = 1;
  for (var i = 0; i < gs.bonus.length; i++) {
    if (gs.bonus[i].gen === idGeneratore) f *= gs.bonus[i].fattore;
  }
  return f;
}

function scalaBonus(dt) {
  var restanti = [];
  for (var i = 0; i < gs.bonus.length; i++) {
    gs.bonus[i].resta -= dt;
    if (gs.bonus[i].resta > 0) restanti.push(gs.bonus[i]);
    else registra("Finito l'effetto: " + gs.bonus[i].etichetta + ".");
  }
  gs.bonus = restanti;
}

function eventiPossibili() {
  return EVENTI.filter(function (e) { return e.cond(gs); });
}

function proponiEvento() {
  var possibili = eventiPossibili();
  if (!possibili.length) return;
  var e = possibili[Math.floor(Math.random() * possibili.length)];
  gs.eventoAttivo = { id: e.id, resta: 45 };
  mostraEvento(e);
  registra("Evento cosmico: " + e.titolo + ".", "traguardo");
}

function definizioneEvento(id) {
  for (var i = 0; i < EVENTI.length; i++) if (EVENTI[i].id === id) return EVENTI[i];
  return null;
}

function mostraEvento(e) {
  $("evento-titolo").textContent = e.titolo;
  $("evento-testo").textContent = e.testo;
  var box = $("evento-scelte");
  box.innerHTML = "";
  e.scelte.forEach(function (sc, indice) {
    var b = document.createElement("button");
    b.innerHTML = '<span class="titolo"></span><span class="dettaglio"></span>';
    b.querySelector(".titolo").textContent = sc.testo;
    b.querySelector(".dettaglio").textContent = sc.dettaglio;
    b.addEventListener("click", function () { scegliEvento(indice); });
    box.appendChild(b);
  });
  $("pannello-evento").classList.remove("oculto");
}

function scegliEvento(indice) {
  if (!gs.eventoAttivo) return;
  var e = definizioneEvento(gs.eventoAttivo.id);
  if (!e) { chiudiEvento(); return; }
  var esito = e.scelte[indice].applica(gs);
  registra(esito, "buono");
  chiudiEvento();
}

function chiudiEvento() {
  gs.eventoAttivo = null;
  gs.prossimoEvento = 120 + Math.random() * 120;   // fra 2 e 4 minuti
  $("pannello-evento").classList.add("oculto");
  disegna();
}

function aggiornaEventi(dt) {
  scalaBonus(dt);
  if (gs.eventoAttivo) {
    gs.eventoAttivo.resta -= dt;
    $("evento-tempo").textContent = "L'occasione svanisce fra " +
      Math.max(0, Math.ceil(gs.eventoAttivo.resta)) + " s";
    if (gs.eventoAttivo.resta <= 0) {
      registra("L'occasione è svanita senza che nessuno la cogliesse.");
      chiudiEvento();
    }
    return;
  }
  if (!eventiPossibili().length) return;
  gs.prossimoEvento -= dt;
  if (gs.prossimoEvento <= 0) proponiEvento();
}

/* ============================================================================
   9-quater. STORICO DEI FLUSSI
   Una sparkline per risorsa: barre ancorate alla linea dello zero, verdi sopra
   e arancioni sotto, così il segno si legge senza dover seguire una curva.
   La storia è volatile di proposito: è decorazione, non merita di gonfiare il
   salvataggio, e ricominciarla dopo una ricarica non toglie nulla.
============================================================================ */
var CAMPIONI = 36;             // finestra mostrata
var INTERVALLO_CAMPIONE = 2;   // secondi fra un campione e l'altro
var storia = {}, attesaCampione = 0;

function campiona(dt) {
  attesaCampione -= dt;
  if (attesaCampione > 0) return false;
  attesaCampione = INTERVALLO_CAMPIONE;
  var tassi = tassiCorrenti();
  RISORSE.forEach(function (r) {
    if (!gs.sbloccati[r.id]) return;
    if (!storia[r.id]) storia[r.id] = [];
    storia[r.id].push(tassi[r.id] || 0);
    if (storia[r.id].length > CAMPIONI) storia[r.id].shift();
  });
  return true;
}

function sparkline(id) {
  var dati = storia[id];
  if (!dati || dati.length < 2) return "";
  var L = 74, A = 18, mezzo = A / 2;
  var passo = L / CAMPIONI;
  var picco = 0;
  for (var i = 0; i < dati.length; i++) picco = Math.max(picco, Math.abs(dati[i]));
  if (picco <= 0) picco = 1;

  var barre = "";
  for (var j = 0; j < dati.length; j++) {
    var v = dati[j];
    var h = Math.abs(v) / picco * (mezzo - 1);
    if (h < 0.5) h = v === 0 ? 0 : 0.5;
    var x = (CAMPIONI - dati.length + j) * passo;
    var y = v >= 0 ? mezzo - h : mezzo;
    barre += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
             '" width="' + Math.max(1, passo - 0.6).toFixed(1) + '" height="' + Math.max(0.6, h).toFixed(1) +
             '" fill="' + (v >= 0 ? "var(--positivo)" : "var(--allarme)") + '"/>';
  }
  var ultimo = dati[dati.length - 1];
  var etichetta = "Andamento recente: da " + fmtTasso(Math.min.apply(null, dati)) +
                  " a " + fmtTasso(Math.max.apply(null, dati)) + " al secondo, ora " + fmtTasso(ultimo) + ".";
  return '<svg viewBox="0 0 ' + L + " " + A + '" width="' + L + '" height="' + A +
         '" role="img" aria-label="' + etichetta + '"><title>' + etichetta + "</title>" +
         '<line x1="0" y1="' + mezzo + '" x2="' + L + '" y2="' + mezzo +
         '" stroke="var(--bordo-chiaro)" stroke-width="0.5"/>' + barre + "</svg>";
}

/* ============================================================================
   9-ter. VISUALIZZAZIONE
   Puramente decorativa: se il browser non offre un canvas il gioco continua
   senza, quindi qui non deve mai propagarsi un errore.
============================================================================ */
var tela = null, pennello = null, TW = 0, TH = 0, semi = [], lampi = [];
var tempoScena = 0, ultimoFotogramma = 0;

function preparaTela() {
  tela = $("universo");
  try { pennello = tela && tela.getContext ? tela.getContext("2d") : null; }
  catch (e) { pennello = null; }
  if (!pennello) return;
  TW = tela.width; TH = tela.height;
  semi = [];
  for (var i = 0; i < 300; i++) {
    var ang = Math.random() * 6.283;
    var vel = 1.5 + Math.random() * 5;      // px/s: deriva lenta, mai immobile
    semi.push({
      x: Math.random() * TW, y: Math.random() * TH,
      vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
      r: Math.random() * 1.4 + 0.35,
      fase: Math.random() * 6.28,
      ritmo: 0.6 + Math.random() * 1.6      // ogni punto scintilla a modo suo
    });
  }
}

/* Scala logaritmica: le quantità crescono di ordini di grandezza, il numero di
   punti disegnati no. */
function scala(n, pieno) {
  if (!(n > 1)) return 0;
  return Math.min(1, Math.log(n) / Math.log(pieno));
}

/* Un lampo dove è appena successo qualcosa: dà un riscontro visivo immediato
   alle azioni manuali e agli acquisti. */
function lampeggia(colore, forza) {
  if (!pennello || motoRidotto()) return;
  lampi.push({
    x: Math.random() * TW, y: Math.random() * TH,
    eta: 0, durata: 0.9, colore: colore, forza: forza || 1
  });
  if (lampi.length > 24) lampi.shift();
}

function muoviSemi(dt) {
  for (var i = 0; i < semi.length; i++) {
    var p = semi[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    /* lo spazio si richiude su sé stesso: i punti rientrano dal lato opposto */
    if (p.x < -4) p.x = TW + 4; else if (p.x > TW + 4) p.x = -4;
    if (p.y < -4) p.y = TH + 4; else if (p.y > TH + 4) p.y = -4;
  }
}

function disegnaSfondo() {
  pennello.fillStyle = "#000";
  pennello.fillRect(0, 0, TW, TH);
  /* un alone che respira: evita che il riquadro sembri spento anche a vuoto */
  var respiro = 0.5 + 0.5 * Math.sin(tempoScena * 0.35);
  var raggio = Math.min(TW, TH) * (0.55 + respiro * 0.25);
  var alone = pennello.createRadialGradient(TW / 2, TH / 2, 0, TW / 2, TH / 2, raggio);
  alone.addColorStop(0, "rgba(40,55,110," + (0.16 + respiro * 0.10).toFixed(3) + ")");
  alone.addColorStop(1, "rgba(0,0,0,0)");
  pennello.fillStyle = alone;
  pennello.fillRect(0, 0, TW, TH);
}

function disegnaLampi(dt) {
  for (var i = lampi.length - 1; i >= 0; i--) {
    var l = lampi[i];
    l.eta += dt;
    if (l.eta >= l.durata) { lampi.splice(i, 1); continue; }
    var avanti = l.eta / l.durata;
    var raggio = 3 + avanti * 34 * l.forza;
    pennello.strokeStyle = l.colore + (1 - avanti).toFixed(3) + ")";
    pennello.lineWidth = 1.6 * (1 - avanti) + 0.4;
    pennello.beginPath(); pennello.arc(l.x, l.y, raggio, 0, 6.29); pennello.stroke();
  }
}

/* Chi ha chiesto meno movimento vede la stessa scena, ferma e aggiornata di
   rado: il riquadro continua a raccontare lo stato senza muoversi. */
function motoRidotto() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  catch (e) { return false; }
}

function disegnaUniverso(adesso) {
  if (!pennello) { return; }
  var fermo = motoRidotto();
  /* passo temporale vero: l'animazione non dipende dal frame rate */
  var dt = ultimoFotogramma ? (adesso - ultimoFotogramma) / 1000 : 0.016;
  ultimoFotogramma = adesso;
  if (!(dt > 0) || dt > 0.25) dt = 0.016;
  if (fermo) dt = 0; else tempoScena += dt;

  if (!fermo) muoviSemi(dt);
  disegnaSfondo();

  var q = scala(gs.risorse.energia + gs.risorse.quark, 1e9);
  var stelle = scala(gs.generatori.fornace * 1000 + gs.risorse.elio, 1e9);
  var polvere = scala(gs.risorse.polvere, 1e9);
  var vita = scala(gs.risorse.biomassa, 1e9);
  var menti = scala(gs.risorse.intelligenza, 1e9);

  /* schiuma quantistica: sempre presente e sempre in moto, anche a universo vuoto */
  var quanti = Math.floor(70 + q * 150);
  for (var i = 0; i < quanti && i < semi.length; i++) {
    var p = semi[i];
    var brillio = 0.45 + 0.55 * Math.abs(Math.sin(tempoScena * p.ritmo + p.fase));
    pennello.fillStyle = "rgba(170,190,255," + (brillio * (0.30 + q * 0.6)).toFixed(3) + ")";
    pennello.beginPath(); pennello.arc(p.x, p.y, p.r, 0, 6.29); pennello.fill();
  }

  /* stelle accese dalle fornaci */
  var ns = Math.floor(stelle * 120);
  for (var j = 0; j < ns; j++) {
    var s2 = semi[(j * 7 + 3) % semi.length];
    var lum = 0.55 + 0.45 * Math.sin(tempoScena * 1.8 * s2.ritmo + s2.fase);
    var raggio = 3 + lum * 2.5;
    var g = pennello.createRadialGradient(s2.x, s2.y, 0, s2.x, s2.y, raggio);
    g.addColorStop(0, "rgba(255,240,210," + (0.65 + lum * 0.35).toFixed(3) + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    pennello.fillStyle = g;
    pennello.beginPath(); pennello.arc(s2.x, s2.y, raggio, 0, 6.29); pennello.fill();
  }

  /* polvere stellare, trascinata dai suoi punti */
  var np = Math.floor(polvere * 70);
  for (var k = 0; k < np; k++) {
    var s3 = semi[(k * 11 + 5) % semi.length];
    pennello.fillStyle = "rgba(190,150,110,.5)";
    pennello.fillRect(s3.x + 4, s3.y + 3, 1.6, 1.6);
  }

  /* biosfere che pulsano */
  var nv = Math.floor(vita * 60);
  for (var m = 0; m < nv; m++) {
    var s4 = semi[(m * 13 + 9) % semi.length];
    var puls = 0.6 + 0.4 * Math.sin(tempoScena * 3 + s4.fase);
    pennello.fillStyle = "rgba(110,220,150," + puls.toFixed(3) + ")";
    pennello.beginPath(); pennello.arc(s4.x - 4, s4.y + 4, 1.8, 0, 6.29); pennello.fill();
  }

  /* civiltà: onde che si espandono fra i mondi */
  var nc = Math.floor(menti * 26);
  for (var c = 0; c < nc; c++) {
    var s5 = semi[(c * 17 + 11) % semi.length];
    var avanzamento = ((tempoScena * 0.7) + c * 0.17) % 1;
    pennello.strokeStyle = "rgba(138,180,248," + ((1 - avanzamento) * 0.4).toFixed(3) + ")";
    pennello.lineWidth = 1;
    pennello.beginPath(); pennello.arc(s5.x, s5.y, 3 + avanzamento * 30, 0, 6.29); pennello.stroke();
  }

  /* sfere di Dyson */
  var nd = Math.min(14, gs.generatori.dyson);
  for (var d = 0; d < nd; d++) {
    var s6 = semi[(d * 29 + 17) % semi.length];
    pennello.strokeStyle = "rgba(255,170,70," + (0.4 + 0.3 * Math.sin(tempoScena * 3.5 + d)).toFixed(3) + ")";
    pennello.lineWidth = 1.5;
    pennello.beginPath(); pennello.arc(s6.x, s6.y, 6, 0, 6.29); pennello.stroke();
  }

  disegnaLampi(dt);
  if (fermo) setTimeout(function () { disegnaUniverso(ultimoFotogramma + 1000); }, 1000);
  else requestAnimationFrame(disegnaUniverso);
}

/* ============================================================================
   9-quinquies. PANNELLI RICHIUDIBILI E TASTIERA
============================================================================ */
var CHIAVE_CHIUSI = "singularitas_chiusi";

/* Ogni pannello diventa richiudibile dalla sua intestazione: su telefono è
   l'unico modo per non avere una colonna lunghissima. Lo stato è ricordato. */
function preparaPannelli() {
  var chiusi = {};
  try { chiusi = JSON.parse(archivio.leggi(CHIAVE_CHIUSI) || "{}") || {}; } catch (e) { chiusi = {}; }

  Array.prototype.forEach.call(document.querySelectorAll(".pannello"), function (pan) {
    var titolo = pan.querySelector("h2");
    if (!titolo || titolo.querySelector(".freccia")) return;   // già preparato

    /* il corpo va avvolto una volta sola, così basta una regola CSS per chiuderlo */
    if (!pan.querySelector(".corpo")) {
      var corpo = document.createElement("div");
      corpo.className = "corpo";
      while (titolo.nextSibling) corpo.appendChild(titolo.nextSibling);
      pan.appendChild(corpo);
    }

    var freccia = document.createElement("span");
    freccia.className = "freccia";
    freccia.textContent = "▾";
    freccia.setAttribute("aria-hidden", "true");
    titolo.appendChild(freccia);

    titolo.setAttribute("role", "button");
    titolo.setAttribute("tabindex", "0");
    if (pan.id && chiusi[pan.id]) pan.classList.add("chiuso");
    titolo.setAttribute("aria-expanded", pan.classList.contains("chiuso") ? "false" : "true");

    function commuta() {
      pan.classList.toggle("chiuso");
      titolo.setAttribute("aria-expanded", pan.classList.contains("chiuso") ? "false" : "true");
      if (pan.id) {
        chiusi[pan.id] = pan.classList.contains("chiuso");
        archivio.scrivi(CHIAVE_CHIUSI, JSON.stringify(chiusi));
      }
    }
    titolo.addEventListener("click", commuta);
    titolo.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); commuta(); }
    });
  });
}

/* Scorciatoie: valgono solo quando il fuoco non è già su un comando, altrimenti
   la barra spaziatrice attiverebbe due volte il pulsante selezionato. */
function preparaTastiera() {
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    var a = document.activeElement;
    if (a && (a.tagName === "BUTTON" || a.tagName === "TEXTAREA" || a.tagName === "INPUT")) return;

    if (e.key === " " || e.key === "Enter") {
      var principale = document.querySelector("#lista-azioni button");
      if (principale && !principale.disabled) { e.preventDefault(); principale.click(); }
      return;
    }
    var scorciatoie = { "1": "1", "2": "10", "3": "max" };
    if (scorciatoie[e.key]) {
      var b = document.querySelector('#selettore-quantita button[data-qta="' + scorciatoie[e.key] + '"]');
      if (b) { e.preventDefault(); b.click(); }
      return;
    }
    if (e.key === "t" || e.key === "T") $("btn-tema").click();
  });
}

/* ============================================================================
   10-bis. TRASFERIMENTO DELLA PARTITA
   Un salvataggio leggibile e incollabile: serve a spostarsi fra browser e a
   non perdere tutto quando localStorage non è disponibile.
============================================================================ */
function codificaPartita() {
  var pacchetto = { v: 1, gs: gs, meta: meta };
  var testo = JSON.stringify(pacchetto);
  try { return btoa(unescape(encodeURIComponent(testo))); }
  catch (e) { return testo; }        // meglio JSON in chiaro che nessuna esportazione
}

function decodificaPartita(codice) {
  var testo = codice.trim();
  if (!testo) return null;
  try {
    if (testo.charAt(0) !== "{") testo = decodeURIComponent(escape(atob(testo)));
    var pacchetto = JSON.parse(testo);
    if (!pacchetto || !pacchetto.gs || !pacchetto.gs.risorse) return null;
    return pacchetto;
  } catch (e) { return null; }
}

function importaPartita(codice) {
  var pacchetto = decodificaPartita(codice);
  if (!pacchetto) return false;
  archivio.scrivi(chiaveSalvataggio(), JSON.stringify(pacchetto.gs));
  if (pacchetto.meta) { meta = Object.assign(meta, pacchetto.meta); salvaMeta(); }
  if (!carica()) return false;
  storia = {}; attesaCampione = 0;
  ricostruisciUI();
  registra("Partita importata nello slot " + slotAttivo + ".", "buono");
  return true;
}

function cambiaSlot(n) {
  if (n === slotAttivo) return;
  salva(true);
  slotAttivo = n;
  archivio.scrivi(CHIAVE_SLOT, String(n));
  storia = {}; attesaCampione = 0;
  if (!carica()) nuovaPartita();
  else { ricostruisciUI(); registra("Slot " + n + " caricato.", "buono"); }
  aggiornaSelettoreSlot();
}

function aggiornaSelettoreSlot() {
  var bottoni = document.querySelectorAll("#selettore-slot button");
  Array.prototype.forEach.call(bottoni, function (b) {
    var n = parseInt(b.getAttribute("data-slot"), 10);
    b.classList.toggle("attivo", n === slotAttivo);
    var occupato = !!archivio.leggi(chiaveSalvataggio(n));
    b.title = "Slot " + n + (occupato ? " (occupato)" : " (vuoto)");
    b.setAttribute("aria-pressed", n === slotAttivo ? "true" : "false");
  });
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
  var ok = archivio.scrivi(chiaveSalvataggio(), JSON.stringify(gs));
  var stato = $("stato-salvataggio");
  if (stato) stato.textContent = ok
    ? (silenzioso ? "" : "Partita salvata.")
    : "Questo browser non consente il salvataggio: i progressi non verranno conservati.";
  return ok;
}

function carica() {
  var grezzo = archivio.leggi(chiaveSalvataggio());
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
    if (salvato.quantitaAcquisto !== "max" && typeof salvato.quantitaAcquisto !== "number") {
      salvato.quantitaAcquisto = 1;
    }
    if (!Array.isArray(salvato.bonus)) salvato.bonus = [];
    if (!salvato.vie || typeof salvato.vie !== "object") salvato.vie = {};
    if (typeof salvato.prossimoEvento !== "number") salvato.prossimoEvento = 150;
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
  nodi = { risorse: {}, azioni: {}, generatori: {}, ricerche: {}, costanti: {}, manager: {} };
  chiaveManager = null;
  gs.sbloccati = {};
  $("pannello-generatori").classList.add("oculto");
  $("pannello-ricerche").classList.add("oculto");
  $("pannello-costanti").classList.add("oculto");
  $("pannello-trascendenza").classList.add("oculto");
  $("pannello-universo").classList.add("oculto");
  $("pannello-manager").classList.add("oculto");
  $("pannello-evento").classList.add("oculto");
  $("pannello-effetti").classList.add("oculto");
  $("pannello-bivio").classList.add("oculto");
  if (gs.bivioAperto) {
    var bv = definizioneBivio(gs.bivioAperto);
    if (bv) mostraBivio(bv); else gs.bivioAperto = null;
  }
  /* un evento in sospeso va ridisegnato, altrimenti resta appeso nello stato */
  if (gs.eventoAttivo) {
    var ev = definizioneEvento(gs.eventoAttivo.id);
    if (ev) mostraEvento(ev); else gs.eventoAttivo = null;
  }
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
  storia = {}; attesaCampione = 0;
  $("log").innerHTML = "";
  ricostruisciUI();
  registra("Non c'è spazio, non c'è tempo, non c'è materia.", "traguardo");
  registra("Ma il vuoto non è mai davvero vuoto: fluttua. E da una fluttuazione si può estrarre energia.");
}

function avvia() {
  caricaMeta();
  caricaSlotAttivo();
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

  Array.prototype.forEach.call(document.querySelectorAll("#selettore-slot button"), function (b) {
    b.addEventListener("click", function () {
      cambiaSlot(parseInt(b.getAttribute("data-slot"), 10));
    });
  });
  aggiornaSelettoreSlot();

  $("btn-trasferisci").addEventListener("click", function () {
    $("codice-salvataggio").value = codificaPartita();
    $("esito-trasferimento").textContent = "";
    $("trasferimento").classList.remove("oculto");
    $("codice-salvataggio").select();
  });
  $("btn-chiudi-trasferimento").addEventListener("click", function () {
    $("trasferimento").classList.add("oculto");
  });
  $("btn-importa").addEventListener("click", function () {
    var ok = importaPartita($("codice-salvataggio").value);
    $("esito-trasferimento").textContent = ok
      ? "Partita importata."
      : "Codice non riconosciuto: controlla di averlo copiato per intero.";
    if (ok) $("trasferimento").classList.add("oculto");
  });

  var bottoniQta = document.querySelectorAll("#selettore-quantita button");
  Array.prototype.forEach.call(bottoniQta, function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-qta");
      gs.quantitaAcquisto = v === "max" ? "max" : parseInt(v, 10);
      Array.prototype.forEach.call(bottoniQta, function (x) { x.classList.remove("attivo"); });
      b.classList.add("attivo");
      disegna();
    });
  });

  $("btn-trascendi").addEventListener("click", function () {
    var g3 = cuGuadagnate();
    if (g3 <= 0) return;
    if (confirm("Trascendere azzera questo universo. Otterrai " + fmt(g3) +
                " Costanti Universali, che valgono per sempre. Procedere?")) {
      trascendi(1);
    }
  });
  $("btn-tema").addEventListener("click", function () {
    applicaTema(temaCorrente() === "chiaro" ? "scuro" : "chiaro");
  });

  $("btn-salva").addEventListener("click", function () { salva(false); });
  $("btn-reset").addEventListener("click", function () {
    if (confirm("Azzerare la partita e ricominciare dal vuoto?")) {
      archivio.cancella(chiaveSalvataggio());
      nuovaPartita();
    }
  });
  $("btn-ricomincia").addEventListener("click", function () {
    meta.ascensioni++;
    trascendi(2);   // l'Ascensione completa vale il doppio della trascendenza anticipata
  });

  /* Game loop a 100 ms: produzione, sblocchi, ridisegno. */
  var ultimo = Date.now();
  setInterval(function () {
    var ora = Date.now();
    var dt = Math.min((ora - ultimo) / 1000, 1);   // niente salti dopo un tab in background
    ultimo = ora;
    if (!gs.asceso) { produci(dt); aggiornaEventi(dt); agisciManager(dt); }
    storiaDaRidisegnare = campiona(dt);
    verificaSblocchi();
    disegna();
  }, 100);

  setInterval(function () { salva(true); }, 15000);
  window.addEventListener("beforeunload", function () { salva(true); });

  preparaPannelli();
  preparaTastiera();
  preparaTela();
  disegnaUniverso(0);

  window.__avviato = true;
}

avvia();

})();
