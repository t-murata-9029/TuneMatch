import { LoginFormState } from "@/types/forms/auth";

export async function executeLogin(formData: LoginFormState): Promise<void> {

    const { email, password } = formData;

    // 非同期処理をそのまま実行
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        if(!response.ok){
            throw response;
        }
    } catch (e) {
        throw e;
    }
    return;
};