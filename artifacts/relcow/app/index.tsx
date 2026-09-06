import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import colors from '@/constants/colors';
import { getDisplayDate, useApp } from '@/context/AppProvider';

function AppMark({
  color,
  cutoutColor,
  size = 24,
}: {
  color: string;
  cutoutColor: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.markCutout,
          {
            borderLeftWidth: size * 0.28,
            borderRightWidth: size * 0.28,
            borderBottomWidth: size * 0.42,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: cutoutColor,
          },
        ]}
      />
    </View>
  );
}

function Onboarding() {
  const { palette, saveProfile } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const themed = makeStyles(palette);
  const goalNumber = Number.parseInt(goal, 10);
  const canContinue = name.trim().length > 0;

  return (
    <View
      style={[
        themed.screen,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 18 },
      ]}
    >
      <StatusBar style="light" />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={themed.onboardingContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={themed.brandRow}>
          <AppMark color={palette.mint} cutoutColor={palette.background} size={34} />
          <Text style={themed.brand}>RELCOW</Text>
        </View>
        <View style={themed.onboardingHero}>
          <Text style={themed.eyebrow}>AWARENESS, NOT JUDGMENT</Text>
          <Text style={themed.onboardingTitle}>
            Make the invisible{'\n'}
            <Text style={{ color: palette.mint }}>count.</Text>
          </Text>
          <Text style={themed.onboardingCopy}>
            Relcow helps you notice your reel habits without watching or
            monitoring anything for you.
          </Text>
        </View>
        <View style={themed.setupCard}>
          <Text style={themed.cardTitle}>Start with a name</Text>
          <Text style={themed.cardCopy}>
            Just a display name. No account, password, or sign-in.
          </Text>
          <TextInput
            testID="profile-name"
            value={name}
            onChangeText={setName}
            placeholder="What should we call you?"
            placeholderTextColor={palette.mutedForeground}
            style={themed.input}
            maxLength={28}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Text style={themed.inputLabel}>OPTIONAL DAILY AWARENESS GOAL</Text>
          <TextInput
            testID="daily-goal"
            value={goal}
            onChangeText={(value) => setGoal(value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 50 reels"
            placeholderTextColor={palette.mutedForeground}
            style={themed.input}
            keyboardType="number-pad"
            maxLength={4}
          />
          <Pressable
            testID="start-tracking"
            accessibilityRole="button"
            accessibilityLabel="Start tracking"
            disabled={!canContinue}
            onPress={() =>
              saveProfile(
                name,
                Number.isFinite(goalNumber) && goalNumber > 0 ? goalNumber : null,
              )
            }
            style={({ pressed }) => [
              themed.primaryButton,
              !canContinue && themed.disabledButton,
              pressed && themed.pressed,
            ]}
          >
            <Text style={themed.primaryButtonText}>Start tracking</Text>
            <Feather name="arrow-right" size={19} color={palette.primaryForeground} />
          </Pressable>
        </View>
        <Text style={themed.privacyNote}>
          Your counts stay on this device. You can reset everything anytime.
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function StatTile({
  label,
  value,
  accent,
  palette,
}: {
  label: string;
  value: number;
  accent: string;
  palette: typeof colors.dark;
}) {
  return (
    <View style={[makeStyles(palette).statTile, { borderTopColor: accent }]}>
      <Text style={makeStyles(palette).statValue}>{value}</Text>
      <Text style={makeStyles(palette).statLabel}>{label}</Text>
    </View>
  );
}

function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {
    palette,
    state,
    toggleTheme,
    setHaptics,
    setReducedMotion,
    resetProfile,
  } = useApp();
  const themed = makeStyles(palette);
  const confirmReset = () => {
    Alert.alert(
      'Reset Relcow?',
      'This removes your profile, counts, XP, and milestones from this device.',
      [
        { text: 'Keep my data', style: 'cancel' },
        {
          text: 'Reset everything',
          style: 'destructive',
          onPress: () => {
            resetProfile();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={themed.modalOverlay}>
        <View style={[themed.sheet, { paddingBottom: 24 }]}>
          <View style={themed.sheetHandle} />
          <View style={themed.sheetHeader}>
            <View>
              <Text style={themed.sheetEyebrow}>PERSONALIZE</Text>
              <Text style={themed.sheetTitle}>Your space</Text>
            </View>
            <Pressable
              testID="close-settings"
              accessibilityLabel="Close settings"
              onPress={onClose}
              style={themed.iconButton}
            >
              <Feather name="x" size={20} color={palette.text} />
            </Pressable>
          </View>
          <View style={themed.settingRow}>
            <View style={themed.settingIcon}>
              <Feather name={state.theme === 'dark' ? 'moon' : 'sun'} size={18} color={palette.violet} />
            </View>
            <View style={themed.settingText}>
              <Text style={themed.settingTitle}>Appearance</Text>
              <Text style={themed.settingDescription}>
                {state.theme === 'dark' ? 'Midnight' : 'Daylight'} mode
              </Text>
            </View>
            <Pressable
              testID="toggle-theme"
              accessibilityRole="button"
              accessibilityLabel="Toggle theme"
              onPress={toggleTheme}
              style={themed.smallAction}
            >
              <Text style={themed.smallActionText}>Switch</Text>
            </Pressable>
          </View>
          <View style={themed.settingRow}>
            <View style={themed.settingIcon}>
              <Feather name="zap" size={18} color={palette.coral} />
            </View>
            <View style={themed.settingText}>
              <Text style={themed.settingTitle}>Haptics</Text>
              <Text style={themed.settingDescription}>A tiny pulse when you count</Text>
            </View>
            <Switch
              testID="toggle-haptics"
              value={state.haptics}
              onValueChange={setHaptics}
              trackColor={{ false: palette.border, true: palette.mint }}
              thumbColor={palette.card}
            />
          </View>
          <View style={themed.settingRow}>
            <View style={themed.settingIcon}>
              <Feather name="wind" size={18} color={palette.mint} />
            </View>
            <View style={themed.settingText}>
              <Text style={themed.settingTitle}>Reduced motion</Text>
              <Text style={themed.settingDescription}>Keep interactions calm</Text>
            </View>
            <Switch
              testID="toggle-motion"
              value={state.reducedMotion}
              onValueChange={setReducedMotion}
              trackColor={{ false: palette.border, true: palette.mint }}
              thumbColor={palette.card}
            />
          </View>
          <Pressable
            testID="reset-profile"
            accessibilityRole="button"
            onPress={confirmReset}
            style={({ pressed }) => [themed.resetButton, pressed && themed.pressed]}
          >
            <Feather name="trash-2" size={17} color={palette.destructive} />
            <Text style={themed.resetText}>Reset profile and data</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type FeatureTab =
  | 'stats'
  | 'history'
  | 'achievements'
  | 'friends'
  | 'challenges'
  | 'collection'
  | 'journey'
  | 'settings';

function FeatureCard({
  title,
  eyebrow,
  children,
  palette,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  palette: typeof colors.dark;
}) {
  return (
    <View
      style={{
        backgroundColor: palette.card,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: 19,
        padding: 16,
        marginTop: 10,
      }}
    >
      {eyebrow ? <Text style={{ color: palette.mint, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 }}>{eyebrow}</Text> : null}
      <Text style={{ color: palette.text, fontSize: 17, fontWeight: '700', marginTop: eyebrow ? 7 : 0 }}>{title}</Text>
      {children}
    </View>
  );
}

function FeatureButton({
  label,
  onPress,
  palette,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  palette: typeof colors.dark;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: secondary ? palette.secondary : palette.primary,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.78 : 1,
      })}
    >
      <Text style={{ color: secondary ? palette.secondaryForeground : palette.primaryForeground, fontWeight: '700', fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function FeatureHub() {
  const {
    palette,
    state,
    totalCount,
    todayCount,
    weekCount,
    monthCount,
    yearCount,
    totalXp,
    level,
    streak,
    achievements,
    unlockedMilestones,
    nextMilestone,
    setReminders,
    addCustomMilestone,
    addFriend,
    blockFriend,
    createChallenge,
    joinChallenge,
    setSyncEnabled,
    syncNow,
    exportData,
    restoreData,
  } = useApp();
  const [tab, setTab] = useState<FeatureTab>('stats');
  const [friendName, setFriendName] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeTarget, setChallengeTarget] = useState('50');
  const [challengeCode, setChallengeCode] = useState('');
  const [milestoneInput, setMilestoneInput] = useState('');
  const [restoreDraft, setRestoreDraft] = useState('');
  const [message, setMessage] = useState('');

  const tabs: Array<{ id: FeatureTab; label: string; icon: React.ComponentProps<typeof Feather>['name'] }> = [
    { id: 'stats', label: 'Stats', icon: 'bar-chart-2' },
    { id: 'history', label: 'History', icon: 'calendar' },
    { id: 'achievements', label: 'Awards', icon: 'award' },
    { id: 'friends', label: 'Friends', icon: 'users' },
    { id: 'challenges', label: 'Challenges', icon: 'flag' },
    { id: 'collection', label: 'Room', icon: 'box' },
    { id: 'journey', label: 'Journey', icon: 'map' },
    { id: 'settings', label: 'More', icon: 'sliders' },
  ];

  const share = (body: string) => {
    Share.share({ title: 'Relcow', message: body }).catch(() => undefined);
  };
  const inputStyle = {
    backgroundColor: palette.background,
    borderColor: palette.input,
    borderWidth: 1,
    borderRadius: 12,
    color: palette.text,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  };
  const muted = { color: palette.mutedForeground, fontSize: 12, lineHeight: 18 };

  return (
    <View style={{ marginTop: 22 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {tabs.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setTab(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 11,
              paddingVertical: 9,
              borderRadius: 12,
              backgroundColor: tab === item.id ? palette.primary : palette.card,
              borderColor: tab === item.id ? palette.primary : palette.border,
              borderWidth: 1,
            }}
          >
            <Feather name={item.icon} size={14} color={tab === item.id ? palette.primaryForeground : palette.mutedForeground} />
            <Text style={{ color: tab === item.id ? palette.primaryForeground : palette.mutedForeground, fontSize: 11, fontWeight: '700' }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === 'stats' ? (
        <FeatureCard title="A calmer view of your rhythm" eyebrow="INSIGHTS" palette={palette}>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <StatTile label="TODAY" value={todayCount} accent={palette.coral} palette={palette} />
            <StatTile label="WEEK" value={weekCount} accent={palette.mint} palette={palette} />
            <StatTile label="MONTH" value={monthCount} accent={palette.violet} palette={palette} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <StatTile label="YEAR" value={yearCount} accent={palette.violet} palette={palette} />
            <StatTile label="STREAK" value={streak} accent={palette.coral} palette={palette} />
            <StatTile label="XP" value={totalXp} accent={palette.mint} palette={palette} />
          </View>
          <Text style={[muted, { marginTop: 14 }]}>
            Level {level} · {totalCount} total reels · {streak ? `${streak} active days in a row` : 'Start a streak with one small check-in'}
          </Text>
          <Text style={[muted, { marginTop: 8 }]}>
            Weekly report: {weekCount === 0 ? 'No counts yet — this is a clean starting point.' : `You noticed ${weekCount} reels this week. Review the pattern, then choose what comes next.`}
          </Text>
        </FeatureCard>
      ) : null}

      {tab === 'history' ? (
        <FeatureCard title="History calendar" eyebrow="HISTORY · LOCAL" palette={palette}>
          {Object.entries(state.entries).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14).map(([date, entry]) => (
            <View key={date} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomColor: palette.border, borderBottomWidth: 1 }}>
              <Text style={{ color: palette.text, fontWeight: '600' }}>{date}</Text>
              <Text style={{ color: palette.mint, fontWeight: '700' }}>{entry.count} reels</Text>
            </View>
          ))}
          {Object.keys(state.entries).length === 0 ? <Text style={[muted, { marginTop: 12 }]}>Your history will appear after your first count.</Text> : null}
          <Text style={[muted, { marginTop: 14 }]}>Daily reset follows your device’s local midnight. Timestamps stay on-device.</Text>
        </FeatureCard>
      ) : null}

      {tab === 'achievements' ? (
        <FeatureCard title="Achievements and key milestones" eyebrow="ACHIEVEMENTS" palette={palette}>
          {achievements.map((achievement) => (
            <View key={achievement} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
              <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: palette.mintSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="check" size={15} color={palette.mint} />
              </View>
              <Text style={{ color: palette.text, fontWeight: '600', marginLeft: 10 }}>{achievement}</Text>
            </View>
          ))}
          {achievements.length === 0 ? <Text style={[muted, { marginTop: 10 }]}>Your first achievement appears after your first tracked reel.</Text> : null}
          <Text style={{ color: palette.text, fontWeight: '700', marginTop: 14 }}>Milestones unlocked: {unlockedMilestones.length}</Text>
          <Text style={[muted, { marginTop: 5 }]}>
            {nextMilestone ? `${nextMilestone - totalCount} more to unlock the next collectible.` : 'Every configured milestone is unlocked.'}
          </Text>
        </FeatureCard>
      ) : null}

      {tab === 'friends' ? (
        <FeatureCard title="Friends without forced accounts" eyebrow="FRIENDS · PRIVATE BY DEFAULT" palette={palette}>
          <Text style={[muted, { marginTop: 8 }]}>Use a share code now. Online identity and leaderboards remain opt-in future sync.</Text>
          <Text style={{ color: palette.mint, fontSize: 22, fontWeight: '700', letterSpacing: 2, marginTop: 14 }}>{state.referralCode || 'REL-READY'}</Text>
          <FeatureButton label="Share referral / challenge code" palette={palette} onPress={() => share(`Join my Relcow awareness challenge with code ${state.referralCode}`)} />
          <TextInput value={friendName} onChangeText={setFriendName} placeholder="Friend name" placeholderTextColor={palette.mutedForeground} style={inputStyle} />
          <TextInput value={friendCode} onChangeText={setFriendCode} placeholder="Friend code" placeholderTextColor={palette.mutedForeground} style={inputStyle} autoCapitalize="characters" />
          <FeatureButton label="Add friend invitation" palette={palette} onPress={() => { addFriend(friendName, friendCode); setFriendName(''); setFriendCode(''); }} secondary />
          {state.friends.map((friend) => (
            <View key={friend.id} style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontWeight: '600' }}>{friend.name}</Text>
                <Text style={muted}>{friend.code} · {friend.status}</Text>
              </View>
              <Pressable onPress={() => blockFriend(friend.id)}><Text style={{ color: palette.destructive, fontSize: 11, fontWeight: '700' }}>Block</Text></Pressable>
              <Pressable onPress={() => Alert.alert('Report friend', 'Reporting will be connected to moderation when online mode is enabled.')} style={{ marginLeft: 12 }}><Text style={{ color: palette.mutedForeground, fontSize: 11, fontWeight: '700' }}>Report</Text></Pressable>
            </View>
          ))}
          {state.friends.length === 0 ? <Text style={[muted, { marginTop: 12 }]}>No friends yet. Invitations stay local until you choose to share.</Text> : null}
        </FeatureCard>
      ) : null}

      {tab === 'challenges' ? (
        <FeatureCard title="Commitments and challenges" eyebrow="CHALLENGES" palette={palette}>
          <TextInput value={challengeTitle} onChangeText={setChallengeTitle} placeholder="Challenge title" placeholderTextColor={palette.mutedForeground} style={inputStyle} />
          <TextInput value={challengeTarget} onChangeText={(value) => setChallengeTarget(value.replace(/[^0-9]/g, ''))} placeholder="Target reels" placeholderTextColor={palette.mutedForeground} style={inputStyle} keyboardType="number-pad" />
          <FeatureButton label="Create 7-day commitment" palette={palette} onPress={() => { createChallenge(challengeTitle, Number(challengeTarget) || 50, 7); setChallengeTitle(''); }} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput value={challengeCode} onChangeText={setChallengeCode} placeholder="Join code" placeholderTextColor={palette.mutedForeground} style={[inputStyle, { flex: 1, marginTop: 0 }]} />
            <FeatureButton label="Join" palette={palette} secondary onPress={() => { joinChallenge(challengeCode); setChallengeCode(''); }} />
          </View>
          {state.challenges.map((challenge) => (
            <View key={challenge.id} style={{ marginTop: 14, padding: 13, borderRadius: 13, backgroundColor: palette.background }}>
              <Text style={{ color: palette.text, fontWeight: '700' }}>{challenge.title}</Text>
              <Text style={[muted, { marginTop: 4 }]}>{challenge.target} reels · {challenge.participants.length} participant{challenge.participants.length === 1 ? '' : 's'} · {challenge.status}</Text>
              <FeatureButton label="Share challenge card" palette={palette} onPress={() => share(`${challenge.title}: track ${challenge.target} reels with me on Relcow.`)} secondary />
            </View>
          ))}
          {state.challenges.length === 0 ? <Text style={[muted, { marginTop: 12 }]}>Create a private commitment or join one with a code.</Text> : null}
        </FeatureCard>
      ) : null}

      {tab === 'collection' ? (
        <FeatureCard title="Virtual collection room" eyebrow="3D-READY TROPHY CABINET" palette={palette}>
          <Text style={[muted, { marginTop: 8 }]}>A low-motion room for fictional creator-themed collectibles. No copyrighted creator assets are used.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {[10, 25, 50, 100, 150, 200, 300, 500, ...state.customMilestones].sort((a, b) => a - b).filter((value, index, all) => all.indexOf(value) === index).map((milestone) => {
              const unlocked = totalCount >= milestone;
              return (
                <View key={milestone} style={{ width: '30%', minWidth: 92, height: 92, borderRadius: 18, backgroundColor: unlocked ? palette.coralSoft : palette.background, borderColor: unlocked ? palette.coral : palette.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={unlocked ? 'award' : 'lock'} size={21} color={unlocked ? palette.coral : palette.mutedForeground} />
                  <Text style={{ color: unlocked ? palette.text : palette.mutedForeground, fontSize: 11, fontWeight: '700', marginTop: 7 }}>{milestone}</Text>
                  <Text style={{ color: palette.mutedForeground, fontSize: 9 }}>{unlocked ? 'unlocked' : 'locked'}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[muted, { marginTop: 14 }]}>Filters and rarity tiers are stored in the local reward catalogue and ready for future content updates.</Text>
        </FeatureCard>
      ) : null}

      {tab === 'journey' ? (
        <FeatureCard title="Journey map" eyebrow="LEVELS · XP MULTIPLIERS" palette={palette}>
          <Text style={[muted, { marginTop: 8 }]}>You are on level {level} with {totalXp} XP and a {streak}-day streak.</Text>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: level >= step ? palette.mint : palette.background, borderColor: palette.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: level >= step ? palette.primaryForeground : palette.mutedForeground, fontWeight: '700', fontSize: 11 }}>{step}</Text>
              </View>
              <Text style={{ color: palette.text, marginLeft: 10, fontWeight: '600' }}>Awareness checkpoint {step}</Text>
              {level >= step ? <Feather name="check" size={15} color={palette.mint} style={{ marginLeft: 'auto' }} /> : null}
            </View>
          ))}
          <View style={{ marginTop: 10, padding: 12, borderRadius: 13, backgroundColor: palette.violetSoft }}>
            <Text style={{ color: palette.violet, fontWeight: '700' }}>Multiplier events</Text>
            <Text style={[muted, { marginTop: 4 }]}>
              {state.featureFlags.multipliersEnabled ? 'A configured XP multiplier is active.' : 'Disabled by default. Remote configuration can enable future events without changing local history.'}
            </Text>
          </View>
        </FeatureCard>
      ) : null}

      {tab === 'settings' ? (
        <FeatureCard title="More controls" eyebrow="PRIVACY · DATA · ACCESSIBILITY" palette={palette}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontWeight: '600' }}>Break reminders</Text>
              <Text style={muted}>Respect quiet hours and stay awareness-first.</Text>
            </View>
            <Switch value={state.reminders.enabled} onValueChange={(enabled) => setReminders({ enabled })} trackColor={{ false: palette.border, true: palette.mint }} thumbColor={palette.card} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput value={state.reminders.quietStart} onChangeText={(quietStart) => setReminders({ quietStart })} style={[inputStyle, { flex: 1 }]} />
            <TextInput value={state.reminders.quietEnd} onChangeText={(quietEnd) => setReminders({ quietEnd })} style={[inputStyle, { flex: 1 }]} />
          </View>
          <Text style={[muted, { marginTop: 4 }]}>Quiet hours start / end · {state.reminders.cadence} cadence</Text>
          <TextInput value={milestoneInput} onChangeText={(value) => setMilestoneInput(value.replace(/[^0-9]/g, ''))} placeholder="Custom milestone, e.g. 750" placeholderTextColor={palette.mutedForeground} style={inputStyle} keyboardType="number-pad" />
          <FeatureButton label="Add custom milestone" palette={palette} secondary onPress={() => { addCustomMilestone(Number(milestoneInput)); setMilestoneInput(''); }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontWeight: '600' }}>Optional cloud sync</Text>
              <Text style={muted}>{state.sync.pendingChanges} offline changes queued · conflict strategy ready</Text>
            </View>
            <Switch value={state.sync.enabled} onValueChange={setSyncEnabled} trackColor={{ false: palette.border, true: palette.mint }} thumbColor={palette.card} />
          </View>
          {state.sync.enabled ? (
            <FeatureButton
              label="Sync now"
              palette={palette}
              secondary
              onPress={() => {
                syncNow().then((ok) => setMessage(ok ? 'Synced successfully.' : 'Sync unavailable. Your local queue is safe.'));
              }}
            />
          ) : null}
          <FeatureButton label="Share export / backup" palette={palette} onPress={() => share(exportData())} />
          <TextInput value={restoreDraft} onChangeText={setRestoreDraft} placeholder="Paste a Relcow JSON backup to restore" placeholderTextColor={palette.mutedForeground} style={[inputStyle, { minHeight: 70 }]} multiline />
          <FeatureButton label="Restore local backup" palette={palette} secondary onPress={() => setMessage(restoreData(restoreDraft) ? 'Backup restored.' : 'Backup could not be read.')} />
          {message ? <Text style={{ color: palette.mint, fontSize: 12, marginTop: 10 }}>{message}</Text> : null}
          <Text style={[muted, { marginTop: 14 }]}>Ads are off by default. Accessibility, reduced motion, haptics, sound, data deletion, and local-only privacy remain user-controlled.</Text>
        </FeatureCard>
      ) : null}
    </View>
  );
}

function Dashboard() {
  const {
    palette,
    profile,
    todayCount,
    weekCount,
    monthCount,
    totalCount,
    totalXp,
    level,
    levelProgress,
    nextMilestone,
    unlockedMilestones,
    recordCount,
    undoLast,
    state,
  } = useApp();
  const insets = useSafeAreaInsets();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const themed = makeStyles(palette);
  const goal = profile?.dailyGoal ?? 50;
  const goalProgress = Math.min(1, todayCount / goal);
  const milestoneProgress = nextMilestone
    ? Math.min(1, totalCount / nextMilestone)
    : 1;
  const goalReached = profile?.dailyGoal ? todayCount >= profile.dailyGoal : false;

  return (
    <View style={[themed.screen, { paddingTop: insets.top }]}>
      <StatusBar style={state.theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View style={themed.header}>
          <View style={themed.brandRow}>
            <AppMark color={palette.mint} cutoutColor={palette.background} size={28} />
            <Text style={themed.brand}>RELCOW</Text>
          </View>
          <Pressable
            testID="open-settings"
            accessibilityLabel="Open settings"
            onPress={() => setSettingsVisible(true)}
            style={({ pressed }) => [themed.iconButton, pressed && themed.pressed]}
          >
            <Feather name="sliders" size={19} color={palette.text} />
          </Pressable>
        </View>

        <View style={themed.greeting}>
          <Text style={themed.eyebrow}>{getDisplayDate().toUpperCase()}</Text>
          <Text style={themed.greetingTitle}>
            Hey {profile?.name.split(' ')[0] ?? 'there'}.
          </Text>
          <Text style={themed.greetingCopy}>Notice it. Then choose what comes next.</Text>
        </View>

        <View style={themed.counterCard}>
          <View style={themed.counterTopline}>
            <View>
              <Text style={themed.counterLabel}>TODAY&apos;S REELS</Text>
              <Text style={themed.counterHint}>
                {goalReached ? 'You reached your awareness goal.' : `${goal - todayCount > 0 ? goal - todayCount : 0} to your daily goal`}
              </Text>
            </View>
            <View style={themed.countBadge}>
              <Feather name="activity" size={14} color={palette.mint} />
              <Text style={themed.countBadgeText}>{todayCount > 0 ? 'TRACKING' : 'READY'}</Text>
            </View>
          </View>
          <Text style={themed.bigCount}>{todayCount}</Text>
          <View style={themed.progressTrack}>
            <View style={[themed.progressFill, { width: `${goalProgress * 100}%` }]} />
          </View>
          <Text style={themed.counterFootnote}>
            Counts are entered by you. Relcow never watches another app.
          </Text>
          <Pressable
            testID="count-one"
            accessibilityRole="button"
            accessibilityLabel="Track one reel"
            onPress={() => recordCount(1)}
            style={({ pressed }) => [
              themed.countButton,
              pressed && themed.countButtonPressed,
            ]}
          >
            <Text style={themed.countButtonPlus}>+</Text>
            <Text style={themed.countButtonText}>Track one reel</Text>
          </Pressable>
          <View style={themed.quickActions}>
            {[5, 10].map((amount) => (
              <Pressable
                key={amount}
                testID={`count-${amount}`}
                accessibilityRole="button"
                accessibilityLabel={`Track ${amount} reels`}
                onPress={() => recordCount(amount)}
                style={({ pressed }) => [
                  themed.quickButton,
                  pressed && themed.pressed,
                ]}
              >
                <Text style={themed.quickButtonText}>+{amount}</Text>
              </Pressable>
            ))}
            <Pressable
              testID="undo-count"
              accessibilityRole="button"
              accessibilityLabel="Undo last count"
              disabled={state.actionHistory.length === 0}
              onPress={undoLast}
              style={({ pressed }) => [
                themed.undoButton,
                state.actionHistory.length === 0 && themed.disabledButton,
                pressed && themed.pressed,
              ]}
            >
              <Feather name="corner-up-left" size={16} color={palette.mutedForeground} />
              <Text style={themed.undoText}>Undo</Text>
            </Pressable>
          </View>
        </View>

        <View style={themed.sectionHeading}>
          <Text style={themed.sectionTitle}>Your rhythm</Text>
          <Text style={themed.sectionMeta}>REAL-TIME</Text>
        </View>
        <View style={themed.statsRow}>
          <StatTile label="TODAY" value={todayCount} accent={palette.coral} palette={palette} />
          <StatTile label="THIS WEEK" value={weekCount} accent={palette.mint} palette={palette} />
          <StatTile label="THIS MONTH" value={monthCount} accent={palette.violet} palette={palette} />
        </View>

        <View style={themed.levelCard}>
          <View style={themed.levelCopy}>
            <View style={themed.levelTitleRow}>
              <Text style={themed.levelEyebrow}>PROGRESSION</Text>
              <Text style={themed.xpText}>{totalXp} XP</Text>
            </View>
            <Text style={themed.levelTitle}>Level {level}</Text>
            <Text style={themed.levelDescription}>
              {nextMilestone
                ? `${nextMilestone - totalCount} more to unlock your next milestone`
                : 'Every milestone is unlocked. Keep noticing.'}
            </Text>
            <View style={themed.levelTrack}>
              <View style={[themed.levelFill, { width: `${levelProgress * 100}%` }]} />
            </View>
          </View>
          <View style={themed.levelOrb}>
            <Feather name="award" size={26} color={palette.primaryForeground} />
          </View>
        </View>

        <View style={themed.milestoneCard}>
          <View style={themed.milestoneHeader}>
            <View>
              <Text style={themed.levelEyebrow}>COLLECTION</Text>
              <Text style={themed.milestoneTitle}>
                {unlockedMilestones.length} milestones unlocked
              </Text>
            </View>
            <Feather name="box" size={22} color={palette.coral} />
          </View>
          <Text style={themed.milestoneDescription}>
            {nextMilestone
              ? `Your next collectible arrives at ${nextMilestone} total reels.`
              : 'You have completed the first collection set.'}
          </Text>
          <View style={themed.milestoneTrack}>
            <View style={[themed.milestoneFill, { width: `${milestoneProgress * 100}%` }]} />
          </View>
          <View style={themed.milestoneDots}>
            {[10, 25, 50, 100, 150, 200].map((milestone) => (
              <View
                key={milestone}
                style={[
                  themed.milestoneDot,
                  totalCount >= milestone && {
                    backgroundColor: palette.coral,
                    borderColor: palette.coral,
                  },
                ]}
              >
                {totalCount >= milestone ? (
                  <Feather name="check" size={10} color={palette.primaryForeground} />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View style={themed.breakCard}>
          <View style={themed.breakIcon}>
            <Feather name="coffee" size={19} color={palette.coral} />
          </View>
          <View style={themed.breakCopy}>
            <Text style={themed.breakTitle}>
              {todayCount >= 50 ? 'A good moment to pause' : 'Awareness is the win'}
            </Text>
            <Text style={themed.breakDescription}>
              {todayCount >= 50
                ? 'You have tracked a lot today. Review your progress or take a short break.'
                : 'Relcow is here to help you notice your pattern, not chase a bigger number.'}
            </Text>
          </View>
        </View>
        <FeatureHub />
      </ScrollView>
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

export default function HomeScreen() {
  const { isHydrated, state } = useApp();
  if (!isHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.dark.background }]}>
        <ActivityIndicator color={colors.dark.mint} />
      </View>
    );
  }
  return state.profile ? <Dashboard /> : <Onboarding />;
}

const makeStyles = (palette: typeof colors.dark) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
    },
    onboardingContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      justifyContent: 'space-between',
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brand: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 2.8,
    },
    mark: {
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ rotate: '45deg' }],
    },
    markCutout: {
      width: 0,
      height: 0,
      borderStyle: 'solid',
      transform: [{ rotate: '-45deg' }],
    },
    onboardingHero: {
      marginTop: 52,
      marginBottom: 32,
    },
    eyebrow: {
      color: palette.mint,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    onboardingTitle: {
      color: palette.text,
      fontSize: 46,
      lineHeight: 50,
      fontWeight: '700',
      letterSpacing: -1.7,
      marginTop: 16,
    },
    onboardingCopy: {
      color: palette.mutedForeground,
      fontSize: 16,
      lineHeight: 24,
      marginTop: 18,
      maxWidth: 330,
    },
    setupCard: {
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: 24,
      padding: 20,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 19,
      fontWeight: '700',
    },
    cardCopy: {
      color: palette.mutedForeground,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 7,
      marginBottom: 18,
    },
    inputLabel: {
      color: palette.mutedForeground,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      marginTop: 17,
      marginBottom: 8,
    },
    input: {
      backgroundColor: palette.background,
      borderColor: palette.input,
      borderWidth: 1,
      borderRadius: 14,
      color: palette.text,
      fontSize: 15,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    primaryButton: {
      backgroundColor: palette.primary,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      marginTop: 20,
    },
    primaryButtonText: {
      color: palette.primaryForeground,
      fontSize: 15,
      fontWeight: '700',
    },
    privacyNote: {
      color: palette.mutedForeground,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 18,
      paddingHorizontal: 20,
    },
    greeting: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 18,
    },
    greetingTitle: {
      color: palette.text,
      fontSize: 31,
      fontWeight: '700',
      letterSpacing: -0.8,
      marginTop: 8,
    },
    greetingCopy: {
      color: palette.mutedForeground,
      fontSize: 14,
      marginTop: 7,
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderWidth: 1,
    },
    counterCard: {
      marginHorizontal: 20,
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: 24,
      padding: 18,
      overflow: 'hidden',
    },
    counterTopline: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    counterLabel: {
      color: palette.mutedForeground,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    counterHint: {
      color: palette.text,
      fontSize: 13,
      marginTop: 7,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 99,
      backgroundColor: palette.mintSoft,
    },
    countBadgeText: {
      color: palette.mint,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.7,
    },
    bigCount: {
      color: palette.text,
      fontSize: 88,
      fontWeight: '700',
      letterSpacing: -4,
      lineHeight: 96,
      marginTop: 18,
    },
    progressTrack: {
      height: 6,
      borderRadius: 99,
      backgroundColor: palette.muted,
      overflow: 'hidden',
      marginTop: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 99,
      backgroundColor: palette.mint,
    },
    counterFootnote: {
      color: palette.mutedForeground,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 12,
    },
    countButton: {
      backgroundColor: palette.mint,
      borderRadius: 16,
      paddingVertical: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 18,
    },
    countButtonPressed: {
      backgroundColor: palette.primary,
      transform: [{ scale: 0.985 }],
    },
    countButtonPlus: {
      color: palette.primaryForeground,
      fontSize: 24,
      lineHeight: 24,
      fontWeight: '500',
    },
    countButtonText: {
      color: palette.primaryForeground,
      fontSize: 15,
      fontWeight: '700',
    },
    quickActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    quickButton: {
      backgroundColor: palette.secondary,
      borderRadius: 12,
      flex: 1,
      paddingVertical: 11,
      alignItems: 'center',
    },
    quickButtonText: {
      color: palette.secondaryForeground,
      fontSize: 13,
      fontWeight: '700',
    },
    undoButton: {
      backgroundColor: palette.background,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: 12,
      flex: 1.45,
      paddingVertical: 11,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 5,
    },
    undoText: {
      color: palette.mutedForeground,
      fontSize: 12,
      fontWeight: '600',
    },
    pressed: {
      opacity: 0.78,
    },
    disabledButton: {
      opacity: 0.4,
    },
    sectionHeading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 28,
      marginBottom: 12,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 19,
      fontWeight: '700',
    },
    sectionMeta: {
      color: palette.mutedForeground,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.1,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
    },
    statTile: {
      flex: 1,
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderWidth: 1,
      borderTopWidth: 3,
      borderRadius: 16,
      padding: 13,
    },
    statValue: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '700',
    },
    statLabel: {
      color: palette.mutedForeground,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.8,
      marginTop: 5,
    },
    levelCard: {
      marginHorizontal: 20,
      marginTop: 10,
      backgroundColor: palette.violetSoft,
      borderRadius: 20,
      padding: 17,
      flexDirection: 'row',
      alignItems: 'center',
    },
    levelCopy: {
      flex: 1,
    },
    levelTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    levelEyebrow: {
      color: palette.violet,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    xpText: {
      color: palette.violet,
      fontSize: 11,
      fontWeight: '700',
    },
    levelTitle: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '700',
      marginTop: 8,
    },
    levelDescription: {
      color: palette.mutedForeground,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
      paddingRight: 10,
    },
    levelTrack: {
      height: 5,
      borderRadius: 99,
      backgroundColor: palette.card,
      overflow: 'hidden',
      marginTop: 12,
      marginRight: 12,
    },
    levelFill: {
      height: '100%',
      borderRadius: 99,
      backgroundColor: palette.violet,
    },
    levelOrb: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: palette.violet,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 14,
    },
    milestoneCard: {
      marginHorizontal: 20,
      marginTop: 10,
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 17,
    },
    milestoneHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    milestoneTitle: {
      color: palette.text,
      fontSize: 17,
      fontWeight: '700',
      marginTop: 7,
    },
    milestoneDescription: {
      color: palette.mutedForeground,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 9,
    },
    milestoneTrack: {
      height: 5,
      borderRadius: 99,
      backgroundColor: palette.muted,
      overflow: 'hidden',
      marginTop: 16,
    },
    milestoneFill: {
      height: '100%',
      borderRadius: 99,
      backgroundColor: palette.coral,
    },
    milestoneDots: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    milestoneDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    breakCard: {
      marginHorizontal: 20,
      marginTop: 10,
      backgroundColor: palette.coralSoft,
      borderRadius: 18,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    breakIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: palette.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },
    breakCopy: {
      flex: 1,
    },
    breakTitle: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '700',
    },
    breakDescription: {
      color: palette.accentForeground,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: palette.overlay,
    },
    sheet: {
      backgroundColor: palette.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 99,
      backgroundColor: palette.border,
      marginBottom: 20,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    sheetEyebrow: {
      color: palette.mint,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.3,
    },
    sheetTitle: {
      color: palette.text,
      fontSize: 25,
      fontWeight: '700',
      marginTop: 5,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      borderBottomColor: palette.border,
      borderBottomWidth: 1,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: palette.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '600',
    },
    settingDescription: {
      color: palette.mutedForeground,
      fontSize: 12,
      marginTop: 3,
    },
    smallAction: {
      backgroundColor: palette.secondary,
      borderRadius: 10,
      paddingHorizontal: 11,
      paddingVertical: 8,
    },
    smallActionText: {
      color: palette.secondaryForeground,
      fontSize: 11,
      fontWeight: '700',
    },
    resetButton: {
      marginTop: 22,
      borderColor: palette.destructive,
      borderWidth: 1,
      borderRadius: 13,
      paddingVertical: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    resetText: {
      color: palette.destructive,
      fontSize: 13,
      fontWeight: '700',
    },
  });

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  markCutout: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    transform: [{ rotate: '-45deg' }],
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});