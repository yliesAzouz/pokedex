import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
        name: String,
        type: String,
        power: String
})

const Pokemon = mongoose.model('Pokemon', userSchema)

export default Pokemon;

