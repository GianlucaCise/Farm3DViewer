const FARM_DATA = {
  name: "Sugar Cane Farm Automatica",
  description: "Farm automatica con observer e pistoni. Compatibile Java 1.21+. Produce ~800 canne/ora per sezione da 8.",
  edition: "Java",
  version: "1.21+",
  difficulty: "Facile",
  size: { x: 12, y: 5, z: 4 },

  // Blocchi usati e quantità totali
  materials: [
    { id: "dirt",             name: "Dirt",             qty: 8,  wiki: "Dirt" },
    { id: "grass_block",      name: "Grass Block",      qty: 4,  wiki: "Grass_block" },
    { id: "water",            name: "Water Bucket",     qty: 8,  wiki: "Water" },
    { id: "sugar_cane",       name: "Sugar Cane",       qty: 8,  wiki: "Sugar_cane" },
    { id: "observer",         name: "Observer",         qty: 8,  wiki: "Observer" },
    { id: "piston",           name: "Piston",           qty: 8,  wiki: "Piston" },
    { id: "redstone",         name: "Redstone Dust",    qty: 10, wiki: "Redstone_Dust" },
    { id: "glass",            name: "Glass",            qty: 34, wiki: "Glass" },
    { id: "chest",            name: "Chest",            qty: 2,  wiki: "Chest" },
    { id: "hopper",           name: "Hopper",           qty: 10, wiki: "Hopper" },
    { id: "stone",            name: "Stone",            qty: 20, wiki: "Stone" },
    { id: "powered_rail",     name: "Powered Rail",     qty: 2,  wiki: "Powered_Rail" },
    { id: "rail",             name: "Rail",             qty: 6,  wiki: "Rail" },
    { id: "lever",            name: "Lever",            qty: 1,  wiki: "Lever" },
    { id: "redstone_torch",   name: "Redstone Torch",   qty: 1,  wiki: "Redstone_Torch" },
  ],

  // Steps della guida
  steps: [
    {
      label: "Scava il canale",
      description: "Scava un canale 10x1x1 dove metterai gli hopper. Alla fine metti un doppio chest.",
      layers: [0]
    },
    {
      label: "Metti gli hopper",
      description: "Posiziona 10 hopper nel canale, tutti puntati verso il chest.",
      layers: [0]
    },
    {
      label: "Piazza la dirt e l'acqua",
      description: "Sopra ogni hopper metti un blocco di dirt. Accanto ad ogni dirt metti una sorgente d'acqua.",
      layers: [1]
    },
    {
      label: "Pianta le canne",
      description: "Pianta una sugar cane su ogni blocco di dirt (devono essere adiacenti all'acqua).",
      layers: [1, 2]
    },
    {
      label: "Posiziona i pistoni",
      description: "Metti un piston rivolto verso ogni canna all'altezza del secondo blocco (layer 2).",
      layers: [2]
    },
    {
      label: "Posiziona gli observer",
      description: "Metti un observer sopra ogni canna, rivolto verso il basso per rilevare la crescita.",
      layers: [3]
    },
    {
      label: "Collega il redstone",
      description: "Collega ogni observer al piston corrispondente con dust di redstone sui blocchi posteriori.",
      layers: [3, 4]
    },
    {
      label: "Chiudi con il vetro",
      description: "Metti il vetro attorno a tutta la farm per impedire alle canne di volare via.",
      layers: [1, 2, 3, 4]
    },
  ],

  // Struttura 3D: array di layer (Y), ogni layer è array di righe (Z), ogni riga è array di blocchi (X)
  // null = aria, stringa = block id
  layers: [
    // Layer 0 - fondamenta: hopper + chest
    [
      ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
      ["stone","hopper","hopper","hopper","hopper","hopper","hopper","hopper","hopper","chest","chest","stone"],
      ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
      ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
    ],
    // Layer 1 - dirt + acqua
    [
      ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
      ["stone","dirt","water","dirt","water","dirt","water","dirt","water","dirt","water","stone"],
      [null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null],
    ],
    // Layer 2 - canne da zucchero + pistoni
    [
      ["stone","piston","stone","piston","stone","piston","stone","piston","stone","piston","stone","stone"],
      ["stone","sugar_cane","glass","sugar_cane","glass","sugar_cane","glass","sugar_cane","glass","sugar_cane","glass","stone"],
      ["stone","glass","glass","glass","glass","glass","glass","glass","glass","glass","glass","stone"],
      [null,null,null,null,null,null,null,null,null,null,null,null],
    ],
    // Layer 3 - observer + redstone
    [
      ["stone","observer","redstone","observer","redstone","observer","redstone","observer","redstone","observer","redstone","stone"],
      ["stone","glass","glass","glass","glass","glass","glass","glass","glass","glass","glass","stone"],
      ["stone","glass","glass","glass","glass","glass","glass","glass","glass","glass","glass","stone"],
      [null,null,null,null,null,null,null,null,null,null,null,null],
    ],
    // Layer 4 - copertura superiore
    [
      ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
      ["stone","glass","glass","glass","glass","glass","glass","glass","glass","glass","glass","stone"],
      ["stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone","stone"],
      [null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  ]
};
