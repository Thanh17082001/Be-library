import {Request} from 'express';
import {jwtConstants} from 'src/auth/constants';
import {User} from 'src/user/entities/user.entity';

export const getUserIntoken = function getUserIntoken(request: Request): User {
  return request['user'];
};
