import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { Flag as FlagIcon } from '@mui/icons-material';

function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);  // save the selected language to localStorage
        handleClose();
    };

    return (
        <div>
            <IconButton onClick={handleClick} color="inherit">
                <FlagIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => changeLanguage('en')}>
                    English
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('pl')}>
                    Polski
                </MenuItem>
            </Menu>
        </div>
    );
}

export default LanguageSwitcher;
