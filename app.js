// Modules
require('babel-register')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const twig = require('twig')
const axios = require('axios')

// Variables globales
const app = express()
const port = 8081
const fetch = axios.create({
    baseURL: 'http://localhost:8080/api/v1'
})

// Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log(__dirname)  // constante qui stock le chemin du fichier actuel

// Routes

// Page d'acceuil
app.get('/', (req, res) => {
    res.redirect('/members')
})

// Page récupérant tous les membres ou un nombre de max définit par max
app.get('/members',(req, res) => {
    console.log(req);        //azoepazoêiazpêo
    apiCall(req.query.max ? '/members?max='+req.query.max : '/members', 'get', {}, res, (members) => {
        res.render('members.twig', {
            members: members
        })
    })
})

// Page pour récupérer un membre
app.get('/members/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'get', {}, res, (member) => {
        res.render('member.twig', {
            member: member
        })
    })
})

// Page gérer la modification d'un utilisateur
app.get('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'get', {}, res, (result) => {
        res.render('edit.twig', {
            member: result
        })
    })
})

// Page gérer la modification d'un utilisateur
app.post('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'put', {
        name: req.body.name
    }, res, () => {
        res.redirect('/members')
    })
})

// Méthode pour gérer la modification d'un membre
app.post('/delete', (req, res) => {
    apiCall('/members/'+req.body.id, 'delete', {}, res, () => {
        res.redirect('/members')
    })
})

// Page pour ajouter un nouveau membre
app.get('/insert', (req, res) => {
    res.render('insert.twig')
})

// Méthode pour ajouter un nouveau membre
app.post('/insert', (req, res) => {
    apiCall('/members', 'post', {
        name: req.body.name
    }, res, (result) => {
        res.redirect('/members')
    })
})

// Lancement de l'application
app.listen(port, () => console.log('Started on port ' + port))

// Fonctions
function renderError(res, errMsg) {
    res.render('error.twig', {
        errorMsg: errMsg
    })
}

function apiCall(url, method, data, res, next) {
    fetch({
        method: method,
        url: url,
        data: data
    }).then((response) => {
        if (response.data.status == 'success') {
            next(response.data.result)
        } else {
            renderError(res, response.data.message)
        }
    })
    .catch((err) => renderError(res, err.message))
}
