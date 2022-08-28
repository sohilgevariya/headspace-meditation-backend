import express from 'express'
import { authenticationController, userController, adminController } from '../controllers'
import { userJWT, partial_userJWT } from '../helpers'
import { userValidation, courseValidation, favoriteValidation, categoryValidation } from '../validation'
const router = express.Router()

router.post('/signup', userValidation?.signUp, authenticationController?.signUp)
router.post('/login', userValidation?.login, authenticationController?.login)
router.post('/google_login', authenticationController?.google_SL)
router.post('/facebook_login', authenticationController?.facebook_SL)
router.post('/apple_login', authenticationController?.Apple_SL)
router.post('/otp_verification', userValidation.otp_verification, authenticationController.otp_verification)
router.post('/forgot_password', userValidation.forgot_password, authenticationController.forgot_password)
router.post('/reset_password', userValidation.reset_password, authenticationController.reset_password)
router.post('/resend_otp', authenticationController.resend_otp)

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
router.post('/course/category_wise', userController.get_category_wise_course);

//  ------  Episode Routes  ------
router.get('/episode/course/:id', courseValidation.by_id, userController.get_episode_by_course);

//  ------  Dashboard Routes  ------
router.get('/dashboard', userController.dashboard);

//  ------  Favorite Course Routes  ------
router.get('/favorite', userController.get_favorite)
router.post('/favorite/add', favoriteValidation.add, userController.add_favorite)
router.post('/favorite/course', userController.get_filter_favorite)

router.get('/category', adminController?.get_category)
router.get('/category/:id', categoryValidation?.by_id, adminController?.category_by_id)

//  ------- Feature and Explore Data Routes --------
router.get('/category/featured/:id', categoryValidation?.by_id, userController?.get_featured_category_course)
router.get('/category/explore/:id', categoryValidation?.by_id, userController?.get_explore_category_course)


//  ------  Premium User Routes  ------
router.put('/premium/add', adminController.user_premium)

export const userRouter = router