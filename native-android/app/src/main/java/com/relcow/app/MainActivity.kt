package com.relcow.app

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SmallTopAppBar
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

private val Midnight = Color(0xFF0B1020)
private val Mint = Color(0xFF6EE7B7)
private val Coral = Color(0xFFFF8A73)
private val Violet = Color(0xFFB7A6FF)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val store = remember { RelcowStore(this@MainActivity) }
            RelcowRoot(store)
        }
    }
}

@Composable
private fun RelcowRoot(store: RelcowStore) {
    var profileName by remember { mutableStateOf(store.profileName()) }
    var darkTheme by remember { mutableStateOf(store.isDarkTheme()) }
    var refresh by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        while (true) {
            refresh++
            delay(1200)
        }
    }

    RelcowTheme(darkTheme) {
        if (profileName.isBlank()) {
            OnboardingScreen { name, goal ->
                store.saveProfile(name, goal)
                profileName = name.trim()
                refresh++
            }
        } else {
            MainShell(
                store = store,
                profileName = profileName,
                refresh = refresh,
                onChanged = { refresh++ },
                onThemeChanged = {
                    darkTheme = !darkTheme
                    store.setDarkTheme(darkTheme)
                },
                onReset = {
                    store.reset()
                    profileName = ""
                    refresh++
                }
            )
        }
    }
}

@Composable
private fun RelcowTheme(dark: Boolean, content: @Composable () -> Unit) {
    val scheme = if (dark) {
        darkColorScheme(
            primary = Mint,
            onPrimary = Midnight,
            secondary = Coral,
            tertiary = Violet,
            background = Midnight,
            surface = Color(0xFF141B2D),
            surfaceVariant = Color(0xFF1B2740),
            onBackground = Color(0xFFF4F7FB),
            onSurface = Color(0xFFF4F7FB)
        )
    } else {
        lightColorScheme(
            primary = Color(0xFF147A58),
            onPrimary = Color.White,
            secondary = Color(0xFFD9654E),
            tertiary = Color(0xFF6B5CC5),
            background = Color(0xFFF5F7F4),
            surface = Color.White,
            surfaceVariant = Color(0xFFE7EFEA),
            onBackground = Color(0xFF172035),
            onSurface = Color(0xFF172035)
        )
    }
    MaterialTheme(colorScheme = scheme, content = content)
}

@Composable
private fun OnboardingScreen(onSave: (String, Int) -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    var goal by rememberSaveable { mutableStateOf("50") }
    val canContinue = name.trim().isNotEmpty()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 36.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("RELCOW", color = Mint, fontWeight = FontWeight.Bold, letterSpacing = 3.sp)
        Spacer(Modifier.height(44.dp))
        Text(
            "Make the\ninvisible count.",
            style = MaterialTheme.typography.displaySmall,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(16.dp))
        Text(
            "Notice your reel habits without Relcow watching or monitoring anything for you.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(Modifier.height(32.dp))
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(Modifier.padding(20.dp)) {
                Text("Start with a name", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(
                    "No account, password, or sign-in.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 6.dp, bottom = 16.dp)
                )
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it.take(28) },
                    label = { Text("Display name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = goal,
                    onValueChange = { goal = it.filter(Char::isDigit).take(4) },
                    label = { Text("Daily awareness goal") },
                    supportingText = { Text("Optional") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = { onSave(name, goal.toIntOrNull()?.coerceAtLeast(1) ?: 50) },
                    enabled = canContinue,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Mint, contentColor = Midnight)
                ) {
                    Text("Start tracking", fontWeight = FontWeight.Bold)
                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.padding(start = 8.dp))
                }
            }
        }
        Text(
            "Your counts stay on this device. You can reset everything anytime.",
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.fillMaxWidth().padding(top = 18.dp)
        )
    }
}

private enum class MainTab { HOME, STATS, FRIENDS, COLLECTION, PROFILE }

@Composable
private fun MainShell(
    store: RelcowStore,
    profileName: String,
    refresh: Int,
    onChanged: () -> Unit,
    onThemeChanged: () -> Unit,
    onReset: () -> Unit
) {
    var tab by rememberSaveable { mutableStateOf(MainTab.HOME) }
    val stats = remember(refresh) { store.stats() }
    val context = LocalContext.current

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(modifier = Modifier.navigationBarsPadding()) {
                TabItem(tab, MainTab.HOME, "Home", Icons.Default.Home) { tab = MainTab.HOME }
                TabItem(tab, MainTab.STATS, "Stats", Icons.Default.BarChart) { tab = MainTab.STATS }
                TabItem(tab, MainTab.FRIENDS, "Friends", Icons.Default.People) { tab = MainTab.FRIENDS }
                TabItem(tab, MainTab.COLLECTION, "Collection", Icons.Default.Collections) { tab = MainTab.COLLECTION }
                TabItem(tab, MainTab.PROFILE, "Profile", Icons.Default.Person) { tab = MainTab.PROFILE }
            }
        }
    ) { padding ->
        when (tab) {
            MainTab.HOME -> HomeScreen(
                modifier = Modifier.padding(padding),
                store = store,
                profileName = profileName,
                stats = stats,
                onChanged = onChanged,
                onOpenAccessibility = {
                    context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                }
            )
            MainTab.STATS -> StatsScreen(Modifier.padding(padding), stats)
            MainTab.FRIENDS -> FriendsScreen(Modifier.padding(padding), store)
            MainTab.COLLECTION -> CollectionScreen(Modifier.padding(padding), stats)
            MainTab.PROFILE -> ProfileScreen(
                modifier = Modifier.padding(padding),
                store = store,
                profileName = profileName,
                onChanged = onChanged,
                onThemeChanged = onThemeChanged,
                onReset = onReset
            )
        }
    }
}

@Composable
private fun TabItem(
    selectedTab: MainTab,
    tab: MainTab,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    NavigationBarItem(
        selected = selectedTab == tab,
        onClick = onClick,
        icon = { Icon(icon, contentDescription = label) },
        label = { Text(label) }
    )
}

@Composable
private fun HomeScreen(
    modifier: Modifier,
    store: RelcowStore,
    profileName: String,
    stats: RelcowStats,
    onChanged: () -> Unit,
    onOpenAccessibility: () -> Unit
) {
    val context = LocalContext.current
    val autoEnabled = store.isAccessibilityEnabled(context)
    val autoRunning = autoEnabled && !store.autoPaused()
    val nextMilestone = listOf(10, 25, 50, 100, 150, 200, 300, 500).firstOrNull { stats.allTime < it }
    val goal = store.dailyGoal()

    LazyColumn(modifier = modifier.fillMaxSize(), contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp)) {
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("RELCOW", color = Mint, fontWeight = FontWeight.Bold, letterSpacing = 3.sp)
                    Text("Hey ${profileName.substringBefore(' ')}.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                }
                Icon(Icons.Default.Security, contentDescription = "Privacy first", tint = Mint, modifier = Modifier.size(26.dp))
            }
            Spacer(Modifier.height(20.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column(Modifier.padding(18.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("TODAY'S REELS", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("${(goal - stats.today).coerceAtLeast(0)} to your goal", modifier = Modifier.padding(top = 6.dp))
                        }
                        Text(if (stats.today > 0) "TRACKING" else "READY", color = Mint, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Text("${stats.today}", fontSize = 72.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp))
                    LinearProgressIndicator(
                        progress = { (stats.today.toFloat() / goal).coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth(),
                        color = Mint
                    )
                    Text("Counts are entered by you. Relcow never watches another app.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(top = 10.dp))
                    Button(
                        onClick = { store.record(1, "MANUAL"); onChanged() },
                        modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Mint, contentColor = Midnight)
                    ) {
                        Text("+  Track one reel", fontWeight = FontWeight.Bold)
                    }
                    Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(5, 10).forEach { amount ->
                            OutlinedButton(onClick = { store.record(amount, "MANUAL"); onChanged() }, modifier = Modifier.weight(1f)) {
                                Text("+$amount")
                            }
                        }
                        OutlinedButton(onClick = { store.undoLast(); onChanged() }, modifier = Modifier.weight(1.4f)) {
                            Icon(Icons.Default.Undo, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("Undo", modifier = Modifier.padding(start = 4.dp))
                        }
                    }
                }
            }
        }
        item {
            SectionTitle("Your rhythm", "REAL-TIME")
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatCard("TODAY", stats.today, Coral, Modifier.weight(1f))
                StatCard("WEEK", stats.week, Mint, Modifier.weight(1f))
                StatCard("ALL TIME", stats.allTime, Violet, Modifier.weight(1f))
            }
        }
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF272344)),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.padding(top = 10.dp)
            ) {
                Column(Modifier.padding(18.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("LEVEL ${stats.level}", color = Color.White, fontWeight = FontWeight.Bold)
                        Text("${stats.xp} XP", color = Violet, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        if (nextMilestone != null) "${nextMilestone - stats.allTime} more to the next milestone" else "Every milestone is unlocked.",
                        color = Color(0xFFCFCAE8),
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                    LinearProgressIndicator(
                        progress = { ((stats.xp % 100) / 100f) },
                        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                        color = Violet
                    )
                }
            }
        }
        item {
            Spacer(Modifier.height(10.dp))
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant), shape = RoundedCornerShape(20.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = Mint)
                        Column(Modifier.padding(start = 12.dp).weight(1f)) {
                            Text("Optional screen awareness", fontWeight = FontWeight.Bold)
                            Text(
                                if (autoRunning) "Active — likely ad labels are counted locally." else "Manual counting stays available at all times.",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                        Switch(
                            checked = autoRunning,
                            onCheckedChange = {
                                if (!autoEnabled && it) onOpenAccessibility()
                                else {
                                    store.setAutoPaused(!it)
                                    onChanged()
                                }
                            }
                        )
                    }
                    if (!autoEnabled) {
                        OutlinedButton(onClick = onOpenAccessibility, modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) {
                            Text("Open Android accessibility settings")
                            Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.padding(start = 8.dp).size(16.dp))
                        }
                    } else {
                        Text(
                            "Relcow reads visible accessibility labels only. It does not capture screenshots, keystrokes, passwords, or private messages.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(top = 12.dp)
                        )
                    }
                }
            }
        }
        item {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF3A2530)), shape = RoundedCornerShape(18.dp), modifier = Modifier.padding(top = 10.dp)) {
                Text(
                    if (stats.today >= 50) "A good moment to pause. Review your progress or take a break." else "Awareness is the win — Relcow never asks you to keep watching.",
                    color = Color(0xFFFFB19E),
                    modifier = Modifier.padding(16.dp),
                    fontSize = 13.sp
                )
            }
        }
    }
}

@Composable
private fun SectionTitle(title: String, meta: String) {
    Row(
        Modifier.fillMaxWidth().padding(top = 26.dp, bottom = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(meta, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun StatCard(label: String, value: Int, color: Color, modifier: Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
    ) {
        Column(Modifier.padding(12.dp)) {
            Box(Modifier.fillMaxWidth().height(3.dp).background(color, RoundedCornerShape(99.dp)))
            Text("$value", fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 10.dp))
            Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

@Composable
private fun StatsScreen(modifier: Modifier, stats: RelcowStats) {
    val grouped = stats.events.groupBy { it.date }.entries.sortedByDescending { it.key }
    LazyColumn(modifier.fillMaxSize(), contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp)) {
        item {
            Text("Stats", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("A calmer view of your rhythm.", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 6.dp, bottom = 18.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatCard("TODAY", stats.today, Coral, Modifier.weight(1f))
                StatCard("WEEK", stats.week, Mint, Modifier.weight(1f))
                StatCard("MONTH", stats.month, Violet, Modifier.weight(1f))
            }
            SectionTitle("History", "LOCAL")
        }
        items(grouped) { (date, events) ->
            val count = events.sumOf { it.amount }
            Row(Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text(date, fontWeight = FontWeight.SemiBold)
                    Text("${events.count { it.source == "AUTO_AD" }} auto-detected · ${events.count { it.source == "MANUAL" }} manual", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                }
                Text("$count reels", color = Mint, fontWeight = FontWeight.Bold)
            }
            Divider()
        }
    }
}

@Composable
private fun FriendsScreen(modifier: Modifier, store: RelcowStore) {
    val context = LocalContext.current
    val code = store.shareCode()
    LazyColumn(modifier.fillMaxSize(), contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp)) {
        item {
            Text("Friends", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Challenges start with a code. Online identity can come later.", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 6.dp, bottom = 18.dp))
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(20.dp)) {
                Column(Modifier.padding(18.dp)) {
                    Text("YOUR LOCAL CODE", color = Mint, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Text(code, fontSize = 32.sp, fontWeight = FontWeight.Bold, letterSpacing = 3.sp, modifier = Modifier.padding(top = 10.dp))
                    Text("Share this code with a friend for a private commitment.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
                    Button(
                        onClick = {
                            context.startActivity(
                                Intent.createChooser(
                                    Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, "Join my Relcow awareness challenge with code $code")
                                    },
                                    "Share Relcow challenge"
                                )
                            )
                        },
                        modifier = Modifier.fillMaxWidth().padding(top = 14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Mint, contentColor = Midnight)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null)
                        Text("Share challenge code", modifier = Modifier.padding(start = 8.dp))
                    }
                }
            }
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant), shape = RoundedCornerShape(20.dp), modifier = Modifier.padding(top = 12.dp)) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.People, contentDescription = null, tint = Coral)
                    Column(Modifier.padding(start = 12.dp)) {
                        Text("Commitments", fontWeight = FontWeight.Bold)
                        Text("Create a shared target with a friend using the code above.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun CollectionScreen(modifier: Modifier, stats: RelcowStats) {
    val milestones = listOf(10, 25, 50, 100, 150, 200, 300, 500)
    LazyColumn(modifier.fillMaxSize(), contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp)) {
        item {
            Text("Collection", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("${milestones.count { stats.allTime >= it }} of ${milestones.size} milestones unlocked", color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 6.dp, bottom = 18.dp))
        }
        items(milestones) { milestone ->
            val unlocked = stats.allTime >= milestone
            Card(colors = CardDefaults.cardColors(containerColor = if (unlocked) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(18.dp), modifier = Modifier.padding(bottom = 10.dp)) {
                Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(52.dp).background(if (unlocked) Coral.copy(alpha = .2f) else MaterialTheme.colorScheme.surfaceVariant, CircleShape), contentAlignment = Alignment.Center) {
                        if (unlocked) Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Coral) else Icon(Icons.Default.Lock, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Column(Modifier.padding(start = 14.dp).weight(1f)) {
                        Text(if (unlocked) "Awareness crystal · $milestone" else "Locked collectible · $milestone", fontWeight = FontWeight.Bold)
                        Text(if (unlocked) "Unlocked from your local progress." else "Track ${milestone - stats.allTime} more reels to reveal it.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileScreen(
    modifier: Modifier,
    store: RelcowStore,
    profileName: String,
    onChanged: () -> Unit,
    onThemeChanged: () -> Unit,
    onReset: () -> Unit
) {
    var showReset by remember { mutableStateOf(false) }
    LazyColumn(modifier.fillMaxSize(), contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp)) {
        item {
            Text("Profile", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text(profileName, color = Mint, fontSize = 18.sp, modifier = Modifier.padding(top = 8.dp))
            SectionTitle("Preferences", "ON DEVICE")
            SettingRow("Appearance", if (store.isDarkTheme()) "Midnight" else "Daylight", Icons.Default.Settings) { onThemeChanged() }
            ToggleRow("Haptics", "A tiny pulse when you count", store.hapticsEnabled(), Icons.Default.PlayArrow) {
                store.setHapticsEnabled(it)
                onChanged()
            }
            ToggleRow("Reduced motion", "Keep transitions calm", store.reducedMotion(), Icons.Default.Pause) {
                store.setReducedMotion(it)
                onChanged()
            }
            SectionTitle("Privacy", "EXPLICIT")
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant), shape = RoundedCornerShape(18.dp)) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.Top) {
                    Icon(Icons.Default.Security, contentDescription = null, tint = Mint)
                    Text(
                        "Manual counts and auto-detected ad events stay local. The accessibility service is visible in Android Settings and can be turned off there at any time.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(start = 12.dp)
                    )
                }
            }
            OutlinedButton(onClick = { showReset = true }, modifier = Modifier.fillMaxWidth().padding(top = 18.dp)) {
                Icon(Icons.Default.DeleteOutline, contentDescription = null, tint = Coral)
                Text("Reset profile and data", color = Coral, modifier = Modifier.padding(start = 8.dp))
            }
            if (showReset) {
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF3A2530)), shape = RoundedCornerShape(18.dp), modifier = Modifier.padding(top = 12.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Reset everything?", fontWeight = FontWeight.Bold)
                        Text("This removes your local profile, counts, XP, and milestones.", color = Color(0xFFFFB19E), fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
                        Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.End) {
                            TextButton(onClick = { showReset = false }) { Text("Keep data") }
                            TextButton(onClick = onReset) { Text("Reset", color = Coral) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingRow(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Card(onClick = onClick, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(16.dp), modifier = Modifier.padding(bottom = 8.dp)) {
        Row(Modifier.fillMaxWidth().padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = Violet)
            Column(Modifier.padding(start = 12.dp).weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold)
                Text(value, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
            }
            Icon(Icons.Default.ArrowForward, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun ToggleRow(title: String, description: String, checked: Boolean, icon: androidx.compose.ui.graphics.vector.ImageVector, onCheckedChange: (Boolean) -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(16.dp), modifier = Modifier.padding(bottom = 8.dp)) {
        Row(Modifier.fillMaxWidth().padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = Coral)
            Column(Modifier.padding(start = 12.dp).weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold)
                Text(description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
            }
            Switch(checked = checked, onCheckedChange = onCheckedChange)
        }
    }
}