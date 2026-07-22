const mongoose = require("mongoose");

const ProdukSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  harga: { type: Number, required: true },
  stok: { type: Number, required: true },
  gambar: { type: String },
  deskripsi: { type: String },
  satuan: { type: String },
  keunggulan: { type: String },
  cerita: { type: String },
  kategori: { type: String, required: true },
  umkm: { type: mongoose.Schema.Types.ObjectId, ref: "Umkm", required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Produk", ProdukSchema);
