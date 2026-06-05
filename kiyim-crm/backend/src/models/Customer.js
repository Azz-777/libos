import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  fullName:      { type: String, required: true, trim: true, index: true },
  phone:         { type: String, default: '', index: true },
  email:         { type: String, default: '' },
  gender:        { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  birthday:      { type: Date, default: null },
  city:          { type: String, default: 'Toshkent' },
  tier:          { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  loyaltyPoints: { type: Number, default: 0 },
  totalSpent:    { type: Number, default: 0 },
  visitCount:    { type: Number, default: 0 },
  status:        { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes:         { type: String, default: '' },
  lastVisit:     { type: Date, default: null },
}, { timestamps: true })

customerSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  obj.id = obj._id.toString()
  return obj
}

// Re-evaluate loyalty tier from total spent (so'm)
customerSchema.methods.recomputeTier = function () {
  const s = this.totalSpent
  this.tier = s >= 15_000_000 ? 'platinum'
            : s >= 6_000_000  ? 'gold'
            : s >= 2_000_000  ? 'silver'
            : 'bronze'
}

export default mongoose.model('Customer', customerSchema)
