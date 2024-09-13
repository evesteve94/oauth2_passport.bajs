import express from 'express'
import passport from 'passport';
import '../strategies/discord-strategy.js'

const router = express.Router();

router.post('/', passport.authenticate('local'), (req, res) => {
    res.sendStatus(200)
  })
  
  router.get('/status', (req, res) => {
    console.log('Inside auth/status-endpoint:')
    console.log(req.user)
    console.log(req.session) // passport: { user: 1 }
    return req.user ? res.send(req.user) : res.sendStatus(401)
  })
  
  
  //loggar ut och gör vår cookie invalid
  router.post('/logout', (req, res) => {
    if(!req.user) return res.sendStatus(401);
    req.logOut((err) => {
      if (err) return sendStatus(400)
        res.sendStatus(200)
    })
  })

  //endpoint för discord
router.get('/discord', passport.authenticate('discord'))

router.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
  res.sendStatus(200)
})

export default router