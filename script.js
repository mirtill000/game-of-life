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
/* Un solo modo di scrivere le condizioni di sblocco: le soglie di fase con
   `g.fase`, tutto il resto con `totale(g, risorsa)`. Prima convivevano tre
   idiomi diversi per la stessa cosa. */
function totale(g, id) { return g.totali[id] || 0; }

var RISORSE = [
  { id: "energia", era: 1,      nome: "Energia Quantistica", cond: function () { return true; } },
  { id: "quark", era: 1,        nome: "Quark",
    cond: function (g) { return totale(g, "energia") >= 40; } },
  { id: "idrogeno", era: 2,     nome: "Idrogeno", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 2; } },
  { id: "elio", era: 2,         nome: "Elio", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 2; } },
  { id: "polvere", era: 2,      nome: "Polvere Stellare", unita: "M☉", perUnita: 1e3,
    cond: function (g) { return g.fase >= 2; } },
  { id: "acqua", era: 3,        nome: "Acqua", unita: "M⊕", perUnita: 1,
    cond: function (g) { return g.fase >= 3; } },
  { id: "carbonio", era: 3,     nome: "Carbonio", unita: "M⊕", perUnita: 1,
    cond: function (g) { return g.fase >= 3; } },
  { id: "biomassa", era: 3,     nome: "Biomassa", unita: "Gt", perUnita: 1e3,
    cond: function (g) { return g.fase >= 3; } },
  { id: "intelligenza", era: 4, nome: "Intelligenza", unita: "menti", perUnita: 1e6,
    cond: function (g) { return g.fase >= 4; } },
  { id: "sfere", era: 4,        nome: "Sfere di Dyson",      cond: function (g) { return g.generatori.dyson > 0; } },

  /* --- Era Galattica: la civiltà smonta le stelle invece di orbitarle --- */
  { id: "antimateria", era: 5,  nome: "Antimateria", unita: "t", perUnita: 1e3,
    cond: function (g) { return g.fase >= 5; } },
  { id: "mondi", era: 5,        nome: "Mondi Governati",
    cond: function (g) { return g.fase >= 5; } },

  /* --- Era Intergalattica: l'Energia del Vuoto non si accumula, scorre --- */
  { id: "oscura", era: 6,       nome: "Materia Oscura", unita: "M☉", perUnita: 1e6,
    cond: function (g) { return g.fase >= 6; } },
  /* Nota di bilanciamento: una risorsa che decade ha una scorta massima pari a
     produzione/decadimento, quindi non può essere il prezzo d'acquisto di
     niente — si spende solo come flusso, ed è esattamente il suo mestiere. */
  { id: "vuoto", era: 6,        nome: "Energia del Vuoto", unita: "ZJ", perUnita: 1e3,
    decadimento: 0.02,
    cond: function (g) { return g.fase >= 6; } },
  { id: "galassie", era: 6,     nome: "Galassie Raggiunte",
    cond: function (g) { return g.fase >= 6; } },

  /* --- Era della Legge: non abiti più l'universo, lo scrivi --- */
  { id: "informazione", era: 7, nome: "Informazione", unita: "qubit", perUnita: 1e12,
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
    descrizione: "Avvolge una stella intera. Ogni sfera aumenta del 10% ogni produzione.",
    costo: { polvere: 25000, intelligenza: 10000 }, crescita: 1.3,
    produce: { sfere: 0 },
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
    id: "sintesi_idrogeno", nome: "Sintesi dell'Idrogeno", traguardo: true,
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
    id: "galassia", nome: "Accensione della prima Galassia", traguardo: true,
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
    id: "senziente", nome: "Specie Senziente", traguardo: true,
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
    id: "egemonia", nome: "Egemonia Stellare", traguardo: true,
    descrizione: "Una stella non basta più: la civiltà impara a smontarle. Apre l'Era Galattica.",
    costo: { intelligenza: 800000 },
    condExtra: function (g) { return g.generatori.dyson >= 12; },
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
    id: "diaspora", nome: "Diaspora", traguardo: true,
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
    id: "gruppo_locale", nome: "Il Gruppo Locale", traguardo: true,
    descrizione: "Tutto ciò che è raggiungibile è stato raggiunto. Resta da capire perché. Apre l'Era della Legge.",
    costo: { galassie: 200, oscura: 6000000 },
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
    id: "ascensione", nome: "Ascensione Cosmica", traguardo: true,
    descrizione: "Le regole del prossimo universo sono scritte. Non resta che accenderlo.",
    costo: { assiomi: 20, informazione: 50000000 },
    condExtra: function (g) { return g.generatori.forgia >= 5; },
    cond: function (g) { return totale(g, "assiomi") >= 5; },
    /* L'unica ricerca che chiude la partita: si chiede prima, e rinunciare
       non costa nulla — si resta esattamente dov'eravamo. */
    conferma: function (g) {
      return {
        titolo: "Ascensione Cosmica",
        testo: "È l'ultimo passo: questo universo diventa consapevole di sé e la " +
               "partita si chiude qui, dopo " + formattaEta(g.eta) + " di storia. " +
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
          return "Scudi di polvere deviano la radiazione: −" + fmt(costo) + " Polvere Stellare, nessuna perdita.";
        } },
      { testo: "Lasciar fare alla natura", dettaglio: "perdi biomassa in proporzione alla gravità, ma piovono metalli",
        applica: function (g) {
          var persa = g.risorse.biomassa * 0.15 * violenzaSupernova();
          g.risorse.biomassa -= persa;
          var guadagno = persa * 2;
          aggiungi("polvere", guadagno);
          return "Le atmosfere bruciano: −" + fmt(persa) + " Biomassa, +" + fmt(guadagno) +
                 " Polvere Stellare. Con questa gravità l'esplosione vale " +
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
          attivaBonusCostante("gravita", 2, 90, "Gravità +2");
          return "Tutto collassa più in fretta, e brucia altrettanto in fretta: Gravità +2 per 90 secondi.";
        } },
      { testo: "Opporsi alla compressione", dettaglio: "Gravità −2 per 90 secondi",
        applica: function () {
          attivaBonusCostante("gravita", -2, 90, "Gravità −2");
          return "Il ritmo rallenta e le riserve durano: Gravità −2 per 90 secondi.";
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
          attivaBonusCostante("em", 2, 120, "Elettromagnetismo +2");
          return "I legami si fanno saldi: la vita e il calcolo accelerano per 120 secondi.";
        } },
      { testo: "Verso la fusione", dettaglio: "Elettromagnetismo −2 per 120 secondi",
        applica: function () {
          attivaBonusCostante("em", -2, 120, "Elettromagnetismo −2");
          return "I nuclei si respingono meno: le stelle bruciano meglio per 120 secondi.";
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
          return "Un fronte d'urto la dissolve prima che arrivi: −" + fmt(costo) + " Idrogeno.";
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
          return "Si brucia il malato per salvare il sano: −" + fmt(persa) + " Biomassa, contagio fermato.";
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
          return "Il guscio viene intercettato intero: +" + fmt(q) + " Idrogeno.";
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
          return "Annichilazione controllata: −" + fmt(persa) + " Antimateria, +" + fmt(persa * 5000) + " Energia.";
        } },
      { testo: "Tentare di stabilizzarlo", dettaglio: "metà dell'antimateria, e niente in cambio",
        applica: function (g) {
          var persa = g.risorse.antimateria * 0.5;
          g.risorse.antimateria -= persa;
          return "Il campo cede prima: −" + fmt(persa) + " Antimateria, dispersa contro le pareti.";
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
          return "Le nubi passano al largo: −" + fmt(costo) + " Polvere Stellare, nessuna perdita.";
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
                 fmt(costo) + " Antimateria.";
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
          return "Tutto viene legato e ammortizzato: −" + fmt(costo) + " Antimateria, nessuna perdita.";
        } },
      { testo: "Cavalcare l'onda", dettaglio: "−20% al gruppo del collasso, ma Gravità +3 per 180 s",
        applica: function () {
          var gen = piuNumeroso("collasso");
          var persi = gen ? distruggiGeneratore(gen.id, 0.2) : 0;
          attivaBonusCostante("gravita", 3, 180, "Gravità +3");
          aggiungi("polvere", persi * 3000);
          return (persi ? "L'onda squarcia " + persi + " × " + gen.nome + " e ne sparge le ceneri (+" +
                          fmt(persi * 3000) + " Polvere). " : "") +
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
          return "L'alone si lascia leggere tutto in una volta: +" + fmt(q) + " Materia Oscura.";
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
          return "I ponti reggono lo strappo: −" + fmt(costo) + " Energia del Vuoto, nessuna galassia persa.";
        } },
      { testo: "Lasciarle andare", dettaglio: "perdi un quarto delle galassie raggiunte",
        applica: function (g) {
          var perse = g.risorse.galassie * 0.25;
          g.risorse.galassie -= perse;
          return "Se ne vanno in silenzio, una per una: −" + fmt(perse) + " Galassie Raggiunte.";
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
          return "Si evacua in tempo, ma le rotte costano: −" + fmt(costo) + " Mondi Governati.";
        } },
      { testo: "Non fare in tempo", dettaglio: "−15% a Colonie e Flotte, in cambio di materia oscura",
        applica: function () {
          var a = distruggiGeneratore("colonia", 0.15);
          var b = distruggiGeneratore("flotta", 0.15);
          var resa = (a + b) * 50000;
          aggiungi("oscura", resa);
          return a + b
            ? "La scia di marea porta via " + a + " Colonie e " + b + " Flotte, e lascia dietro di sé +" +
              fmt(resa) + " Materia Oscura."
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
          return "Ogni cervello della rete lo riverifica in parallelo: +" + fmt(q) + " Informazione.";
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
          return "Si taglia la ricorsione a mano: −" + fmt(costo) + " Informazione.";
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
  var resaSfera = 0.1 * (0.6 + valoreCostante("gravita") * 0.08);
  return gs.molt.globale * (1 + gs.generatori.dyson * resaSfera) *
         (1.4 - valoreCostante("lambda") * 0.08) * bonusMeta() *
         Math.pow(0.99, gs.cicatrici || 0);
}

/* Valore effettivo di una costante: quello scelto dal giocatore più gli
   scostamenti temporanei lasciati dagli eventi, sempre entro i limiti. */
function valoreCostante(id) {
  var base = gs.costanti[id];
  if (typeof base !== "number") base = 5;
  var delta = 0;
  for (var i = 0; i < gs.bonus.length; i++) {
    if (gs.bonus[i].costante === id) delta += gs.bonus[i].delta;
  }
  var def = null;
  COSTANTI.forEach(function (c) { if (c.id === id) def = c; });
  var apertura = (gs.campo && gs.campo[id]) || 0;
  var min = (def ? def.min : 1) - apertura, max = (def ? def.max : 9) + apertura;
  return Math.max(min, Math.min(max, base + delta));
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
    var fc = fattoreGruppo(gen, false);
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
    var fc = fattoreGruppo(gen, false);
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
  if (gs.asceso) return;
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
  lampeggia("rgba(200,170,255,", 2.4);
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
  lampeggia("rgba(255,220,150,", 3);
  disegna();
}

function regolaCostante(id, passo) {
  var def = null;
  COSTANTI.forEach(function (c) { if (c.id === id) def = c; });
  if (!def) return;
  var nuovo = Math.max(def.min, Math.min(def.max, (gs.costanti[id] || 5) + passo));
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
  lampeggia("rgba(180,150,255,", 2.4);
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
    lampeggia("rgba(255,120,90,", 2.2);
  }
};

/* Scostamento temporaneo di una costante fondamentale. Vive nella stessa lista
   dei moltiplicatori — stessa scadenza, stessa riga in «Effetti in corso» — ma
   viene letto da valoreCostante, così un evento può piegare le leggi
   dell'universo invece di limitarsi a spingere un generatore. */
function attivaBonusCostante(costante, delta, durata, etichetta) {
  gs.bonus.push({ costante: costante, delta: delta,
                  resta: durata * durataBonus(), etichetta: etichetta });
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
  lampeggia("rgba(255,140,110,", 2);
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
    $("evento-tempo").textContent = minaccia
      ? "Se non decidi, decide l'universo: " + restano + " s"
      : "L'occasione svanisce fra " + restano + " s";
    if (gs.eventoAttivo.resta <= 0) {
      if (minaccia) risolviDaSe(def);
      else registra("L'occasione è svanita senza che nessuno la cogliesse.");
      chiudiEvento();
    }
    return;
  }
  if (!eventiPossibili().length) return;
  gs.prossimoEvento -= dt;
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
  lampeggia("rgba(180,220,255,", 3);
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
                  fmtFlusso(c, gen.consuma[c] * kMostrato * fattoreGruppo(gen, false)) +
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
      return '<div class="effetto-attivo"><span class="quanto' +
             (b.fattore !== undefined && b.fattore < 1 ? " avverso" : "") + '">' + b.etichetta +
             '</span><span class="resta">' + Math.ceil(b.resta) + " s</span></div>";
    }).join("");
  }

  /* costanti */
  COSTANTI.forEach(function (c) {
    var n = nodi.costanti[c.id];
    if (!n) return;
    /* Se un evento sta piegando questa legge, la manopola lo dice: mostra
       «scelto → in vigore» e descrive l'effetto che vale adesso. */
    var v = gs.costanti[c.id], attuale = valoreCostante(c.id);
    n.valore.textContent = (attuale !== v ? v + " → " + attuale : v) + " / " + c.max;
    n.effetto.innerHTML = c.effetto(attuale);
    var apertura = gs.campo[c.id] || 0;
    n.meno.disabled = v <= c.min - apertura;
    n.piu.disabled = v >= c.max + apertura;
    /* I due usi degli Assiomi compaiono solo quando esistono gli Assiomi. */
    var haAssiomi = gs.sbloccati.assiomi;
    n.assiomi.classList.toggle("oculto", !haAssiomi);
    if (haAssiomi) {
      var libere = APERTURA_MAX - apertura;
      n.estendi.disabled = libere <= 0 || (gs.risorse.assiomi || 0) < 1;
      n.estendi.textContent = libere > 0 ? "Allarga il campo · 1 assioma" : "Campo al massimo";
      var fissata = meta.leggi[c.id];
      n.fissa.disabled = (gs.risorse.assiomi || 0) < COSTO_FISSA || fissata === v;
      n.fissa.textContent = fissata === v
        ? "Legge fissata a " + v
        : "Fissa la legge · " + COSTO_FISSA + " assiomi";
    }
  });

  /* orologio dell'universo */
  $("eta-valore").textContent = formattaEta(gs.eta);

  /* statistiche */
  if (gs.sbloccati.statistiche) {
    $("lista-statistiche").innerHTML =
      riga("Azioni manuali", fmt(gs.click)) +
      riga("Potenza del click", "×" + fmt(moltiplicatoreClick())) +
      riga("Moltiplicatore globale", "×" + (Math.round(moltiplicatoreGlobale() * 100) / 100)) +
      (meta.cu > 0 ? riga("Costanti Universali", fmt(meta.cu) + " (+" +
                          Math.round((bonusMeta() - 1) * 100) + "%)") : "") +
      (gs.cicatrici > 0 ? riga("Cicatrici", "−" + gs.cicatrici + "% produzione") : "") +
      riga("Età dell'universo", formattaEta(gs.eta));
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
      else $("trasferimento").classList.add("oculto");
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
   14. TEMA
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
    riga("Intelligenza totale", fmt(gs.totali.intelligenza)) +
    riga("Biomassa totale", fmt(gs.totali.biomassa)) +
    riga("Età raggiunta", formattaEta(gs.eta));
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
    if (typeof salvato.cicatrici !== "number") salvato.cicatrici = 0;
    if (!salvato.campo || typeof salvato.campo !== "object") salvato.campo = {};
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

/* Orologio dell'universo: giorni solo quando ce ne sono, così la riga resta
   corta all'inizio e continua a essere leggibile dopo settimane di partita. */
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
   18. AVVIO E GAME LOOP
============================================================================ */
function ricostruisciUI() {
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
           "Questo slot torna al vuoto: si perdono " + formattaEta(gs.eta) +
           " di universo, tutte le risorse e tutte le ricerche. Le Costanti " +
           "Universali restano. L'operazione non si può annullare.",
           "Azzera", function () {
             archivio.cancella(chiaveSalvataggio());
             nuovaPartita();
           });
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
