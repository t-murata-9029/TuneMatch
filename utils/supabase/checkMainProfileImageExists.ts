'use client'

import { supabase } from "@/lib/supabase.cliant";

/**
 * 指定したuserIdのメイン画像の有無を調べます。
 * ※クライアントがエラーはいて、動きません
 * @param userId 検索したいユーザーのID
 * @returns ある場合は画像のパス、ない場合はnullを返します。
 */
export default async function checkMainProfileImageExists(userId: string): Promise<string | null> {
    const { data, error: IsMainImageError } = await supabase.from("user_images")
        .select('image_url')
        .eq("user_id", userId)
        .eq("is_main_profile_image", true)
        .limit(1);

    if (IsMainImageError) {
        console.log(data)
        console.log(IsMainImageError)
        throw new Error('メイン画像かどうかの取得に失敗しました。');
    }

    console.log(data);

    if (!data || data.length === 0) {
        console.log(data); // dataがnullまたは空配列の場合
        return null;
    }

    return data[0].image_url
}