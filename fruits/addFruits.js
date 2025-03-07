const mongoose= require('mongoose')
const fruitSchema= mongoose.Schema({
    name: String,
    source:String,
    price:Number,
    quantity:Number,
    type:String
})
module.exports= mongoose.model('Fruit',fruitSchema)