import { supabase } from "@/lib/cliant";
import { SignupFormState } from "@/types/forms/auth";

export async function executeSignup(formData: SignupFormState) {

    const { email, password, username, profile_text, gender } = formData;

    console.log(formData);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                profile_text,
                gender,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`, // 確認メールのリンク先
        },
    });

    console.log(error);
}