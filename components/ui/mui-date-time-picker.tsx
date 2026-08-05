"use client";

import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0E57A4",
    },
  },
  typography: {
    fontFamily: "inherit",
  },
});

interface MuiDateTimePickerProps {
  value: string;
  onChange: (isoString: string) => void;
  label?: string;
  required?: boolean;
}

export function MuiDateTimePicker({
  value,
  onChange,
  label = "Due Date & Time",
}: MuiDateTimePickerProps) {
  const dayjsValue = value ? dayjs(value) : null;

  const handleChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      // Format as ISO or datetime-local format
      onChange(newValue.format("YYYY-MM-DDTHH:mm"));
    } else {
      onChange("");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label={label}
          value={dayjsValue}
          onChange={handleChange}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              sx: {
                backgroundColor: "#F8FAFC",
                borderRadius: "12px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  borderColor: "#E2E8F0",
                  "&:hover fieldset": {
                    borderColor: "#0E57A4",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0E57A4",
                  },
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.75rem",
                  color: "#64748B",
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
