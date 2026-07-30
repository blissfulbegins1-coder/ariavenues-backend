import {
  UserDTO,
  UserAuthResponse,
} from "../../domain/dtos/user/UserDto";
import { User } from "../../domain/entities/User";

export type IUserUseCase = {
  signUp(input: UserDTO): Promise<UserAuthResponse>;
  signIn(mobile: string): Promise<UserAuthResponse>;
  getUserByMobile(mobile: string): Promise<User | null>;
};
