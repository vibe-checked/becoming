import { Text, VStack, ZStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type StreakWidgetProps = {
  streak: number;
  affirmation: string;
  themeEmoji: string;
  themeLabel: string;
  bgColor: string;
  accentColor: string;
};

const StreakWidget = (props: StreakWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const isSmall = environment.widgetFamily === 'systemSmall';

  return (
    <ZStack
      modifiers={[
        containerBackground(props.bgColor, 'widget'),
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
      ]}>
      <VStack
        alignment="leading"
        spacing={isSmall ? 6 : 8}
        modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' }), padding({ all: 16 })]}>
        <Text modifiers={[font({ size: isSmall ? 22 : 26 })]}>
          {props.themeEmoji} {props.streak}
        </Text>
        <Text modifiers={[font({ weight: 'semibold', size: 12 }), foregroundStyle(props.accentColor)]}>
          {props.streak === 1 ? 'day streak' : 'days streak'}
        </Text>
        <Text
          modifiers={[
            font({ weight: 'regular', size: isSmall ? 13 : 15 }),
            foregroundStyle('#f0f0f5'),
          ]}>
          {props.affirmation}
        </Text>
      </VStack>
    </ZStack>
  );
};

export default createWidget('StreakWidget', StreakWidget);
