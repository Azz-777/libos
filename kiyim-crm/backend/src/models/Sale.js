import mongoose from 'mongoose'

const saleItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  sku:         String,
  size:        { type: String, default: '' },
  color:       { type: String, default: '' },
  price:       Number,
  quantity:    Number,
  total:       Number,
}, { _id: false })

const saleSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true, index: true },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerName:  { type: String, default: 'Tasodifiy mijoz' },
  cashierId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  cashierName:   String,
  items:         [saleItemSchema],
  subtotal:      { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['naqd', 'karta', 'click', 'payme'], default: 'naqd' },
  pointsEarned:  { type: Number, default: 0 },
  pointsRedeemed:{ type: Number, default: 0 },
  status:        { type: String, enum: ['completed', 'refunded'], default: 'completed', index: true },
  notes:         { type: String, default: '' },
}, { timestamps: true })

saleSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  obj.id = obj._id.toString()
  return obj
}

export default mongoose.model('Sale', saleSchema)
