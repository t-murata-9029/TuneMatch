import { Box, Button, Link, Stack } from "@mui/material";

export default function MatchBar() {
    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
                <Button 
                    variant="outlined" 
                    size="large" 
                    sx={{ flex: 1 }}
                    component={Link}
                    href="/matches/recommends/liked"
                >
                    届いたいいね
                </Button>
                <Button 
                    variant="outlined" 
                    size="large" 
                    sx={{ flex: 1 }}
                    component={Link}
                    href="/matches/recommends"
                >
                    おすすめリスト
                </Button>
                <Button 
                    variant="outlined" 
                    size="large" 
                    sx={{ flex: 1 }} 
                    component={Link}
                    href="/matches/recommends/history"
                >
                    履歴
                </Button>
            </Stack>
        </Box>
    );
}