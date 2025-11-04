import { Box, Link, Typography } from "@mui/material";


export default function page() {
    return (
        <>
            <Typography variant="h5">ダッシュボード</Typography>
            <Box>
                <Link href={"/auth/spotify/login"}>Spotifyログイン</Link>
            </Box>
        </>
    );
}