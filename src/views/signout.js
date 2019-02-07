import { signOut } from "../api/auth";
import { navigateTo } from "../routes";

signOut();
navigateTo("/");
