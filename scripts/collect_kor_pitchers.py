"""
Collect Korean PITCHER data from WBC 2026 games.
Fetches from MLB Statcast API - the fielding half (when Korea pitches).
"""
import requests
import json
import time
from collections import defaultdict

GAMES = [
    {"gamePk": 788115, "label": "vs CZE"},
    {"gamePk": 788118, "label": "vs JPN"},
    {"gamePk": 788113, "label": "vs TPE"},
    {"gamePk": 788112, "label": "vs AUS"},
]
KOR_TEAM_ID = 1171
BASE_URL = "https://statsapi.mlb.com"

pitcher_stats = defaultdict(lambda: {
    "pitches": 0,
    "games": set(),
    "hand": "",
    "types": defaultdict(lambda: {"count": 0, "speeds": []}),
})

for game in GAMES:
    print(f"Fetching {game['label']} (gamePk={game['gamePk']})...")
    try:
        resp = requests.get(f"{BASE_URL}/api/v1.1/game/{game['gamePk']}/feed/live", timeout=30)
        data = resp.json()

        teams = data.get("gameData", {}).get("teams", {})
        home_id = teams.get("home", {}).get("id")
        # Korea PITCHING half = opposite of Korea batting half
        kor_pitch_half = "top" if home_id == KOR_TEAM_ID else "bottom"

        all_plays = data.get("liveData", {}).get("plays", {}).get("allPlays", [])
        game_pitch_count = 0

        for play in all_plays:
            about = play.get("about", {})
            half_inning = about.get("halfInning")
            if half_inning != kor_pitch_half:
                continue

            matchup = play.get("matchup", {})
            pitcher_name = matchup.get("pitcher", {}).get("fullName", "Unknown")
            pitcher_hand = matchup.get("pitchHand", {}).get("code", "R")

            for event in play.get("playEvents", []):
                if not event.get("isPitch"):
                    continue
                pitch_data = event.get("pitchData", {})
                details = event.get("details", {})
                pitch_type = details.get("type", {})
                coords = pitch_data.get("coordinates", {})

                if coords.get("vX0") is None:
                    continue

                pitch_code = pitch_type.get("code", "UN")
                start_speed = pitch_data.get("startSpeed", 0)

                ps = pitcher_stats[pitcher_name]
                ps["pitches"] += 1
                ps["games"].add(game["label"])
                ps["hand"] = pitcher_hand
                ps["types"][pitch_code]["count"] += 1
                if start_speed:
                    ps["types"][pitch_code]["speeds"].append(start_speed)
                game_pitch_count += 1

        print(f"  -> {game_pitch_count} pitches by KOR pitchers")
    except Exception as e:
        print(f"  ERROR: {e}")
    time.sleep(1)

print(f"\n{'='*80}")
print("Korean Pitcher WBC 2026 Pitch Data Summary")
print(f"{'='*80}")

for name, stats in sorted(pitcher_stats.items(), key=lambda x: -x[1]["pitches"]):
    games_str = ", ".join(sorted(stats["games"]))
    marker = ">>> " if stats["pitches"] >= 30 else "    "
    print(f"{marker}{name} ({stats['hand']}) - {stats['pitches']} pitches [{games_str}]")
    for code, t in sorted(stats["types"].items(), key=lambda x: -x[1]["count"]):
        avg_spd = sum(t["speeds"]) / len(t["speeds"]) if t["speeds"] else 0
        min_spd = min(t["speeds"]) if t["speeds"] else 0
        max_spd = max(t["speeds"]) if t["speeds"] else 0
        print(f"       {code:>3}: {t['count']:>3}x  avg {avg_spd:.1f} mph  ({min_spd:.1f}-{max_spd:.1f})")

total = sum(s["pitches"] for s in pitcher_stats.values())
over30 = [n for n, s in pitcher_stats.items() if s["pitches"] >= 30]
print(f"\n{'─'*80}")
print(f"Total: {len(pitcher_stats)} pitchers, {total} pitches")
print(f"30+ pitches: {len(over30)} pitchers -> {', '.join(over30)}")
