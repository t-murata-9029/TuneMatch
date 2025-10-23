import { SignupFormState } from "@/types/forms/auth";

/** サインアップを実行
 * 引数をもとに、/api/auth/signupを呼び出して実行
 * @param formData 
 */
export async function executeSignup(formData: SignupFormState) {

    const { email, password, username, profile_text, gender } = formData;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username, profile_text, gender }),
        })

        if(!response.ok){
            throw response;
        }
    } catch (e) {
        throw e;
    }
}