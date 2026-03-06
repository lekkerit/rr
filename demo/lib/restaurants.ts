export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviews: number | null;
  review: {
    author: string;
    stars: number;
    date: string;
    avatar: string;
    text: string;
  };
  goodResponse: string;
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: "vivaldi",
    name: "Restaurant Vivaldi",
    rating: 4.0,
    reviews: 1207,
    review: {
      author: "Martijn van der Berg",
      stars: 2,
      date: "2 weken geleden",
      avatar: "M",
      text: "Teleurstellend bezoek. Het eten was oké maar de bediening liet echt te wensen over. We moesten meer dan 20 minuten wachten voordat iemand onze bestelling opnam. Voor deze prijsklasse verwacht je meer aandacht.",
    },
    goodResponse:
      "Beste Martijn, hartelijk dank voor uw eerlijke feedback. Het spijt ons oprecht dat u zo lang heeft moeten wachten — dit is niet de ervaring die wij bij Vivaldi willen bieden. We nemen uw opmerking serieus en bespreken dit direct met ons team. We hopen u binnenkort te mogen verwelkomen voor een bezoek dat volledig aan uw verwachtingen voldoet. Met vriendelijke groet, het team van Restaurant Vivaldi",
  },
  {
    id: "lorenza",
    name: "Restaurant Lorenza",
    rating: 4.0,
    reviews: 536,
    review: {
      author: "Sandra Koopman",
      stars: 3,
      date: "1 maand geleden",
      avatar: "S",
      text: "Sfeervolle locatie maar het gerecht dat ik bestelde was lauw. De pasta was lekker maar niet echt warm genoeg. Het personeel was vriendelijk, alleen de keuken moet beter op temperatuur letten.",
    },
    goodResponse:
      "Beste Sandra, dank u voor uw bezoek aan Lorenza en uw eerlijke reactie. Het is vervelend te horen dat uw gerecht niet op de juiste temperatuur werd geserveerd — dit verdient zeker onze aandacht. We hebben dit intern besproken en maatregelen genomen. Uw feedback helpt ons om onze kwaliteit te bewaken. We zouden het fijn vinden u nogmaals te verwelkomen. Met vriendelijke groet, Restaurant Lorenza",
  },
  {
    id: "parc",
    name: "Restaurant Parc",
    rating: 4.0,
    reviews: 486,
    review: {
      author: "Erik Hermans",
      stars: 2,
      date: "3 weken geleden",
      avatar: "E",
      text: "We hadden een tafel gereserveerd voor ons jubileum maar werden vergeten bij binnenkomst. Stonden bijna 15 minuten bij de deur. Uiteindelijk goed gegeten maar de eerste indruk was jammer.",
    },
    goodResponse:
      "Beste Erik, van harte gefeliciteerd met uw jubileum — en onze welgemeende excuses dat uw aankomst bij Parc niet vlekkeloos verliep. Dit had anders gemoeten, zeker voor zo'n bijzondere gelegenheid. We hebben uw feedback met het team gedeeld en werken aan een betere ontvangstprocedure. We hopen dat we in de toekomst de kans krijgen om u een onvergetelijke avond te bezorgen. Met vriendelijke groet, Restaurant Parc",
  },
  {
    id: "bospandje",
    name: "Pannenkoekenhuis 't Bospandje",
    rating: 4.0,
    reviews: 276,
    review: {
      author: "Lisa de Vries",
      stars: 3,
      date: "2 weken geleden",
      avatar: "L",
      text: "Leuke plek voor de kinderen maar het duurde erg lang. Pannenkoeken waren lekker maar de wachttijd was ruim 40 minuten. Voor een gezin met jonge kinderen is dat echt te lang.",
    },
    goodResponse:
      "Beste Lisa, dank voor uw bezoek aan 't Bospandje! We vinden het fijn dat de pannenkoeken in de smaak vielen. Tegelijkertijd begrijpen we dat een wachttijd van 40 minuten — zeker met jonge kinderen — echt te lang is. Dit nemen we serieus. Op drukke momenten proberen we gasten hierover beter te informeren. We hopen u en uw gezin binnenkort weer te mogen verwelkomen! Met vriendelijke groet, het team van 't Bospandje",
  },
  {
    id: "zonnestraal",
    name: "Zonnestraal Hilversum",
    rating: 5.0,
    reviews: 239,
    review: {
      author: "Peter Smits",
      stars: 3,
      date: "3 weken geleden",
      avatar: "P",
      text: "Prachtige locatie op het landgoed maar de service was wisselvallig. De ene ober was super attent, de andere leek ons te vergeten. Voor zo'n bijzondere omgeving verdient de service meer consistentie.",
    },
    goodResponse:
      "Beste Peter, dank voor uw bezoek aan Zonnestraal en uw opbouwende feedback. U heeft gelijk dat de beleving op zo'n unieke locatie consistent uitstekend moet zijn. We nemen uw opmerking over de wisselende service serieus en bespreken dit met ons team. We hopen u binnenkort terug te zien voor een bezoek dat volledig aan uw verwachtingen voldoet. Met vriendelijke groet, Restaurant Zonnestraal",
  },
  {
    id: "spandershoeve",
    name: "Spandershoeve",
    rating: 5.0,
    reviews: 181,
    review: {
      author: "Annelies Bakker",
      stars: 3,
      date: "1 maand geleden",
      avatar: "A",
      text: "Rustieke sfeer en lekker eten, maar de portiegrootte viel wat tegen voor de prijs. Het vlees was goed bereid maar het bijgerecht was minimaal. Toch een fijne avond gehad dankzij de ambiance.",
    },
    goodResponse:
      "Beste Annelies, hartelijk dank voor uw bezoek aan Spandershoeve en uw eerlijke reactie. Fijn dat u van de sfeer heeft genoten! We nemen uw opmerking over de portiegrootte serieus — voor het prijsniveau dat wij hanteren mag u een royale beleving verwachten. We bespreken dit met onze keuken. We hopen u binnenkort terug te mogen verwelkomen. Met vriendelijke groet, Spandershoeve",
  },
  {
    id: "alivella",
    name: "Pizzeria A'livella",
    rating: 5.0,
    reviews: 150,
    review: {
      author: "Thomas Mulder",
      stars: 2,
      date: "2 weken geleden",
      avatar: "T",
      text: "Pizza was echt lekker maar we moesten 50 minuten wachten zonder uitleg. Het was niet eens bijzonder druk. Uiteindelijk geen excuses aangeboden. De kwaliteit is er maar de organisatie moet beter.",
    },
    goodResponse:
      "Beste Thomas, dank voor uw eerlijke feedback en sorry voor de lange wachttijd zonder uitleg — dat had anders gemoeten. Bij A'livella doen we ons best voor de beste pizza van Hilversum, maar daar hoort ook goede communicatie bij. We bespreken dit direct met ons team. We hopen u binnenkort terug te zien en u een vlekkeloze ervaring te bezorgen. Met vriendelijke groet, Pizzeria A'livella",
  },
  {
    id: "tpandje",
    name: "'t Pandje",
    rating: 4.0,
    reviews: 131,
    review: {
      author: "Roel Janssen",
      stars: 2,
      date: "1 maand geleden",
      avatar: "R",
      text: "Jammer. Gezellige tent maar mijn steak was overdone terwijl ik medium-rare had gevraagd. Personeel reageerde wat onverschillig toen ik dit aangaf. Verwacht dit niet voor €28 per gerecht.",
    },
    goodResponse:
      "Beste Roel, dank voor uw eerlijke feedback. Het spijt ons dat uw steak niet op de juiste gaarheid was bereid — dit is precies wat we bij 't Pandje willen voorkomen. En dat de reactie van ons personeel als onverschillig overkwam, nemen we erg serieus. We bespreken dit intern. Voor het bedrag dat u betaalt mag u de beste service verwachten. We hopen u een tweede kans te geven. Met vriendelijke groet, 't Pandje",
  },
  {
    id: "brasserie",
    name: "Brasserie Zonnestraal",
    rating: 4.0,
    reviews: null,
    review: {
      author: "Karin van Dijk",
      stars: 2,
      date: "1 week geleden",
      avatar: "K",
      text: "Mooie brasserie maar de bediening was erg traag. We zaten bijna een uur voordat ons hoofdgerecht arriveerde. Het eten zelf was prima maar de avond werd erdoor verpest. Jammer voor zo'n mooie locatie.",
    },
    goodResponse:
      "Beste Karin, dank voor uw bezoek en uw eerlijke reactie. Een wachttijd van een uur voor het hoofdgerecht is onacceptabel — dat begrijpen we volledig. Het spijt ons dat dit uw avond heeft beïnvloed. We hebben dit besproken met ons team en nemen maatregelen. We hopen u binnenkort te mogen verwelkomen voor een beleving die recht doet aan onze mooie locatie. Met vriendelijke groet, Brasserie Zonnestraal",
  },
  {
    id: "mahadev",
    name: "Mahadev Indian Kitchen",
    rating: 4.0,
    reviews: null,
    review: {
      author: "Johan Visser",
      stars: 3,
      date: "2 weken geleden",
      avatar: "J",
      text: "Authentiek Indiaas eten en vriendelijk personeel. Alleen waren sommige gerechten minder gekruid dan verwacht — misschien aangepast voor een Nederlands publiek? Voor echte Indiase smaak had ik meer verwacht.",
    },
    goodResponse:
      "Beste Johan, hartelijk dank voor uw bezoek en uw feedback! We begrijpen uw opmerking over de kruiding — we bieden altijd de mogelijkheid om gerechten op uw gewenste scherpteniveau te bereiden. Vraag gerust bij uw volgende bezoek om 'authentiek gekruid' en ons team zorgt ervoor. We hopen u binnenkort terug te zien! Met vriendelijke groet, Mahadev Indian Kitchen",
  },
  {
    id: "vliegveld",
    name: "Restaurant Vliegveld Hilversum",
    rating: 4.0,
    reviews: null,
    review: {
      author: "Monique Dekker",
      stars: 2,
      date: "3 weken geleden",
      avatar: "M",
      text: "Unieke locatie bij het vliegveldje maar de prijs-kwaliteitverhouding klopt niet. Voor €22 een simpele pasta die je ook thuis maakt. De sfeer is leuk maar het menu moet echt een upgrade krijgen.",
    },
    goodResponse:
      "Beste Monique, dank voor uw bezoek en uw directe feedback. We begrijpen dat u meer verwachtte voor het bedrag dat u betaalde. Uw opmerking over ons menu nemen we serieus — we werken continu aan nieuwe gerechten die recht doen aan onze bijzondere locatie. We hopen u binnenkort te mogen overtuigen met een verbeterd aanbod. Met vriendelijke groet, Restaurant Vliegveld Hilversum",
  },
  {
    id: "nefertiti",
    name: "Pizzeria Nefertiti",
    rating: 4.0,
    reviews: null,
    review: {
      author: "Frank Bosman",
      stars: 2,
      date: "1 maand geleden",
      avatar: "F",
      text: "Pizza was redelijk maar de bezorging duurde 1,5 uur terwijl ze zeiden 45 minuten. Geen update, geen excuses. Pizza was ook lauw aangekomen. Voor bezorging zou ik een andere keuze maken.",
    },
    goodResponse:
      "Beste Frank, onze oprechte excuses voor de vertraagde bezorging en het ontbreken van communicatie hierover — dit is beneden onze standaard. Een lauwe pizza na zolang wachten is begrijpelijk frustrerend. We hebben dit intern besproken en verbeteren onze bezorgplanning. We hopen u een volgende keer beter van dienst te zijn. Met vriendelijke groet, Pizzeria Nefertiti",
  },
];

export function getRestaurant(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}
