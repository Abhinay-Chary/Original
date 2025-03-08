
const mongoose=require('mongoose');
 cartSchema=  mongoose.Schema({
      userName:String,
    cart:Object
    
 })
 module.exports=  mongoose.model('Cart',cartSchema)