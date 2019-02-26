import { signOut } from "../api/auth";
import { navigateTo } from "../routes";

export default () => {
    signOut();
    navigateTo("/");
};
