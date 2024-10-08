import { Profile } from '../models/profile.js'
import { v2 as cloudinary } from 'cloudinary'
import { Restaurant } from '../models/restaurant.js'
import {Dish} from '../models/dish.js'

async function create(req, res) {
  try { 
    const profile = await Profile.findById(req.user.profile)
    if (profile.isRestaurant){
      req.body.owner = req.user.profile
      const restaurant = await Restaurant.create(req.body)
      profile.restaurant = restaurant
      await profile.save()
      restaurant.owner = profile._id
      res.status(201).json(restaurant)
    }else {
      res.status(401).json({ err: "This Profile is not a restaurant profile" })
    }
  } catch(err) {
    console.log(err)
    res.json(err)
  }
}

async function index(req, res) {
  try {
    const restaurants = await Restaurant.find({}).populate(['dishes', 'owner']).sort({createdAt:'desc'})
    res.status(200).json(restaurants)
  } catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function show(req, res) {
  try {
    const dishes = await Dish.find({})
    const restaurantDishes= dishes.filter(dish=> dish.restaurant?.equals(req.params.restaurantId))
    req.body = {dishes: restaurantDishes}
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.restaurantId,req.body,{new: true}).populate(['dishes', 'owner'])
    res.status(200).json(restaurant)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function update(req, res) {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId)
    if(restaurant.owner._id.equals(req.user.profile)){
      await restaurant.updateOne(req.body, {new: true}).populate()
      const updatedRestaurant = await Restaurant.findById(req.params.restaurantId)
      res.status(200).json(updatedRestaurant)
    }else{
      res.status(401).json({ err: "You are not the owner of this restaurant" })
    }
  } catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function deleteRestaurant(req, res){
  try{
    const restaurant = await Restaurant.findById(req.params.restaurantId)
    if (restaurant.owner._id.equals(req.user.profile)){
      await Restaurant.findByIdAndDelete(req.params.restaurantId)
      const profile = await Profile.findById(req.user.profile)
      profile.restaurant = null
      await profile.save()
      res.status(200).json(restaurant)
    }else{
      res.status(401).json({ err: "You are not the owner of this restaurant" })
    }
  } catch(err){
    console.log(err)
    res.status(500).json(err)
  }
}

async function addPhoto(req, res) {
  try {
    const imageFile = req.files.photo.path
    const restaurant = await Restaurant.findById(req.params.restaurantId)
    const image = await cloudinary.uploader.upload(
      imageFile, 
      { tags: `${req.params.restaurantId}` }
    )
    restaurant.photo = image.url
    await restaurant.save()
    res.status(201).json(restaurant.photo)
  } catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export {
  index,
  create,
  show,
  update,
  deleteRestaurant as delete,
  addPhoto
}