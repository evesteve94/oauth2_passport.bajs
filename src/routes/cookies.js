import express from 'express'

const router = express.Router();

//route till min cookie
router.get('/set-cookie', (req, res) => {
    res.cookie('user', 'John Doe', { maxAge: 900000, httpOnly: true });
    res.send('Cookie has been set');
  });
  
// Route till att se cookie
router.get('/check-cookie', (req, res) => {
    const userCookie = req.cookies.user;
    if (userCookie) {
      res.send(`Welcome back, ${userCookie}`);
    } else {
      res.status(401).send('No cookie found');
    }
});
  
export default router;