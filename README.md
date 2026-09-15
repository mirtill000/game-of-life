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

## Cosa fare adesso

Sotto l'intestazione c'è l'unica riga sempre presente: dice cosa fare e quanto
manca. Nei primi minuti insegna — *«Premi Raccogli Energia Quantistica»*, poi
*«Arriva a 40 Energia»*, poi *«Costruisci una Fluttuazione»* — e dalla seconda
era in poi misura la distanza dal traguardo che apre l'era successiva,
requisiti compresi (*«manca 12 Sfere di Dyson»*). La barra diventa dorata quando
puoi pagarlo.

Prima il gioco apriva con un bottone e due righe di poesia, senza dire cosa ci
si aspettasse da te, e il traguardo di fase era una scheda qualsiasi in fondo a
una colonna: non c'era modo di sapere a che punto fossi.

## Ogni sistema si presenta

Quando un pannello compare per la prima volta lo dichiara: si apre con la sua
animazione, e il log dice **a cosa serve**, non solo che esiste. Vale per tutti
allo stesso modo — prima metà dei sistemi si presentava e metà appariva di
nascosto, il che li faceva sembrare pezzi di applicazioni diverse.

## Il Codex Cosmico

Ogni cosa che incontri — una risorsa, un'infrastruttura, una costante, un evento
— apre una voce di enciclopedia con l'astrofisica vera che le sta dietro: perché
il vuoto non è vuoto, perché nessuno ha mai visto un quark da solo, cosa fece
davvero Hoyle nel 1953, quanto è efficiente un buco nero rispetto alla fusione.
Trentacinque voci, raggruppate per era, che si aprono da sole andando avanti;
il pulsante in fondo alla pagina conta quelle non ancora lette.

Non dà bonus e non chiede niente: è il posto dove il gioco spiega perché le cose
che ti fa fare somigliano a come funziona l'universo.

### Il Codex non è più un'isola

Trentacinque voci stavano dietro un solo bottone in fondo alla pagina: chi
giocava non aveva modo di sapere che di quella cosa lì — quella risorsa, quella
infrastruttura, quella costante — esistesse una voce. Erano due app affiancate.

Adesso ogni scheda il cui argomento ha una voce **già scoperta** porta un `?`
discreto accanto al nome, e aprirlo apre il Codex **su quella voce**, non in
cima. Già scoperta e non esistente: il segno non annuncia quello che non hai
ancora incontrato. Quando la voce è nuova, il segno porta lo stesso pallino che
il Codex usa dentro di sé.

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

### La centrale che mancava

Nell'Era della Civiltà la **Sfera di Dyson** smette di essere solo un bonus:
avvolgendo una stella intera ne raccoglie tutta la luce, e produce energia in
quantità che nessuna Fluttuazione Quantistica avvicina. Serve a questo — dalla
quinta era in poi ascensori, fabbriche e cervelli bruciano decine di unità di
energia ciascuno, e senza una centrale di mezzo fra l'increspatura del vuoto da
1/s e loro, le ere galattiche resterebbero letteralmente senza corrente.

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

### La legge di conservazione

Un'infrastruttura che produce di più consuma di più: il moltiplicatore
**globale** — il prestigio, le Sfere di Dyson, le ricerche che aumentano «ogni
produzione» — vale sia sulla resa sia sul consumo. Un universo che gira mille
volte più in fretta produce mille volte tanto a ogni anello e ne brucia
altrettanto: i rapporti della piramide restano quelli, e la risorsa in cima —
che nessuno consuma — accumula comunque mille volte più in fretta.

I moltiplicatori **mirati** sono l'eccezione, e per questo sono interessanti:
una ricerca che raddoppia un generatore, un bonus di gruppo, un effetto
temporaneo agiscono sulla sola produzione. Quelli sono guadagni di *efficienza*
— il doppio a parità di materia prima — ed è esattamente ciò che promettono le
loro descrizioni.

Senza questa distinzione la catena è un ornamento: una Nebulosa arrivava a
produrre un milione di idrogeno al secondo bruciando due quark, e non esisteva
più alcuna piramide da costruire.

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

## La stabilità dell'universo

I compromessi si possono aggirare. Portare Λ al minimo e la Gravità al massimo
alza **insieme** il moltiplicatore globale, la fusione, il ritmo del collasso e
la resa delle Sfere di Dyson (+32% ciascuno), e in cambio sacrifica solo la
vita, le fluttuazioni e la raccolta a mano — tre cose che a fine partita non
contano più. Non era una scelta: era un angolo dominante.

La risposta non è spostare i numeri, perché qualunque altro numero sposterebbe
soltanto l'angolo. È far pagare **l'estremità in sé**. Sotto le manopole c'è ora
una barra: quanto l'universo regge le leggi che gli hai dato.

| Stato | Cosa comporta |
|---|---|
| **stabile** (≥75%) | niente |
| **incrinato** | gli eventi si infittiscono |
| **instabile** | la produzione cala, e ciò che arriva è sempre più spesso una minaccia |
| **critico** (<25%) | −30% alla produzione, eventi 2.5 volte più fitti, e ogni tanto lo spaziotempo **si lacera** e porta via qualcosa che hai costruito |

La stabilità *insegue* la configurazione invece di saltarci sopra: spingere una
costante all'estremo per un minuto e riportarla indietro non costa nulla — è
viverci che costa. E come per i buchi neri, nulla si lacera mentre non ci sei:
durante un'assenza l'universo si destabilizza davvero, ma aspetta il tuo ritorno
per presentare il conto.

Misurato: con le costanti all'estremo il gioco arriva all'Era Galattica **prima**
(20.6 h contro 23.3), all'Era della Civiltà **dopo** (9.7 contro 8.9), e alla
successiva non ci arriva affatto, perché le lacerazioni continuano a mangiare la
piramide. È tornato a essere un compromesso.

La gravità regola il *ritmo* (quanto in fretta bruci ciò che hai), α sceglie
fra **stelle e vita**, Λ fra **gioco attivo e gioco inattivo**. Gli effetti
sono continui e immediati, quindi non conviene cambiarle di continuo: si
scelgono in base a come si sta giocando.

Non sei l'unico a poterle toccare: certi eventi cosmici piegano una costante
per un minuto o due. Quando accade la manopola lo dichiara — mostra
`5 → 7` e descrive l'effetto che vale *adesso* — e lo scostamento scade da sé
come qualunque altro effetto temporaneo.

### Lo sfondamento

Uno scostamento da evento non è un'impostazione: è un fatto fisico, e non ha
motivo di rispettare i limiti della manopola. Con α già a 9, un `+2` porta a
**11 per due minuti**, oltre ciò che puoi scegliere: la manopola segna
`9 → 11` con il numero acceso, e le formule — lineari nel valore — si estendono
da sole.

Serviva perché prima quella scelta era **letteralmente inerte**: il gioco
sommava il `+2`, lo tagliava al massimo, e per due minuti dichiarava in
*Effetti in corso* un effetto che non esisteva. Ora fuori dal quadrante la
tensione pesa **il doppio**, quindi il caso «sono già al massimo» smette di
essere quello morto e diventa quello più interessante, con un prezzo attaccato:
una sola costante spinta a 11 porta la stabilità a puntare al 33%.

Oltre tre tacche non si va. Lì la spinta si dissipa davvero — e il gioco lo
dice, invece di fingere.

## Unità di misura

Le risorse continue si leggono nella loro unità naturale — masse solari (M☉),
masse terrestri (M⊕), gigatonnellate, tonnellate, qubit — e **tutte con lo
stesso fattore di lettura**. È la parte che conta: se ogni risorsa avesse la
sua scala, due anelli vicini della stessa catena finirebbero a ordini di
grandezza di distanza — 840 quark accanto a 416 milioni di masse solari di
idrogeno — e la colonna diventerebbe illeggibile proprio dove serve
confrontare. Con un fattore unico i rapporti mostrati sono quelli veri, e
restano grandezze cosmiche.

Le cose che si contano una a una — Sfere di Dyson, Mondi Governati, Galassie
Raggiunte, Universi Simulati, Assiomi — non vengono scalate: dodici Sfere sono
dodici.

È solo un modo di leggere le quantità: internamente il gioco continua a contare
in unità di gioco, e il bilanciamento non cambia.

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

### Le conseguenze

Certe scelte non finiscono quando le fai. Schermare i mondi da una supernova
tiene fuori anche i metalli che l'esplosione stava regalando, e **un quarto
d'ora dopo** quella nube ripassa: la si va a prendere pagando, o la si lascia
andare. Lasciar bruciare le atmosfere le fa tornare più ricche di prima.
Lasciar mangiare un buco nero lo fa crescere, e prima o poi si ripresenta.
Cristallizzare l'eco di un universo precedente in una legge significa che
qualcosa, da prima del tuo Big Bang, verrà a chiedere indietro.

Sono sei, e non capitano mai a caso: hanno la condizione sempre falsa, quindi il
sorteggio non può pescarle — le chiama soltanto la coda lasciata da una scelta.
Il pannello dichiara di chi sono figlie (*«Conseguenza di: Supernova vicina»*) e
il log le distingue da un evento qualunque, altrimenti sarebbero solo altri
eventi e la catena non si vedrebbe. La coda vive nel salvataggio: una
conseguenza attraversa una ricarica e un'assenza.

Gli eventi non vivono in un angolo per conto proprio: parlano con gli altri
sistemi del gioco. Un'onda gravitazionale sposta la **Gravità** di due tacche
per novanta secondi, un'anomalia di struttura fine sposta **α**, e l'eco di un
universo precedente — che compare solo se ne hai già vissuto uno — si può
cristallizzare in una **Costante Universale** permanente invece che in un
moltiplicatore. Nell'altro verso, la violenza di una supernova vicina dipende
dalla gravità che hai scelto: in un cosmo che stringe forte l'esplosione costa
il doppio, e rende il doppio in metalli.

## Dove stanno le cose

Lo schermo ha tre colonne: a sinistra quello che **hai** (risorse, azioni,
costanti, statistiche), al centro quello che **guardi e costruisci**, a destra
quello che **scegli e leggi** (ricerche, bivi, eventi, log). *Il tuo universo*
apre la colonna centrale: è il riquadro che racconta a che punto sei, e stava
in fondo a tutte le infrastrutture — dopo qualche ora bisognava scorrere una
dozzina di schede per vederlo.

Sotto i 1000 pixel le tre colonne si sciolgono e i pannelli si rimettono in fila
in un ordine che ha senso in verticale, non impilando una colonna dopo l'altra:
prima quello che chiede una decisione (un evento, un bivio), poi quello che si
guarda (risorse, azioni, universo), poi quello che si tocca (infrastrutture,
ricerche), e in fondo quello che si consulta (costanti, trascendenza,
statistiche, log).

## Le infrastrutture si dividono per era

Alla quarta era la colonna delle infrastrutture arriva a una dozzina di schede,
e le uniche che si toccano davvero — le ultime arrivate — stavano in fondo a
tutte le altre. Adesso ogni era è un **gruppo**: l'era in corso sta in cima e
aperta, le precedenti si richiudono da sole in una riga sola.

Una riga richiusa non è muta: dice quante opere ci sono in quell'era, e se lì
dentro qualcosa è rimasto a corto di materia prima lo dichiara — con la stessa
parola delle schede, «insufficienti», e solo quando il gruppo è chiuso, perché a
gruppo aperto lo dicono già le schede. Richiudere un'era non può nascondere un
guaio.

Un click sulla testata apre o chiude un gruppo, e da quel momento vale la tua
scelta e non più la regola: un'era che hai voluto aperta resta aperta anche
quando ne comincia una nuova, e resta aperta dopo un ricaricamento.

## Le imprese

Gli obiettivi in cima guidano la prima era e non danno niente: dalla seconda in
poi restava solo il traguardo, cioè **una cosa sola da fare per ore**. Adesso
ogni era ha **tre imprese**, ciascuna con un premio vero, da inseguire mentre il
traguardo matura.

Si riscuotono **da sole**, appena la quota arriva a uno: un premio che aspetta un
click è un'altra cosa da ricordarsi, e il gioco ne ha già abbastanza.

I premi sono una spinta, non un'economia nuova — un moltiplicatore temporaneo su
una infrastruttura, una riserva della risorsa dell'era, o Costanti Universali in
più al momento di chiudere. Quelle promesse si sommano **dopo** l'esponente del
prestigio: sotto, la radice le schiaccerebbe fino a renderle invisibili.

Una parola sua: *impresa* non è *obiettivo* (la barra in alto) né *traguardo* (la
ricerca che apre l'era). Tre cose diverse, tre nomi.

## La coda d'acquisto

Fra «gioco attivo» e «gioco lasciato aperto» c'era solo l'automazione, che costa
Costanti e ricompra sempre la stessa cosa. La coda è il passo in mezzo: segni
fino a cinque cose e il gioco le compra **appena sono pagabili, nel tuo ordine**.

Non aggira nessun costo: aspetta, esattamente come faresti tu. E **la testa non
si scavalca** — se la prima non è pagabile, aspetta lei, anche quando la seconda
lo sarebbe: altrimenti l'ordine non conterebbe niente.

La quantità si fissa quando accodi, non quando si compra: mettere in coda «×10
Nebulose» e ritrovarsene una perché nel frattempo hai toccato il selettore
sarebbe una sorpresa. I **traguardi non si accodano**: un'era non si passa alle
spalle di nessuno.

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

Sotto il nome dell'era, l'orologio non conta le ore che hai giocato: conta gli
**anni che il cosmo ha vissuto**. Ogni era ha il suo intervallo, preso dalla
cronologia vera — i microsecondi dell'era primordiale, la ricombinazione a
380 000 anni, la vita a **3.4 miliardi**, oggi a 13.8 — e dentro l'era il tempo
scorre in scala geometrica, così l'ordine di grandezza cambia con continuità
invece che a scatti.

| Era | L'orologio segna |
|---|---|
| Primordiale | da 32 microsecondi a 380 mila anni |
| Stellare | da 380 mila anni a 3.4 miliardi |
| della Vita | da 3.4 a 9 miliardi |
| della Civiltà | da 9 a 13.8 miliardi — il presente |
| Galattica | fino a 100 miliardi |
| Intergalattica | fino a 10 mila miliardi |
| della Legge | oltre ogni scala osservabile |

Il tempo di gioco vero resta nelle statistiche, accanto all'età: sono due cose
diverse e il pannello le tiene distinte.

## Quanto dura una partita

Misurato, non stimato: una simulazione automatica gioca la partita con la
prudenza di un manager (non spende mai più di un quarto della riserva) e riporta
quando arriva a ogni era.

| | Primo universo, senza nulla | Secondo universo, con 2000 CU e i manager |
|---|---|---|
| Era Stellare | 6 min | subito |
| Era della Vita | 1 h | 6 min |
| Era della Civiltà | 8.9 h | 48 min |
| Era Galattica | 23.3 h | 2.0 h |
| Era Intergalattica | 28.2 h | 2.5 h |
| Era della Legge | 38.3 h | 3.8 h |
| Ascensione | 68 h | 11 h |

È il caso peggiore: nessun manager, nessuna Costante, nessun evento colto al
volo. Il senso del prestigio è tutto in quella seconda colonna.

## Come sto andando

Il pannello *Statistiche* risponde a una domanda, non è più un elenco di numeri
messi lì per accumulo. Le prime tre righe sono la produzione netta dell'era, il
**collo di bottiglia** attuale (quale infrastruttura sta lavorando peggio, e a
che percentuale) e il **tempo stimato al traguardo** a questo ritmo. Sotto una
linea, le curiosità: età, tempo di gioco, moltiplicatori, Costanti, cicatrici.

## Due orologi, e non si confondono

Il tempo si dice in **un modo solo, in tre registri dichiarati**: `breve` per le
barre e le schede (`2 h`), `orologio` per i contatori che scorrono
(`2 g 04:13:07`), `disteso` per la prosa del libro e del log (`2 ore e 13
minuti`). Prima erano tre funzioni nate in tre momenti, che potevano comparire
nello stesso schermo dicendo la stessa cosa in tre lingue.


Sullo schermo convivono due scale di tempo. Quella del **cosmo** — miliardi di
anni dal Big Bang — è sempre in colore d'accento. Quella **tua** — i secondi che
restano a un evento, le ore prima che una riserva si esaurisca, il tempo che hai
giocato — è sempre tenue e a cifre di larghezza fissa, perché scorre. Prima
avevano la stessa tipografia e si leggevano come se fossero la stessa cosa.

## Il codice dei lampi, e il log che lo parla

La tela lampeggia in quattro colori soltanto, e ognuno significa una cosa sola:
**verde** è arrivato qualcosa, **ambra** hai costruito o studiato, **rosso** hai
perso qualcosa, **azzurro** si è aperto un sistema.

**Il log usa gli stessi quattro nomi**, così un colore là significa la stessa
cosa qui. Prima erano sei registri scoordinati: diciassette righe su quaranta
erano oro — cioè quasi metà del log gridava «è raro» — e sette non passavano
alcun registro, finendo in grigio per distrazione. Adesso il quinto registro,
**neutro**, esiste ed è la voce narrante: si sceglie, non si dimentica.

Le poche righe che dividono la partita in ere sono **capitoli**: stesso registro
e stesso colore di ogni altra apertura, ma rientrate e segnate da un filo. La
gerarchia si fa con il rilievo, non con un quinto colore.

Una riga che si ripete non si accumula più: trascinare una manopola scriveva una
riga per scatto, perché l'anti-spam era stato scritto passando due argomenti a
una funzione che ne accettava due — e i due in più cadevano nel vuoto.


La tela racconta anche gli eventi: finché una decisione è in sospeso, in alto a
destra pulsa un anello — dorato per un'occasione, rosso per una minaccia — così
non è possibile non accorgersene guardando l'universo invece del pannello.

## Sette ere, sette quadri

Il riquadro *Il tuo universo* non è una scena sola che si arricchisce: è
**sette quadri diversi**, uno per era, e quello in corso si sostituisce agli
altri quando l'era cambia. Tutti sono disegnati con lo stesso vocabolario —
fondo nero, tratti da un pixel, cerchi vuoti, punti, e tre colori soltanto:
bianco-azzurro per ciò che brilla, ambra per ciò che brucia, viola tenue per
ciò che è diffuso — quindi si riconoscono come lo stesso universo, non come
sette illustrazioni prese altrove.

| Era | Cosa vedi | Cosa conta davvero |
|---|---|---|
| 1 Primordiale | una singolarità e il getto di particelle che ne esce, dentro una nube diffusa | il getto si infittisce con le Fluttuazioni, i grumi sospesi sono gli Attrattori |
| 2 Stellare | nebulose, una stella con i suoi pianeti in orbita, una galassia in fondo | la stella cresce con le Fornaci, le orbite con le Nebulose, la galassia compare con la sua ricerca |
| 3 della Vita | il sole, le comete che portano l'acqua, il mondo con le sue lune | le comete contano l'Acqua arrivata, le lune le Colonie, il pianeta legge tutto il resto |
| 4 della Civiltà | una stella dentro l'impalcatura che la sta chiudendo, orbite di infrastruttura, il mondo di partenza | l'impalcatura si chiude con le Sfere di Dyson, i fasci verso il pianeta contano l'Intelligenza |
| 5 Galattica | una spirale inclinata e il fascio che smonta una stella per portarsela via | la spirale cresce con i Mondi e l'Antimateria, il fascio si accende con gli Ascensori Stellari |
| 6 Intergalattica | ammassi cuciti dai filamenti, e al centro il buco nero | i nodi contano le Galassie raggiunte, i filamenti la Materia Oscura, l'anello si infiamma quando un quasar è acceso |
| 7 della Legge | i gusci del cervello di Matrioska, il reticolo simulato, la stella della forgia | i gusci contano i Matrioska, i cubi gli Universi Simulati, i lampi gli Assiomi |

Nessuno dei sette è mai fermo, nemmeno a universo appena nato: quando non c'è
ancora niente da mostrare, la scena mostra il poco che c'è. Chi ha chiesto meno
movimento vede lo stesso quadro, fermo e aggiornato una volta al secondo.

In alto a sinistra, sempre nello stesso punto, il **cartiglio dell'era**: un
numero in un cerchio e il nome spaziato. È l'unica cosa scritta che non si
sposta mai, così si sa dove guardare per sapere dove si è.

La tela viene disegnata al doppio della densità e ridotta a schermo: i tratti da
un pixel di questi quadri non sopportano di essere sfocati quando il riquadro
viene ingrandito.

### Il pianeta

Nell'Era della Vita e in quella della Civiltà il quadro contiene un mondo vero
che gira. Non è un'illustrazione fissa: ogni strato legge una risorsa, quindi il
pianeta racconta la partita mentre succede.

| Cosa vedi | Da dove viene |
|---|---|
| Oceani e atmosfera azzurra | l'Acqua |
| Continenti, da bruno a verde | il Carbonio e la Biomassa |
| Calotte polari | l'Acqua |
| Luci sul lato notturno | l'Intelligenza |
| Punti in orbita | Colonie e Sfere di Dyson |

### Le didascalie

In basso, una riga dice cosa sta succedendo là dentro — *«Il vuoto non è vuoto:
ribolle, e non ha ancora prodotto niente»*, *«Quattro protoni diventano un elio,
e lo 0.7% diventa luce»*, *«Nei fondali qualcosa ha cominciato a copiarsi»*,
*«Sopra le loro teste, la stella viene smontata»* — alternando fra le frasi vere
in quel momento. Ogni era ha le sue, e almeno una è sempre vera, così la riga
non si blocca mai su una frase sola.

Se una frase smette di essere vera cambia subito, senza aspettare il turno: dire
«roccia e acqua, nient'altro» mentre i continenti sono già verdi sarebbe peggio
che non dire niente.

La stessa frase, preceduta dal nome dell'era, è la descrizione accessibile del
riquadro: la tela è muta per chi non la vede, e senza di essa un terzo di quello
che il gioco racconta non arriverebbe a chi usa uno schermo letto.

## Il passaggio d'era

È l'evento più importante del gioco, e passava come una riga di log fra le
altre: cambiavano il cartiglio, la nota, il quadro, le risorse in colonna — ma
non c'era **un momento**. Tutto il resto ha una cerimonia (l'accordo degli
armonici, il libro, il finale) tranne la cosa che le ere le separa.

Adesso dura tre secondi, non interrompibili ma nemmeno bloccanti — il gioco
continua a girare sotto. Un velo che si apre sul quadro nuovo, il nome dell'era
che **si scrive** lettera per lettera, e una riga che dice cosa è appena
diventato possibile. Chi ha chiesto meno movimento non la vede, e chi ricarica
una partita avanzata non se la vede annunciare.

## La cronologia degli universi

Il libro racconta *un* universo; niente raccontava la serie. Il prestigio restava
un numero che sale — quante Costanti hai — senza che si vedesse mai se stai
migliorando, dove ti fermi di solito, o quale via ti porti dietro ogni volta.

Ogni universo che finisce lascia una riga: fin dove è arrivato, quanto è durato,
le vie prese ai bivi, le cicatrici e le lacerazioni, e quante Costanti ha reso.
Si apre dal pulsante **Cronologia** nel pannello della Trascendenza, ed elenca
dal più recente. Due segni: **azzurro** per chi è arrivato in fondo, **ambra**
per il più ricco che tu abbia mai fatto.

Si ferma a quaranta universi — una serie lunga non deve far crescere il
salvataggio senza fine — e annotare è la stessa cosa che salvare: un universo
registrato e non scritto su disco è un universo perso.

## Il libro dell'universo

Quando un universo finisce — trascendendo o ascendendo — non resta una
schermata di numeri, ma delle pagine scritte dai fatti veri di quella partita:
quanto è vissuto, le vie prese ai bivi, le leggi in cui ha abitato, quante
volte hai deciso e quante volte hai lasciato decidere all'universo, le
lacerazioni con il loro conto in infrastrutture, le cicatrici, e le leggi che
lascia scritte per chi verrà dopo.

Non è un riepilogo con i numeri sostituiti: un universo che non ha mai toccato
le proprie costanti legge *«è cresciuto esattamente al ritmo che le sue leggi
permettevano»*, uno spinto agli estremi *«ha prodotto più in fretta, e ha tenuto
peggio»*. E non inventa: ciò che non è successo non compare.

## Il suono

Tutto sintetizzato sul momento — nessun file, i tre file restano tre — e diviso
in tre strati, ognuno dei quali risponde a una domanda diversa.

**I segnali** dicono cos'è appena successo: quattro bip sugli stessi nomi dei
lampi, così chi impara il colore impara anche il suono.

**La chiamata** dice che il gioco sta aspettando *te*. Un accordo maggiore che
sale, morbido, sotto un filtro che gli toglie il vetro. Suona per le tre cose
per cui il gioco è davvero fermo in attesa — un evento da decidere, un bivio
aperto, un traguardo che puoi pagare — e suona **sul fronte, una volta sola**:
un avviso che si ripete smette di essere un avviso e diventa la ragione per cui
si spegne l'audio. L'unica eccezione è un evento che sta per scadere, che merita
un secondo richiamo più breve, perché è l'unica richiesta che si perde da sé.

**Gli armonici** sono il fondo, e il fondo qui è il silenzio. Prima c'era un
bordone continuo, e un bordone continuo dopo venti minuti è una molestia: la
stanchezza non viene dal volume, viene dal fatto che non smette mai. Adesso non
suona niente di continuo — quando si apre un sistema, un accordo di quattro
gradi (fondamentale, terza, quinta, ottava) fiorisce sulla **radice dell'era** e
si spegne in cinque secondi. Fra un accordo e l'altro, niente.

Perciò **non ci sono nodi tenuti accesi**: ogni suono nasce, suona e si smonta
da sé. Non c'è un bordone da fermare quando si spegne l'audio, ed è anche il
motivo per cui spegnere è una cosa sola invece di tre.

Il comando è **uno solo**, il tasto accanto al tema in alto a destra. Parte
spento: un'app che comincia a suonare da sola è un'app che si chiude. Ogni
passaggio è difeso, perché il suono non deve mai poter fermare il gioco.

### Spegnere spegne davvero

C'era un difetto che rendeva il muto una decorazione. Il bordone veniva
riportato al suo volume da `aggiornaBordone()`, che girava **a ogni tick**: si
spegneva, e cento millisecondi dopo tornava. E i bip non guardavano affatto
l'interruttore — controllavano solo che il contesto audio esistesse, cosa che
restava vera anche da spenti. Il risultato è che spegnere il suono non spegneva
niente.

Adesso c'è **una sola verità** (`suonoOn`, letta dall'archivio una volta e
tenuta lì) che ogni strato interroga, e **un solo rubinetto** in fondo alla
catena: spegnere chiude quello, e `suonoOn` impedisce a chiunque di aprirne di
nuovi.

## Il grafico dei flussi

Accanto a ogni risorsa c'è una sparkline degli ultimi minuti: barre ancorate
alla linea dello zero, verdi sopra e arancioni sotto. Serve a vedere l'effetto
di una decisione — comprare, cambiare una costante, accettare un evento —
invece di doverlo intuire dal numero istantaneo.

## Una partita alla volta

Un universo solo, in una chiave sola. Un pulsante *Esporta / importa* produce un
codice testuale con la partita e le Costanti Universali: serve a spostarsi fra
browser e da rete di sicurezza, visto quanto è fragile `localStorage` su
`file://`. Chi aveva partite negli slot di una versione precedente se le ritrova
adottate automaticamente, senza perdere nulla.

## Telefono, tastiera e accessibilità

Su schermi stretti il gioco passa a una colonna con bersagli più grandi, e ogni
pannello si richiude dalla sua intestazione (lo stato viene ricordato). Da
tastiera: barra spaziatrice per l'azione principale, `1`/`2`/`3` per il
moltiplicatore, `t` per il tema. Il log è annunciato agli screen reader, le
sparkline hanno una descrizione testuale, e chi ha chiesto `prefers-reduced-motion`
vede la stessa scena ferma, aggiornata una volta al secondo.

## Tema chiaro e scuro

In alto a destra un pulsante con un simbolo — ☀ o ☾ — commuta la palette; la
scelta viene ricordata (o si preme `t`). L'icona mostra *dove si va*, non dove
si è: al buio offre il sole. Il tema scuro resta il predefinito.

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
