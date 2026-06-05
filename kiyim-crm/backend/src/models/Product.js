import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  sku:          { type: String, required: true, unique: true, index: true },
  name:         { type: String, required: true, trim: true, index: true },
  category:     { type: String, required: true, index: true },
  categoryName: { type: String, default: '' },
  brand:        { type: String, default: '' },
  season:       { type: String, enum: ['all', 'summer', 'winter', 'demi'], default: 'all' },
  gender:       { type: String, enum: ['male', 'female', 'unisex', 'kids'], default: 'unisex' },
  sizes:        { type: [String], default: [] },
  colors:       { type: [String], default: [] },
  price:        { type: Number, required: true },
  cost:         { type: Number, default: 0 },
  stock:        { type: Number, default: 0 },
  minStock:     { type: Number, default: 5 },
  imageUrl:     { type: String, default: '' },
  description:  { type: String, default: '' },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true })

productSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  obj.id = obj._id.toString()
  return obj
}

export default mongoose.model('Product', productSchema)
