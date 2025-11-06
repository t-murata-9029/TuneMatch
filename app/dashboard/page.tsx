import { getCurrentUser } from "@/lib/action";
import { Box, Link, Stack, Typography } from "@mui/material";

/** ダッシュボード
 * いつか見た目を整えたい、、、、
 * 適当にリンクおいてます
 * @returns 
 */
export default async function page() {

    const userData = await getCurrentUser();

    if (!userData) {
        return
    }

    return (
        <>
            <Typography variant="h5">ダッシュボード</Typography>
            <Box>
                <Stack>
                    <Link href={"/auth/spotify/login"}>Spotifyログイン</Link>
                    <Link href={"/user/" + userData.id}>マイページ</Link>
                </Stack>
            </Box>
        </>
    );
}