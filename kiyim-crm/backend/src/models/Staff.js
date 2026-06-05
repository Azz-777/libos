import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const staffSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone:      { type: String, default: '' },
  role:       { type: String, enum: ['owner', 'manager', 'cashier'], required: true, index: true },
  password:   { type: String, required: true, select: false },
  branch:     { type: String, default: 'Markaziy do\'kon' },
  position:   { type: String, default: '' },
  salary:     { type: Number, default: 0 },
  color:      { type: String, default: '#6366f1' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true })

staffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

staffSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

staffSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  obj.id = obj._id.toString()
  return obj
}

export default mongoose.model('Staff', staffSchema)
