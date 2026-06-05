import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  userName:  String,
  action:    String,
  timestamp: { type: Date, default: Date.now, index: true },
})

activitySchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.__v
  obj.id = obj._id.toString()
  return obj
}

export default mongoose.model('Activity', activitySchema)
