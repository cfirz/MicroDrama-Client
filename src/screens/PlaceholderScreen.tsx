import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props { title: string }

const PlaceholderScreen: React.FC<Props> = ({ title }) => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
            <Text style={{ color: colors.muted }}>{title} coming soon…</Text>
        </View>
    );
};

export default PlaceholderScreen;


