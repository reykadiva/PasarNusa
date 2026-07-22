const mongoose = require("mongoose");

const UmkmSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  pemilik: { type: String, required: true },
  alamat: { type: String, required: true },
  no_hp: { type: String, required: true },
  sejak: { type: String },
  foto: { type: String },
  desa: { type: mongoose.Schema.Types.ObjectId, ref: "Desa", required: true }
});

module.exports = mongoose.model("Umkm", UmkmSchema);
