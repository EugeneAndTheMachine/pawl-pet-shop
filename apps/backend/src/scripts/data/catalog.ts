// Demo catalog for seed-catalog.ts. Brands are real; descriptions, ingredients, kcal and
// feeding guides are written for this demo and are not official manufacturer data.

export type CategorySeed = {
  handle: string
  name: string
  parent?: string
}

export type VariantSeed = {
  value: string
  sku: string
  price: number // VND, tax-inclusive
  stock: number
}

export type ProductSeed = {
  handle: string
  title: string
  brand: string
  categories: string[]
  tags: string[]
  description: string
  option: string
  variants: VariantSeed[]
  ingredients?: string
  kcal_per_kg?: number
  feeding_guide?: string
  bestseller?: boolean
}

export const CATEGORIES: CategorySeed[] = [
  { handle: "cat", name: "Cats" },
  { handle: "cat-dry-food", name: "Dry Food", parent: "cat" },
  { handle: "cat-wet-food", name: "Wet Food", parent: "cat" },
  { handle: "cat-litter", name: "Litter", parent: "cat" },
  { handle: "cat-treats", name: "Treats", parent: "cat" },
  { handle: "cat-supplements", name: "Supplements", parent: "cat" },
  { handle: "cat-accessories", name: "Accessories", parent: "cat" },
  { handle: "dog", name: "Dogs" },
  { handle: "dog-dry-food", name: "Dry Food", parent: "dog" },
  { handle: "dog-wet-food", name: "Wet Food", parent: "dog" },
  { handle: "dog-treats", name: "Treats", parent: "dog" },
  { handle: "dog-supplements", name: "Supplements", parent: "dog" },
  { handle: "dog-accessories", name: "Accessories", parent: "dog" },
]

export const BESTSELLER_COLLECTION = { handle: "best-sellers", title: "Best Sellers" }

export const PRODUCTS: ProductSeed[] = [
  // ---------- Cats · Dry food ----------
  {
    handle: "royal-canin-indoor-27",
    title: "Royal Canin Indoor 27 Adult Cat Food",
    brand: "Royal Canin",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:hairball", "form:dry"],
    description:
      "Dry food for indoor cats with a calmer lifestyle. A balanced fibre blend helps limit hairballs and keeps litter box odour down.",
    option: "Weight",
    variants: [
      { value: "400g", sku: "RC-INDOOR27-400G", price: 145000, stock: 60 },
      { value: "2kg", sku: "RC-INDOOR27-2KG", price: 560000, stock: 25 },
    ],
    ingredients: "Dehydrated poultry protein, rice, maize, animal fats, vegetable fibres, fish oil, vitamins and minerals",
    kcal_per_kg: 3720,
    feeding_guide: "3 kg cat: 45 g/day; 4 kg: 55 g/day; 5 kg: 65 g/day. Split into 2–3 meals and always provide fresh water.",
    bestseller: true,
  },
  {
    handle: "royal-canin-kitten-36",
    title: "Royal Canin Kitten 36",
    brand: "Royal Canin",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:kitten", "form:dry"],
    description:
      "Small, protein-rich kibble for kittens aged 4 to 12 months, supporting healthy growth and a developing immune system.",
    option: "Weight",
    variants: [
      { value: "400g", sku: "RC-KITTEN36-400G", price: 155000, stock: 50 },
      { value: "2kg", sku: "RC-KITTEN36-2KG", price: 595000, stock: 20 },
    ],
    ingredients: "Dehydrated poultry protein, rice, animal fats, egg protein, fish oil, brewer's yeast, vitamins and minerals",
    kcal_per_kg: 4010,
    feeding_guide: "4–6 months: 50–60 g/day; 7–12 months: 55–70 g/day depending on weight. Split into 3–4 meals.",
    bestseller: true,
  },
  {
    handle: "royal-canin-sterilised-37",
    title: "Royal Canin Sterilised 37 for Neutered Cats",
    brand: "Royal Canin",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:sterilised", "health:weight-control", "form:dry"],
    description: "A lower-fat recipe for neutered cats that helps maintain a healthy weight while keeping them satisfied.",
    option: "Weight",
    variants: [
      { value: "400g", sku: "RC-STER37-400G", price: 150000, stock: 45 },
      { value: "2kg", sku: "RC-STER37-2KG", price: 575000, stock: 18 },
    ],
    ingredients: "Dehydrated poultry protein, rice, wheat gluten, vegetable fibres, animal fats, fish oil, L-carnitine, vitamins and minerals",
    kcal_per_kg: 3580,
    feeding_guide: "3 kg cat: 45 g/day; 4 kg: 55 g/day; 5 kg: 62 g/day.",
  },
  {
    handle: "royal-canin-urinary-care",
    title: "Royal Canin Urinary Care",
    brand: "Royal Canin",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:urinary", "form:dry"],
    description: "Balanced minerals and a formula that encourages cats to drink more, supporting a healthy urinary tract.",
    option: "Weight",
    variants: [
      { value: "400g", sku: "RC-URINARY-400G", price: 165000, stock: 30 },
      { value: "2kg", sku: "RC-URINARY-2KG", price: 640000, stock: 0 },
    ],
    ingredients: "Dehydrated poultry protein, rice, maize, animal fats, vegetable fibres, fish oil, balanced minerals, vitamins",
    kcal_per_kg: 3780,
    feeding_guide: "4 kg cat: about 55 g/day. If your cat is being treated for a urinary condition, ask your vet first.",
  },
  {
    handle: "whiskas-adult-ocean-fish",
    title: "Whiskas Adult Ocean Fish",
    brand: "Whiskas",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "free:beef", "form:dry"],
    description: "Crunchy ocean fish kibble for cats over one year old, an affordable choice for everyday meals.",
    option: "Weight",
    variants: [
      { value: "480g", sku: "WK-ADULT-FISH-480G", price: 69000, stock: 120 },
      { value: "1.2kg", sku: "WK-ADULT-FISH-1200G", price: 155000, stock: 80 },
    ],
    ingredients: "Cereals, fish meal, poultry meal, vegetable oil, tuna, vitamins and minerals",
    kcal_per_kg: 3600,
    feeding_guide: "3 kg cat: 50 g/day; 4 kg: 60 g/day; 5 kg: 70 g/day.",
    bestseller: true,
  },
  {
    handle: "me-o-persian",
    title: "Me-O Persian for Long-Haired Cats",
    brand: "Me-O",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:hairball", "health:skin-coat", "form:dry"],
    description: "Kibble for long-haired cats with omega-3 and omega-6 for a glossy coat and help moving hairballs along.",
    option: "Weight",
    variants: [
      { value: "400g", sku: "MEO-PERSIAN-400G", price: 65000, stock: 70 },
      { value: "1.1kg", sku: "MEO-PERSIAN-1100G", price: 150000, stock: 40 },
    ],
    ingredients: "Rice, poultry meal, fish meal, chicken fat, fibre, fish oil, taurine, vitamins and minerals",
    kcal_per_kg: 3650,
    feeding_guide: "3 kg cat: 45 g/day; 4 kg: 55 g/day.",
  },
  {
    handle: "catsrang-all-life-stages",
    title: "Catsrang All Life Stages",
    brand: "Catsrang",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:all", "form:dry"],
    description: "One kibble for cats of every age, handy for multi-cat homes.",
    option: "Weight",
    variants: [
      { value: "1.5kg", sku: "CATSRANG-ALS-1500G", price: 165000, stock: 50 },
      { value: "5kg", sku: "CATSRANG-ALS-5KG", price: 480000, stock: 15 },
    ],
    ingredients: "Chicken meal, rice, maize, fish meal, chicken fat, tuna, taurine, vitamins and minerals",
    kcal_per_kg: 3700,
    feeding_guide: "Kittens: 40–60 g/day; adult cat 4 kg: 55–60 g/day.",
    bestseller: true,
  },
  {
    handle: "reflex-plus-salmon",
    title: "Reflex Plus Adult Salmon",
    brand: "Reflex Plus",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:sensitive-stomach", "free:chicken", "free:beef", "form:dry"],
    description: "Salmon as the main protein, suited to cats with sensitive digestion or an intolerance to chicken.",
    option: "Weight",
    variants: [{ value: "1.5kg", sku: "REFLEX-SALMON-1500G", price: 230000, stock: 35 }],
    ingredients: "Dried salmon, rice, fish meal, salmon oil, beet pulp, prebiotic FOS, vitamins and minerals",
    kcal_per_kg: 3850,
    feeding_guide: "3 kg cat: 45 g/day; 4 kg: 55 g/day; 5 kg: 65 g/day.",
  },

  // ---------- Cats · Wet food ----------
  {
    handle: "whiskas-tuna-pouch",
    title: "Whiskas Tuna Pouch 85g",
    brand: "Whiskas",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "life:adult", "free:beef", "form:wet"],
    description: "Soft tuna pâté for a complete meal, or mix it with kibble to make dinner more tempting.",
    option: "Pack",
    variants: [
      { value: "1 pouch (85g)", sku: "WK-PATE-TUNA-1", price: 15000, stock: 300 },
      { value: "Box of 12", sku: "WK-PATE-TUNA-12", price: 165000, stock: 40 },
    ],
    ingredients: "Tuna, poultry, water, thickener, taurine, vitamins and minerals",
    kcal_per_kg: 850,
    feeding_guide: "4 kg cat: 3–4 pouches/day on wet food only; with kibble, 1 pouch/day and 15 g less kibble.",
    bestseller: true,
  },
  {
    handle: "me-o-kitten-tuna-pouch",
    title: "Me-O Kitten Tuna Pouch 80g",
    brand: "Me-O",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "life:kitten", "free:beef", "form:wet"],
    description: "Smooth pâté for kittens, easy to eat while they move from milk to solid food.",
    option: "Pack",
    variants: [
      { value: "1 pouch (80g)", sku: "MEO-PATE-KIT-1", price: 13000, stock: 250 },
      { value: "Box of 12", sku: "MEO-PATE-KIT-12", price: 145000, stock: 30 },
    ],
    ingredients: "Tuna, chicken, water, DHA, taurine, vitamins and minerals",
    kcal_per_kg: 820,
    feeding_guide: "Kittens 1–2 kg: 2–3 pouches/day, in several small meals.",
  },
  {
    handle: "royal-canin-instinctive-pouch",
    title: "Royal Canin Instinctive Adult Pouch 85g",
    brand: "Royal Canin",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "life:adult", "form:wet"],
    description: "A fine pâté with the protein and fat balance adult cats instinctively prefer.",
    option: "Pack",
    variants: [
      { value: "1 pouch (85g)", sku: "RC-INST-PATE-1", price: 32000, stock: 150 },
      { value: "Box of 12", sku: "RC-INST-PATE-12", price: 360000, stock: 20 },
    ],
    ingredients: "Meat and animal derivatives, fish, cereals, minerals, sugars, vitamins",
    kcal_per_kg: 880,
    feeding_guide: "4 kg cat: 4 pouches/day on wet food only.",
  },
  {
    handle: "nekko-tuna-crab-jelly",
    title: "Nekko Tuna & Crab Stick in Jelly 70g",
    brand: "Nekko",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "life:adult", "free:beef", "free:grain", "form:wet"],
    description: "Tuna chunks and crab stick in jelly, made without grains.",
    option: "Pack",
    variants: [
      { value: "1 pouch (70g)", sku: "NEKKO-TUNA-CRAB-1", price: 16000, stock: 200 },
      { value: "Box of 12", sku: "NEKKO-TUNA-CRAB-12", price: 180000, stock: 25 },
    ],
    ingredients: "Tuna, crab stick, fish broth, gelling agent, taurine, vitamin E",
    kcal_per_kg: 780,
    feeding_guide: "1–2 pouches/day with kibble, or 4 pouches/day for a 4 kg cat on wet food only.",
  },

  // ---------- Cats · Litter ----------
  {
    handle: "kit-cat-soya-clump",
    title: "Kit Cat Soya Clump Litter 7L",
    brand: "Kit Cat",
    categories: ["cat-litter"],
    tags: ["species:cat", "life:all", "form:litter"],
    description: "Made from soybean fibre: clumps fast, low dust, and small amounts can be flushed.",
    option: "Scent",
    variants: [
      { value: "Unscented", sku: "KITCAT-SOYA-ORIG", price: 145000, stock: 60 },
      { value: "Green tea", sku: "KITCAT-SOYA-GTEA", price: 150000, stock: 45 },
      { value: "Peach", sku: "KITCAT-SOYA-PEACH", price: 150000, stock: 30 },
    ],
    bestseller: true,
  },
  {
    handle: "ever-clean-extra-strength",
    title: "Ever Clean Extra Strength Clay Litter",
    brand: "Ever Clean",
    categories: ["cat-litter"],
    tags: ["species:cat", "life:all", "form:litter"],
    description: "Hard-clumping bentonite with activated carbon odour control, great for multi-cat homes.",
    option: "Volume",
    variants: [
      { value: "6L", sku: "EVERCLEAN-ES-6L", price: 260000, stock: 25 },
      { value: "10L", sku: "EVERCLEAN-ES-10L", price: 390000, stock: 15 },
    ],
  },
  {
    handle: "pawl-basics-silica-litter",
    title: "Pawl Basics Silica Crystal Litter 5L",
    brand: "Pawl Basics",
    categories: ["cat-litter"],
    tags: ["species:cat", "life:all", "form:litter"],
    description: "Silica crystals absorb moisture fast and change colour when it's time to replace. One bag lasts 3–4 weeks for one cat.",
    option: "Pack",
    variants: [{ value: "5L bag", sku: "PAWL-SILICA-5L", price: 120000, stock: 80 }],
  },

  // ---------- Cats · Treats ----------
  {
    handle: "ciao-churu-tuna",
    title: "Ciao Churu Tuna Lickable Treat",
    brand: "Ciao",
    categories: ["cat-treats"],
    tags: ["species:cat", "life:all", "free:beef", "free:grain", "form:treat"],
    description: "A creamy treat served straight from the tube, perfect for giving medicine or bonding with a new cat.",
    option: "Pack",
    variants: [
      { value: "4 tubes x 14g", sku: "CHURU-TUNA-4", price: 45000, stock: 200 },
      { value: "Box of 20 tubes", sku: "CHURU-TUNA-20", price: 210000, stock: 40 },
    ],
    ingredients: "Tuna, tuna extract, thickener, vitamin E, green tea extract",
    kcal_per_kg: 600,
    feeding_guide: "Up to 4 tubes/day for a 4 kg cat. Treats only, not a replacement for meals.",
    bestseller: true,
  },
  {
    handle: "temptations-chicken",
    title: "Temptations Chicken Treats 85g",
    brand: "Temptations",
    categories: ["cat-treats"],
    tags: ["species:cat", "life:adult", "form:treat"],
    description: "Crunchy outside, soft inside, ideal as a reward during training.",
    option: "Pack",
    variants: [{ value: "85g bag", sku: "TEMPT-CHICKEN-85G", price: 65000, stock: 90 }],
    ingredients: "Chicken meal, cereals, animal fat, dried milk, taurine, vitamins",
    kcal_per_kg: 4200,
    feeding_guide: "Up to 15 pieces/day for a 4 kg cat.",
  },
  {
    handle: "greenies-dental-cat",
    title: "Greenies Dental Treats for Cats 60g",
    brand: "Greenies",
    categories: ["cat-treats"],
    tags: ["species:cat", "life:adult", "health:dental", "form:treat"],
    description: "Crunchy texture helps clean away plaque as your cat chews, for fresher breath.",
    option: "Flavour",
    variants: [
      { value: "Chicken", sku: "GREENIES-CAT-CHICKEN", price: 120000, stock: 40 },
      { value: "Salmon", sku: "GREENIES-CAT-SALMON", price: 120000, stock: 35 },
    ],
    ingredients: "Chicken or salmon meal, rice, wheat gluten, fibre, vitamins and minerals",
    kcal_per_kg: 3900,
    feeding_guide: "10 pieces/day for a 4 kg cat, split into 2 servings.",
  },

  // ---------- Cats · Supplements ----------
  {
    handle: "virbac-nutri-plus-gel",
    title: "Virbac Nutri-Plus Gel 120g",
    brand: "Virbac",
    categories: ["cat-supplements", "dog-supplements"],
    tags: ["species:cat", "species:dog", "life:all", "form:supplement"],
    description: "A high-energy vitamin gel for pets with a poor appetite, recovering from illness or expecting.",
    option: "Pack",
    variants: [{ value: "120g tube", sku: "VIRBAC-NUTRI-120G", price: 210000, stock: 30 }],
    ingredients: "Soybean oil, malt, molasses, vitamins A, D3, E and B group, trace minerals",
    feeding_guide: "Cats and small dogs: 1–1.5 cm of gel per day, on the paw or mixed into food.",
  },
  {
    handle: "gimcat-malt-soft",
    title: "GimCat Malt-Soft Hairball Paste",
    brand: "GimCat",
    categories: ["cat-supplements"],
    tags: ["species:cat", "life:adult", "health:hairball", "form:supplement"],
    description: "Malt paste that helps hairballs pass through the gut, especially during shedding season.",
    option: "Pack",
    variants: [
      { value: "50g tube", sku: "GIMCAT-MALT-50G", price: 125000, stock: 40 },
      { value: "100g tube", sku: "GIMCAT-MALT-100G", price: 210000, stock: 25 },
    ],
    ingredients: "Malt extract, vegetable oil, fibre, brewer's yeast, vitamin E",
    feeding_guide: "Adult cats: 2–3 cm per day for 1–2 weeks, then 2–3 times a week.",
  },
  {
    handle: "pawl-basics-omega-3",
    title: "Pawl Basics Omega-3 Fish Oil Capsules",
    brand: "Pawl Basics",
    categories: ["cat-supplements", "dog-supplements"],
    tags: ["species:cat", "species:dog", "life:all", "health:skin-coat", "free:chicken", "free:beef", "free:grain", "form:supplement"],
    description: "Fish oil capsules rich in EPA and DHA for healthy skin and a shiny coat.",
    option: "Pack",
    variants: [
      { value: "60 capsules", sku: "PAWL-OMEGA3-60", price: 180000, stock: 60 },
      { value: "120 capsules", sku: "PAWL-OMEGA3-120", price: 320000, stock: 30 },
    ],
    ingredients: "Deep-sea fish oil (EPA, DHA), vitamin E, gelatin capsule",
    feeding_guide: "Cats and dogs under 10 kg: 1 capsule/day; dogs 10–25 kg: 2 capsules/day. Pierce and squeeze onto food.",
  },

  // ---------- Cats · Accessories ----------
  {
    handle: "pawl-basics-feather-teaser",
    title: "Pawl Basics Feather Teaser Wand",
    brand: "Pawl Basics",
    categories: ["cat-accessories"],
    tags: ["species:cat", "life:all", "form:accessory"],
    description: "A flexible 60 cm wand with feathers and a little bell to keep your cat active and playful.",
    option: "Pack",
    variants: [{ value: "Wand + 2 refills", sku: "PAWL-TEASER-SET", price: 35000, stock: 150 }],
  },
  {
    handle: "pawl-basics-high-wall-litter-tray",
    title: "Pawl Basics High-Wall Litter Tray",
    brand: "Pawl Basics",
    categories: ["cat-accessories"],
    tags: ["species:cat", "life:all", "form:accessory"],
    description: "PP plastic tray with high walls to stop litter scatter, scoop included. Easy to wash and odour-resistant.",
    option: "Size",
    variants: [
      { value: "M (40 x 30 cm)", sku: "PAWL-TRAY-M", price: 150000, stock: 30 },
      { value: "L (50 x 38 cm)", sku: "PAWL-TRAY-L", price: 220000, stock: 20 },
    ],
  },
  {
    handle: "pawl-basics-double-bowl",
    title: "Pawl Basics Non-Slip Double Bowl",
    brand: "Pawl Basics",
    categories: ["cat-accessories"],
    tags: ["species:cat", "life:all", "form:accessory"],
    description: "Two removable stainless steel bowls on a 15° tilted stand, easier on the neck and won't slide around.",
    option: "Pack",
    variants: [{ value: "2 x 200ml bowls", sku: "PAWL-BOWL-DOUBLE", price: 120000, stock: 45 }],
  },

  // ---------- Dogs · Dry food ----------
  {
    handle: "royal-canin-mini-adult",
    title: "Royal Canin Mini Adult Dog Food",
    brand: "Royal Canin",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "form:dry"],
    description: "Small kibble for adult dogs under 10 kg, meeting the high energy needs of small breeds.",
    option: "Weight",
    variants: [
      { value: "800g", sku: "RC-MINIADULT-800G", price: 210000, stock: 40 },
      { value: "2kg", sku: "RC-MINIADULT-2KG", price: 470000, stock: 20 },
    ],
    ingredients: "Rice, dehydrated poultry protein, maize, animal fats, beet pulp, fish oil, vitamins and minerals",
    kcal_per_kg: 3830,
    feeding_guide: "4 kg dog: 70 g/day; 6 kg: 95 g/day; 8 kg: 115 g/day.",
    bestseller: true,
  },
  {
    handle: "pedigree-puppy-chicken-egg-milk",
    title: "Pedigree Puppy Chicken, Egg & Milk",
    brand: "Pedigree",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:puppy", "free:beef", "form:dry"],
    description: "Puppy kibble with added calcium for strong bones and DHA for brain development.",
    option: "Weight",
    variants: [
      { value: "400g", sku: "PED-PUPPY-400G", price: 55000, stock: 100 },
      { value: "1.5kg", sku: "PED-PUPPY-1500G", price: 165000, stock: 50 },
    ],
    ingredients: "Cereals, chicken meal, egg, dried milk, vegetable oil, calcium, DHA, vitamins and minerals",
    kcal_per_kg: 3700,
    feeding_guide: "Puppies 2–5 kg: 60–120 g/day, split into 3–4 meals.",
  },
  {
    handle: "smartheart-adult-roast-beef",
    title: "SmartHeart Adult Roast Beef",
    brand: "SmartHeart",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "free:chicken", "form:dry"],
    description: "Roast beef flavour kibble for adult dogs of all breeds, with a rich taste dogs love.",
    option: "Weight",
    variants: [
      { value: "1.5kg", sku: "SH-ADULT-BEEF-1500G", price: 125000, stock: 60 },
      { value: "3kg", sku: "SH-ADULT-BEEF-3KG", price: 230000, stock: 30 },
    ],
    ingredients: "Maize, rice, beef meal, fish meal, beef fat, vegetable oil, vitamins and minerals",
    kcal_per_kg: 3500,
    feeding_guide: "5 kg dog: 100 g/day; 10 kg: 170 g/day; 20 kg: 280 g/day.",
  },
  {
    handle: "ganador-adult-salmon-rice",
    title: "Ganador Adult Salmon & Rice",
    brand: "Ganador",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "health:skin-coat", "free:chicken", "free:beef", "form:dry"],
    description: "Salmon protein rich in omega-3 for skin and coat, suited to dogs that don't tolerate chicken or beef.",
    option: "Weight",
    variants: [
      { value: "1.5kg", sku: "GANADOR-SALMON-1500G", price: 145000, stock: 45 },
      { value: "3kg", sku: "GANADOR-SALMON-3KG", price: 275000, stock: 20 },
    ],
    ingredients: "Rice, salmon meal, fish meal, fish oil, beet pulp, vitamins and minerals",
    kcal_per_kg: 3600,
    feeding_guide: "5 kg dog: 95 g/day; 10 kg: 160 g/day; 20 kg: 270 g/day.",
  },
  {
    handle: "royal-canin-mini-light",
    title: "Royal Canin Mini Light Weight Care",
    brand: "Royal Canin",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "health:weight-control", "health:sterilised", "form:dry"],
    description: "Reduced-calorie kibble for small dogs prone to weight gain or neutered.",
    option: "Weight",
    variants: [{ value: "1kg", sku: "RC-MINILIGHT-1KG", price: 280000, stock: 15 }],
    ingredients: "Rice, dehydrated poultry protein, vegetable fibres, maize gluten, animal fats, L-carnitine, vitamins and minerals",
    kcal_per_kg: 3400,
    feeding_guide: "4 kg dog: 60 g/day; 6 kg: 80 g/day; 8 kg: 100 g/day.",
  },

  // ---------- Dogs · Wet food ----------
  {
    handle: "pedigree-beef-pouch",
    title: "Pedigree Beef in Gravy Pouch 130g",
    brand: "Pedigree",
    categories: ["dog-wet-food"],
    tags: ["species:dog", "life:adult", "form:wet"],
    description: "Tender beef chunks in gravy. Mix with kibble for a more exciting bowl.",
    option: "Pack",
    variants: [
      { value: "1 pouch (130g)", sku: "PED-PATE-BEEF-1", price: 22000, stock: 200 },
      { value: "Box of 12", sku: "PED-PATE-BEEF-12", price: 250000, stock: 25 },
    ],
    ingredients: "Beef, poultry, gravy, cereals, vitamins and minerals",
    kcal_per_kg: 900,
    feeding_guide: "5 kg dog: 1 pouch plus 70 g kibble per day.",
    bestseller: true,
  },
  {
    handle: "royal-canin-mini-adult-wet",
    title: "Royal Canin Mini Adult Pouch 85g",
    brand: "Royal Canin",
    categories: ["dog-wet-food"],
    tags: ["species:dog", "life:adult", "form:wet"],
    description: "Chunks in gravy for adult small-breed dogs.",
    option: "Pack",
    variants: [
      { value: "1 pouch (85g)", sku: "RC-MINI-WET-1", price: 32000, stock: 120 },
      { value: "Box of 12", sku: "RC-MINI-WET-12", price: 360000, stock: 15 },
    ],
    ingredients: "Meat and animal derivatives, cereals, minerals, fish oil, vitamins",
    kcal_per_kg: 820,
    feeding_guide: "4 kg dog: 1 pouch plus 55 g kibble per day.",
  },

  // ---------- Dogs · Treats ----------
  {
    handle: "pedigree-dentastix-small",
    title: "Pedigree Dentastix for Small Dogs",
    brand: "Pedigree",
    categories: ["dog-treats"],
    tags: ["species:dog", "life:adult", "health:dental", "form:treat"],
    description: "X-shaped chews that reduce plaque and tartar build-up when chewed daily.",
    option: "Pack",
    variants: [
      { value: "7 sticks", sku: "PED-DENTA-S-7", price: 75000, stock: 80 },
      { value: "28 sticks", sku: "PED-DENTA-S-28", price: 260000, stock: 20 },
    ],
    ingredients: "Rice flour, starch, glycerin, poultry meal, fibre, zinc sulphate, green tea extract",
    kcal_per_kg: 2900,
    feeding_guide: "Dogs 5–10 kg: 1 stick per day.",
  },
  {
    handle: "jerhigh-chicken",
    title: "Jerhigh Chicken Sticks 70g",
    brand: "Jerhigh",
    categories: ["dog-treats"],
    tags: ["species:dog", "life:all", "free:beef", "form:treat"],
    description: "Soft chicken sticks that are easy to break into pieces for training rewards.",
    option: "Pack",
    variants: [{ value: "70g bag", sku: "JERHIGH-CHICKEN-70G", price: 45000, stock: 100 }],
    ingredients: "Chicken, starch, glycerin, salt, vitamin E",
    kcal_per_kg: 3100,
    feeding_guide: "5 kg dog: up to 3 sticks per day.",
  },

  // ---------- Dogs · Supplements ----------
  {
    handle: "pawl-basics-puppy-calcium",
    title: "Pawl Basics Calcium Chews for Puppies",
    brand: "Pawl Basics",
    categories: ["dog-supplements"],
    tags: ["species:dog", "life:puppy", "form:supplement"],
    description: "Chewable tablets with calcium, phosphorus and vitamin D3 for growing puppies.",
    option: "Pack",
    variants: [{ value: "100 chews", sku: "PAWL-CALCIUM-100", price: 150000, stock: 40 }],
    ingredients: "Calcium carbonate, dicalcium phosphate, vitamin D3, liver powder, brewer's yeast",
    feeding_guide: "Puppies under 5 kg: 1 chew/day; 5–15 kg: 2 chews/day.",
  },

  // ---------- Dogs · Accessories ----------
  {
    handle: "pawl-basics-reflective-leash-set",
    title: "Pawl Basics Reflective Leash & Collar Set",
    brand: "Pawl Basics",
    categories: ["dog-accessories"],
    tags: ["species:dog", "life:all", "form:accessory"],
    description: "Nylon leash and collar with reflective stitching and a sturdy buckle for safe evening walks.",
    option: "Size",
    variants: [
      { value: "S (neck 25–35 cm)", sku: "PAWL-LEASH-S", price: 120000, stock: 30 },
      { value: "M (neck 35–45 cm)", sku: "PAWL-LEASH-M", price: 140000, stock: 25 },
      { value: "L (neck 45–55 cm)", sku: "PAWL-LEASH-L", price: 160000, stock: 15 },
    ],
  },
  {
    handle: "kong-classic",
    title: "KONG Classic Chew Toy",
    brand: "KONG",
    categories: ["dog-accessories"],
    tags: ["species:dog", "life:all", "form:accessory"],
    description: "Natural rubber toy with an unpredictable bounce. Stuff it with food or treats for longer solo play.",
    option: "Size",
    variants: [
      { value: "S", sku: "KONG-CLASSIC-S", price: 220000, stock: 20 },
      { value: "M", sku: "KONG-CLASSIC-M", price: 290000, stock: 15 },
    ],
  },
]
