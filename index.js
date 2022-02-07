import express from "express";
import mongoose from "mongoose"; // facilite l'utilisation de mongodb
import twig from "twig";
import bodyParser from "body-parser";
import User from './models/User.js';
import session from "express-session";
import Pokemon from './models/pokemon.js';

const app = express();

const db = "mongodb+srv://ylies:Marseille.13@cluster0.0vy6l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

// deuxiéme paramétre aprés la virgule est erreur par defaut
mongoose.connect(db, err => { //connexion a la base de donné paramétre
    if (err) {
        console.error('error' + err)
    } else {
        console.log('connected at mongoDb')
    }
})

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}))
app.use(bodyParser.urlencoded({ extended: true })); //parse les élement
app.use(express.static('./assets'));

app.listen(4200, () => {
    console.log("le serveur démarre")
})

//LIST POKEMON
app.get('/', async (req, res) => {
    const user = await User.findOne({ _id: req.session.userId })
    if (!req.session.userId) {
        res.redirect('/connexion')
    } else {
        res.render('./template/pokemon/listPokemon.html.twig', {
            user: user
        })
    }
})

//PAGE DINSCRIPTION
app.get('/register', async (req, res) => {
    res.render('./template/register.html.twig', {

    })
})
app.post('/register', async (req, res) => {
    let userMail = await User.findOne({mail: req.body.mail})
    if(userMail){
        res.redirect('/register')
    }else{
        let userNickname = await User.findOne({nickname: req.body.nickname})
        if(userNickname){
            res.redirect('/register')
        }else{
            const user = new User(req.body)
            console.log(user);
            user.pokemons = []
            console.log(user.pokemons)
            user.save()
            res.redirect('/connexion')
        }
    }
})

//PAGE DE CONNEXION
app.get('/connexion', async (req, res) => {
    res.render('./template/connexion.html.twig', {

    })
})

app.post('/connexion', async (req, res) => {
    const user = await User.findOne({ nickname: req.body.nickname, password: req.body.password })
    if (user) {
        req.session.userId = user._id
        res.redirect('/')
    } else {
        console.log('votre mail et/ou votre mot de passe est incorrect')
        res.redirect('/connexion')
    }
})

//LIST USERS
app.get('/user', async (req, res) => {
    const users = await User.find()
     users.sort(function(a, b){ // trie par ordre decroissant
        return b.pokemons.length - a.pokemons.length;
    })
    res.render('./template/user/listUser.html.twig', {
        users: users,
    })
})

//AJOUT POKEMON
app.get('/addPokemon', async (req, res) => {
    if (!req.session.userId) {
       res.redirect('/')
    }else{ 
        res.render('./template/pokemon/addPokemon.html.twig', {
        })
    }
})
app.post('/addPokemon', async (req, res) => {
    let pokemon = await new Pokemon(req.body)
    await User.updateOne({ _id: req.session.userId }, { $push: { pokemons: pokemon } })
    let user = await User.findOne({ _id: req.session.userId })
    let nbPokemon = user.pokemons.length
    console.log(nbPokemon);
    if (nbPokemon === 18 * 1) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'roche' } }) 
    }
    if (nbPokemon === 18 * 2) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'cascade' } }) 
    }
    if (nbPokemon === 18 * 3) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'foudre' } }) 
    }
    if (nbPokemon === 18 * 4) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'prisme' } }) 
    }
    if (nbPokemon === 18 * 5) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'ame' } }) 
    }
    if (nbPokemon === 18 * 6) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'marais' } }) 
    }
    if (nbPokemon === 18 * 7) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'volcan' } }) 
    }
    if (nbPokemon === 18 * 8) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'terre' } }) 
    }
    if (nbPokemon === 151) {
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'Meilleur dresseur' } }) 
    }
    res.redirect('/')
})

//MODIF POKEMON
app.get('/updatePokemon/:id', async (req, res) => {
    res.render('./template/pokemon/addPokemon.html.twig', {
        pokemon: req.params.id,
        action: "/updatePokemon"
    })
})
app.post('/updatePokemon/:id', async (req, res) => {
  let user = await User.findOne({ _id: req.session.userId }) //recupere l'utilisateur 
  for (let i = 0; i<user.pokemons.length; i++){
      if(user.pokemons[i]._id == req.params.id){
        user.pokemons[i].name = req.body.name;
        user.pokemons[i].type = req.body.type;
        user.pokemons[i].power = req.body.power;
      }
  }
  await User.updateOne({_id: req.session.userId}, {pokemons: user.pokemons})
  res.redirect('/')


})
app.get('/deletePokemon/:id', async (req, res) => {
    
    const user = await User.findOne({ _id: req.session.userId }) //pour sauvegarder enssuite sur l'utilisateur
    let pokemonId = req.params.id //recup param du pokemon
    if(user.pokemons.length % 18 === 0 ){
        user.badge.splice(user.badge.length - 1, 1)
    }
   
    user.pokemons.splice(pokemonId, 1) //supprimé l'élèment ciblé
   
    await user.save()

    res.redirect('/')
})

//DECONNEXION
app.get('/deconnexion', async (req, res) => {
    req.session.destroy();
    res.redirect('/connexion')
})