"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const jwt_1 = require("../helpers/jwt");
const S3_1 = require("../helpers/S3");
const common_1 = require("../common");
const router = (0, express_1.Router)();
const file_type = async (req, res, next) => {
    if (!common_1.file_path.includes(req.params.file))
        return res.status(400).json(new common_1.apiResponse(400, 'invalid file type', { action: common_1.file_path }));
    next();
};
//  ------   Authentication ------  
router.use(jwt_1.userJWT);
router.post('/compress/:file', file_type, S3_1.compress_image.single('image'), S3_1.image_compress_response);
router.post('/:file', file_type, S3_1.uploadS3.single('image'), S3_1.image_compress_response);
// Delete
router.delete('/delete_file/:folder-:file', S3_1.delete_file);
exports.uploadRouter = router;
//# sourceMappingURL=upload.js.map