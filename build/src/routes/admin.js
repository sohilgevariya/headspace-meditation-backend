"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const jwt_1 = require("../helpers/jwt");
const validation_1 = require("../validation");
const router = express_1.default.Router();
router.post('/signup', validation_1.userValidation?.signUp, controllers_1.authenticationController?.signUp);
router.post('/login', validation_1.userValidation?.login, controllers_1.authenticationController?.login);
//  ------   Authentication ------  
router.use(jwt_1.userJWT);
//  ------  Dashboard Routes  ------
router.get('/home_page', controllers_1.adminController.dashboard);
//  ------   Account Routes   ------ 
router.get('/get_profile', controllers_1.authenticationController?.get_profile);
router.post('/change_password', validation_1.userValidation?.change_password, controllers_1.authenticationController?.change_password);
router.put('/update_profile', controllers_1.authenticationController?.update_profile);
router.post('/generate_token', validation_1.userValidation?.generate_token, controllers_1.authenticationController?.generate_token);
router.post('/logout', controllers_1.authenticationController?.user_logout);
//  -------  Category Routes  --------
router.get('/category', controllers_1.adminController?.get_category);
router.post('/category/add', validation_1.categoryValidation?.add_category, controllers_1.adminController?.add_category);
router.put('/category/update', validation_1.categoryValidation?.update_category, controllers_1.adminController?.update_category);
router.get('/category/:id', validation_1.categoryValidation?.by_id, controllers_1.adminController?.category_by_id);
router.delete('/category/:id', validation_1.categoryValidation?.by_id, controllers_1.adminController?.delete_category);
//  ------  User Routes  ------
router.post('/user', controllers_1.adminController?.get_user_pagination);
router.get('/user/:id', validation_1.userValidation?.by_id, controllers_1.adminController?.get_user_by_id);
router.put('/user/block', controllers_1.adminController?.user_block);
//  ------  Course Routes  ------
router.get('/course', controllers_1.adminController.get_course);
router.get('/course/category_wise/:id', validation_1.courseValidation.by_id, controllers_1.adminController.get_category_wise_course);
router.post('/course/add', validation_1.courseValidation.add_course, controllers_1.adminController.add_course);
router.put('/course/update', validation_1.courseValidation.update_course, controllers_1.adminController.update_course);
router.get('/course/:id', validation_1.courseValidation.by_id, controllers_1.adminController.course_by_id);
router.post('/course/filter_course', controllers_1.adminController.get_course_pagination);
router.post('/course/search', controllers_1.adminController.get_course_search);
router.post('/course/category', controllers_1.adminController.get_course_category_wise);
router.delete('/course/:id', validation_1.courseValidation.by_id, controllers_1.adminController.delete_course);
//  ------  Episode Routes  ------
router.get('/episode', controllers_1.adminController.get_episode);
router.post('/episode/add', validation_1.episodeValidation.add_episode, controllers_1.adminController.add_episode);
router.put('/episode/update', validation_1.episodeValidation.update_episode, controllers_1.adminController.update_episode);
router.get('/episode/get_morning', controllers_1.adminController.get_morning_episode);
router.get('/episode/get_afternoon', controllers_1.adminController.get_afternoon_episode);
router.get('/episode/get_night', controllers_1.adminController.get_night_episode);
router.get('/episode/:id', validation_1.episodeValidation.by_id, controllers_1.adminController.episode_by_id);
router.get('/episode/course/:id', validation_1.episodeValidation.by_id, controllers_1.adminController.get_episode_by_course);
router.post('/episode/filter_episode', controllers_1.adminController.get_episode_pagination);
router.put('/episode/morning/add', controllers_1.adminController.add_morning_episode);
router.put('/episode/afternoon/add', controllers_1.adminController.add_afternoon_episode);
router.put('/episode/night/add', controllers_1.adminController.add_night_episode);
router.delete('/episode/:id', validation_1.episodeValidation.by_id, controllers_1.adminController.delete_episode);
// ------  Feature Routes  -------
router.put('/feature/course', controllers_1.adminController?.add_course_feature);
//  ------  Explore Routes  ------
router.get('/explore', controllers_1.adminController.get_explore);
router.post('/explore/add', validation_1.exploreValidation.add_explore, controllers_1.adminController.add_explore);
router.put('/explore/update', validation_1.exploreValidation.update_explore, controllers_1.adminController.update_explore);
router.get('/explore/:id', validation_1.exploreValidation.by_id, controllers_1.adminController.explore_by_id);
router.get('/explore/category/:id', validation_1.exploreValidation.by_id, controllers_1.adminController.get_explore_category_wise);
router.put('/explore/course/add', validation_1.exploreValidation.add_explore_course, controllers_1.adminController.add_explore_course);
router.get('/explore/course/:id', validation_1.exploreValidation.by_id, controllers_1.adminController.get_course_explore_wise);
router.delete('/explore/:id', validation_1.exploreValidation.by_id, controllers_1.adminController.delete_explore);
exports.adminRouter = router;
//# sourceMappingURL=admin.js.map