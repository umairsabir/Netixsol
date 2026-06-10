import httpStatus from 'http-status';
import { User } from '../models';
import ApiError from '../utils/ApiError';

export const createUser = async (userBody: any) => {
  if (await (User as any).isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

export const queryUsers = async (filter: any, options: any) => {
  const users = await (User as any).paginate(filter, options);
  return users;
};

export const getUserById = async (id: string) => {
  return User.findById(id);
};

export const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

export const updateUserById = async (userId: string, updateBody: any) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await (User as any).isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

export const deleteUserById = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};
