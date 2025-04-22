import React from 'react';
import { useTheme } from '../context/ThemeContext';
import themeColors from '../utils/themeColors';
import { MenuItem, Select, Typography, Box, FormControl, InputLabel } from '@mui/material';

const ThemeDropdown = () => {
  const { themeColor, setThemeColor } = useTheme();

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="theme-color-label" sx={{ color: '#1d4ed8' }}>Card Background</InputLabel>
      <Select
        labelId="theme-color-label"
        value={themeColor}
        onChange={(e) => setThemeColor(e.target.value)}
        label="Card Background"
        sx={{ borderRadius: 2 }}
      >
        {themeColors.map((color) => (
          <MenuItem key={color.hex} value={color.hex}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: color.hex,
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: 1
              }}
            />
            {color.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ThemeDropdown;
