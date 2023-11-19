const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  generatedCodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Code"
  }],
});

// Hash the password before saving it to the database
// userSchema.pre('save', async function (next) {
//   try {
//     // Only hash the password if it has been modified (or is new)
//     if (!this.isModified('password')) {
//       return next();
//     }

//     // Generate a salt
//     const salt = await bcrypt.genSalt(10);

//     // Hash the password along with the new salt
//     const hashedPassword = await bcrypt.hash(this.password, salt);

//     // Replace the plaintext password with the hashed one
//     this.password = hashedPassword;

//     next();
//   } catch (error) {
//     return next(error);
//   }
// });

const User = mongoose.model('User', userSchema);

module.exports = User;
