import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize } from '../src/theme';
import {
  getColdOneTime,
  formatTime,
  getRemindersEnabled,
  saveRemindersEnabled,
} from '../src/utils/storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [coldOneTime, setColdOneTime] = useState<number | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getColdOneTime().then(setColdOneTime);
      getRemindersEnabled().then(setRemindersEnabled);
    }, [])
  );

  const toggleReminders = async (value: boolean) => {
    setRemindersEnabled(value);
    await saveRemindersEnabled(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cold One</Text>

        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Your Cold One Time</Text>
            <Text style={styles.rowValue}>
              {coldOneTime ? formatTime(coldOneTime) : 'Not set'}
            </Text>
          </View>
          <Pressable
            style={styles.rowButton}
            onPress={() => router.push('/timer')}
          >
            <Text style={styles.rowButtonText}>
              {coldOneTime ? 'Recalibrate' : 'Set'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminders</Text>

        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Cold One Reminders</Text>
            <Text style={styles.rowHint}>
              Get notified when it's time to crack another Cold One while cooking
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={toggleReminders}
            trackColor={{ false: colors.grayLight, true: colors.amberLight }}
            thumbColor={remindersEnabled ? colors.amber : colors.gray}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Beer O'Clock v1.0.0</Text>
            <Text style={styles.rowHint}>Cooking time, measured in Cold Ones</Text>
          </View>
        </View>
        <View style={styles.dedicationCard}>
          <Text style={styles.dedicationText}>
            Dedicated to Jim O'Connor.{'\n'}This one's for you. 🍺
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  row: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.grayLight,
    marginBottom: spacing.sm,
  },
  rowInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.brown,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: colors.amber,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  rowHint: {
    fontSize: fontSize.sm,
    color: colors.grayDark,
    marginTop: spacing.xs,
  },
  rowButton: {
    backgroundColor: colors.amber,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  rowButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  dedicationCard: {
    backgroundColor: colors.brownMedium,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  dedicationText: {
    color: colors.amberLight,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
