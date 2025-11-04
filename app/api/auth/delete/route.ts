// app/api/delete-user/route.ts

import { createAdminClient } from '@/lib/supabase.admin'
import { error } from 'console';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    
    const { userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    try {
        const { data, error} = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error('Supabase ユーザー削除エラー:', error);
            // 削除失敗のレスポンス
            return NextResponse.json({ error: 'アカウント削除に失敗しました' }, { status: 500 });
        }

        // 4. 削除成功のレスポンス
        return NextResponse.json({ message: 'アカウントが正常に削除されました' }, { status: 200 });

    } catch (e) {
        console.error('サーバーエラー:', e);
        return NextResponse.json({ error: '予期せぬエラーが発生しました' }, { status: 500 });
    }
}