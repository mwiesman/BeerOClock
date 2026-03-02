import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize, shadows, emboss } from '../src/theme';
import {
  getColdOneTime,
  formatTime,
  getRemindersEnabled,
  saveRemindersEnabled,
  getGlassStyle,
  saveGlassStyle,
  GlassStyle,
} from '../src/utils/storage';
import ScreenBackground from '../src/components/ScreenBackground';
import Card from '../src/components/Card';
import Button from '../src/components/Button';
import SectionHeader from '../src/components/SectionHeader';
import { BeerIcon } from '../src/components/icons/RecipeIcons';

const GLASS_OPTIONS: { value: GlassStyle; label: string; desc: string }[] = [
  { value: 'random', label: 'Random', desc: 'Surprise me' },
  { value: 'pint', label: 'Pint', desc: 'Classic glass' },
  { value: 'mug', label: 'Mug', desc: 'Frosty handle' },
  { value: 'bottle', label: 'Bottle', desc: 'Longneck' },
  { value: 'can', label: 'Can', desc: 'Tall boy' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [coldOneTime, setColdOneTime] = useState<number | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [glassStyle, setGlassStyle] = useState<GlassStyle>('random');

  useFocusEffect(
    useCallback(() => {
      getColdOneTime().then(setColdOneTime);
      getRemindersEnabled().then(setRemindersEnabled);
      getGlassStyle().then(setGlassStyle);
    }, [])
  );

  const toggleReminders = async (value: boolean) => {
    setRemindersEnabled(value);
    await saveRemindersEnabled(value);
  };

  const selectGlass = async (style: GlassStyle) => {
    setGlassStyle(style);
    await saveGlassStyle(style);
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <SectionHeader title="Cold One" />

        <Card style={styles.row}>
          <View style={styles.rowInner}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Your Cold One Time</Text>
              <Text style={styles.rowValue}>
                {coldOneTime ? formatTime(coldOneTime) : 'Not set'}
              </Text>
            </View>
            <Button
              title={coldOneTime ? 'Recalibrate' : 'Set'}
              onPress={() => router.push('/timer')}
              style={styles.rowButton}
              textStyle={styles.rowButtonText}
            />
          </View>
        </Card>

        <SectionHeader title="Reminders" />

        <Card style={styles.row}>
          <View style={styles.rowInner}>
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
        </Card>

        <SectionHeader title="Glass Style" />

        <Card style={styles.row}>
          <Text style={styles.rowLabel}>Pour One Out Glass</Text>
          <Text style={styles.rowHint}>Choose your glass for the opening animation</Text>
          <View style={styles.glassOptions}>
            {GLASS_OPTIONS.map((opt) => {
              const selected = glassStyle === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => selectGlass(opt.value)}
                  style={[
                    styles.glassOption,
                    selected && styles.glassOptionSelected,
                  ]}
                >
                  <Text style={[styles.glassOptionLabel, selected && styles.glassOptionLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.glassOptionDesc, selected && styles.glassOptionDescSelected]}>
                    {opt.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button
            title="Pour One Out"
            variant="primary"
            onPress={() => router.push('/')}
            style={styles.pourButton}
          />
        </Card>

        <SectionHeader title="About" />

        <Card style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Beer O'Clock v1.0.0</Text>
            <Text style={styles.rowHint}>Cooking time, measured in Cold Ones</Text>
          </View>
        </Card>

        <Card variant="dark" style={styles.dedicationCard}>
          <View style={styles.dedicationInner}>
            <BeerIcon size={32} />
            <Text style={styles.dedicationText}>
              For Jim O.
            </Text>
          </View>
        </Card>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  row: {
    marginBottom: spacing.sm,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    ...shadows.sm,
  },
  rowButtonText: {
    fontSize: fontSize.sm,
  },
  glassOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  glassOption: {
    minWidth: 70,
    flexGrow: 1,
    flexBasis: '28%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.grayLight,
    backgroundColor: colors.white,
  },
  glassOptionSelected: {
    borderColor: colors.amber,
    backgroundColor: colors.creamDark,
  },
  glassOptionLabel: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  glassOptionLabelSelected: {
    color: colors.brown,
  },
  glassOptionDesc: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  glassOptionDescSelected: {
    color: colors.amberDark,
  },
  pourButton: {
    marginTop: spacing.md,
  },
  dedicationCard: {
    marginTop: spacing.sm,
  },
  dedicationInner: {
    alignItems: 'center',
    gap: spacing.sm,
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
