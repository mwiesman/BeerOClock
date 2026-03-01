import { Stack, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { colors } from '../src/theme';

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.brown },
        headerTintColor: colors.amber,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.cream },
        headerBackTitle: '',
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
              <Text style={{ color: colors.amber, fontSize: 22 }}>⚙️</Text>
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
