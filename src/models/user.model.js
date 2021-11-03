// Branislav Hozza
import mongoose from 'mongoose';
const {Schema} = mongoose;
const UserSchema = new Schema({
  username: String,
  password: String,
  admin: Boolean,
});

export default mongoose.model('user', UserSchema, 'users');
