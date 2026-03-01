import { Stack, useRouter } from 'expo-router';
import { Pressable, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../src/theme';

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.brown },
        headerTintColor: colors.cream,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.cream },
        headerBackTitle: '',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          title: "Beer O'Clock",
          headerBackVisible: false,
          gestureEnabled: false,
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
              <View style={headerStyles.gearIcon}>
                <View style={headerStyles.gearCenter} />
                <View style={[headerStyles.gearTooth, { top: -2 }]} />
                <View style={[headerStyles.gearTooth, { bottom: -2 }]} />
                <View style={[headerStyles.gearTooth, { left: -2, top: 4, transform: [{ rotate: '90deg' }] }]} />
                <View style={[headerStyles.gearTooth, { right: -2, top: 4, transform: [{ rotate: '90deg' }] }]} />
              </View>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="timer" options={{ title: 'Time a Cold One' }} />
      <Stack.Screen name="recipes" options={{ title: 'Recipes' }} />
      <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen
        name="cook-timer"
        options={{
          title: 'Grill Time',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

const headerStyles = StyleSheet.create({
  gearIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: colors.cream,
    backgroundColor: 'transparent',
  },
  gearTooth: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: colors.cream,
  },
});
