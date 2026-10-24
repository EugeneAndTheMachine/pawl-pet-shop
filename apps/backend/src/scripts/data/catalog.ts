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
  { handle: "meo", name: "Mèo" },
  { handle: "meo-thuc-an-hat", name: "Thức ăn hạt", parent: "meo" },
  { handle: "meo-pate", name: "Pate & thức ăn ướt", parent: "meo" },
  { handle: "meo-cat-ve-sinh", name: "Cát vệ sinh", parent: "meo" },
  { handle: "meo-snack", name: "Snack", parent: "meo" },
  { handle: "meo-dinh-duong", name: "Dinh dưỡng bổ sung", parent: "meo" },
  { handle: "meo-phu-kien", name: "Phụ kiện", parent: "meo" },
  { handle: "cho", name: "Chó" },
  { handle: "cho-thuc-an-hat", name: "Thức ăn hạt", parent: "cho" },
  { handle: "cho-pate", name: "Pate & thức ăn ướt", parent: "cho" },
  { handle: "cho-snack", name: "Snack", parent: "cho" },
  { handle: "cho-dinh-duong", name: "Dinh dưỡng bổ sung", parent: "cho" },
  { handle: "cho-phu-kien", name: "Phụ kiện", parent: "cho" },
]

export const BESTSELLER_COLLECTION = { handle: "ban-chay", title: "Bán chạy" }

export const PRODUCTS: ProductSeed[] = [
  // ---------- Mèo · Thức ăn hạt ----------
  {
    handle: "royal-canin-indoor-27",
    title: "Royal Canin Indoor 27 cho mèo trưởng thành",
    brand: "Royal Canin",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:adult", "health:hairball", "form:dry"],
    description:
      "Hạt cho mèo sống trong nhà, ít vận động. Lượng chất xơ vừa phải giúp hạn chế búi lông và giữ phân gọn, ít mùi.",
    option: "Khối lượng",
    variants: [
      { value: "400g", sku: "RC-INDOOR27-400G", price: 145000, stock: 60 },
      { value: "2kg", sku: "RC-INDOOR27-2KG", price: 560000, stock: 25 },
    ],
    ingredients: "Protein gia cầm sấy, gạo, ngô, chất béo động vật, chất xơ thực vật, dầu cá, vitamin và khoáng chất",
    kcal_per_kg: 3720,
    feeding_guide: "Mèo 3 kg: 45 g/ngày; 4 kg: 55 g/ngày; 5 kg: 65 g/ngày. Chia 2–3 bữa, luôn có nước sạch.",
    bestseller: true,
  },
  {
    handle: "royal-canin-kitten-36",
    title: "Royal Canin Kitten 36 cho mèo con",
    brand: "Royal Canin",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:kitten", "form:dry"],
    description:
      "Hạt nhỏ, giàu đạm cho mèo con từ 4 đến 12 tháng tuổi, hỗ trợ giai đoạn tăng trưởng và hệ miễn dịch đang phát triển.",
    option: "Khối lượng",
    variants: [
      { value: "400g", sku: "RC-KITTEN36-400G", price: 155000, stock: 50 },
      { value: "2kg", sku: "RC-KITTEN36-2KG", price: 595000, stock: 20 },
    ],
    ingredients: "Protein gia cầm sấy, gạo, chất béo động vật, protein trứng, dầu cá, men bia, vitamin và khoáng chất",
    kcal_per_kg: 4010,
    feeding_guide: "4–6 tháng: 50–60 g/ngày; 7–12 tháng: 55–70 g/ngày tuỳ cân nặng. Chia 3–4 bữa.",
    bestseller: true,
  },
  {
    handle: "royal-canin-sterilised-37",
    title: "Royal Canin Sterilised 37 cho mèo đã triệt sản",
    brand: "Royal Canin",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:adult", "health:sterilised", "health:weight-control", "form:dry"],
    description:
      "Công thức ít béo hơn cho mèo đã triệt sản, giúp duy trì cân nặng hợp lý mà vẫn đủ no.",
    option: "Khối lượng",
    variants: [
      { value: "400g", sku: "RC-STER37-400G", price: 150000, stock: 45 },
      { value: "2kg", sku: "RC-STER37-2KG", price: 575000, stock: 18 },
    ],
    ingredients: "Protein gia cầm sấy, gạo, gluten lúa mì, chất xơ thực vật, chất béo động vật, dầu cá, L-carnitine, vitamin và khoáng chất",
    kcal_per_kg: 3580,
    feeding_guide: "Mèo 3 kg: 45 g/ngày; 4 kg: 55 g/ngày; 5 kg: 62 g/ngày.",
  },
  {
    handle: "royal-canin-urinary-care",
    title: "Royal Canin Urinary Care hỗ trợ tiết niệu",
    brand: "Royal Canin",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:adult", "health:urinary", "form:dry"],
    description:
      "Hạt cân bằng khoáng chất, khuyến khích mèo uống nhiều nước hơn, hỗ trợ sức khoẻ đường tiết niệu.",
    option: "Khối lượng",
    variants: [
      { value: "400g", sku: "RC-URINARY-400G", price: 165000, stock: 30 },
      { value: "2kg", sku: "RC-URINARY-2KG", price: 640000, stock: 0 },
    ],
    ingredients: "Protein gia cầm sấy, gạo, ngô, chất béo động vật, chất xơ thực vật, dầu cá, khoáng chất cân bằng, vitamin",
    kcal_per_kg: 3780,
    feeding_guide: "Mèo 4 kg: khoảng 55 g/ngày. Nếu mèo đang điều trị bệnh tiết niệu, hỏi ý kiến bác sĩ thú y.",
  },
  {
    handle: "whiskas-adult-ca-bien",
    title: "Whiskas Adult vị cá biển",
    brand: "Whiskas",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:adult", "free:beef", "form:dry"],
    description: "Hạt giòn vị cá biển cho mèo trên 1 tuổi, giá dễ chịu cho bữa ăn hằng ngày.",
    option: "Khối lượng",
    variants: [
      { value: "480g", sku: "WK-ADULT-FISH-480G", price: 69000, stock: 120 },
      { value: "1.2kg", sku: "WK-ADULT-FISH-1200G", price: 155000, stock: 80 },
    ],
    ingredients: "Ngũ cốc, bột cá, bột gia cầm, dầu thực vật, cá ngừ, vitamin và khoáng chất",
    kcal_per_kg: 3600,
    feeding_guide: "Mèo 3 kg: 50 g/ngày; 4 kg: 60 g/ngày; 5 kg: 70 g/ngày.",
    bestseller: true,
  },
  {
    handle: "me-o-persian",
    title: "Me-O Persian cho mèo lông dài",
    brand: "Me-O",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:adult", "health:hairball", "health:skin-coat", "form:dry"],
    description: "Hạt dành cho mèo lông dài, bổ sung omega-3 và omega-6 cho bộ lông mượt, hỗ trợ đẩy búi lông.",
    option: "Khối lượng",
    variants: [
      { value: "400g", sku: "MEO-PERSIAN-400G", price: 65000, stock: 70 },
      { value: "1.1kg", sku: "MEO-PERSIAN-1100G", price: 150000, stock: 40 },
    ],
    ingredients: "Gạo, bột gia cầm, bột cá, mỡ gà, chất xơ, dầu cá, taurine, vitamin và khoáng chất",
    kcal_per_kg: 3650,
    feeding_guide: "Mèo 3 kg: 45 g/ngày; 4 kg: 55 g/ngày.",
  },
  {
    handle: "catsrang-all-life-stages",
    title: "Catsrang All Life Stages",
    brand: "Catsrang",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:all", "form:dry"],
    description: "Hạt dùng được cho mèo mọi lứa tuổi, tiện cho nhà nuôi nhiều mèo.",
    option: "Khối lượng",
    variants: [
      { value: "1.5kg", sku: "CATSRANG-ALS-1500G", price: 165000, stock: 50 },
      { value: "5kg", sku: "CATSRANG-ALS-5KG", price: 480000, stock: 15 },
    ],
    ingredients: "Bột gà, gạo, ngô, bột cá, mỡ gà, cá ngừ, taurine, vitamin và khoáng chất",
    kcal_per_kg: 3700,
    feeding_guide: "Mèo con: 40–60 g/ngày; mèo trưởng thành 4 kg: 55–60 g/ngày.",
    bestseller: true,
  },
  {
    handle: "reflex-plus-salmon",
    title: "Reflex Plus Adult vị cá hồi",
    brand: "Reflex Plus",
    categories: ["meo-thuc-an-hat"],
    tags: ["species:cat", "life:adult", "health:sensitive-stomach", "free:chicken", "free:beef", "form:dry"],
    description: "Đạm chính từ cá hồi, phù hợp mèo có đường tiêu hoá nhạy cảm hoặc không hợp đạm gà.",
    option: "Khối lượng",
    variants: [{ value: "1.5kg", sku: "REFLEX-SALMON-1500G", price: 230000, stock: 35 }],
    ingredients: "Cá hồi sấy, gạo, bột cá, dầu cá hồi, củ dền, prebiotic FOS, vitamin và khoáng chất",
    kcal_per_kg: 3850,
    feeding_guide: "Mèo 3 kg: 45 g/ngày; 4 kg: 55 g/ngày; 5 kg: 65 g/ngày.",
  },

  // ---------- Mèo · Pate ----------
  {
    handle: "whiskas-pate-ca-ngu",
    title: "Pate Whiskas vị cá ngừ 85g",
    brand: "Whiskas",
    categories: ["meo-pate"],
    tags: ["species:cat", "life:adult", "free:beef", "form:wet"],
    description: "Pate mềm vị cá ngừ, dùng làm bữa chính hoặc trộn cùng hạt để mèo ăn ngon hơn.",
    option: "Quy cách",
    variants: [
      { value: "1 gói 85g", sku: "WK-PATE-TUNA-1", price: 15000, stock: 300 },
      { value: "Hộp 12 gói", sku: "WK-PATE-TUNA-12", price: 165000, stock: 40 },
    ],
    ingredients: "Cá ngừ, thịt gia cầm, nước, chất tạo đặc, taurine, vitamin và khoáng chất",
    kcal_per_kg: 850,
    feeding_guide: "Mèo 4 kg: 3–4 gói/ngày nếu chỉ ăn pate; trộn hạt thì 1 gói/ngày và giảm 15 g hạt.",
    bestseller: true,
  },
  {
    handle: "me-o-pate-kitten",
    title: "Pate Me-O Kitten vị cá ngừ 80g",
    brand: "Me-O",
    categories: ["meo-pate"],
    tags: ["species:cat", "life:kitten", "free:beef", "form:wet"],
    description: "Pate mịn cho mèo con, dễ ăn khi mới tập chuyển từ sữa sang thức ăn đặc.",
    option: "Quy cách",
    variants: [
      { value: "1 gói 80g", sku: "MEO-PATE-KIT-1", price: 13000, stock: 250 },
      { value: "Hộp 12 gói", sku: "MEO-PATE-KIT-12", price: 145000, stock: 30 },
    ],
    ingredients: "Cá ngừ, gà, nước, DHA, taurine, vitamin và khoáng chất",
    kcal_per_kg: 820,
    feeding_guide: "Mèo con 1–2 kg: 2–3 gói/ngày, chia nhiều bữa nhỏ.",
  },
  {
    handle: "royal-canin-instinctive-pate",
    title: "Royal Canin Instinctive pate cho mèo trưởng thành 85g",
    brand: "Royal Canin",
    categories: ["meo-pate"],
    tags: ["species:cat", "life:adult", "form:wet"],
    description: "Pate dạng mịn với tỉ lệ đạm và chất béo mà mèo trưởng thành thường ưa thích.",
    option: "Quy cách",
    variants: [
      { value: "1 gói 85g", sku: "RC-INST-PATE-1", price: 32000, stock: 150 },
      { value: "Hộp 12 gói", sku: "RC-INST-PATE-12", price: 360000, stock: 20 },
    ],
    ingredients: "Thịt và phụ phẩm từ thịt, cá, ngũ cốc, khoáng chất, đường, vitamin",
    kcal_per_kg: 880,
    feeding_guide: "Mèo 4 kg: 4 gói/ngày nếu chỉ ăn pate.",
  },
  {
    handle: "nekko-ca-ngu-thanh-cua",
    title: "Pate Nekko cá ngừ thanh cua 70g",
    brand: "Nekko",
    categories: ["meo-pate"],
    tags: ["species:cat", "life:adult", "free:beef", "free:grain", "form:wet"],
    description: "Pate dạng thạch có miếng cá ngừ và thanh cua, không chứa ngũ cốc.",
    option: "Quy cách",
    variants: [
      { value: "1 gói 70g", sku: "NEKKO-TUNA-CRAB-1", price: 16000, stock: 200 },
      { value: "Hộp 12 gói", sku: "NEKKO-TUNA-CRAB-12", price: 180000, stock: 25 },
    ],
    ingredients: "Cá ngừ, thanh cua, nước dùng cá, chất tạo đông, taurine, vitamin E",
    kcal_per_kg: 780,
    feeding_guide: "Dùng 1–2 gói/ngày kèm hạt, hoặc 4 gói/ngày cho mèo 4 kg nếu chỉ ăn pate.",
  },

  // ---------- Mèo · Cát vệ sinh ----------
  {
    handle: "kit-cat-soya-clump",
    title: "Cát đậu nành Kit Cat Soya Clump 7L",
    brand: "Kit Cat",
    categories: ["meo-cat-ve-sinh"],
    tags: ["species:cat", "life:all", "form:litter"],
    description: "Cát làm từ bã đậu nành, vón nhanh, ít bụi và có thể xả bồn cầu từng lượng nhỏ.",
    option: "Mùi hương",
    variants: [
      { value: "Không mùi", sku: "KITCAT-SOYA-ORIG", price: 145000, stock: 60 },
      { value: "Trà xanh", sku: "KITCAT-SOYA-GTEA", price: 150000, stock: 45 },
      { value: "Đào", sku: "KITCAT-SOYA-PEACH", price: 150000, stock: 30 },
    ],
    bestseller: true,
  },
  {
    handle: "ever-clean-extra-strength",
    title: "Cát đất sét Ever Clean Extra Strength",
    brand: "Ever Clean",
    categories: ["meo-cat-ve-sinh"],
    tags: ["species:cat", "life:all", "form:litter"],
    description: "Cát bentonite vón cứng, khử mùi bằng than hoạt tính, phù hợp nhà nuôi nhiều mèo.",
    option: "Dung tích",
    variants: [
      { value: "6L", sku: "EVERCLEAN-ES-6L", price: 260000, stock: 25 },
      { value: "10L", sku: "EVERCLEAN-ES-10L", price: 390000, stock: 15 },
    ],
  },
  {
    handle: "pawl-basics-cat-tinh-the",
    title: "Cát tinh thể Pawl Basics 5L",
    brand: "Pawl Basics",
    categories: ["meo-cat-ve-sinh"],
    tags: ["species:cat", "life:all", "form:litter"],
    description: "Cát silica hút ẩm nhanh, đổi màu khi cần thay, một túi dùng khoảng 3–4 tuần cho một mèo.",
    option: "Quy cách",
    variants: [{ value: "Túi 5L", sku: "PAWL-SILICA-5L", price: 120000, stock: 80 }],
  },

  // ---------- Mèo · Snack ----------
  {
    handle: "ciao-churu-ca-ngu",
    title: "Súp thưởng Ciao Churu vị cá ngừ",
    brand: "Ciao",
    categories: ["meo-snack"],
    tags: ["species:cat", "life:all", "free:beef", "free:grain", "form:treat"],
    description: "Súp thưởng dạng kem, cho ăn trực tiếp từ thanh, tiện khi cho uống thuốc hoặc làm quen mèo mới.",
    option: "Quy cách",
    variants: [
      { value: "Gói 4 thanh x 14g", sku: "CHURU-TUNA-4", price: 45000, stock: 200 },
      { value: "Hộp 20 thanh", sku: "CHURU-TUNA-20", price: 210000, stock: 40 },
    ],
    ingredients: "Cá ngừ, chiết xuất cá ngừ, chất tạo đặc, vitamin E, chiết xuất trà xanh",
    kcal_per_kg: 600,
    feeding_guide: "Tối đa 4 thanh/ngày cho mèo 4 kg. Đây là đồ thưởng, không thay bữa chính.",
    bestseller: true,
  },
  {
    handle: "temptations-ga",
    title: "Bánh thưởng Temptations vị gà 85g",
    brand: "Temptations",
    categories: ["meo-snack"],
    tags: ["species:cat", "life:adult", "form:treat"],
    description: "Bánh giòn vỏ ngoài, nhân mềm bên trong, phù hợp để thưởng khi huấn luyện.",
    option: "Quy cách",
    variants: [{ value: "Túi 85g", sku: "TEMPT-CHICKEN-85G", price: 65000, stock: 90 }],
    ingredients: "Bột gà, ngũ cốc, mỡ động vật, sữa bột, taurine, vitamin",
    kcal_per_kg: 4200,
    feeding_guide: "Tối đa 15 viên/ngày cho mèo 4 kg.",
  },
  {
    handle: "greenies-dental-cat",
    title: "Bánh sạch răng Greenies cho mèo 60g",
    brand: "Greenies",
    categories: ["meo-snack"],
    tags: ["species:cat", "life:adult", "health:dental", "form:treat"],
    description: "Viên giòn có kết cấu giúp làm sạch mảng bám khi mèo nhai, thơm miệng hơn.",
    option: "Hương vị",
    variants: [
      { value: "Vị gà", sku: "GREENIES-CAT-CHICKEN", price: 120000, stock: 40 },
      { value: "Vị cá hồi", sku: "GREENIES-CAT-SALMON", price: 120000, stock: 35 },
    ],
    ingredients: "Bột gà hoặc bột cá hồi, gạo, gluten lúa mì, chất xơ, vitamin và khoáng chất",
    kcal_per_kg: 3900,
    feeding_guide: "10 viên/ngày cho mèo 4 kg, chia 2 lần.",
  },

  // ---------- Mèo · Dinh dưỡng bổ sung ----------
  {
    handle: "virbac-nutri-plus-gel",
    title: "Gel dinh dưỡng Virbac Nutri-Plus 120g",
    brand: "Virbac",
    categories: ["meo-dinh-duong", "cho-dinh-duong"],
    tags: ["species:cat", "species:dog", "life:all", "form:supplement"],
    description: "Gel năng lượng cao bổ sung vitamin, dùng khi thú cưng biếng ăn, mới ốm dậy hoặc đang mang thai.",
    option: "Quy cách",
    variants: [{ value: "Tuýp 120g", sku: "VIRBAC-NUTRI-120G", price: 210000, stock: 30 }],
    ingredients: "Dầu đậu nành, mạch nha, mật đường, vitamin A, D3, E, nhóm B, khoáng vi lượng",
    feeding_guide: "Mèo và chó nhỏ: 1–1,5 cm gel/ngày, bôi lên mũi chân hoặc trộn vào thức ăn.",
  },
  {
    handle: "gimcat-malt-soft",
    title: "Gel tiêu búi lông GimCat Malt-Soft",
    brand: "GimCat",
    categories: ["meo-dinh-duong"],
    tags: ["species:cat", "life:adult", "health:hairball", "form:supplement"],
    description: "Gel mạch nha giúp búi lông đi qua đường tiêu hoá dễ hơn, nhất là mùa mèo rụng lông.",
    option: "Quy cách",
    variants: [
      { value: "Tuýp 50g", sku: "GIMCAT-MALT-50G", price: 125000, stock: 40 },
      { value: "Tuýp 100g", sku: "GIMCAT-MALT-100G", price: 210000, stock: 25 },
    ],
    ingredients: "Chiết xuất mạch nha, dầu thực vật, chất xơ, men bia, vitamin E",
    feeding_guide: "Mèo trưởng thành: 2–3 cm gel/ngày trong 1–2 tuần, sau đó 2–3 lần/tuần.",
  },
  {
    handle: "pawl-basics-omega-3",
    title: "Viên dầu cá Omega-3 Pawl Basics",
    brand: "Pawl Basics",
    categories: ["meo-dinh-duong", "cho-dinh-duong"],
    tags: ["species:cat", "species:dog", "life:all", "health:skin-coat", "free:chicken", "free:beef", "free:grain", "form:supplement"],
    description: "Viên nang dầu cá giàu EPA và DHA, hỗ trợ da khoẻ và lông bóng mượt.",
    option: "Quy cách",
    variants: [
      { value: "Hộp 60 viên", sku: "PAWL-OMEGA3-60", price: 180000, stock: 60 },
      { value: "Hộp 120 viên", sku: "PAWL-OMEGA3-120", price: 320000, stock: 30 },
    ],
    ingredients: "Dầu cá biển sâu (EPA, DHA), vitamin E, vỏ nang gelatin",
    feeding_guide: "Mèo và chó dưới 10 kg: 1 viên/ngày; chó 10–25 kg: 2 viên/ngày. Cắt viên, nhỏ dầu vào thức ăn.",
  },

  // ---------- Mèo · Phụ kiện ----------
  {
    handle: "pawl-basics-can-cau-long-vu",
    title: "Cần câu mèo lông vũ Pawl Basics",
    brand: "Pawl Basics",
    categories: ["meo-phu-kien"],
    tags: ["species:cat", "life:all", "form:accessory"],
    description: "Cần dẻo dài 60 cm gắn lông vũ và chuông nhỏ, giúp mèo vận động và giải toả năng lượng.",
    option: "Quy cách",
    variants: [{ value: "1 cần + 2 đầu thay", sku: "PAWL-TEASER-SET", price: 35000, stock: 150 }],
  },
  {
    handle: "pawl-basics-khay-ve-sinh",
    title: "Khay vệ sinh thành cao Pawl Basics",
    brand: "Pawl Basics",
    categories: ["meo-phu-kien"],
    tags: ["species:cat", "life:all", "form:accessory"],
    description: "Khay nhựa PP thành cao chống văng cát, kèm xẻng xúc. Dễ rửa, không bám mùi.",
    option: "Kích cỡ",
    variants: [
      { value: "M (40 x 30 cm)", sku: "PAWL-TRAY-M", price: 150000, stock: 30 },
      { value: "L (50 x 38 cm)", sku: "PAWL-TRAY-L", price: 220000, stock: 20 },
    ],
  },
  {
    handle: "pawl-basics-bat-an-doi",
    title: "Bát ăn đôi inox chống trượt",
    brand: "Pawl Basics",
    categories: ["meo-phu-kien"],
    tags: ["species:cat", "life:all", "form:accessory"],
    description: "Hai bát inox tháo rời trên đế nghiêng 15°, giúp mèo ăn đỡ mỏi cổ và bát không bị trượt.",
    option: "Quy cách",
    variants: [{ value: "2 bát 200ml", sku: "PAWL-BOWL-DOUBLE", price: 120000, stock: 45 }],
  },

  // ---------- Chó · Thức ăn hạt ----------
  {
    handle: "royal-canin-mini-adult",
    title: "Royal Canin Mini Adult cho chó giống nhỏ",
    brand: "Royal Canin",
    categories: ["cho-thuc-an-hat"],
    tags: ["species:dog", "life:adult", "form:dry"],
    description: "Hạt nhỏ cho chó trưởng thành dưới 10 kg, đáp ứng nhu cầu năng lượng cao của giống chó nhỏ.",
    option: "Khối lượng",
    variants: [
      { value: "800g", sku: "RC-MINIADULT-800G", price: 210000, stock: 40 },
      { value: "2kg", sku: "RC-MINIADULT-2KG", price: 470000, stock: 20 },
    ],
    ingredients: "Gạo, protein gia cầm sấy, ngô, chất béo động vật, củ dền, dầu cá, vitamin và khoáng chất",
    kcal_per_kg: 3830,
    feeding_guide: "Chó 4 kg: 70 g/ngày; 6 kg: 95 g/ngày; 8 kg: 115 g/ngày.",
    bestseller: true,
  },
  {
    handle: "pedigree-puppy-ga-trung",
    title: "Pedigree Puppy vị gà và trứng sữa",
    brand: "Pedigree",
    categories: ["cho-thuc-an-hat"],
    tags: ["species:dog", "life:puppy", "free:beef", "form:dry"],
    description: "Hạt cho chó con, bổ sung canxi cho xương và DHA cho phát triển trí não.",
    option: "Khối lượng",
    variants: [
      { value: "400g", sku: "PED-PUPPY-400G", price: 55000, stock: 100 },
      { value: "1.5kg", sku: "PED-PUPPY-1500G", price: 165000, stock: 50 },
    ],
    ingredients: "Ngũ cốc, bột gà, trứng, sữa bột, dầu thực vật, canxi, DHA, vitamin và khoáng chất",
    kcal_per_kg: 3700,
    feeding_guide: "Chó con 2–5 kg: 60–120 g/ngày, chia 3–4 bữa.",
  },
  {
    handle: "smartheart-adult-bo-nuong",
    title: "SmartHeart Adult vị bò nướng",
    brand: "SmartHeart",
    categories: ["cho-thuc-an-hat"],
    tags: ["species:dog", "life:adult", "free:chicken", "form:dry"],
    description: "Hạt vị bò nướng cho chó trưởng thành mọi giống, hương vị đậm giúp chó ăn ngon miệng.",
    option: "Khối lượng",
    variants: [
      { value: "1.5kg", sku: "SH-ADULT-BEEF-1500G", price: 125000, stock: 60 },
      { value: "3kg", sku: "SH-ADULT-BEEF-3KG", price: 230000, stock: 30 },
    ],
    ingredients: "Ngô, gạo, bột thịt bò, bột cá, mỡ bò, dầu thực vật, vitamin và khoáng chất",
    kcal_per_kg: 3500,
    feeding_guide: "Chó 5 kg: 100 g/ngày; 10 kg: 170 g/ngày; 20 kg: 280 g/ngày.",
  },
  {
    handle: "ganador-adult-salmon",
    title: "Ganador Adult cá hồi và gạo",
    brand: "Ganador",
    categories: ["cho-thuc-an-hat"],
    tags: ["species:dog", "life:adult", "health:skin-coat", "free:chicken", "free:beef", "form:dry"],
    description: "Đạm từ cá hồi, giàu omega-3 cho da và lông, phù hợp chó không hợp đạm gà hoặc bò.",
    option: "Khối lượng",
    variants: [
      { value: "1.5kg", sku: "GANADOR-SALMON-1500G", price: 145000, stock: 45 },
      { value: "3kg", sku: "GANADOR-SALMON-3KG", price: 275000, stock: 20 },
    ],
    ingredients: "Gạo, bột cá hồi, bột cá, dầu cá, củ dền, vitamin và khoáng chất",
    kcal_per_kg: 3600,
    feeding_guide: "Chó 5 kg: 95 g/ngày; 10 kg: 160 g/ngày; 20 kg: 270 g/ngày.",
  },
  {
    handle: "royal-canin-mini-light",
    title: "Royal Canin Mini Light Weight Care",
    brand: "Royal Canin",
    categories: ["cho-thuc-an-hat"],
    tags: ["species:dog", "life:adult", "health:weight-control", "health:sterilised", "form:dry"],
    description: "Hạt giảm năng lượng cho chó giống nhỏ có xu hướng tăng cân hoặc đã triệt sản.",
    option: "Khối lượng",
    variants: [{ value: "1kg", sku: "RC-MINILIGHT-1KG", price: 280000, stock: 15 }],
    ingredients: "Gạo, protein gia cầm sấy, chất xơ thực vật, gluten ngô, chất béo động vật, L-carnitine, vitamin và khoáng chất",
    kcal_per_kg: 3400,
    feeding_guide: "Chó 4 kg: 60 g/ngày; 6 kg: 80 g/ngày; 8 kg: 100 g/ngày.",
  },

  // ---------- Chó · Pate ----------
  {
    handle: "pedigree-pate-bo",
    title: "Pate Pedigree vị bò 130g",
    brand: "Pedigree",
    categories: ["cho-pate"],
    tags: ["species:dog", "life:adult", "form:wet"],
    description: "Pate miếng mềm trong nước sốt vị bò, trộn cùng hạt để bữa ăn hấp dẫn hơn.",
    option: "Quy cách",
    variants: [
      { value: "1 gói 130g", sku: "PED-PATE-BEEF-1", price: 22000, stock: 200 },
      { value: "Hộp 12 gói", sku: "PED-PATE-BEEF-12", price: 250000, stock: 25 },
    ],
    ingredients: "Thịt bò, thịt gia cầm, nước sốt, ngũ cốc, vitamin và khoáng chất",
    kcal_per_kg: 900,
    feeding_guide: "Chó 5 kg: 1 gói kèm 70 g hạt/ngày.",
    bestseller: true,
  },
  {
    handle: "royal-canin-mini-adult-wet",
    title: "Pate Royal Canin Mini Adult 85g",
    brand: "Royal Canin",
    categories: ["cho-pate"],
    tags: ["species:dog", "life:adult", "form:wet"],
    description: "Pate dạng miếng trong sốt cho chó giống nhỏ trưởng thành.",
    option: "Quy cách",
    variants: [
      { value: "1 gói 85g", sku: "RC-MINI-WET-1", price: 32000, stock: 120 },
      { value: "Hộp 12 gói", sku: "RC-MINI-WET-12", price: 360000, stock: 15 },
    ],
    ingredients: "Thịt và phụ phẩm từ thịt, ngũ cốc, khoáng chất, dầu cá, vitamin",
    kcal_per_kg: 820,
    feeding_guide: "Chó 4 kg: 1 gói kèm 55 g hạt/ngày.",
  },

  // ---------- Chó · Snack ----------
  {
    handle: "pedigree-dentastix-small",
    title: "Xương sạch răng Pedigree Dentastix cho chó nhỏ",
    brand: "Pedigree",
    categories: ["cho-snack"],
    tags: ["species:dog", "life:adult", "health:dental", "form:treat"],
    description: "Thanh nhai hình chữ X giúp giảm mảng bám và cao răng khi chó gặm mỗi ngày.",
    option: "Quy cách",
    variants: [
      { value: "Túi 7 thanh", sku: "PED-DENTA-S-7", price: 75000, stock: 80 },
      { value: "Túi 28 thanh", sku: "PED-DENTA-S-28", price: 260000, stock: 20 },
    ],
    ingredients: "Bột gạo, tinh bột, glycerin, bột gia cầm, chất xơ, kẽm sulfat, chiết xuất trà xanh",
    kcal_per_kg: 2900,
    feeding_guide: "Chó 5–10 kg: 1 thanh/ngày.",
  },
  {
    handle: "jerhigh-ga",
    title: "Bánh thưởng Jerhigh vị gà 70g",
    brand: "Jerhigh",
    categories: ["cho-snack"],
    tags: ["species:dog", "life:all", "free:beef", "form:treat"],
    description: "Que thịt gà mềm, dễ bẻ nhỏ để thưởng khi huấn luyện.",
    option: "Quy cách",
    variants: [{ value: "Túi 70g", sku: "JERHIGH-CHICKEN-70G", price: 45000, stock: 100 }],
    ingredients: "Thịt gà, tinh bột, glycerin, muối, vitamin E",
    kcal_per_kg: 3100,
    feeding_guide: "Chó 5 kg: tối đa 3 que/ngày.",
  },

  // ---------- Chó · Dinh dưỡng bổ sung ----------
  {
    handle: "pawl-basics-canxi-cho-con",
    title: "Viên canxi Pawl Basics cho chó con",
    brand: "Pawl Basics",
    categories: ["cho-dinh-duong"],
    tags: ["species:dog", "life:puppy", "form:supplement"],
    description: "Viên nhai bổ sung canxi, phốt pho và vitamin D3 cho chó con đang lớn.",
    option: "Quy cách",
    variants: [{ value: "Hộp 100 viên", sku: "PAWL-CALCIUM-100", price: 150000, stock: 40 }],
    ingredients: "Canxi carbonat, dicanxi phốt phát, vitamin D3, bột gan, men bia",
    feeding_guide: "Chó con dưới 5 kg: 1 viên/ngày; 5–15 kg: 2 viên/ngày.",
  },

  // ---------- Chó · Phụ kiện ----------
  {
    handle: "pawl-basics-day-dat-phan-quang",
    title: "Bộ dây dắt và vòng cổ phản quang",
    brand: "Pawl Basics",
    categories: ["cho-phu-kien"],
    tags: ["species:dog", "life:all", "form:accessory"],
    description: "Dây dù có viền phản quang, khoá nhựa chắc chắn, an toàn khi dắt chó đi dạo buổi tối.",
    option: "Kích cỡ",
    variants: [
      { value: "S (cổ 25–35 cm)", sku: "PAWL-LEASH-S", price: 120000, stock: 30 },
      { value: "M (cổ 35–45 cm)", sku: "PAWL-LEASH-M", price: 140000, stock: 25 },
      { value: "L (cổ 45–55 cm)", sku: "PAWL-LEASH-L", price: 160000, stock: 15 },
    ],
  },
  {
    handle: "kong-classic",
    title: "Đồ chơi gặm KONG Classic",
    brand: "KONG",
    categories: ["cho-phu-kien"],
    tags: ["species:dog", "life:all", "form:accessory"],
    description: "Đồ chơi cao su tự nhiên nảy khó đoán, có thể nhồi pate hoặc snack để chó tự chơi lâu hơn.",
    option: "Kích cỡ",
    variants: [
      { value: "S", sku: "KONG-CLASSIC-S", price: 220000, stock: 20 },
      { value: "M", sku: "KONG-CLASSIC-M", price: 290000, stock: 15 },
    ],
  },
]
