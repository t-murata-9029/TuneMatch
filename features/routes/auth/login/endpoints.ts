import { supabase } from "@/lib/supabase.cliant";
import { LoginFormState } from "@/types/forms/auth";

export async function executeLogin(formData: LoginFormState) {
    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    console.log(data.session);
    console.log(error)

    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
};