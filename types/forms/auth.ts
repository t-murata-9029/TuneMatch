import { Gender } from "../db";

/**
 * アカウント作成フォームの入力値に対応するインターフェース
 */
export interface SignupFormState {
  email: string;
  password: string;
  username: string;
  profile_text: string;
  gender: Gender;
}

/**
 *  アカウントログインフォームの入力値に対応するインターフェース
 */
export interface LoginFormState {
  email: string;
  password: string;
}
