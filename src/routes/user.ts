import express from 'express'
import { authenticationController, userController, adminController } from '../controllers'
import { userJWT, partial_userJWT } from '../helpers'
import { userValidation, courseValidation, favoriteValidation } from '../validation'
const router = express.Router()

router.post('/signup', userValidation?.signUp, authenticationController?.signUp)
router.post('/login', userValidation?.login, authenticationController?.login)
router.post('/google_login', authenticationController?.google_SL)
router.post('/facebook_login', authenticationController?.facebook_SL)
router.post('/apple_login', authenticationController?.Apple_SL)

//  ------   Authentication   ------  
router.use(userJWT)

//  ------   Account Routes   ------ 
router.get('/get_profile', authenticationController?.get_profile)
router.post('/change_password', userValidation?.change_password, authenticationController?.change_password)
router.put('/update_profile', authenticationController?.update_profile)
router.post('/generate_token', userValidation?.generate_token, authenticationController?.generate_token)
router.post('/logout', authenticationController?.user_logout)

//  ------  Course Routes  ------
router.get('/course', userController.get_all_course);
router.get('/course/:id', courseValidation.by_id, userController.course_by_id_detail);
router.post('/course/filter_course', userController.get_all_course_pagination);

//  ------  Episode Routes  ------
router.get('/episode/course/:id', courseValidation.by_id, userController.get_episode_by_course);

//  ------  Favorite Video Routes  ------
// router.get('/favorite', userController.get_favorite)
router.post('/favorite/add', favoriteValidation.add, userController.add_favorite)
// router.post('/favorite/video', userController.get_filter_favorite)
// router.delete('/favorite/delete/:id', favoriteValidation.by_id, userController.delete_favorite)

//  ------  Premium User Routes  ------
router.put('/premium/add', adminController.user_premium)

export const userRouter = router