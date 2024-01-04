import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import axios from 'axios';
import ApiContext from '../../ApiContext';

const ItemsComponent = () => {
    const [items, setItems] = useState([]);
    const context = React.useContext(ApiContext);
    const { apiUrl } = context;

    useEffect(() => {
        axios.get(apiUrl+"/trees/").then(response => {
            setItems(response.data);
        });
    }, []);

    return (
        <List>
            {items.map((item, index) => (
                <ListItem key={index}>
                    <ListItemText primary={item.name} />
                </ListItem>
            ))}
        </List>
    );
};

export default ItemsComponent;
