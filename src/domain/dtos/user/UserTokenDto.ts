type UserTokenDto = {
  id: string;
  role: string;
  mobile: string;
};
export default UserTokenDto;
export type UserRequestInterface = Request & {
  user: UserTokenDto;
}
