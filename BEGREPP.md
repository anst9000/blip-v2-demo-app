# Begrepp: paket, leveranser, versioner och mikrotjänster

Detta beskriver hur begreppen brukar användas. Din organisation kan definiera några av dem lite
annorlunda, särskilt "applikation" och "mikrotjänst", så stäm av det som är viktigt mot era egna
register.

## Vad är ett paket (rpm-paket)?

Ett rpm-paket är **en fil som innehåller en programvara, färdig att installera** på Linuxservrar i
Red Hat-familjen (RHEL, Rocky, Fedora med flera). RPM stod ursprungligen för "Red Hat Package
Manager".

En rpm-fil innehåller:

- **Filerna som ska installeras:** program, bibliotek, JAR-filer, webbfiler och
  konfigurationsmallar, var och en med uppgift om var på servern den ska hamna (till exempel
  `/opt/abc-regler/`).
- **Metadata:** namn, version, release, arkitektur, beskrivning och vem som byggt paketet.
- **Beroenden:** vad som redan måste vara installerat, till exempel "kräver java-17" eller
  "kräver abc-common ≥ 2.0".
- **Skript** som körs vid installation eller borttagning, till exempel för att skapa en
  användare, sätta upp en tjänst eller starta om den.

Filnamnet visar paketets identitet:

```
abc-sup-regler-3.4.1-2.el9.noarch.rpm
└──── namn ───┘ └ver┘ └rel┘   └ark┘
```

Serverns pakethanterare (`dnf`/`yum`) installerar, uppgraderar och tar bort paket, och håller
reda på vilken version som är installerad. Ett rpm-paket byggs från en **spec-fil**, ett
byggrecept, oftast av er byggkedja.

## Vad är en leverans?

En leverans är **en bestämd samling paket, i exakta versioner, som lämnas över för att
installeras** i en miljö eller som en del av en release.

Den har normalt:

- en identitet (ett nummer eller namn);
- en lista över paket med exakta versioner;
- ett mål: vilken miljö (test, acceptanstest, produktion) eller vilken release;
- installationsanvisningar eller en beställning, plus status och godkännanden.

En leverans kan innehålla paket från **en applikation, flera applikationer eller flera
delsystem**. En leverans är alltså inte "en version av något", utan en **försändelse**.

**Liknelse:** paketen är varor, och leveransen är en pall med utvalda varor som skickas till en
adress.

## Vad är en version av en applikation?

Det är **applikationens tillstånd som helhet vid en viss tidpunkt**, oftast beskrivet som
funktionalitet: "ABC_SUP_REGLER 3.4 har de nya reglerna för 2027".

- Det är den versionen människor pratar om: testare, produktägare och releasenoteringar.
- Den följer ofta semantisk versionering, `MAJOR.MINOR.PATCH`:
  - **MAJOR:** ändringar som inte är bakåtkompatibla.
  - **MINOR:** ny funktionalitet.
  - **PATCH:** felrättningar.
- Om applikationen består av **ett paket** brukar applikationens version och paketets version
  stämma överens.
- Om den består av **flera paket** är applikationsversionen egentligen en **kombination** av
  paketversioner. Till exempel "Applikation 3.4" = server 3.4.1 + webb 3.4.0 +
  databasmigrering 3.4.0.

## Vad är en version av ett paket?

I RPM har en paketversion **tre delar**: `Epoch:Version-Release`.

| Del | Betydelse | Exempel |
|---|---|---|
| **Version** | Versionen av programvaran i paketet, normalt samma som applikationens eller komponentens version. | `3.4.1` |
| **Release** | Vilken paketering av den versionen det är. Räknas upp när paketet byggs om men programvaran är densamma (ett rättat installationsskript, ett nytt beroende). Har ofta en distributionsmärkning. | `2.el9` |
| **Epoch** | Används sällan. Tvingar en version som "ser äldre ut" att räknas som nyare, till exempel efter byte av numreringsschema. Utelämnas oftast (= 0). | `1:` |

Så `3.4.1-1` och `3.4.1-2` har **samma programvara** men **olika paketering**. Pakethanteraren
räknar alltid den högre versionen som nyare och jämför först epoch, sedan version, sedan release.

**Skillnaden mot applikationsversionen:** applikationsversionen beskriver *vad programvaran gör*.
Paketversionen identifierar *exakt vilken fil som installerades*.

## Vad är en mikrotjänst?

En mikrotjänst är **en liten, självständig tjänst som gör en tydligt avgränsad uppgift** och
pratar med andra tjänster över nätverket. Den kommunicerar oftast via REST/HTTP-API:er eller
meddelanden (köer).

Typiska kännetecken:

- **Ett enda ansvar:** till exempel "beräkna förmånsbelopp" eller "skicka brev".
- **Driftsätts för sig:** den kan släppas utan att allt annat släpps samtidigt.
- **Äger sina data:** andra tjänster läser inte direkt i dess databas, de frågar tjänsten.
- **Körs som en egen process:** ofta i en container, men det kan lika gärna vara en tjänst på
  en Linuxserver som installerats från ett rpm-paket.
- **Kan köras i flera instanser** sida vid sida för att klara belastning.

**Hur den förhåller sig till "applikation" beror på hur er organisation modellerar det:**

- I vissa organisationer **registreras varje mikrotjänst som en egen applikation**. Då är
  mikrotjänst och applikation samma sak.
- I andra **består en applikation av flera mikrotjänster** som tillsammans ger en förmåga.

Ta reda på vilken modell ert applikationsregister använder. Det är troligen den vanligaste
orsaken till att begreppen känns svåra att hålla isär.

## Vilka delar består en applikation av?

Alla applikationer har inte alla delar, men en typisk applikation har:

1. **Programkod, byggd till en artefakt**, till exempel en JAR- eller WAR-fil (Java), en samling
   webbfiler (frontend) eller en binärfil.
2. **Körmiljö:** Java, Node.js, en applikationsserver (Tomcat, JBoss) eller en webbserver
   (nginx, Apache).
3. **Bibliotek:** kodens beroenden, antingen packade med koden eller installerade separat.
4. **Konfiguration:** inställningar som skiljer sig mellan miljöer, som adresser, portar,
   funktionsflaggor och inloggningsuppgifter (helst hanterade separat).
5. **Data och databasstruktur:** schema och migreringsskript som ändrar databasen mellan
   versioner.
6. **Integrationer:** vad den anropar och vad som anropar den (API:er, köer, filer).
7. **Driftdelar:** start- och tjänstefiler (systemd), loggning, övervakning, hälsokontroller och
   backup.
8. **Batchjobb och schemalagda uppgifter**, om sådana finns.
9. **Dokumentation:** installationsanvisning, driftinstruktioner och releasenoteringar.

## Vilka delar består en mikrotjänst av?

Samma slags delar, men mindre och mer självständiga:

1. **Tjänstens kod**, som gör dess enda uppgift.
2. **Ett API-kontrakt:** vad den erbjuder, ofta beskrivet i OpenAPI (REST) eller som
   meddelandeformat.
3. **En egen datalagring**, om den behöver det.
4. **Konfiguration**, som matas in per miljö.
5. **En driftsättningsbar enhet:** ett rpm-paket eller en containeravbild.
6. **Hälsokontroller, mätvärden och loggar**, så att plattformen kan se om den är igång och
   starta om den om inte.
7. **En driftsättningsbeskrivning:** hur många instanser, vilka resurser och vilka andra
   tjänster den behöver.

Den stora skillnaden är att en mikrotjänst är byggd för att kunna **förstås, testas och
driftsättas för sig**, medan en traditionell applikation ofta har många delar som måste släppas
tillsammans.

## Finns det flera paket i en applikation?

**Ofta ja, men inte alltid.** Vanliga uppdelningar:

| Paket | Innehåller |
|---|---|
| `abc-regler` | Server- eller backendkoden |
| `abc-regler-web` | Frontendfiler |
| `abc-regler-db` | Databasmigreringar |
| `abc-regler-config-test` / `-prod` | Miljöspecifik konfiguration |
| `abc-regler-batch` | Batchjobb |

Skäl att dela upp:

- vissa delar ändras oftare än andra;
- vissa delar ska till olika servrar (webbserver eller applikationsserver);
- konfigurationen ska kunna bytas utan att koden byggs om.

En liten applikation kan mycket väl vara **ett enda paket**.

## Finns det flera paket i en mikrotjänst?

**Oftast ett**, eftersom tanken är att en mikrotjänst ska vara en enda driftsättningsbar enhet.

Ett vanligt undantag är **ett paket för tjänsten plus ett separat paket för dess
konfiguration**, så att samma kod kan installeras i alla miljöer med olika inställningar. Om en
mikrotjänst behöver många paket är det ofta ett tecken på att den egentligen är flera tjänster,
eller en liten applikation.

## Hela bilden

```
Delsystem ABC "Abrakadabra"                     (ansvarsområde, ingen version)
 └─ Applikation ABC_SUP_REGLER, version 3.4     (programvaran som helhet)
     ├─ paket abc-sup-regler-3.4.1-2.el9        (exakt det som installeras)
     ├─ paket abc-sup-regler-db-3.4.0-1.el9
     └─ paket abc-sup-regler-config-3.4.0-1.el9
                    │
                    ▼
Leverans 2027-03 (till acceptanstest)           (ett urval paket, skickade tillsammans)
 ├─ abc-sup-regler-3.4.1-2.el9
 ├─ abc-sup-regler-db-3.4.0-1.el9
 └─ wdh-bas-laskopia-1.8.0-1.el9                (kan innehålla andra delsystem)
```

När något känns oklart, fråga dig vilken nivå det är på. Är det ett **område** (delsystem),
**programvara** (applikation eller mikrotjänst), en **installerbar fil** (paket) eller **det som
skickades vid ett tillfälle** (leverans)?
