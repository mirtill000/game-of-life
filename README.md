# SINGULARITAS

Un gioco incrementale per browser sulla nascita e l'evoluzione dell'universo,
nello spirito di *Universal Paperclips*. Si parte dal vuoto quantistico con un
solo bottone e si arriva all'ascensione cosmica.

Nessuna dipendenza, nessuna build: tre file e un browser.

## Come si gioca

Scarica i tre file nella stessa cartella e apri `index.html`.

L'interfaccia nasce quasi vuota: c'è una risorsa e un'azione. Tutto il resto
— risorse, infrastrutture, ricerche, interi pannelli — compare solo quando il
gioco raggiunge la condizione che lo rende sensato.

Il ciclo è quello classico del genere: si raccoglie a mano, si comprano
strutture che raccolgono al posto tuo, si spendono risorse in ricerche che
moltiplicano la produzione. Il costo di ogni struttura cresce in modo
esponenziale, quindi comprare non basta: sono le ricerche a spostare davvero
l'ago.

## Le quattro ere

Ogni era è una catena in cui ogni anello consuma il precedente.

| Era | Risorse | Infrastrutture | Traguardo |
|---|---|---|---|
| Primordiale | Energia, Quark | Fluttuazione Quantistica, Attrattore di Quark | Sintesi dell'Idrogeno |
| Stellare | Idrogeno, Elio, Polvere Stellare | Nebulosa, Fornace Stellare, Supernova | Accensione della prima Galassia |
| della Vita | Acqua, Carbonio, Biomassa | Cometa Ghiacciata, Gigante Rossa, Brodo Primordiale, Replicatore Cellulare | Specie Senziente |
| della Civiltà | Intelligenza, Sfere di Dyson | Colonia Planetaria, Calcolatore Quantistico, Sfera di Dyson | Ascensione Cosmica |

I traguardi sono ricerche speciali: pagarli apre l'era successiva.

Poiché ogni anello consuma quello sotto, la partita non si vince comprando
sempre la struttura più avanzata. Serve una piramide — molte nebulose per
sostenere poche fornaci — e quando un'infrastruttura resta senza materia prima
rallenta in proporzione invece di fermarsi, dichiarandolo sulla propria scheda.

## Le costanti fondamentali

Dalla prima fase compaiono manopole regolabili con `−` e `+` che cambiano il
corso dell'evoluzione. Nessun valore è il migliore: ognuna sacrifica qualcosa.

| Costante | Alzandola | Abbassandola |
|---|---|---|
| Gravità (G) | Nebulose, Supernove e Giganti Rosse producono di più, ma consumano altrettanto di più | Ritmo lento e parsimonioso, le riserve durano |
| Elettromagnetismo (α) | Chimica e vita più efficienti | Fusione stellare più efficiente: più elio |
| Espansione (Λ) | Raccolta manuale molto più ricca | Produzione automatica più ricca |

La gravità regola il *ritmo* (quanto in fretta bruci ciò che hai), α sceglie
fra **stelle e vita**, Λ fra **gioco attivo e gioco inattivo**. Gli effetti
sono continui e immediati, quindi non conviene cambiarle di continuo: si
scelgono in base a come si sta giocando.

## Trascendenza

L'universo non è uno solo. Quando le civiltà accumulano abbastanza Intelligenza
compare la **Trascendenza**: ricominciare da un nuovo Big Bang azzera la
partita, ma lascia **Costanti Universali** permanenti che valgono +5% alla
produzione automatica e +2% alla raccolta manuale ciascuna.

Ci sono due modi di uscire da un universo: trascendere quando la crescita
rallenta, oppure arrivare fino all'**Ascensione Cosmica**, che vale il doppio
delle Costanti. Il guadagno cresce meno che proporzionalmente rispetto a quanto
si è prodotto, così una partita lunghissima non rende inutili tutte le seguenti.

## Eventi cosmici

Ogni due-quattro minuti il cosmo propone una scelta con due esiti diversi e
nessuno dei due sbagliato: catturare una nube molecolare adesso o lasciarla
collassare da sé, schermare i mondi da una supernova vicina o lasciar piovere i
metalli. Alcuni effetti sono immediati, altri sono moltiplicatori temporanei che
restano visibili nel pannello *Effetti in corso* finché durano. Se nessuno
sceglie entro il tempo mostrato, l'occasione svanisce.

## Costruire in blocco

Il selettore `×1 / ×10 / max` sopra le infrastrutture costruisce più unità in un
colpo solo. Il prezzo tiene conto della crescita esponenziale — è la somma di
una progressione geometrica — e `max` calcola quante se ne possono pagare
davvero con le risorse del momento.

Le ricerche **ripetibili** (Armonia Quantistica, Sinfonia Stellare, Pensiero
Profondo) non spariscono dopo l'acquisto: salgono di livello e costano cinque
volte tanto ogni volta, e sono il pozzo in cui riversare le risorse quando i
potenziamenti una tantum sono finiti.

## Leggere i colli di bottiglia

Ogni risorsa il cui flusso netto è negativo dichiara fra quanto si esaurirà
(*"si esaurisce fra 55 min"*). Poiché ogni anello consuma quello sotto, è così
che si capisce dove la piramide è troppo carica in alto, senza dover ispezionare
una scheda alla volta.

## Tema chiaro e scuro

Il pulsante *Tema chiaro / Tema scuro* in fondo alla pagina commuta la palette,
e la scelta viene ricordata. Il tema scuro resta il predefinito.

## I file

| File | Contenuto |
|---|---|
| `index.html` | Struttura della pagina; i pannelli non ancora raggiunti nascono nascosti |
| `style.css` | Tema scuro monospace, griglia a tre colonne, classe `.oculto` per la visibilità |
| `script.js` | Stato, game loop a 100 ms, acquisti, eventi, prestigio, logica di sblocco e costruzione della UI |

## Estendere il gioco

Tutto il contenuto sta in tre array in cima a `script.js`: `RISORSE`,
`GENERATORI` e `RICERCHE`. Ogni voce porta con sé la condizione che la rende
visibile, quindi aggiungere un'era significa aggiungere righe a quegli array,
senza toccare il game loop né il codice dell'interfaccia.

```js
{
  id: "nebulosa", fase: 2,
  nome: "Nebulosa",
  descrizione: "Immense nubi in cui i quark si legano in idrogeno.",
  costo: { quark: 300 }, crescita: 1.16,      // costo = costo × crescita^possedute
  produce: { idrogeno: 0.5 },                 // al secondo, per unità
  consuma: { quark: 1.5 },                    // al secondo, per unità
  cond: function (g) { return g.fase >= 2; }  // quando comparire
}
```

## Salvataggi

La partita si salva da sola ogni 15 secondi in `localStorage`, e il tempo
trascorso a pagina chiusa viene simulato al rientro (fino a 8 ore). Alcuni
browser vietano `localStorage` alle pagine aperte da `file://`: in quel caso il
gioco resta giocabile e lo segnala nel log, senza conservare i progressi.
