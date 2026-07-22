const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fotoProfile: { type: String },
  tanggalLoginTerakhir: { type: Date, default: Date.now },
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

module.exports = mongoose.model("User", UserSchema);
