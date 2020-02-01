import * as React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { StealthButton } from '../components/Button/StealthButton';

export interface ISimpleSelectorProps {
    title?: string;
    choices: string[];
    initialSelectedIndex?: number;
    onSelectionChanged: (newSelectedIndex: number) => void;
    selectorItemStyle?: StyleProp<ViewStyle>;
}

export const SimpleSelector: React.FunctionComponent<ISimpleSelectorProps> = (props: ISimpleSelectorProps) => {

    const { choices, initialSelectedIndex, title, onSelectionChanged, selectorItemStyle } = props;

    const [selectedIndex, setSelectedIndex] = React.useState(initialSelectedIndex);

    return (
        <View>
            {!!title && <Text>{title}</Text>}
            {
                choices.map((choice, index) => {
                    return (
                        <StealthButton
                            key={index} 
                            disabled={index == selectedIndex}
                            content={choice}
                            onPress={()=>{ setSelectedIndex(index); onSelectionChanged(index); }}
                            style={selectorItemStyle} />
                    );
                })
            }
        </View>
    )

}