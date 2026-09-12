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
/* `unita` e `perUnita` servono solo a leggere le quantità: il bilanciamento
   interno resta espresso in unità di gioco e non cambia mai.

   `perUnita` è lo STESSO per tutte le risorse continue (un milione), e questo è
   il punto: se ogni risorsa avesse il suo fattore, due anelli vicini della
   stessa catena finirebbero a ordini di grandezza di distanza — 840 quark
   accanto a 416 milioni di masse solari di idrogeno — e la colonna diventerebbe
   illeggibile proprio dove serve confrontare. Con un fattore unico i rapporti
   mostrati sono quelli veri, e restano grandezze cosmiche.

   Le risorse che si contano una a una — Sfere, Mondi, Galassie, Universi,
   Assiomi — non si toccano: dodici Sfere di Dyson sono dodici. */
/* Un solo modo di scrivere le condizioni di sblocco: le soglie di fase con
   `g.fase`, tutto il resto con `totale(g, risorsa)`. Prima convivevano tre
   idiomi diversi per la stessa cosa. */
function totale(g, id) { return g.totali[id] || 0; }

var RISORSE = [
  { id: "energia", era: 1,      nome: "Energia Quantistica", perUnita: 1e6, cond: function () { return true; } },
  { id: "quark", era: 1,        nome: "Quark", perUnita: 1e6,
    cond: function (g) { return totale(g, "energia") >= 40; } },
  { id: "idrogeno", era: 2,     nome: "Idrogeno", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 2; } },
  { id: "elio", era: 2,         nome: "Elio", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 2; } },
  { id: "polvere", era: 2,      nome: "Polvere Stellare", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 2; } },
  { id: "acqua", era: 3,        nome: "Acqua", unita: "M⊕", perUnita: 1e6,
    cond: function (g) { return g.fase >= 3; } },
  { id: "carbonio", era: 3,     nome: "Carbonio", unita: "M⊕", perUnita: 1e6,
    cond: function (g) { return g.fase >= 3; } },
  { id: "biomassa", era: 3,     nome: "Biomassa", unita: "Gt", perUnita: 1e6,
    cond: function (g) { return g.fase >= 3; } },
  { id: "intelligenza", era: 4, nome: "Intelligenza", unita: "menti", perUnita: 1e6,
    cond: function (g) { return g.fase >= 4; } },
  { id: "sfere", era: 4,        nome: "Sfere di Dyson",      cond: function (g) { return g.generatori.dyson > 0; } },

  /* --- Era Galattica: la civiltà smonta le stelle invece di orbitarle --- */
  { id: "antimateria", era: 5,  nome: "Antimateria", unita: "t", perUnita: 1e6,
    cond: function (g) { return g.fase >= 5; } },
  { id: "mondi", era: 5,        nome: "Mondi Governati",
    cond: function (g) { return g.fase >= 5; } },

  /* --- Era Intergalattica: l'Energia del Vuoto non si accumula, scorre --- */
  { id: "oscura", era: 6,       nome: "Materia Oscura", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 6; } },
  /* Nota di bilanciamento: una risorsa che decade ha una scorta massima pari a
     produzione/decadimento, quindi non può essere il prezzo d'acquisto di
     niente — si spende solo come flusso, ed è esattamente il suo mestiere. */
  { id: "vuoto", era: 6,        nome: "Energia del Vuoto", unita: "ZJ", perUnita: 1e6,
    decadimento: 0.02,
    cond: function (g) { return g.fase >= 6; } },
  { id: "galassie", era: 6,     nome: "Galassie Raggiunte",
    cond: function (g) { return g.fase >= 6; } },

  /* --- Era della Legge: non abiti più l'universo, lo scrivi --- */
  { id: "informazione", era: 7, nome: "Informazione", unita: "qubit", perUnita: 1e6,
    cond: function (g) { return g.fase >= 7; } },
  { id: "universi", era: 7,     nome: "Universi Simulati",
    cond: function (g) { return g.fase >= 7; } },
  { id: "assiomi", era: 7,      nome: "Assiomi",
    cond: function (g) { return g.fase >= 7; } }
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
    cond: function (g) { return totale(g, "energia") >= 40; }
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
    cond: function (g) { return totale(g, "polvere") >= 50; }
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
    cond: function (g) { return g.fase >= 3 && totale(g, "biomassa") >= 20; }
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
  },
  {
    id: "click_idrogeno_stella",
    nome: "Smonta una Stella",
    descrizione: "Solleva la materia dalla fotosfera e portala via, strato dopo strato.",
    principale: false,
    costo: { energia: 200 },
    resa: { idrogeno: 20 },
    secondi: 3,
    scala: "click",
    cond: function (g) { return g.fase >= 5; }
  },
  {
    id: "click_oscura",
    nome: "Apri una Fenditura",
    descrizione: "Piega la metrica quel tanto che basta a far cadere dentro l'alone.",
    principale: false,
    costo: { vuoto: 500 },
    resa: { oscura: 20 },
    secondi: 3,
    scala: "click",
    cond: function (g) { return g.fase >= 6; }
  },
  {
    id: "click_assiomi",
    nome: "Detta un Postulato",
    descrizione: "Scrivi a mano una riga delle regole, e verifica che regga.",
    principale: false,
    costo: { informazione: 200000 },
    resa: { assiomi: 0.02 },
    secondi: 4,
    scala: "click",
    cond: function (g) { return g.fase >= 7; }
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
    id: "fluttuazione", fase: 1, gruppo: "vuoto",
    nome: "Fluttuazione Quantistica",
    descrizione: "Una increspatura del vuoto che non si richiude più.",
    costo: { energia: 10 }, crescita: 1.13,
    produce: { energia: 1 },
    cond: function () { return true; }
  },
  {
    id: "attrattore", fase: 1, gruppo: "collasso",
    nome: "Attrattore di Quark",
    descrizione: "Cattura quark liberi prima che si annichiliscano.",
    costo: { energia: 75 }, crescita: 1.16,
    produce: { quark: 0.4 }, consuma: { energia: 1 },
    cond: function (g) { return totale(g, "energia") >= 40; }
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
    cond: function (g) { return totale(g, "idrogeno") >= 50; }
  },
  {
    id: "supernova", fase: 2, gruppo: "collasso",
    nome: "Supernova",
    descrizione: "La morte di un gigante disperde elementi pesanti.",
    costo: { elio: 600 }, crescita: 1.19,
    produce: { polvere: 0.25 }, consuma: { elio: 0.8 },
    cond: function (g) { return totale(g, "elio") >= 80; }
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
    cond: function (g) { return totale(g, "acqua") >= 300 && totale(g, "carbonio") >= 300; }
  },
  {
    id: "replicatore", fase: 3, gruppo: "vita",
    nome: "Replicatore Cellulare",
    descrizione: "La vita smette di aspettare il caso e si copia da sola.",
    costo: { biomassa: 5000 }, crescita: 1.2,
    produce: { biomassa: 0.7 }, consuma: { acqua: 0.8 },
    cond: function (g) { return totale(g, "biomassa") >= 500; }
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
    id: "calcolatore", fase: 4, gruppo: "macchina",
    nome: "Calcolatore Quantistico",
    descrizione: "Pensiero che gira sul vuoto stesso da cui sei partito.",
    costo: { intelligenza: 3000 }, crescita: 1.2,
    produce: { intelligenza: 1.5 }, consuma: { energia: 5 },
    cond: function (g) { return totale(g, "intelligenza") >= 400; }
  },
  {
    id: "dyson", fase: 4,
    nome: "Sfera di Dyson",
    descrizione: "Avvolge una stella intera: ne raccoglie tutta la luce e aumenta del 10% ogni produzione.",
    costo: { polvere: 25000, intelligenza: 10000 }, crescita: 1.3,
    /* È la centrale che mancava fra la Fluttuazione Quantistica, che rende 1
       energia al secondo, e ciò che verrà dopo, che ne brucia decine per
       unità: una stella intera raccolta vale quanto duemila increspature del
       vuoto. Senza di lei le ere galattiche resterebbero senza corrente. */
    produce: { sfere: 0, energia: 2000 },
    cond: function (g) { return totale(g, "intelligenza") >= 5000; }
  },

  /* ---------------- FASE 5 · ERA GALATTICA ----------------
     Il gruppo "ciclo" è la scorciatoia: prende energia dal basso della catena
     e restituisce idrogeno più in alto, saltando i quark. Non è un anello
     chiuso — nessuna risorsa alimenta sé stessa — quindi non produce crescita
     infinita: accorcia la piramide, non la moltiplica. */
  {
    id: "ascensore", fase: 5, gruppo: "ciclo",
    nome: "Ascensore Stellare",
    descrizione: "Sollevi la materia dalla stella invece di aspettare che bruci.",
    costo: { intelligenza: 60000, polvere: 40000 }, crescita: 1.20,
    produce: { idrogeno: 50 },
    consuma: { energia: 20 },
    cond: function (g) { return g.fase >= 5; }
  },
  {
    id: "fabbrica", fase: 5, gruppo: "macchina",
    nome: "Fabbrica di Antimateria",
    descrizione: "Il modo più denso di conservare energia che le leggi permettano.",
    costo: { idrogeno: 200000, intelligenza: 120000 }, crescita: 1.22,
    produce: { antimateria: 0.4 },
    consuma: { idrogeno: 20, energia: 30 },
    cond: function (g) { return g.fase >= 5; }
  },
  {
    id: "flotta", fase: 5, gruppo: "vita",
    nome: "Flotta di Colonizzazione",
    descrizione: "Mondi che partono per non tornare. Ognuno diventa un altro centro.",
    costo: { antimateria: 20000 }, crescita: 1.25,
    produce: { mondi: 0.05 },
    consuma: { antimateria: 1.5 },
    cond: function (g) { return g.fase >= 5; }
  },

  /* ---------------- FASE 6 · ERA INTERGALATTICA ----------------
     Tutto il gruppo "orizzonte" lavora contro l'espansione: più Λ è alta, meno
     rende, perché le galassie scappano prima che tu le raggiunga. */
  {
    id: "lente", fase: 6, gruppo: "orizzonte",
    nome: "Lente Gravitazionale",
    descrizione: "Usi una galassia come obiettivo per pescare nell'alone oscuro.",
    costo: { antimateria: 60000, mondi: 20 }, crescita: 1.20,
    produce: { oscura: 8 },
    consuma: { mondi: 0.008 },
    cond: function (g) { return g.fase >= 6; }
  },
  {
    id: "pozzo", fase: 6, gruppo: "orizzonte",
    nome: "Pozzo di Vuoto",
    descrizione: "Estrai lavoro dal nulla. Il nulla se lo riprende in fretta.",
    costo: { oscura: 150000 }, crescita: 1.22,
    produce: { vuoto: 2 },
    consuma: { oscura: 3 },
    cond: function (g) { return g.fase >= 6; }
  },
  {
    id: "ponte", fase: 6, gruppo: "orizzonte",
    nome: "Ponte di Einstein-Rosen",
    descrizione: "Due punti lontani cuciti insieme, finché regge l'energia negativa.",
    costo: { oscura: 600000, antimateria: 120000 }, crescita: 1.26,
    produce: { galassie: 0.02 },
    consuma: { vuoto: 8, antimateria: 2 },
    cond: function (g) { return g.fase >= 6; }
  },
  {
    id: "bucoNero", fase: 6, gruppo: "collasso",
    nome: "Buco Nero Addomesticato",
    descrizione: "Ciò che nell'Era Stellare era una catastrofe, qui è una centrale.",
    costo: { oscura: 3000000, galassie: 12 }, crescita: 1.30,
    produce: { energia: 20000 },
    consuma: { idrogeno: 200, oscura: 20 },
    cond: function (g) { return totale(g, "galassie") >= 10; }
  },

  /* ---------------- FASE 7 · ERA DELLA LEGGE ---------------- */
  {
    id: "matrioska", fase: 7, gruppo: "informazione",
    nome: "Cervello di Matrioska",
    descrizione: "Gusci di calcolo uno dentro l'altro, ciascuno scaldato dallo scarto del precedente.",
    costo: { intelligenza: 500000, oscura: 2000000 }, crescita: 1.25,
    produce: { informazione: 20 },
    consuma: { energia: 100, mondi: 0.03 },
    cond: function (g) { return g.fase >= 7; }
  },
  {
    id: "simulatore", fase: 7, gruppo: "informazione",
    nome: "Simulatore di Universi",
    descrizione: "Un universo intero, con le sue leggi, dentro una scatola che puoi aprire.",
    costo: { informazione: 5000000 }, crescita: 1.28,
    produce: { universi: 0.01 },
    consuma: { informazione: 500, antimateria: 5 },
    cond: function (g) { return g.fase >= 7; }
  },
  {
    id: "forgia", fase: 7, gruppo: "informazione",
    nome: "Forgia delle Costanti",
    descrizione: "Confronti mille universi simulati finché una regola non si lascia scrivere.",
    costo: { universi: 50 }, crescita: 1.35,
    /* "grezzo": un Assioma non si moltiplica. Ne esce circa uno ogni tre ore
       per Forgia, e resta una cosa che si conta a una a una. */
    grezzo: true,
    produce: { assiomi: 0.0001 },
    consuma: { universi: 0.008 },
    cond: function (g) { return g.fase >= 7; }
  }
];

/* --- Ricerche: potenziamenti una tantum e traguardi di fase --------------- */
var RICERCHE = [
  /* ---------------- FASE 1 ---------------- */
  {
    id: "punto_zero", nome: "Oscillatore di Punto Zero",
    descrizione: "Raddoppia l'energia raccolta a mano, e ogni azione manuale vale un secondo di produzione in più.",
    costo: { energia: 80 },
    cond: function (g) { return totale(g, "energia") >= 30; },
    effetto: function (g) { g.molt.click *= 2; g.bonusSecondi += 1; }
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
    descrizione: "La materia acquista massa: ogni azione manuale rende 5 volte tanto e vale due secondi di produzione in più.",
    costo: { energia: 600, quark: 250 },
    cond: function (g) { return totale(g, "quark") >= 120; },
    effetto: function (g) { g.molt.click *= 5; g.bonusSecondi += 2; }
  },
  {
    id: "sintesi_idrogeno", nome: "Sintesi dell'Idrogeno", traguardo: true, fase: 1,
    descrizione: "I quark si legano in protoni: nasce il primo elemento. Apre l'Era Stellare.",
    costo: { quark: 600, energia: 1500 },
    cond: function (g) { return totale(g, "quark") >= 400; },
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
    id: "galassia", nome: "Accensione della prima Galassia", traguardo: true, fase: 2,
    descrizione: "Miliardi di stelle si legano in una spirale. Apre l'Era della Vita.",
    costo: { elio: 6000, polvere: 2000 },
    cond: function (g) { return totale(g, "polvere") >= 800; },
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
    cond: function (g) { return totale(g, "biomassa") >= 10000; },
    effetto: function (g) { g.molt.globale *= 1.5; }
  },
  {
    id: "senziente", nome: "Specie Senziente", traguardo: true, fase: 3,
    descrizione: "Una forma di vita guarda il cielo e si chiede da dove venga. Apre l'Era della Civiltà.",
    costo: { biomassa: 35000 },
    cond: function (g) { return totale(g, "biomassa") >= 18000; },
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
    id: "egemonia", nome: "Egemonia Stellare", traguardo: true, fase: 4,
    descrizione: "Una stella non basta più: la civiltà impara a smontarle. Apre l'Era Galattica.",
    costo: { intelligenza: 500000 },
    condExtra: function (g) { return g.generatori.dyson >= 12; }, richiede: "12 Sfere di Dyson",
    cond: function (g) { return totale(g, "intelligenza") >= 200000; },
    effetto: function (g) {
      g.fase = 5;
      registra("Il primo ascensore tocca la fotosfera. Le stelle diventano miniere.", "traguardo");
    }
  },

  /* ---------------- FASE 5 ---------------- */
  {
    id: "lbb", nome: "Litio-Berillio-Boro",
    descrizione: "Gli Ascensori Stellari raccolgono il doppio.",
    costo: { idrogeno: 400000 },
    cond: function (g) { return g.generatori.ascensore >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "ascensore", 2); }
  },
  {
    id: "confinamento", nome: "Confinamento Magnetico",
    descrizione: "Le Fabbriche di Antimateria producono il doppio.",
    costo: { antimateria: 80000 },
    cond: function (g) { return g.generatori.fabbrica >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "fabbrica", 2); }
  },
  {
    id: "vele", nome: "Vele a Fotoni",
    descrizione: "Le Flotte di Colonizzazione partono il doppio più spesso.",
    costo: { mondi: 60 },
    cond: function (g) { return g.generatori.flotta >= 3; },
    effetto: function (g) { moltiplicaGeneratore(g, "flotta", 2); }
  },
  {
    id: "diaspora", nome: "Diaspora", traguardo: true, fase: 5,
    descrizione: "Le prime navi escono dalla galassia e non torneranno. Apre l'Era Intergalattica.",
    costo: { antimateria: 400000, mondi: 120 },
    cond: function (g) { return totale(g, "mondi") >= 60; },
    effetto: function (g) {
      g.fase = 6;
      registra("Il vuoto fra le galassie è più grande di tutto ciò che hai attraversato finora.", "traguardo");
    }
  },

  /* ---------------- FASE 6 ---------------- */
  {
    id: "aloni", nome: "Aloni Freddi",
    descrizione: "Le Lenti Gravitazionali pescano il doppio nell'alone oscuro.",
    costo: { oscura: 2000000 },
    cond: function (g) { return g.generatori.lente >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "lente", 2); }
  },
  {
    id: "casimir", nome: "Effetto Casimir",
    descrizione: "I Pozzi di Vuoto estraggono il doppio dal nulla.",
    costo: { oscura: 6000000 },
    cond: function (g) { return g.generatori.pozzo >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "pozzo", 2); }
  },
  {
    id: "metrica", nome: "Metrica Stabile",
    descrizione: "L'Energia del Vuoto si dissolve alla metà della velocità.",
    costo: { galassie: 60 },
    cond: function (g) { return g.fase >= 6 && totale(g, "vuoto") >= 20000; },
    effetto: function (g) { g.molt.decadimento *= 0.5; }
  },
  {
    id: "gruppo_locale", nome: "Il Gruppo Locale", traguardo: true, fase: 6,
    descrizione: "Tutto ciò che è raggiungibile è stato raggiunto. Resta da capire perché. Apre l'Era della Legge.",
    costo: { galassie: 200, oscura: 4000000 },
    cond: function (g) { return totale(g, "galassie") >= 120; },
    effetto: function (g) {
      g.fase = 7;
      registra("Non c'è più niente da conquistare. C'è ancora tutto da riscrivere.", "traguardo");
    }
  },

  /* ---------------- FASE 7 ---------------- */
  {
    id: "olografica", nome: "Compressione Olografica",
    descrizione: "I Cervelli di Matrioska pensano il doppio nello stesso volume.",
    costo: { informazione: 50000000 },
    cond: function (g) { return g.generatori.matrioska >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "matrioska", 2); }
  },
  {
    id: "ipotesi", nome: "Ipotesi di Simulazione",
    descrizione: "I Simulatori di Universi rendono il doppio. Nessuno chiede più a che livello siamo.",
    costo: { universi: 300 },
    cond: function (g) { return g.generatori.simulatore >= 5; },
    effetto: function (g) { moltiplicaGeneratore(g, "simulatore", 2); }
  },
  {
    id: "punto_fisso", nome: "Teorema del Punto Fisso",
    descrizione: "Le Forge delle Costanti producono il doppio.",
    costo: { assiomi: 6 },
    cond: function (g) { return g.generatori.forgia >= 3; },
    effetto: function (g) { moltiplicaGeneratore(g, "forgia", 2); }
  },

  /* --------- Ripetibili: costo crescente, effetto che si accumula --------- */
  {
    id: "armonia", nome: "Armonia Quantistica", ripetibile: true, crescitaCosto: 5,
    descrizione: "Elimina gli sprechi lungo la catena: ogni livello riduce dell'8% ciò che ogni infrastruttura consuma.",
    costo: { energia: 20000 },
    cond: function (g) { return g.fase >= 2; },
    effetto: function (g) { g.molt.consumi *= 0.92; }
  },
  {
    id: "sinfonia", nome: "Sinfonia Stellare", ripetibile: true, crescitaCosto: 5,
    descrizione: "Coordina il ciclo delle stelle: ogni livello aumenta del 35% la resa di tutto ciò che collassa o brucia (Nebulose, Fornaci, Supernove, Giganti Rosse).",
    costo: { polvere: 30000 },
    cond: function (g) { return g.fase >= 3; },
    effetto: function (g) { moltiplicaGruppo(g, "collasso", 1.35); moltiplicaGruppo(g, "fusione", 1.35); }
  },
  {
    id: "pensiero", nome: "Pensiero Profondo", ripetibile: true, crescitaCosto: 5,
    descrizione: "Le menti imparano a leggere il cosmo: ogni livello accorcia del 10% l'attesa fra gli eventi e allunga del 20% gli effetti temporanei.",
    costo: { intelligenza: 60000 },
    cond: function (g) { return g.fase >= 4; },
    /* L'effetto si legge dal livello (ritmoEventi, durataBonus): niente da
       applicare qui, così resta esatto anche dopo un caricamento. */
    effetto: function () {}
  },

  {
    id: "economia", nome: "Economia Stellare", ripetibile: true, crescitaCosto: 5,
    descrizione: "Niente si spreca lungo la catena corta: ogni livello riduce del 10% l'energia che ascensori, fabbriche e calcolatori consumano.",
    costo: { antimateria: 100000 },
    cond: function (g) { return g.fase >= 5; },
    effetto: function (g) {
      moltiplicaConsumoGruppo(g, "ciclo", 0.9);
      moltiplicaConsumoGruppo(g, "macchina", 0.9);
    }
  },
  {
    id: "ancoraggio", nome: "Ancoraggio Cosmico", ripetibile: true, crescitaCosto: 5,
    descrizione: "Ogni livello attenua del 15% l'ostilità dell'Espansione verso ciò che attraversa il vuoto.",
    costo: { oscura: 12000000 },
    cond: function (g) { return g.fase >= 6; },
    effetto: function (g) { g.molt.ancoraggio = Math.min(0.8, (g.molt.ancoraggio || 0) + 0.15); }
  },
  {
    id: "metamatematica", nome: "Metamatematica", ripetibile: true, crescitaCosto: 5,
    descrizione: "Ogni livello aumenta del 60% tutto ciò che l'Era della Legge produce.",
    costo: { assiomi: 10 },
    cond: function (g) { return g.fase >= 7; },
    effetto: function (g) { moltiplicaGruppo(g, "informazione", 1.6); }
  },

  {
    id: "ascensione", nome: "Ascensione Cosmica", traguardo: true, fase: 7,
    descrizione: "Le regole del prossimo universo sono scritte. Non resta che accenderlo.",
    costo: { assiomi: 20, informazione: 2000000 },
    condExtra: function (g) { return g.generatori.forgia >= 5; }, richiede: "5 Forge delle Costanti",
    cond: function (g) { return totale(g, "assiomi") >= 5; },
    /* L'unica ricerca che chiude la partita: si chiede prima, e rinunciare
       non costa nulla — si resta esattamente dov'eravamo. */
    conferma: function (g) {
      return {
        titolo: "Ascensione Cosmica",
        testo: "È l'ultimo passo: questo universo diventa consapevole di sé e la " +
               "partita si chiude qui, dopo " + formattaAnni(etaCosmica()) + " di storia. " +
               "Porterai con te " + fmt(cuGuadagnate() * 2) + " Costanti Universali e le leggi che hai fissato — " +
               "il doppio di una trascendenza — e ricomincerai da un nuovo Big Bang. " +
               "Se rinunci non spendi nulla e resti in questo universo.",
        azione: "Ascendi"
      };
    },
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
    cond: function (g) { return totale(g, "quark") >= 30; },
    effetto: function (v) {
      var f = (0.6 + v * 0.08).toFixed(2);
      return "Attrattori, Nebulose, Supernove e Giganti Rosse: produzione <b>×" + f +
             "</b> e consumo <b>×" + f + "</b>; Sfere di Dyson <b>×" + f +
             "</b>. Alzarla accelera il collasso, ma divora le riserve più in fretta.";
    }
  },
  {
    id: "em", nome: "Elettromagnetismo", simbolo: "α",
    min: 1, max: 9,
    cond: function (g) { return g.fase >= 2; },   /* prima non c'è nulla di chimico da regolare */
    effetto: function (v) {
      return "Chimica, vita e calcolo <b>×" + (0.6 + v * 0.08).toFixed(2) +
             "</b> · fusione stellare <b>×" + (1.4 - v * 0.08).toFixed(2) +
             "</b>. Più forte è la repulsione elettrica, più difficile è fondere i nuclei.";
    }
  },
  {
    id: "lambda", nome: "Espansione", simbolo: "Λ",
    min: 1, max: 9,
    cond: function (g) { return totale(g, "energia") >= 200; },
    effetto: function (v) {
      return "Produzione automatica <b>×" + (1.4 - v * 0.08).toFixed(2) +
             "</b> · Fluttuazioni <b>×" + (0.6 + v * 0.08).toFixed(2) +
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
          return "La nube viene inghiottita: +" + qta("idrogeno", q) + ".";
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
    /* Una minaccia non aspetta il tuo comodo: se il tempo scade senza una
       decisione, accade comunque qualcosa — quello che sarebbe accaduto
       lasciando fare alla natura. */
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 3 && g.risorse.biomassa > 100; },
    scelte: [
      { testo: "Schermare i mondi", dettaglio: "costa polvere stellare in proporzione alla gravità",
        applica: function (g) {
          var costo = g.risorse.polvere * 0.3 * violenzaSupernova();
          g.risorse.polvere -= costo;
          return "Scudi di polvere deviano la radiazione: −" + qta("polvere", costo) + ", nessuna perdita.";
        } },
      { testo: "Lasciar fare alla natura", dettaglio: "perdi biomassa in proporzione alla gravità, ma piovono metalli",
        applica: function (g) {
          var persa = g.risorse.biomassa * 0.15 * violenzaSupernova();
          g.risorse.biomassa -= persa;
          var guadagno = persa * 2;
          aggiungi("polvere", guadagno);
          return "Le atmosfere bruciano: −" + qta("biomassa", persa) + ", +" + qta("polvere", guadagno) +
                 ". Con questa gravità l'esplosione vale " +
                 violenzaSupernova().toFixed(2) + " volte la norma.";
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
    id: "onda",
    titolo: "Onda gravitazionale",
    testo: "Due buchi neri lontani si sono fusi. Il fronte d'onda attraversa la regione, " +
           "e finché passa lo spaziotempo si lascia piegare più del solito.",
    cond: function (g) { return g.fase >= 2; },
    scelte: [
      { testo: "Assecondare la compressione", dettaglio: "Gravità +2 per 90 secondi",
        applica: function () {
          var mosso = attivaBonusCostante("gravita", 2, 90, "Gravità");
          return esitoScostamento("gravita", mosso, 90,
                                  "Tutto collassa più in fretta, e brucia altrettanto in fretta:");
        } },
      { testo: "Opporsi alla compressione", dettaglio: "Gravità −2 per 90 secondi",
        applica: function () {
          var mosso = attivaBonusCostante("gravita", -2, 90, "Gravità");
          return esitoScostamento("gravita", mosso, 90, "Il ritmo rallenta e le riserve durano:");
        } }
    ]
  },
  {
    id: "struttura_fine",
    titolo: "Anomalia di struttura fine",
    testo: "Per qualche minuto la forza che tiene insieme gli atomi si scosta " +
           "dal suo valore. Puoi decidere da che parte.",
    cond: function (g) { return g.fase >= 3; },
    scelte: [
      { testo: "Verso la chimica", dettaglio: "Elettromagnetismo +2 per 120 secondi",
        applica: function () {
          var mosso = attivaBonusCostante("em", 2, 120, "Elettromagnetismo");
          return esitoScostamento("em", mosso, 120, "I legami si fanno saldi:");
        } },
      { testo: "Verso la fusione", dettaglio: "Elettromagnetismo −2 per 120 secondi",
        applica: function () {
          var mosso = attivaBonusCostante("em", -2, 120, "Elettromagnetismo");
          return esitoScostamento("em", mosso, 120, "I nuclei si respingono meno:");
        } }
    ]
  },
  {
    id: "eco",
    titolo: "Eco di un universo precedente",
    testo: "Nella radiazione di fondo affiora una regolarità che questo universo " +
           "non ha mai prodotto: viene da prima del tuo Big Bang.",
    cond: function (g) { return g.fase >= 3 && meta.cu > 0; },
    scelte: [
      { testo: "Cristallizzarla in legge", dettaglio: "+1 Costante Universale, permanente",
        applica: function () {
          meta.cu += 1;
          salvaMeta();
          return "L'eco si condensa in una legge che sopravviverà anche a questo universo: +1 Costante Universale.";
        } },
      { testo: "Lasciarla risuonare", dettaglio: "tutta la produzione ×2 per 120 secondi",
        applica: function () {
          attivaBonus("*", 2, 120, "Tutta la produzione ×2");
          return "L'eco attraversa ogni struttura: produzione ×2 per 120 secondi.";
        } }
    ]
  },
  {
    id: "oscura",
    titolo: "Nube oscura in rotta",
    testo: "Una nube fredda e opaca sta per avvolgere la regione delle fornaci. " +
           "Dove passa, la luce non esce più.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 2 && g.generatori.fornace >= 3; },
    scelte: [
      { testo: "Disperderla per tempo", dettaglio: "costa un terzo dell'idrogeno in riserva",
        applica: function (g) {
          var costo = g.risorse.idrogeno / 3;
          g.risorse.idrogeno -= costo;
          return "Un fronte d'urto la dissolve prima che arrivi: −" + qta("idrogeno", costo) + ".";
        } },
      { testo: "Lasciarla passare", dettaglio: "Fornaci Stellari ×0.5 per 120 secondi",
        applica: function () {
          attivaBonus("fornace", 0.5, 120, "Fornaci Stellari ×0.5");
          return "La nube inghiotte la luce: le Fornaci lavorano a metà per 120 secondi.";
        } }
    ]
  },
  {
    id: "peste",
    titolo: "Un errore che si copia",
    testo: "Una molecola sbagliata si replica meglio di quelle giuste, e sta " +
           "dilagando fra i mondi seminati.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 3 && g.generatori.replicatore >= 3; },
    scelte: [
      { testo: "Sterilizzare i mondi colpiti", dettaglio: "costa un quinto della biomassa",
        applica: function (g) {
          var persa = g.risorse.biomassa * 0.2;
          g.risorse.biomassa -= persa;
          return "Si brucia il malato per salvare il sano: −" + qta("biomassa", persa) + ", contagio fermato.";
        } },
      { testo: "Lasciare fare alla selezione", dettaglio: "Replicatori Cellulari ×0.4 per 150 secondi",
        applica: function () {
          attivaBonus("replicatore", 0.4, 150, "Replicatori Cellulari ×0.4");
          return "L'errore dilaga prima di spegnersi da sé: Replicatori al 40% per 150 secondi.";
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
          return "Ghiaccio che diventa oceano: +" + qta("acqua", q) + ".";
        } },
      { testo: "Frantumarli per estrarne carbonio", dettaglio: "guadagno immediato di carbonio",
        applica: function (g) {
          var q = Math.max(400, g.risorse.carbonio * 0.6);
          aggiungi("carbonio", q);
          return "Polvere organica ovunque: +" + qta("carbonio", q) + ".";
        } }
    ]
  },
  /* ======================= ERA GALATTICA ======================= */
  {
    id: "nova",
    titolo: "Nova di raccolta",
    testo: "Una nana bianca ha appena rubato troppo alla compagna e ha eruttato " +
           "gli strati esterni. Sono già fuori dal pozzo gravitazionale.",
    cond: function (g) { return g.fase >= 5; },
    scelte: [
      { testo: "Raccogliere il guscio", dettaglio: "guadagno immediato di idrogeno",
        applica: function (g) {
          var q = Math.max(50000, g.risorse.idrogeno * 0.4 + produzioneLorda("idrogeno") * 180);
          aggiungi("idrogeno", q);
          return "Il guscio viene intercettato intero: +" + qta("idrogeno", q) + ".";
        } },
      { testo: "Aspettare l'onda d'urto", dettaglio: "Ascensori Stellari ×3 per 120 secondi",
        applica: function () {
          attivaBonus("ascensore", 3, 120, "Ascensori Stellari ×3");
          return "L'onda rimescola le fotosfere: gli Ascensori lavorano al triplo per 120 secondi.";
        } }
    ]
  },
  {
    id: "instabilita",
    titolo: "Instabilità del confinamento",
    testo: "Uno dei campi che tengono l'antimateria lontana dalle pareti sta oscillando.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 5 && g.risorse.antimateria > 1000; },
    scelte: [
      { testo: "Scaricare i serbatoi in sicurezza", dettaglio: "perdi un quinto dell'antimateria, in cambio di energia",
        applica: function (g) {
          var persa = g.risorse.antimateria * 0.2;
          g.risorse.antimateria -= persa;
          aggiungi("energia", persa * 5000);
          return "Annichilazione controllata: −" + qta("antimateria", persa) + ", +" + qta("energia", persa * 5000) + ".";
        } },
      { testo: "Tentare di stabilizzarlo", dettaglio: "metà dell'antimateria, e niente in cambio",
        applica: function (g) {
          var persa = g.risorse.antimateria * 0.5;
          g.risorse.antimateria -= persa;
          return "Il campo cede prima: −" + qta("antimateria", persa) + ", dispersa contro le pareti.";
        } }
    ]
  },
  {
    id: "centro",
    titolo: "Qualcosa al centro",
    testo: "Un residuo di supernova troppo pesante è collassato in mezzo alle nubi, " +
           "e da allora le orbite lì intorno non tornano.",
    minaccia: true, predefinita: 1,
    /* I buchi neri arrivano dal secondo universo in poi: il primo insegna, il
       secondo mette in gioco — e chi ha già trasceso ha le Costanti come rete. */
    cond: function (g) { return g.fase >= 3 && meta.cicli >= 1 && g.generatori.nebulosa >= 8; },
    scelte: [
      { testo: "Deviare le orbite", dettaglio: "costa metà della polvere stellare",
        applica: function (g) {
          var costo = g.risorse.polvere * 0.5;
          g.risorse.polvere -= costo;
          return "Le nubi passano al largo: −" + qta("polvere", costo) + ", nessuna perdita.";
        } },
      { testo: "Lasciarlo mangiare", dettaglio: "−10% delle Nebulose, ma il disco di accrescimento rende",
        applica: function () {
          var persi = distruggiGeneratore("nebulosa", 0.1);
          aggiungi("energia", persi * 400);
          return persi
            ? "Inghiotte " + persi + " Nebulose e le restituisce in luce: +" + fmt(persi * 400) +
              " Energia. Ricomprarle costerà una frazione di quanto sono costate."
            : "Trova poco da mangiare, e si riaddormenta.";
        } }
    ]
  },
  {
    id: "mostro",
    titolo: "Il mostro si sveglia",
    testo: "Il buco nero al centro della galassia ha trovato di che nutrirsi. " +
           "Quando un quasar si accende, si vede dall'altra parte dell'universo.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 5 && meta.cicli >= 1; },
    scelte: [
      { testo: "Spegnerlo subito", dettaglio: "costa il 30% dell'antimateria",
        applica: function (g) {
          var costo = g.risorse.antimateria * 0.3;
          g.risorse.antimateria -= costo;
          return "Un getto di antimateria disperde il disco prima che si accenda: −" +
                 qta("antimateria", costo) + ".";
        } },
      { testo: "Sopportare", dettaglio: "10 minuti di quasar: tutto a ×0.4, e ogni minuto mangia qualcosa",
        applica: function () {
          attivaBonus("*", 0.4, 600, "Quasar acceso · ×0.4", "quasar", 60);
          return "Il getto buca la galassia. Per dieci minuti si vive sotto la luce di un mostro.";
        } }
    ]
  },
  {
    id: "giganti",
    titolo: "Due giganti si incontrano",
    testo: "Due buchi neri supermassicci, in caduta l'uno sull'altro da un miliardo " +
           "di anni, stanno per fondersi. Lo spaziotempo suonerà come una campana.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 5 && meta.cicli >= 1; },
    scelte: [
      { testo: "Ancorare le strutture", dettaglio: "costa il 40% dell'antimateria",
        applica: function (g) {
          var costo = g.risorse.antimateria * 0.4;
          g.risorse.antimateria -= costo;
          return "Tutto viene legato e ammortizzato: −" + qta("antimateria", costo) + ", nessuna perdita.";
        } },
      { testo: "Cavalcare l'onda", dettaglio: "−20% al gruppo del collasso, ma Gravità +3 per 180 s",
        applica: function () {
          var gen = piuNumeroso("collasso");
          var persi = gen ? distruggiGeneratore(gen.id, 0.2) : 0;
          attivaBonusCostante("gravita", 3, 180, "Gravità");
          aggiungi("polvere", persi * 3000);
          return (persi ? "L'onda squarcia " + persi + " × " + gen.nome + " e ne sparge le ceneri (+" +
                          qta("polvere", persi * 3000) + "). " : "") +
                 "Per tre minuti la gravità di tutta la regione è più forte.";
        } }
    ]
  },

  /* ===================== ERA INTERGALATTICA ===================== */
  {
    id: "lenti",
    titolo: "Allineamento di lenti",
    testo: "Per qualche minuto tre ammassi si mettono in fila e la loro gravità " +
           "diventa un unico, enorme obiettivo.",
    cond: function (g) { return g.fase >= 6; },
    scelte: [
      { testo: "Puntare sull'alone", dettaglio: "guadagno immediato di materia oscura",
        applica: function (g) {
          var q = Math.max(2000000, produzioneLorda("oscura") * 240);
          aggiungi("oscura", q);
          return "L'alone si lascia leggere tutto in una volta: +" + qta("oscura", q) + ".";
        } },
      { testo: "Puntare oltre", dettaglio: "Ponti di Einstein-Rosen ×4 per 120 secondi",
        applica: function () {
          attivaBonus("ponte", 4, 120, "Ponti di Einstein-Rosen ×4");
          return "Si vede fin oltre l'orizzonte: i Ponti si aprono al quadruplo per 120 secondi.";
        } }
    ]
  },
  {
    id: "strappo",
    titolo: "Il Grande Strappo",
    testo: "L'espansione ha accelerato di scatto. Alcune galassie che avevi raggiunto " +
           "stanno passando dall'altra parte dell'orizzonte, e da lì non tornano.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 6 && totale(g, "galassie") >= 20; },
    scelte: [
      { testo: "Tenere aperti i ponti", dettaglio: "costa metà dell'Energia del Vuoto",
        applica: function (g) {
          var costo = g.risorse.vuoto * 0.5;
          g.risorse.vuoto -= costo;
          return "I ponti reggono lo strappo: −" + qta("vuoto", costo) + ", nessuna galassia persa.";
        } },
      { testo: "Lasciarle andare", dettaglio: "perdi un quarto delle galassie raggiunte",
        applica: function (g) {
          var perse = g.risorse.galassie * 0.25;
          g.risorse.galassie -= perse;
          return "Se ne vanno in silenzio, una per una: −" + qta("galassie", perse) + ".";
        } }
    ]
  },
  {
    id: "vagabondo",
    titolo: "Un vagabondo",
    testo: "Un buco nero primordiale attraversa i sistemi colonizzati. " +
           "Non è grande quanto una stella. È molto più veloce.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 6 && meta.cicli >= 1; },
    scelte: [
      { testo: "Calcolare la traiettoria e sgomberare", dettaglio: "costa un quarto dei Mondi Governati",
        applica: function (g) {
          var costo = g.risorse.mondi * 0.25;
          g.risorse.mondi -= costo;
          return "Si evacua in tempo, ma le rotte costano: −" + qta("mondi", costo) + ".";
        } },
      { testo: "Non fare in tempo", dettaglio: "−15% a Colonie e Flotte, in cambio di materia oscura",
        applica: function () {
          var a = distruggiGeneratore("colonia", 0.15);
          var b = distruggiGeneratore("flotta", 0.15);
          var resa = (a + b) * 50000;
          aggiungi("oscura", resa);
          return a + b
            ? "La scia di marea porta via " + a + " Colonie e " + b + " Flotte, e lascia dietro di sé +" +
              qta("oscura", resa) + "."
            : "Passa senza sfiorare niente di costruito.";
        } }
    ]
  },
  {
    id: "kerr",
    titolo: "Motore di Kerr",
    testo: "Un buco nero rotante, vecchio e tranquillo, con un'ergosfera enorme. " +
           "Non minaccia nulla: aspetta soltanto che qualcuno sappia usarlo.",
    cond: function (g) { return g.fase >= 6; },
    scelte: [
      { testo: "Processo di Penrose", dettaglio: "tutta la produzione ×2.5 per 180 secondi",
        applica: function () {
          attivaBonus("*", 2.5, 180, "Processo di Penrose · ×2.5");
          return "Si getta zavorra dentro l'ergosfera e se ne estrae il momento angolare: ×2.5 per tre minuti.";
        } },
      { testo: "Farne una fondazione", dettaglio: "−1 Ponte, ma +15% permanente a tutto ciò che attraversa il vuoto",
        applica: function (g) {
          var persi = smontaUnita("ponte", 1);
          moltiplicaGruppo(g, "orizzonte", 1.15);
          return (persi ? "Si smonta un Ponte per ancorarlo all'orizzonte. " : "") +
                 "Da qui in poi tutto ciò che attraversa il vuoto rende il 15% in più, per sempre.";
        } }
    ]
  },

  /* ====================== ERA DELLA LEGGE ====================== */
  {
    id: "teorema",
    titolo: "Un teorema che non doveva esistere",
    testo: "Una delle menti simulate ha dimostrato qualcosa che nessuno aveva chiesto, " +
           "e la dimostrazione è più corta di quanto dovrebbe essere possibile.",
    cond: function (g) { return g.fase >= 7; },
    scelte: [
      { testo: "Pubblicarlo", dettaglio: "guadagno immediato di informazione",
        applica: function (g) {
          var q = Math.max(1e7, produzioneLorda("informazione") * 300);
          aggiungi("informazione", q);
          return "Ogni cervello della rete lo riverifica in parallelo: +" + qta("informazione", q) + ".";
        } },
      { testo: "Tenerlo per la Forgia", dettaglio: "Forge delle Costanti ×3 per 180 secondi",
        applica: function () {
          attivaBonus("forgia", 3, 180, "Forge delle Costanti ×3");
          return "Il teorema entra direttamente nella Forgia: ×3 per tre minuti.";
        } }
    ]
  },
  {
    id: "paradosso",
    titolo: "Paradosso di autoreferenza",
    testo: "Un Simulatore ha cominciato a simulare sé stesso, e il ciclo non si chiude.",
    minaccia: true, predefinita: 1,
    cond: function (g) { return g.fase >= 7 && g.generatori.simulatore >= 3; },
    scelte: [
      { testo: "Interrompere il ciclo", dettaglio: "costa un terzo dell'informazione",
        applica: function (g) {
          var costo = g.risorse.informazione / 3;
          g.risorse.informazione -= costo;
          return "Si taglia la ricorsione a mano: −" + qta("informazione", costo) + ".";
        } },
      { testo: "Lasciarlo girare", dettaglio: "Simulatori ×0.3 per 180 secondi",
        applica: function () {
          attivaBonus("simulatore", 0.3, 180, "Simulatori ×0.3");
          return "La rete resta impegnata a inseguirsi: i Simulatori al 30% per tre minuti.";
        } }
    ]
  },
  {
    id: "orizzonte_casa",
    titolo: "L'orizzonte in casa",
    testo: "Un Simulatore ha calcolato sé stesso fino a superare il limite di Bekenstein. " +
           "Nella sala di calcolo si è aperto un orizzonte degli eventi, e si allarga.",
    minaccia: true, predefinita: 2,
    cond: function (g) { return g.fase >= 7 && meta.cicli >= 1 && g.generatori.forgia >= 2; },
    scelte: [
      { testo: "Sacrificare l'ala", dettaglio: "perdi tutte le Forge delle Costanti, il resto è salvo",
        applica: function (g) {
          var quante = g.generatori.forgia;
          g.generatori.forgia = 0;
          return "Si sigilla l'ala e la si lascia cadere dentro: −" + quante +
                 " Forge delle Costanti. Tutto il resto è intatto.";
        } },
      { testo: "Contenerlo", dettaglio: "costa 5 Assiomi",
        applica: function (g) {
          if (g.risorse.assiomi < 5) {
            aggiungiCicatrice();
            return "Non ci sono abbastanza Assiomi per riscrivere il limite: l'orizzonte resta.";
          }
          g.risorse.assiomi -= 5;
          return "Si riscrive il limite di Bekenstein quel tanto che basta a richiuderlo: −5 Assiomi.";
        } },
      { testo: "Ignorarlo", dettaglio: "una cicatrice permanente in questo universo",
        applica: function () {
          aggiungiCicatrice();
          return "Si mura la sala e si va avanti.";
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

/* --- Codex: ogni cosa incontrata nel gioco lascia una voce con l'astrofisica
   vera che le sta dietro. `chiave` è la casella di `sbloccati` che la rivela,
   così il Codex non ha bisogno di ganci sparsi: si riempie da solo. -------- */
var CODEX = [
  /* ---------------- ERA PRIMORDIALE ---------------- */
  { id: "vuoto_q", era: 1, chiave: "energia", titolo: "Il vuoto non è vuoto",
    testo: "Il principio di indeterminazione permette che dal nulla emergano coppie di particelle, " +
           "purché svaniscano abbastanza in fretta. Non è una metafora: la forza di Casimir fra due " +
           "piastre metalliche vicinissime — misurata da Lamoreaux nel 1997 — esiste proprio perché " +
           "fra le piastre stanno meno fluttuazioni che fuori." },
  { id: "quark_c", era: 1, chiave: "quark", titolo: "Quark, e perché non se ne vede mai uno",
    testo: "Ne esistono sei tipi, e nessuno è mai stato osservato da solo: separarne due costa tanta " +
           "energia che se ne materializza una coppia nuova prima che si allontanino. Per i primi dieci " +
           "microsecondi l'universo fu un plasma di quark e gluoni; poi si raffreddò abbastanza da " +
           "legarli in protoni e neutroni, e da allora sono lì." },
  { id: "gravita_c", era: 1, chiave: "cost_gravita", titolo: "La più debole delle quattro",
    testo: "La gravità è circa 10³⁶ volte più debole della forza elettromagnetica: un piccolo magnete " +
           "solleva una graffetta contro la gravità dell'intero pianeta. Governa comunque l'universo " +
           "perché ha portata infinita e, a differenza delle cariche, non si cancella mai: attrae e basta." },
  { id: "lambda_c", era: 1, chiave: "cost_lambda", titolo: "La costante cosmologica",
    testo: "Einstein la introdusse nel 1917 per tenere fermo l'universo, e la chiamò il suo errore più " +
           "grande. Nel 1998 si è scoperto che l'espansione accelera, e quel termine è tornato: oggi " +
           "l'energia oscura vale circa il 68% del contenuto dell'universo, e nessuno sa cosa sia." },
  { id: "em_c", era: 1, chiave: "cost_em", titolo: "Un numero puro: 1/137",
    testo: "La costante di struttura fine vale circa 1/137.036 e non ha unità di misura: non dipende da " +
           "come misuri le cose, è una proprietà dell'universo. Feynman la definiva «uno dei più grandi " +
           "misteri della fisica: un numero magico che arriva a noi senza che nessuno lo capisca»." },
  { id: "ricombinazione", era: 1, chiave: "ric_sintesi_idrogeno", titolo: "La luce si libera",
    testo: "Per 380 000 anni l'universo fu opaco: i fotoni rimbalzavano fra elettroni liberi senza mai " +
           "andare lontano. Poi la temperatura scese sotto i 3000 K, gli elettroni si legarono ai nuclei " +
           "e la luce poté finalmente attraversare lo spazio. Quella luce la vediamo ancora: è il fondo " +
           "cosmico a microonde." },

  /* ---------------- ERA STELLARE ---------------- */
  { id: "idrogeno_c", era: 2, chiave: "idrogeno", titolo: "Tre minuti che hanno deciso tutto",
    testo: "Le proporzioni della materia ordinaria furono fissate nei primi tre minuti: circa 75% " +
           "idrogeno e 25% elio in massa, più tracce di litio. Tutto il resto della tavola periodica è " +
           "stato fabbricato dopo, dentro le stelle, ed è una frazione minuscola del totale." },
  { id: "elio_c", era: 2, chiave: "elio", titolo: "Scoperto nel Sole prima che sulla Terra",
    testo: "Nel 1868 una riga gialla sconosciuta nello spettro solare fece ipotizzare un elemento nuovo, " +
           "battezzato con il nome greco del Sole. Fu isolato sulla Terra solo ventisette anni dopo. È " +
           "l'unico elemento ad essere stato trovato prima altrove che qui." },
  { id: "nebulosa_c", era: 2, chiave: "gen_nebulosa", titolo: "Nubi molecolari",
    testo: "Le stelle nascono in nubi di gas a dieci-trenta gradi sopra lo zero assoluto, fra le cose " +
           "più fredde dell'universo. Una nube collassa quando la sua gravità supera la pressione " +
           "interna — la soglia si chiama massa di Jeans — e da quel momento la caduta si autoalimenta." },
  { id: "fornace_c", era: 2, chiave: "gen_fornace", titolo: "Quattro protoni, un elio, e lo 0.7%",
    testo: "La catena protone-protone fonde quattro nuclei di idrogeno in uno di elio, e converte in " +
           "energia appena lo 0.7% della massa di partenza. Basta: il Sole trasforma in luce circa 4.3 " +
           "milioni di tonnellate di materia al secondo, e lo fa da quattro miliardi e mezzo di anni." },
  { id: "supernova_c", era: 2, chiave: "gen_supernova", titolo: "Dove la fusione smette di pagare",
    testo: "Fondere elementi rende energia fino al ferro; oltre, ne consuma. Quando il nucleo di una " +
           "stella massiccia diventa ferro, il motore si spegne e il nucleo collassa in meno di un " +
           "secondo. L'onda che ne esce forgia in pochi istanti gli elementi più pesanti e li sparge." },
  { id: "polvere_c", era: 2, chiave: "polvere", titolo: "Siamo fatti di scarti stellari",
    testo: "Il calcio delle ossa, il ferro del sangue e l'ossigeno che respiri sono stati fabbricati " +
           "dentro stelle morte molto prima del Sole, e dispersi nello spazio dalle loro esplosioni. " +
           "Ogni atomo più pesante dell'elio che tocchi ha attraversato almeno una stella." },
  { id: "galassia_c", era: 2, chiave: "ric_galassia", titolo: "Quanto pesa una galassia",
    testo: "Una galassia nana contiene dai cento milioni al miliardo di masse solari; la Via Lattea ne " +
           "vale qualche centinaio di miliardi. Sono numeri che nel gioco trovi scritti per intero: la " +
           "prima galassia costa miliardi di masse solari di elio, non «seimila»." },

  /* ---------------- ERA DELLA VITA ---------------- */
  { id: "acqua_c", era: 3, chiave: "acqua", titolo: "Da dove è arrivata l'acqua",
    testo: "La Terra si è formata troppo vicino al Sole perché l'acqua vi condensasse: è stata portata " +
           "da corpi ghiacciati. Il rapporto fra deuterio e idrogeno è l'impronta digitale che permette " +
           "di capire da dove: la sonda Rosetta ha trovato sulla cometa 67P un valore tre volte quello " +
           "degli oceani, che sposta i sospetti sugli asteroidi." },
  { id: "carbonio_c", era: 3, chiave: "carbonio", titolo: "Lo stato di Hoyle",
    testo: "Fondere tre nuclei di elio in uno di carbonio dovrebbe essere troppo improbabile per " +
           "spiegare quanto carbonio esiste. Nel 1953 Hoyle previde che il carbonio-12 dovesse avere uno " +
           "stato eccitato a un'energia precisa perché la reazione funzionasse — e lo dedusse dal fatto " +
           "che noi esistiamo. Lo trovarono pochi mesi dopo, dove aveva detto." },
  { id: "brodo_c", era: 3, chiave: "gen_brodo", titolo: "Miller, Urey e le fumarole",
    testo: "Nel 1952 una scarica elettrica in un pallone di gas produsse amminoacidi in una settimana, " +
           "mostrando che i mattoni della vita si formano da soli. L'ipotesi oggi più seguita sposta la " +
           "scena sul fondo dell'oceano, nelle fumarole alcaline, dove gradienti chimici naturali " +
           "somigliano moltissimo a come le cellule producono energia." },
  { id: "replicatore_c", era: 3, chiave: "gen_replicatore", titolo: "Il mondo a RNA",
    testo: "Le proteine servono a copiare il DNA, ma il DNA serve a costruire le proteine: chi è venuto " +
           "prima? L'RNA scioglie il nodo perché sa fare entrambe le cose — conserva informazione e " +
           "catalizza reazioni. Il ribosoma, la macchina che costruisce ogni proteina del tuo corpo, è " +
           "ancora oggi fatto di RNA." },
  { id: "senziente_c", era: 3, chiave: "ric_senziente", titolo: "L'equazione di Drake",
    testo: "Scritta nel 1961, moltiplica sette fattori per stimare quante civiltà comunicanti ci siano " +
           "nella galassia. Non è una previsione: quasi tutti i fattori sono ignoti, e il risultato va da " +
           "«una» a «milioni». Serve a organizzare l'ignoranza, che è già qualcosa." },

  /* ---------------- ERA DELLA CIVILTÀ ---------------- */
  { id: "fermi_c", era: 4, chiave: "intelligenza", titolo: "«Ma allora dove sono tutti?»",
    testo: "La domanda che Fermi pose a pranzo nel 1950 resta senza risposta: se la galassia è vecchia " +
           "di miliardi di anni e attraversarla richiede qualche milione, qualcuno avrebbe dovuto farsi " +
           "vivo. Le spiegazioni proposte — siamo i primi, siamo rari, o qualcosa ferma tutti prima — " +
           "sono tutte inquietanti in modi diversi." },
  { id: "calcolatore_c", era: 4, chiave: "gen_calcolatore", titolo: "Perché è difficile",
    testo: "Un qubit può stare in sovrapposizione di zero e uno, e n qubit esplorano 2ⁿ stati insieme. " +
           "Il problema è tenerli isolati: qualunque interazione con l'ambiente fa collassare la " +
           "sovrapposizione. Si chiama decoerenza, e avviene in frazioni di secondo." },
  { id: "dyson_c", era: 4, chiave: "gen_dyson", titolo: "La sfera che Dyson non ha proposto",
    testo: "Nel 1960 Dyson non propose un guscio solido — sarebbe instabile e non esiste materiale che " +
           "regga — ma uno sciame di collettori in orbita. E non lo propose come progetto: lo propose " +
           "come indizio da cercare, perché una civiltà che usa tutta la luce di una stella deve pur " +
           "disperdere calore, e brillerebbe nell'infrarosso." },

  /* ---------------- ERA GALATTICA ---------------- */
  { id: "antimateria_c", era: 5, chiave: "antimateria", titolo: "Il carburante perfetto, e impossibile",
    testo: "L'annichilazione converte in energia il 100% della massa: novanta milioni di miliardi di " +
           "joule per chilogrammo, contro lo 0.7% della fusione. Il problema è produrla: tutti gli " +
           "acceleratori del mondo insieme ne fabbricano qualche miliardesimo di grammo all'anno, " +
           "spendendo enormemente più energia di quella che restituirebbe." },
  { id: "ascensore_c", era: 5, chiave: "gen_ascensore", titolo: "Smontare una stella",
    testo: "Il «sollevamento stellare» è un'idea seria: usare campi magnetici o un fascio di energia per " +
           "strappare materia dalla superficie di una stella. Non serve solo a prendere idrogeno — " +
           "alleggerire una stella la fa bruciare più lentamente, e può allungarne la vita di ordini " +
           "di grandezza." },
  { id: "egemonia_c", era: 5, chiave: "ric_egemonia", titolo: "La scala di Kardašëv",
    testo: "Proposta nel 1964, classifica le civiltà per l'energia che sanno usare: tipo I quella di un " +
           "pianeta, tipo II quella di una stella, tipo III quella di una galassia. Noi siamo intorno a " +
           "0.7, e la scala sale di un gradino ogni fattore diecimila." },

  /* ---------------- ERA INTERGALATTICA ---------------- */
  { id: "oscura_c", era: 6, chiave: "oscura", titolo: "Le galassie girano troppo in fretta",
    testo: "Negli anni Settanta Vera Rubin misurò la rotazione delle galassie a spirale e trovò che i " +
           "bordi giravano alla stessa velocità del centro: impossibile, se la massa fosse solo quella " +
           "che si vede. Serve cinque volte tanta materia che non emette luce. Cinquant'anni dopo " +
           "sappiamo che c'è, e non sappiamo cosa sia." },
  { id: "vuoto_c", era: 6, chiave: "vuoto", titolo: "La peggiore previsione della fisica",
    testo: "La teoria quantistica dei campi permette di calcolare la densità di energia del vuoto, e il " +
           "risultato supera quello osservato fino a 120 ordini di grandezza. È il divario più grande " +
           "fra teoria e misura nella storia della scienza, e nessuno l'ha ancora chiuso." },
  { id: "ponte_c", era: 6, chiave: "gen_ponte", titolo: "Cucire due punti dello spazio",
    testo: "Einstein e Rosen lo descrissero nel 1935, ma il loro ponte si richiude prima che qualcosa " +
           "possa attraversarlo. Nel 1988 Morris e Thorne mostrarono cosa servirebbe per tenerlo aperto: " +
           "materia con densità di energia negativa, che nessuno sa se esista in quantità utili." },
  { id: "buconero_c", era: 6, chiave: "gen_bucoNero", titolo: "Il motore più efficiente che ci sia",
    testo: "La materia che cade verso un buco nero, prima di sparire, irraggia parte della propria " +
           "massa: dal 6% circa per un buco nero fermo fino al 42% per uno che ruota al massimo. La " +
           "fusione stellare si ferma allo 0.7%. È il processo più efficiente conosciuto in natura." },
  { id: "penrose_c", era: 6, chiave: "ev_kerr", titolo: "Rubare energia a un buco nero",
    testo: "Penrose mostrò nel 1969 che attorno a un buco nero rotante esiste una regione — l'ergosfera " +
           "— dove si può gettare un oggetto, farlo dividere e recuperare il pezzo che torna indietro " +
           "con più energia di quanta ne avesse. La differenza viene dalla rotazione del buco nero, che " +
           "in cambio rallenta." },
  { id: "strappo_c", era: 6, chiave: "ev_strappo", titolo: "Il Grande Strappo",
    testo: "Se l'energia oscura diventasse più forte col tempo invece di restare costante, l'espansione " +
           "accelererebbe fino a disintegrare prima le galassie, poi i sistemi stellari, poi i pianeti, " +
           "poi gli atomi — in un tempo finito. Le misure attuali non lo escludono, ma nemmeno lo " +
           "indicano: dipende da un parametro che conosciamo con poca precisione." },

  /* ---------------- ERA DELLA LEGGE ---------------- */
  { id: "bekenstein_c", era: 7, chiave: "informazione", titolo: "L'informazione sta sulla superficie",
    testo: "Bekenstein dimostrò nel 1981 che la quantità massima di informazione contenibile in una " +
           "regione di spazio non cresce col suo volume, ma con la sua superficie. È il punto di " +
           "partenza del principio olografico, e implica che un calcolatore abbastanza denso non diventi " +
           "più potente: diventi un buco nero." },
  { id: "matrioska_c", era: 7, chiave: "gen_matrioska", titolo: "Gusci dentro gusci",
    testo: "Il cervello di Matrioska è una sfera di Dyson a strati: ogni guscio calcola usando il calore " +
           "di scarto di quello interno, che per lui è ancora energia buona. Si può ripetere finché la " +
           "temperatura non scende a quella dello spazio vuoto, e ogni strato costa nulla in più se non " +
           "la materia per costruirlo." },
  { id: "simulazione_c", era: 7, chiave: "gen_simulatore", titolo: "Il trilemma di Bostrom",
    testo: "L'argomento del 2003 non afferma che viviamo in una simulazione: dice che almeno una di tre " +
           "cose è vera. O le civiltà si estinguono prima di saperlo fare, o scelgono di non farlo, o " +
           "quasi tutte le menti coscienti sono simulate — e in quel caso la probabilità che la tua non " +
           "lo sia è piccola." },
  { id: "falsovuoto_c", era: 1, chiave: "cost_gravita", titolo: "Se il vuoto fosse solo quasi stabile",
    testo: "Le misure della massa del bosone di Higgs e del quark top collocano il nostro vuoto " +
           "pericolosamente vicino al confine fra stabile e metastabile. Se fosse metastabile, da " +
           "qualche parte potrebbe nucleare una bolla di vuoto «vero» che si espande alla velocità " +
           "della luce, riscrivendo le costanti al suo interno. Non ci sarebbe preavviso — e i calcoli " +
           "danno tempi molto più lunghi dell'età dell'universo, quindi si dorme sereni." },
  { id: "sintonia_c", era: 7, chiave: "assiomi", titolo: "La sintonia fine",
    testo: "Se la forza nucleare forte fosse qualche punto percentuale diversa, non esisterebbero né il " +
           "carbonio né le stelle longeve; se l'energia oscura fosse molto maggiore, la materia non si " +
           "sarebbe mai addensata. Perché le costanti abbiano i valori che hanno è una domanda aperta: " +
           "il principio antropico è una risposta possibile, non l'unica, e non tutti la considerano " +
           "una risposta." }
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
    id: "egemonia",
    titolo: "L'ultima risorsa",
    testo: "Una stella si può smontare pezzo per pezzo, oppure annichilire in blocco. " +
           "Le due scuole non si parleranno mai.",
    scelte: [
      { nome: "Via del Ferro", dettaglio: "Ascensori Stellari ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "ascensore", 2); } },
      { nome: "Via dell'Annichilazione", dettaglio: "Fabbriche di Antimateria ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "fabbrica", 2); } }
    ]
  },
  {
    id: "diaspora",
    titolo: "Come attraversare il vuoto",
    testo: "Si può forzare la metrica e arrivare adesso, oppure imparare a " +
           "conservare abbastanza a lungo da non aver fretta.",
    scelte: [
      { nome: "Via del Ponte", dettaglio: "Ponti di Einstein-Rosen ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "ponte", 2); } },
      { nome: "Via della Pazienza", dettaglio: "l'Energia del Vuoto decade la metà",
        applica: function (g) { g.molt.decadimento *= 0.5; } }
    ]
  },
  {
    id: "gruppo_locale",
    titolo: "Cosa pensare",
    testo: "Le menti che restano possono pensare questo universo fino in fondo, " +
           "oppure smettere di guardarlo e cominciare a immaginarne altri.",
    scelte: [
      { nome: "Via del Pensiero", dettaglio: "Cervelli di Matrioska ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "matrioska", 2); } },
      { nome: "Via del Sogno", dettaglio: "Simulatori di Universi ×2 per sempre",
        applica: function (g) { moltiplicaGeneratore(g, "simulatore", 2); } }
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
/* Un universo alla volta: la partita vive in una chiave sola. */
var CHIAVE_PARTITA = "singularitas_v1";
var CHIAVE_SLOT = "singularitas_slot";

function chiaveSalvataggio() { return CHIAVE_PARTITA; }

/* Chi ha giocato quando esistevano i tre slot non deve perdere niente: si
   adotta lo slot che stava usando, e le altre chiavi vengono lasciate dove
   sono — cancellarle distruggerebbe partite che non ci appartengono. */
function adottaVecchiSalvataggi() {
  if (archivio.leggi(CHIAVE_PARTITA)) return;
  var attivo = parseInt(archivio.leggi(CHIAVE_SLOT), 10);
  if (!(attivo >= 1 && attivo <= 3)) attivo = 1;
  var ordine = [attivo, 1, 2, 3];
  for (var i = 0; i < ordine.length; i++) {
    var vecchio = archivio.leggi("singularitas_v1_s" + ordine[i]);
    if (vecchio) { archivio.scrivi(CHIAVE_PARTITA, vecchio); return; }
  }
}
var CHIAVE_META = "singularitas_meta";

/* Le Costanti Universali non appartengono a un universo: restano fra un ciclo
   e l'altro e sono l'unico progresso che la Trascendenza non azzera. */
var meta = { cu: 0, cicli: 0, ascensioni: 0, manager: {}, leggi: {} };

function caricaMeta() {
  try {
    var grezzo = archivio.leggi(CHIAVE_META);
    if (!grezzo) return;
    var m = JSON.parse(grezzo);
    if (typeof m.cu === "number" && isFinite(m.cu)) meta.cu = Math.max(0, Math.floor(m.cu));
    if (typeof m.cicli === "number") meta.cicli = Math.max(0, Math.floor(m.cicli));
    if (typeof m.ascensioni === "number") meta.ascensioni = Math.max(0, Math.floor(m.ascensioni));
    if (m.manager && typeof m.manager === "object") meta.manager = m.manager;
    if (m.leggi && typeof m.leggi === "object") meta.leggi = m.leggi;
  } catch (e) { /* meta illeggibile: si riparte da zero, non è un errore fatale */ }
}
function salvaMeta() { archivio.scrivi(CHIAVE_META, JSON.stringify(meta)); }

/* Bonus permanente delle Costanti Universali. Cresce con la radice del loro
   numero, non in proporzione: con sette ere una partita completa ne frutta
   migliaia, e un +5% lineare per ciascuna trasformerebbe l'universo successivo
   in una formalità di due minuti. I coefficienti sono scelti perché intorno
   alle venti Costanti — quanto rendeva una partita prima delle tre ere nuove —
   il bonus valga esattamente quanto valeva. */
function bonusMeta()      { return 1 + 0.22 * Math.sqrt(meta.cu); }
function bonusMetaClick() { return 1 + 0.09 * Math.sqrt(meta.cu); }

/* Quanto vale un universo. Ogni era contribuisce con la sua risorsa di punta,
   pesata perché una unità di un'era tarda conti quanto migliaia della
   precedente: senza questo, tre ere di contenuto non pagherebbero un solo
   punto di prestigio in più. Il peso dell'Intelligenza è quello storico, così
   una partita cominciata prima vale esattamente quanto valeva. */
var PESI_VALORE = {
  intelligenza: 1 / 5000,
  antimateria:  1 / 50000,
  mondi:        0.02,
  oscura:       1 / 1e7,
  galassie:     0.08,
  informazione: 1 / 1e8,
  universi:     0.8,
  assiomi:      20
};

function valoreUniverso() {
  var v = 0;
  for (var k in PESI_VALORE) v += (gs.totali[k] || 0) * PESI_VALORE[k];
  return v;
}

/* Quanto renderebbe trascendere adesso. L'esponente sotto 1 evita che una
   partita lunghissima renda irrilevanti tutte le successive. */
function cuGuadagnate() {
  var base = valoreUniverso();
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
/* Il prezzo cresce con quanti manager sono già assunti, ma per base 1.45 e non
   2: con ventidue infrastrutture il raddoppio secco renderebbe gli ultimi
   manager più cari di qualunque partita immaginabile. */
function costoManager() { return Math.round(3 * Math.pow(1.45, quantiManager())); }

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
    molt: { click: 1, globale: 1, consumi: 1, generatori: {}, gruppi: {},
            consumiGruppo: {}, decadimento: 1, ancoraggio: 0 },
    campo: {},                    // tacche di costante aperte con gli Assiomi
    codex: {},                    // voci del Codex: 1 = scoperta, 2 = letta
    stabilita: 1,                 // quanto l'universo regge le leggi che gli hai dato
    prossimaRottura: 60,          // secondi alla prossima lacerazione, se resta critico
    cicatrici: 0,                 // ferite permanenti lasciate dai buchi neri
    bonusSecondi: 0,              // secondi di produzione aggiunti alle azioni manuali
    costanti: {},
    fase: 1,
    quantitaAcquisto: 1,
    bonus: [],                    // moltiplicatori temporanei attivi
    vie: {},                      // bivi già risolti: id del traguardo -> nome della via
    bivioAperto: null,
    eventoAttivo: null,
    prossimoEvento: 150,          // secondi al primo evento
    click: 0,
    eta: 0,                       // secondi vissuti da questo universo
    etaFase: 0,                   // secondi vissuti dentro l'era corrente
    faseVista: 1,                 // per accorgersi del passaggio di era
    asceso: false,
    inizio: Date.now(),
    ultimoAccesso: Date.now()
  };
  RISORSE.forEach(function (r) { g.risorse[r.id] = 0; g.totali[r.id] = 0; });
  COSTANTI.forEach(function (c) {
    /* 5 è il valore neutro, ma una legge fissata con un Assioma nasce già
       scritta: è l'unico lascito del prestigio che non sia una percentuale. */
    var fissata = meta.leggi && meta.leggi[c.id];
    g.costanti[c.id] = typeof fissata === "number" ? fissata : 5;
  });
  GENERATORI.forEach(function (x) { g.generatori[x.id] = 0; g.molt.generatori[x.id] = 1; });
  return g;
}

/* Smontare ciò che il giocatore ha costruito è la cosa più pesante che il
   gioco possa fare, quindi ha una porta sola e delle regole scritte: si perde
   una frazione (che invecchia bene, al contrario di una quantità fissa) e mai
   l'ultima unità, perché restare senza la capacità di ripartire è l'unico
   danno irrecuperabile. Il costo esponenziale fa il resto: ricomprare dieci
   unità su cento costa una frazione di quanto è costato arrivare a cento. */
function smontaUnita(id, quante) {
  var n = gs.generatori[id] || 0;
  if (n <= 1 || quante <= 0) return 0;
  var persi = Math.min(quante, n - 1);
  gs.generatori[id] = n - persi;
  /* le Sfere sono anche una risorsa: i due conteggi non devono separarsi */
  if (id === "dyson") {
    gs.risorse.sfere = gs.generatori.dyson;
    gs.totali.sfere = gs.generatori.dyson;
  }
  return persi;
}

function distruggiGeneratore(id, frazione) {
  var n = gs.generatori[id] || 0;
  if (n <= 1) return 0;
  return smontaUnita(id, Math.max(1, Math.floor(n * frazione)));
}

/* Il bersaglio naturale di una catastrofe è ciò di cui ce n'è di più. */
function piuNumeroso(gruppo) {
  var scelto = null, quanti = 0;
  GENERATORI.forEach(function (gen) {
    if (gruppo && gen.gruppo !== gruppo) return;
    var n = gs.generatori[gen.id] || 0;
    if (n > quanti) { quanti = n; scelto = gen; }
  });
  return scelto;
}

function nomeGeneratore(id) {
  var nome = id;
  GENERATORI.forEach(function (g) { if (g.id === id) nome = g.nome; });
  return nome;
}

/* Una cicatrice è l'unico danno che sopravvive alla fine dell'evento: −1% di
   produzione per sempre in questo universo. È anche l'unica pressione del
   gioco a favore della trascendenza. */
function aggiungiCicatrice() {
  gs.cicatrici = (gs.cicatrici || 0) + 1;
  registra("L'orizzonte si è chiuso, ma ha lasciato un buco nella metrica: " +
           "−" + gs.cicatrici + "% di produzione, per sempre in questo universo.", "avverso");
}

function moltiplicaGeneratore(g, id, fattore) {
  g.molt.generatori[id] = (g.molt.generatori[id] || 1) * fattore;
}

/* Come sopra, ma su un'intera famiglia: le ricerche che parlano di stelle o di
   vita non devono elencare i generatori uno per uno. */
function moltiplicaGruppo(g, gruppo, fattore) {
  g.molt.gruppi[gruppo] = (g.molt.gruppi[gruppo] || 1) * fattore;
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
  if (n === 0) return "0";
  /* Un flusso piccolissimo ma reale non deve leggersi «0»: la Forgia produce un
     Assioma ogni tre ore, e dichiararlo come zero fa sembrare rotto il gioco. */
  if (Math.abs(n) < 0.005) return n.toPrecision(1);
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
/* ---------------------------------------------------------------------------
   La stabilità dell'universo.

   Le costanti nascono come compromessi, ma i compromessi si possono aggirare:
   portare Λ al minimo e la Gravità al massimo alza insieme il moltiplicatore
   globale, la fusione, il ritmo del collasso e la resa delle Sfere di Dyson, e
   in cambio sacrifica solo la vita, le fluttuazioni e la raccolta a mano — tre
   cose che a fine partita non contano più. Era un angolo dominante, non una
   scelta.

   La risposta non è spostare i numeri, perché qualunque altro numero
   sposterebbe soltanto l'angolo: è far pagare l'estremità in sé. Un universo
   accordato lontano dai suoi valori naturali regge, ma non per sempre: si
   incrina, richiama catastrofi e alla fine si lacera. Chi vuole quel +32% può
   prenderselo — sapendo che ogni tanto perderà qualcosa.
--------------------------------------------------------------------------- */
var TENSIONE_MAX = 3;        // somma degli scarti oltre cui la stabilità va a zero
var RITMO_STABILITA = 0.015; // quanto in fretta l'universo si adegua (~un minuto)

/* Quanto ogni costante è lontana dal suo valore naturale, in unità di «metà
   campo»: 9 o 1 valgono 1, e una tacca aperta con un Assioma vale di più. */
function tensioneCostanti() {
  var t = 0;
  COSTANTI.forEach(function (c) {
    var v = valoreCostante(c.id);
    var campo = campoCostante(c.id);
    var dentro = Math.max(campo.min, Math.min(campo.max, v));
    /* Dentro il quadrante una tacca di scarto vale un quarto di tensione;
       fuori ne vale mezza, perché tenere una legge oltre il suo campo è
       esattamente ciò che l'universo non sa fare a lungo. */
    t += Math.abs(dentro - 5) / 4 + Math.abs(v - dentro) / 2;
  });
  return t;
}

function stabilitaBersaglio() {
  return Math.max(0, Math.min(1, 1 - tensioneCostanti() / TENSIONE_MAX));
}

/* La stabilità insegue il bersaglio invece di saltarci sopra: si può spingere
   una costante all'estremo per un minuto e riportarla indietro senza
   conseguenze. È viverci che costa. */
function aggiornaStabilita(dt) {
  var bersaglio = stabilitaBersaglio();
  gs.stabilita += (bersaglio - gs.stabilita) * Math.min(1, RITMO_STABILITA * dt);
}

var NOTE_STABILITA = {
  stabile:   "Le leggi che hai scelto reggono senza sforzo.",
  incrinato: "Accordare l'universo lontano dai suoi valori naturali lo affatica: gli eventi si infittiscono.",
  instabile: "La metrica fatica a tenere: la produzione cala, e ciò che arriva è sempre più spesso una minaccia.",
  critico:   "Lo spaziotempo si sta lacerando. Ogni tanto porterà via qualcosa che hai costruito."
};

function statoStabilita() {
  var s = gs.stabilita;
  if (s >= 0.75) return "stabile";
  if (s >= 0.5) return "incrinato";
  if (s >= 0.25) return "instabile";
  return "critico";
}

/* Un universo che si sfalda produce meno: fino a −30% quando è al limite. */
function fattoreStabilita() {
  return 0.7 + 0.3 * Math.max(0, Math.min(1, gs.stabilita));
}

/* E richiama guai più spesso: fino a due volte e mezzo il ritmo normale. */
function ritmoInstabilita() {
  return 1 + (1 - gs.stabilita) * 1.5;
}

/* La lacerazione: quando la metrica non regge più, qualcosa si strappa. Non
   restituisce niente — al contrario di un buco nero, che almeno accende un
   disco di accrescimento. È il conto dell'estremità. */
function rotturaCosmica() {
  var gruppi = ["collasso", "fusione", "vita", "macchina", "vuoto", "ciclo", "orizzonte", "informazione"];
  var gen = null;
  for (var tentativi = 0; tentativi < 8 && !gen; tentativi++) {
    gen = piuNumeroso(gruppi[Math.floor(Math.random() * gruppi.length)]);
  }
  if (!gen) return;
  var persi = distruggiGeneratore(gen.id, 0.06);
  if (!persi) return;
  registra("Lo spaziotempo non regge le leggi che gli hai dato: si lacera, e porta via " +
           persi + " × " + gen.nome + ".", "avverso");
  lampeggia("danno", 1.4);
}

function moltiplicatoreGlobale() {
  var resaSfera = 0.1 * (0.6 + valoreCostante("gravita") * 0.08);
  return gs.molt.globale * (1 + gs.generatori.dyson * resaSfera) *
         (1.4 - valoreCostante("lambda") * 0.08) * bonusMeta() *
         Math.pow(0.99, gs.cicatrici || 0) * fattoreStabilita();
}

/* Quanto una costante può uscire dal quadrante sotto la spinta di un evento.
   Uno scostamento temporaneo non è un'impostazione: è un fatto fisico, e non ha
   motivo di rispettare i limiti della manopola. Senza questo, un evento che
   offre «+2» a una costante già al massimo era una scelta letteralmente
   inerte — non cambiava un solo numero, e per due minuti il gioco dichiarava
   un effetto che non esisteva. */
var SFONDAMENTO = 3;

/* Gli estremi del quadrante, cioè fin dove arrivano i bottoni − e +. */
function nomeCostante(id) {
  var nome = id;
  COSTANTI.forEach(function (c) { if (c.id === id) nome = c.nome; });
  return nome;
}

/* Come raccontare uno scostamento: quanto vale adesso, e se è uscito dal
   quadrante — perché è quello il caso che il giocatore deve vedere. */
function esitoScostamento(id, mosso, secondi, apertura) {
  if (!mosso) {
    return "La spinta non trova spazio: " + nomeCostante(id) +
           " è già al limite di ciò che l'universo sopporta, e l'anomalia si dissipa.";
  }
  var v = valoreCostante(id), campo = campoCostante(id);
  var oltre = v > campo.max || v < campo.min;
  return apertura + " " + nomeCostante(id) + " a " + v + " per " + secondi + " secondi" +
         (oltre ? ", oltre il quadrante: l'universo non reggerà a lungo." : ".");
}

function campoCostante(id) {
  var def = null;
  COSTANTI.forEach(function (c) { if (c.id === id) def = c; });
  var apertura = (gs.campo && gs.campo[id]) || 0;
  return { min: (def ? def.min : 1) - apertura, max: (def ? def.max : 9) + apertura };
}

/* Valore effettivo di una costante: quello scelto dal giocatore più gli
   scostamenti temporanei lasciati dagli eventi. La parte scelta resta dentro il
   quadrante; la spinta di un evento può portarla oltre, fino a tre tacche. */
function valoreCostante(id) {
  var base = gs.costanti[id];
  if (typeof base !== "number") base = 5;
  var campo = campoCostante(id);
  base = Math.max(campo.min, Math.min(campo.max, base));
  var delta = 0;
  for (var i = 0; i < gs.bonus.length; i++) {
    if (gs.bonus[i].costante === id) delta += gs.bonus[i].delta;
  }
  return Math.max(campo.min - SFONDAMENTO,
                  Math.min(campo.max + SFONDAMENTO, base + delta));
}

/* Tutto ciò che dipende dal gruppo di un generatore, in un punto solo: le
   costanti fondamentali, i potenziamenti che agiscono su una famiglia intera e
   la riduzione dei consumi. La gravità agisce sia sulla produzione sia sul
   consumo (è un regolatore di ritmo), le altre costanti solo sulla produzione
   (sono compromessi fra gruppi). */
function fattoreGruppo(gen, produzione) {
  var f = 1;
  /* La gravità è un regolatore di ritmo: alza insieme resa e consumo. */
  if (gen.gruppo === "collasso" || gen.gruppo === "ciclo") {
    f *= 0.6 + valoreCostante("gravita") * 0.08;
  }
  if (produzione) {
    /* α governa tutto ciò che è elettromagnetico — chimica, vita, calcolo —
       contro la fusione nucleare, che una repulsione più forte ostacola. */
    if (gen.gruppo === "vita" || gen.gruppo === "macchina" || gen.gruppo === "informazione") {
      f *= 0.6 + valoreCostante("em") * 0.08;
    }
    if (gen.gruppo === "fusione") f *= 1.4 - valoreCostante("em") * 0.08;
    /* L'era intergalattica combatte proprio contro l'espansione: più lo spazio
       si dilata, più le galassie scappano prima che tu le raggiunga. È l'unico
       gruppo per cui una costante alta è una condanna, e Ancoraggio Cosmico è
       la ricerca che serve ad attutirla. */
    if (gen.gruppo === "orizzonte") {
      var ostilita = (valoreCostante("lambda") - 5) * 0.12 * (1 - Math.min(0.8, gs.molt.ancoraggio || 0));
      f *= Math.max(0.15, 1 - ostilita);
    }
    /* Uno spazio che si dilata diluisce la materia ma offre più vuoto da cui
       attingere: il primo anello guadagna proprio ciò che gli altri perdono. */
    if (gen.gruppo === "vuoto") f *= 0.6 + valoreCostante("lambda") * 0.08;
    if (gen.gruppo) f *= gs.molt.gruppi[gen.gruppo] || 1;
  } else {
    f *= gs.molt.consumi || 1;
    if (gen.gruppo) f *= gs.molt.consumiGruppo[gen.gruppo] || 1;
  }
  return f;
}

function moltiplicaConsumoGruppo(g, gruppo, fattore) {
  g.molt.consumiGruppo[gruppo] = (g.molt.consumiGruppo[gruppo] || 1) * fattore;
}

/* Quanto vale la produzione dichiarata di un generatore, al netto di quante
   unità ne hai e di quanto stanno effettivamente lavorando.
   Un generatore "grezzo" resta fuori dai moltiplicatori globali, di gruppo e
   temporanei: la sua resa dipende solo da quante unità hai e dalle ricerche
   che lo riguardano. Serve per gli Assiomi, che devono restare contabili sulle
   dita mentre tutto il resto cresce di ordini di grandezza — un moltiplicatore
   globale che vale ×10000 renderebbe assurdo qualunque prezzo in Assiomi. */
function moltProduzione(gen, globale) {
  var m = gs.molt.generatori[gen.id] || 1;
  if (gen.grezzo) return m;
  return m * globale * fattoreGruppo(gen, true) * bonusTemporaneo(gen.id);
}

/* E quanto consuma. La distinzione che tiene in piedi tutta l'economia:
   il moltiplicatore GLOBALE vale anche sul consumo, i moltiplicatori MIRATI no.

   Un universo che gira mille volte più in fretta produce mille volte tanto a
   ogni anello e ne brucia altrettanto: i rapporti della piramide restano quelli
   e la risorsa in cima — che nessuno consuma — accumula comunque mille volte
   più in fretta. Senza questo, una Nebulosa arrivava a produrre 1.06M di
   idrogeno al secondo bruciando 1.98 quark, e la catena su cui è costruito il
   gioco diventava un ornamento.

   I moltiplicatori mirati — una ricerca che raddoppia un generatore, un bonus
   di gruppo, un effetto temporaneo — restano invece sulla sola produzione:
   quelli sono guadagni di efficienza, ed è esattamente ciò che promettono le
   loro descrizioni («producono il doppio», cioè il doppio a parità di
   materia prima). */
function moltConsumo(gen, globale) {
  if (gen.grezzo) return 1;
  return globale * fattoreGruppo(gen, false);
}

function moltiplicatoreClick() {
  return gs.molt.click * (0.2 + valoreCostante("lambda") * 0.16) * bonusMetaClick();
}

/* Quanto è violenta una supernova con la gravità di questo universo. È lo
   stesso fattore che regola il ritmo dei generatori del gruppo "collasso":
   un cosmo che stringe forte esplode forte, e gli eventi lo devono sentire. */
function violenzaSupernova() {
  return 0.6 + valoreCostante("gravita") * 0.08;
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
    var m = n * eff * moltProduzione(gen, globale);
    for (var r in gen.produce) tassi[r] = (tassi[r] || 0) + gen.produce[r] * m;
    var fc = moltConsumo(gen, globale);
    if (gen.consuma) for (var c in gen.consuma) tassi[c] = (tassi[c] || 0) - gen.consuma[c] * n * eff * fc;
  });
  RISORSE.forEach(function (r) {
    var tasso = tassoDecadimento(r);
    if (tasso > 0) tassi[r.id] = (tassi[r.id] || 0) - (gs.risorse[r.id] || 0) * tasso;
  });
  return tassi;
}

/* Quanto si dissolve al secondo di una risorsa che non si lascia accumulare.
   Metrica Stabile e la Via della Pazienza lo dimezzano. */
function tassoDecadimento(r) {
  if (!r.decadimento) return 0;
  return r.decadimento * (gs.molt.decadimento === undefined ? 1 : gs.molt.decadimento);
}

/* Un tick di produzione. I generatori sono processati in ordine di fase, così
   ogni anello consuma ciò che l'anello precedente ha appena prodotto. */
function produci(dt) {
  var globale = moltiplicatoreGlobale();

  /* L'Energia del Vuoto si dissolve mentre la guardi: non è una riserva, è un
     flusso. Il decadimento è esponenziale, quindi vale lo stesso a passi
     lunghi o corti — un recupero d'assenza non regala né sottrae nulla. */
  RISORSE.forEach(function (r) {
    var tasso = tassoDecadimento(r);
    if (tasso > 0 && gs.risorse[r.id] > 0) {
      gs.risorse[r.id] *= Math.exp(-tasso * dt);
    }
  });

  GENERATORI.forEach(function (gen) {
    var n = gs.generatori[gen.id] || 0;
    if (n <= 0) { gs.efficienza[gen.id] = 1; return; }

    /* Se manca un input, il generatore lavora al ritmo consentito. */
    var fc = moltConsumo(gen, globale);
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
      var q = gen.produce[p] * n * fattore * dt * moltProduzione(gen, globale);
      if (q > 0) aggiungi(p, q);
    }
  });
}

/* Il tempo del gioco è quello dell'orologio, non quello del timer.
   Un browser rallenta i timer di una scheda in secondo piano (fino a uno
   sveglio al minuto) e può congelarla del tutto se la finestra è ridotta a
   icona. Perciò non si simula «un tick»: si guarda quanto tempo è passato
   davvero e lo si percorre tutto, spezzandolo in passi abbastanza corti da non
   falsare la catena — dove ogni anello consuma quello sotto, un passo troppo
   lungo regalerebbe produzione a chi sarebbe rimasto senza materia prima.
   Il tetto ai passi limita il lavoro di un recupero lungo: i passi si fanno
   più grossolani, quindi semmai il recupero rende un po' meno del dovuto,
   mai di più. */
var PASSO_MAX = 0.25;      // secondi simulati in un colpo solo
var PASSI_MAX = 2000;      // quanti passi al massimo per un singolo recupero

function simula(secondi, conEventi) {
  if (!(secondi > 0)) return;
  /* L'orologio dell'universo conta il tempo simulato, non quello di parete:
     una partita lasciata chiusa un mese invecchia delle otto ore che il
     recupero le concede davvero, non di un mese. */
  gs.eta = (gs.eta || 0) + secondi;
  /* Cambiare era rimette a zero l'orologio dell'era, non quello dell'universo. */
  if (gs.faseVista !== gs.fase) { gs.faseVista = gs.fase; gs.etaFase = 0; }
  gs.etaFase = (gs.etaFase || 0) + secondi;
  if (gs.asceso) return;
  aggiornaStabilita(secondi);
  /* Le lacerazioni sono distruzione, quindi valgono la stessa regola dei buchi
     neri: mai mentre non ci sei. Durante un'assenza l'universo si destabilizza
     davvero, ma non si strappa alle tue spalle. */
  if (conEventi && gs.stabilita < 0.25) {
    gs.prossimaRottura -= secondi;
    if (gs.prossimaRottura <= 0) {
      rotturaCosmica();
      gs.prossimaRottura = 60 + Math.random() * 60;
    }
  } else if (gs.prossimaRottura < 60) {
    gs.prossimaRottura = 60;
  }
  var passi = Math.min(Math.ceil(secondi / PASSO_MAX), PASSI_MAX);
  var dt = secondi / passi;
  for (var i = 0; i < passi; i++) {
    produci(dt);
    agisciManager(dt);
    /* Gli eventi vogliono qualcuno che scelga: durante un'assenza scorrono
       solo gli effetti già in corso, e l'occasione aspetta il ritorno. */
    if (conEventi) aggiornaEventi(dt); else scalaBonus(dt, true);
  }
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
    totale += gen.produce[risorsa] * n * eff * moltProduzione(gen, globale);
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
  return Math.max(fissa, produzioneLorda(risorsa) * (az.secondi + (gs.bonusSecondi || 0)));
}

function eseguiAzione(id) {
  var az = null;
  AZIONI.forEach(function (a) { if (a.id === id) az = a; });
  if (!az || !puoPagare(az.costo)) return;
  paga(az.costo);
  for (var r in az.resa) aggiungi(r, resaAzione(az, r));
  gs.click++;
  lampeggia("guadagno");
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
  lampeggia("costruzione");
  disegna();
}

var APERTURA_MAX = 3;      // quante tacche in più può guadagnare una costante
var COSTO_FISSA = 3;       // Assiomi per portarsi una legge nell'universo dopo

/* Il primo uso degli Assiomi: allargare il campo di una costante oltre i limiti
   che l'universo si era dato. Le formule sono lineari nel valore, quindi non
   serve altro che spostare gli estremi. */
function estendiCostante(id) {
  var def = null;
  COSTANTI.forEach(function (c) { if (c.id === id) def = c; });
  var aperte = gs.campo[id] || 0;
  if (!def || aperte >= APERTURA_MAX || (gs.risorse.assiomi || 0) < 1) return;
  gs.risorse.assiomi -= 1;
  gs.campo[id] = aperte + 1;
  registra("Hai riscritto i limiti di " + def.nome + ": ora va da " +
           (def.min - gs.campo[id]) + " a " + (def.max + gs.campo[id]) + ".", "traguardo");
  lampeggia("costruzione", 1.3);
  disegna();
}

/* Il secondo: fissare il valore attuale, che diventa il punto di partenza di
   ogni universo futuro. È l'unico lascito del prestigio che non sia una
   percentuale — è una legge. */
function fissaCostante(id) {
  var def = null;
  COSTANTI.forEach(function (c) { if (c.id === id) def = c; });
  if (!def || (gs.risorse.assiomi || 0) < COSTO_FISSA) return;
  gs.risorse.assiomi -= COSTO_FISSA;
  meta.leggi[id] = gs.costanti[id];
  salvaMeta();
  registra("Hai fissato " + def.nome + " a " + gs.costanti[id] +
           ": ogni universo che verrà nascerà con questa legge già scritta.", "traguardo");
  lampeggia("sistema");
  disegna();
}

function regolaCostante(id, passo) {
  var def = null;
  COSTANTI.forEach(function (c) { if (c.id === id) def = c; });
  if (!def) return;
  var campo = campoCostante(id);
  var nuovo = Math.max(campo.min, Math.min(campo.max, (gs.costanti[id] || 5) + passo));
  if (nuovo === gs.costanti[id]) return;
  var precedente = gs.costanti[id];
  gs.costanti[id] = nuovo;
  /* Cambiare una legge dell'universo è la decisione più pesante del gioco:
     merita una riga almeno quanto un acquisto. */
  registra("Hai regolato " + def.nome + ": " + precedente + " → " + nuovo + ".",
           "traguardo", "costante_" + id, 2500);
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

function compraRicerca(id, confermato) {
  var ric = null;
  RICERCHE.forEach(function (x) { if (x.id === id) ric = x; });
  if (!ric) return;
  if (!ric.ripetibile && gs.ricerche[id]) return;
  var costo = costoRicerca(ric);
  if (!puoPagare(costo)) return;
  if (ric.condExtra && !ric.condExtra(gs)) return;
  /* Una ricerca che non si può disfare passa dalla conferma. Il ritorno qui è
     una chiamata pulita: rifà tutti i controlli, così una risorsa spesa nel
     frattempo (da un manager, da un evento) non fa passare un acquisto che a
     quel punto non ci si potrebbe più permettere. */
  if (ric.conferma && !confermato) {
    var c = ric.conferma(gs);
    chiedi(c.titolo, c.testo, c.azione, function () { compraRicerca(id, true); });
    return;
  }
  paga(costo);
  gs.ricerche[id] = ric.ripetibile ? livelloRicerca(id) + 1 : true;
  registra("Ricerca completata: " + ric.nome +
           (ric.ripetibile ? " (livello " + livelloRicerca(id) + ")" : "") + ".",
           ric.traguardo ? "traguardo" : "evento");
  ric.effetto(gs);
  if (definizioneBivio(id)) apriBivio(id);
  lampeggia("costruzione", 1.3);
  disegna();
}

/* ============================================================================
   6. EVENTI COSMICI
============================================================================ */
/* Pensiero Profondo non produce nulla: cambia il ritmo del cosmo. Ogni livello
   accorcia l'attesa fra gli eventi e allunga gli effetti che ne nascono. */
function ritmoEventi()  { return Math.pow(0.9, livelloRicerca("pensiero")); }
function durataBonus()  { return 1 + 0.2 * livelloRicerca("pensiero"); }

function attivaBonus(generatore, fattore, durata, etichetta, periodica, ogni) {
  /* Pensiero Profondo allunga gli effetti, ma sarebbe una beffa se allungasse
     anche i guai: le penalità durano quello che devono. */
  var b = { gen: generatore, fattore: fattore,
            resta: durata * (fattore < 1 ? 1 : durataBonus()),
            etichetta: etichetta };
  /* Un effetto può anche *fare* qualcosa a intervalli, non solo moltiplicare.
     L'azione è una chiave, non una funzione, perché i bonus finiscono nel
     salvataggio e da lì tornano come semplice JSON. */
  if (periodica) { b.periodica = periodica; b.ogni = ogni; b.prossimo = ogni; }
  gs.bonus.push(b);
}

/* Ciò che un effetto periodico sa fare. Vive qui, in chiaro, invece che dentro
   l'evento che lo ha acceso: un salvataggio ricaricato deve poter ritrovare
   l'azione a partire dalla sua chiave. */
var AZIONI_PERIODICHE = {
  /* Il quasar acceso non si limita a rallentare: mangia. */
  quasar: function () {
    var gruppi = ["collasso", "fusione", "ciclo"];
    var gen = piuNumeroso(gruppi[Math.floor(Math.random() * gruppi.length)]);
    if (!gen) return;
    var persi = distruggiGeneratore(gen.id, 0.04);
    if (!persi) return;
    aggiungi("energia", persi * 12000);
    registra("Il disco di accrescimento inghiotte " + persi + " × " + gen.nome +
             ", e ne restituisce luce.", "avverso");
    lampeggia("danno");
  }
};

/* Scostamento temporaneo di una costante fondamentale. Vive nella stessa lista
   dei moltiplicatori — stessa scadenza, stessa riga in «Effetti in corso» — ma
   viene letto da valoreCostante, così un evento può piegare le leggi
   dell'universo invece di limitarsi a spingere un generatore. */
/* Registra lo scostamento *effettivo* e restituisce di quanto la costante si
   è davvero mossa: se è già al limite dello sfondamento la spinta si dissipa e
   non lascia nulla in «Effetti in corso», invece di mentire per due minuti. */
function attivaBonusCostante(costante, delta, durata, etichetta) {
  var prima = valoreCostante(costante);
  var campo = campoCostante(costante);
  var dopo = Math.max(campo.min - SFONDAMENTO,
                      Math.min(campo.max + SFONDAMENTO, prima + delta));
  var effettivo = dopo - prima;
  if (Math.abs(effettivo) < 0.001) return 0;
  gs.bonus.push({ costante: costante, delta: effettivo,
                  resta: durata * durataBonus(),
                  etichetta: etichetta.replace(/[+−-]\s*\d+$/, "").trim() +
                             " " + (effettivo > 0 ? "+" : "−") + Math.abs(effettivo) });
  return effettivo;
}

/* Moltiplicatore temporaneo che agisce su un generatore in questo istante.
   Un bonus con gen "*" vale per tutti. */
function bonusTemporaneo(idGeneratore) {
  var f = 1;
  for (var i = 0; i < gs.bonus.length; i++) {
    var b = gs.bonus[i];
    if (b.gen === idGeneratore || b.gen === "*") f *= b.fattore;
  }
  return f;
}

/* `assente` distingue il tempo vissuto da quello recuperato: durante
   un'assenza gli effetti scadono regolarmente, ma nessuno di essi agisce.
   Nessun buco nero mangia una partita mentre la pagina è chiusa. */
function scalaBonus(dt, assente) {
  var restanti = [];
  for (var i = 0; i < gs.bonus.length; i++) {
    var b = gs.bonus[i];
    b.resta -= dt;
    if (b.periodica && !assente) {
      b.prossimo -= dt;
      while (b.prossimo <= 0 && b.resta > 0) {
        if (AZIONI_PERIODICHE[b.periodica]) AZIONI_PERIODICHE[b.periodica]();
        b.prossimo += b.ogni;
      }
    }
    if (b.resta > 0) restanti.push(b);
    else registra("Finito l'effetto: " + b.etichetta + ".");
  }
  gs.bonus = restanti;
}

function eventiPossibili() {
  return EVENTI.filter(function (e) { return e.cond(gs); });
}

function proponiEvento() {
  var possibili = eventiPossibili();
  if (!possibili.length) return;
  /* Un universo instabile non è solo più rumoroso: è più ostile. Quanto più la
     stabilità scende, tanto più spesso ciò che arriva è una minaccia. */
  var minacce = possibili.filter(function (x) { return x.minaccia; });
  if (minacce.length && Math.random() < (1 - gs.stabilita) * 0.8) possibili = minacce;
  var e = possibili[Math.floor(Math.random() * possibili.length)];
  gs.eventoAttivo = { id: e.id, resta: 45 };
  gs.sbloccati["ev_" + e.id] = true;
  mostraEvento(e);
  registra("Evento cosmico: " + e.titolo + ".", "traguardo");
}

function definizioneEvento(id) {
  for (var i = 0; i < EVENTI.length; i++) if (EVENTI[i].id === id) return EVENTI[i];
  return null;
}

function mostraEvento(e) {
  $("evento-titolo").textContent = e.titolo;
  $("evento-titolo").classList.toggle("minaccia", !!e.minaccia);
  $("evento-testo").textContent = e.minaccia
    ? e.testo + " Non decidere non è un modo per uscirne: allo scadere del tempo " +
      "accadrà comunque «" + e.scelte[e.predefinita || 0].testo.toLowerCase() + "»."
    : e.testo;
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

/* Nessuno ha deciso: si applica lo stesso l'esito predefinito. Ignorare una
   minaccia è una scelta come le altre, e ha lo stesso prezzo. */
function risolviDaSe(e) {
  var i = e.predefinita || 0;
  var esito = e.scelte[i].applica(gs);
  registra("Nessuno ha deciso, e " + e.titolo.toLowerCase() + " ha fatto il suo corso. " +
           esito, "avverso");
  lampeggia("danno");
}

function chiudiEvento() {
  gs.eventoAttivo = null;
  gs.prossimoEvento = (120 + Math.random() * 120) * ritmoEventi();   // fra 2 e 4 minuti
  $("pannello-evento").classList.add("oculto");
  disegna();
}

function aggiornaEventi(dt) {
  scalaBonus(dt);
  if (gs.eventoAttivo) {
    var def = definizioneEvento(gs.eventoAttivo.id);
    var minaccia = def && def.minaccia;
    gs.eventoAttivo.resta -= dt;
    var restano = Math.max(0, Math.ceil(gs.eventoAttivo.resta));
    $("evento-tempo").innerHTML = minaccia
      ? 'Se non decidi, decide l\'universo: <span class="tempo-reale">' + restano + ' s</span>'
      : 'L\'occasione svanisce fra <span class="tempo-reale">' + restano + ' s</span>';
    if (gs.eventoAttivo.resta <= 0) {
      if (minaccia) risolviDaSe(def);
      else registra("L'occasione è svanita senza che nessuno la cogliesse.");
      chiudiEvento();
    }
    return;
  }
  if (!eventiPossibili().length) return;
  gs.prossimoEvento -= dt * ritmoInstabilita();
  if (gs.prossimoEvento <= 0) proponiEvento();
}

/* ============================================================================
   7. BIVI FRA LE ERE
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
  lampeggia("sistema");
  gs.bivioAperto = null;
  $("pannello-bivio").classList.add("oculto");
  disegna();
}

/* ============================================================================
   8. PROGRESSIONE "UNFOLDING"
   Ogni tick verifica se qualcosa di nuovo va rivelato.
============================================================================ */
var NOMI_FASI = ["Il Vuoto", "Era Primordiale", "Era Stellare", "Era della Vita",
                 "Era della Civiltà", "Era Galattica", "Era Intergalattica", "Era della Legge"];

/* Ogni sistema del gioco entra in scena allo stesso modo: il pannello compare
   con la sua animazione, il log dice a cosa serve — non solo che esiste — e la
   tela lampeggia. Prima metà dei pannelli si presentava e metà appariva di
   nascosto, il che li faceva sembrare pezzi di app diverse. */
var SISTEMI = {
  generatori: {
    pannello: "pannello-generatori",
    annuncio: "Puoi costruire infrastrutture: raccolgono al posto tuo, e ognuna consuma ciò che produce quella sotto."
  },
  ricerche: {
    pannello: "pannello-ricerche",
    annuncio: "Si apre la Ricerca: i moltiplicatori permanenti, non le strutture, sono ciò che sposta davvero l'ago."
  },
  costanti: {
    pannello: "pannello-costanti",
    annuncio: "Puoi regolare le leggi dell'universo. Nessun valore è il migliore: ognuno sacrifica qualcosa."
  },
  universo: {
    pannello: "pannello-universo",
    cond: function (g) { return g.generatori.fluttuazione >= 1; },
    annuncio: "Il riquadro «Il tuo universo» mostra davvero ciò che possiedi, non una decorazione."
  },
  statistiche: {
    pannello: "pannello-statistiche",
    cond: function (g) { return g.generatori.fluttuazione >= 2; },
    annuncio: "Da qui puoi controllare come sta andando: produzione, collo di bottiglia e distanza dal traguardo."
  },
  trascendenza: {
    pannello: "pannello-trascendenza",
    cond: function (g) { return totale(g, "intelligenza") >= 5000; },
    annuncio: "Le civiltà intuiscono che il loro universo è uno fra molti possibili: ora puoi trascendere."
  },
  manager: {
    pannello: "pannello-manager",
    cond: function () { return meta.cu > 0 || quantiManager() > 0; },
    annuncio: "Hai Costanti Universali da spendere: i manager ricomprano le infrastrutture al posto tuo, per sempre."
  },
  codex: {
    pannello: null,
    cond: function (g) { return totale(g, "energia") >= 20; },
    annuncio: "Si apre il Codex: ogni cosa che incontri lascia una voce, con l'astrofisica vera che c'è dietro."
  }
};

function presenta(id) {
  var def = SISTEMI[id];
  if (!def || gs.sbloccati["sis_" + id]) return;
  gs.sbloccati["sis_" + id] = true;
  var p = def.pannello ? $(def.pannello) : null;
  if (p) {
    p.classList.remove("oculto");
    p.classList.add("appena-aperto");
  }
  registra(def.annuncio, "sistema");
  lampeggia("sistema");
}

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
    presenta("generatori");
    creaSchedaGeneratore(gen);
    registra("Nuova infrastruttura progettabile: " + gen.nome + ".", "evento");
  });
  /* ricerche */
  RICERCHE.forEach(function (ric) {
    if (gs.sbloccati["ric_" + ric.id] || (!ric.ripetibile && gs.ricerche[ric.id]) || !ric.cond(gs)) return;
    gs.sbloccati["ric_" + ric.id] = true;
    presenta("ricerche");
    creaSchedaRicerca(ric);
    registra("Nuova ricerca disponibile: " + ric.nome + ".", "evento");
  });
  /* il Codex si riempie da solo: ogni voce guarda la casella di sblocco che le
     corrisponde, così non servono ganci sparsi per il codice */
  CODEX.forEach(function (v) {
    if (gs.codex[v.id] || !gs.sbloccati[v.chiave]) return;
    gs.codex[v.id] = 1;
    if (gs.sbloccati.sis_codex) registra("Nuova voce nel Codex: " + v.titolo + ".", "evento");
  });

  /* i sistemi che si aprono da soli, tutti dalla stessa porta */
  for (var idSis in SISTEMI) {
    if (SISTEMI[idSis].cond && SISTEMI[idSis].cond(gs)) presenta(idSis);
  }
  /* costanti fondamentali */
  COSTANTI.forEach(function (c) {
    if (gs.sbloccati["cost_" + c.id] || !c.cond(gs)) return;
    gs.sbloccati["cost_" + c.id] = true;
    presenta("costanti");
    creaRigaCostante(c);
    registra("Una legge in più si lascia regolare: " + c.nome + ".", "evento");
  });
  $("fase-corrente").textContent = NOMI_FASI[gs.fase] || NOMI_FASI[0];
}

/* Un'unica riga che risponde a «e adesso?». Nei primi minuti insegna — il gioco
   apriva con un bottone e due righe di poesia, senza dire cosa ci si aspettasse
   dal giocatore — e da lì in poi misura quanto manca al traguardo dell'era, che
   prima era una scheda qualsiasi in fondo a una colonna. */
var OBIETTIVI = [
  { testo: "Premi «Raccogli Energia Quantistica»: dal vuoto si può estrarre qualcosa.",
    quota: function (g) { return g.generatori.fluttuazione > 0 ? 1 : g.click / 5; } },
  { testo: "Arriva a 40 Energia Quantistica: basteranno a condensare i primi Quark.",
    quota: function (g) { return totale(g, "energia") / 40; } },
  { testo: "Costruisci una Fluttuazione Quantistica: raccoglierà al posto tuo, per sempre.",
    quota: function (g) { return g.generatori.fluttuazione / 1; } },
  { testo: "Condensa 30 Quark: con quelli potrai mettere le mani sulla gravità.",
    quota: function (g) { return totale(g, "quark") / 30; } },
  { testo: "Costruisci un Attrattore di Quark: è il secondo anello della catena.",
    quota: function (g) { return g.generatori.attrattore / 1; } }
];

/* Il traguardo che apre l'era successiva a quella in corso. Si sceglie per era
   e non per ordine nell'elenco: un salvataggio che non ha registrato i passaggi
   vecchi non deve far puntare la barra a un traguardo già superato. */
function traguardoAperto() {
  for (var i = 0; i < RICERCHE.length; i++) {
    var r = RICERCHE[i];
    if (r.traguardo && r.fase >= gs.fase && !gs.ricerche[r.id]) return r;
  }
  return null;
}

/* La risorsa che un'era produce e nessuno consuma: è il suo risultato netto. */
var RISORSA_ERA = { 1: "quark", 2: "polvere", 3: "biomassa", 4: "intelligenza",
                    5: "mondi", 6: "galassie", 7: "assiomi" };

/* L'anello che sta lavorando peggio di tutti, cioè dove la piramide è troppo
   carica in alto. Finora andava dedotto scheda per scheda. */
function collo() {
  var peggiore = null, quanto = 0.97;
  GENERATORI.forEach(function (gen) {
    if ((gs.generatori[gen.id] || 0) <= 0) return;
    var e = gs.efficienza[gen.id];
    if (e !== undefined && e < quanto) { quanto = e; peggiore = gen; }
  });
  return peggiore
    ? peggiore.nome + " · al " + Math.round(quanto * 100) + "%"
    : "nessuno: la catena regge";
}

/* Quanto manca, a questo ritmo, alla ricerca che apre l'era successiva. */
function attesaTraguardo() {
  var t = traguardoAperto();
  if (!t) return "—";
  if (t.condExtra && !t.condExtra(gs)) return "manca " + (t.richiede || "un requisito");
  var costo = costoRicerca(t), tassi = tassiCorrenti(), attesa = 0, possibile = true;
  for (var r in costo) {
    var manca = costo[r] - (gs.risorse[r] || 0);
    if (manca <= 0) continue;
    var ritmo = tassi[r] || 0;
    if (ritmo <= 0) { possibile = false; break; }
    attesa = Math.max(attesa, manca / ritmo);
  }
  if (!possibile) return "non a questo ritmo";
  return attesa <= 0
    ? "puoi pagarlo adesso"
    : '<span class="tempo-reale">' + fmtDurata(attesa) + "</span>";
}

function obiettivoCorrente() {
  /* Gli obiettivi guida valgono solo nella prima era: chi carica una partita
     avanzata non deve ritrovarsi «premi il bottone» al 0%. */
  if (gs.fase <= 1) {
    for (var i = 0; i < OBIETTIVI.length; i++) {
      var o = OBIETTIVI[i];
      var q = o.quota(gs);
      if (q < 1) return { testo: o.testo, quota: Math.max(0, q) };
    }
  }
  var t = traguardoAperto();
  if (!t) return { testo: "Nulla da raggiungere: questo universo è completo.", quota: 1 };
  var costo = costoRicerca(t), peggiore = 1;
  for (var r in costo) {
    peggiore = Math.min(peggiore, (gs.risorse[r] || 0) / costo[r]);
  }
  var manca = t.condExtra && !t.condExtra(gs) ? " — manca " + (t.richiede || "un requisito") : "";
  return { testo: "Verso il traguardo dell'era: " + t.nome + manca + ".", quota: peggiore };
}

/* ============================================================================
   9. COSTRUZIONE DELLA UI
   Ogni elemento è creato una sola volta e poi aggiornato sul posto: nessun
   innerHTML ricostruito a ogni tick (perderebbe hover, focus e click).
============================================================================ */
var nodi = { risorse: {}, azioni: {}, generatori: {}, ricerche: {}, costanti: {}, manager: {} };

var eraRisorsaMostrata = 0;

/* La colonna delle risorse arriva a diciotto righe: senza un'intestazione ogni
   volta che cambia era diventa un muro. Le intestazioni nascono insieme alla
   prima risorsa della loro era, quindi non annunciano mai il futuro. */
function creaRigaRisorsa(r) {
  if (r.era && r.era !== eraRisorsaMostrata) {
    eraRisorsaMostrata = r.era;
    var t = document.createElement("div");
    t.className = "era-risorse";
    t.textContent = NOMI_FASI[r.era] || "";
    $("lista-risorse").appendChild(t);
  }
  var d = document.createElement("div");
  d.className = "risorsa nuova";
  d.innerHTML = '<span class="nome"></span><span class="grafico"></span>' +
                '<span class="valore-risorsa"><span class="quantita"></span> <span class="tasso"></span></span>' +
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
    '<button><span class="titolo">Costruisci</span><span class="dettaglio"></span></button>';
  d.querySelector(".gnome").textContent = gen.nome;
  d.querySelector(".descrizione").textContent = gen.descrizione;
  d.querySelector("button").addEventListener("click", function () { compraGeneratore(gen.id); });
  $("lista-generatori").appendChild(d);
  nodi.generatori[gen.id] = {
    posseduti: d.querySelector(".posseduti"),
    titoloBottone: d.querySelector("button .titolo"),
    flusso: d.querySelector(".flusso"),
    bottone: d.querySelector("button"),
    dettaglio: d.querySelector(".dettaglio")
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
    '</div><div class="effetto"></div>' +
    '<div class="assiomi oculto">' +
      '<button class="estendi minore">Allarga il campo</button>' +
      '<button class="fissa minore">Fissa la legge</button>' +
    '</div>';
  d.querySelector(".nome-c").innerHTML = c.nome + "<em>" + c.simbolo + "</em>";
  d.querySelector(".meno").addEventListener("click", function () { regolaCostante(c.id, -1); });
  d.querySelector(".piu").addEventListener("click", function () { regolaCostante(c.id, 1); });
  d.querySelector(".estendi").addEventListener("click", function () { estendiCostante(c.id); });
  d.querySelector(".fissa").addEventListener("click", function () { fissaCostante(c.id); });
  $("lista-costanti").appendChild(d);
  nodi.costanti[c.id] = {
    valore: d.querySelector(".valore"),
    effetto: d.querySelector(".effetto"),
    meno: d.querySelector(".meno"),
    piu: d.querySelector(".piu"),
    assiomi: d.querySelector(".assiomi"),
    estendi: d.querySelector(".estendi"),
    fissa: d.querySelector(".fissa")
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
    var pezzo = fmtQta(r, costo[r]) + (d && d.unita ? " di " : " ") + nomeRisorsa(r);
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

/* Una quantità di risorsa si scrive in un modo solo, in tutta l'app: stessa
   scala, stessa unità, stesso nome. I testi degli eventi e dei costi passano
   di qui come ci passa la colonna delle risorse, altrimenti lo stesso idrogeno
   compare come «+500» in un pannello e «500.00M M☉» in quello accanto. */
function qta(id, v) {
  return fmtQta(id, v) + " " + nomeRisorsa(id);
}

function fmtQta(id, v) {
  var d = defRisorsa(id);
  var x = v * ((d && d.perUnita) || 1);
  return fmt(x) + (d && d.unita ? " " + d.unita : "");
}

/* Come sopra ma per i tassi, dove sotto la decina servono i decimali. */
function fmtFlusso(id, v) {
  var d = defRisorsa(id);
  var x = v * ((d && d.perUnita) || 1);
  var testo = Math.abs(x) < 1000 ? fmtTasso(x) : fmt(x);
  return testo + (d && d.unita ? " " + d.unita : "");
}

function nomeRisorsa(id) {
  for (var i = 0; i < RISORSE.length; i++) if (RISORSE[i].id === id) return RISORSE[i].nome;
  return id;
}

/* ============================================================================
   10. AGGIORNAMENTO DELLA UI
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
        var reso = gen.produce[p] * kMostrato * moltProduzione(gen, moltiplicatoreGlobale());
        flusso.push('<span class="prod">+' + fmtFlusso(p, reso) + " " + nomeRisorsa(p) + "/s</span>");
      }
    }
    /* La carenza si dichiara qui, accanto al numero che la causa: prima la
       stessa notizia compariva due volte, con parole diverse. */
    var eff = gs.efficienza[gen.id];
    var scarso = posseduti > 0 && eff !== undefined && eff < 0.97;
    if (gen.consuma) for (var c in gen.consuma) {
      flusso.push('<span class="cons">−' +
                  fmtFlusso(c, gen.consuma[c] * kMostrato * moltConsumo(gen, moltiplicatoreGlobale())) +
                  " " + nomeRisorsa(c) + "/s" +
                  (scarso ? " · insufficiente, al " + Math.round(eff * 100) + "%" : "") +
                  "</span>");
    }
    if (gen.id === "dyson") flusso.push('<span class="prod">+10% a ogni produzione</span>');
    n.flusso.innerHTML = (kMostrato > 1 ? "×" + kMostrato + ": " : "ciascuna: ") + flusso.join(" · ");

    var costo = costoMultiplo(gen, kMostrato);
    n.titoloBottone.textContent = kMostrato > 1 ? "Costruisci ×" + kMostrato : "Costruisci";
    n.dettaglio.innerHTML = testoCosto(costo);
    n.bottone.disabled = k <= 0;


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
  if (gs.sbloccati.sis_manager) disegnaManager();

  /* trascendenza */
  if (gs.sbloccati.sis_trascendenza) {
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
      return '<div class="effetto-attivo"><span class="quanto' +
             (b.fattore !== undefined && b.fattore < 1 ? " avverso" : "") + '">' + b.etichetta +
             '</span><span class="resta tempo-reale">' + Math.ceil(b.resta) + " s</span></div>";
    }).join("");
  }

  /* stabilità: la conseguenza delle costanti, sotto le costanti */
  var stato = statoStabilita();
  var perc = Math.round(gs.stabilita * 100);
  $("stabilita").className = stato;
  $("stabilita-valore").textContent = perc + "% · " + stato;
  $("stabilita-riempimento").style.width = perc + "%";
  $("stabilita-nota").textContent = NOTE_STABILITA[stato];

  /* costanti */
  COSTANTI.forEach(function (c) {
    var n = nodi.costanti[c.id];
    if (!n) return;
    /* Se un evento sta piegando questa legge, la manopola lo dice: mostra
       «scelto → in vigore» e descrive l'effetto che vale adesso. */
    var v = gs.costanti[c.id], attuale = valoreCostante(c.id);
    var campo = campoCostante(c.id);
    n.valore.textContent = (attuale !== v ? v + " → " + attuale : v) + " / " + campo.max;
    /* fuori dal quadrante il numero si accende: è lì che l'universo si incrina */
    n.valore.classList.toggle("oltre", attuale > campo.max || attuale < campo.min);
    n.effetto.innerHTML = c.effetto(attuale);
    n.meno.disabled = v <= campo.min;
    n.piu.disabled = v >= campo.max;
    /* I due usi degli Assiomi compaiono solo quando esistono gli Assiomi. */
    var haAssiomi = gs.sbloccati.assiomi;
    n.assiomi.classList.toggle("oculto", !haAssiomi);
    if (haAssiomi) {
      var libere = APERTURA_MAX - (gs.campo[c.id] || 0);
      n.estendi.disabled = libere <= 0 || (gs.risorse.assiomi || 0) < 1;
      n.estendi.textContent = libere > 0 ? "Allarga il campo · 1 assioma" : "Campo al massimo";
      var fissata = meta.leggi[c.id];
      n.fissa.disabled = (gs.risorse.assiomi || 0) < COSTO_FISSA || fissata === v;
      n.fissa.textContent = fissata === v
        ? "Legge fissata a " + v
        : "Fissa la legge · " + COSTO_FISSA + " assiomi";
    }
  });

  /* l'età del cosmo, sotto il nome dell'era */
  $("eta-cosmica").textContent = formattaAnni(etaCosmica()) + " dal Big Bang";

  aggiornaBottoneCodex();

  /* l'obiettivo corrente: il testo cambia di rado, la barra a ogni tick */
  var ob = obiettivoCorrente();
  var quota = Math.max(0, Math.min(1, ob.quota));
  if ($("obiettivo-testo").textContent !== ob.testo) $("obiettivo-testo").textContent = ob.testo;
  $("obiettivo-quota").textContent = Math.floor(quota * 100) + "%";
  $("obiettivo-riempimento").style.width = (quota * 100).toFixed(1) + "%";
  $("obiettivo").classList.toggle("pronto", quota >= 1);

  /* statistiche: prima le tre righe che rispondono a «come sto andando»,
     poi, sotto una linea, le curiosità. Era il contrario: un elenco di numeri
     messi lì per accumulo, che non rispondeva a nessuna domanda. */
  if (gs.sbloccati.sis_statistiche) {
    var chiave = RISORSA_ERA[gs.fase] || "energia";
    var tassi = tassiCorrenti();
    var stretta = collo();
    $("lista-statistiche").innerHTML =
      riga("Produzione dell'era", (tassi[chiave] > 0 ? "+" : "") +
           fmtFlusso(chiave, tassi[chiave] || 0) + "/s di " + nomeRisorsa(chiave)) +
      riga("Collo di bottiglia", stretta) +
      riga("Stabilità", Math.round(gs.stabilita * 100) + "% · " + statoStabilita()) +
      riga("Al traguardo", attesaTraguardo()) +
      '<div class="separatore"></div>' +
      riga("Età dell'universo", '<span class="tempo-cosmo">' + formattaAnni(etaCosmica()) + "</span>") +
      riga("Tempo di gioco", '<span class="tempo-reale">' + formattaEta(gs.eta) + "</span>") +
      riga("Moltiplicatore globale", "×" + fmt(moltiplicatoreGlobale())) +
      riga("Potenza del click", "×" + fmt(moltiplicatoreClick())) +
      riga("Azioni manuali", fmt(gs.click)) +
      (meta.cu > 0 ? riga("Costanti Universali", fmt(meta.cu) + " (+" +
                          Math.round((bonusMeta() - 1) * 100) + "%)") : "") +
      (gs.cicatrici > 0 ? riga("Cicatrici", "−" + gs.cicatrici + "% produzione") : "");
  }
}

function riga(etichetta, valore) {
  return '<div class="risorsa"><span class="nome">' + etichetta + '</span><span class="quantita">' + valore + "</span></div>";
}

/* ============================================================================
   11. STORICO DEI FLUSSI
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
   12. VISUALIZZAZIONE
   Puramente decorativa: se il browser non offre un canvas il gioco continua
   senza, quindi qui non deve mai propagarsi un errore.
============================================================================ */
var tela = null, pennello = null, TW = 0, TH = 0, semi = [], lampi = [];
var continenti = [], citta = [], didascalia = null, prossimaDidascalia = 0;
var tempoScena = 0, ultimoFotogramma = 0;

function preparaTela() {
  tela = $("universo");
  try { pennello = tela && tela.getContext ? tela.getContext("2d") : null; }
  catch (e) { pennello = null; }
  if (!pennello) return;
  TW = tela.width; TH = tela.height;
  /* Il pianeta ha i suoi continenti, decisi una volta sola: due partite non
     hanno la stessa Terra, ma dentro una partita la geografia non balla. */
  continenti = [];
  for (var k = 0; k < 22; k++) {
    continenti.push({
      lon: Math.random() * 6.283,
      lat: (Math.random() - 0.5) * 2.0,
      r: 6 + Math.random() * 13,
      forma: 0.6 + Math.random() * 0.8
    });
  }
  /* Le città stanno dove capita, ma sempre nella stessa fascia abitabile: è
     quello che rende riconoscibile il lato notturno quando si accende. */
  citta = [];
  for (var q = 0; q < 60; q++) {
    citta.push({ lon: Math.random() * 6.283, lat: (Math.random() - 0.5) * 1.7,
                 fase: Math.random() * 6.28 });
  }
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

/* ---------------------------------------------------------------------------
   Il pianeta.

   Dall'Era della Vita in poi la tela smette di essere solo una scena di punti e
   mostra un mondo: oceani che si riempiono, continenti che si coprono di verde,
   calotte, luci sul lato notturno quando qualcuno le accende. Non è
   un'illustrazione fissa — ogni strato legge una risorsa vera, quindi il
   pianeta racconta la partita mentre succede.
--------------------------------------------------------------------------- */
function quotaRisorsa(id, pieno) {
  return Math.max(0, Math.min(1, Math.log10(1 + (gs.risorse[id] || 0)) / Math.log10(pieno)));
}

function disegnaPianeta(dt) {
  if (gs.fase < 3) return;
  var cx = TW * 0.76, cy = TH * 0.5, R = Math.min(58, TH * 0.26);
  var rot = tempoScena * 0.12;
  var mare = quotaRisorsa("acqua", 1e9);
  var roccia = quotaRisorsa("carbonio", 1e9);
  var verde = quotaRisorsa("biomassa", 1e9);
  var luci = quotaRisorsa("intelligenza", 1e9);

  /* atmosfera: un alone che si fa azzurro quando c'è acqua */
  var aria = pennello.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.35);
  aria.addColorStop(0, "rgba(120,180,255," + (0.10 + mare * 0.28).toFixed(3) + ")");
  aria.addColorStop(1, "rgba(120,180,255,0)");
  pennello.fillStyle = aria;
  pennello.beginPath(); pennello.arc(cx, cy, R * 1.35, 0, 6.29); pennello.fill();

  /* il disco: roccia nuda finché non arriva l'acqua */
  var oceano = pennello.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  oceano.addColorStop(0, "rgb(" + Math.round(70 - mare * 30) + "," +
                         Math.round(70 + mare * 30) + "," + Math.round(65 + mare * 90) + ")");
  oceano.addColorStop(1, "rgb(" + Math.round(30 - mare * 12) + "," +
                         Math.round(32 + mare * 8) + "," + Math.round(30 + mare * 55) + ")");
  pennello.fillStyle = oceano;
  pennello.beginPath(); pennello.arc(cx, cy, R, 0, 6.29); pennello.fill();

  pennello.save();
  pennello.beginPath(); pennello.arc(cx, cy, R, 0, 6.29); pennello.clip();

  /* continenti: girano con il pianeta e si rimpiccioliscono verso il bordo */
  for (var i = 0; i < continenti.length; i++) {
    var c = continenti[i];
    var a = c.lon + rot;
    var davanti = Math.cos(a);
    if (davanti <= 0.05) continue;
    var x = cx + R * Math.sin(a) * Math.cos(c.lat);
    var y = cy - R * Math.sin(c.lat);
    var rr = c.r * davanti;
    /* la vita colora la terra: da bruno a verde */
    var vr = Math.round(96 - verde * 40 + roccia * 18);
    var vg = Math.round(84 + verde * 70);
    var vb = Math.round(62 - verde * 20);
    pennello.fillStyle = "rgba(" + vr + "," + vg + "," + vb + ",.92)";
    pennello.beginPath();
    pennello.ellipse(x, y, rr, rr * c.forma, a, 0, 6.29);
    pennello.fill();
  }

  /* calotte polari */
  if (mare > 0.05) {
    pennello.fillStyle = "rgba(226,238,255," + (0.30 + mare * 0.35).toFixed(3) + ")";
    pennello.beginPath(); pennello.ellipse(cx, cy - R * 1.02, R * 0.40, R * 0.20, 0, 0, 6.29); pennello.fill();
    pennello.beginPath(); pennello.ellipse(cx, cy + R * 1.02, R * 0.36, R * 0.18, 0, 0, 6.29); pennello.fill();
  }

  /* il lato notturno, e le luci che qualcuno vi accende */
  var notte = pennello.createLinearGradient(cx - R, cy, cx + R, cy);
  notte.addColorStop(0, "rgba(0,0,6,.86)");
  notte.addColorStop(0.45, "rgba(0,0,6,.25)");
  notte.addColorStop(0.72, "rgba(0,0,6,0)");
  pennello.fillStyle = notte;
  pennello.fillRect(cx - R, cy - R, R * 2, R * 2);

  if (luci > 0.02) {
    var quante = Math.ceil(citta.length * Math.min(1, luci * 1.6));
    for (var j = 0; j < quante; j++) {
      var c2 = citta[j];
      var a2 = c2.lon + rot;
      var davanti2 = Math.cos(a2);
      if (davanti2 <= 0.05) continue;
      var x2 = cx + R * Math.sin(a2) * Math.cos(c2.lat);
      if (x2 > cx + R * 0.10) continue;                 // solo dove è notte
      var y2 = cy - R * Math.sin(c2.lat);
      var brillio = 0.45 + 0.55 * Math.abs(Math.sin(tempoScena * 1.7 + c2.fase));
      pennello.fillStyle = "rgba(255,206,130," + (brillio * 0.85).toFixed(3) + ")";
      pennello.beginPath(); pennello.arc(x2, y2, 0.9 + davanti2 * 0.8, 0, 6.29); pennello.fill();
    }
  }
  pennello.restore();

  /* il filo di luce sul bordo illuminato */
  pennello.strokeStyle = "rgba(190,220,255," + (0.25 + mare * 0.35).toFixed(3) + ")";
  pennello.lineWidth = 1;
  pennello.beginPath(); pennello.arc(cx, cy, R, -1.15, 1.15); pennello.stroke();

  /* ciò che orbita, quando esiste */
  var orbitanti = Math.min(10, (gs.generatori.dyson || 0) + (gs.generatori.colonia || 0));
  for (var o = 0; o < orbitanti; o++) {
    var ang = tempoScena * 0.5 + o * (6.283 / Math.max(1, orbitanti));
    var ox = cx + Math.cos(ang) * R * 1.45;
    var oy = cy + Math.sin(ang) * R * 0.42;
    pennello.fillStyle = "rgba(255,190,110,.75)";
    pennello.beginPath(); pennello.arc(ox, oy, 1.6, 0, 6.29); pennello.fill();
  }

  disegnaDidascalia(dt, cx, cy + R + 16);
}

/* Quello che sta succedendo là dentro, detto a parole. Le frasi vere in questo
   momento si alternano, così il riquadro racconta invece di illustrare. */
var DIDASCALIE = [
  { cond: function (g) { return (g.risorse.biomassa || 0) <= 0; },
    testo: "Roccia e acqua. Nient'altro, per ora." },
  { cond: function (g) { return (g.risorse.biomassa || 0) > 0; },
    testo: "Nei fondali qualcosa ha cominciato a copiarsi." },
  { cond: function (g) { return (g.risorse.biomassa || 0) > 1e4; },
    testo: "Il verde risale dai mari e prende i continenti." },
  { cond: function (g) { return !!g.ricerche.fotosintesi; },
    testo: "L'ossigeno satura gli oceani, poi l'aria." },
  { cond: function (g) { return (g.risorse.intelligenza || 0) > 0; },
    testo: "Sul lato notturno si accendono le prime luci." },
  { cond: function (g) { return (g.generatori.colonia || 0) > 0; },
    testo: "Il pianeta ha smesso di essere l'unico." },
  { cond: function (g) { return (g.generatori.dyson || 0) > 0; },
    testo: "Una cintura di collettori gli oscura il sole." },
  { cond: function (g) { return (g.generatori.ascensore || 0) > 0; },
    testo: "Sopra le loro teste, la stella viene smontata." },
  { cond: function (g) { return tassiCorrenti().biomassa < 0; },
    testo: "La biosfera cala: qualcosa la consuma più in fretta di quanto cresca." }
];

function disegnaDidascalia(dt, x, y) {
  prossimaDidascalia -= dt;
  /* Una didascalia si cambia allo scadere del turno, ma anche subito se ha
     smesso di essere vera: dire «roccia e acqua, nient'altro» mentre i
     continenti sono già verdi sarebbe peggio che non dire niente. */
  var scaduta = !didascalia || !didascalia.cond(gs) || prossimaDidascalia <= 0;
  if (scaduta) {
    var vere = DIDASCALIE.filter(function (d) { return d.cond(gs); });
    if (vere.length) didascalia = vere[Math.floor(Math.random() * vere.length)];
    prossimaDidascalia = 7;
  }
  if (!didascalia) return;
  pennello.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  pennello.textAlign = "center";
  pennello.fillStyle = "rgba(190,205,235,.65)";
  /* la frase resta dentro il riquadro anche quando è lunga */
  var meta = pennello.measureText(didascalia.testo).width / 2;
  var cxTesto = Math.max(meta + 8, Math.min(TW - meta - 8, x));
  pennello.fillText(didascalia.testo, cxTesto, Math.min(y, TH - 8));
  pennello.textAlign = "start";
}

/* Un lampo dove è appena successo qualcosa: dà un riscontro visivo immediato
   alle azioni manuali e agli acquisti. */
/* Quattro lampi, quattro significati, e nessun altro. Prima erano sette colori
   scelti uno alla volta: il giocatore non poteva impararli, quindi la tela
   lampeggiava senza dire niente. */
var LAMPI = {
  guadagno:    { colore: "rgba(120,220,160,", forza: 1.0 },   // è arrivato qualcosa
  costruzione: { colore: "rgba(255,200,120,", forza: 1.8 },   // hai costruito o studiato
  danno:       { colore: "rgba(255,120,90,",  forza: 2.2 },   // hai perso qualcosa
  sistema:     { colore: "rgba(150,190,255,", forza: 2.6 }    // si è aperto un sistema
};

function lampeggia(tipo, forzaExtra) {
  if (!pennello || motoRidotto()) return;
  var l = LAMPI[tipo] || LAMPI.guadagno;
  lampi.push({
    x: Math.random() * TW, y: Math.random() * TH,
    eta: 0, durata: 0.9, colore: l.colore, forza: l.forza * (forzaExtra || 1)
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
  /* Le ere tarde contano in ordini di grandezza molto più alti: se restassero
     sulla stessa scala logaritmica saturerebbero al primo generatore. */
  var smontate = scala(gs.generatori.ascensore * 100 + gs.risorse.antimateria, 1e12);
  var rete = scala(gs.risorse.galassie * 1000 + gs.risorse.oscura, 1e12);
  var reticolo = scala(gs.risorse.universi * 1000 + gs.risorse.informazione, 1e15);

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

  /* stelle smontate: filamenti che salgono dalla fotosfera verso il nulla */
  var nsm = Math.floor(smontate * 40);
  for (var a = 0; a < nsm; a++) {
    var s7 = semi[(a * 23 + 7) % semi.length];
    var fase7 = ((tempoScena * 0.5) + a * 0.11) % 1;
    pennello.strokeStyle = "rgba(255,220,170," + ((1 - fase7) * 0.5).toFixed(3) + ")";
    pennello.lineWidth = 0.8;
    pennello.beginPath();
    pennello.moveTo(s7.x, s7.y);
    pennello.lineTo(s7.x + 10 * fase7, s7.y - 16 * fase7);
    pennello.stroke();
  }

  /* la ragnatela intergalattica: pochi nodi, cuciti da fili lunghissimi */
  var nr = Math.floor(rete * 16);
  for (var b2 = 0; b2 < nr; b2++) {
    var da = semi[(b2 * 31 + 3) % semi.length];
    var a2 = semi[(b2 * 37 + 19) % semi.length];
    pennello.strokeStyle = "rgba(150,130,220," + (0.10 + 0.12 * Math.sin(tempoScena + b2)).toFixed(3) + ")";
    pennello.lineWidth = 0.7;
    pennello.beginPath(); pennello.moveTo(da.x, da.y); pennello.lineTo(a2.x, a2.y); pennello.stroke();
  }

  /* universi simulati: un reticolo regolare, l'unica cosa non organica qui */
  var nu = Math.floor(reticolo * 30);
  for (var u = 0; u < nu; u++) {
    var s8 = semi[(u * 41 + 13) % semi.length];
    var lam = 0.35 + 0.35 * Math.abs(Math.sin(tempoScena * 1.2 + u * 0.4));
    pennello.strokeStyle = "rgba(210,230,255," + lam.toFixed(3) + ")";
    pennello.lineWidth = 0.7;
    pennello.strokeRect(s8.x - 3, s8.y - 3, 6, 6);
  }

  /* un universo instabile si vede: la scena trema e si arrossa, tanto più
     quanto meno regge. È lo stesso dato della barra, detto senza numeri. */
  var sfaldamento = 1 - Math.max(0, Math.min(1, gs.stabilita));
  if (sfaldamento > 0.25) {
    var scossa = (sfaldamento - 0.25) * 4;
    pennello.save();
    pennello.translate((Math.random() - 0.5) * scossa * 2.5, (Math.random() - 0.5) * scossa * 2.5);
    pennello.fillStyle = "rgba(255,90,70," + (scossa * 0.05).toFixed(3) + ")";
    pennello.fillRect(0, 0, TW, TH);
    pennello.restore();
  }

  /* un evento in attesa di decisione non resta solo nel suo pannello: la tela
     lo segnala con un anello che pulsa, rosso se è una minaccia. */
  if (gs.eventoAttivo) {
    var def = definizioneEvento(gs.eventoAttivo.id);
    var minaccia = def && def.minaccia;
    var pulsa = 0.45 + 0.55 * Math.abs(Math.sin(tempoScena * 2.2));
    var raggio = 16 + pulsa * 10;
    pennello.strokeStyle = (minaccia ? "rgba(255,120,90," : "rgba(255,205,120,") +
                           (0.35 + pulsa * 0.45).toFixed(3) + ")";
    pennello.lineWidth = 2;
    pennello.beginPath();
    pennello.arc(TW - 34, 34, raggio * 0.6, 0, 6.29);
    pennello.stroke();
    pennello.fillStyle = (minaccia ? "rgba(255,120,90," : "rgba(255,205,120,") + (pulsa * 0.5).toFixed(3) + ")";
    pennello.beginPath();
    pennello.arc(TW - 34, 34, 3.5, 0, 6.29);
    pennello.fill();
  }

  /* il buco nero: un disco che non emette nulla, un anello che emette troppo.
     Compare quando ne hai addomesticato uno o quando un quasar è acceso. */
  var quasar = 0;
  for (var z = 0; z < gs.bonus.length; z++) if (gs.bonus[z].periodica === "quasar") quasar = 1;
  if (gs.generatori.bucoNero > 0 || quasar) {
    var cx = TW * 0.5, cy = TH * 0.5;
    var rr = 12 + Math.min(18, gs.generatori.bucoNero) + quasar * 8;
    var anello = pennello.createRadialGradient(cx, cy, rr * 0.9, cx, cy, rr * 2.2);
    anello.addColorStop(0, quasar ? "rgba(255,150,90,.85)" : "rgba(255,190,120,.55)");
    anello.addColorStop(1, "rgba(0,0,0,0)");
    pennello.fillStyle = anello;
    pennello.beginPath(); pennello.arc(cx, cy, rr * 2.2, 0, 6.29); pennello.fill();
    pennello.fillStyle = "#000";
    pennello.beginPath(); pennello.arc(cx, cy, rr, 0, 6.29); pennello.fill();
    pennello.strokeStyle = quasar ? "rgba(255,120,80,.9)" : "rgba(255,200,140,.6)";
    pennello.lineWidth = 1.4;
    pennello.beginPath();
    pennello.ellipse(cx, cy, rr * 1.9, rr * 0.5, tempoScena * 0.15, 0, 6.29);
    pennello.stroke();
  }

  disegnaPianeta(dt);
  disegnaLampi(dt);
  if (fermo) setTimeout(function () { disegnaUniverso(ultimoFotogramma + 1000); }, 1000);
  else requestAnimationFrame(disegnaUniverso);
}

/* ============================================================================
   13. PANNELLI RICHIUDIBILI E TASTIERA
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
    /* Escape chiude una finestra modale da qualunque punto, anche con il fuoco
       su un bottone: è la via d'uscita, non una scorciatoia di gioco. */
    if (e.key === "Escape") {
      if (confermaAperta()) { e.preventDefault(); chiudiConferma(); }
      else { $("trasferimento").classList.add("oculto"); $("codex").classList.add("oculto"); }
      return;
    }
    /* Con una conferma aperta il resto della tastiera appartiene a lei: la
       barra spaziatrice non deve raccogliere energia dietro a un dialogo. */
    if (confermaAperta()) return;
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

/* Conferma per ciò che non si può disfare. Non usa confirm() del browser:
   dopo il primo dialogo alcune finestre offrono di sopprimere i successivi, e
   una conferma che a volte non compare è peggio di nessuna conferma. Il fuoco
   parte da «Annulla», così un Invio distratto non azzera una partita. */
var azioneConferma = null;

function chiedi(titolo, testo, etichetta, azione) {
  azioneConferma = azione;
  $("conferma-titolo").textContent = titolo;
  $("conferma-testo").textContent = testo;
  $("btn-conferma-si").textContent = etichetta;
  $("conferma").classList.remove("oculto");
  $("btn-conferma-no").focus();
}

function chiudiConferma() {
  azioneConferma = null;
  $("conferma").classList.add("oculto");
}

function confermaAperta() { return !$("conferma").classList.contains("oculto"); }

/* ============================================================================
   Il Codex: un raccoglitore, non un sistema di gioco. Non dà bonus e non chiede
   niente — è il posto dove il gioco spiega perché le cose che gli fai fare
   somigliano a come funziona davvero l'universo.
============================================================================ */
function vociScoperte() {
  return CODEX.filter(function (v) { return gs.codex[v.id]; });
}

function vociDaLeggere() {
  return CODEX.filter(function (v) { return gs.codex[v.id] === 1; }).length;
}

function apriCodex() {
  var scoperte = vociScoperte();
  var box = $("codex-voci");
  box.innerHTML = "";
  var eraCorrente = 0;
  scoperte.forEach(function (v) {
    if (v.era !== eraCorrente) {
      eraCorrente = v.era;
      var t = document.createElement("div");
      t.className = "codex-era";
      t.textContent = NOMI_FASI[v.era] || "";
      box.appendChild(t);
    }
    var d = document.createElement("div");
    d.className = "codex-voce" + (gs.codex[v.id] === 1 ? " nuova" : "");
    d.innerHTML = '<div class="codex-nome"></div><div class="codex-testo"></div>';
    d.querySelector(".codex-nome").textContent = v.titolo;
    d.querySelector(".codex-testo").textContent = v.testo;
    box.appendChild(d);
  });
  $("codex-sommario").textContent = scoperte.length
    ? scoperte.length + " voci su " + CODEX.length + ". Ogni cosa che incontri nel gioco ne apre una."
    : "Ancora nessuna voce: si aprono da sole, incontrando le cose.";
  /* aprirlo è leggerlo: da qui in poi niente più pallino */
  CODEX.forEach(function (v) { if (gs.codex[v.id] === 1) gs.codex[v.id] = 2; });
  $("codex").classList.remove("oculto");
  $("btn-chiudi-codex").focus();
  disegna();
}

function aggiornaBottoneCodex() {
  var b = $("btn-codex");
  if (!b) return;
  b.classList.toggle("oculto", !gs.sbloccati.sis_codex);
  var nuove = vociDaLeggere();
  b.textContent = nuove ? "Codex · " + nuove : "Codex";
  b.classList.toggle("con-novita", nuove > 0);
}

/* ============================================================================
   14. TEMA
   Il tema scuro resta il predefinito: è l'identità del gioco. La scelta del
   giocatore viene ricordata, se il browser lo consente.
============================================================================ */
var CHIAVE_TEMA = "singularitas_tema";

function applicaTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  var b = $("btn-tema");
  if (b) {
    /* Il simbolo mostra dove si va, non dove si è: al buio si offre il sole. */
    var verso = tema === "chiaro" ? "scuro" : "chiaro";
    b.innerHTML = '<span aria-hidden="true">' + (tema === "chiaro" ? "☾" : "☀") + "</span>";
    b.title = "Passa al tema " + verso;
    b.setAttribute("aria-label", "Passa al tema " + verso);
  }
  archivio.scrivi(CHIAVE_TEMA, tema);
}

function temaCorrente() {
  return document.documentElement.getAttribute("data-tema") === "chiaro" ? "chiaro" : "scuro";
}

/* ============================================================================
   15. SCHERMATA FINALE
============================================================================ */
function mostraFinale() {
  $("finale-testo").textContent =
    "Hai cominciato con un vuoto che non conteneva nulla, e da quel nulla hai " +
    "estratto energia, poi materia, poi stelle, poi mondi, poi menti. Ora l'universo " +
    "che hai costruito ti guarda, e ha capito di essere stato costruito.";
  $("finale-statistiche").innerHTML =
    riga("Azioni manuali", fmt(gs.click)) +
    riga("Sfere di Dyson", fmt(gs.generatori.dyson)) +
    riga("Intelligenza totale", fmtQta("intelligenza", gs.totali.intelligenza)) +
    riga("Biomassa totale", fmtQta("biomassa", gs.totali.biomassa)) +
    riga("Età raggiunta", formattaAnni(etaCosmica())) +
    riga("Tempo di gioco", formattaEta(gs.eta));
  var premio = cuGuadagnate() * 2;
  $("finale-statistiche").innerHTML +=
    riga("Costanti Universali guadagnate", "+" + fmt(premio) + " (doppie, per l'Ascensione)");
  $("btn-ricomincia").textContent = "Nuovo Big Bang · +" + fmt(premio) + " CU";
  $("finale").classList.remove("oculto");
  registra("ASCENSIONE COSMICA — l'universo è completo.", "traguardo");
}

/* ============================================================================
   16. SALVATAGGIO
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
    if (typeof salvato.molt.consumi !== "number") salvato.molt.consumi = 1;
    if (!salvato.molt.gruppi || typeof salvato.molt.gruppi !== "object") salvato.molt.gruppi = {};
    if (typeof salvato.bonusSecondi !== "number") salvato.bonusSecondi = 0;
    if (typeof salvato.eta !== "number") salvato.eta = 0;
    if (typeof salvato.etaFase !== "number") salvato.etaFase = 0;
    if (typeof salvato.faseVista !== "number") salvato.faseVista = salvato.fase || 1;
    if (typeof salvato.cicatrici !== "number") salvato.cicatrici = 0;
    if (!salvato.campo || typeof salvato.campo !== "object") salvato.campo = {};
    if (!salvato.codex || typeof salvato.codex !== "object") salvato.codex = {};
    if (typeof salvato.stabilita !== "number") salvato.stabilita = 1;
    if (typeof salvato.prossimaRottura !== "number") salvato.prossimaRottura = 60;
    if (!salvato.molt.consumiGruppo || typeof salvato.molt.consumiGruppo !== "object") salvato.molt.consumiGruppo = {};
    if (typeof salvato.molt.decadimento !== "number") salvato.molt.decadimento = 1;
    if (typeof salvato.molt.ancoraggio !== "number") salvato.molt.ancoraggio = 0;
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

/* Un'assenza è un'assenza, che la pagina fosse chiusa o soltanto nascosta
   dietro un'altra finestra: stessa simulazione, stesso tetto di otto ore. */
var ASSENZA_MAX = 8 * 3600;

function recuperaAssenza(secondi, testo) {
  var vero = Math.min(secondi, ASSENZA_MAX);
  if (!(vero > 0)) return;
  simula(vero, false);
  if (vero >= 60) {
    registra(testo + " (" + durataTesto(vero) + ").", "buono");
    disegna();
  }
}

/* L'orologio dell'universo non conta le ore che hai giocato: conta gli anni che
   il cosmo ha vissuto. Ogni era ha il suo intervallo, preso dalla cronologia
   vera — la ricombinazione a 380 000 anni, la vita a 3.4 miliardi, oggi a
   13.8 — e dentro l'era il tempo scorre in scala geometrica, così l'ordine di
   grandezza cambia con continuità invece che a scatti. */
var ETA_ERE = [
  [1e-12, 1e-12],        // fase 0: prima che ci sia qualcosa da contare
  [1e-12, 3.8e5],        // Era Primordiale: dai microsecondi alla ricombinazione
  [3.8e5, 3.4e9],        // Era Stellare: le prime stelle, poi le galassie
  [3.4e9, 9e9],          // Era della Vita
  [9e9, 13.8e9],         // Era della Civiltà: fino a oggi
  [13.8e9, 1e11],        // Era Galattica
  [1e11, 1e13],          // Era Intergalattica
  [1e13, 1e15]           // Era della Legge
];
/* Quanto dura, di gioco, un'era "tipica": serve solo a far avanzare l'orologio
   in modo credibile dentro l'era, non al bilanciamento. */
var DURATE_ERE = [1, 600, 3000, 28000, 50000, 18000, 36000, 100000];

function etaCosmica() {
  var f = Math.max(0, Math.min(ETA_ERE.length - 1, gs.fase || 0));
  var arco = ETA_ERE[f];
  var quota = Math.min(1, (gs.etaFase || 0) / (DURATE_ERE[f] || 1));
  return arco[0] * Math.pow(arco[1] / arco[0], quota);
}

function formattaAnni(anni) {
  if (anni >= 1e12) return arrotonda(anni / 1e12) + " mila miliardi di anni";
  if (anni >= 1e9)  return arrotonda(anni / 1e9) + " miliardi di anni";
  if (anni >= 1e6)  return arrotonda(anni / 1e6) + " milioni di anni";
  if (anni >= 1e3)  return arrotonda(anni / 1e3) + " mila anni";
  if (anni >= 1)    return Math.round(anni) + " anni";
  var s = anni * 3.156e7;
  if (s >= 1)    return s.toFixed(0) + " secondi";
  if (s >= 1e-3) return (s * 1e3).toFixed(0) + " millisecondi";
  if (s >= 1e-6) return (s * 1e6).toFixed(0) + " microsecondi";
  return "un istante";
}

function arrotonda(x) {
  return x >= 100 ? String(Math.round(x)) : (x >= 10 ? x.toFixed(1) : x.toFixed(2));
}

/* Tempo di gioco vero, per le statistiche: giorni solo quando ce ne sono. */
function formattaEta(secondi) {
  var s = Math.max(0, Math.floor(secondi || 0));
  var due = function (n) { return (n < 10 ? "0" : "") + n; };
  var giorni = Math.floor(s / 86400);
  return (giorni > 0 ? giorni + " g " : "") +
         due(Math.floor((s % 86400) / 3600)) + ":" +
         due(Math.floor((s % 3600) / 60)) + ":" + due(s % 60);
}

function durataTesto(secondi) {
  var minuti = Math.floor(secondi / 60);
  if (minuti < 60) return minuti + " minuti";
  var ore = Math.floor(minuti / 60);
  return ore + (ore === 1 ? " ora" : " ore") + " e " + (minuti % 60) + " minuti";
}

function progressoOffline() {
  var trascorso = (Date.now() - (gs.ultimoAccesso || Date.now())) / 1000;
  if (trascorso < 60) return;
  recuperaAssenza(trascorso, "Mentre eri via l'universo ha continuato a evolversi");
}

/* ============================================================================
   17. TRASFERIMENTO DELLA PARTITA
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
  registra("Partita importata.", "buono");
  return true;
}

/* ============================================================================
   18. AVVIO E GAME LOOP
============================================================================ */
function ricostruisciUI(universoNuovo) {
  ["lista-risorse", "lista-azioni", "lista-generatori", "lista-ricerche", "lista-costanti"].forEach(function (id) {
    $(id).innerHTML = "";
  });
  nodi = { risorse: {}, azioni: {}, generatori: {}, ricerche: {}, costanti: {}, manager: {} };
  eraRisorsaMostrata = 0;
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
  /* rivelare di nuovo ciò che il giocatore ha già non è una notizia; in un
     universo appena nato, invece, lo è. */
  silenzioLog = !universoNuovo;
  verificaSblocchi();
  silenzioLog = false;
  disegna();
}

function nuovaPartita() {
  gs = statoIniziale();
  storia = {}; attesaCampione = 0;
  $("log").innerHTML = "";
  /* L'apertura viene prima, e solo dopo i sistemi si presentano: in un universo
     nuovo le presentazioni sono notizie, non ripetizioni, quindi qui il log
     resta acceso — al contrario di quando si ricarica una partita salvata. */
  registra("Non c'è spazio, non c'è tempo, non c'è materia.", "traguardo");
  registra("Ma il vuoto non è mai davvero vuoto: fluttua. E da una fluttuazione si può estrarre energia.");
  ricostruisciUI(true);
}

function avvia() {
  caricaMeta();
  adottaVecchiSalvataggi();
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
    chiedi("Trascendere",
           "Questo universo finisce qui: risorse, infrastrutture e ricerche si " +
           "azzerano. Porterai con te " + fmt(g3) + " Costanti Universali, che " +
           "valgono per sempre.",
           "Trascendi", function () { trascendi(1); });
  });
  $("btn-tema").addEventListener("click", function () {
    applicaTema(temaCorrente() === "chiaro" ? "scuro" : "chiaro");
  });

  $("btn-salva").addEventListener("click", function () { salva(false); });
  $("btn-reset").addEventListener("click", function () {
    chiedi("Azzerare la partita",
           "L'universo torna al vuoto: si perdono " + formattaAnni(etaCosmica()) +
           " di storia, tutte le risorse e tutte le ricerche. Le Costanti " +
           "Universali restano. L'operazione non si può annullare.",
           "Azzera", function () {
             archivio.cancella(chiaveSalvataggio());
             nuovaPartita();
           });
  });

  $("btn-codex").addEventListener("click", apriCodex);
  $("btn-chiudi-codex").addEventListener("click", function () {
    $("codex").classList.add("oculto");
  });
  $("codex").addEventListener("click", function (e) {
    if (e.target === $("codex")) $("codex").classList.add("oculto");
  });

  $("btn-conferma-si").addEventListener("click", function () {
    var azione = azioneConferma;
    chiudiConferma();
    if (azione) azione();
  });
  $("btn-conferma-no").addEventListener("click", chiudiConferma);
  $("conferma").addEventListener("click", function (e) {
    if (e.target === $("conferma")) chiudiConferma();   // clic fuori = annulla
  });
  $("btn-ricomincia").addEventListener("click", function () {
    meta.ascensioni++;
    trascendi(2);   // l'Ascensione completa vale il doppio della trascendenza anticipata
  });

  /* Game loop: chiede l'ora a ogni giro invece di fidarsi del timer. Se il
     browser ha rallentato la scheda, il tempo perso non è perso: viene
     simulato tutto. Oltre la soglia si passa dal recupero di un'assenza, che
     lascia in sospeso gli eventi invece di farli scadere senza un pubblico. */
  var ASSENZA_MIN = 20;      // secondi di lacuna oltre i quali «eri via»
  var ultimo = Date.now();

  function passoDiGioco() {
    var ora = Date.now();
    var trascorso = (ora - ultimo) / 1000;
    ultimo = ora;
    if (!(trascorso > 0)) return;
    if (trascorso > ASSENZA_MIN) {
      recuperaAssenza(trascorso, "Mentre non guardavi l'universo ha continuato a evolversi");
    } else {
      simula(trascorso, true);
    }
    storiaDaRidisegnare = campiona(Math.min(trascorso, INTERVALLO_CAMPIONE));
    verificaSblocchi();
    /* Ridisegnare una pagina che nessuno sta guardando è lavoro sprecato:
       la partita avanza lo stesso, la si ridipinge al ritorno. */
    if (!document.hidden) disegna();
  }

  setInterval(passoDiGioco, 100);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      /* Una scheda in secondo piano può essere congelata o buttata via dal
         browser senza preavviso: si salva subito, così al ritorno il tempo
         passato viene recuperato dal salvataggio invece che perso. */
      salva(true);
    } else {
      passoDiGioco();          // recupero immediato, senza aspettare il timer
      ultimoFotogramma = 0;    // e l'animazione riparte da un passo sano
      disegna();
    }
  });

  setInterval(function () { salva(true); }, 15000);
  window.addEventListener("beforeunload", function () { salva(true); });
  window.addEventListener("pagehide", function () { salva(true); });

  preparaPannelli();
  preparaTastiera();
  preparaTela();
  disegnaUniverso(0);

  window.__avviato = true;
}

avvia();

})();
