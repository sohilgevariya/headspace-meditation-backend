"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const helpers_1 = require("../helpers");
const validation_1 = require("../validation");
const router = express_1.default.Router();
router.post('/signup', validation_1.userValidation?.signUp, controllers_1.authenticationController?.signUp);
router.post('/login', validation_1.userValidation?.login, controllers_1.authenticationController?.login);
router.post('/google_login', controllers_1.authenticationController?.google_SL);
router.post('/facebook_login', controllers_1.authenticationController?.facebook_SL);
router.post('/apple_login', controllers_1.authenticationController?.Apple_SL);
router.post('/otp_verification', validation_1.userValidation.otp_verification, controllers_1.authenticationController.otp_verification);
router.post('/forgot_password', validation_1.userValidation.forgot_password, controllers_1.authenticationController.forgot_password);
router.post('/reset_password', validation_1.userValidation.reset_password, controllers_1.authenticationController.reset_password);
router.post('/resend_otp', controllers_1.authenticationController.resend_otp);
//  ------   Authentication   ------  
router.use(helpers_1.userJWT);
//  ------   Account Routes   ------ 
router.get('/get_profile', controllers_1.authenticationController?.get_profile);
router.post('/change_password', validation_1.userValidation?.change_password, controllers_1.authenticationController?.change_password);
router.put('/update_profile', controllers_1.authenticationController?.update_profile);
router.post('/generate_token', validation_1.userValidation?.generate_token, controllers_1.authenticationController?.generate_token);
router.post('/logout', controllers_1.authenticationController?.user_logout);
//  ------  Course Routes  ------
router.get('/course', controllers_1.userController.get_all_course);
router.get('/course/:id', validation_1.courseValidation.by_id, controllers_1.userController.course_by_id_detail);
router.post('/course/filter_course', controllers_1.userController.get_all_course_pagination);
router.post('/course/category_wise', controllers_1.userController.get_category_wise_course);
//  ------  Episode Routes  ------
router.get('/episode/course/:id', validation_1.courseValidation.by_id, controllers_1.userController.get_episode_by_course);
//  ------  Dashboard Routes  ------
router.get('/dashboard', controllers_1.userController.dashboard);
//  ------  Favorite Course Routes  ------
router.get('/favorite', controllers_1.userController.get_favorite);
router.post('/favorite/add', validation_1.favoriteValidation.add, controllers_1.userController.add_favorite);
router.post('/favorite/course', controllers_1.userController.get_filter_favorite);
router.get('/category', controllers_1.adminController?.get_category);
router.get('/category/:id', validation_1.categoryValidation?.by_id, controllers_1.adminController?.category_by_id);
//  ------- Feature and Explore Data Routes --------
router.get('/category/featured/:id', validation_1.categoryValidation?.by_id, controllers_1.userController?.get_featured_category_course);
router.get('/category/explore/:id', validation_1.categoryValidation?.by_id, controllers_1.userController?.get_explore_category_course);
//  ------  Premium User Routes  ------
router.put('/premium/add', controllers_1.adminController.user_premium);
// ------  Notification Routes  -------
router.get('/notification', controllers_1.userController?.get_notification);
exports.userRouter = router;
//# sourceMappingURL=user.js.map