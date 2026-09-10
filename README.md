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

## Unità di misura

Le risorse astrofisiche si leggono nella loro unità naturale: idrogeno ed elio
in masse solari (M☉), la polvere stellare in masse solari, acqua e carbonio in
masse terrestri (M⊕), la biomassa in gigatonnellate. Accendere la prima
galassia costa così **6 miliardi di masse solari di elio**, che è l'ordine di
grandezza giusto per una galassia nana, invece di un implausibile «6k».

È solo un modo di leggere le quantità: internamente il gioco continua a
contare in unità di gioco, e il bilanciamento non cambia.

## Le azioni manuali

Restano utili per tutta la partita perché la loro resa è ancorata alla
produzione del momento: raccogliere a mano vale sempre almeno un paio di
secondi di quello che i generatori producono da soli. Ogni era ne aggiunge una
nuova — comprimere una nube, innescare una supernova, seminare un mondo,
ispirare una civiltà — così c'è sempre qualcosa da fare attivamente.

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
davvero con le risorse del momento. La scheda si aggiorna di conseguenza:
mostra il costo totale *e* la produzione e il consumo delle unità che si stanno
per costruire, non quelli di una sola.

Le ricerche **ripetibili** (Armonia Quantistica, Sinfonia Stellare, Pensiero
Profondo) non spariscono dopo l'acquisto: salgono di livello e costano cinque
volte tanto ogni volta, e sono il pozzo in cui riversare le risorse quando i
potenziamenti una tantum sono finiti.

## Leggere i colli di bottiglia

Ogni risorsa il cui flusso netto è negativo dichiara fra quanto si esaurirà
(*"si esaurisce fra 55 min"*). Poiché ogni anello consuma quello sotto, è così
che si capisce dove la piramide è troppo carica in alto, senza dover ispezionare
una scheda alla volta.

## Automazione

Con le Costanti Universali si assumono **manager**, uno per infrastruttura, che
la ricomprano da soli. Restano assunti in ogni universo futuro, quindi sono il
premio di lungo periodo del prestigio. Un manager compra solo quando la spesa
resta sotto un quarto della riserva: non prosciuga mai la risorsa che serve
agli anelli superiori.

## Bivi fra le ere

Ogni traguardo di fase apre una scelta fra due vie che si escludono: materia o
luce, stelle o mondi, carne o macchina. Vale per l'universo in corso, così due
partite si sviluppano in modo diverso anche a parità di partenza. Il bivio non
scade: resta aperto finché non decidi.

## Il grafico dei flussi

Accanto a ogni risorsa c'è una sparkline degli ultimi minuti: barre ancorate
alla linea dello zero, verdi sopra e arancioni sotto. Serve a vedere l'effetto
di una decisione — comprare, cambiare una costante, accettare un evento —
invece di doverlo intuire dal numero istantaneo.

## Slot e trasferimento

Tre slot indipendenti, e un pulsante *Esporta / importa* che produce un codice
testuale con la partita e le Costanti Universali. Serve a spostarsi fra browser
e da rete di sicurezza, visto quanto è fragile `localStorage` su `file://`.

## Telefono, tastiera e accessibilità

Su schermi stretti il gioco passa a una colonna con bersagli più grandi, e ogni
pannello si richiude dalla sua intestazione (lo stato viene ricordato). Da
tastiera: barra spaziatrice per l'azione principale, `1`/`2`/`3` per il
moltiplicatore, `t` per il tema. Il log è annunciato agli screen reader, le
sparkline hanno una descrizione testuale, e chi ha chiesto `prefers-reduced-motion`
vede la stessa scena ferma, aggiornata una volta al secondo.

## Tema chiaro e scuro

Il pulsante *Tema chiaro / Tema scuro* in fondo alla pagina commuta la palette,
e la scelta viene ricordata. Il tema scuro resta il predefinito.

## I file

| File | Contenuto |
|---|---|
| `index.html` | Struttura della pagina; i pannelli non ancora raggiunti nascono nascosti |
| `style.css` | Tema scuro monospace, griglia a tre colonne, classe `.oculto` per la visibilità |
| `script.js` | Stato, game loop a 100 ms, acquisti, eventi, prestigio, animazione dell'universo, logica di sblocco e costruzione della UI |

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
