import { supabase } from "@/lib/supabase.cliant";
import { LoginFormState } from "@/types/forms/auth";

export async function executeLogin(formData: LoginFormState): Promise<void> {

    const { email, password } = formData;

    // 非同期処理をそのまま実行
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw error;
        }
    } catch (e) {
        throw e;
    }
};