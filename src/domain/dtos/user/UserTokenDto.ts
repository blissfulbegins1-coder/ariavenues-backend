type UserTokenDto = {
  id: string;
  role: "customer" | "owner" | "admin";
  mobile: string;
};
export default UserTokenDto;
export interface UserRequestInterface extends Request {
  user: UserTokenDto;
}
