import { Link, Stack } from "@mui/material";

export default function page() {
    return (
        <>
            <Stack>
                <Link href="/setting/image">画像を変更</Link>
                <Link href="/auth/delete">アカウントを削除</Link>
            </Stack>
        </>
    );
}