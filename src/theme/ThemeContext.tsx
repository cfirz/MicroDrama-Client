import React, { createContext, useContext, useMemo, useState } from 'react';
import { colors, spacing } from './theme';

type Mode = 'light' | 'dark';

interface ThemeValue {
	mode: Mode;
	colors: typeof colors.light;
	spacing: typeof spacing;
	toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [mode, setMode] = useState<Mode>('light');
	const value = useMemo<ThemeValue>(
		() => ({ mode, colors: colors[mode], spacing, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
		[mode]
	);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
}


