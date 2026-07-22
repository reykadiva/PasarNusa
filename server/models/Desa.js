const mongoose = require("mongoose");

const DesaSchema = new mongoose.Schema({
  nama_desa: { type: String, required: true },
  kecamatan: { type: String, required: true },
  kabupaten: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  deskripsi: { type: String, required: true }
});

module.exports = mongoose.model("Desa", DesaSchema);
