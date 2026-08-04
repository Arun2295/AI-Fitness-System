import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────

interface ArticleSection { heading?: string; body: string; }

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  author: string;
  authorRole: string;
  updated: string;
  emoji: string;
  tags: string[];
  featured?: boolean;
  trending?: boolean;
  views: number;
  keyTakeaways?: string[];
  sections: ArticleSection[];
}

// ── Full Article Content ───────────────────────────────────────────────────

const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'The Complete Guide to Macronutrients',
    excerpt: 'Understand the role of proteins, carbohydrates, and fats in your diet and how to balance them for optimal health and performance.',
    category: 'Protein', readTime: 8, difficulty: 'Beginner',
    author: 'Dr. Sarah Chen', authorRole: 'Sports Nutritionist', updated: 'Jul 28, 2026',
    emoji: '💪', tags: ['macros', 'protein', 'diet'], featured: true, trending: true, views: 12400,
    keyTakeaways: [
      'Protein builds and repairs muscle — aim for 1.6–2.2 g/kg body weight.',
      'Carbohydrates are your primary fuel source for high-intensity exercise.',
      'Healthy fats support hormones, brain function, and fat-soluble vitamins.',
      'No single macro is "bad" — balance is everything.',
    ],
    sections: [
      {
        heading: 'What Are Macronutrients?',
        body: `Macronutrients — commonly called "macros" — are the three primary categories of nutrients your body uses in large amounts to produce energy and support vital functions. They are **protein**, **carbohydrates**, and **fat**. Unlike micronutrients (vitamins and minerals), which are needed in trace amounts, macronutrients form the caloric foundation of your diet.\n\nEach macro provides a different number of calories per gram: protein and carbohydrates provide 4 kcal/g, while fat provides 9 kcal/g. This dense caloric profile of fat is why it has been unfairly demonized for decades — but as we'll explain, fat is essential for life.`,
      },
      {
        heading: 'Protein: The Builder',
        body: `Protein is composed of amino acids, the molecular building blocks the body uses to repair muscle tissue, synthesize enzymes and hormones, and support immune function. There are 20 amino acids in total — 9 of which are "essential," meaning your body cannot synthesize them and you must obtain them from food.\n\n**Complete proteins** (containing all 9 essential amino acids) are found in animal products like meat, poultry, eggs, dairy, and fish. Plant-based sources like quinoa, soy, and buckwheat are also complete. Most legumes and grains are incomplete but can be combined strategically.\n\nFor active individuals seeking muscle maintenance or growth, the research consistently supports intakes of **1.6–2.2 g/kg/day**. Sedentary adults need roughly 0.8 g/kg/day as a minimum. High protein intake also increases satiety, preserves lean mass during caloric restriction, and has a high thermic effect — your body burns about 20–30% of protein calories during digestion.`,
      },
      {
        heading: 'Carbohydrates: The Fuel',
        body: `Carbohydrates are your body's preferred fuel source — especially for the brain and during high-intensity exercise. They are broken down into glucose, which enters cells via insulin and is oxidized for ATP (energy) or stored as glycogen in muscle and liver.\n\nNot all carbs are equal. **Simple carbohydrates** (sugar, white bread, juice) are digested rapidly, causing blood glucose spikes. **Complex carbohydrates** (oats, brown rice, sweet potatoes, legumes) digest slowly, providing sustained energy and feeding beneficial gut bacteria via their fiber content.\n\nThe **Glycemic Index (GI)** ranks foods by how quickly they raise blood sugar. A more practical metric is **Glycemic Load (GL)**, which accounts for portion size. For most people, basing carbohydrate choices on whole-food, fiber-rich sources is more important than obsessing over GI scores.`,
      },
      {
        heading: 'Fats: The Regulator',
        body: `Dietary fat performs critical functions: it enables absorption of fat-soluble vitamins (A, D, E, K), serves as a structural component of every cell membrane, provides the backbone for steroid hormones (including testosterone and estrogen), and is a major fuel source at rest and during low-intensity exercise.\n\n**Unsaturated fats** (found in olive oil, nuts, avocados, and fatty fish) are anti-inflammatory and heart-protective. **Saturated fats** (found in butter, red meat, coconut oil) should be limited but are not the villain they were once portrayed as. **Trans fats** (partially hydrogenated oils) are genuinely harmful and best avoided entirely.\n\nOmega-3 fatty acids (EPA and DHA) deserve special mention — they reduce inflammation, support brain health, and improve cardiovascular markers. Aim for at least 2 servings of fatty fish per week or supplement with 1–3 g/day of EPA+DHA.`,
      },
      {
        heading: 'How to Balance Your Macros',
        body: `A common evidence-based starting point for healthy adults is the **"40-30-30" split** — 40% carbohydrates, 30% protein, 30% fat. However, optimal ratios vary depending on your goal:\n\n• **Fat Loss:** Higher protein (35%), moderate fat (30%), lower carbs (35%) helps preserve muscle while in a deficit.\n• **Muscle Gain:** Higher carbs (45-50%) replenish glycogen and support training intensity; protein remains high (30%).\n• **Endurance Sport:** Carbs take priority (55-65%) to fuel prolonged aerobic work; protein moderate (20%), fat low (15-25%).\n• **Ketogenic:** Very high fat (70%), adequate protein (25%), minimal carbs (<5%) — effective for some metabolic conditions but not necessary for most people.\n\nThe most important factor? **Consistency and food quality** within your chosen approach.`,
      },
    ],
  },
  {
    id: 'a2',
    title: 'Hydration Science: How Much Water Do You Really Need?',
    excerpt: 'Debunking the 8-glasses myth with science-backed hydration guidelines tailored to your activity level, climate, and body weight.',
    category: 'Hydration', readTime: 6, difficulty: 'Beginner',
    author: 'James Miller', authorRole: 'Exercise Physiologist', updated: 'Jul 30, 2026',
    emoji: '💧', tags: ['hydration', 'water', 'performance'], featured: true, trending: true, views: 9800,
    keyTakeaways: [
      'The "8 glasses a day" rule has no solid scientific backing.',
      'Urine color is a simple, reliable hydration indicator.',
      'Even 2% dehydration impairs strength, endurance, and cognition.',
      'Electrolytes matter as much as total water volume during exercise.',
    ],
    sections: [
      {
        heading: 'Where Did "8 Glasses a Day" Come From?',
        body: `The ubiquitous advice to drink eight 8-ounce glasses of water per day (roughly 2 liters) traces back to a 1945 US Food and Nutrition Board recommendation — but that same recommendation noted that "most of this quantity is contained in prepared foods." The caveat was lost; the number persisted.\n\nDr. Heinz Valtin published a landmark 2002 review in the American Journal of Physiology finding **no scientific evidence** supporting this specific rule for healthy adults. Hydration needs are individual and dynamic — not a fixed daily quota.`,
      },
      {
        heading: 'How Your Body Signals Thirst',
        body: `Your hypothalamus continuously monitors blood osmolality (the concentration of dissolved particles in blood). When fluid is lost through sweat, respiration, or urine, osmolality rises. Osmoreceptor neurons detect this change and trigger thirst — a sophisticated biological signal.\n\nFor most **healthy, non-exercising adults**, drinking to thirst is sufficient. However, thirst can lag behind fluid loss during exercise, in hot climates, and in older adults whose thirst mechanism becomes less sensitive with age. In these populations, proactive hydration strategy is important.\n\n**Urine color** is a practical, evidence-based real-time indicator:\n• Pale yellow → well hydrated\n• Dark yellow → mildly dehydrated\n• Amber or brown → significantly dehydrated`,
      },
      {
        heading: 'Evidence-Based Daily Targets',
        body: `The National Academies of Sciences provides **Adequate Intake (AI)** estimates based on total water from all sources (food + beverages):\n\n• **Women:** ~2.7 L/day total (roughly 2.0–2.2 L from drinks)\n• **Men:** ~3.7 L/day total (roughly 2.8–3.0 L from drinks)\n\nA practical body-weight formula: **35 mL × body weight in kg = baseline daily target.** A 70 kg person needs ~2.45 L from beverages under sedentary conditions. Add 500 mL per hour of moderate-intensity exercise.\n\nClimate matters significantly — heat and humidity can triple sweat rates. Altitude, pregnancy, breastfeeding, fever, and high dietary protein intake all increase requirements.`,
      },
      {
        heading: 'Hydration and Exercise Performance',
        body: `The impact of dehydration on performance is well-established. Research shows that losing just **2% of body weight** in fluid impairs aerobic performance, reduces strength output by 3–8%, and significantly degrades reaction time and decision-making.\n\nFor exercise lasting under 60 minutes, plain water is sufficient. For **sessions over 60–90 minutes**, especially in heat, sports drinks containing **sodium (500–700 mg/L)**, potassium, and carbohydrates (6–8%) help maintain electrolyte balance and provide exogenous fuel.\n\n**Sodium** is the most important electrolyte for fluid retention. "Hyponatremia" (dangerously low blood sodium from drinking too much plain water) is a real risk in ultra-endurance events — another reason water alone isn't always the answer.`,
      },
      {
        heading: 'Practical Hydration Tips',
        body: `1. **Start the day with 400–500 mL water** — you wake up mildly dehydrated from overnight respiration.\n2. **Pre-exercise:** Drink 500 mL 2 hours before; 200–300 mL 20 minutes before.\n3. **During exercise:** 150–250 mL every 15–20 minutes; add electrolytes for sessions over 60 min.\n4. **Post-exercise:** Replace 1.5× the fluid lost (weigh before and after to calculate).\n5. **Don't rely on coffee alone** — while moderate coffee consumption doesn't cause net dehydration, it's a mild diuretic. Pair coffee with an equal volume of water.\n6. **Eat your water** — cucumber, watermelon, lettuce, and strawberries are 90–96% water by weight.`,
      },
    ],
  },
  {
    id: 'a3',
    title: 'Carbohydrates: Friend or Foe? The Science Explained',
    excerpt: 'Cut through the noise about carbs. Learn which types fuel performance, which to limit, and how timing affects body composition.',
    category: 'Carbohydrates', readTime: 10, difficulty: 'Intermediate',
    author: 'Dr. Emily Zhao', authorRole: 'Clinical Dietitian', updated: 'Jul 25, 2026',
    emoji: '🌾', tags: ['carbs', 'glycemic', 'energy'], trending: true, views: 8700,
    keyTakeaways: [
      'Carbohydrates are not inherently fattening — excess calories are.',
      'Fiber-rich carbs feed your gut microbiome and reduce chronic disease risk.',
      'Carbohydrate timing around exercise significantly impacts performance and recovery.',
      'The glycemic index alone is a poor dietary guide — context matters.',
    ],
    sections: [
      { heading: 'The Anti-Carb Backlash', body: `From Atkins to keto, low-carbohydrate diets have been sold as the solution to obesity and metabolic disease for decades. The logic seems intuitive: carbs raise insulin → insulin promotes fat storage → fewer carbs = less fat. But this oversimplification ignores fundamental physiology.\n\nLarge-scale meta-analyses, including a landmark 2018 JAMA Internal Medicine study of over 600 participants, have consistently found **no metabolic advantage to low-carb diets over low-fat diets** when calories and protein are equated. Weight loss comes from a caloric deficit — carbohydrate restriction is simply one strategy to achieve it, not a metabolic magic trick.` },
      { heading: 'Types of Carbohydrates', body: `**Sugars (Simple Carbs):** Monosaccharides (glucose, fructose, galactose) and disaccharides (sucrose, lactose, maltose). Found naturally in fruit and dairy; added to ultra-processed foods. Digest rapidly, cause quick blood sugar rises.\n\n**Starches (Complex Carbs):** Long chains of glucose molecules. Found in grains, legumes, tubers, and root vegetables. Digest more slowly, providing sustained energy.\n\n**Fiber:** Indigestible carbohydrate that resists digestion in the small intestine and is fermented by bacteria in the large intestine. **Soluble fiber** (oats, beans, apples) lowers LDL cholesterol. **Insoluble fiber** (whole wheat, vegetables) supports gut motility. Target: 25–35 g/day.` },
      { heading: 'Glycemic Index: Useful But Overrated', body: `The Glycemic Index (GI) assigns foods a score from 0–100 based on how much they raise blood glucose relative to pure glucose. Low GI (<55), medium (56–69), high (≥70).\n\nProblems with using GI alone:\n• **Portion size is ignored.** Watermelon has a high GI but a low Glycemic Load (GL) because a serving contains little carbohydrate.\n• **Food combinations matter.** Adding fat or protein to a high-GI food dramatically lowers the glycemic response.\n• **Individual variation is huge.** A landmark 2015 Cell paper showed blood glucose responses to identical foods vary substantially between people based on gut microbiome, genetics, and lifestyle.\n\nFocus on **food quality and fiber content** rather than GI scores.` },
      { heading: 'Carbohydrate Timing for Performance', body: `Strategic carb timing around exercise optimizes performance and recovery:\n\n**Pre-workout (1–3 hours before):** 1–4 g/kg of easy-to-digest carbs (oats, banana, rice cakes). Tops up liver and muscle glycogen.\n\n**During exercise (>60 min):** 30–60 g/hour from easily digested sources (sports drinks, gels, bananas). Up to 90 g/hour is possible with a glucose+fructose blend that uses multiple intestinal transporters.\n\n**Post-workout (within 2 hours):** 1–1.2 g/kg of carbs paired with protein (3:1 carb-to-protein ratio) accelerates glycogen resynthesis. Rice + chicken, banana + Greek yogurt, oats + whey — all excellent options.` },
      { heading: 'How Much Carbohydrate Do You Need?', body: `Needs vary dramatically by activity level:\n\n• **Sedentary adult:** 3–5 g/kg/day\n• **Moderate exercise (1 hr/day):** 5–7 g/kg/day\n• **Endurance athlete (1–3 hr/day):** 6–10 g/kg/day\n• **Ultra-endurance (4+ hr/day):** 8–12 g/kg/day\n\nFor body composition goals, many practitioners recommend **cycling carbohydrates** — higher intake on training days, lower on rest days — to match fuel supply with demand. This is a practical approach, though total weekly calories matter more than day-to-day timing for most people.` },
    ],
  },
  {
    id: 'a4',
    title: 'Healthy Fats 101: Omega-3s, MCTs, and More',
    excerpt: 'From avocados to fish oil, discover the science of dietary fats and why some fats are essential for brain, heart, and hormone health.',
    category: 'Healthy Fats', readTime: 7, difficulty: 'Beginner',
    author: 'Dr. Lisa Park', authorRole: 'Cardiologist & Nutritionist', updated: 'Jul 20, 2026',
    emoji: '🥑', tags: ['fats', 'omega3', 'heart'], views: 7200,
    keyTakeaways: [
      'Dietary fat does not cause heart disease — trans fats and excess refined carbs do.',
      'Omega-3 fatty acids (EPA & DHA) reduce inflammation and cardiovascular risk.',
      'MCT oil provides quick energy but is not superior for fat loss.',
      'Focus on olive oil, nuts, avocados, and fatty fish as primary fat sources.',
    ],
    sections: [
      { heading: 'The Fat Phobia Era', body: `Beginning in the 1970s, nutritional policy in the US and UK promoted low-fat diets to combat rising rates of heart disease. The food industry responded by removing fat from products and replacing it with sugar and refined carbohydrates — inadvertently fueling the obesity epidemic. Decades of research, culminating in meta-analyses like the 2010 American Journal of Clinical Nutrition review (Siri-Tarino et al.), have since largely exonerated saturated fat as the primary driver of cardiovascular disease.` },
      { heading: 'The Four Types of Dietary Fat', body: `**Saturated Fatty Acids (SFA):** Found in red meat, butter, coconut oil, dairy. Raises both LDL ("bad") and HDL ("good") cholesterol. The relationship with heart disease is more nuanced than previously thought — the food source matters. Full-fat dairy and unprocessed red meat appear less harmful than processed meat.\n\n**Monounsaturated Fatty Acids (MUFA):** Found in olive oil, avocados, peanuts, almonds. Associated with lower LDL, reduced inflammation, and better insulin sensitivity. The cornerstone of the Mediterranean diet.\n\n**Polyunsaturated Fatty Acids (PUFA):** Includes omega-3 (anti-inflammatory) and omega-6 (pro-inflammatory in excess). Both are essential. Modern diets tend to over-deliver omega-6 (vegetable oils) and under-deliver omega-3 (fatty fish).\n\n**Trans Fatty Acids:** Artificially produced via hydrogenation of vegetable oils. Raises LDL, lowers HDL, promotes inflammation. Banned in the US FDA in 2018. Avoid any product listing "partially hydrogenated oil."` },
      { heading: 'Omega-3 Fatty Acids: The Superstars', body: `The omega-3 family includes ALA (alpha-linolenic acid, from flaxseed and walnuts), and the longer-chain EPA and DHA (primarily from fatty fish and algae). EPA and DHA are the biologically active forms; ALA conversion to EPA/DHA in the body is inefficient (~5–10%).\n\n**Benefits supported by strong evidence:**\n• Reduces triglycerides by 15–30% at doses of 2–4 g/day\n• Lowers blood pressure in hypertensives\n• Reduces risk of cardiovascular events in those with existing heart disease\n• Supports fetal brain and eye development in pregnancy\n• May reduce depressive symptoms (though evidence is mixed)\n\n**Food sources:** Salmon (2,260 mg per 100g), mackerel, sardines, herring, trout. For vegetarians: algae-based DHA supplements are equivalent to fish oil.` },
      { heading: 'MCT Oil: What the Evidence Says', body: `Medium-chain triglycerides (MCTs) — found in coconut oil and available as concentrated MCT oil — are absorbed differently from long-chain fats. They bypass normal fat digestion and go directly to the liver, where they're rapidly converted to ketones.\n\nClaimed benefits include increased energy, appetite suppression, and enhanced fat burning. The reality is more modest. A 2015 meta-analysis found MCT oil led to **modest reductions in body weight and waist circumference** compared to long-chain fats — but the effects were small and studies short-term.\n\nMCT oil is a useful tool for those on ketogenic diets to boost ketone levels, but it is not a weight-loss magic bullet. It is also calorie-dense (about 130 kcal/tablespoon) — over-consuming it defeats any potential benefit.` },
      { heading: 'Practical Fat Intake Guidelines', body: `Fat should comprise **20–35% of total daily calories** for most adults (higher is appropriate on ketogenic protocols). Here's a practical framework:\n\n• Use **extra-virgin olive oil** as your primary cooking fat.\n• Eat **2–3 servings of fatty fish per week** (or supplement with 1–2 g EPA+DHA).\n• Snack on **a small handful of nuts** (walnuts, almonds, Brazil nuts) daily.\n• Add **half an avocado** to meals several times per week.\n• Limit butter and red meat; avoid processed meats and trans fats.\n\nRemember: fat is calorically dense. Even healthy fats consumed in excess lead to caloric surplus. Portion awareness matters.` },
    ],
  },
  {
    id: 'a5',
    title: 'Creatine, Whey, and Pre-Workout: What Actually Works',
    excerpt: 'A systematic review of the most popular sports supplements. We examine the evidence, optimal dosing, and who actually benefits.',
    category: 'Supplements', readTime: 12, difficulty: 'Advanced',
    author: 'Dr. Marcus Webb', authorRole: 'Sports Medicine Physician', updated: 'Aug 1, 2026',
    emoji: '💊', tags: ['supplements', 'creatine', 'whey'], featured: true, views: 15600,
    keyTakeaways: [
      'Creatine monohydrate is the most evidence-backed performance supplement available.',
      'Whey protein is effective but no more so than other high-quality protein sources.',
      'Pre-workout formulas work primarily via caffeine — the rest is largely marketing.',
      'The supplement industry is poorly regulated — third-party testing is essential.',
    ],
    sections: [
      { heading: 'The Supplement Industry at a Glance', body: `The global sports nutrition market was valued at over $50 billion in 2025 and continues to grow rapidly. Yet the supplement industry is notoriously poorly regulated — in most countries, products don't require pre-market approval for efficacy or safety. A 2015 study published in JAMA Internal Medicine found that supplement-related adverse events lead to approximately 23,000 emergency department visits in the US annually.\n\nThis doesn't mean all supplements are dangerous — but it means consumers must be discerning. This article reviews the three most popular performance supplements through the lens of peer-reviewed evidence.` },
      { heading: 'Creatine Monohydrate: The Gold Standard', body: `Creatine is synthesized naturally in the body (primarily in the liver) and stored in muscle as phosphocreatine (PCr). During explosive, high-intensity efforts, PCr donates its phosphate group to ADP to rapidly regenerate ATP — the body's energy currency.\n\nSupplementation saturates muscle PCr stores beyond what diet alone achieves, enhancing performance in short, high-intensity activities (weightlifting, sprinting, HIIT).\n\n**What the evidence shows:**\n• Increases peak power output by 5–15%\n• Enhances lean mass gains when combined with resistance training\n• May improve cognitive function (especially in vegetarians who have lower baseline stores)\n• Safe for long-term use in healthy adults — multiple safety reviews over 30+ years confirm this\n\n**Dosing:** 3–5 g/day of creatine monohydrate consistently. A loading phase (20 g/day × 5 days) saturates stores faster but is not necessary. No cycling required. **Creatine monohydrate** is the only form with substantial evidence — ethyl ester, buffered creatine, and liquid creatine are not superior and cost more.` },
      { heading: 'Whey Protein: Convenient but Not Magic', body: `Whey is a byproduct of cheese production — a fast-digesting, complete protein with an excellent amino acid profile, particularly high in leucine, the key amino acid for triggering muscle protein synthesis (MPS).\n\nWhen matched for total protein and leucine content, whey is **not superior to other protein sources** for muscle building. Chicken breast, eggs, Greek yogurt, and even soy protein produce equivalent MPS responses.\n\nWhere whey excels: **convenience and speed.** It mixes easily, digests rapidly (useful post-workout), and is cost-effective per gram of protein.\n\n**Dosing:** 20–40 g per serving is sufficient. More than ~40 g in one sitting does not meaningfully increase MPS further. Whey concentrate is cost-effective; isolate is preferable for those with lactose sensitivity.` },
      { heading: 'Pre-Workout Supplements: Caffeine Is the Active Ingredient', body: `Most pre-workout products are a proprietary blend of caffeine, beta-alanine, citrulline malate, B vitamins, and various herbal extracts. They work — but primarily because of **caffeine**.\n\n**Caffeine** is one of the most extensively studied ergogenic aids in existence. At doses of **3–6 mg/kg body weight (200–400 mg for most adults)**, caffeine:\n• Reduces perceived exertion\n• Improves endurance by 2–4%\n• Increases peak power in strength activities\n• Enhances mental focus and alertness\n\n**Beta-alanine** buffers muscle acidity and may improve performance in efforts lasting 1–4 minutes. It causes harmless skin tingling ("paresthesia").\n\n**Citrulline malate** (6–8 g) modestly improves blood flow and reduces muscle soreness.\n\nThe rest of the label — BCAAs (redundant if protein intake is adequate), "pump" complexes, exotic adaptogens — have limited or no evidence.\n\n**Our recommendation:** A cup of strong coffee 30–45 minutes before training delivers the same performance benefit as most pre-workout products at a fraction of the cost.` },
      { heading: 'Third-Party Testing and Safety', body: `Since supplements are not pre-approved by regulatory bodies, contamination with banned substances, heavy metals, and undeclared pharmaceuticals is a real concern. Choose products certified by:\n\n• **NSF Certified for Sport** (stringent; required by many professional sports organizations)\n• **Informed Sport / Informed Protein** (UK-based, widely recognized)\n• **USP Verified** (pharmaceutical-grade manufacturing standards)\n\nAvoid products with "proprietary blends" that obscure individual ingredient doses, and be skeptical of any product making claims that sound too good to be true. There are no legal shortcuts to performance — only consistent training, nutrition, recovery, and a few well-chosen evidence-based aids.` },
    ],
  },
  {
    id: 'a6',
    title: 'Building Muscle with Nutrition: The Anabolic Blueprint',
    excerpt: 'Optimize muscle protein synthesis with timing strategies, amino acid profiling, and caloric surplus math for serious muscle building.',
    category: 'Muscle Gain', readTime: 14, difficulty: 'Advanced',
    author: 'Dr. Sarah Chen', authorRole: 'Sports Nutritionist', updated: 'Jul 15, 2026',
    emoji: '🏋️', tags: ['muscle', 'anabolic', 'protein'], views: 11200,
    keyTakeaways: [
      'A modest caloric surplus of 200–300 kcal/day minimizes fat gain during bulking.',
      'Protein distribution across 4+ meals maximizes daily muscle protein synthesis.',
      'Sleep is the most underrated anabolic "supplement" — GH peaks during deep sleep.',
      'Progressive overload in training is the primary driver; nutrition is the support.',
    ],
    sections: [
      { heading: 'The Caloric Surplus: How Much Is Needed?', body: `To build muscle, your body must be in a **positive energy balance** — consuming more calories than you expend. This surplus provides the raw energy for protein synthesis and the energy cost of building new tissue.\n\nHowever, more surplus is not better. Excess calories beyond what's needed for muscle building are stored as fat. A landmark meta-analysis found that a surplus of **200–300 kcal/day** maximizes muscle gain while minimizing fat accumulation — a rate of 0.25–0.5% of body weight per week gain.\n\n"Dirty bulking" (large surpluses of 500–1000+ kcal/day) builds muscle no faster than a lean bulk, adds significant fat, and requires longer cutting phases. Unless you're significantly underweight, a lean bulk approach is almost always preferable.` },
      { heading: 'Protein: The Foundation', body: `For muscle building, protein intake should be **1.6–2.2 g/kg/day**. Research from the McMaster University protein meta-analysis (Morton et al., 2018) found that beyond 1.62 g/kg/day, additional protein provides minimal marginal benefit for muscle hypertrophy — though higher intakes remain safe and can help with satiety.\n\nThe **quality** of protein matters — specifically its leucine content and digestibility. Leucine acts as the "key" that activates the mTOR pathway, the primary signaling cascade for muscle protein synthesis. A meal should provide at least **2.5–3 g of leucine** to maximally stimulate MPS:\n\n• 30 g chicken breast → ~2.5 g leucine ✓\n• 3 large eggs → ~2.4 g leucine ✓\n• 200 g Greek yogurt → ~2.5 g leucine ✓\n• 40 g whey protein → ~3.5 g leucine ✓` },
      { heading: 'Protein Distribution: Why Meal Frequency Matters', body: `The concept of a "daily protein target" is correct, but **how you distribute it across the day** significantly impacts total MPS.\n\nEach protein-containing meal stimulates MPS for approximately 3–5 hours before returning to baseline. To maximize cumulative MPS over a day, you want to stimulate it as many times as possible.\n\n**Optimal approach:** 4–5 protein-containing meals (or snacks) per day, each providing ~30–40 g protein. Spreading 160 g protein across 5 meals triggers 5 MPS pulses; consuming the same 160 g in 2 meals triggers only 2 pulses.\n\n**Pre-sleep protein:** A landmark Maastricht University trial by Res et al. showed that consuming 40 g casein protein before sleep increased overnight MPS by 22% compared to placebo, and improved strength and muscle mass gains over 12 weeks of training.` },
      { heading: 'Carbohydrates and Fats for Muscle Building', body: `While protein takes center stage, carbohydrates and fats play important supporting roles.\n\n**Carbohydrates** serve three key functions for muscle building: (1) replenish glycogen depleted during training, (2) stimulate insulin release (which inhibits muscle protein breakdown), and (3) provide energy to maintain training intensity for progressive overload.\n\nCarbohydrate intake of **4–7 g/kg/day** is appropriate during a muscle-building phase. Prioritize complex carbs at meals, and consider fast-digesting carbs (white rice, banana) immediately post-training to rapidly restore glycogen.\n\n**Fats** should not fall below 0.5 g/kg/day, as this can impair testosterone and other anabolic hormone production. 1.0–1.5 g/kg/day of fat supports optimal hormonal environment for muscle growth.` },
      { heading: 'Recovery: The True Anabolic Window', body: `The post-workout "anabolic window" has been dramatically overstated. A 2013 meta-analysis by Aragon & Schoenfeld found that as long as protein and calories are adequate over the course of the day, the precise timing of post-workout protein (within 1 hour vs. a few hours) has minimal effect.\n\nWhat genuinely matters for recovery and muscle growth:\n\n**Sleep (7–9 hours):** Growth hormone secretion peaks during slow-wave sleep (Stage 3). Sleep deprivation impairs GH release, increases cortisol, and directly reduces the muscle protein synthesis response to training. No supplement compensates for poor sleep.\n\n**Managing Cortisol:** Chronic stress elevates cortisol, which is catabolic (muscle-wasting). Stress management — meditation, adequate sleep, avoiding excessive training volume — is as important as nutrition.\n\n**Micronutrients:** Zinc (supports testosterone synthesis), Vitamin D (impacts muscle fiber type composition), magnesium (hundreds of enzymatic reactions including protein synthesis). A varied whole-food diet typically covers these; a comprehensive multivitamin can fill gaps.` },
    ],
  },
  {
    id: 'a7',
    title: 'Gut Microbiome and Nutrition: The Gut-Brain Connection',
    excerpt: 'Your gut is your second brain. Discover how fermented foods, fiber, and prebiotics shape mental health, immunity, and metabolism.',
    category: 'Gut Health', readTime: 9, difficulty: 'Intermediate',
    author: 'Dr. Nina Torres', authorRole: 'Gastroenterologist', updated: 'Jul 22, 2026',
    emoji: '🦠', tags: ['gut', 'microbiome', 'probiotics'], views: 6800,
    keyTakeaways: [
      'Your gut hosts 38 trillion bacteria — more cells than your entire body.',
      'Fiber diversity (aiming for 30+ plant foods/week) is the single best microbiome intervention.',
      'Fermented foods (yogurt, kefir, kimchi, sauerkraut) measurably increase microbiome diversity.',
      'The gut-brain axis is bidirectional — gut health directly impacts mood and cognition.',
    ],
    sections: [
      { heading: 'The Microbiome: An Introduction', body: `The human gut microbiome is an ecosystem of approximately **38 trillion microorganisms** — bacteria, fungi, viruses, and archaea — living primarily in the large intestine. This community collectively contains **150 times more genes** than the human genome, giving it remarkable metabolic capability.\n\nThe microbiome is involved in vitamin production (K2, B12, biotin), short-chain fatty acid synthesis (which fuels colonocytes and regulates immune function), bile acid metabolism, and the regulation of gene expression throughout the body. It is increasingly recognized as a key determinant of metabolic health, immune function, mental health, and longevity.` },
      { heading: 'Feeding Your Microbiome', body: `The most powerful nutritional lever for microbiome health is **dietary fiber** — specifically the diversity of fiber types you consume. Different bacterial species ferment different fiber structures, meaning variety is essential.\n\nThe **American Gut Project** (the world's largest citizen science microbiome study) found that people consuming **30+ different plant foods per week** had significantly more diverse gut microbiomes than those consuming 10 or fewer. Diversity is associated with better metabolic health, stronger immune function, and lower rates of depression.\n\nTarget fiber types:\n• **Inulin/FOS:** Onions, garlic, leeks, asparagus, chicory root\n• **Resistant starch:** Cooled cooked rice/potatoes, green bananas, oats\n• **Beta-glucan:** Oats, barley, mushrooms\n• **Pectin:** Apples, citrus peel, berries` },
      { heading: 'Fermented Foods and Probiotics', body: `A 2021 Stanford Medicine randomized trial (Wastyk et al.) found that a **high-fermented-food diet** — including yogurt, kefir, fermented cottage cheese, kimchi, sauerkraut, and kombucha — increased microbiome diversity and reduced 19 inflammatory proteins in just 10 weeks. Notably, a high-fiber diet alone did not increase diversity in this trial (though it likely would over a longer timeframe in those with already-diverse microbiomes).\n\n**Probiotic supplements** are a convenient alternative, but food-first approaches provide the bacteria alongside the prebiotic substrate (fiber) they need to thrive — a synergistic combination called "synbiotics." If using supplements, choose multi-strain products with documented CFU counts (≥10 billion) from reputable manufacturers.` },
      { heading: 'The Gut-Brain Axis', body: `The gut and brain are connected via the **vagus nerve**, the enteric nervous system (500 million neurons lining the digestive tract — hence "second brain"), and a sophisticated network of signaling molecules including serotonin (90% of which is produced in the gut), GABA, dopamine, and short-chain fatty acids.\n\nThis communication is bidirectional: psychological stress alters gut motility and microbial composition; conversely, gut dysbiosis (microbial imbalance) is increasingly linked to depression, anxiety, and cognitive impairment.\n\nA 2019 meta-analysis of 34 RCTs found that probiotic supplementation **significantly reduced** symptoms of depression and anxiety in adults with clinical diagnoses. While not a replacement for conventional treatment, gut-targeted nutrition is a meaningful adjunct to mental health care.` },
      { heading: 'Practical Microbiome Nutrition Plan', body: `**Daily habits that build a thriving microbiome:**\n\n1. **Eat the rainbow** — diversify your plant foods. Set a weekly target of 30+ species.\n2. **Have fermented food at every meal** — kefir on oats, yogurt as a snack, kimchi with lunch.\n3. **Cook and cool your starches** — resistant starch content increases when rice and potatoes are cooled after cooking.\n4. **Minimize ultra-processed foods** — emulsifiers (polysorbate 80, carboxymethylcellulose) found in many processed foods damage the gut mucus layer.\n5. **Don't over-sanitize** — excessive antibiotic use and antibacterial soaps reduce microbiome diversity. Use antibiotics only when necessary.\n6. **Exercise regularly** — physically active individuals consistently have more diverse microbiomes than sedentary people, independent of diet.` },
    ],
  },
  {
    id: 'a8',
    title: 'The Ultimate Meal Prep Guide: 7-Day Plans',
    excerpt: 'Master batch cooking with 4 complete 7-day meal plans for fat loss, muscle gain, maintenance, and plant-based goals.',
    category: 'Meal Planning', readTime: 11, difficulty: 'Beginner',
    author: 'Maria Santos', authorRole: 'Certified Chef & Dietitian', updated: 'Jul 28, 2026',
    emoji: '📋', tags: ['meal-prep', 'planning', 'batch-cooking'], trending: true, views: 13100,
    keyTakeaways: [
      'Spending 2 hours on Sunday can save 7–10 hours of cooking during the week.',
      'Batch cooking proteins, grains, and roasted vegetables gives maximum mix-and-match flexibility.',
      'Prepped meals stay fresh for 4–5 days in the fridge; freeze beyond that.',
      'The "protein × 4 + carb × 4 + fat × 9 = calories" formula helps build balanced meals.',
    ],
    sections: [
      { heading: 'Why Meal Prep Actually Works', body: `Meal prepping is the single highest-leverage nutritional habit for most people. Research shows that individuals who plan their meals in advance consume more vegetables, fewer calories, and have higher dietary quality scores than those who decide what to eat on the fly. A 2017 International Journal of Behavioral Nutrition and Physical Activity study found that meal planners were 24% less likely to be overweight and had significantly higher intake of fruits and vegetables.\n\nThe psychological mechanism is **decision fatigue reduction.** Making food decisions when hungry and time-pressured is a recipe for poor choices. When your next meal is already prepared and only requires reheating, you remove the barrier entirely.` },
      { heading: 'The Core Meal Prep System', body: `The most flexible system is **component-based prepping** — cooking individual building blocks rather than complete recipes, then combining them throughout the week.\n\n**Protein batch (choose 2–3):**\n• Baked chicken thighs (season with herbs, roast 200°C for 35 min)\n• Hard-boiled eggs (12 at a time)\n• Canned/pouched tuna or salmon\n• Cooked ground turkey or beef (seasoned neutrally)\n• Baked tofu or tempeh\n\n**Carbohydrate batch (choose 2):**\n• Cooked brown rice or quinoa (make 500g dry at once — feeds 8–10 portions)\n• Roasted sweet potato cubes\n• Lentils or chickpeas (cook dried, or open cans)\n\n**Vegetable batch:**\n• Roasted broccoli, peppers, courgette, cherry tomatoes\n• Shredded salad greens (store with paper towel to absorb moisture)\n• Stir-fry vegetables blanched and portioned` },
      { heading: 'Fat Loss 7-Day Template (1600 kcal/day)', body: `**Breakfast (~380 kcal):** 3 egg white + 1 whole egg omelette with spinach and feta, 1 slice whole grain toast, black coffee\n**Mid-morning (~200 kcal):** 170g Greek yogurt (0%), handful blueberries\n**Lunch (~450 kcal):** 150g grilled chicken, 150g quinoa, large mixed salad with olive oil + lemon\n**Snack (~150 kcal):** 1 apple + 15g almonds\n**Dinner (~420 kcal):** 120g salmon fillet, roasted broccoli and asparagus, 100g sweet potato\n\n**Macros:** ~160g protein / 145g carbs / 48g fat\n\n**Prep on Sunday:** Grill a batch of chicken and salmon. Cook quinoa. Roast vegetables. Hard-boil 6 eggs. Portion yogurt into containers. Total time: ~90 minutes.` },
      { heading: 'Muscle Gain 7-Day Template (2800 kcal/day)', body: `**Breakfast (~650 kcal):** 4-egg omelette with cheese and vegetables, 80g rolled oats with banana and honey, 250ml whole milk\n**Mid-morning (~400 kcal):** Protein shake (40g whey + 250ml whole milk), 1 large banana\n**Lunch (~700 kcal):** 200g grilled chicken thigh, 250g cooked basmati rice, roasted vegetables with olive oil, large avocado slice\n**Pre-workout snack (~250 kcal):** Rice cakes (4) with 30g peanut butter\n**Post-workout (~300 kcal):** 40g whey protein + 300ml milk\n**Dinner (~500 kcal):** 200g lean beef mince with tomato sauce on 200g pasta, side salad\n\n**Macros:** ~230g protein / 310g carbs / 90g fat` },
      { heading: 'Plant-Based 7-Day Template (2000 kcal/day)', body: `A well-planned plant-based meal prep can fully meet protein and micronutrient needs. Key strategies:\n\n**Combine complementary proteins:** Rice + lentils, hummus + pita, pea protein + rice protein.\n\n**Sample day:**\n- Breakfast: Overnight oats with chia seeds, hemp seeds, almond butter, berries (550 kcal, 22g protein)\n- Lunch: Lentil dal with brown rice, spinach salad with tahini dressing (600 kcal, 28g protein)\n- Snack: Edamame + apple (250 kcal, 15g protein)\n- Dinner: Tofu stir-fry with quinoa, broccoli, peppers, sesame-ginger sauce (600 kcal, 32g protein)\n\n**Supplement essentials for plant-based eaters:** Vitamin B12 (2500 mcg/week), Vitamin D3 (2000 IU/day), algae-based DHA (250–500 mg/day), zinc (consider supplementation), iodine (if not using iodized salt).` },
    ],
  },
  {
    id: 'a9',
    title: 'Vitamin D Deficiency: The Silent Epidemic',
    excerpt: 'Over 1 billion people are deficient in the sunshine vitamin. Learn symptoms, optimal blood levels, and the best food and supplement sources.',
    category: 'Vitamins & Minerals', readTime: 8, difficulty: 'Beginner',
    author: 'Dr. David Kim', authorRole: 'Endocrinologist', updated: 'Jul 10, 2026',
    emoji: '☀️', tags: ['vitamin-d', 'deficiency', 'bone-health'], views: 9300,
    keyTakeaways: [
      'Over 1 billion people worldwide are vitamin D deficient or insufficient.',
      'Optimal serum 25(OH)D is 75–125 nmol/L (30–50 ng/mL) for most adults.',
      'Vitamin D3 (cholecalciferol) is significantly more effective than D2 at raising blood levels.',
      'Most people in northern latitudes need 2000–4000 IU/day to maintain optimal levels.',
    ],
    sections: [
      { heading: 'Why Vitamin D Deficiency Is Epidemic', body: `Vitamin D is unique among vitamins — it functions as a steroid hormone rather than a traditional nutrient, and the primary source is not food but **ultraviolet B (UVB) radiation from sunlight**. The problem: modern lifestyles keep us indoors. When we do go outside, we're often wearing sunscreen. In northern latitudes (above ~35°N), UVB rays are too weak to synthesize vitamin D for 4–6 months per year.\n\nThe result: approximately 1 billion people worldwide have serum 25-hydroxyvitamin D (25OHD) levels below 50 nmol/L — the threshold for deficiency. A further 2–3 billion are in the "insufficient" range (50–75 nmol/L). This includes 40% of the US population and up to 80% of populations in South Asia who, despite abundant sunshine, have high rates of deficiency due to indoor lifestyles and darker skin (which requires more sun exposure to synthesize equivalent vitamin D).` },
      { heading: 'What Vitamin D Does in the Body', body: `The vitamin D receptor (VDR) is expressed in virtually every tissue in the human body — over 900 genes are directly regulated by activated vitamin D (calcitriol). Its classical role is calcium homeostasis and bone metabolism, but research over the past 20 years has revealed far broader functions:\n\n• **Immune regulation:** Vitamin D activates macrophages and T-cells; deficiency is associated with increased susceptibility to respiratory infections and autoimmune disease.\n• **Muscle function:** VDRs are expressed in muscle tissue; deficiency causes proximal muscle weakness.\n• **Cardiovascular health:** Low vitamin D is associated with higher blood pressure and increased cardiovascular event risk.\n• **Mental health:** Multiple meta-analyses link vitamin D insufficiency with depression; supplementation shows modest antidepressant effects in some trials.\n• **Cancer prevention:** Observational data links higher vitamin D levels with lower incidence of colorectal, breast, and prostate cancers, though causality remains debated.` },
      { heading: 'Testing and Optimal Blood Levels', body: `The correct test for vitamin D status is **serum 25-hydroxyvitamin D (25OHD)**. This is the storage form and best reflects total body vitamin D status.\n\n**Interpreting results:**\n• <30 nmol/L (<12 ng/mL): Deficiency — associated with bone disease (rickets, osteomalacia)\n• 30–50 nmol/L (12–20 ng/mL): Insufficiency — increased risk of many health outcomes\n• 50–75 nmol/L (20–30 ng/mL): Borderline adequate\n• 75–125 nmol/L (30–50 ng/mL): **Optimal range** for most health outcomes\n• >125 nmol/L (>50 ng/mL): Potential toxicity risk — supplementation should be monitored\n\nAsk your GP or use a home finger-prick test (e.g., NHS vitamin D home testing services or private labs). Ideally test at the end of winter when levels are at their annual low.` },
      { heading: 'Supplementation: D3 vs D2, Dosing, and Cofactors', body: `**Vitamin D3 (cholecalciferol)** — the form produced in human skin — is substantially more effective than D2 (ergocalciferol) at raising and maintaining serum 25OHD levels. Always choose D3.\n\n**Dosing by situation:**\n• Deficiency correction: 4000–6000 IU/day for 8–12 weeks, then retest\n• Insufficiency: 2000–4000 IU/day\n• Maintenance in winter (latitude >40°N): 2000 IU/day minimum\n• UK NHS recommendation: 400 IU/day (widely considered too conservative by endocrinologists)\n\n**Critical cofactors:** Vitamin D works synergistically with **magnesium** (needed for vitamin D activation — nearly 50% of Americans are deficient), **vitamin K2** (directs calcium to bones rather than arteries — take 100–200 mcg MK-7 with high-dose D3), and zinc.\n\n**Food sources:** Vitamin D is rare in food. Fatty fish (salmon: ~600–1000 IU per 100g), egg yolk (~40 IU), and fortified foods (milk, some cereals, plant milks) provide modest amounts but cannot realistically replace supplementation for most people.` },
    ],
  },
  {
    id: 'a10',
    title: 'Nutrition for Endurance Athletes',
    excerpt: 'Carbohydrate periodization, sodium replacement, and fueling strategies for marathons, triathlons, and ultra events.',
    category: 'Sports Nutrition', readTime: 13, difficulty: 'Advanced',
    author: 'James Miller', authorRole: 'Exercise Physiologist', updated: 'Jul 18, 2026',
    emoji: '🏃', tags: ['endurance', 'carb-loading', 'electrolytes'], views: 7500,
    keyTakeaways: [
      'For events >90 minutes, carbohydrate intake during exercise is performance-critical.',
      'Sodium supplementation — not just water — is essential for events over 2 hours.',
      'Carb loading (10 g/kg for 36–48 hours) can add ~2% race performance.',
      'Train your gut just like you train your legs — gut adaptations take time.',
    ],
    sections: [
      { heading: 'Energy Systems in Endurance Sport', body: `Endurance performance relies primarily on **aerobic metabolism** — the sustained production of ATP from fat and carbohydrate oxidation in the presence of oxygen. At lower intensities (<65% VO2max), fat is the dominant fuel. As intensity rises, carbohydrate progressively dominates because it produces ATP 15–20 times faster than fat and requires less oxygen per mole of ATP.\n\nThe practical implication: **glycogen is the limiting fuel for most competitive endurance events.** Muscle glycogen stores (approximately 400–600g, ~1600–2400 kcal) are adequate for ~90 minutes of high-intensity effort. Beyond this, supplemental carbohydrate intake is not optional — it's performance-critical.` },
      { heading: 'Pre-Event Carbohydrate Loading', body: `Classic "carb loading" (supercompensating glycogen stores) involves consuming **8–12 g/kg/day of carbohydrates for 36–48 hours** before an event, tapering training simultaneously. This can increase muscle glycogen by 20–40% above normal capacity, adding approximately 2% to endurance performance in events >90 minutes.\n\n**Modified "one-day" protocol:** Some evidence supports a shorter protocol — 10 g/kg in 24 hours — that can still meaningfully elevate glycogen without the 2-day eating challenge. Useful for shorter lead times.\n\n**Pre-race meal (3–4 hours before):** 1–4 g/kg of familiar, low-fiber, low-fat carbohydrates (white toast with jam, banana, white rice, oatmeal without added fat). Avoid new foods on race day.` },
      { heading: 'Fueling During the Event', body: `**Guidelines by duration:**\n• 45–75 min: Water only; possibly a small carb dose near the end\n• 1–2.5 hours: 30–60 g carbohydrate/hour (one gel every 45 min + water)\n• 2.5+ hours: Up to 90 g/hour using a **2:1 glucose:fructose blend** (uses dual intestinal transporters — Lucozade Sport, Maurten gels, certain sports drinks)\n\n**Practical intake sources:**\n- 1 standard energy gel (45 ml) = ~22–25 g carbs\n- 500 ml isotonic sports drink = ~30–35 g carbs\n- 1 banana = ~25 g carbs\n- 1 Medjool date = ~18 g carbs (real-food alternative)\n\n**Gut training is essential:** The intestine's capacity to absorb carbohydrates increases with practice. Train with your race nutrition strategy — never try something new on race day.` },
      { heading: 'Electrolyte and Sodium Strategy', body: `Sweat contains sodium (the primary electrolyte lost), chloride, potassium, magnesium, and calcium. **Sodium loss** is the most consequential, varying widely between individuals (300–2000 mg/hour depending on sweat rate and individual sweat sodium concentration).\n\nFor events under 2 hours in mild conditions, a standard isotonic sports drink (containing ~500–700 mg sodium/L) is adequate. For events over 2–3 hours, particularly in heat, additional sodium supplementation is warranted:\n\n• Sodium capsules/tablets (200–500 mg per serving, taken with water every 45–60 min)\n• High-sodium sports drinks (Precision Hydration, Skratch Labs)\n• Salt sticks, pretzels, or pickle juice (also used for cramping)\n\n**Hyponatremia warning:** Drinking large volumes of plain water in ultra-endurance events without adequate sodium replacement is dangerous and potentially fatal. Sodium, not just hydration, is the critical variable in events over 4 hours.` },
      { heading: 'Post-Race Recovery Nutrition', body: `Effective recovery nutrition focuses on three priorities: **glycogen replenishment, muscle protein repair, and fluid/electrolyte restoration.**\n\n**Within the first 30 minutes:** 1–1.2 g/kg of fast-digesting carbohydrates paired with 30–40g protein maximizes glycogen resynthesis and reduces muscle damage markers. Chocolate milk (an unlikely hero) provides an excellent natural 3–4:1 carb-to-protein ratio and has been validated in multiple recovery studies.\n\n**Over the next 24 hours:** Continue elevated carbohydrate intake (6–8 g/kg/day) and maintain protein at 1.6–2.0 g/kg/day. Prioritize anti-inflammatory foods — fatty fish, cherries (tart cherry juice reduces muscle soreness markers), turmeric, ginger.\n\n**Sleep:** The most undervalued recovery tool. 8–9 hours supports HGH secretion, reduces cortisol, and allows tissue repair to proceed unimpeded.` },
    ],
  },
  {
    id: 'a11',
    title: 'The Science of Sustainable Weight Loss',
    excerpt: 'Forget crash diets. Understand metabolic adaptation, NEAT, and evidence-based strategies that actually keep weight off long-term.',
    category: 'Weight Loss', readTime: 10, difficulty: 'Intermediate',
    author: 'Dr. Lisa Park', authorRole: 'Cardiologist & Nutritionist', updated: 'Aug 2, 2026',
    emoji: '⚖️', tags: ['weight-loss', 'metabolism', 'caloric-deficit'], trending: true, views: 18900,
    keyTakeaways: [
      'A 500 kcal/day deficit leads to ~0.5 kg/week loss — the most evidence-backed rate.',
      'Metabolic adaptation (adaptive thermogenesis) is real — plan for it with diet breaks.',
      'NEAT (non-exercise activity thermogenesis) can vary by 2000 kcal/day between individuals.',
      'High protein diet is the most powerful single dietary lever for sustainable fat loss.',
    ],
    sections: [
      { heading: 'The Energy Balance Equation', body: `Weight change, at its core, is determined by **energy in vs. energy out.** Consuming fewer calories than you expend creates a deficit; your body mobilizes stored energy (primarily fat) to compensate. This is thermodynamically inescapable — there are no exceptions.\n\nHowever, "calories in, calories out" is often presented as simpler than it is. Both sides of the equation are dynamic and interact with each other:\n\n**Calories in** is affected by: digestibility of food, gut microbiome composition, cooking method (cooked food is more bioavailable than raw), and individual variation in nutrient absorption.\n\n**Calories out** includes: **BMR** (basal metabolic rate — ~60–70% of TDEE), **TEF** (thermic effect of food — ~10%), **exercise** (~15–30%), and **NEAT** (non-exercise activity thermogenesis — highly variable, 15–50% of TDEE).` },
      { heading: 'Understanding Metabolic Adaptation', body: `Here's the biology nobody tells you upfront: **your metabolism adapts to weight loss in ways that make continued loss harder.** This phenomenon, called "adaptive thermogenesis," involves:\n\n1. Reduced BMR beyond what fat/muscle loss alone would predict (your body becomes more fuel-efficient)\n2. Decreased NEAT (unconscious movement, fidgeting, and posture changes decrease)\n3. Increased appetite hormones (ghrelin rises, leptin falls)\n4. Decreased satiety signal sensitivity\n\nThis is the primary reason most people regain weight after dieting. A 2016 NEJM follow-up of "The Biggest Loser" contestants found that 6 years after the show, contestants had a dramatically suppressed metabolic rate (~500 kcal/day below predicted), with significantly elevated ghrelin levels — despite maintaining much of their weight loss.\n\n**The solution:** Incorporate planned **diet breaks** (2 weeks at maintenance calories every 6–8 weeks of dieting) and **refeed days** (high-carb days at maintenance) to partially restore leptin and metabolic rate.` },
      { heading: 'The NEAT Factor', body: `**NEAT (Non-Exercise Activity Thermogenesis)** encompasses all movement that isn't formal exercise: walking, standing, cooking, cleaning, fidgeting. Research by Dr. James Levine at Mayo Clinic found that NEAT can vary by up to **2,000 kcal/day** between individuals of similar size — accounting for much of the variation in "who gains weight easily."\n\nWhen you diet, NEAT unconsciously decreases — you sit more, fidget less, take the elevator. This compounds metabolic adaptation, often eliminating 300–500 kcal/day of NEAT without you realizing it.\n\n**Practical NEAT strategies:**\n• Use a step counter — target 8,000–10,000 steps/day regardless of gym sessions\n• Standing desk or walking meetings\n• Park farther, take stairs consistently\n• 5-minute movement breaks every hour\n\nThese small-but-constant choices matter enormously for long-term energy balance.` },
      { heading: 'The Role of Protein in Fat Loss', body: `Of all dietary manipulations for fat loss, **increasing protein is the single most evidence-backed strategy**, with multiple mechanisms:\n\n1. **Satiety:** Protein is the most satiating macronutrient per calorie. High-protein meals suppress ghrelin (hunger hormone) and increase peptide YY (satiety hormone) more than equal-calorie carb or fat meals.\n2. **Thermic effect:** Protein requires 20–30% of its own calories just to be digested — fat needs only 0–3%, carbs 5–10%.\n3. **Muscle preservation:** During a caloric deficit, adequate protein (2.3–3.1 g/kg lean body mass) prevents muscle loss — critical because muscle tissue is metabolically active and loss of it worsens metabolic adaptation.\n4. **Voluntary calorie reduction:** Studies consistently show that when protein is increased, subjects spontaneously eat fewer total calories.\n\nTarget: **1.8–2.7 g/kg/day** during a fat loss phase (higher end if you're also resistance training).` },
      { heading: 'Sustainable Rate of Loss and Maintenance', body: `**Optimal rate of fat loss:** 0.5–1% of body weight per week. Faster loss accelerates muscle loss and metabolic adaptation. For a 80 kg person, this is 400–800 g/week — achievable with a 500–700 kcal/day deficit.\n\n**Diet adherence is the most important variable.** A 2020 systematic review found no meaningful difference between low-carb, low-fat, Mediterranean, or intermittent fasting diets for weight loss at 12 months when controlled for protein and compliance. Choose the approach you can sustain.\n\n**Long-term maintenance requires behavioral change:** A 2017 Obesity Reviews meta-analysis found that the most successful maintainers in the National Weight Control Registry share these habits:\n• Eating breakfast consistently\n• High vegetable and protein intake\n• Self-monitoring (weighing regularly, tracking food)\n• Consistent physical activity (~60 min/day of moderate activity)\n• Planning meals in advance\n\nWeight maintenance is an active, lifelong practice — not a destination.` },
    ],
  },
  {
    id: 'a12',
    title: 'Eating for Heart Health: The Mediterranean Approach',
    excerpt: 'Why cardiologists consistently recommend the Mediterranean diet, and how to adapt it for South Asian and other regional preferences.',
    category: 'Heart Health', readTime: 9, difficulty: 'Beginner',
    author: 'Dr. Lisa Park', authorRole: 'Cardiologist & Nutritionist', updated: 'Jul 5, 2026',
    emoji: '❤️', tags: ['heart', 'mediterranean', 'cholesterol'], views: 8100,
    keyTakeaways: ['The PREDIMED trial showed 30% reduction in cardiovascular events on Mediterranean diet.', 'Extra-virgin olive oil (4+ tablespoons/day) is the cornerstone.', 'Red and processed meat are the highest-risk foods for cardiovascular disease.', 'The pattern matters more than individual "superfoods."'],
    sections: [
      { heading: 'The Evidence for Mediterranean Eating', body: `The **PREDIMED trial** (Prevención con Dieta Mediterránea) is the gold standard trial in nutrition science. Published in NEJM in 2013, it enrolled 7,447 adults at high cardiovascular risk and randomized them to three diets: Mediterranean supplemented with extra-virgin olive oil (EVOO), Mediterranean supplemented with nuts, or a control low-fat diet. After a median 4.8 years, both Mediterranean groups had approximately **30% fewer major cardiovascular events** (heart attack, stroke, cardiovascular death). The trial was stopped early because the benefit was so clear it was unethical to continue.\n\nThis was corroborated by the LYON Diet Heart Study, which showed similar magnitude benefits, and supported by dozens of subsequent observational cohort studies across multiple countries.` },
      { heading: 'Core Components of the Mediterranean Diet', body: `**Eat abundantly (daily):**\n• Extra-virgin olive oil as the primary fat — 4+ tablespoons/day in PREDIMED\n• Vegetables — minimum 2 servings/day, ideally 5+\n• Fruit — 2–3 pieces/day\n• Whole grains — pita, bulgur, farro, whole wheat bread\n• Legumes — lentils, chickpeas, fava beans (3+ servings/week)\n\n**Eat regularly (weekly):**\n• Fish and seafood — 2–3 times/week\n• Poultry — 2 times/week\n• Eggs — up to 4/week\n• Dairy — moderate amounts of cheese and yogurt\n• Nuts — 30g/day (a handful)\n\n**Limit:**\n• Red meat — <2 times/week; prefer lean cuts\n• Processed and cured meats — minimize\n• Butter and margarine — use EVOO instead\n• Refined grains, sugary drinks, sweets — rarely` },
      { heading: 'Why Olive Oil Is Special', body: `Extra-virgin olive oil (EVOO) is the defining ingredient of the Mediterranean diet. Its cardiovascular benefits come from two components:\n\n1. **Oleic acid (monounsaturated fat):** ~73% of EVOO. Reduces LDL oxidation, lowers blood pressure, and improves insulin sensitivity.\n\n2. **Polyphenols:** EVOO is extraordinarily rich in polyphenolic compounds — particularly oleocanthal (which has ibuprofen-like anti-inflammatory activity) and oleuropein. These reduce LDL oxidation, improve endothelial function, and have antithrombotic effects.\n\n**Choosing quality EVOO:** "Extra-virgin" designation should mean cold-pressed with acidity <0.8% and measurable polyphenol content. Unfortunately, adulteration is widespread. Look for PDO/PGI certification, harvest date (buy within 18 months), and dark glass packaging.` },
      { heading: 'Adapting for South Asian and Other Cuisines', body: `The Mediterranean diet is a **dietary pattern**, not a specific cuisine — and its principles can be adapted to any cultural food tradition.\n\n**South Asian adaptation:**\n• Use mustard oil or sesame oil alongside EVOO (both have favorable fatty acid profiles)\n• Emphasize dal, rajma, chana — exceptional sources of fiber and plant protein\n• Retain turmeric, cumin, coriander — all have anti-inflammatory properties\n• Increase vegetable portion at every meal\n• Reduce ghee and replace saturated fat in cooking with EVOO\n• Prioritize whole grain chapati (atta) over refined maida\n• Include fatty fish like sardines, mackerel, and hilsa (high omega-3)\n\n**East Asian adaptation:** Emphasize tofu, edamame, fish, green tea, fermented soy; reduce white rice portions; add more diverse vegetables and seaweed.` },
    ],
  },
  {
    id: 'a13',
    title: 'Nutrition for Type 2 Diabetes: Beyond Low-Carb',
    excerpt: 'Explore dietary patterns from low-carb to Mediterranean to plant-based and learn what the research actually says for blood sugar control.',
    category: 'Diabetes Nutrition', readTime: 11, difficulty: 'Intermediate',
    author: 'Dr. David Kim', authorRole: 'Endocrinologist', updated: 'Jul 12, 2026',
    emoji: '🩸', tags: ['diabetes', 'blood-sugar', 'insulin'], views: 5400,
    keyTakeaways: ['No single diet works best for all T2D patients — personalization is key.', 'Low-carb diets show the strongest short-term glycemic improvement.', 'Vinegar (2 tbsp before meals) measurably reduces post-meal glucose spikes.', 'Fiber intake is inversely associated with T2D incidence and HbA1c.'],
    sections: [
      { heading: 'Type 2 Diabetes Nutrition: The Landscape', body: `Type 2 diabetes (T2D) is fundamentally a disease of impaired glucose regulation — insulin resistance in peripheral tissues prevents glucose from being effectively taken up and utilized. Diet is the most powerful modifiable factor in both prevention and management.\n\nMajor diabetes organizations (ADA, Diabetes UK, IDF) have largely moved away from prescribing a single dietary pattern, instead recognizing that multiple approaches can be effective when individualized. The most researched patterns for T2D management include: **low-carbohydrate, Mediterranean, plant-based, and low-GI/GL** diets.` },
      { heading: 'Low-Carbohydrate Diets: The Most Potent Glycemic Tool', body: `Restricting carbohydrates directly reduces postprandial glucose excursions — the mechanism is straightforward. Meta-analyses consistently show that low-carb diets (<130g carbs/day or <26% of calories) produce the greatest reductions in HbA1c at 3–6 months compared to other dietary patterns.\n\nA 2019 ADA consensus report on low-carb diets found that very-low-carb diets (<50g/day, ketogenic) showed remission of T2D in a meaningful proportion of patients who followed them rigorously.\n\n**The sustainability caveat:** Adherence drops significantly after 12 months in most trials. Long-term outcomes at 2+ years converge with Mediterranean and plant-based approaches. Low-carb works excellently for motivated patients with strong dietary support; for others, a moderate-carb Mediterranean pattern may produce better long-term adherence and comparable metabolic outcomes.` },
      { heading: 'The Mediterranean Diet for T2D', body: `The PREDIMED trial and subsequent studies show that the Mediterranean diet reduces T2D incidence by 52% and improves multiple metabolic markers in those already diagnosed:\n• Reduces HbA1c by 0.3–0.5%\n• Lowers fasting glucose\n• Reduces cardiovascular risk (critical for T2D patients whose primary mortality cause is CVD)\n• Improves lipid profile\n\nFor T2D management, the Mediterranean diet emphasizes legumes, non-starchy vegetables, fatty fish, EVOO, nuts, and whole grains — while limiting refined carbohydrates, sugary foods, and processed meats. This pattern offers a more flexible and culturally varied approach than strict carbohydrate restriction.` },
      { heading: 'Practical Blood Sugar Management Strategies', body: `Beyond dietary patterns, several specific strategies measurably reduce postprandial glucose spikes:\n\n**1. Vinegar:** 2 tablespoons of apple cider or white vinegar before or with meals reduces post-meal glucose by 20–35% in multiple RCTs. The acetic acid inhibits amylase (starch-digesting enzyme) and improves insulin sensitivity.\n\n**2. Food sequencing:** Eating vegetables and protein before carbohydrates in a meal reduces postprandial glucose by up to 40% compared to eating carbs first (Shukla et al., 2017).\n\n**3. Walk after meals:** A 10-minute walk immediately after eating reduces post-meal glucose peak by ~15–20% by contracting muscles and increasing GLUT4 glucose transporter expression.\n\n**4. Pulse foods:** Adding lentils or beans to a rice dish can reduce its glycemic impact by 25% due to fiber and antinutrient content slowing starch digestion ("second-meal effect").` },
    ],
  },
  {
    id: 'a14',
    title: 'Post-Workout Nutrition: The Anabolic Window Myth',
    excerpt: 'Is the 30-minute post-workout window real? We review the latest research on protein timing, glycogen replenishment, and recovery nutrition.',
    category: 'Recovery Nutrition', readTime: 7, difficulty: 'Intermediate',
    author: 'Dr. Marcus Webb', authorRole: 'Sports Medicine Physician', updated: 'Jul 30, 2026',
    emoji: '🔋', tags: ['recovery', 'post-workout', 'protein-timing'], views: 10200,
    keyTakeaways: ['The 30-minute "anabolic window" is largely a myth for well-fed individuals.', 'Total daily protein is far more important than post-workout timing.', 'Glycogen replenishment is time-sensitive for multiple sessions per day.', 'Caffeine + protein pre-workout may outperform post-workout supplementation.'],
    sections: [
      { heading: 'The Origin of the Anabolic Window', body: `The concept of a narrow post-exercise "anabolic window" — during which you must consume protein to prevent muscle catabolism — emerged from early studies, many conducted in fasted subjects performing exercise in a completely fasted state. In these conditions, pre- and intra-exercise amino acid availability was zero, making post-exercise protein timing critical.\n\nHowever, this doesn't reflect the reality of most people's training: those who eat breakfast 1–2 hours before training have circulating amino acids available during and after exercise, substantially extending the "window."` },
      { heading: 'What the Current Evidence Shows', body: `A 2013 meta-analysis by Aragon and Schoenfeld in the Journal of the International Society of Sports Nutrition — the definitive review on this topic — concluded: **"The practical implications of nutrient timing appear to be overstated."** When total daily protein intake was controlled, the timing of protein around workouts explained only a small fraction of muscle gain variance.\n\nA 2017 RCT by the same group directly tested morning vs. evening protein supplementation and found no significant difference in muscle or strength gains over 10 weeks.\n\n**When timing does matter:**\n1. **Multiple training sessions per day:** Glycogen replenishment is rate-limited; consuming carbs within 30 minutes of finishing session 1 maximizes glycogen restoration before session 2.\n2. **Training in a true fasted state:** If you exercise first thing in the morning without eating, a post-workout protein dose is important.\n3. **Resistance training in older adults (60+):** MPS response is more blunted at rest; timing may be somewhat more important to maximally stimulate MPS.` },
      { heading: 'Optimal Recovery Meal Composition', body: `While precise timing is flexible, a well-composed recovery meal remains important for:\n• Initiating muscle protein synthesis\n• Replenishing glycogen\n• Reducing muscle damage and DOMS\n• Rehydrating and restoring electrolytes\n\n**Optimal composition:**\n• **Protein:** 30–40g complete protein within 2 hours of training\n• **Carbohydrates:** 0.8–1.2 g/kg body weight (fast-digesting if another session follows; complex if not)\n• **Fat:** Small to moderate amount — fat slows absorption but does not blunt the anabolic response meaningfully at 3–5+ hours post-exercise\n\n**Example meals:**\n• Chicken, rice, and vegetables\n• Salmon with sweet potato\n• Greek yogurt with fruit and granola\n• Tuna wrap with salad\n• Post-training: milk + banana (convenient, effective, supported by multiple studies)` },
      { heading: 'Practical Takeaways for Timing Strategy', body: `**If you train in the morning:**\n• Eat a moderate protein breakfast 1.5–2 hours before, or\n• Have a small pre-workout snack (banana + protein shake) 30–45 min before\n• Eat your main post-workout meal within 1–2 hours\n\n**If you train in the evening:**\n• Ensure you've had adequate protein across the day (3–4 meals)\n• A regular dinner with 35–40g protein post-workout is completely sufficient\n• Consider 40g casein protein before bed (shown in RCTs to enhance overnight MPS)\n\n**The simplest framework:** Eat enough protein throughout the day (1.6–2.2 g/kg), ensure a protein-containing meal within a couple hours of training, and stop stressing about the 30-minute window. Your food choices over 24 hours matter infinitely more than the precise minute you consume them.` },
    ],
  },
  {
    id: 'a15',
    title: '10 Nutrition Myths Busted by Science',
    excerpt: 'From "eating fat makes you fat" to "detox cleanses work" — we systematically debunk the most persistent nutrition myths with peer-reviewed evidence.',
    category: 'Food Myths', readTime: 9, difficulty: 'Beginner',
    author: 'Dr. Emily Zhao', authorRole: 'Clinical Dietitian', updated: 'Aug 1, 2026',
    emoji: '🔬', tags: ['myths', 'evidence', 'facts'], trending: true, views: 22300,
    keyTakeaways: ['No food is inherently "fattening" — caloric context is everything.', 'Detox cleanses are not supported by any scientific evidence.', 'Meal frequency (6 small meals vs. 3 large) has minimal metabolic effect.', 'Organic produce has not been shown to have superior nutritional content.'],
    sections: [
      { heading: 'MYTH 1: Eating Fat Makes You Fat', body: `**The truth:** Dietary fat does not directly cause body fat accumulation — excess total calories do. Fat became demonized after Ancel Keys' Seven Countries Study in the 1960s, which oversimplified the relationship between saturated fat and heart disease. As dietary fat guidelines were implemented and people reduced fat intake, the food industry replaced fat with sugar and refined carbohydrates — which are, if anything, more problematic.\n\nLarge meta-analyses (including Siri-Tarino et al., 2010, with 350,000 subjects) found no significant association between saturated fat intake and cardiovascular disease. A well-formulated higher-fat diet (like Mediterranean or ketogenic) produces equivalent or superior weight loss compared to low-fat diets in most studies.` },
      { heading: 'MYTH 2: Eating After 8 PM Causes Weight Gain', body: `**The truth:** Your body does not have a metabolic clock that suddenly starts storing fat after 8 PM. Weight gain occurs from eating more calories than you expend — regardless of timing.\n\nThat said, nighttime eating is often associated with weight gain in observational studies — but the mechanism is behavioral, not metabolic. People tend to eat more calorie-dense, ultra-processed foods in the evening while sedentary and in front of screens. If you control the type and quantity of food, evening eating has no inherent metabolic disadvantage.\n\n**Exception:** Eating immediately before sleep may slightly impair sleep quality for some individuals, which indirectly affects hunger hormones and food choices the next day.` },
      { heading: 'MYTH 3: Detox Cleanses Remove Toxins', body: `**The truth:** Your liver and kidneys are extraordinarily sophisticated detoxification organs that continuously filter toxins from your blood. There is no scientifically validated evidence that juice cleanses, herbal detox teas, or "activated charcoal" products enhance this process in any measurable way.\n\nA 2015 review in the Journal of Human Nutrition and Dietetics examined 15 trials on commercial detox diets and found "no convincing evidence that detox diets remove toxins from your body or improve health." Many popular detox products (particularly "detox teas" marketed on social media) contain senna — a potent laxative — which causes fluid loss that registers as weight loss on the scale but is entirely temporary and potentially dangerous.` },
      { heading: 'MYTH 4: You Need to Eat 6 Small Meals to "Stoke Your Metabolism"', body: `**The truth:** The idea that eating more frequently increases metabolic rate stems from a misinterpretation of the thermic effect of food. Yes, digesting food burns calories — but total TEF is determined by total food consumed, not meal frequency.\n\nA 2010 systematic review in the British Journal of Nutrition found **no metabolic advantage to higher meal frequency** when total calories and macros were controlled. Intermittent fasting, which compresses eating into a shorter window, produces the same weight loss as conventional calorie restriction.\n\nMeal frequency is a tool for hunger management, not metabolism optimization. Eat as frequently as works for your hunger, schedule, and adherence.` },
      { heading: 'MYTHS 5–10: Quick Busts', body: `**MYTH 5: Organic food is more nutritious.**\nA 2012 Stanford meta-analysis of 237 studies found no significant nutritional superiority of organic over conventional produce. Organic may reduce pesticide exposure, but the health implications are unclear.\n\n**MYTH 6: Superfoods have special fat-burning powers.**\nNo food has magical fat-burning properties. "Superfoods" is a marketing term, not a scientific category. Goji berries, açaí, spirulina, and moringa are nutritious but not metabolically special.\n\n**MYTH 7: Carbs are addictive.**\nThe neuroscience does not support carbohydrate addiction in the same way as substance addiction. Ultra-processed foods with combined fat+sugar+salt trigger reward pathways — but plain rice or pasta do not.\n\n**MYTH 8: You need protein within 30 minutes of a workout.**\n[See our detailed article on post-workout nutrition.] Total daily protein matters far more than timing.\n\n**MYTH 9: All calories are equal.**\nWhile the laws of thermodynamics hold, protein, fiber, and whole foods produce greater satiety, better hormonal responses, and more favorable gut microbiome effects per calorie than refined sugar or ultra-processed food.\n\n**MYTH 10: Skipping breakfast slows your metabolism.**\nBreakfast is not metabolically required. Lean individuals who regularly skip breakfast have not been shown to have lower metabolic rates. Breakfast benefits are largely behavioral — those who eat breakfast tend to make better food choices throughout the day.` },
    ],
  },
  {
    id: 'a16',
    title: 'High-Protein Breakfast Recipes for Muscle Gain',
    excerpt: '15 quick, delicious, high-protein breakfast recipes that hit 30–50g protein per serving to kickstart muscle protein synthesis each morning.',
    category: 'Recipes', readTime: 5, difficulty: 'Beginner',
    author: 'Maria Santos', authorRole: 'Certified Chef & Dietitian', updated: 'Aug 2, 2026',
    emoji: '🍳', tags: ['recipes', 'breakfast', 'high-protein'], views: 14700,
    keyTakeaways: ['A 30–40g protein breakfast maximally stimulates morning MPS.', 'Pairing fast-digesting whey with slow-digesting casein (cottage cheese) provides sustained amino acid release.', 'Eggs are one of the most bioavailable protein sources — a score of 100 on the PDCAAS scale.', 'These recipes can be prepped the night before in 5–10 minutes.'],
    sections: [
      { heading: 'Why High-Protein Breakfasts Matter for Muscle Building', body: `After an overnight fast of 8+ hours, your body has been in a mildly catabolic state — muscle protein breakdown has exceeded muscle protein synthesis. Consuming a protein-rich breakfast with ≥30g protein rapidly reverses this, stimulating muscle protein synthesis (MPS) to begin the anabolic phase of the day.\n\nA 2014 study in the American Journal of Clinical Nutrition found that subjects who consumed 30g of protein at breakfast had **significantly higher 24-hour MPS** than those who front-loaded protein at dinner — even when total daily intake was identical. Breakfast protein is not just about satiety; it's about maximizing your daily anabolic potential.` },
      { heading: 'Recipes 1–5: The 10-Minute Classics', body: `**1. Scrambled Eggs with Smoked Salmon** (~42g protein)\n4 large eggs + 80g smoked salmon + 1 tbsp cream cheese + chives. Scramble eggs in a non-stick pan, add cream cheese and smoked salmon off heat. Serve on whole grain toast.\n\n**2. Greek Yogurt Power Bowl** (~38g protein)\n250g full-fat Greek yogurt + 2 scoops whey protein powder + 1 tbsp chia seeds + berries + 1 tbsp almond butter. Mix protein into yogurt, top with remaining ingredients.\n\n**3. Cottage Cheese Pancakes** (~34g protein)\n200g cottage cheese + 2 eggs + 60g rolled oats (blended to flour) + cinnamon + vanilla. Blend all ingredients, cook as thin pancakes. Serve with banana and maple syrup.\n\n**4. Turkey and Veggie Omelette** (~36g protein)\n3 eggs + 2 egg whites + 100g turkey breast (diced) + mushrooms, peppers, spinach + 30g feta. Whisk eggs, pour into pan, add fillings, fold.\n\n**5. Protein Overnight Oats** (~33g protein)\n80g rolled oats + 300ml unsweetened almond milk + 1 scoop vanilla whey + 2 tbsp peanut butter + 1 banana (sliced). Combine in jar night before, refrigerate, eat cold.` },
      { heading: 'Recipes 6–10: Batch-Prep Friendly', body: `**6. Mini Egg Muffins (makes 12)** (~8g protein each, eat 4 = 32g)\nWhisk 8 eggs with 100g diced ham, spinach, and cheese. Pour into greased muffin tins, bake 180°C for 18 min. Store in fridge for 5 days.\n\n**7. Chicken and Egg Breakfast Bowl** (~45g protein)\nLeftover grilled chicken (150g) + 2 poached eggs + roasted sweet potato + avocado + sriracha. Assemble cold or warm in 2 minutes.\n\n**8. Lentil and Egg Masala** (~35g protein, South Asian-inspired)\nCooked red lentils (150g cooked) + 2 fried eggs + tempered onions, cumin, coriander, chili. Rich in protein and iron.\n\n**9. Protein French Toast** (~38g protein)\n2 slices thick whole grain bread soaked in batter (2 eggs + 1 scoop vanilla whey + 100ml milk + cinnamon). Pan-fry in butter. Serve with Greek yogurt.\n\n**10. High-Protein Smoothie Bowl** (~40g protein)\nBlend: 1 scoop vanilla whey + 100g frozen berries + 100g Greek yogurt + 50ml milk. Pour into bowl, top with granola, banana, chia seeds.` },
      { heading: 'Recipes 11–15: Advanced Flavors', body: `**11. Shrimp and Egg Fried Rice** (~40g protein, great use of leftovers)\n150g shrimp + 3 eggs + 150g cooked brown rice + vegetables + soy sauce + sesame oil. Cook shrimp, scramble eggs, add rice and veg.\n\n**12. Smoked Mackerel Kedgeree** (~38g protein, British classic)\nFlaked smoked mackerel (150g) + cooked basmati rice + 2 hard-boiled eggs + curry powder + parsley. Comfort food that's genuinely nutritious.\n\n**13. Tofu Scramble (Vegan)** (~32g protein)\n200g firm tofu (crumbled) + nutritional yeast + turmeric + black salt (kala namak for eggy flavor) + spinach + cherry tomatoes. Excellent plant-based alternative.\n\n**14. Whey-Fortified Porridge** (~35g protein)\n80g oats + 300ml whole milk + 1 scoop unflavored whey (stirred in off heat) + 1 tbsp honey + walnuts + banana. Add whey after removing from heat to avoid denaturing.\n\n**15. Baked Egg Avocado** (~30g protein, keto-friendly)\n2 avocados halved and pitted, 1 egg cracked into each half + grated cheese. Bake 200°C for 12–15 min. Top with smoked salmon and black pepper.` },
      { heading: 'Protein Content Quick Reference', body: `| Food (per 100g) | Protein |\n|---|---|\n| Chicken breast | 31g |\n| Eggs (1 large) | 6g |\n| Greek yogurt | 10g |\n| Cottage cheese | 11g |\n| Smoked salmon | 23g |\n| Firm tofu | 17g |\n| Lentils (cooked) | 9g |\n| Whey protein (30g scoop) | 24g |\n| Smoked mackerel | 21g |\n| Turkey breast | 30g |\n\n**Planning tip:** Aim to include 2–3 high-protein foods per breakfast. Pairing whey (fast-digesting) with cottage cheese or Greek yogurt (casein, slow-digesting) provides both an immediate MPS stimulus and sustained amino acid availability over 3–4 hours.` },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All', 'Healthy Eating', 'Protein', 'Carbohydrates', 'Healthy Fats',
  'Vitamins & Minerals', 'Hydration', 'Weight Loss', 'Muscle Gain',
  'Sports Nutrition', 'Meal Planning', 'Food Myths', 'Recipes',
  'Gut Health', 'Heart Health', 'Diabetes Nutrition', 'Supplements', 'Recovery Nutrition',
];

const CAT_COLORS: Record<string, [string, string]> = {
  'Protein':            ['rgba(52,211,153,0.12)',  '#34d399'],
  'Hydration':          ['rgba(34,211,238,0.12)',  '#22d3ee'],
  'Carbohydrates':      ['rgba(251,191,36,0.12)',  '#fbbf24'],
  'Healthy Fats':       ['rgba(96,165,250,0.12)',  '#60a5fa'],
  'Supplements':        ['rgba(167,139,250,0.12)', '#a78bfa'],
  'Muscle Gain':        ['rgba(52,211,153,0.12)',  '#34d399'],
  'Gut Health':         ['rgba(74,222,128,0.12)',  '#4ade80'],
  'Meal Planning':      ['rgba(96,165,250,0.12)',  '#60a5fa'],
  'Vitamins & Minerals':['rgba(251,191,36,0.12)',  '#fbbf24'],
  'Sports Nutrition':   ['rgba(248,113,113,0.12)', '#f87171'],
  'Weight Loss':        ['rgba(248,113,113,0.12)', '#f87171'],
  'Heart Health':       ['rgba(248,113,113,0.12)', '#f87171'],
  'Diabetes Nutrition': ['rgba(167,139,250,0.12)', '#a78bfa'],
  'Recovery Nutrition': ['rgba(34,211,238,0.12)',  '#22d3ee'],
  'Food Myths':         ['rgba(251,191,36,0.12)',  '#fbbf24'],
  'Recipes':            ['rgba(52,211,153,0.12)',  '#34d399'],
  'Healthy Eating':     ['rgba(96,165,250,0.12)',  '#60a5fa'],
};

const DIFF_COLORS: Record<string, string> = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171' };

function catBg(cat: string)  { return CAT_COLORS[cat]?.[0] ?? 'rgba(255,255,255,0.08)'; }
function catClr(cat: string) { return CAT_COLORS[cat]?.[1] ?? '#94a3b8'; }

// ── Article Reader Modal ───────────────────────────────────────────────────

function parseBody(text: string): React.ReactNode[] {
  return text.split('\n').filter(Boolean).map((line, idx) => {
    // Table rows
    if (line.startsWith('|')) {
      return null; // handled in table block
    }
    // Bullet points
    if (line.startsWith('•') || line.match(/^[•\-\*] /)) {
      const content = line.replace(/^[•\-\*] /, '');
      return (
        <div key={idx} className="nkc-reader-bullet">
          <span className="nkc-reader-bullet-dot" />
          <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
        </div>
      );
    }
    // Numbered list
    if (line.match(/^\d+\./)) {
      return (
        <div key={idx} className="nkc-reader-bullet">
          <span className="nkc-reader-bullet-num">{line.match(/^\d+/)?.[0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\./, '').trim()) }} />
        </div>
      );
    }
    return (
      <p key={idx} className="nkc-reader-para" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
    );
  }).filter(Boolean);
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\(.+?\)/g, '<span class="nkc-reader-link">$1</span>');
}

function TableBlock({ text }: { text: string }) {
  const rows = text.split('\n').filter(r => r.startsWith('|'));
  if (rows.length < 2) return null;
  const headers = rows[0].split('|').filter(Boolean).map(h => h.trim());
  const bodyRows = rows.slice(2); // skip separator row
  return (
    <div className="nkc-reader-table-wrap">
      <table className="nkc-reader-table">
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {bodyRows.map((row, i) => {
            const cells = row.split('|').filter(Boolean).map(c => c.trim());
            return <tr key={i}>{cells.map((c, j) => <td key={j}>{c}</td>)}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function ArticleReader({ article, all, onClose, onNavigate }: {
  article: Article; all: Article[]; onClose: () => void; onNavigate: (a: Article) => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [readProgress, setReadProgress] = useState(0);

  const idx = all.findIndex(a => a.id === article.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Reading progress
  const onScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const pct = Math.min(100, Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100));
    setReadProgress(isNaN(pct) ? 0 : pct);
  }, []);

  const clr = catClr(article.category);
  const related = all.filter(a => a.id !== article.id && a.category === article.category).slice(0, 3);

  return (
    <div className="nkc-reader-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nkc-reader-modal">
        {/* Progress bar */}
        <div className="nkc-reader-progress">
          <div className="nkc-reader-progress-fill" style={{ width: `${readProgress}%`, background: clr }} />
        </div>

        {/* Header */}
        <div className="nkc-reader-header">
          <div className="nkc-reader-header-left">
            <span className="nkc-cat-badge" style={{ background: catBg(article.category), color: clr }}>
              {article.category}
            </span>
            <span className="nkc-diff-badge" style={{ color: DIFF_COLORS[article.difficulty], fontSize: 11, fontWeight: 700 }}>
              ◉ {article.difficulty}
            </span>
            <span className="nkc-read-time">⏱ {article.readTime} min read</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="nkc-reader-progress-label">{readProgress}% read</span>
            <button className="nkc-reader-close" onClick={onClose} title="Close (Esc)">✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="nkc-reader-body" ref={bodyRef} onScroll={onScroll}>

          {/* Hero */}
          <div className="nkc-reader-hero" style={{ background: `radial-gradient(ellipse at 30% 50%, ${clr}18 0%, transparent 70%)` }}>
            <span className="nkc-reader-hero-emoji">{article.emoji}</span>
            <div>
              <h1 className="nkc-reader-title">{article.title}</h1>
              <p className="nkc-reader-excerpt">{article.excerpt}</p>

              <div className="nkc-reader-byline">
                <div className="nkc-author-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
                  {article.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{article.author}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{article.authorRole} · Updated {article.updated}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>👁 {(article.views / 1000).toFixed(1)}k views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="nkc-reader-takeaways">
              <div className="nkc-reader-takeaways-title">🎯 Key Takeaways</div>
              {article.keyTakeaways.map((t, i) => (
                <div key={i} className="nkc-reader-takeaway">
                  <span style={{ color: clr, fontSize: 18, lineHeight: 1.2, flexShrink: 0 }}>✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}

          {/* Article sections */}
          <div className="nkc-reader-sections">
            {article.sections.map((section, i) => {
              const hasTable = section.body.includes('\n|');
              return (
                <div key={i} className="nkc-reader-section">
                  {section.heading && (
                    <h2 className="nkc-reader-heading" style={{ borderLeftColor: clr }}>
                      {section.heading}
                    </h2>
                  )}
                  {hasTable ? (
                    <>
                      {parseBody(section.body.split('\n|')[0])}
                      <TableBlock text={'|' + section.body.split('\n|').slice(1).join('\n|')} />
                      {parseBody(section.body.split('\n|').slice(-1)[0]?.startsWith('**') ? section.body.split('\n|').slice(-1)[0] : '')}
                    </>
                  ) : (
                    parseBody(section.body)
                  )}
                </div>
              );
            })}
          </div>

          {/* Tags */}
          <div className="nkc-reader-tags-row">
            {article.tags.map(t => (
              <span key={t} className="nkc-tag">#{t}</span>
            ))}
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="nkc-reader-related">
              <h3 className="nkc-reader-related-title">📖 Related Articles</h3>
              <div className="nkc-reader-related-grid">
                {related.map(a => (
                  <div key={a.id} className="nkc-reader-related-card" onClick={() => { onNavigate(a); bodyRef.current?.scrollTo({ top: 0 }); }}>
                    <span style={{ fontSize: 28 }}>{a.emoji}</span>
                    <div>
                      <div className="nkc-reader-related-title-text">{a.title}</div>
                      <div className="nkc-reader-related-meta">{a.readTime} min · {a.difficulty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="nkc-reader-nav">
            {prev ? (
              <button className="nkc-reader-nav-btn" onClick={() => { onNavigate(prev); bodyRef.current?.scrollTo({ top: 0 }); }}>
                ← {prev.title.slice(0, 40)}{prev.title.length > 40 ? '…' : ''}
              </button>
            ) : <div />}
            {next ? (
              <button className="nkc-reader-nav-btn nkc-reader-nav-next" onClick={() => { onNavigate(next); bodyRef.current?.scrollTo({ top: 0 }); }}>
                {next.title.slice(0, 40)}{next.title.length > 40 ? '…' : ''} →
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Article Cards ──────────────────────────────────────────────────────────

function ArticleCard({ article, bookmarks, onBookmark, onOpen, layout = 'grid' }: {
  article: Article; bookmarks: Set<string>; onBookmark: (id: string) => void;
  onOpen: (a: Article) => void; layout?: 'grid' | 'list';
}) {
  const [hovered, setHovered] = useState(false);
  const saved = bookmarks.has(article.id);
  return (
    <div
      className={`nkc-card ${layout === 'list' ? 'nkc-card-list' : ''}`}
      onClick={() => onOpen(article)}
      style={{ cursor: 'pointer', borderColor: hovered ? catClr(article.category) + '55' : '' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="nkc-card-thumb" style={{ background: `radial-gradient(ellipse at 30% 30%, ${catClr(article.category)}22, transparent 70%), linear-gradient(135deg,#0d1526 0%,#0a0f1a 100%)` }}>
        <span className="nkc-card-emoji">{article.emoji}</span>
        {article.featured && <span className="nkc-card-badge nkc-badge-featured">⭐ Featured</span>}
        {article.trending && <span className="nkc-card-badge nkc-badge-trending" style={{ right: 10, left: 'auto' }}>🔥 Trending</span>}
        <button
          className={`nkc-bookmark-btn ${saved ? 'nkc-bookmark-active' : ''}`}
          onClick={e => { e.stopPropagation(); onBookmark(article.id); }}
        >{saved ? '🔖' : '📌'}</button>
      </div>
      <div className="nkc-card-body">
        <div className="nkc-card-meta">
          <span className="nkc-cat-badge" style={{ background: catBg(article.category), color: catClr(article.category) }}>{article.category}</span>
          <span className="nkc-diff-badge" style={{ color: DIFF_COLORS[article.difficulty] }}>◉ {article.difficulty}</span>
          <span className="nkc-read-time">⏱ {article.readTime} min</span>
        </div>
        <h3 className="nkc-card-title">{article.title}</h3>
        <p className="nkc-card-excerpt">{article.excerpt}</p>
        <div className="nkc-card-tags">{article.tags.map(t => <span key={t} className="nkc-tag">#{t}</span>)}</div>
        <div className="nkc-card-footer">
          <div className="nkc-author">
            <div className="nkc-author-avatar">{article.author.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div>
              <div className="nkc-author-name">{article.author}</div>
              <div className="nkc-author-role">{article.authorRole}</div>
            </div>
          </div>
          <div className="nkc-card-stats">
            <span>👁 {(article.views / 1000).toFixed(1)}k</span>
            <span>📅 {article.updated}</span>
          </div>
        </div>
        <button
          className="nkc-read-btn"
          style={{ borderColor: catClr(article.category) + '55', color: catClr(article.category) }}
          onClick={e => { e.stopPropagation(); onOpen(article); }}
        >Read Article →</button>
      </div>
    </div>
  );
}

function FeaturedCard({ article, bookmarks, onBookmark, onOpen }: {
  article: Article; bookmarks: Set<string>; onBookmark: (id: string) => void; onOpen: (a: Article) => void;
}) {
  const saved = bookmarks.has(article.id);
  const clr = catClr(article.category);
  return (
    <div className="nkc-featured-card" style={{ '--feat-clr': clr, cursor: 'pointer' } as React.CSSProperties} onClick={() => onOpen(article)}>
      <div className="nkc-featured-emoji">{article.emoji}</div>
      <div className="nkc-featured-content">
        <div className="nkc-card-meta" style={{ marginBottom: 10 }}>
          <span className="nkc-cat-badge" style={{ background: catBg(article.category), color: clr }}>{article.category}</span>
          <span style={{ color: DIFF_COLORS[article.difficulty], fontSize: 11, fontWeight: 700 }}>◉ {article.difficulty}</span>
          <span className="nkc-read-time">⏱ {article.readTime} min</span>
        </div>
        <h2 className="nkc-featured-title">{article.title}</h2>
        <p className="nkc-featured-excerpt">{article.excerpt}</p>
        <div className="nkc-featured-footer">
          <div className="nkc-author">
            <div className="nkc-author-avatar">{article.author.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div>
              <div className="nkc-author-name">{article.author}</div>
              <div className="nkc-author-role">{article.authorRole}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className={`nkc-bookmark-btn ${saved ? 'nkc-bookmark-active' : ''}`}
              style={{ position: 'static', opacity: 1, transform: 'none', background: 'rgba(255,255,255,0.1)' }}
              onClick={e => { e.stopPropagation(); onBookmark(article.id); }}
            >{saved ? '🔖' : '📌'}</button>
            <button className="nkc-featured-btn" onClick={e => { e.stopPropagation(); onOpen(article); }}>Read Now →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoGraphicCard({ emoji, title, stats }: { emoji: string; title: string; stats: { label: string; value: string; color: string }[] }) {
  return (
    <div className="nkc-infographic">
      <div className="nkc-infographic-header">
        <span className="nkc-infographic-emoji">{emoji}</span>
        <h4 className="nkc-infographic-title">{title}</h4>
      </div>
      <div className="nkc-infographic-stats">
        {stats.map((s, i) => (
          <div key={i} className="nkc-infographic-stat">
            <div className="nkc-infographic-val" style={{ color: s.color }}>{s.value}</div>
            <div className="nkc-infographic-lbl">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AINutritionPanel({ user, goal, onOpen }: { user: any; goal: string; onOpen: (a: Article) => void }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [chat, setChat] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    { from: 'ai', text: `Hello! Based on your goal of "${goal}", I've curated personalized articles for you. What nutrition topic can I help you explore?` }
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const aiResponses: Record<string, string> = {
    protein: 'Great question! For your goal, aim for 1.6–2.2g of protein per kg of body weight. Check out our "Complete Guide to Macronutrients" — click it to read the full article!',
    carb: 'Carbs are your primary fuel. For active individuals, 5–7g/kg/day is a good target. Our Carbohydrates article covers this in depth!',
    fat: 'Healthy fats are crucial for hormones and brain health. Our "Healthy Fats 101" article explains omega-3s and MCTs in detail.',
    supplement: 'Creatine monohydrate is the most evidence-backed supplement. See our "Creatine, Whey, and Pre-Workout" article for a full breakdown!',
    water: 'A practical target is 35–45ml per kg of body weight daily. Our Hydration Science article covers this in detail.',
    default: 'Great question! Browse our Knowledge Center for in-depth evidence-based articles. Try clicking any article card to read it fully.',
  };

  const getReply = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes('protein')) return aiResponses.protein;
    if (lower.includes('carb')) return aiResponses.carb;
    if (lower.includes('fat')) return aiResponses.fat;
    if (lower.includes('supplement') || lower.includes('creatine')) return aiResponses.supplement;
    if (lower.includes('water') || lower.includes('hydrat')) return aiResponses.water;
    return aiResponses.default;
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user' as const, text: input.trim() };
    const aiMsg = { from: 'ai' as const, text: getReply(input) };
    setChat(prev => [...prev, userMsg, aiMsg]);
    setInput('');
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 100);
  };

  const goalArticles = goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('gain')
    ? ARTICLES.filter(a => ['Muscle Gain', 'Protein', 'Supplements', 'Recovery Nutrition'].includes(a.category)).slice(0, 3)
    : goal.toLowerCase().includes('loss') || goal.toLowerCase().includes('weight')
    ? ARTICLES.filter(a => ['Weight Loss', 'Meal Planning', 'Healthy Eating', 'Carbohydrates'].includes(a.category)).slice(0, 3)
    : ARTICLES.filter(a => a.trending).slice(0, 3);

  return (
    <div className="nkc-ai-panel">
      <div className="nkc-ai-header" onClick={() => setAiOpen(o => !o)}>
        <div className="nkc-ai-header-left">
          <div className="nkc-ai-orb">🤖</div>
          <div>
            <div className="nkc-ai-title">AI Nutrition Assistant</div>
            <div className="nkc-ai-subtitle">Personalized for {user?.name?.split(' ')[0] || 'you'}</div>
          </div>
        </div>
        <div className="nkc-ai-live"><span className="nkc-ai-dot" />Live</div>
        <span style={{ marginLeft: 8, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: aiOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
      </div>
      {aiOpen && (
        <>
          <div className="nkc-ai-recs">
            <div className="nkc-ai-rec-label">📚 Recommended for your goal</div>
            {goalArticles.map(a => (
              <div key={a.id} className="nkc-ai-rec-item" onClick={() => onOpen(a)}>
                <span className="nkc-ai-rec-emoji">{a.emoji}</span>
                <div>
                  <div className="nkc-ai-rec-title">{a.title}</div>
                  <div className="nkc-ai-rec-meta">{a.readTime} min · {a.category} · Click to read</div>
                </div>
              </div>
            ))}
          </div>
          <div className="nkc-ai-chat">
            <div className="nkc-ai-messages" ref={chatRef}>
              {chat.map((m, i) => (
                <div key={i} className={`nkc-ai-msg ${m.from === 'ai' ? 'nkc-ai-msg-ai' : 'nkc-ai-msg-user'}`}>{m.text}</div>
              ))}
            </div>
            <div className="nkc-ai-input-row">
              <input className="nkc-ai-input" placeholder="Ask about nutrition..." value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
              <button className="nkc-ai-send" onClick={send}>➤</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function NutritionKnowledgePage() {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'User';
  const userGoal = (user as any)?.goal || 'General Health';

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const catScrollRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => { await clearAuth(); navigate('/login'); };
  const toggleBookmark = (id: string) => {
    setBookmarks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const openReader = useCallback((a: Article) => setOpenArticle(a), []);
  const closeReader = useCallback(() => setOpenArticle(null), []);

  const filtered = ARTICLES.filter(a => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const q = search.toLowerCase();
    return matchCat && (!q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)) || a.excerpt.toLowerCase().includes(q));
  });

  const featured = ARTICLES.filter(a => a.featured).slice(0, 2);
  const trending  = ARTICLES.filter(a => a.trending);
  const bookmarked = ARTICLES.filter(a => bookmarks.has(a.id));

  return (
    <div className="dashboard nkc-page">
      {openArticle && (
        <ArticleReader
          article={openArticle}
          all={ARTICLES}
          onClose={closeReader}
          onNavigate={a => setOpenArticle(a)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💪</div>
          <span className="sidebar-logo-text">AI Fitness</span>
        </div>
        <nav className="sidebar-nav">
          <Link className="nav-item" to="/dashboard"><span className="nav-icon">🏠</span> Dashboard</Link>
          <a className="nav-item" href="#progress"><span className="nav-icon">📈</span> Progress</a>
          <Link className="nav-item" to="/nutrition"><span className="nav-icon">🥗</span> Nutrition</Link>
          <Link className="nav-item active" to="/knowledge"><span className="nav-icon">📚</span> Knowledge</Link>
          <a className="nav-item" href="#workouts"><span className="nav-icon">🏋️</span> Workouts</a>
          <a className="nav-item" href="#goals"><span className="nav-icon">🎯</span> Goals</a>
          <a className="nav-item" href="#settings"><span className="nav-icon">⚙️</span> Settings</a>
        </nav>
        <div className="nkc-sidebar-section">
          <div className="nkc-sidebar-title">Quick Topics</div>
          {CATEGORIES.filter(c => c !== 'All').slice(0, 8).map(c => (
            <button key={c} className="nkc-sidebar-link" onClick={() => setActiveCategory(c)}
              style={{ color: activeCategory === c ? catClr(c) : undefined }}>
              <span style={{ fontSize: 14 }}>{
                c === 'Protein' ? '💪' : c === 'Hydration' ? '💧' : c === 'Carbohydrates' ? '🌾' :
                c === 'Healthy Fats' ? '🥑' : c === 'Vitamins & Minerals' ? '☀️' :
                c === 'Weight Loss' ? '⚖️' : c === 'Muscle Gain' ? '🏋️' : '📖'
              }</span>{c}
            </button>
          ))}
        </div>
        <div className="nkc-sidebar-section" style={{ marginTop: 8 }}>
          <div className="nkc-sidebar-title">🔥 Trending</div>
          {trending.slice(0, 3).map(a => (
            <div key={a.id} className="nkc-sidebar-article" onClick={() => openReader(a)}>
              <span style={{ fontSize: 18 }}>{a.emoji}</span>
              <div>
                <div className="nkc-sidebar-article-title">{a.title.slice(0, 38)}…</div>
                <div className="nkc-sidebar-article-meta">{a.readTime} min · {(a.views / 1000).toFixed(1)}k views</div>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout} style={{ color: '#f87171', width: '100%' }}>
            <span className="nav-icon">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content nkc-main">
        {/* Hero */}
        <div className="nkc-hero">
          <div className="nkc-hero-bg" />
          <div className="nkc-hero-content">
            <div className="nkc-hero-top">
              <div>
                <div className="nkc-hero-label">🌿 AI-Powered Education</div>
                <h1 className="nkc-hero-title">Learn Nutrition</h1>
                <p className="nkc-hero-sub">Science-backed guides, expert articles, and personalized recommendations to master your nutrition, {firstName}.</p>
              </div>
              <div className="nkc-hero-stats">
                <div className="nkc-hero-stat"><div className="nkc-hero-stat-val">16</div><div className="nkc-hero-stat-lbl">Topics</div></div>
                <div className="nkc-hero-stat"><div className="nkc-hero-stat-val">{ARTICLES.length}</div><div className="nkc-hero-stat-lbl">Articles</div></div>
                <div className="nkc-hero-stat"><div className="nkc-hero-stat-val">12</div><div className="nkc-hero-stat-lbl">Experts</div></div>
              </div>
            </div>
            <div className="nkc-search-bar">
              <span className="nkc-search-icon">🔍</span>
              <input id="nkc-search-input" className="nkc-search-input"
                placeholder="Search articles… (e.g. 'protein timing', 'omega-3', 'hydration')"
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="nkc-search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
            <div className="nkc-cat-row" ref={catScrollRef}>
              {CATEGORIES.map(c => (
                <button key={c} className={`nkc-cat-pill ${activeCategory === c ? 'nkc-cat-pill-active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                  style={activeCategory === c ? { background: catBg(c), color: catClr(c), borderColor: catClr(c) + '55' } : {}}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="nkc-layout">
          <div className="nkc-content-col">
            <AINutritionPanel user={user} goal={userGoal} onOpen={openReader} />

            {activeCategory === 'All' && !search && (
              <div className="nkc-section">
                <div className="nkc-section-header">
                  <span className="nkc-section-icon">⭐</span>
                  <span>Featured Articles</span>
                  <span className="nkc-section-count">{featured.length} picks</span>
                </div>
                <div className="nkc-featured-grid">
                  {featured.map(a => <FeaturedCard key={a.id} article={a} bookmarks={bookmarks} onBookmark={toggleBookmark} onOpen={openReader} />)}
                </div>
              </div>
            )}

            {activeCategory === 'All' && !search && (
              <div className="nkc-section">
                <div className="nkc-section-header">
                  <span className="nkc-section-icon">📊</span>
                  <span>Interactive Nutrition Guides</span>
                  <span className="nkc-section-count">Quick Reference</span>
                </div>
                <div className="nkc-infographic-grid">
                  <InfoGraphicCard emoji="🥩" title="Protein Sources" stats={[
                    { label: 'Chicken Breast', value: '31g/100g', color: '#34d399' },
                    { label: 'Greek Yogurt', value: '10g/100g', color: '#60a5fa' },
                    { label: 'Eggs', value: '13g/100g', color: '#fbbf24' },
                    { label: 'Lentils', value: '9g/100g', color: '#a78bfa' },
                  ]} />
                  <InfoGraphicCard emoji="💧" title="Hydration Goals" stats={[
                    { label: 'Sedentary Adult', value: '2.0L/day', color: '#22d3ee' },
                    { label: 'Active Person', value: '3.0L/day', color: '#60a5fa' },
                    { label: 'Athlete (Training)', value: '4.0L/day', color: '#34d399' },
                    { label: 'Per 1hr Exercise', value: '+500ml', color: '#fbbf24' },
                  ]} />
                  <InfoGraphicCard emoji="⚡" title="Daily Macro Split" stats={[
                    { label: 'Protein (Muscle Gain)', value: '30–35%', color: '#34d399' },
                    { label: 'Carbohydrates', value: '40–50%', color: '#fbbf24' },
                    { label: 'Healthy Fats', value: '20–30%', color: '#60a5fa' },
                    { label: 'Fiber Target', value: '25–35g', color: '#a78bfa' },
                  ]} />
                  <InfoGraphicCard emoji="🌿" title="Key Micronutrients" stats={[
                    { label: 'Vitamin D (Adults)', value: '600 IU/day', color: '#fbbf24' },
                    { label: 'Iron (Women)', value: '18mg/day', color: '#f87171' },
                    { label: 'Calcium (Adults)', value: '1000mg/day', color: '#60a5fa' },
                    { label: 'Magnesium', value: '320–420mg', color: '#4ade80' },
                  ]} />
                </div>
              </div>
            )}

            <div className="nkc-section">
              <div className="nkc-section-header">
                <span className="nkc-section-icon">📖</span>
                <span>{search ? `Results for "${search}"` : activeCategory === 'All' ? 'All Articles' : activeCategory}</span>
                <span className="nkc-section-count">{filtered.length} articles</span>
                <div className="nkc-layout-toggle">
                  <button className={`nkc-toggle-btn ${layout === 'grid' ? 'active' : ''}`} onClick={() => setLayout('grid')}>⊞</button>
                  <button className={`nkc-toggle-btn ${layout === 'list' ? 'active' : ''}`} onClick={() => setLayout('list')}>☰</button>
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="nkc-empty">
                  <div className="nkc-empty-icon">🔍</div>
                  <div className="nkc-empty-text">No articles found for "{search}"</div>
                  <button className="nkc-empty-clear" onClick={() => { setSearch(''); setActiveCategory('All'); }}>Clear filters</button>
                </div>
              ) : (
                <div className={layout === 'grid' ? 'nkc-articles-grid' : 'nkc-articles-list'}>
                  {filtered.map(a => <ArticleCard key={a.id} article={a} bookmarks={bookmarks} onBookmark={toggleBookmark} onOpen={openReader} layout={layout} />)}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="nkc-right-sidebar">
            <div className="nkc-widget">
              <div className="nkc-widget-title"><span>🎯</span> Goal: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{userGoal}</span></div>
              <div className="nkc-widget-recs">
                {(userGoal.toLowerCase().includes('muscle') || userGoal.toLowerCase().includes('gain')
                  ? ARTICLES.filter(a => ['Muscle Gain', 'Protein', 'Supplements', 'Recovery Nutrition'].includes(a.category))
                  : ARTICLES.filter(a => a.trending)
                ).slice(0, 4).map(a => (
                  <div key={a.id} className="nkc-widget-item" onClick={() => openReader(a)}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{a.emoji}</span>
                    <div>
                      <div className="nkc-widget-item-title">{a.title.length > 45 ? a.title.slice(0, 45) + '…' : a.title}</div>
                      <div className="nkc-widget-item-meta">{a.readTime} min · <span style={{ color: catClr(a.category) }}>{a.category}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nkc-widget">
              <div className="nkc-widget-title"><span>🔥</span> Trending This Week</div>
              {trending.map((a, i) => (
                <div key={a.id} className="nkc-widget-trending-item" onClick={() => openReader(a)} style={{ cursor: 'pointer' }}>
                  <span className="nkc-trending-num">#{i + 1}</span>
                  <div>
                    <div className="nkc-widget-item-title">{a.title.length > 40 ? a.title.slice(0, 40) + '…' : a.title}</div>
                    <div className="nkc-widget-item-meta">👁 {(a.views / 1000).toFixed(1)}k · {a.readTime} min</div>
                  </div>
                </div>
              ))}
            </div>

            {bookmarked.length > 0 && (
              <div className="nkc-widget">
                <div className="nkc-widget-title"><span>🔖</span> Bookmarked ({bookmarked.length})</div>
                {bookmarked.map(a => (
                  <div key={a.id} className="nkc-widget-item" onClick={() => openReader(a)}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{a.emoji}</span>
                    <div>
                      <div className="nkc-widget-item-title">{a.title.length > 40 ? a.title.slice(0, 40) + '…' : a.title}</div>
                      <div className="nkc-widget-item-meta">{a.readTime} min</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); toggleBookmark(a.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginLeft: 'auto' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="nkc-widget">
              <div className="nkc-widget-title"><span>👩‍⚕️</span> Our Experts</div>
              {[
                { name: 'Dr. Sarah Chen', role: 'Sports Nutritionist', initials: 'SC', color: '#34d399' },
                { name: 'Dr. Emily Zhao', role: 'Clinical Dietitian', initials: 'EZ', color: '#60a5fa' },
                { name: 'Dr. Marcus Webb', role: 'Sports Medicine', initials: 'MW', color: '#a78bfa' },
                { name: 'James Miller', role: 'Exercise Physiologist', initials: 'JM', color: '#22d3ee' },
              ].map(e => (
                <div key={e.name} className="nkc-expert-item">
                  <div className="nkc-expert-avatar" style={{ background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}44` }}>{e.initials}</div>
                  <div>
                    <div className="nkc-widget-item-title">{e.name}</div>
                    <div className="nkc-widget-item-meta">{e.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="nkc-widget nkc-widget-path">
              <div className="nkc-widget-title"><span>🗺️</span> Learning Path</div>
              <div className="nkc-path-sub">Beginner → Intermediate → Advanced</div>
              {[
                { step: 1, title: 'Macronutrient Basics', done: true },
                { step: 2, title: 'Caloric Balance', done: true },
                { step: 3, title: 'Meal Planning', done: false },
                { step: 4, title: 'Supplement Science', done: false },
                { step: 5, title: 'Sport Nutrition', done: false },
              ].map(p => (
                <div key={p.step} className={`nkc-path-item ${p.done ? 'nkc-path-done' : ''}`}>
                  <div className={`nkc-path-dot ${p.done ? 'nkc-path-dot-done' : ''}`}>{p.done ? '✓' : p.step}</div>
                  <div className="nkc-path-label">{p.title}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
