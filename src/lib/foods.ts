import type { Food, Serving } from './types'

// Ungefärliga näringsvärden per 100 g (baserat på typiska värden ur
// Livsmedelsverkets livsmedelsdatabas). Format:
// [namn, kategori, kcal, protein, kolhydrater, fett, fiber, socker, portioner]
type Row = [string, string, number, number, number, number, number, number, string?]

const ROWS: Row[] = [
  // Frukt & bär
  ['Äpple', 'Frukt & bär', 52, 0.3, 11.4, 0.2, 2.1, 10.4, '1 st medel:150'],
  ['Banan', 'Frukt & bär', 93, 1.1, 20.2, 0.3, 1.6, 15.6, '1 st medel:120'],
  ['Apelsin', 'Frukt & bär', 47, 0.9, 9.1, 0.2, 2.0, 8.6, '1 st:160'],
  ['Päron', 'Frukt & bär', 54, 0.4, 11.7, 0.1, 3.1, 9.8, '1 st:170'],
  ['Vindruvor', 'Frukt & bär', 70, 0.6, 16.1, 0.2, 0.9, 16.1, '1 klase:100'],
  ['Jordgubbar', 'Frukt & bär', 36, 0.7, 6.2, 0.4, 2.0, 5.3, '1 dl:60'],
  ['Blåbär', 'Frukt & bär', 51, 0.7, 9.7, 0.6, 2.5, 7.4, '1 dl:65'],
  ['Hallon', 'Frukt & bär', 42, 1.2, 5.3, 0.6, 4.7, 4.4, '1 dl:55'],
  ['Kiwi', 'Frukt & bär', 61, 1.1, 12.0, 0.5, 3.0, 9.0, '1 st:75'],
  ['Mango', 'Frukt & bär', 65, 0.6, 14.1, 0.3, 1.6, 13.7, '1 st:300'],
  ['Melon (vattenmelon)', 'Frukt & bär', 32, 0.6, 7.2, 0.2, 0.4, 6.2, '1 skiva:250'],
  ['Avokado', 'Frukt & bär', 197, 1.9, 1.9, 19.5, 6.7, 0.7, '1/2 st:75'],
  ['Russin', 'Frukt & bär', 304, 2.5, 69.3, 0.5, 4.5, 59, '1 msk:10'],

  // Grönsaker
  ['Tomat', 'Grönsaker', 20, 0.8, 2.9, 0.4, 1.2, 2.9, '1 st:90'],
  ['Gurka', 'Grönsaker', 13, 0.6, 1.8, 0.2, 0.7, 1.8, '1 skiva:7|1/2 gurka:180'],
  ['Morot', 'Grönsaker', 35, 0.6, 6.4, 0.2, 2.6, 5.6, '1 st:70'],
  ['Broccoli', 'Grönsaker', 34, 3.0, 3.3, 0.4, 2.6, 1.6, '1 portion:100'],
  ['Blomkål', 'Grönsaker', 25, 1.9, 3.1, 0.3, 2.0, 2.4, '1 portion:100'],
  ['Spenat', 'Grönsaker', 23, 2.9, 1.4, 0.4, 2.2, 0.4, '1 näve:30'],
  ['Isbergssallad', 'Grönsaker', 14, 0.9, 1.8, 0.1, 1.2, 1.8, '1 portion:50'],
  ['Paprika röd', 'Grönsaker', 31, 1.0, 5.4, 0.3, 1.9, 4.2, '1 st:150'],
  ['Lök gul', 'Grönsaker', 38, 1.1, 7.3, 0.1, 1.6, 4.7, '1 st:100'],
  ['Vitlök', 'Grönsaker', 135, 6.4, 25.0, 0.5, 2.1, 1, '1 klyfta:5'],
  ['Champinjoner', 'Grönsaker', 25, 3.1, 0.4, 0.4, 2.0, 0.4, '1 dl:35'],
  ['Zucchini', 'Grönsaker', 18, 1.6, 2.2, 0.2, 1.1, 2, '1 st:250'],
  ['Majs (konserv)', 'Grönsaker', 93, 2.9, 16.4, 1.2, 2.8, 4, '1 dl:70'],
  ['Ärtor (frysta)', 'Grönsaker', 72, 5.7, 9.0, 0.6, 5.0, 4, '1 dl:65'],
  ['Potatis kokt', 'Grönsaker', 77, 1.9, 16.1, 0.1, 1.6, 0.7, '1 st medel:75'],
  ['Sötpotatis ugnsbakad', 'Grönsaker', 90, 2.0, 20.7, 0.2, 3.3, 6.5, '1 st:200'],
  ['Pommes frites', 'Grönsaker', 290, 3.4, 36.0, 15.0, 3.5, 0.3, '1 portion:150'],

  // Bröd, spannmål, pasta
  ['Havregryn', 'Spannmål & bröd', 370, 13.0, 58.0, 7.0, 10.0, 1, '1 dl:35'],
  ['Havregrynsgröt (vatten)', 'Spannmål & bröd', 62, 2.2, 9.7, 1.2, 1.7, 0.2, '1 portion:250'],
  ['Müsli', 'Spannmål & bröd', 375, 9.5, 63.0, 7.5, 8.0, 18, '1 dl:45'],
  ['Cornflakes', 'Spannmål & bröd', 375, 7.0, 84.0, 0.9, 3.0, 8, '1 dl:15'],
  ['Knäckebröd råg', 'Spannmål & bröd', 335, 9.0, 61.0, 2.0, 17.0, 1.5, '1 skiva:12'],
  ['Fullkornsbröd', 'Spannmål & bröd', 245, 9.0, 41.0, 3.5, 7.0, 4, '1 skiva:35'],
  ['Vitt formbröd', 'Spannmål & bröd', 265, 8.5, 48.0, 3.5, 3.0, 5, '1 skiva:30'],
  ['Kaffebröd/bulle', 'Spannmål & bröd', 360, 7.0, 50.0, 14.0, 2.0, 18, '1 bulle:50'],
  ['Pasta kokt', 'Spannmål & bröd', 140, 5.0, 28.0, 0.8, 1.6, 0.5, '1 portion:200'],
  ['Pasta okokt', 'Spannmål & bröd', 355, 12.5, 71.0, 1.5, 3.0, 3, '1 portion:80'],
  ['Ris kokt', 'Spannmål & bröd', 125, 2.6, 27.0, 0.3, 0.4, 0, '1 portion:180'],
  ['Ris okokt', 'Spannmål & bröd', 350, 7.0, 77.0, 0.6, 1.3, 0, '1 portion:70'],
  ['Bulgur kokt', 'Spannmål & bröd', 83, 3.1, 18.6, 0.2, 4.5, 0.1, '1 portion:180'],
  ['Quinoa kokt', 'Spannmål & bröd', 120, 4.4, 21.3, 1.9, 2.8, 0.9, '1 portion:180'],
  ['Tortilla (vete)', 'Spannmål & bröd', 310, 8.5, 52.0, 7.5, 2.5, 3, '1 st:40'],

  // Mejeri & ägg
  ['Mjölk 1,5 %', 'Mejeri & ägg', 46, 3.5, 4.8, 1.5, 0, 4.8, '1 glas:200|1 dl:100'],
  ['Mjölk 3 %', 'Mejeri & ägg', 61, 3.4, 4.7, 3.0, 0, 4.7, '1 glas:200|1 dl:100'],
  ['Mellanfil 1,5 %', 'Mejeri & ägg', 46, 3.5, 4.8, 1.5, 0, 4.8, '1 dl:100'],
  ['Yoghurt naturell 3 %', 'Mejeri & ägg', 61, 3.6, 4.6, 3.0, 0, 4.6, '1 dl:100'],
  ['Grekisk yoghurt 10 %', 'Mejeri & ägg', 120, 4.5, 3.8, 10.0, 0, 3.8, '1 dl:100'],
  ['Kvarg naturell', 'Mejeri & ägg', 60, 11.0, 3.5, 0.2, 0, 3.5, '1 burk:250'],
  ['Keso', 'Mejeri & ägg', 95, 12.0, 2.5, 4.0, 0, 2.5, '1 dl:90'],
  ['Hårdost 28 %', 'Mejeri & ägg', 355, 26.0, 0, 28.0, 0, 0, '1 skiva:10'],
  ['Hårdost 17 %', 'Mejeri & ägg', 270, 30.0, 0, 17.0, 0, 0, '1 skiva:10'],
  ['Fetaost', 'Mejeri & ägg', 265, 16.0, 1.0, 22.0, 0, 1, '1 portion:30'],
  ['Mozzarella', 'Mejeri & ägg', 245, 18.0, 1.0, 19.0, 0, 1, '1 kula:125'],
  ['Smör', 'Mejeri & ägg', 740, 0.6, 0.6, 82.0, 0, 0.6, '1 tsk:5|1 msk:12'],
  ['Bregott/margarin 75 %', 'Mejeri & ägg', 670, 0.5, 0.5, 75.0, 0, 0.5, '1 tsk:5'],
  ['Grädde 36 %', 'Mejeri & ägg', 340, 2.2, 3.0, 36.0, 0, 3, '1 msk:15|1 dl:100'],
  ['Matlagningsgrädde 15 %', 'Mejeri & ägg', 165, 3.0, 4.0, 15.0, 0, 4, '1 dl:100'],
  ['Crème fraiche 34 %', 'Mejeri & ägg', 330, 2.4, 3.0, 34.0, 0, 3, '1 msk:15'],
  ['Ägg', 'Mejeri & ägg', 140, 12.5, 0.3, 9.7, 0, 0.3, '1 st:55'],
  ['Havredryck', 'Mejeri & ägg', 45, 1.0, 6.5, 1.5, 0.8, 4, '1 glas:200'],

  // Kött, fisk, protein
  ['Kycklingfilé', 'Kött, fisk & protein', 110, 23.0, 0, 1.8, 0, 0, '1 filé:150'],
  ['Kycklingfilé stekt', 'Kött, fisk & protein', 150, 30.0, 0, 3.0, 0, 0, '1 filé:120'],
  ['Nötfärs 10 %', 'Kött, fisk & protein', 170, 20.0, 0, 10.0, 0, 0, '1 portion:125'],
  ['Nötfärs 20 %', 'Kött, fisk & protein', 250, 18.0, 0, 20.0, 0, 0, '1 portion:125'],
  ['Fläskfilé', 'Kött, fisk & protein', 110, 21.0, 0, 2.5, 0, 0, '1 portion:125'],
  ['Bacon stekt', 'Kött, fisk & protein', 470, 30.0, 0, 39.0, 0, 0, '1 skiva:10'],
  ['Falukorv', 'Kött, fisk & protein', 210, 10.0, 7.0, 16.0, 0, 1, '1 skiva:40'],
  ['Prinskorv', 'Kött, fisk & protein', 250, 12.0, 3.0, 21.0, 0, 1, '1 st:20'],
  ['Köttbullar', 'Kött, fisk & protein', 230, 14.0, 9.0, 15.0, 0.5, 1, '1 st:15'],
  ['Skinka (pålägg)', 'Kött, fisk & protein', 105, 19.0, 1.5, 2.5, 0, 1, '1 skiva:10'],
  ['Laxfilé', 'Kött, fisk & protein', 200, 20.0, 0, 13.0, 0, 0, '1 bit:125'],
  ['Torskfilé', 'Kött, fisk & protein', 75, 17.5, 0, 0.6, 0, 0, '1 bit:125'],
  ['Tonfisk i vatten', 'Kött, fisk & protein', 110, 25.0, 0, 1.0, 0, 0, '1 burk:120'],
  ['Räkor skalade', 'Kött, fisk & protein', 75, 17.0, 0, 0.8, 0, 0, '1 portion:100'],
  ['Sill inlagd', 'Kött, fisk & protein', 205, 8.0, 15.0, 12.5, 0, 14, '1 bit:20'],
  ['Kaviar (tub)', 'Kött, fisk & protein', 440, 10.0, 6.0, 42.0, 0, 5, '1 msk:15'],
  ['Tofu', 'Kött, fisk & protein', 125, 13.0, 1.5, 7.5, 0.5, 0.5, '1 portion:100'],
  ['Kikärter kokta', 'Kött, fisk & protein', 140, 7.5, 18.0, 2.5, 7.5, 1, '1 dl:70'],
  ['Linser kokta', 'Kött, fisk & protein', 115, 9.0, 16.5, 0.4, 7.9, 1.8, '1 dl:80'],
  ['Bönor kidney kokta', 'Kött, fisk & protein', 120, 8.5, 15.0, 0.5, 7.5, 0.3, '1 dl:70'],
  ['Proteinpulver (vassle)', 'Kött, fisk & protein', 390, 78.0, 7.0, 6.0, 0, 5, '1 skopa:30'],

  // Nötter, fett, sås
  ['Mandlar', 'Nötter & fett', 600, 21.0, 9.5, 52.0, 10.5, 4.4, '1 näve:25'],
  ['Valnötter', 'Nötter & fett', 680, 15.0, 7.0, 65.0, 6.5, 2.6, '1 näve:25'],
  ['Jordnötter salta', 'Nötter & fett', 610, 25.0, 12.0, 50.0, 8.0, 4, '1 näve:25'],
  ['Jordnötssmör', 'Nötter & fett', 600, 24.0, 15.0, 50.0, 6.0, 6, '1 msk:15'],
  ['Olivolja', 'Nötter & fett', 885, 0, 0, 100.0, 0, 0, '1 tsk:5|1 msk:13'],
  ['Rapsolja', 'Nötter & fett', 885, 0, 0, 100.0, 0, 0, '1 msk:13'],
  ['Majonnäs', 'Nötter & fett', 690, 1.0, 2.0, 75.0, 0, 2, '1 msk:15'],
  ['Ketchup', 'Nötter & fett', 110, 1.5, 24.0, 0.2, 0.5, 22, '1 msk:15'],
  ['Hummus', 'Nötter & fett', 250, 7.0, 13.0, 18.0, 6.0, 0.5, '1 msk:20'],
  ['Pesto', 'Nötter & fett', 450, 5.0, 5.0, 45.0, 2.0, 2, '1 msk:15'],

  // Färdigrätter
  ['Pizza Margherita', 'Måltider', 250, 10.5, 30.0, 9.5, 2.0, 3, '1 pizza:350|1 bit:90'],
  ['Hamburgare med bröd', 'Måltider', 255, 13.0, 25.0, 11.0, 1.5, 5, '1 st:220'],
  ['Kebabtallrik', 'Måltider', 190, 9.0, 18.0, 9.0, 1.5, 2, '1 portion:550'],
  ['Spaghetti köttfärssås', 'Måltider', 150, 7.5, 18.0, 5.0, 1.5, 3, '1 portion:400'],
  ['Lasagne', 'Måltider', 165, 8.5, 13.0, 8.5, 1.0, 3, '1 portion:350'],
  ['Pannkakor', 'Måltider', 190, 6.5, 22.0, 8.5, 0.8, 4, '1 st:60'],
  ['Sushi (blandat)', 'Måltider', 150, 6.0, 26.0, 2.0, 0.5, 6, '1 bit:30'],
  ['Caesarsallad med kyckling', 'Måltider', 140, 11.0, 6.0, 8.0, 1.5, 1.5, '1 portion:350'],
  ['Pyttipanna', 'Måltider', 160, 6.0, 14.0, 9.0, 1.5, 1, '1 portion:350'],
  ['Ärtsoppa', 'Måltider', 90, 6.0, 10.0, 2.5, 4.0, 1, '1 portion:300'],

  // Snacks & sött
  ['Mörk choklad 70 %', 'Snacks & sött', 580, 8.0, 34.0, 43.0, 11.0, 28, '1 rad:20'],
  ['Mjölkchoklad', 'Snacks & sött', 545, 7.5, 57.0, 31.0, 2.0, 55, '1 rad:20'],
  ['Chips', 'Snacks & sött', 540, 6.0, 52.0, 34.0, 4.5, 1, '1 skål:50'],
  ['Popcorn', 'Snacks & sött', 480, 8.5, 55.0, 24.0, 10.0, 1, '1 skål:30'],
  ['Godis (blandat)', 'Snacks & sött', 360, 3.0, 85.0, 1.0, 0, 70, '1 näve:50'],
  ['Glass vanilj', 'Snacks & sött', 200, 3.5, 23.0, 10.5, 0, 21, '1 kula:60'],
  ['Kanelbulle', 'Snacks & sött', 370, 6.5, 52.0, 15.0, 2.0, 18, '1 st:60'],
  ['Kladdkaka', 'Snacks & sött', 430, 5.5, 50.0, 23.0, 2.0, 38, '1 bit:60'],
  ['Proteinbar', 'Snacks & sött', 370, 33.0, 35.0, 12.0, 6.0, 4, '1 st:55'],
  ['Honung', 'Snacks & sött', 320, 0.3, 80.0, 0, 0, 80, '1 tsk:7'],
  ['Socker', 'Snacks & sött', 400, 0, 100.0, 0, 0, 100, '1 tsk:4'],
  ['Sylt', 'Snacks & sött', 200, 0.4, 49.0, 0.1, 1.0, 45, '1 msk:20'],

  // Drycker
  ['Kaffe svart', 'Drycker', 2, 0.1, 0, 0, 0, 0, '1 kopp:200'],
  ['Te', 'Drycker', 1, 0, 0.2, 0, 0, 0, '1 kopp:250'],
  ['Caffè latte', 'Drycker', 50, 3.2, 4.6, 2.0, 0, 4.6, '1 stor:350'],
  ['Apelsinjuice', 'Drycker', 44, 0.7, 9.6, 0.1, 0.2, 8.5, '1 glas:200'],
  ['Läsk (sockrad)', 'Drycker', 42, 0, 10.6, 0, 0, 10.6, '1 burk:330'],
  ['Läsk (light)', 'Drycker', 1, 0, 0, 0, 0, 0, '1 burk:330'],
  ['Öl 5 %', 'Drycker', 43, 0.4, 3.5, 0, 0, 0, '1 burk:330|1 stor stark:500'],
  ['Rött vin', 'Drycker', 85, 0.1, 2.6, 0, 0, 0.6, '1 glas:150'],
  ['Vitt vin', 'Drycker', 82, 0.1, 2.6, 0, 0, 1, '1 glas:150'],
  ['Smoothie (bär/banan)', 'Drycker', 60, 0.8, 13.0, 0.3, 1.5, 11, '1 glas:250'],
]

function parseServings(s?: string): Serving[] | undefined {
  if (!s) return undefined
  return s.split('|').map((p) => {
    const [label, g] = p.split(':')
    return { label, grams: Number(g) }
  })
}

export const FOOD_DB: Food[] = ROWS.map(([name, category, kcal, protein, carbs, fat, fiber, sugar, sv], i) => ({
  id: `db-${i}-${name.toLowerCase().replace(/[^a-zåäö0-9]+/g, '-')}`,
  name,
  category,
  per100: { kcal, protein, carbs, fat, fiber, sugar },
  servings: parseServings(sv),
  source: 'db',
}))

const norm = (s: string) => s.toLowerCase().normalize('NFC')

export function searchFoods(foods: Food[], q: string): Food[] {
  const query = norm(q.trim())
  if (!query) return foods
  const words = query.split(/\s+/)
  return foods
    .map((f) => {
      const hay = norm(`${f.name} ${f.brand ?? ''} ${f.category ?? ''}`)
      if (!words.every((w) => hay.includes(w))) return null
      const score = norm(f.name).startsWith(query) ? 0 : norm(f.name).includes(query) ? 1 : 2
      return { f, score }
    })
    .filter((x): x is { f: Food; score: number } => x !== null)
    .sort((a, b) => a.score - b.score || a.f.name.localeCompare(b.f.name, 'sv'))
    .map((x) => x.f)
}
