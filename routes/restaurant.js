import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as restaurantsCtrl from '../controllers/restaurants.js'

const router = Router()

/*---------- Public Routes ----------*/
//GET api/restaurants
router.get('/', restaurantsCtrl.index)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
// POST api/restaurants
router.post('/', checkAuth, restaurantsCtrl.create)



export { router }
