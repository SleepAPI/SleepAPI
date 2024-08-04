import { DBUser } from '@src/database/dao/user/user-dao';
import { deleteUser } from '@src/services/api-service/login/login-service';

export default class UserController {
  public async deleteUser(user: DBUser) {
    return deleteUser(user);
  }
}
