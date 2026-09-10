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

## Le sette ere

Ogni era è una catena in cui ogni anello consuma il precedente.

| Era | Risorse | Infrastrutture | Traguardo |
|---|---|---|---|
| Primordiale | Energia, Quark | Fluttuazione Quantistica, Attrattore di Quark | Sintesi dell'Idrogeno |
| Stellare | Idrogeno, Elio, Polvere Stellare | Nebulosa, Fornace Stellare, Supernova | Accensione della prima Galassia |
| della Vita | Acqua, Carbonio, Biomassa | Cometa Ghiacciata, Gigante Rossa, Brodo Primordiale, Replicatore Cellulare | Specie Senziente |
| della Civiltà | Intelligenza, Sfere di Dyson | Colonia Planetaria, Calcolatore Quantistico, Sfera di Dyson | Egemonia Stellare |
| Galattica | Antimateria, Mondi Governati | Ascensore Stellare, Fabbrica di Antimateria, Flotta di Colonizzazione | Diaspora |
| Intergalattica | Materia Oscura, Energia del Vuoto, Galassie Raggiunte | Lente Gravitazionale, Pozzo di Vuoto, Ponte di Einstein-Rosen, Buco Nero Addomesticato | Il Gruppo Locale |
| della Legge | Informazione, Universi Simulati, Assiomi | Cervello di Matrioska, Simulatore di Universi, Forgia delle Costanti | Ascensione Cosmica |

I traguardi sono ricerche speciali: pagarli apre l'era successiva. Le tre ere
finali portano ciascuna un'idea nuova, non solo altre risorse: la **scorciatoia**,
il **decadimento**, e le **costanti che diventano moneta**.

### La scorciatoia (Era Galattica)

L'Ascensore Stellare prende energia e restituisce **idrogeno**: salta i quark e
rifornisce l'Era Stellare dall'alto. Chi arriva qui vede la vecchia piramide
riempirsi da sola e le Nebulose smettere di essere il collo di bottiglia.

Non è un anello chiuso, ed è una regola di progetto: **nessuna risorsa alimenta
sé stessa, nemmeno indirettamente**. Con moltiplicatori che arrivano a ×1000, un
ciclo con guadagno maggiore di uno produrrebbe crescita infinita e romperebbe
l'economia. È una scorciatoia, non un moto perpetuo.

### Il decadimento (Era Intergalattica)

L'**Energia del Vuoto** perde il 2% al secondo. Non si accumula: scorre. Per la
prima volta conta il flusso e non la riserva, e la sparkline diventa lo
strumento principale invece di un ornamento. Ne discende una regola di
bilanciamento: una risorsa che decade ha una scorta massima pari a
`produzione / decadimento`, quindi **non è mai il prezzo d'acquisto di niente** —
si spende solo come flusso, che è esattamente il suo mestiere.

Nella stessa era l'**Espansione si volta contro di te**: tutto ciò che attraversa
il vuoto rende meno quanto più Λ è alta, perché le galassie scappano prima che
tu le raggiunga. Fino a qui Λ alta era la scelta di chi gioca attivamente; da
qui è una decisione vera, e *Ancoraggio Cosmico* è la ricerca che la attutisce.

### Le costanti diventano moneta (Era della Legge)

Gli **Assiomi** si spendono sul pannello che usi dalla prima ora di gioco:

- **Allarga il campo** (1 assioma): una costante guadagna una tacca oltre i
  limiti che l'universo si era dato, fino a tre.
- **Fissa la legge** (3 assiomi): il valore attuale viene scritto nel prestigio,
  e **ogni universo futuro nascerà già con quella legge**. È l'unico lascito
  permanente che non sia una percentuale.

Gli Assiomi sono l'unica produzione del gioco che non passa dai moltiplicatori
globali: ne esce circa uno ogni tre ore per Forgia, e restano una cosa che si
conta a una a una mentre tutto il resto cresce di ordini di grandezza.

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

Non sei l'unico a poterle toccare: certi eventi cosmici piegano una costante
per un minuto o due. Quando accade la manopola lo dichiara — mostra
`5 → 7` e descrive l'effetto che vale *adesso* — e lo scostamento scade da sé
come qualunque altro effetto temporaneo.

## Unità di misura

Le risorse astrofisiche si leggono nella loro unità naturale: idrogeno ed elio
in masse solari (M☉), la polvere stellare in masse solari, acqua e carbonio in
masse terrestri (M⊕), la biomassa in gigatonnellate, l'antimateria in
tonnellate, la materia oscura in masse solari, l'informazione in qubit. Accendere la prima
galassia costa così **6 miliardi di masse solari di elio**, che è l'ordine di
grandezza giusto per una galassia nana, invece di un implausibile «6k».

È solo un modo di leggere le quantità: internamente il gioco continua a
contare in unità di gioco, e il bilanciamento non cambia.

## Le azioni manuali

Restano utili per tutta la partita perché la loro resa è ancorata alla
produzione del momento: raccogliere a mano vale sempre almeno un paio di
secondi di quello che i generatori producono da soli. Ogni era ne aggiunge una
nuova — comprimere una nube, innescare una supernova, seminare un mondo,
ispirare una civiltà, smontare una stella, aprire una fenditura nel vuoto,
dettare un postulato — così c'è sempre qualcosa da fare attivamente.

I potenziamenti del click non si limitano a moltiplicare la manciata iniziale,
che invecchierebbe in dieci minuti: l'*Oscillatore di Punto Zero* e il *Campo
di Higgs* allungano anche il tempo a cui ogni azione è ancorata (+1 e +2
secondi). Restano quindi pertinenti anche quando la produzione automatica è
cresciuta di ordini di grandezza.

## Buchi neri

Dal **secondo universo in poi** — il primo insegna, il secondo mette in gioco —
compaiono eventi che non tolgono risorse ma **smontano ciò che hai costruito**.
Un buco nero che si sveglia al centro delle nubi, due giganti che si fondono, un
vagabondo primordiale che attraversa i mondi colonizzati, un orizzonte che si
apre dentro una sala di calcolo.

Sono governati da sei regole, senza le quali sarebbero solo una tassa arbitraria:

1. **Si distrugge una frazione, mai una quantità fissa** — `−12% delle Nebulose`
   invecchia bene, `−5 Nebulose` è irrilevante a fine partita e devastante
   all'inizio.
2. **Mai l'ultima unità**: restare senza la capacità di ripartire è l'unico
   danno irrecuperabile.
3. **Chi paga non perde niente**: ogni evento ha sempre una difesa in risorse.
4. **La distruzione restituisce qualcosa**: la massa che cade dentro accende un
   disco di accrescimento. È una trasformazione, non un prelievo.
5. **Mai mentre non ci sei**: durante un'assenza gli effetti scadono ma nessuno
   agisce, e nessun evento viene proposto.
6. **Il costo esponenziale è un ammortizzatore**: perdere dodici Nebulose su
   cento fa scendere il prezzo della prossima da `base×1.16¹⁰⁰` a `base×1.16⁸⁸`.
   Ricostruire costa una frazione di quanto è costato arrivarci, e i manager lo
   fanno da soli.

Non sono tutti disastri. Il **Motore di Kerr** è un buco nero rotante e
tranquillo: puoi estrargli momento angolare per un ×2.5 di tre minuti, oppure
smontare un Ponte per costruirci sopra e guadagnare un +15% permanente. È
l'unico caso in cui distruggere è la mossa giusta. E il **Buco Nero
Addomesticato** chiude l'arco: ciò che nell'Era Stellare era una catastrofe, in
quella Intergalattica è la centrale più potente che tu abbia.

Un solo evento, in fondo all'ultima era, può lasciare una **cicatrice**: −1%
di produzione per sempre in questo universo, cumulabile e dichiarato fra le
statistiche. È la sola pressione del gioco a favore della trascendenza — un
universo troppo vecchio e troppo segnato conviene chiuderlo.

## Trascendenza

L'universo non è uno solo. Quando le civiltà accumulano abbastanza Intelligenza
compare la **Trascendenza**: ricominciare da un nuovo Big Bang azzera la
partita, ma lascia **Costanti Universali** permanenti.

Il loro bonus cresce con la *radice* del loro numero, non in proporzione: una
partita che arriva in fondo alle sette ere ne frutta migliaia, e un +5% lineare
per ciascuna renderebbe l'universo successivo una formalità di due minuti.
Intorno alle venti Costanti il bonus vale esattamente quanto valeva prima che le
tre ere finali esistessero; da lì in poi ogni Costante vale un po' meno della
precedente. Quanto vale un universo lo decidono tutte le ere insieme, ciascuna
pesata perché un'unità di un'era tarda conti quanto migliaia di una precedente.

Ci sono due modi di uscire da un universo: trascendere quando la crescita
rallenta, oppure arrivare fino all'**Ascensione Cosmica**, che vale il doppio
delle Costanti. Entrambi chiudono la partita in corso, quindi entrambi passano
dalla finestra di conferma: quella dell'Ascensione dice quanta storia ha questo
universo e quante Costanti porteresti via, e rinunciare non costa nulla — non
si paga la ricerca e si torna esattamente all'universo di prima, con
l'Ascensione ancora lì da comprare quando vorrai. Il guadagno cresce meno che proporzionalmente rispetto a quanto
si è prodotto, così una partita lunghissima non rende inutili tutte le seguenti.

## Eventi cosmici

Ogni due-quattro minuti il cosmo propone una scelta con due esiti diversi e
nessuno dei due sbagliato: catturare una nube molecolare adesso o lasciarla
collassare da sé, schermare i mondi da una supernova vicina o lasciar piovere i
metalli. Alcuni effetti sono immediati, altri sono moltiplicatori temporanei che
restano visibili nel pannello *Effetti in corso* finché durano. Se nessuno
sceglie entro il tempo mostrato, l'occasione svanisce.

Non sono tutti occasioni. Alcuni sono **minacce** — una supernova vicina, una
nube oscura in rotta sulle fornaci, un errore che si replica meglio delle
molecole giuste — e con quelle non decidere non è un modo per uscirne: allo
scadere del tempo accade comunque l'esito predefinito, quello che sarebbe
successo lasciando fare alla natura. Il pannello lo dice in anticipo, il titolo
è rosso invece che dorato e il conto alla rovescia recita *«Se non decidi,
decide l'universo»*. Le occasioni, invece, svaniscono e basta.

Una minaccia può lasciare un effetto **avverso** — Fornaci a metà, Replicatori
al 40% — che compare in *Effetti in corso* come gli altri, ma in rosso. Pensiero
Profondo allunga gli effetti temporanei: allungherebbe anche i guai, e sarebbe
una beffa, quindi le penalità durano quello che devono.

Gli eventi non vivono in un angolo per conto proprio: parlano con gli altri
sistemi del gioco. Un'onda gravitazionale sposta la **Gravità** di due tacche
per novanta secondi, un'anomalia di struttura fine sposta **α**, e l'eco di un
universo precedente — che compare solo se ne hai già vissuto uno — si può
cristallizzare in una **Costante Universale** permanente invece che in un
moltiplicatore. Nell'altro verso, la violenza di una supernova vicina dipende
dalla gravità che hai scelto: in un cosmo che stringe forte l'esplosione costa
il doppio, e rende il doppio in metalli.

## Costruire in blocco

Il selettore `×1 / ×10 / max` sopra le infrastrutture costruisce più unità in un
colpo solo. Il prezzo tiene conto della crescita esponenziale — è la somma di
una progressione geometrica — e `max` calcola quante se ne possono pagare
davvero con le risorse del momento. La scheda si aggiorna di conseguenza:
mostra il costo totale *e* la produzione e il consumo delle unità che si stanno
per costruire, non quelli di una sola.

Le ricerche **ripetibili** non spariscono dopo l'acquisto: salgono di livello e
costano cinque volte tanto ogni volta. Sono il pozzo in cui riversare le
risorse quando i potenziamenti una tantum sono finiti, e ognuna fa un mestiere
diverso, così scegliere quale alimentare è una decisione e non un'abitudine:

| Ripetibile | Ogni livello |
|---|---|
| Armonia Quantistica | −8% su ciò che ogni infrastruttura **consuma**: allarga la base della piramide senza costruire nulla |
| Sinfonia Stellare | ×1.35 sulla resa di ciò che **collassa o brucia** (Nebulose, Fornaci, Supernove, Giganti Rosse), non sulla vita |
| Pensiero Profondo | −10% sull'attesa fra gli **eventi** e +20% sulla durata dei loro effetti |
| Economia Stellare | −10% sull'energia che consumano ascensori, fabbriche e calcolatori |
| Ancoraggio Cosmico | −15% sull'ostilità dell'Espansione verso ciò che attraversa il vuoto |
| Metamatematica | ×1.6 su tutto ciò che l'Era della Legge produce |

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

## L'età dell'universo

In alto a destra un orologio conta da quanto vive questo universo. Non è
l'ora di parete: conta il tempo **simulato**, quindi include il recupero di
un'assenza (fino al tetto di otto ore) e non i giorni in cui la pagina è
rimasta chiusa. Trascendere lo azzera, perché l'universo che comincia è un
altro.

## Quanto dura una partita

Misurato, non stimato: una simulazione automatica gioca la partita con la
prudenza di un manager (non spende mai più di un quarto della riserva) e riporta
quando arriva a ogni era.

| | Primo universo, senza nulla | Secondo universo, con 2000 CU e i manager |
|---|---|---|
| Era Stellare | 6 min | subito |
| Era della Vita | 1 h | 6 min |
| Era della Civiltà | 8.6 h | 30 min |
| Era Galattica | 18.2 h | 1.3 h |
| Era Intergalattica | 22.4 h | 1.7 h |
| Era della Legge | 33.5 h | 2.6 h |
| Ascensione | 56 h | 6.6 h |

È il caso peggiore: nessun manager, nessuna Costante, nessun evento colto al
volo. Il senso del prestigio è tutto in quella seconda colonna.

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

Il pulsante *Tema chiaro / Tema scuro* sta in alto a destra, accanto
all'orologio, e commuta la palette; la scelta viene ricordata (o si preme `t`).
Il tema scuro resta il predefinito.

## Quando qualcosa non si può disfare

*Azzera*, *Trascendi* e l'*Ascensione Cosmica* passano da una finestra di conferma che dice cosa si sta
per perdere — quanto universo, quali risorse, cosa invece sopravvive. Non è il
`confirm()` del browser: dopo il primo dialogo alcune finestre offrono di
sopprimere i successivi, e una conferma che a volte non compare è peggio di
nessuna conferma. Il fuoco parte da *Annulla*, così un Invio distratto non
cancella una partita, e `Esc` chiude senza fare nulla.

## I file

| File | Contenuto |
|---|---|
| `index.html` | Struttura della pagina; i pannelli non ancora raggiunti nascono nascosti, e in fondo vivono le finestre modali (trasferimento, conferma, finale) |
| `style.css` | Tema scuro monospace, griglia a tre colonne, classe `.oculto` per la visibilità |
| `script.js` | Stato, game loop a 100 ms, acquisti, eventi, prestigio, animazione dell'universo, logica di sblocco e costruzione della UI; diviso in sezioni numerate che seguono il flusso, dal contenuto all'avvio |

## Estendere il gioco

Tutto il contenuto sta in sette array in cima a `script.js`: `RISORSE`,
`AZIONI`, `GENERATORI`, `RICERCHE`, `COSTANTI`, `EVENTI` e `BIVI`. Ogni voce porta con sé la condizione che la rende
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

## Il tempo scorre anche se non guardi

Il gioco non conta i tick del timer, conta l'orologio. È una distinzione che
sembra pedante finché non si riduce il browser a icona: una scheda in secondo
piano viene rallentata fino a un risveglio al minuto, e spesso congelata del
tutto. Un gioco che simulasse «un centesimo di secondo per ogni giro» si
fermerebbe insieme al timer.

Qui invece a ogni giro si guarda quanto tempo è passato *davvero* e lo si
percorre tutto, spezzato in passi abbastanza corti da non falsare la catena —
dove ogni anello consuma quello sotto, un passo troppo lungo regalerebbe
produzione a chi sarebbe rimasto senza materia prima. Il risultato è che
l'universo avanza allo stesso modo che la scheda sia davanti agli occhi,
sepolta sotto altre dieci o ridotta a icona, e al ritorno il log dice quanto è
passato.

Tre dettagli che rendono la cosa onesta:

- **Il rientro non aspetta il timer.** Tornare sulla scheda recupera all'istante,
  senza il ritardo del primo risveglio.
- **Gli eventi aspettano te.** Durante un'assenza scorrono la produzione, i
  manager e gli effetti già in corso, ma nessun evento viene proposto e fatto
  scadere senza che tu possa scegliere: l'occasione resta lì per il ritorno.
- **Nascondere la scheda salva.** Un browser può buttare via una pagina in
  secondo piano senza preavviso: si salva all'istante, così il tempo passato
  viene ricostruito dal salvataggio invece che perso.

Il recupero è tagliato a otto ore, come quello a pagina chiusa, e i passi di un
recupero lungo sono più grossolani: semmai rende un po' meno del dovuto, mai di
più.

## Salvataggi

La partita si salva da sola ogni 15 secondi in `localStorage`, quando la scheda
finisce in secondo piano e alla chiusura. Il tempo trascorso a pagina chiusa
viene simulato al rientro (fino a 8 ore) dalla stessa funzione che recupera una
scheda nascosta: un'assenza è un'assenza. Durante quella simulazione gli effetti
temporanei scadono come farebbero a pagina aperta: un moltiplicatore da un
minuto vale un minuto, non otto ore. Alcuni
browser vietano `localStorage` alle pagine aperte da `file://`: in quel caso il
gioco resta giocabile e lo segnala nel log, senza conservare i progressi.
