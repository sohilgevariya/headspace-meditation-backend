import express from 'express'
import { authenticationController, adminController } from '../controllers'
import { userJWT } from '../helpers/jwt'
import { userValidation, courseValidation, episodeValidation, categoryValidation, exploreValidation } from '../validation'
const router = express.Router()

router.post('/signup', userValidation?.signUp, authenticationController?.signUp)
router.post('/login', userValidation?.login, authenticationController?.login)

//  ------   Authentication ------  
router.use(userJWT)

//  ------  Dashboard Routes  ------
router.get('/home_page', adminController.dashboard)

//  ------   Account Routes   ------ 
router.get('/get_profile', authenticationController?.get_profile)
router.post('/change_password', userValidation?.change_password, authenticationController?.change_password)
router.put('/update_profile', authenticationController?.update_profile)
router.post('/generate_token', userValidation?.generate_token, authenticationController?.generate_token)
router.post('/logout', authenticationController?.user_logout)

//  -------  Category Routes  --------
router.get('/category', adminController?.get_category)
router.post('/category/add', categoryValidation?.add_category, adminController?.add_category)
router.put('/category/update', categoryValidation?.update_category, adminController?.update_category)
router.get('/category/:id', categoryValidation?.by_id, adminController?.category_by_id)
router.delete('/category/:id', categoryValidation?.by_id, adminController?.delete_category)

//  ------  User Routes  ------
router.post('/user', adminController?.get_user_pagination)
router.get('/user/:id', userValidation?.by_id, adminController?.get_user_by_id)
router.put('/user/block', adminController?.user_block)

//  ------  Course Routes  ------
router.get('/course', adminController.get_course);
router.get('/course/category_wise/:id', courseValidation.by_id, adminController.get_category_wise_course);
router.post('/course/add', courseValidation.add_course, adminController.add_course);
router.put('/course/update', courseValidation.update_course, adminController.update_course);
router.get('/course/:id', courseValidation.by_id, adminController.course_by_id);
router.post('/course/filter_course', adminController.get_course_pagination);
router.post('/course/search', adminController.get_course_search);
router.post('/course/category', adminController.get_course_category_wise);
router.delete('/course/:id', courseValidation.by_id, adminController.delete_course);

//  ------  Episode Routes  ------
router.get('/episode', adminController.get_episode);
router.post('/episode/add', episodeValidation.add_episode, adminController.add_episode);
router.put('/episode/update', episodeValidation.update_episode, adminController.update_episode);
router.get('/episode/get', adminController.get_episode_not_selected);
router.get('/episode/:id', episodeValidation.by_id, adminController.episode_by_id);
router.get('/episode/course/:id', episodeValidation.by_id, adminController.get_episode_by_course);
router.post('/episode/filter_episode', adminController.get_episode_pagination);
router.put('/episode/morning/add', adminController.add_morning_episode);
router.put('/episode/afternoon/add', adminController.add_afternoon_episode);
router.put('/episode/night/add', adminController.add_night_episode);
router.delete('/episode/:id', episodeValidation.by_id, adminController.delete_episode);

// ------  Feature Routes  -------
router.put('/feature/course', adminController?.add_course_feature)

//  ------  Explore Routes  ------
router.get('/explore', adminController.get_explore);
router.post('/explore/add', exploreValidation.add_explore, adminController.add_explore);
router.put('/explore/update', exploreValidation.update_explore, adminController.update_explore);
router.get('/explore/:id', exploreValidation.by_id, adminController.explore_by_id);
router.get('/explore/category/:id', exploreValidation.by_id, adminController.get_explore_category_wise);
router.put('/explore/course/add', exploreValidation.add_explore_course, adminController.add_explore_course);
router.get('/explore/course/:id', exploreValidation.by_id, adminController.get_course_explore_wise);
router.delete('/explore/:id', exploreValidation.by_id, adminController.delete_explore);

export const adminRouter = router