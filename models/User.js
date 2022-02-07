import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    firstname: String,
    mail: {type: String, required:true },
    password: {type: String, required:true },
    nickname: {type: String, required:true },
    age: Number,
    badge: Array,
    pokemons:Array,
})

const User = mongoose.model('User', userSchema)

export default User;



