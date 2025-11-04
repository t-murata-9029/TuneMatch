import { supabase } from '@/lib/supabase.server';


export default async function test(){
    
    const { data: posts, error } = await supabase
    .from('users') // テーブル名を指定
    .select('id')
    .limit(10);

    console.log(posts)

    return(
        <></>
    );
}