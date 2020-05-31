import {Router} from 'express';
import {deleteUser, findAll, findOne, updateUser, findOneByEmail} from '../controller/UserController';

const router = Router();

router.route('/')
    .get(findAll);

router.route('/:id')
    .get(findOne)
    .put(updateUser)
    .delete(deleteUser);

router.route('/email')
    .get(findOneByEmail);

export default router;