type UserTokenDto = {
  id: string;
};
export default UserTokenDto;
export interface UserRequestInterface extends Request {
  user: UserTokenDto;
}
