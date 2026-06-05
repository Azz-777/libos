import mongoose from 'mongoose'

const supplierSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, index: true },
  contactName: { type: String, default: '' },
  phone:       { type: String, default: '' },
  email:       { type: String, default: '' },
  city:        { type: String, default: 'Toshkent' },
  category:    { type: String, default: '' },
  balance:     { type: Number, default: 0 },
  status:      { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes:       { type: String, default: '' },
}, { timestamps: true })

supplierSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  obj.id = obj._id.toString()
  return obj
}

export default mongoose.model('Supplier', supplierSchema)
