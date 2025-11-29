/**
 * Generate demo images showing inventory value progression (2M → 10M IDR)
 * Run: node scripts/generate-demo-images.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Image prompts showing inventory value progression
const PROGRESSION_PROMPTS = [
  {
    stage: 1,
    value: "2M",
    name: "inventory_2juta",
    prompt: "Realistic photo of a small Indonesian warung wooden shelf with basic inventory worth around 2 million rupiah: 1 small rice sack (10kg), 3-4 cooking oil bottles, 10 instant noodle packs, few coffee sachets, 2-3 sugar packs, some snacks. Simple sparse shelf, humble beginning. Natural daylight, authentic Indonesian village shop."
  },
  {
    stage: 2,
    value: "4M",
    name: "inventory_4juta",
    prompt: "Realistic photo of an Indonesian warung shelf with inventory worth around 4 million rupiah: 2 rice sacks, 6-8 cooking oil bottles, 20+ instant noodles in rows, sugar and flour bags, various snacks, some drinks, basic toiletries (soap, shampoo sachets). Shelf filling up nicely. Natural lighting, authentic Indonesian shop."
  },
  {
    stage: 3,
    value: "6M",
    name: "inventory_6juta",
    prompt: "Realistic photo of a growing Indonesian warung with inventory worth around 6 million rupiah: 3 rice sacks stacked, full shelf of cooking oils and instant noodles, multiple drink brands (teh botol, aqua), snacks variety, toiletries section, eggs tray, condensed milk cans. Two shelves visible, organized display. Natural lighting."
  },
  {
    stage: 4,
    value: "8M",
    name: "inventory_8juta",
    prompt: "Realistic photo of a prosperous Indonesian warung with inventory worth around 8 million rupiah: multiple rice sacks, full cooking oil display, extensive instant noodle variety, refrigerated drinks section, snacks wall, household items (detergent, soap), baby products, cigarette display, glass counter with more items. Well-organized, successful small business. Bright natural lighting."
  },
  {
    stage: 5,
    value: "10M",
    name: "inventory_10juta",
    prompt: "Realistic photo of a thriving Indonesian warung with abundant inventory worth around 10 million rupiah: large rice stock, full beverage refrigerator, extensive product variety across multiple shelves - food, drinks, snacks, household supplies, personal care, baby items. Glass display counter, hanging snacks, professional organization. Prosperous successful micro-business look. Bright cheerful lighting."
  }
];

async function generateImages() {
  console.log("🎨 Generating inventory progression images (2M → 10M IDR)...\n");
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: { responseModalities: ["image", "text"] }
  });

  const outputDir = path.join(__dirname, '../demo-images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const item of PROGRESSION_PROMPTS) {
    console.log(`📸 Stage ${item.stage}: Rp ${item.value} - ${item.name}...`);
    
    try {
      const result = await model.generateContent(item.prompt);
      const response = result.response;
      
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const ext = part.inlineData.mimeType.includes('png') ? 'png' : 'jpg';
            const filepath = path.join(outputDir, `${item.name}.${ext}`);
            fs.writeFileSync(filepath, Buffer.from(part.inlineData.data, 'base64'));
            console.log(`   ✅ Saved: ${item.name}.${ext}`);
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n✨ Done! Images saved to demo-images folder.");
}

generateImages().catch(console.error);
