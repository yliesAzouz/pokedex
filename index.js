import express from "express";
import mongoose from "mongoose"; // facilite l'utilisation de mongodb
import twig from "twig";
import { Helper } from "./helper.js";
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
            user: user,
            badgeMessage: req.session.messsageBadge
        })
    }
})

//PAGE DINSCRIPTION
app.get('/register', async (req, res) => {
    res.render('./template/register.html.twig', {
        error: req.session.error
    })
})
app.post('/register', async (req, res) => {
    let userMail = await User.findOne({mail: req.body.mail})
    if(userMail){
        req.session.error = "WARNING: Cet Email existe déjà"
        res.redirect('/register')
    }else{
        let userNickname = await User.findOne({nickname: req.body.nickname})
        if(userNickname){
            req.session.error = "WARNING: Ce pseudo existe déjà"
            res.redirect('/register')
        }else{
            req.session.error = ""
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
    let pokemonRandom = Helper.imagePokemon()
    if (!req.session.userId) {
       res.redirect('/')
    }else{ 
        res.render('./template/pokemon/addPokemon.html.twig', {
            pokemonName: pokemonRandom.name,
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
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Roche !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'roche' } }) 
    }else if (nbPokemon === 18 * 2) {
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Cascade !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'cascade' } }) 
    }else if (nbPokemon === 18 * 3) {
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Foudre !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'foudre' } }) 
    }else if (nbPokemon === 18 * 4) {
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Prisme !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'prisme' } }) 
    }else if (nbPokemon === 18 * 5) {
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Ame !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'ame' } }) 
    }else if (nbPokemon === 18 * 6) {
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Marais !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'marais' } }) 
    }else if (nbPokemon === 18 * 7) {
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Volcan !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'volcan' } }) 
    }else if (nbPokemon === 18 * 8) {
        req.session.messsageBadge = "Bravo tu as obtenu ton badge Terre !!!"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'terre' } }) 
    }else if (nbPokemon === 151) {
        req.session.messsageBadge = "WOAHHH !!! Tu es sans conteste, un grand maitre pokémon"
        await User.updateOne({ _id: req.session.userId }, { $push: { badge: 'Meilleur dresseur' } }) 
    }else{
        req.session.messsageBadge = ""
    }
    res.redirect('/')
})

//MODIF POKEMON
app.get('/updatePokemon/:id', async (req, res) => {
    let user = await User.findOne({ _id: req.session.userId })
    const index = user.pokemons.findIndex(pokemons => pokemons._id == req.params.id)
    res.render('./template/pokemon/addPokemon.html.twig', {
        pokemon: req.params.id,
        action: "/updatePokemon",
        pokemonParams:  user.pokemons[index]
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

//SUPPRIMER POKEMON
app.get('/deletePokemon/:id', async (req, res) => {
    let index;
    const user = await User.findOne({ _id: req.session.userId }) //pour sauvegarder ensuite sur l'utilisateur
    let pokemonId = req.params.id //recup param du pokemon
    console.log(pokemonId);
    if(user.pokemons.length % 18 === 0 ){
        user.badge.splice(user.badge.length - 1, 1)
    }
    for (let i = 0; i < user.pokemons.length; i++) {
        if (user.pokemons[i]._id == pokemonId) {
             index = i;
        }
    }
    user.pokemons.splice(index, 1) //supprimé l'élèment ciblé
    await user.save()
    res.redirect('/')
})

//DECONNEXION
app.get('/deconnexion', async (req, res) => {
    req.session.destroy();
    res.redirect('/connexion')
})
