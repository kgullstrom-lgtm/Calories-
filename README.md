# Kalorikoll 🥗

En app för kaloriintag och näring, inspirerad av Foodvisor. Byggd som en installerbar webbapp (PWA) som fungerar i mobilen.

## Funktioner

- **📷 Fotografera måltiden.** AI (Claude) känner igen livsmedlen på bilden, uppskattar portionsstorlek i gram och räknar ut kalorier, protein, kolhydrater, fett och fiber. Du kan justera vikten per livsmedel innan du sparar. Det går också att beskriva måltiden i text, med eller utan bild.
- **📖 Dagbok.** Frukost, lunch, middag och mellanmål. En kaloriring visar hur mycket som är kvar, och staplar visar makronäringsämnen. Du kan bläddra mellan dagar, kopiera en måltid från dagen innan och registrera vatten.
- **🔎 Livsmedel.** Inbyggd svensk databas med cirka 130 vanliga livsmedel och färdiga portioner, plus sökning i [Open Food Facts](https://world.openfoodfacts.org) (även på streckkod). Du kan också skapa egna livsmedel eller snabbregistrera bara kalorier.
- **★ Favoriter och senaste.** Spara livsmedel och recept som favoriter för att logga dem snabbt.
- **🍲 Recept.** Bygg recept av ingredienser, ange antal portioner och logga en portion med ett tryck. En fotad måltid kan sparas direkt som recept.
- **📈 Utveckling.** Kaloriintag per dag mot målet (vecka, månad eller 3 månader), snitt, dagar inom målet, svit i rad, näringsfördelning, viktkurva mot målvikt samt BMI.
- **👤 Profil och mål.** Kaloribehov beräknas med Mifflin–St Jeor och aktivitetsnivå utifrån målet (gå ner, behålla eller gå upp). Makrofördelningen går att ställa in, och du kan sätta en egen kalorigräns.
- **🔒 Lokal data.** Allt sparas på enheten (localStorage och IndexedDB för bilder) och kan exporteras eller importeras som JSON.

## Kom igång

```bash
npm install
npm run dev      # utvecklingsserver
npm run build    # produktionsbygge i dist/
npm run preview  # förhandsgranska bygget
```

Öppna adressen i mobilen och välj "Lägg till på hemskärmen" för att installera appen.

### AI-bildanalys

Fotoanalysen använder Anthropics Claude API. Skapa en API-nyckel på [console.anthropic.com](https://console.anthropic.com) och klistra in den under **Profil → AI-bildanalys**. Nyckeln sparas bara i din webbläsare och skickas direkt till Anthropic. Standardmodellen är Claude Opus 5.5. Sonnet 5.5 och Haiku 5.5 går att välja om du vill ha snabbare eller billigare analyser.

> Eftersom nyckeln ligger i webbläsaren passar upplägget för privat bruk. Om appen ska delas med andra bör anropet flyttas till en egen server.

## Teknik

React 19, TypeScript och Vite. Inga externa UI-bibliotek; diagrammen är egna SVG-komponenter. Anthropic-SDK:t laddas först när en bild analyseras.

```
src/
  lib/         datamodell, lagring, näringsberäkningar, livsmedelsdatabas, AI, Open Food Facts
  components/  bottenark, diagram, livsmedelsväljare, fotoanalys, recepteditor …
  pages/       Dagbok, Recept, Utveckling, Profil
```

*Näringsvärdena är ungefärliga och ersätter inte medicinsk rådgivning.*
