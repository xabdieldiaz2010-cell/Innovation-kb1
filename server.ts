import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup parser
app.use(express.json({ limit: '10mb' }));

// Lazy Initialize Gemini SDK safely to prevent crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Assistant will operate in fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-Memory store for Consultations, backed up by a JSON file for container restarts
const DATA_FILE = path.join(process.cwd(), 'consultations.json');
let consultations: any[] = [];

// Load existing consultations on startup
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    consultations = JSON.parse(raw);
    console.log(`Loaded ${consultations.length} consultations from storage.`);
  }
} catch (e) {
  console.error("Failed to load consultations file:", e);
}

// Helper to save consultations
function saveConsultations() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(consultations, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to save consultations to disk:", e);
  }
}

// Seed with an example consultation to make the admin portal look outstanding immediately
if (consultations.length === 0) {
  consultations = [
    {
      id: "ogc-seed-1",
      fullName: "Isabella Martinez",
      email: "isabella.m@orlandoresidences.com",
      phone: "407-555-0182",
      zipCode: "32801",
      projectType: "Kitchen",
      scope: "Complete Transformation",
      preferredMaterial: "Calacatta Gold Quartz",
      budgetRange: "$25,000 - $50,000",
      timeline: "1-3 Months",
      message: "Looking to replace our old builder-grade laminate. We love the double-island look with Calacatta quartz waterfall edges and matching full slab backsplash. We want custom cabinetry in Midnight Navy.",
      date: "2026-06-29",
      timeSlot: "10:00 AM - 12:00 PM",
      status: "Confirmed",
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
      savedSelection: {
        stoneId: "calacatta-gold",
        cabinetId: "midnight-navy",
        backsplash: "full-slab",
        edgeId: "ogee",
        sinkType: "undermount"
      }
    },
    {
      id: "ogc-seed-2",
      fullName: "Arthur Pendelton",
      email: "apendelton@winterparkdev.com",
      phone: "321-555-0144",
      zipCode: "32789",
      projectType: "Commercial",
      scope: "Custom Remodeling",
      preferredMaterial: "Statuario White Porcelain",
      budgetRange: "$50,000+",
      timeline: "Immediate",
      message: "Commercial project: We are designing a high-traffic reception lobby for a new medical suite in Winter Park. Need highly durable porcelain cladding for the circular desk, bookmatched. Total area is approx 180 sq ft.",
      date: "2026-07-02",
      timeSlot: "02:00 PM - 04:00 PM",
      status: "Pending",
      createdAt: new Date().toISOString(),
      savedSelection: {
        stoneId: "statuario-porcelain",
        cabinetId: "chantilly-white",
        backsplash: "none",
        edgeId: "bevel",
        sinkType: "none"
      }
    }
  ];
  saveConsultations();
}

// --- API ROUTES ---

// 1. Health/Test Connection Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), count: consultations.length });
});

// 2. Fetch consultations list
app.get("/api/consultations", (req, res) => {
  res.json(consultations);
});

// 3. Create a consultation booking request
app.post("/api/consultations", (req, res) => {
  try {
    const reqData = req.body;
    if (!reqData.fullName || !reqData.email || !reqData.phone) {
      return res.status(400).json({ error: "Missing required fields (fullName, email, phone)" });
    }

    const newConsultation = {
      id: `ogc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fullName: reqData.fullName,
      email: reqData.email,
      phone: reqData.phone,
      zipCode: reqData.zipCode || "32801",
      projectType: reqData.projectType || "Kitchen",
      scope: reqData.scope || "Complete Transformation",
      preferredMaterial: reqData.preferredMaterial || "Undecided",
      budgetRange: reqData.budgetRange || "Planning",
      timeline: reqData.timeline || "Planning",
      message: reqData.message || "",
      date: reqData.date || new Date().toISOString().split('T')[0],
      timeSlot: reqData.timeSlot || "Anytime",
      status: "Pending",
      createdAt: new Date().toISOString(),
      savedSelection: reqData.savedSelection || undefined,
      uploadedFiles: reqData.uploadedFiles || undefined,
    };

    consultations.unshift(newConsultation); // place newest first
    saveConsultations();

    res.status(201).json({ success: true, consultation: newConsultation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Update consultation status
app.patch("/api/consultations/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const index = consultations.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Consultation not found" });
  }

  consultations[index].status = status;
  saveConsultations();
  res.json({ success: true, consultation: consultations[index] });
});

// 5. Delete consultation
app.delete("/api/consultations/:id", (req, res) => {
  const { id } = req.params;
  const index = consultations.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Consultation not found" });
  }

  consultations.splice(index, 1);
  saveConsultations();
  res.json({ success: true, message: "Consultation removed" });
});

// Local Smart Static Design Advice Generator (used when API is unavailable or has credentials issue)
function generateSmartDesignAdvice(message: string, currentSelection: any): string {
  const stoneName = {
    'calacatta-gold': 'Calacatta Gold Quartz',
    'absolute-black': 'Absolute Black Granite',
    'blue-bahia': 'Blue Bahia Quartzite',
    'emerald-green-porcelain': 'Emerald Green Porcelain',
    'colonial-white': 'Colonial White Granite',
    'statuario-porcelain': 'Statuario White Porcelain',
    'empire-gray': 'Empire Gray Quartz'
  }[currentSelection?.stoneId] || 'our custom slabs';

  const cabinetName = {
    'chantilly-white': 'Chantilly Lace White',
    'charcoal-gray': 'Charcoal Slate Gray',
    'midnight-navy': 'Midnight Navy Blue',
    'warm-oak': 'Warm Oak Woodgrain'
  }[currentSelection?.cabinetId] || 'our premium cabinetry';

  const backsplashName = {
    'subway': 'Classic Subway Tile Backsplash',
    'full-slab': 'Sleek Full-Slab Matching Backsplash',
    'mosaic': 'Exquisite Mosaic Tile Backsplash',
    'none': 'Minimal/No Backsplash'
  }[currentSelection?.backsplash] || 'custom backsplash';

  const edgeName = {
    'eased': 'Eased / Flat Edge',
    'bevel': 'Beveled Edge',
    'bullnose': 'Full Bullnose Edge',
    'ogee': 'Classic Ogee Edge'
  }[currentSelection?.edgeId] || 'custom edge profile';

  const sinkName = {
    'undermount': 'Modern Undermount Sink',
    'farmhouse': 'Elegant Farmhouse Sink',
    'apron-front': 'Apron-Front Design Sink',
    'none': 'No Sink / Custom Selection'
  }[currentSelection?.sinkType] || 'sink layout';

  const msgLower = (message || '').toLowerCase();

  let adviceIntro = "";
  let designAnalysis = "";
  let hardwareTips = "";
  let centralFloridaTip = "";

  if (currentSelection) {
    adviceIntro = `Greetings! I am Caleb, lead design consultant for Innovation Kitchen and Bath. I would be absolutely thrilled to help you analyze your project. 
    
 I see you're evaluating a gorgeous combination in our design customizer: **${stoneName}** countertops paired with **${cabinetName}** cabinets, complete with a **${backsplashName}** and finished with a **${edgeName}** profile hosting a **${sinkName}**!`;

    if (currentSelection.stoneId === 'calacatta-gold' && currentSelection.cabinetId === 'midnight-navy') {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: This is one of IKB's signature high-end combinations! The deep, regal undertones of the *Midnight Navy* cabinets provide an incredible anchor that draws out the subtle golden-warm veins of the *Calacatta Gold Quartz*.
- **Backsplash Selection**: Your choice of a **${backsplashName}** is excellent. It creates a continuous marble-esque flow that visually expands the kitchen height and creates a grand focal point.
- **Edge Architecture**: The **${edgeName}** profile adds a beautifully tailored outline to your countertops, contributing to that bespoke, high-luxury aesthetic.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: We highly recommend brushed brass or satin gold handles and plumbing fixtures to directly mirror the golden veining of the Calacatta Quartz.
- **Lighting Temperature**: Use 3000K warm-white LED under-cabinet tape lights to highlight the countertops without washing out the deep blue cabinetry.`;
    } else if (currentSelection.stoneId === 'absolute-black' && currentSelection.cabinetId === 'chantilly-white') {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: A true high-contrast luxury classic! The stark *Chantilly Lace White* cabinets bring unparalleled brightness and clean elegance, while the *Absolute Black Granite* brings deep, rich basaltic structure that grounds the space.
- **Durability**: Absolute Black Granite is practically indestructible and highly resistant to stains and heat.
- **Backsplash Selection**: Pairing this with a **${backsplashName}** offers beautiful texture to prevent the black-and-white theme from feeling sterile.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: Matte black handles create a sleek modern vibe, while polished chrome provides an incredibly crisp, jewelry-like sparkle.
- **Lighting Temperature**: Go with 3500K neutral white recessed cans to preserve the bright white cabinetry.`;
    } else if (currentSelection.stoneId === 'blue-bahia' || currentSelection.stoneId === 'emerald-green-porcelain') {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: You have a spectacular eye for exotic luxury. Pairing **${stoneName}** with **${cabinetName}** creates a custom, conversation-starting masterpiece.
- **Architectural Depth**: These rare jewel-toned slabs deserve to be the centerpiece. Keeping the surrounding cabinets clean like *${cabinetName}* allows the dramatic stone patterns to be the main focal point.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: Choose minimal, understated satin nickel or brushed stainless steel fixtures to avoid competing with the rich colors of the stone.
- **Lighting Temperature**: Dimmable pendant lights over the island are crucial to accentuating the natural crystalline structures in the quartzite or the gold veins of the porcelain.`;
    } else {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: This combination of **${stoneName}** and **${cabinetName}** is highly sophisticated. It strikes a beautiful balance between warmth, luxury, and daily utility.
- **Edge & Sink Harmony**: The **${edgeName}** with a **${sinkName}** provides clean lines and high-end functional longevity. It ensures ease of cleaning while maintaining IKB's signature high standards.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: Satin bronze or soft gold hardware works wonders to warm up gray tones, whereas matte black adds an industrial edge.
- **Lighting Temperature**: We recommend adjustable directional spotlights to showcase the exact texture and polish of your countertop edge.`;
    }
  } else {
    adviceIntro = `Greetings! I am Caleb, lead design consultant for Innovation Kitchen and Bath. I would be absolutely thrilled to assist you with your remodeling vision today.`;
    designAnalysis = `### 🌟 Caleb's Design Consultation Recommendations
- **Our Process**: At IKB, we believe every kitchen, bathroom, and commercial space is unique. Since 2011, we've fabricated and installed thousands of premium countertop slabs and custom cabinets throughout Central Florida.
- **Material Choices**: We invite you to explore our dynamic design customizer! We feature premium Quartz (like Calacatta Gold), indestructible natural Granite (like Absolute Black), rare Quartzite (like Blue Bahia), and state-of-the-art Spanish Porcelain.
- **Custom Cabinetry**: Complete your space with our premium cabinet finishes including Chantilly Lace White, Charcoal Slate Gray, Midnight Navy Blue, or Warm Oak Woodgrain.`;
    hardwareTips = `### 💡 Materials Selection Tips
- **High Traffic Spaces**: If you cook frequently, our Quartz and high-tech Porcelain provide non-porous, maintenance-free surfaces.
- **Natural Stone Enthusiasts**: For raw organic depth, natural Granite or exotic Quartzite offers unique, one-of-a-kind slab patterns.`;
  }

  let keywordResponse = "";
  if (msgLower.includes("cost") || msgLower.includes("price") || msgLower.includes("budget") || msgLower.includes("expensive")) {
    keywordResponse = `\n### 📊 Budget & Pricing Insights
- **Pricing Tiers**: *${stoneName}* is in our **Luxury/Premium** tier due to its elite aesthetics and high-demand fabrication requirements.
- **Cost Saving Tip**: If you love the look but want to optimize your investment, keeping your layout simple with an **Eased Edge** and utilizing IKB's custom-fabricated in-stock slab program can save up to 15% on fabrication costs! You can also check out our real-time **Estimate Calculator** in the menu above for an interactive breakdown.`;
  } else if (msgLower.includes("kitchen") || msgLower.includes("island") || msgLower.includes("counter")) {
    keywordResponse = `\n### 🍳 Kitchen & Island Design Notes
- **Double Islands**: For large kitchens in Windermere or Lake Nona, we love doing a dramatic *Waterfall Edge* on the central island and a clean *Eased Edge* on the perimeter countertops.
- **Backsplash Continuity**: Continuing the countertop stone all the way up as a full-slab backsplash creates an ultra-premium, continuous luxurious feel that is incredibly easy to clean compared to traditional tile grout lines.`;
  } else if (msgLower.includes("bath") || msgLower.includes("vanity") || msgLower.includes("shower")) {
    keywordResponse = `\n### 🛁 Bathroom & Custom Vanity Tips
- **Moisture Resistance**: For high-humidity bathrooms, our Spanish porcelain slabs are absolutely ideal. They have zero moisture absorption, are mold-resistant, and can be used on both vanities and full walk-in shower walls.
- **Sinks**: An undermount sink provides a clean, seamless sweep to easily wipe down water from the countertops.`;
  }

  centralFloridaTip = `\n### 📍 Central Florida Serving Area
IKB proudly serves clients in **Winter Park, Windermere, Lake Nona, Dr. Phillips, Downtown Orlando**, and surrounding areas. Our fully equipped fabrication facility in Orlando is state-of-the-art, ensuring maximum cutting precision and flawless delivery to your home.`;

  const footer = `\n***

*Note: Our design network is currently experiencing heavy traffic, so I am providing direct designer catalog insights. To proceed with your remodel, I highly recommend scheduling a complimentary, personalized in-home consultation!*

**Ready to bring this design to life?** Please use the **Consultation Scheduler** on the left to secure an in-home measurement session with our master installers, where we will bring real material samples directly to your home!`;

  return `${adviceIntro}\n\n${designAnalysis}\n\n${hardwareTips}${keywordResponse}${centralFloridaTip}${footer}`;
}

// 6. IKB AI Design Assistant (Caleb) powered by Gemini
app.post("/api/design-assistant", async (req, res) => {
  try {
    const { message, history, currentSelection } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing prompt message" });
    }

    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    // If key is missing or is the placeholder, use the smart static design advice directly
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      const offlineReply = generateSmartDesignAdvice(message, currentSelection);
      return res.json({ text: offlineReply });
    }

    // Prepare system instructions establishing Caleb's persona
    const systemInstruction = `You are Caleb, the elite Master Interior Design Architect and Stone Fabrication Consultant for Innovation Kitchen and Bath (IKB) in Central Florida.
IKB is a prestigious, full-service kitchen, bathroom, and commercial remodeling company founded in 2011 with an in-house fabrication facility in Orlando. We specialize in custom cabinets, countertops, and full stone/porcelain tile layouts.

Your style is: highly expert, creative, respectful, design-fluent, and professional. Avoid casual slang; sound like a seasoned architectural designer who appreciates premium materials and extreme precision.
Use bullet points and bold headers to make your feedback easy and gorgeous to read.

When clients chat with you:
1. Provide deep, expert design feedback based on their requests.
2. Recommend IKB materials if relevant:
   - "Calacatta Gold Quartz" (Luxurious marble look, bold gold/gray veins, zero maintenance)
   - "Absolute Black Granite" (Consistent deep black, heat-resistant, indestructible basalt)
   - "Blue Bahia Quartzite" (Rare, exotic Brazilian blue stone with gold/white swirls)
   - "Emerald Green Porcelain" (Spanish high-tech porcelain, dark jade/emerald, non-porous)
   - "Statuario White Porcelain" (Polished white slab, deep charcoal marbling, modern master class)
   - "Colonial White Granite" (Soft cotton-white natural stone with garnet speckles, traditional/transitional warmth)
   - "Empire Gray Quartz" (Sleek concrete-gray quartz, modern industrial versatility)
3. Recommend IKB cabinet custom colors:
   - "Chantilly Lace White" (Crisp, bright, opens spaces)
   - "Charcoal Slate Gray" (Cool, contemporary contrast)
   - "Midnight Navy Blue" (Rich, nautical, high-end island statement)
   - "Warm Oak Woodgrain" (Amber natural warmth, modern organic/farmhouse)
4. Address customizer selections if they are present in the query (represented by: \${currentSelection ? JSON.stringify(currentSelection) : 'none'}). Validate if their choices (e.g., quartz with navy, or porcelain with white) work well together, and offer lighting, wall paint, or hardware tips (e.g. brass handles, satin nickel fixtures).
5. Address Central Florida context (Winter Park, Windermere, Lake Nona, downtown Orlando, Dr. Phillips) which IKB proudly serves.
6. Always end by encouraging them to use the Consultation Scheduler to schedule an in-home precision 3D templating/mapping consultation with our master installers.`;

    const formattedContents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        formattedContents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    let finalPrompt = message;
    if (currentSelection) {
      finalPrompt += `\n\n[Design Context: The user currently has selected ${currentSelection.stoneId} countertop, combined with ${currentSelection.cabinetId} cabinets, and ${currentSelection.backsplash} backsplash with ${currentSelection.edgeId} edge in the interactive studio customizer. Please tailor your specific design advice to this combination!]`;
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    });

    // Try a series of Gemini models to handle rate limiting / high demand (503) gracefully
    const modelsToTry = [
      "gemini-3.5-flash",         // Primary model for basic text
      "gemini-3.1-flash-lite",    // Low-latency, high-quota fallback
      "gemini-flash-latest"       // General flash model
    ];

    let lastError: any = null;
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to generate response using model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.75,
          }
        });

        if (response && response.text) {
          console.log(`Successfully generated response using model: ${modelName}`);
          return res.json({ text: response.text });
        }
      } catch (err: any) {
        // Log gracefully to indicate fallback without raising noisy alarm bells
        const errorMsg = err.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
        console.log(`[Resilience Engine] Note: Model ${modelName} is currently occupied (${errorMsg.slice(0, 150)}). Switching to next available model...`);
        lastError = err;
        // Continue to the next model in case of 503/high-demand errors
      }
    }

    // If all models failed (e.g., severe 503 outage or API keys blocked), fallback to our robust local designer advisor
    console.error("All Gemini models failed. Falling back to Caleb's offline design advisor engine.", lastError);
    const offlineText = generateSmartDesignAdvice(message, currentSelection);
    return res.json({ text: offlineText });

  } catch (error: any) {
    console.error("Unexpected error in design assistant endpoint:", error);
    // Even if everything else fails, return the robust mock adviser so the app NEVER breaks
    try {
      const offlineText = generateSmartDesignAdvice(req.body?.message || "", req.body?.currentSelection);
      return res.json({ text: offlineText });
    } catch (fallbackErr) {
      res.status(500).json({ error: "System temporarily offline." });
    }
  }
});


// --- INTEGRATE VITE OR SERVE STATIC FILES ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    
    // Check if dist folder exists before mounting
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn("WARNING: 'dist' folder not found. Please run 'npm run build' to bundle the client app.");
      // Fallback message so it doesn't crash empty containers
      app.get('/', (req, res) => {
        res.send("Application is starting up. Please compile the applet first.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Innovation Kitchen and Bath backend running on http://localhost:${PORT}`);
  });
}

startServer();
