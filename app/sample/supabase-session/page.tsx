import { createClient } from "@/lib/supabase.server";

export default async function page() {

    const supabase = createClient();

    const { data, error } = await supabase.auth.getUser();
    console.log(data);
    console.log(error);

    return (<></>);
};