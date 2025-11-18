import { createTheme } from "@mui/material";

const main_theme = createTheme({
    palette: {
        primary: {
            main: '#ff00f7ff',
            contrastText: '#ffffffff',
        },
        background: {
            default: '#bdbdbd',
        },
        text: { primary: '#ff9900ff' },
    },
});

export default main_theme;