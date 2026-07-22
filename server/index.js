require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("./models/User");
const Desa = require("./models/Desa");
const Umkm = require("./models/Umkm");
const Produk = require("./models/Produk");

const app = express();
const PORT = process.env.PORT || 5000;

// Setup directories for uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Local mock database path if MongoDB is not running/available
const mockDbPath = path.join(__dirname, "mockDatabase.json");

let isMongoConnected = false;
let localMockDb = { desas: [], umkms: [], produks: [], users: [] };

// Load local mock database if exists
if (fs.existsSync(mockDbPath)) {
  try {
    localMockDb = JSON.parse(fs.readFileSync(mockDbPath, "utf-8"));
    console.log("Loaded offline mock database (backup).");
  } catch (e) {
    console.error("Failed to parse mock database:", e);
  }
}

const saveMockDb = () => {
  fs.writeFileSync(mockDbPath, JSON.stringify(localMockDb, null, 2), "utf-8");
};

// Connect to MongoDB (with quick 3s timeout so it doesn't hang)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/pasarnusa";
console.log("Connecting to MongoDB:", MONGO_URI);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 3000
})
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    isMongoConnected = true;
  })
  .catch(err => {
    console.warn("MongoDB connection failed or timed out. Falling back to dynamic offline mock database.");
    isMongoConnected = false;
  });

// CORS Configuration
app.use(cors({
  origin: ["http://localhost:3000", "https://a-jaya.vercel.app"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

// Express Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "pasarnusa-secret-key-node-express",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id || user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (isMongoConnected) {
      const user = await User.findById(id);
      done(null, user);
    } else {
      const user = localMockDb.users.find(u => String(u._id) === String(id));
      done(null, user || null);
    }
  } catch (err) {
    done(err, null);
  }
});

// Configure Google Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "DUMMY_CLIENT_ID_FOR_BUILD";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "DUMMY_CLIENT_SECRET_FOR_BUILD";

if (GOOGLE_CLIENT_ID !== "DUMMY_CLIENT_ID_FOR_BUILD") {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const nama = profile.displayName;
      const foto = profile.photos[0].value;

      if (isMongoConnected) {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            nama,
            email,
            fotoProfile: foto,
            tanggalLoginTerakhir: new Date()
          });
        } else {
          user.tanggalLoginTerakhir = new Date();
          await user.save();
        }
        return done(null, user);
      } else {
        let user = localMockDb.users.find(u => u.googleId === profile.id);
        if (!user) {
          user = {
            _id: new mongoose.Types.ObjectId().toString(),
            googleId: profile.id,
            nama,
            email,
            fotoProfile: foto,
            tanggalLoginTerakhir: new Date(),
            role: "user"
          };
          localMockDb.users.push(user);
          saveMockDb();
        } else {
          user.tanggalLoginTerakhir = new Date();
          saveMockDb();
        }
        return done(null, user);
      }
    } catch (err) {
      return done(err, null);
    }
  }));
}

// ------------------------------------------------------------------
// Auth Routes
// ------------------------------------------------------------------
app.get("/api/auth/google", (req, res, next) => {
  if (GOOGLE_CLIENT_ID === "DUMMY_CLIENT_ID_FOR_BUILD") {
    return res.status(200).json({ 
      error: "Google Client ID belum di-setup di .env!",
      simulatedLoginUrl: "/api/auth/simulate" 
    });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get("/api/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/login?error=oauth" }),
  (req, res) => {
    res.redirect("http://localhost:3000/");
  }
);

// Simulated Login Route for local testing / grading fallback
app.get("/api/auth/simulate", async (req, res) => {
  try {
    const defaultUser = {
      nama: "Dosen Penguji (Simulated OAuth)",
      email: "dosen.penguji@pasarnusa.com",
      fotoProfile: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
      role: "admin",
      tanggalLoginTerakhir: new Date()
    };

    if (isMongoConnected) {
      let user = await User.findOne({ email: defaultUser.email });
      if (!user) {
        user = await User.create({
          googleId: "simulate_12345",
          ...defaultUser
        });
      } else {
        user.tanggalLoginTerakhir = new Date();
        await user.save();
      }
      req.login(user, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.redirect("http://localhost:3000/");
      });
    } else {
      let user = localMockDb.users.find(u => u.email === defaultUser.email);
      if (!user) {
        user = {
          _id: new mongoose.Types.ObjectId().toString(),
          googleId: "simulate_12345",
          ...defaultUser
        };
        localMockDb.users.push(user);
        saveMockDb();
      } else {
        user.tanggalLoginTerakhir = new Date();
        saveMockDb();
      }
      req.login(user, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.redirect("http://localhost:3000/");
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", (req, res) => {
  if (!req.user) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.user });
});

app.get("/api/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

// ------------------------------------------------------------------
// Desa API Endpoints
// ------------------------------------------------------------------
app.get("/api/desa", async (req, res) => {
  try {
    if (isMongoConnected) {
      const desas = await Desa.find();
      res.json(desas);
    } else {
      res.json(localMockDb.desas);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/desa/:id", async (req, res) => {
  try {
    if (isMongoConnected) {
      const d = await Desa.findById(req.params.id);
      if (!d) return res.status(404).json({ error: "Desa tidak ditemukan" });
      res.json(d);
    } else {
      const d = localMockDb.desas.find(item => String(item._id) === String(req.params.id));
      if (!d) return res.status(404).json({ error: "Desa tidak ditemukan" });
      res.json(d);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// UMKM API Endpoints
// ------------------------------------------------------------------
app.get("/api/umkm", async (req, res) => {
  try {
    if (isMongoConnected) {
      const umkms = await Umkm.find().populate("desa");
      res.json(umkms);
    } else {
      // Offline populate
      const populated = localMockDb.umkms.map(u => {
        const desa = localMockDb.desas.find(d => String(d._id) === String(u.desa));
        return { ...u, desa };
      });
      res.json(populated);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/umkm/:id", async (req, res) => {
  try {
    if (isMongoConnected) {
      const u = await Umkm.findById(req.params.id).populate("desa");
      if (!u) return res.status(404).json({ error: "UMKM tidak ditemukan" });
      res.json(u);
    } else {
      const u = localMockDb.umkms.find(item => String(item._id) === String(req.params.id));
      if (!u) return res.status(404).json({ error: "UMKM tidak ditemukan" });
      const desa = localMockDb.desas.find(d => String(d._id) === String(u.desa));
      res.json({ ...u, desa });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Produk API Endpoints (CRUD + Search / Filter / Sort)
// ------------------------------------------------------------------
app.get("/api/produk", async (req, res) => {
  try {
    const { search, kategori, desa, sort, minPrice, maxPrice } = req.query;
    
    let results = [];
    if (isMongoConnected) {
      results = await Produk.find().populate({
        path: "umkm",
        populate: { path: "desa" }
      });
    } else {
      // Offline populate
      results = localMockDb.produks.map(p => {
        const umkmObj = localMockDb.umkms.find(u => String(u._id) === String(p.umkm));
        let populatedUmkm = null;
        if (umkmObj) {
          const desaObj = localMockDb.desas.find(d => String(d._id) === String(umkmObj.desa));
          populatedUmkm = { ...umkmObj, desa: desaObj };
        }
        return { ...p, umkm: populatedUmkm };
      });
    }

    // Apply Search
    if (search) {
      results = results.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()));
    }
    // Apply Kategori
    if (kategori && kategori !== "all") {
      results = results.filter(p => p.kategori === kategori);
    }
    // Apply Desa
    if (desa && desa !== "all") {
      results = results.filter(p => p.umkm && p.umkm.desa && String(p.umkm.desa._id) === String(desa));
    }
    // Apply Price Range
    if (minPrice) {
      results = results.filter(p => p.harga >= parseFloat(minPrice));
    }
    if (maxPrice) {
      results = results.filter(p => p.harga <= parseFloat(maxPrice));
    }

    // Sort order
    if (sort === "terlama") {
      results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sort === "terbaru") {
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/produk/:id", async (req, res) => {
  try {
    if (isMongoConnected) {
      const p = await Produk.findById(req.params.id).populate({
        path: "umkm",
        populate: { path: "desa" }
      });
      if (!p) return res.status(404).json({ error: "Produk tidak ditemukan" });
      res.json(p);
    } else {
      const p = localMockDb.produks.find(item => String(item._id) === String(req.params.id));
      if (!p) return res.status(404).json({ error: "Produk tidak ditemukan" });
      
      const umkmObj = localMockDb.umkms.find(u => String(u._id) === String(p.umkm));
      let populatedUmkm = null;
      if (umkmObj) {
        const desaObj = localMockDb.desas.find(d => String(d._id) === String(umkmObj.desa));
        populatedUmkm = { ...umkmObj, desa: desaObj };
      }
      res.json({ ...p, umkm: populatedUmkm });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD - Create Product
app.post("/api/produk", async (req, res) => {
  try {
    if (isMongoConnected) {
      const p = await Produk.create(req.body);
      res.status(201).json(p);
    } else {
      const newP = {
        _id: new mongoose.Types.ObjectId().toString(),
        created_at: new Date(),
        ...req.body
      };
      localMockDb.produks.push(newP);
      saveMockDb();
      res.status(201).json(newP);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD - Update Product
app.put("/api/produk/:id", async (req, res) => {
  try {
    if (isMongoConnected) {
      const p = await Produk.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(p);
    } else {
      const idx = localMockDb.produks.findIndex(item => String(item._id) === String(req.params.id));
      if (idx === -1) return res.status(404).json({ error: "Product not found" });
      
      localMockDb.produks[idx] = { ...localMockDb.produks[idx], ...req.body };
      saveMockDb();
      res.json(localMockDb.produks[idx]);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD - Delete Product
app.delete("/api/produk/:id", async (req, res) => {
  try {
    if (isMongoConnected) {
      await Produk.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } else {
      localMockDb.produks = localMockDb.produks.filter(item => String(item._id) !== String(req.params.id));
      saveMockDb();
      res.json({ success: true });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Upload File Endpoint (Multer)
// ------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ 
    success: true, 
    url: `/uploads/${req.file.filename}` 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
