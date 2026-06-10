import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

const healthcareProducts = [
  // ── Vitamins ──────────────────────────────────────────────────────────────
  {
    name: 'Vitamin C 1000mg',
    category: 'Vitamins',
    description: 'High-potency Vitamin C with rose hips for immune support, antioxidant protection, and skin health. Helps reduce cold duration.',
    price: 349,
    tags: ['vitamin c', 'immunity', 'antioxidant', 'skin', 'ascorbic acid'],
    stock: 150,
  },
  {
    name: 'Vitamin D3 2000 IU',
    category: 'Vitamins',
    description: 'Essential Vitamin D3 for bone strength, calcium absorption, immune function, and mood regulation. Ideal for people with limited sun exposure.',
    price: 299,
    tags: ['vitamin d', 'bone health', 'immunity', 'calcium absorption', 'sunshine vitamin'],
    stock: 200,
  },
  {
    name: 'Vitamin B Complex',
    category: 'Vitamins',
    description: 'Complete B-vitamin formula with B1, B2, B3, B5, B6, B7, B9, and B12. Supports energy metabolism, nerve function, and red blood cell production.',
    price: 399,
    tags: ['b vitamins', 'energy', 'nerve health', 'b12', 'folate', 'metabolism'],
    stock: 120,
  },
  {
    name: 'Vitamin E 400 IU',
    category: 'Vitamins',
    description: 'Natural Vitamin E (d-alpha tocopherol) with powerful antioxidant properties. Supports skin health, eye health, and immune function.',
    price: 279,
    tags: ['vitamin e', 'antioxidant', 'skin', 'eye health', 'tocopherol'],
    stock: 90,
  },
  {
    name: 'Vitamin K2 + D3 Combo',
    category: 'Vitamins',
    description: 'Synergistic K2 (MK-7) and D3 combination for optimal calcium utilization — builds bones and keeps arteries healthy.',
    price: 499,
    tags: ['vitamin k2', 'vitamin d3', 'bone health', 'heart health', 'mk7', 'calcium'],
    stock: 80,
  },
  {
    name: 'Multivitamin Daily Formula',
    category: 'Vitamins',
    description: 'Comprehensive daily multivitamin with 25+ vitamins and minerals. Fills nutritional gaps for overall well-being and vitality.',
    price: 449,
    tags: ['multivitamin', 'daily vitamin', 'minerals', 'immunity', 'energy', 'comprehensive'],
    stock: 300,
  },

  // ── Supplements ──────────────────────────────────────────────────────────
  {
    name: 'Omega-3 Fish Oil 1000mg',
    category: 'Supplements',
    description: 'Premium fish oil rich in EPA and DHA omega-3 fatty acids. Supports heart health, brain function, joint mobility, and reduces inflammation.',
    price: 599,
    tags: ['omega 3', 'fish oil', 'heart health', 'brain', 'joint health', 'epa', 'dha', 'inflammation'],
    stock: 180,
  },
  {
    name: 'Calcium + Magnesium 500mg',
    category: 'Bone Health',
    description: 'Calcium with Magnesium for strong bones, teeth, and muscle function. Essential for preventing osteoporosis and bone density loss.',
    price: 389,
    tags: ['calcium', 'magnesium', 'bone health', 'osteoporosis', 'teeth', 'muscle'],
    stock: 160,
  },
  {
    name: 'Collagen Peptides Powder',
    category: 'Supplements',
    description: 'Hydrolyzed collagen peptides for youthful skin, strong joints, hair, and nails. Type I and III collagen for maximum benefit.',
    price: 799,
    tags: ['collagen', 'skin', 'joints', 'hair', 'nails', 'anti-aging', 'peptides'],
    stock: 100,
  },
  {
    name: 'Probiotics 50 Billion CFU',
    category: 'Digestive Health',
    description: 'High-potency probiotic with 15+ strains for gut health, digestion, immunity, and bloating relief. Shelf-stable formula.',
    price: 649,
    tags: ['probiotics', 'gut health', 'digestion', 'bloating', 'immunity', 'lactobacillus'],
    stock: 130,
  },
  {
    name: 'Whey Protein Isolate',
    category: 'Protein & Fitness',
    description: 'Ultra-pure whey protein isolate with 25g protein per serving. Supports muscle building, recovery, and weight management. Chocolate flavor.',
    price: 2499,
    tags: ['protein', 'whey', 'muscle', 'fitness', 'recovery', 'workout', 'sports'],
    stock: 75,
  },
  {
    name: 'CoQ10 100mg',
    category: 'Heart Health',
    description: 'Coenzyme Q10 for cellular energy production and heart health. Essential antioxidant that declines with age. Supports statin therapy.',
    price: 549,
    tags: ['coq10', 'heart health', 'energy', 'antioxidant', 'cellular', 'cardiovascular'],
    stock: 85,
  },

  // ── Hair & Nail ───────────────────────────────────────────────────────────
  {
    name: 'Biotin 10000mcg',
    category: 'Hair & Nail',
    description: 'High-dose Biotin (B7) for hair growth, stronger nails, and healthy skin. Helps with hair fall, thinning, and brittle nails.',
    price: 349,
    tags: ['biotin', 'hair growth', 'hair fall', 'nails', 'skin', 'b7', 'keratin'],
    stock: 220,
  },
  {
    name: 'Hair Vitamins Complex',
    category: 'Hair & Nail',
    description: 'Complete hair nutrition with Biotin, Zinc, Iron, Vitamin E, and Saw Palmetto. Reduces hair fall and promotes thickness and shine.',
    price: 699,
    tags: ['hair fall', 'hair growth', 'biotin', 'zinc', 'iron', 'hair vitamins', 'thinning'],
    stock: 110,
  },
  {
    name: 'Iron + Folic Acid',
    category: 'Supplements',
    description: 'Ferrous sulphate iron supplement with Folic Acid for anemia prevention, hair fall due to iron deficiency, energy levels, and healthy pregnancy.',
    price: 249,
    tags: ['iron', 'folic acid', 'anemia', 'hair fall', 'energy', 'pregnancy', 'folate'],
    stock: 200,
  },

  // ── Bone Health ───────────────────────────────────────────────────────────
  {
    name: 'Bone Care Advanced',
    category: 'Bone Health',
    description: 'Complete bone health supplement with Calcium, Vitamin D3, K2, Magnesium, and Zinc. Clinically proven for osteoporosis prevention.',
    price: 799,
    tags: ['bone health', 'calcium', 'vitamin d', 'osteoporosis', 'fracture', 'joint pain', 'arthritis'],
    stock: 90,
  },
  {
    name: 'Glucosamine & Chondroitin',
    category: 'Bone Health',
    description: 'Joint health supplement with Glucosamine Sulfate and Chondroitin. Reduces joint pain, stiffness, and supports cartilage regeneration.',
    price: 699,
    tags: ['glucosamine', 'chondroitin', 'joint pain', 'arthritis', 'cartilage', 'knee pain', 'bone health'],
    stock: 70,
  },

  // ── Immunity ──────────────────────────────────────────────────────────────
  {
    name: 'Zinc 50mg Immune Support',
    category: 'Immunity',
    description: 'Zinc Gluconate for immune system strength, wound healing, testosterone support, and reducing cold duration and severity.',
    price: 229,
    tags: ['zinc', 'immunity', 'immune system', 'cold', 'wound healing', 'testosterone'],
    stock: 250,
  },
  {
    name: 'Elderberry + Vitamin C Gummies',
    category: 'Immunity',
    description: 'Delicious elderberry gummies with Vitamin C and Zinc for powerful immune defense. Great for children and adults. No artificial colors.',
    price: 499,
    tags: ['elderberry', 'vitamin c', 'immunity', 'gummies', 'cold and flu', 'kids', 'zinc'],
    stock: 140,
  },
  {
    name: 'Ashwagandha KSM-66 500mg',
    category: 'Sleep & Stress',
    description: 'Certified KSM-66 Ashwagandha root extract. Reduces cortisol, relieves stress and anxiety, improves sleep quality, and boosts stamina.',
    price: 549,
    tags: ['ashwagandha', 'stress', 'anxiety', 'sleep', 'cortisol', 'adaptogen', 'energy', 'stamina'],
    stock: 160,
  },
  {
    name: 'Turmeric Curcumin 1000mg',
    category: 'Immunity',
    description: 'High-absorption Turmeric with BioPerine. Powerful anti-inflammatory and antioxidant for joint pain, immunity, and overall wellness.',
    price: 399,
    tags: ['turmeric', 'curcumin', 'anti-inflammatory', 'antioxidant', 'joint pain', 'immunity', 'bioperine'],
    stock: 175,
  },

  // ── Digestive Health ─────────────────────────────────────────────────────
  {
    name: 'Digestive Enzymes Complex',
    category: 'Digestive Health',
    description: 'Complete enzyme blend with Amylase, Lipase, Protease, Lactase, and Bromelain for improved digestion, bloating relief, and nutrient absorption.',
    price: 449,
    tags: ['digestive enzymes', 'bloating', 'digestion', 'lactose', 'gas', 'nutrients', 'gut'],
    stock: 100,
  },
  {
    name: 'Fiber + Prebiotic Powder',
    category: 'Digestive Health',
    description: 'Psyllium husk and Inulin fiber blend that supports healthy bowel movements, feeds good gut bacteria, and helps manage blood sugar and cholesterol.',
    price: 329,
    tags: ['fiber', 'prebiotic', 'constipation', 'gut health', 'cholesterol', 'blood sugar', 'digestion'],
    stock: 120,
  },
  {
    name: 'Aloe Vera Digestive Support',
    category: 'Digestive Health',
    description: 'Pure Aloe Vera extract for soothing the digestive tract, relieving acidity, constipation, IBS symptoms, and promoting gut lining health.',
    price: 299,
    tags: ['aloe vera', 'acidity', 'digestion', 'ibs', 'constipation', 'gut health', 'soothing'],
    stock: 95,
  },

  // ── Skin Care ─────────────────────────────────────────────────────────────
  {
    name: 'Hyaluronic Acid 200mg',
    category: 'Skin Care',
    description: 'High-molecular-weight Hyaluronic Acid for deep skin hydration, plumpness, and reducing wrinkles. Supports joint lubrication too.',
    price: 499,
    tags: ['hyaluronic acid', 'skin', 'hydration', 'anti-aging', 'wrinkles', 'joints'],
    stock: 110,
  },
  {
    name: 'Glutathione 500mg',
    category: 'Skin Care',
    description: 'Reduced L-Glutathione for skin brightening, anti-aging, liver detox, and powerful antioxidant protection. Enhances skin glow.',
    price: 899,
    tags: ['glutathione', 'skin brightening', 'anti-aging', 'detox', 'antioxidant', 'glow'],
    stock: 60,
  },
  {
    name: 'Vitamin C Serum Capsules',
    category: 'Skin Care',
    description: 'Stable Vitamin C (Ascorbyl Palmitate) with Vitamin E and Ferulic Acid for collagen synthesis, hyperpigmentation, and UV damage repair.',
    price: 649,
    tags: ['vitamin c', 'skin', 'collagen', 'hyperpigmentation', 'dark spots', 'serum', 'brightening'],
    stock: 85,
  },

  // ── Pain Relief ───────────────────────────────────────────────────────────
  {
    name: 'Magnesium Glycinate 400mg',
    category: 'Pain Relief',
    description: 'Highly bioavailable Magnesium Glycinate for muscle cramps, headaches, migraines, sleep quality, and nervous system support.',
    price: 449,
    tags: ['magnesium', 'muscle cramps', 'headache', 'migraine', 'sleep', 'pain relief', 'anxiety'],
    stock: 140,
  },
  {
    name: 'Boswellia Serrata Extract',
    category: 'Pain Relief',
    description: 'Standardized Boswellic acid extract for chronic joint pain, knee arthritis, inflammatory bowel disease, and back pain. Natural alternative.',
    price: 499,
    tags: ['boswellia', 'joint pain', 'arthritis', 'back pain', 'anti-inflammatory', 'ibd', 'natural'],
    stock: 75,
  },

  // ── Heart Health ─────────────────────────────────────────────────────────
  {
    name: 'Red Yeast Rice 600mg',
    category: 'Heart Health',
    description: 'Natural statin-like supplement for cholesterol management. Helps lower LDL cholesterol and support cardiovascular health.',
    price: 549,
    tags: ['cholesterol', 'heart health', 'cardiovascular', 'ldl', 'red yeast rice'],
    stock: 65,
  },
  {
    name: 'Garlic Extract 1000mg',
    category: 'Heart Health',
    description: 'Odorless Garlic extract (Allicin) for blood pressure management, cholesterol reduction, immune boost, and antimicrobial properties.',
    price: 299,
    tags: ['garlic', 'blood pressure', 'heart health', 'cholesterol', 'immunity', 'antimicrobial'],
    stock: 180,
  },

  // ── Eye Care ──────────────────────────────────────────────────────────────
  {
    name: 'Lutein & Zeaxanthin 20mg',
    category: 'Eye Care',
    description: 'Eye health supplement with Lutein and Zeaxanthin for protection against blue light, macular degeneration, and eye strain.',
    price: 529,
    tags: ['lutein', 'zeaxanthin', 'eye health', 'macular degeneration', 'blue light', 'vision'],
    stock: 90,
  },

  // ── Weight Management ─────────────────────────────────────────────────────
  {
    name: 'Green Tea Extract 500mg',
    category: 'Weight Management',
    description: 'Standardized Green Tea Extract with 50% EGCG for metabolism boost, fat burning, energy, and antioxidant support.',
    price: 379,
    tags: ['green tea', 'weight loss', 'metabolism', 'fat burning', 'egcg', 'energy', 'antioxidant'],
    stock: 150,
  },
  {
    name: 'Apple Cider Vinegar Capsules',
    category: 'Weight Management',
    description: 'Concentrated ACV capsules with the mother for appetite control, blood sugar regulation, digestion, and weight management — no unpleasant taste.',
    price: 349,
    tags: ['apple cider vinegar', 'acv', 'weight management', 'blood sugar', 'appetite', 'digestion'],
    stock: 200,
  },

  // ── Sleep & Stress ────────────────────────────────────────────────────────
  {
    name: 'Melatonin 5mg Sleep Aid',
    category: 'Sleep & Stress',
    description: 'Fast-dissolving Melatonin for natural sleep regulation, jet lag recovery, and insomnia relief without morning grogginess.',
    price: 249,
    tags: ['melatonin', 'sleep', 'insomnia', 'jet lag', 'rest', 'sleep aid'],
    stock: 300,
  },
  {
    name: 'L-Theanine 200mg',
    category: 'Sleep & Stress',
    description: 'Natural L-Theanine amino acid for calm focus, stress relief, anxiety reduction, and improved sleep quality without sedation.',
    price: 379,
    tags: ['l-theanine', 'stress', 'anxiety', 'focus', 'calm', 'sleep', 'relaxation'],
    stock: 120,
  },

  // ── Diabetes Care ─────────────────────────────────────────────────────────
  {
    name: 'Berberine 500mg',
    category: 'Diabetes Care',
    description: 'Pharmaceutical-grade Berberine for blood sugar control, insulin sensitivity, PCOS support, and cholesterol management. Comparable to Metformin.',
    price: 649,
    tags: ['berberine', 'blood sugar', 'diabetes', 'insulin', 'pcos', 'cholesterol', 'glucose'],
    stock: 85,
  },
  {
    name: 'Chromium Picolinate 200mcg',
    category: 'Diabetes Care',
    description: 'Chromium Picolinate for blood sugar regulation, insulin function, reducing sugar cravings, and supporting healthy carbohydrate metabolism.',
    price: 279,
    tags: ['chromium', 'blood sugar', 'insulin', 'sugar cravings', 'diabetes', 'metabolism'],
    stock: 130,
  },
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  const productsService = app.get(ProductsService);

  const count = await productsService.getProductCount();
  if (count > 0) {
    console.log(`✅ Database already has ${count} products. Skipping seed.`);
    await app.close();
    process.exit(0);
  }

  console.log('🌱 Seeding healthcare products...');
  await productsService.bulkCreate(healthcareProducts);
  console.log(`✅ Seeded ${healthcareProducts.length} healthcare products successfully!`);
  await app.close();
  process.exit(0);
}

bootstrap().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
