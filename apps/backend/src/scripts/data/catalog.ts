// Product catalog for seed-catalog.ts, built from the product photos and notes in materials/Items.
// Descriptions are condensed from those notes; unverifiable medical claims were left out.
// Prices, pack sizes and stock levels are set for this demo shop.

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
  brand?: string
  categories: string[]
  tags: string[]
  description: string
  option: string
  variants: VariantSeed[]
  /** Product photo, relative to materials/Items at the repo root (.jpg/.jpeg/.png/.webp) */
  image: string
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
    handle: "blue-buffalo-tastefuls-sensitive-stomach-cat",
    title: "Blue Buffalo Tastefuls Sensitive Stomach Adult Dry Cat Food, Chicken & Brown Rice",
    brand: "Blue Buffalo",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:sensitive-stomach", "health:skin-coat", "form:dry"],
    description:
      "Gentle kibble for indoor adult cats with a sensitive stomach, developed by veterinarians and animal nutritionists.\n" +
      "• Real chicken is the first ingredient for strong muscles and steady energy\n" +
      "• FOS prebiotic and brown rice support easy, regular digestion\n" +
      "• LifeSource Bits add antioxidants, vitamins and minerals for immune health\n" +
      "• Omega-3 and omega-6 fatty acids for healthy skin and a shiny coat",
    option: "Weight",
    variants: [
      { value: "1.36kg (3 lb)", sku: "BB-TF-SENS-CAT-3LB", price: 420000, stock: 40 },
      { value: "3.18kg (7 lb)", sku: "BB-TF-SENS-CAT-7LB", price: 890000, stock: 25 },
      { value: "6.8kg (15 lb)", sku: "BB-TF-SENS-CAT-15LB", price: 1690000, stock: 10 },
    ],
    ingredients: "Deboned chicken, brown rice and other wholesome grains, FOS (prebiotic), LifeSource Bits (antioxidants, vitamins, minerals), omega-3 and omega-6 fatty acids",
    image: "Cats/Dry food/Blue Buffalo Tastefuls Chicken Adult Sensitive Stomach Dry Cat Food.jpg",
  },
  {
    handle: "go-solutions-sensitivities-salmon-cat",
    title: "Go! Solutions Sensitivities Limited Ingredient Salmon Dry Cat Food",
    brand: "Go! Solutions",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:all", "health:sensitive-stomach", "free:chicken", "free:beef", "free:grain", "form:dry"],
    description:
      "A limited-ingredient, chicken-free recipe for cats with food sensitivities and fussy appetites.\n" +
      "• Salmon is the first ingredient and the only animal protein\n" +
      "• As few key ingredients as possible to limit common intolerance triggers\n" +
      "• Prebiotic fibre from dried chicory root for healthy gut bacteria\n" +
      "• Grain-free and gluten-free, with no corn, wheat, soy, by-product meals or artificial preservatives\n" +
      "• Complete and balanced for kittens, adults and senior cats",
    option: "Weight",
    variants: [
      { value: "1.36kg (3 lb)", sku: "GO-SENS-SALMON-CAT-3LB", price: 520000, stock: 30 },
      { value: "3.63kg (8 lb)", sku: "GO-SENS-SALMON-CAT-8LB", price: 1150000, stock: 12 },
    ],
    ingredients: "Salmon (single animal protein), dried chicory root (prebiotic fibre). No grains, gluten, chicken, corn, wheat or soy",
    image: "Cats/Dry food/Go! Solutions Sensitivities Limited Ingredient Salmon Dry Cat Food.jpg",
  },
  {
    handle: "hills-science-diet-perfect-weight-cat",
    title: "Hill's Science Diet Adult Perfect Weight Dry Cat Food",
    brand: "Hill's Science Diet",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:weight-control", "form:dry"],
    description:
      "A weight-management formula for overweight adult cats that supports a healthy metabolism.\n" +
      "• Designed for safe weight loss, with visible results in about 10 weeks\n" +
      "• Natural ingredients plus added vitamins, minerals and amino acids\n" +
      "• From the brand most recommended by US veterinarians\n" +
      "• Made in the USA",
    option: "Weight",
    variants: [
      { value: "1.36kg (3 lb)", sku: "HILLS-PW-CAT-3LB", price: 480000, stock: 35 },
      { value: "3.18kg (7 lb)", sku: "HILLS-PW-CAT-7LB", price: 990000, stock: 20 },
      { value: "6.8kg (15 lb)", sku: "HILLS-PW-CAT-15LB", price: 1890000, stock: 8 },
    ],
    feeding_guide: "Ask your vet for a target weight, then feed the amount on the bag for that weight and weigh your cat every 2–4 weeks.",
    image: "Cats/Dry food/Hill's Science Diet Adult Perfect Weight Dry Cat Food.jpg",
  },
  {
    handle: "iams-proactive-health-indoor-cat",
    title: "IAMS Proactive Health Indoor Weight & Hairball Care Dry Cat Food, Chicken & Turkey",
    brand: "IAMS",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:hairball", "health:weight-control", "form:dry"],
    description:
      "Everyday kibble for indoor adult cats, built around five key areas of feline health.\n" +
      "• Real chicken and turkey are the first ingredients\n" +
      "• A fibre blend with beet pulp helps reduce hairballs before they start\n" +
      "• L-carnitine helps burn fat for energy and keep a healthy weight\n" +
      "• Wholesome grains provide carbohydrates for healthy energy",
    option: "Weight",
    variants: [
      { value: "7.26kg (16 lb)", sku: "IAMS-INDOOR-CAT-16LB", price: 1250000, stock: 15 },
      { value: "9.98kg (22 lb)", sku: "IAMS-INDOOR-CAT-22LB", price: 1590000, stock: 0 },
    ],
    ingredients: "Chicken, turkey, wholesome grains, beet pulp fibre blend, L-carnitine, vitamins and minerals",
    image: "Cats/Dry food/IAMS Proactive Health Indoor Dry Cat Food, Chicken & Turkey.png",
    bestseller: true,
  },
  {
    handle: "purina-one-sensitive-skin-stomach-cat",
    title: "Purina ONE Sensitive Skin & Stomach Adult Dry Cat Food, Turkey",
    brand: "Purina ONE",
    categories: ["cat-dry-food"],
    tags: ["species:cat", "life:adult", "health:sensitive-stomach", "health:skin-coat", "form:dry"],
    description:
      "High-protein kibble for adult cats with sensitive systems.\n" +
      "• Real turkey is the first ingredient, supporting strong muscles and a healthy heart\n" +
      "• Easily digestible formula with added prebiotic fibre\n" +
      "• Crunchy bites with calcium for strong teeth and healthy gums\n" +
      "• Four antioxidant sources support the immune system\n" +
      "• No artificial flavours or preservatives",
    option: "Weight",
    variants: [
      { value: "1.59kg (3.5 lb)", sku: "P1-SENS-CAT-3_5LB", price: 390000, stock: 50 },
      { value: "3.18kg (7 lb)", sku: "P1-SENS-CAT-7LB", price: 720000, stock: 25 },
    ],
    ingredients: "Turkey, prebiotic fibre, calcium, four antioxidant sources, vitamins and minerals",
    image: "Cats/Dry food/Purina ONE Sensitive Skin and Stomach Dry Cat Food.png",
    bestseller: true,
  },

  // ---------- Cats · Wet food ----------
  {
    handle: "blue-buffalo-tastefuls-flaked-variety-pack",
    title: "Blue Buffalo Tastefuls Flaked Wet Cat Food Variety Pack",
    brand: "Blue Buffalo",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "life:adult", "health:urinary", "health:skin-coat", "form:wet"],
    description:
      "Three recipes of tender flakes in savoury gravy for adult cats, including picky eaters.\n" +
      "• Real tuna, chicken or whitefish is the first ingredient\n" +
      "• High moisture supports daily hydration and urinary tract health\n" +
      "• Fish oil adds omega-3 for healthy skin and a shiny coat\n" +
      "• No poultry by-product meals, corn, wheat, soy, artificial flavours or preservatives\n" +
      "• Meets AAFCO nutrient profiles for adult cats",
    option: "Pack",
    variants: [
      { value: "12 cans x 85g", sku: "BB-TF-FLAKED-12", price: 520000, stock: 30 },
      { value: "24 cans x 85g", sku: "BB-TF-FLAKED-24", price: 990000, stock: 15 },
    ],
    ingredients: "Tuna, chicken or whitefish (by recipe), broth, fish oil, vitamins and minerals",
    image: "Cats/Wet food/Blue Buffalo Tastefuls Variety Pack Flaked Wet Cat Food.jpg",
  },
  {
    handle: "koha-limited-ingredient-rabbit-pate-cat",
    title: "KOHA Limited Ingredient Diet Rabbit Pâté Wet Cat Food",
    brand: "KOHA",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "health:sensitive-stomach", "health:urinary", "free:chicken", "free:beef", "free:fish", "free:grain", "form:wet"],
    description:
      "A single-protein rabbit pâté for cats with strong food sensitivities or a delicate stomach.\n" +
      "• 96% meat: moisture-rich, high in protein and low in carbohydrates\n" +
      "• Rabbit is a novel protein, lowering the risk of food allergies\n" +
      "• Pumpkin for digestion and cranberries for urinary tract health\n" +
      "• Grain-free with no unnecessary fillers. Made in the USA",
    option: "Pack",
    variants: [
      { value: "24 cans x 85g (3 oz)", sku: "KOHA-RABBIT-3OZ-24", price: 1150000, stock: 12 },
      { value: "24 cans x 156g (5.5 oz)", sku: "KOHA-RABBIT-5_5OZ-24", price: 1790000, stock: 8 },
    ],
    ingredients: "Rabbit (96% meat), pumpkin, cranberries, vitamins and minerals",
    image: "Cats/Wet food/KOHA Limited Ingredient Diet Rabbit Pate Wet Cat Food.jpg",
  },
  {
    handle: "natural-balance-platefulls-chicken-pumpkin",
    title: "Natural Balance Platefulls Chicken & Pumpkin Chunks in Gravy Wet Cat Food",
    brand: "Natural Balance",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "life:adult", "health:sensitive-stomach", "health:skin-coat", "free:grain", "form:wet"],
    description:
      "Grain-free chunks in savoury gravy for adult cats, served as a full meal or a topper.\n" +
      "• Real chicken is the first ingredient for strong muscles\n" +
      "• Vegetables such as pumpkin give grain-free fibre for healthy digestion\n" +
      "• Taurine supports heart health; omega-3 and omega-6 for skin and coat\n" +
      "• Free from wheat and soy",
    option: "Pack",
    variants: [
      { value: "1 pouch (85g)", sku: "NB-PLATEFULLS-CHK-1", price: 35000, stock: 150 },
      { value: "Box of 24 pouches", sku: "NB-PLATEFULLS-CHK-24", price: 790000, stock: 15 },
    ],
    ingredients: "Chicken, pumpkin and other vegetables, gravy, taurine, omega-3 and omega-6 fatty acids, vitamins and minerals",
    image: "Cats/Wet food/Natural Balance Platefulls Chunks in Gravy, Chicken & Pumpkin.jpg",
  },
  {
    handle: "fancy-feast-classic-pate-whitefish-tuna",
    title: "Purina Fancy Feast Classic Pâté Wet Cat Food, Ocean Whitefish & Tuna",
    brand: "Purina Fancy Feast",
    categories: ["cat-wet-food"],
    tags: ["species:cat", "life:adult", "form:wet"],
    description:
      "A smooth gourmet pâté that is 100% complete and balanced for adult cats.\n" +
      "• Real ocean whitefish is the first ingredient\n" +
      "• Protein-rich recipe with a savoury gravy\n" +
      "• No artificial colours or preservatives",
    option: "Pack",
    variants: [
      { value: "1 can (85g)", sku: "FF-PATE-WFTUNA-1", price: 28000, stock: 200 },
      { value: "Box of 24 cans", sku: "FF-PATE-WFTUNA-24", price: 620000, stock: 20 },
    ],
    ingredients: "Ocean whitefish, tuna, gravy, vitamins and minerals",
    image: "Cats/Wet food/Purina Fancy Feast Classic Pate, Ocean Whitefish & Tuna.jpg",
    bestseller: true,
  },

  // ---------- Cats · Litter ----------
  {
    handle: "boxie-probiotic-clumping-litter",
    title: "Boxie Probiotic Clumping Cat Litter, Unscented",
    brand: "Boxie",
    categories: ["cat-litter"],
    tags: ["species:cat", "life:all", "form:litter"],
    description:
      "Clay litter with probiotics that keep working between scoops for 40+ days of odour control.\n" +
      "• Hard, flat-top clumps stay on the surface for fast scooping\n" +
      "• 99.9% dust-free for cleaner pouring and scooping\n" +
      "• Unscented: no added fragrance or fillers",
    option: "Weight",
    variants: [{ value: "18kg (40 lb)", sku: "BOXIE-PROBIOTIC-40LB", price: 890000, stock: 20 }],
    image: "Cats/Litter/Boxie Probiotic Clumping Cat Litter 40+ Day Odor Control Dust.jpg",
  },
  {
    handle: "dr-elseys-ultra-unscented-litter",
    title: "Dr. Elsey's Ultra Unscented Clumping Clay Cat Litter",
    brand: "Dr. Elsey's",
    categories: ["cat-litter"],
    tags: ["species:cat", "life:all", "form:litter"],
    description:
      "100% bentonite clay litter with a medium grain that clumps hard and stays in the box.\n" +
      "• 99.9% dust-free and hypoallergenic, good for cats and owners with allergies\n" +
      "• Hard clumps keep moisture away from the bottom of the tray\n" +
      "• Odour control for single- and multi-cat homes\n" +
      "• Low tracking",
    option: "Weight",
    variants: [{ value: "18kg (40 lb)", sku: "DRELSEY-ULTRA-18KG", price: 790000, stock: 25 }],
    image: "Cats/Litter/Dr. Elsey's Ultra UnScented Clumping Clay Cat Litter.jpg",
    bestseller: true,
  },
  {
    handle: "prettylitter-health-monitoring-lotus",
    title: "PrettyLitter Health Monitoring Cat Litter, Lotus Flower",
    brand: "PrettyLitter",
    categories: ["cat-litter"],
    tags: ["species:cat", "life:all", "health:urinary", "form:litter"],
    description:
      "Silica gel litter that changes colour to help you spot possible health issues early.\n" +
      "• Colour changes with urine pH and visible blood, an early hint of problems such as UTIs or bladder crystals\n" +
      "• Crystals trap urine and dry out waste; lotus flower botanicals keep the air fresh\n" +
      "• Lasts up to twice as long as clumping clay: just scoop the poop\n" +
      "• Low dust, low tracking, works in regular and self-cleaning litter boxes\n" +
      "• One 2.7kg bag lasts about a month for one cat",
    option: "Pack",
    variants: [
      { value: "1 bag 2.7kg (6 lb)", sku: "PRETTY-LOTUS-1", price: 450000, stock: 30 },
      { value: "2 bags 2.7kg (6 lb)", sku: "PRETTY-LOTUS-2", price: 860000, stock: 15 },
    ],
    image: "Cats/Litter/PrettyLitter Health Monitoring Cat Litter, Lotus Flower.jpg",
  },
  {
    handle: "soysand-tofu-cat-litter-unscented",
    title: "SoySand Tofu Cat Litter, Unscented",
    brand: "SoySand",
    categories: ["cat-litter"],
    tags: ["species:cat", "life:all", "form:litter"],
    description:
      "Plant-based litter made from tofu and pea husk that looks and feels like traditional litter.\n" +
      "• Fast, tight clumps for easy scooping and less waste\n" +
      "• Naturally acidic soy neutralises ammonia odour\n" +
      "• Virtually dust-free and low tracking\n" +
      "• Works in many self-cleaning boxes; small amounts are flushable where allowed\n" +
      "• One 4.5kg box lasts one cat up to 8 weeks",
    option: "Weight",
    variants: [{ value: "4.5kg (10 lb)", sku: "SOYSAND-TOFU-10LB", price: 320000, stock: 40 }],
    ingredients: "Tofu (soy), pea husk",
    image: "Cats/Litter/Tofu Cat Litter - 10lb Unscented.jpg",
  },

  // ---------- Cats · Treats ----------
  {
    handle: "carmelie-hairball-support-chews",
    title: "Carmelie Hairball Support Chews for Cats, Chicken & Krill",
    brand: "Carmelie",
    categories: ["cat-treats"],
    tags: ["species:cat", "life:all", "health:hairball", "health:skin-coat", "form:treat"],
    description:
      "Crunchy chews with a creamy centre for cats that groom a lot, especially indoor cats.\n" +
      "• Fibre blend helps swallowed fur pass naturally with normal stools\n" +
      "• Supports skin and coat so less loose fur is swallowed during grooming\n" +
      "• Chicken and krill flavour that picky eaters accept\n" +
      "• 500 chews per tub, for single- or multi-cat homes",
    option: "Pack",
    variants: [{ value: "500 chews (226g)", sku: "CARMELIE-HAIRBALL-500", price: 450000, stock: 35 }],
    feeding_guide: "Give daily as part of the grooming routine; follow the serving size for your cat's weight on the tub.",
    image: "Cats/Dry food/Hairball Treatment for Cats, Hairball Remedy Cat Treats.png",
  },
  {
    handle: "pawup-freeze-dried-quail-egg-yolk",
    title: "PAWUP Freeze-Dried Quail Egg Yolk Treats for Cats & Dogs",
    brand: "PAWUP",
    categories: ["cat-treats", "dog-treats"],
    tags: ["species:cat", "species:dog", "life:all", "free:chicken", "free:beef", "free:fish", "free:grain", "form:treat"],
    description:
      "Single-ingredient treats made only from the yolks of free-range quail eggs.\n" +
      "• Freeze-drying keeps up to 96% of the nutrients of fresh yolks\n" +
      "• High-quality protein with no artificial additives\n" +
      "• Rawhide-free, grain-free and gluten-free\n" +
      "• Serve whole, crumble over meals as a topper, or rehydrate",
    option: "Weight",
    variants: [
      { value: "120g (4.2 oz)", sku: "PAWUP-QUAIL-120G", price: 260000, stock: 40 },
      { value: "260g (9.2 oz)", sku: "PAWUP-QUAIL-260G", price: 490000, stock: 20 },
    ],
    ingredients: "Freeze-dried quail egg yolk",
    image: "Cats/Dry food/PAWUP Freeze Dried Cat Treats, Quail Egg Yolk.jpg",
  },
  {
    handle: "beloved-pets-freeze-dried-chicken-breast",
    title: "Beloved Pets Freeze-Dried Chicken Breast Treats for Cats & Dogs",
    brand: "Beloved Pets",
    categories: ["cat-treats", "dog-treats"],
    tags: ["species:cat", "species:dog", "life:all", "health:skin-coat", "free:beef", "free:fish", "free:grain", "form:treat"],
    description:
      "Bite-size cubes of 100% chicken breast for cats and small dogs, great for picky eaters.\n" +
      "• Single ingredient, freeze-dried to lock in nutrients and flavour\n" +
      "• High in protein, with natural amino acids for healthy skin and coat\n" +
      "• No fillers, artificial preservatives or flavours\n" +
      "• Light, mess-free cubes for training, rewards or as a meal topper",
    option: "Weight",
    variants: [{ value: "150g (5.3 oz)", sku: "BELOVED-CHICKEN-150G", price: 290000, stock: 45 }],
    ingredients: "Freeze-dried chicken breast",
    image: "Cats/Treat/Beloved Pets Dog & Cat Treats Freeze Dried.jpg",
  },
  {
    handle: "delectables-squeeze-up-variety-pack",
    title: "Delectables Squeeze Up Lickable Cat Treats, Variety Pack",
    brand: "Delectables",
    categories: ["cat-treats"],
    tags: ["species:cat", "life:all", "free:beef", "form:treat"],
    description:
      "Lickable purée tubes to hand-feed straight from the tube or squeeze over dry food.\n" +
      "• Made with cage-free chicken, wild-caught tuna and real vegetables\n" +
      "• No artificial colours, flavours, preservatives, fillers or by-products\n" +
      "• Poultry and seafood recipes to discover which one your cat prefers\n" +
      "• Up to 90% moisture; about 7.4–7.9 kcal per tube",
    option: "Pack",
    variants: [
      { value: "20 tubes x 14g", sku: "DELECT-SQUEEZE-20", price: 260000, stock: 40 },
      { value: "24 tubes x 14g", sku: "DELECT-SQUEEZE-24", price: 300000, stock: 30 },
      { value: "40 tubes x 14g", sku: "DELECT-SQUEEZE-40", price: 480000, stock: 15 },
    ],
    ingredients: "Chicken, tuna, vegetables, water",
    feeding_guide: "Up to 3 tubes a day for an average adult cat (about 24–27 kcal), keeping treats under 10% of daily calories.",
    image: "Cats/Treat/Delectables Squeeze Up Lickable Cat Treat Tube Variety Pack.jpg",
    bestseller: true,
  },
  {
    handle: "doctor-by-chica-ball-dental-treats",
    title: "Doctor By Chica Ball Crunchy Dental Treats for Cats",
    brand: "Doctor By",
    categories: ["cat-treats"],
    tags: ["species:cat", "life:all", "health:dental", "form:treat"],
    description:
      "Tiny crunchy balls that turn daily snack time into oral care.\n" +
      "• Light, crunchy texture encourages chewing to help manage plaque\n" +
      "• Lactose-free milk protein crisps, about 90% protein\n" +
      "• Coated with egg-yolk IgY and chlorella to support oral hygiene\n" +
      "• About 1,000 balls per 30g pack",
    option: "Pack",
    variants: [{ value: "30g (about 1,000 balls)", sku: "DOCTORBY-CHICA-30G", price: 150000, stock: 50 }],
    ingredients: "Lactose-free milk protein crisps, dried egg yolk (IgY), chlorella; chicken flavour",
    image: "Cats/Treat/Doctor By CAT CHICA BALL Crunchy Dental Cat Treats for Oral Care.jpg",
  },
  {
    handle: "greenies-feline-dental-treats-catnip",
    title: "Greenies Feline Dental Treats, Catnip Flavour",
    brand: "Greenies",
    categories: ["cat-treats"],
    tags: ["species:cat", "life:adult", "health:dental", "form:treat"],
    description:
      "Crunchy dental treats for adult cats that target plaque, tartar, gums and breath.\n" +
      "• The texture cleans teeth down to the gumline\n" +
      "• Supports 36% less tartar build-up in 28 days (manufacturer data)\n" +
      "• Natural ingredients plus vitamins, minerals and nutrients\n" +
      "• Catnip flavour cats love",
    option: "Weight",
    variants: [
      { value: "60g (2.1 oz)", sku: "GREENIES-CATNIP-60G", price: 120000, stock: 60 },
      { value: "130g (4.6 oz)", sku: "GREENIES-CATNIP-130G", price: 230000, stock: 40 },
      { value: "280g (9.75 oz)", sku: "GREENIES-CATNIP-280G", price: 420000, stock: 20 },
    ],
    image: "Cats/Treat/Greenies Feline Natural Dental Cat Treats, Catnip Flavor.jpg",
    bestseller: true,
  },

  // ---------- Cats · Supplements ----------
  {
    handle: "puainta-hairball-support-capsules",
    title: "Puainta Hairball Support Capsules for Cats",
    brand: "Puainta",
    categories: ["cat-supplements"],
    tags: ["species:cat", "life:all", "health:hairball", "health:sensitive-stomach", "form:supplement"],
    description:
      "An oil-free alternative to hairball gels and pastes for indoor and long-haired cats.\n" +
      "• Psyllium husk fibre plus digestive enzymes help swallowed hair pass naturally\n" +
      "• Supports regular bowel movements and stomach comfort\n" +
      "• Capsules can be opened and mixed into food for picky cats\n" +
      "• Good for shedding season or year-round use, for all breeds and ages\n" +
      "• A light herbal smell from the psyllium is normal",
    option: "Pack",
    variants: [{ value: "1 bottle", sku: "PUAINTA-HAIRBALL-1", price: 350000, stock: 30 }],
    ingredients: "Psyllium husk fibre, digestive enzymes",
    image: "Cats/Supplements/Cat Hairball Control – Alternative to Hairball Gel & Paste.jpg",
  },
  {
    handle: "fera-pets-algae-oil-omega-3",
    title: "Fera Pets Vegan Algae Oil Omega-3 for Dogs & Cats",
    brand: "Fera Pets",
    categories: ["cat-supplements", "dog-supplements"],
    tags: ["species:cat", "species:dog", "life:all", "health:skin-coat", "free:chicken", "free:beef", "free:fish", "free:grain", "form:supplement"],
    description:
      "A plant-based omega-3 food topper from microalgae, formulated by a veterinarian.\n" +
      "• 195 mg EPA and 635 mg DHA plus ALA, with omegas 3, 6 and 9\n" +
      "• Supports eyes, joints, heart, skin and coat\n" +
      "• Made by fermentation: an ocean-friendly alternative to fish oil\n" +
      "• No fillers. Made in the USA, NASC certified and GMP compliant",
    option: "Pack",
    variants: [{ value: "1 bottle", sku: "FERA-ALGAE-OIL-1", price: 690000, stock: 25 }],
    ingredients: "Marine microalgae oil, organic hemp seed oil, organic flaxseed oil, sunflower-derived vitamin E",
    feeding_guide: "Add to food once a day: under 7 kg 1 tsp; 7–20 kg 2 tsp; 20–34 kg 3 tsp; over 34 kg 4 tsp.",
    image: "Cats/Supplements/Fera Pets Algae Oil for Dogs & Cats - Vegan Omega 3 Oil.jpg",
  },
  {
    handle: "vetri-cal-high-calorie-nutritional-gel",
    title: "Vetri-CAL High-Calorie Nutritional Gel for Dogs & Cats, Malt Flavour",
    brand: "Vetri-CAL",
    categories: ["cat-supplements", "dog-supplements"],
    tags: ["species:cat", "species:dog", "life:all", "form:supplement"],
    description:
      "An energy-dense gel for pets that are recovering, underweight, stressed or off their food.\n" +
      "• Concentrated vitamins A, D, E and B-complex, minerals and electrolytes\n" +
      "• Omega-3, 6 and 9 fatty acids for skin, coat and overall wellness\n" +
      "• Malt flavour: give straight from the tube or mix into food\n" +
      "• Suitable for dogs, cats, puppies and kittens",
    option: "Size",
    variants: [{ value: "142g (5 oz) tube", sku: "VETRICAL-GEL-5OZ", price: 290000, stock: 35 }],
    feeding_guide: "1½ teaspoons per 4.5 kg (10 lb) of body weight daily. The amount can be doubled for pets refusing food.",
    image: "Cats/Supplements/High Calorie Nutritional Gel for Dogs, Cats, Puppies & Kittens.jpg",
  },
  {
    handle: "planopaws-omega-3-fish-oil-cats",
    title: "Planopaws Wild-Caught Omega-3 Fish Oil for Cats",
    brand: "Planopaws",
    categories: ["cat-supplements"],
    tags: ["species:cat", "life:all", "health:skin-coat", "free:chicken", "free:beef", "free:grain", "form:supplement"],
    description:
      "Low-odour fish oil that mixes into wet food in seconds, for a softer coat and less itching.\n" +
      "• From wild-caught anchovies, herring, mackerel and sardines off Iceland\n" +
      "• Molecularly distilled to remove heavy metals and toxins\n" +
      "• Helps with dander, flaking and shedding; supports heart, brain and immune health\n" +
      "• Leak-resistant pump; made in a GMP-certified, third-party-tested US facility",
    option: "Size",
    variants: [
      { value: "237ml (8 fl oz)", sku: "PLANOPAWS-OMEGA-8OZ", price: 390000, stock: 30 },
      { value: "355ml (12 fl oz)", sku: "PLANOPAWS-OMEGA-12OZ", price: 520000, stock: 20 },
      { value: "473ml (16 fl oz)", sku: "PLANOPAWS-OMEGA-16OZ", price: 650000, stock: 10 },
    ],
    ingredients: "Fish oil from anchovy, herring, mackerel and sardine",
    feeding_guide: "One pump on a meal per day. A 237ml bottle lasts most cats about four months.",
    image: "Cats/Supplements/Omega 3 Fish Oil for Cats - Wild Caught, Skin and Coat.jpg",
  },
  {
    handle: "coco-and-luna-urinary-tract-support-cats",
    title: "Coco and Luna Urinary Tract Support Powder for Cats, Salmon Flavour",
    brand: "Coco and Luna",
    categories: ["cat-supplements"],
    tags: ["species:cat", "life:all", "health:urinary", "form:supplement"],
    description:
      "A vet-formulated powder that supports a healthy urinary tract and bladder.\n" +
      "• D-Mannose and cranberry help keep normal urine pH\n" +
      "• Astragalus and marshmallow root support bladder health and kidney function\n" +
      "• Echinacea for bladder support\n" +
      "• Natural salmon flavour, easy to sprinkle over food",
    option: "Weight",
    variants: [{ value: "120g (4.23 oz)", sku: "COCOLUNA-URINARY-120G", price: 420000, stock: 30 }],
    ingredients: "D-Mannose, cranberry, astragalus root, marshmallow root, echinacea, natural salmon flavour",
    image: "Urinary care/Urinary tract support.png",
  },
  {
    handle: "urinary-tract-drops-cranberry-d-mannose",
    title: "Urinary Tract Support Drops for Dogs & Cats, Cranberry & D-Mannose",
    categories: ["cat-supplements", "dog-supplements"],
    tags: ["species:cat", "species:dog", "life:all", "health:urinary", "form:supplement"],
    description:
      "Herbal liquid drops that support the bladder, kidneys and urinary tract of dogs and cats.\n" +
      "• Cranberry and D-Mannose support urinary tract and bladder care\n" +
      "• Pumpkin seed extract adds antioxidants\n" +
      "• Couch grass and marshmallow root are traditionally used for urinary comfort\n" +
      "• For pets from 3 months of age; lab tested by a third party\n" +
      "This is a supplement, not a medicine. See your vet if your pet shows urinary symptoms.",
    option: "Pack",
    variants: [{ value: "1 bottle with dropper", sku: "URINARY-DROPS-1", price: 350000, stock: 25 }],
    ingredients: "Cranberry extract, D-Mannose, pumpkin seed extract, couch grass, marshmallow root",
    feeding_guide: "Daily, by mouth or mixed into food (not water): under 4.5 kg ½ dropper; 4.5–9 kg 1 dropper; 9–16 kg 2 droppers; over 16 kg 3 droppers (1 dropper = 1 ml). Use for up to 4 weeks or as your vet advises.",
    image: "Urinary care/Urinary tract.png",
  },

  // ---------- Cats · Accessories ----------
  {
    handle: "aumuca-self-cleaning-slicker-brush",
    title: "Aumuca Self-Cleaning Slicker Brush for Cats",
    brand: "Aumuca",
    categories: ["cat-accessories"],
    tags: ["species:cat", "life:all", "health:hairball", "health:skin-coat", "form:accessory"],
    description:
      "A deshedding brush that removes loose undercoat, tangles, knots and dander from short-, medium- and long-haired cats.\n" +
      "• 150° bent 304 stainless-steel pins with rounded tips, gentle on sensitive skin\n" +
      "• One-click button pushes the collected hair off the pins\n" +
      "• Sturdy ABS handle with a silicone loop for hanging\n" +
      "• Regular brushing means less swallowed fur and fewer hairballs\n" +
      "• Also works for dogs and rabbits",
    option: "Colour",
    variants: [{ value: "White", sku: "AUMUCA-BRUSH-WHITE", price: 189000, stock: 40 }],
    image: "Cats/Accessories/Aumuca Cat Brush for Shedding, Cat Brushes for Indoor Cats, Cat Brush for Long or Short Haired Cats.jpg",
  },
  {
    handle: "twdepart-cat-tree-tower",
    title: "TWDEPART Cat Tree Tower with Sisal Scratching Board",
    brand: "TWDEPART",
    categories: ["cat-accessories"],
    tags: ["species:cat", "life:all", "form:accessory"],
    description:
      "A compact climbing tower that doubles as a bed, play area and scratching post.\n" +
      "• Size: 43 x 33 x 45 cm\n" +
      "• Natural sisal scratching board saves your furniture\n" +
      "• Spring and hanging balls for active play\n" +
      "• Soft top platform for naps\n" +
      "• Lightweight; assembles in minutes with the included tools",
    option: "Colour",
    variants: [{ value: "Grey", sku: "TWDEPART-TREE-GREY", price: 690000, stock: 12 }],
    image: "Cats/Accessories/TWDEPART Cat Tree Tower with Cat Scratching Post for Indoor Cats, Activity Centre Climbing Tree with Scratching Board and Playful Toy Balls, Grey.jpg",
  },
  {
    handle: "vceoa-soft-pet-carrier",
    title: "Vceoa Soft-Sided Pet Carrier for Cats & Small Dogs",
    brand: "Vceoa",
    categories: ["cat-accessories", "dog-accessories"],
    tags: ["species:cat", "species:dog", "life:all", "form:accessory"],
    description:
      "A travel carrier that fits under the seat on most airlines (check your airline's rules first).\n" +
      "• Mesh windows for airflow; top and side entry with locking zippers\n" +
      "• Carry handles, adjustable shoulder strap that also works as a seatbelt, and a luggage strap\n" +
      "• Removable firm base and a washable fleece bed\n" +
      "• Recommended for pets up to 7 kg; choose by your pet's length and height, not only weight",
    option: "Size",
    variants: [
      { value: "M · 44 x 28 x 28 cm", sku: "VCEOA-CARRIER-M", price: 590000, stock: 20 },
      { value: "L · 48 x 30 x 30 cm", sku: "VCEOA-CARRIER-L", price: 690000, stock: 12 },
    ],
    image: "Cats/Accessories/Vceoa 17.5x11x11 Pet Carrier for Cats.jpg",
  },

  // ---------- Dogs · Dry food ----------
  {
    handle: "blue-buffalo-life-protection-chicken-adult-dog",
    title: "Blue Buffalo Life Protection Formula Adult Dry Dog Food, Chicken & Brown Rice",
    brand: "Blue Buffalo",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "form:dry"],
    description:
      "Complete daily nutrition for adult dogs, developed by veterinarians and animal nutritionists.\n" +
      "• Real chicken is the first ingredient for lean muscles\n" +
      "• Brown rice, barley and oatmeal for gentle digestion and steady energy\n" +
      "• LifeSource Bits: antioxidants, vitamins and minerals for immune health\n" +
      "• Natural prebiotic fibre for healthy digestion and stool quality\n" +
      "• No poultry by-product meals, corn, wheat, soy, artificial flavours or preservatives",
    option: "Weight",
    variants: [
      { value: "2.72kg (6 lb)", sku: "BB-LPF-CHK-DOG-6LB", price: 590000, stock: 30 },
      { value: "6.8kg (15 lb)", sku: "BB-LPF-CHK-DOG-15LB", price: 1290000, stock: 15 },
      { value: "13.6kg (30 lb)", sku: "BB-LPF-CHK-DOG-30LB", price: 2290000, stock: 8 },
    ],
    ingredients: "Deboned chicken, brown rice, barley, oatmeal, prebiotic fibre, LifeSource Bits (antioxidants, vitamins, minerals)",
    image: "Dogs/Dry food/Blue Buffalo Life Protection Formula Chicken Adult Dry Dog Food.jpg",
    bestseller: true,
  },
  {
    handle: "diamond-naturals-adult-beef-rice",
    title: "Diamond Naturals Adult Dry Dog Food, Beef Meal & Rice",
    brand: "Diamond Naturals",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "health:skin-coat", "form:dry"],
    description:
      "Family-made kibble with pasture-raised beef as the first ingredient.\n" +
      "• Beef protein supports bones, joints and lean, strong muscles\n" +
      "• Superfoods such as blueberries and oranges add key nutrients\n" +
      "• Omega fatty acids for healthy skin and coat\n" +
      "• K9 Strain probiotics, prebiotics and antioxidants for digestion and immunity\n" +
      "• Made in the USA",
    option: "Weight",
    variants: [
      { value: "2.72kg (6 lb)", sku: "DIAMOND-BEEF-6LB", price: 450000, stock: 30 },
      { value: "13.6kg (30 lb)", sku: "DIAMOND-BEEF-30LB", price: 1590000, stock: 10 },
    ],
    ingredients: "Beef meal, rice, blueberries, oranges, omega fatty acids, K9 Strain probiotics, prebiotics, vitamins and minerals",
    image: "Dogs/Dry food/Diamond Naturals Adult Dry Dog Food.jpg",
  },
  {
    handle: "iams-proactive-health-minichunks-chicken",
    title: "IAMS Proactive Health Adult MiniChunks Dry Dog Food, Chicken",
    brand: "IAMS",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "form:dry"],
    description:
      "Small, easy-to-chew kibble that supports five key areas of your dog's health.\n" +
      "• Natural fibre and prebiotics for healthy digestion\n" +
      "• High-quality protein from chicken and egg for strong muscles\n" +
      "• Antioxidants for a strong immune system\n" +
      "• Wholesome grains for healthy energy",
    option: "Weight",
    variants: [
      { value: "3.18kg (7 lb)", sku: "IAMS-MINICHUNKS-7LB", price: 420000, stock: 35 },
      { value: "6.8kg (15 lb)", sku: "IAMS-MINICHUNKS-15LB", price: 790000, stock: 20 },
      { value: "13.6kg (30 lb)", sku: "IAMS-MINICHUNKS-30LB", price: 1390000, stock: 10 },
    ],
    ingredients: "Chicken, egg, wholesome grains, natural fibre, prebiotics, antioxidants, vitamins and minerals",
    image: "Dogs/Dry food/IAMS Proactive Health Adult Minichunks Dry Dog Food, Chicken.jpg",
  },
  {
    handle: "kibbles-n-bits-original-beef-chicken",
    title: "Kibbles 'n Bits Original Savory Beef & Chicken Flavour Dry Dog Food",
    brand: "Kibbles 'n Bits",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "form:dry"],
    description:
      "A budget-friendly classic with crunchy and meaty bits.\n" +
      "• 100% complete and balanced nutrition for adult dogs\n" +
      "• 23 essential vitamins and minerals\n" +
      "• Rich in antioxidants\n" +
      "• Made in the USA",
    option: "Weight",
    variants: [{ value: "14kg (31 lb)", sku: "KNB-ORIGINAL-31LB", price: 990000, stock: 15 }],
    image: "Dogs/Dry food/Kibbles 'n Bits Original Savory Beef & Chicken Flavor Dry Dog Food.jpg",
  },
  {
    handle: "pedigree-adult-steak-vegetable",
    title: "Pedigree Adult Complete Nutrition Dry Dog Food, Grilled Steak & Vegetable",
    brand: "Pedigree",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "form:dry"],
    description:
      "Complete adult nutrition that supports six everyday health essentials: digestion, immunity, skin and coat, heart, bones and teeth.\n" +
      "• Vitamin Goodbites pieces with extra essential vitamins\n" +
      "• Prebiotic fibre for healthy digestion\n" +
      "• Protein for strong muscles, including the heart",
    option: "Weight",
    variants: [
      { value: "1.59kg (3.5 lb)", sku: "PEDIGREE-STEAK-3_5LB", price: 190000, stock: 60 },
      { value: "8.16kg (18 lb)", sku: "PEDIGREE-STEAK-18LB", price: 690000, stock: 25 },
    ],
    image: "Dogs/Dry food/Pedigree Adult Complete Nutrition Dry Dog Food, Steak & Vegetable,.jpg",
    bestseller: true,
  },
  {
    handle: "purina-pro-plan-sensitive-skin-stomach-salmon-dog",
    title: "Purina Pro Plan Sensitive Skin & Stomach Adult Dry Dog Food, Salmon & Rice",
    brand: "Purina Pro Plan",
    categories: ["dog-dry-food"],
    tags: ["species:dog", "life:adult", "health:sensitive-stomach", "health:skin-coat", "form:dry"],
    description:
      "High-protein food for adult dogs with sensitive skin and stomach (formerly FOCUS Sensitive Skin & Stomach).\n" +
      "• Real salmon is the first ingredient\n" +
      "• Oatmeal is easy to digest and gentle on the stomach\n" +
      "• Live probiotics for digestive and immune health\n" +
      "• Sunflower oil rich in omega-6 for skin and coat",
    option: "Weight",
    variants: [
      { value: "7.26kg (16 lb)", sku: "PROPLAN-SENS-SALMON-16LB", price: 1490000, stock: 15 },
      { value: "13.6kg (30 lb)", sku: "PROPLAN-SENS-SALMON-30LB", price: 2490000, stock: 8 },
    ],
    ingredients: "Salmon, rice, oatmeal, sunflower oil, live probiotics, vitamins and minerals",
    image: "Dogs/Dry food/Purina Pro Plan Sensitive Skin & Stomach Dry Dog Food, Salmon.jpg",
  },

  // ---------- Dogs · Wet food ----------
  {
    handle: "amazon-basics-wet-dog-food-variety-pack",
    title: "Amazon Basics Wet Dog Food Variety Pack, Country Stew & Cuts in Gravy with Beef",
    brand: "Amazon Basics",
    categories: ["dog-wet-food"],
    tags: ["species:dog", "form:wet"],
    description:
      "A variety pack of hearty stew and cuts in gravy.\n" +
      "• Made with real beef\n" +
      "• No added wheat, corn or soy\n" +
      "• No added artificial flavours\n" +
      "• Made in the USA",
    option: "Pack",
    variants: [{ value: "12 cans", sku: "AMZB-WET-DOG-12", price: 590000, stock: 20 }],
    ingredients: "Beef, vegetables, gravy, vitamins and minerals",
    image: "Dogs/Wetfood/Amazon Basics Wet Dog Food Variety Pack, Country Stew Flavor and Cuts in Gravy with Beef, Made with Natural Ingredients.jpg",
  },
  {
    handle: "cesar-classic-loaf-meaty-selects",
    title: "Cesar Classic Loaf in Sauce Wet Dog Food, Meaty Selects",
    brand: "Cesar",
    categories: ["dog-wet-food"],
    tags: ["species:dog", "life:adult", "free:grain", "form:wet"],
    description:
      "Single-serve gourmet loaf in sauce, complete and balanced for adult dogs.\n" +
      "• Real meat is the first ingredient\n" +
      "• No fillers or artificial flavours; made without grains\n" +
      "• Easy peel-away trays; serve alone or on top of dry food\n" +
      "• Made in the USA",
    option: "Pack",
    variants: [
      { value: "1 tray (100g)", sku: "CESAR-MEATY-1", price: 32000, stock: 150 },
      { value: "Box of 24 trays", sku: "CESAR-MEATY-24", price: 690000, stock: 15 },
    ],
    image: "Dogs/Wetfood/Cesar Classic Loaf in Sauce Wet Dog Food, Meaty Selects.jpg",
  },
  {
    handle: "daves-bland-diet-chicken-rice",
    title: "Dave's Pet Food Bland Diet Wet Dog Food, Chicken & Rice",
    brand: "Dave's Pet Food",
    categories: ["dog-wet-food"],
    tags: ["species:dog", "life:adult", "life:senior", "health:sensitive-stomach", "free:beef", "free:fish", "form:wet"],
    description:
      "A simple chicken and white rice pâté for dogs with delicate digestion.\n" +
      "• Low fat (6%) and easy to digest during stomach upsets or food changes\n" +
      "• Limited ingredients: chicken, white rice, vitamins and minerals\n" +
      "• No wheat, gluten, artificial flavours, colours or meat by-products\n" +
      "• Soft pâté texture suits seniors, small breeds and sensitive teeth\n" +
      "• Complete and balanced for adult maintenance (not for puppies)",
    option: "Pack",
    variants: [
      { value: "1 can (369g)", sku: "DAVES-BLAND-CHK-1", price: 85000, stock: 60 },
      { value: "12 cans", sku: "DAVES-BLAND-CHK-12", price: 950000, stock: 10 },
    ],
    ingredients: "Chicken, white rice, vitamins and minerals",
    feeding_guide: "Feed as a full meal or a topper. When switching foods, mix it in gradually over 7–10 days.",
    image: "Dogs/Wetfood/Dave's Pet Food Bland Diet Dog Food, Chicken & Rice.jpg",
  },
  {
    handle: "justfoodfordogs-justfresh-chicken",
    title: "JustFoodForDogs JustFresh Wet Dog Food & Topper, Chicken",
    brand: "JustFoodForDogs",
    categories: ["dog-wet-food"],
    tags: ["species:dog", "life:all", "form:wet"],
    description:
      "Human-grade fresh food, gently cooked and developed by veterinary nutritionists.\n" +
      "• Limited ingredients from fresh whole foods\n" +
      "• Complete and balanced for all life stages and breed sizes\n" +
      "• Preservative-free; shelf-stable for up to 2 years unopened, refrigerate after opening\n" +
      "• Serve as a full meal or as a topper for picky eaters",
    option: "Pack",
    variants: [
      { value: "1 pouch", sku: "JFFD-JUSTFRESH-CHK-1", price: 120000, stock: 50 },
      { value: "Pack of 6 pouches", sku: "JFFD-JUSTFRESH-CHK-6", price: 690000, stock: 12 },
    ],
    image: "Dogs/Wetfood/JustFoodForDogs JustFresh Fresh Wet Dog Food or Topper.jpg",
  },

  // ---------- Dogs · Treats ----------
  {
    handle: "gootoe-turkey-tendon-strips",
    title: "GooToE Turkey Tendon Chews for Dogs, Strips",
    brand: "GooToE",
    categories: ["dog-treats"],
    tags: ["species:dog", "free:grain", "form:treat"],
    description:
      "Long-lasting, low-fat chews made from US-sourced turkey tendon.\n" +
      "• Naturally firm texture that takes time to work through\n" +
      "• All-natural, grain-free ingredients\n" +
      "• A rawhide-free alternative for dogs that love to chew",
    option: "Shape",
    variants: [{ value: "Strips", sku: "GOOTOE-TENDON-STRIPS", price: 250000, stock: 40 }],
    ingredients: "Turkey tendon",
    image: "Dogs/Treats/GooToE Turkey Tendons for Dogs, Natural Chews, Strips.jpg",
  },
  {
    handle: "milk-bone-original-medium-biscuits",
    title: "Milk-Bone Original Dog Biscuits, Medium",
    brand: "Milk-Bone",
    categories: ["dog-treats"],
    tags: ["species:dog", "life:all", "health:dental", "form:treat"],
    description:
      "Classic crunchy biscuits for medium dogs (9–23 kg), over 280 per box.\n" +
      "• The crunchy texture helps freshen breath and reduce tartar\n" +
      "• 15% protein plus 12 vitamins and minerals, including calcium and phosphorus\n" +
      "• Baked in the USA",
    option: "Pack",
    variants: [{ value: "4.5kg (10 lb) box", sku: "MILKBONE-ORIG-M-10LB", price: 690000, stock: 20 }],
    image: "Dogs/Treats/Milk-Bone Original Medium Dog Biscuits.jpg",
    bestseller: true,
  },

  // ---------- Dogs · Supplements ----------
  {
    handle: "four-leaf-rover-better-bones",
    title: "Four Leaf Rover Better Bones Bone Meal Calcium for Dogs",
    brand: "Four Leaf Rover",
    categories: ["dog-supplements"],
    tags: ["species:dog", "life:all", "free:chicken", "free:fish", "free:grain", "form:supplement"],
    description:
      "Freeze-dried grass-fed beef bone powder that balances home-cooked and raw meals.\n" +
      "• Natural calcium with phosphorus and magnesium in their natural ratio\n" +
      "• Supports bones, joints and teeth\n" +
      "• Safer than whole bones: no splinters, choking risk or broken teeth\n" +
      "• 100% New Zealand grass-fed beef, dried without acids, bleach or high heat",
    option: "Pack",
    variants: [{ value: "1 jar", sku: "FLR-BETTERBONES-1", price: 590000, stock: 20 }],
    ingredients: "Freeze-dried New Zealand grass-fed beef bone",
    feeding_guide: "Add one scoop to each home-made or raw meal as directed on the jar.",
    image: "Dogs/Supplements/Four Leaf Rover Better Bones Bone Meal for Dogs, Natural Calcium for Dogs.jpg",
  },
  {
    handle: "nutri-vet-hip-joint-advanced-strength",
    title: "Nutri-Vet Hip & Joint Advanced Strength Chewable Tablets for Dogs",
    brand: "Nutri-Vet",
    categories: ["dog-supplements"],
    tags: ["species:dog", "life:senior", "form:supplement"],
    description:
      "Liver-flavoured chewables for large breeds and dogs aged nine or older.\n" +
      "• Advanced-strength glucosamine with chondroitin, MSM and hyaluronic acid\n" +
      "• Helps maintain mobility, comfort and healthy joint function\n" +
      "• Formulated by veterinarians; carries the NASC quality seal\n" +
      "• Made in the USA",
    option: "Pack",
    variants: [
      { value: "90 tablets", sku: "NUTRIVET-HIPJOINT-90", price: 490000, stock: 25 },
      { value: "150 tablets", sku: "NUTRIVET-HIPJOINT-150", price: 720000, stock: 15 },
      { value: "300 tablets", sku: "NUTRIVET-HIPJOINT-300", price: 1290000, stock: 8 },
    ],
    ingredients: "Glucosamine, chondroitin, MSM (methylsulfonylmethane), hyaluronic acid; liver flavour",
    image: "Dogs/Supplements/Nutri-Vet Hip & Joint Supplement for Dogs, Glucosamine Chondroitin.jpg",
  },

  // ---------- Dogs · Accessories ----------
  {
    handle: "devil-dog-whole-elk-antler-xl",
    title: "Devil Dog Pet Co Whole Elk Antler for Dogs, Extra Large",
    brand: "Devil Dog Pet Co",
    categories: ["dog-accessories"],
    tags: ["species:dog", "life:adult", "health:dental", "form:accessory"],
    description:
      "A naturally shed elk antler chew for powerful large-breed chewers, lasting weeks rather than minutes.\n" +
      "• Wears down gradually without splintering like bones or rawhide\n" +
      "• Hand-inspected with sanded edges; single ingredient, no chemicals\n" +
      "• Chewing scrapes away plaque and tartar for cleaner teeth\n" +
      "• Extra Large suits dogs up to 43 kg, such as Labradors, Golden Retrievers and Huskies",
    option: "Size",
    variants: [{ value: "Extra Large", sku: "DEVILDOG-ANTLER-XL", price: 450000, stock: 20 }],
    image: "Dogs/Accessories/Devil Dog Pet Co Whole Elk Antlers for Dogs.jpg",
  },
  {
    handle: "dk177-absorbent-pet-feeding-mat",
    title: "DK177 Absorbent Pet Feeding Mat, Dark Grey",
    brand: "DK177",
    categories: ["dog-accessories", "cat-accessories"],
    tags: ["species:dog", "species:cat", "life:all", "form:accessory"],
    description:
      "A placemat for food and water bowls that keeps spills off your floor.\n" +
      "• Absorbent, stain-resistant top soaks up water and milk quickly\n" +
      "• Non-slip, waterproof rubber backing\n" +
      "• Wipe clean or rinse with water; resists hair and dust\n" +
      "• Durable and tear-resistant, for dogs and cats",
    option: "Size",
    variants: [
      { value: "51 x 30 cm", sku: "DK177-MAT-51X30", price: 159000, stock: 40 },
      { value: "61 x 41 cm", sku: "DK177-MAT-61X41", price: 199000, stock: 30 },
      { value: "81 x 56 cm", sku: "DK177-MAT-81X56", price: 269000, stock: 20 },
    ],
    image: "Dogs/Accessories/Pet Feeding Mat-Absorbent Pet Placemat for Food and Water Bowl.jpg",
  },
]
