import { Request, Router, Response } from 'express'
import { userRouter } from './user'
import { uploadRouter } from './upload'
import { adminRouter } from './admin'
import { userStatus } from '../common'

const router = Router()
const accessControl = (req: Request, res: Response, next: any) => {
    req.headers.userType = userStatus[req.originalUrl.split('/')[1]]
    next()
}

router.use(accessControl)
router.use('/user', userRouter)
router.use('/upload', uploadRouter)
router.use('/admin', adminRouter)

export { router }