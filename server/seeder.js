const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Desa = require("./models/Desa");
const Umkm = require("./models/Umkm");
const Produk = require("./models/Produk");

const MONGO_URI = "mongodb+srv://user-nusa:reykaNusa123@cluster0.qmddv.mongodb.net/pasarnusa?retryWrites=true&w=majority";
const base_dir = r"C:\PasarNusa\data\extracted_texts"; // We can read from our database structure

const villages = [
  { key: "Sukajaya", name: "Desa Sukajaya", kec: "Sukajaya", kab: "Kabupaten Bogor", lat: -6.6189, lon: 106.5123, desc: "Desa Sukajaya terletak di kawasan perbukitan Kecamatan Sukajaya, Kabupaten Bogor, Jawa Barat, pada ketinggian 700-1.100 mdpl dengan tanah vulkanik subur. Terkenal dengan kopi robusta, madu hutan, dan anyaman bambu." },
  { key: "Tugu", name: "Desa Tugu Utara", kec: "Cisarua", kab: "Kabupaten Bogor", lat: -6.7023, lon: 106.9512, desc: "Desa Tugu Utara terletak di lereng Gunung Gede Pangrango, Cisarua, Bogor, pada ketinggian 900-1.500 mdpl. Sentra hortikultura, kopi, dan lebah madu di kawasan Puncak Bogor." },
  { key: "Panglipuran", name: "Desa Penglipuran", kec: "Bangli", kab: "Kabupaten Bangli", lat: -8.4522, lon: 115.3524, desc: "Desa adat Penglipuran di Bangli, Bali, terkenal dengan kelestarian budaya dan arsitektur tradisional. Dikelilingi hutan bambu, mendukung budidaya jeruk kintamani, kakao, kopi, dan lebah madu trigona." },
  { key: "Cibodas", name: "Desa Cibodas", kec: "Lembang", kab: "Kabupaten Bandung Barat", lat: -6.8123, lon: 107.6512, desc: "Desa Cibodas di Lembang, Bandung Barat, pada ketinggian 1.250-1.500 mdpl. Tanah vulkanik subur ideal untuk sayuran organik seperti brokoli dan stroberi, serta kopi arabika dan lebah madu kaliandra." },
  { key: "Ngalanggeran", name: "Desa Wisata Nglanggeran", kec: "Patuk", kab: "Kabupaten Gunungkidul", lat: -7.8522, lon: 110.5123, desc: "Desa Wisata Nglanggeran di Gunungkidul, Yogyakarta, terkenal dengan Gunung Api Purba dan budidaya kakao. Masyarakat mengolah kakao menjadi cokelat premium, snack, dan minuman khas desa." },
  { key: "Margamulya", name: "Desa Margamulya", kec: "Pangalengan", kab: "Kabupaten Bandung", lat: -7.1623, lon: 107.5812, desc: "Desa Margamulya di Pangalengan, Bandung, pada ketinggian 1.000-1.400 mdpl. Sentra kopi arabika, teh premium, dan madu hutan dengan cita rasa khas dataran tinggi Jawa Barat." },
  { key: "Tambi", name: "Desa Tambi", kec: "Kejajar", kab: "Kabupaten Wonosobo", lat: -7.2523, lon: 109.9212, desc: "Desa Tambi di Kejajar, Wonosobo, Jawa Tengah, pada ketinggian 1.200-1.800 mdpl. Sentra teh hijau dan teh hitam premium. Juga menghasilkan carica, purwaceng, dan herbal khas Dieng." },
  { key: "Ngadas", name: "Desa Ngadas", kec: "Poncokusumo", kab: "Kabupaten Malang", lat: -7.9822, lon: 112.9012, desc: "Desa Ngadas di lereng Gunung Bromo, Malang, Jawa Timur, pada ketinggian 2.000 mdpl. Sentra pertanian dataran tinggi menghasilkan kentang, wortel, kubis, dan sayuran organik berkualitas." }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas for Seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Connection established. Truncating old tables...");

    await Desa.deleteMany({});
    await Umkm.deleteMany({});
    await Produk.deleteMany({});
    await User.deleteMany({});

    console.log("Database cleared.");

    // Seed dummy users (Admin & Dosen)
    await User.create([
      {
        googleId: "dosen_oauth_google_12345",
        nama: "Dosen Penguji Google OAuth",
        email: "dosen.penguji@pasarnusa.com",
        fotoProfile: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
        role: "admin",
        tanggalLoginTerakhir: new Date()
      }
    ]);

    // Kita bisa jalankan script migration/seeder dengan membaca data langsung dari PostgreSQL Supabase
    // agar data 8 desa, 126 UMKM, dan 290 produk ter-extract secara 1-to-1 dengan sempurna ke MongoDB!
    // Ini adalah cara paling efisien dan akurat karena PostgreSQL Supabase sudah memiliki data yang subur dan rapi.
  } catch (err) {
    console.error("Seeder error:", err);
  }
}
