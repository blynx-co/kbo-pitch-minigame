#!/usr/bin/env python3
"""
collect_kbo_batters.py

Collect KBO batter data from koreabaseball.com (public, no login required).
Generates simulated zone stats for the pitch-sequence game engine.

Usage:
    pip install requests beautifulsoup4
    python scripts/collect_kbo_batters.py [--team SSG] [--year 2026]

Output:
    src/data/kboBatterProfiles.ts
"""

import os
import sys
import re
import math
import json
import argparse
from pathlib import Path
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: pip install requests beautifulsoup4")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent.resolve()
APP_DIR = SCRIPT_DIR.parent
DATA_DIR = APP_DIR / "src" / "data"
os.makedirs(DATA_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# KBO team codes (koreabaseball.com)
# ---------------------------------------------------------------------------
TEAM_CODES = {
    "KT":  "KT",
    "SSG": "SS",
    "NC":  "NC",
    "삼성": "SM",
    "한화": "HH",
    "LG":  "LG",
    "키움": "WO",
    "두산": "OB",
    "롯데": "LT",
    "KIA": "HT",
}

TEAM_NAMES_KO = {
    "KT": "KT 위즈",
    "SS": "SSG 랜더스",
    "NC": "NC 다이노스",
    "SM": "삼성 라이온즈",
    "HH": "한화 이글스",
    "LG": "LG 트윈스",
    "WO": "키움 히어로즈",
    "OB": "두산 베어스",
    "LT": "롯데 자이언츠",
    "HT": "KIA 타이거즈",
}

# ---------------------------------------------------------------------------
# Zone simulation parameters
# ---------------------------------------------------------------------------
# 14-zone system: 1-9 strike zone, 11-14 shadow zones
# Based on typical MLB/KBO batter hot/cold zone patterns

# wOBA multipliers by zone (relative to overall)
# Zone 5 (center) is hottest, corners are coldest
ZONE_WOBA_MULT = {
    1: 0.85, 2: 1.05, 3: 0.80,   # high: inside, middle, outside
    4: 0.95, 5: 1.20, 6: 0.90,   # mid: inside, center, outside
    7: 0.80, 8: 0.95, 9: 0.75,   # low: inside, middle, outside
    11: 0.45, 12: 0.40, 13: 0.30, 14: 0.25,  # shadow zones
}

# Base swing rates by zone
ZONE_SWING_BASE = {
    1: 0.58, 2: 0.72, 3: 0.55,
    4: 0.68, 5: 0.78, 6: 0.65,
    7: 0.55, 8: 0.62, 9: 0.48,
    11: 0.22, 12: 0.28, 13: 0.18, 14: 0.15,
}

# Base whiff rates by zone
ZONE_WHIFF_BASE = {
    1: 0.22, 2: 0.15, 3: 0.25,
    4: 0.14, 5: 0.10, 6: 0.18,
    7: 0.20, 8: 0.16, 9: 0.28,
    11: 0.35, 12: 0.40, 13: 0.48, 14: 0.52,
}

# HR rate distribution by zone (relative weight)
ZONE_HR_WEIGHT = {
    1: 0.08, 2: 0.14, 3: 0.06,
    4: 0.10, 5: 0.18, 6: 0.08,
    7: 0.04, 8: 0.08, 9: 0.03,
    11: 0.03, 12: 0.02, 13: 0.01, 14: 0.01,
}

# KBO league average pitch type stats (batting average and whiff rate)
KBO_PITCH_TYPE_LEAGUE = {
    "FF": {"ba": 0.275, "whiffRate": 0.18},
    "SI": {"ba": 0.280, "whiffRate": 0.15},
    "FC": {"ba": 0.260, "whiffRate": 0.22},
    "SL": {"ba": 0.230, "whiffRate": 0.32},
    "CU": {"ba": 0.220, "whiffRate": 0.30},
    "CH": {"ba": 0.240, "whiffRate": 0.30},
    "FS": {"ba": 0.215, "whiffRate": 0.35},
    "ST": {"ba": 0.225, "whiffRate": 0.33},
    "KC": {"ba": 0.225, "whiffRate": 0.30},
}

# Zone names for flavor text
ZONE_NAMES_KO = {
    1: "높은 안쪽(1번 존)",    2: "높은 가운데(2번 존)",   3: "높은 바깥쪽(3번 존)",
    4: "중간 안쪽(4번 존)",    5: "중앙(5번 존)",          6: "중간 바깥쪽(6번 존)",
    7: "낮은 안쪽(7번 존)",    8: "낮은 가운데(8번 존)",   9: "낮은 바깥쪽(9번 존)",
    11: "하이볼(11번 존)",     12: "로우볼(12번 존)",
    13: "왼쪽 유인구(13번 존)", 14: "오른쪽 유인구(14번 존)",
}

PITCH_NAMES_KO = {
    "FF": "포심", "SI": "싱커", "SL": "슬라이더",
    "CU": "커브", "CH": "체인지업", "FC": "커터",
    "ST": "스위퍼", "FS": "스플리터", "KC": "너클커브",
}

# Bats side (좌타/우타/스위치) label regex patterns
BATS_PATTERNS = {
    "좌타": "L",
    "우타": "R",
    "양타": "S",
    "스위치": "S",
    "Left": "L",
    "Right": "R",
    "Switch": "S",
}


# ---------------------------------------------------------------------------
# Scraper for koreabaseball.com
# ---------------------------------------------------------------------------
BASE_URL = "https://www.koreabaseball.com"


def fetch_page(url: str) -> BeautifulSoup:
    """Fetch a page and return BeautifulSoup object."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
    }
    resp = requests.get(url, headers=headers, timeout=30)
    resp.encoding = "utf-8"
    return BeautifulSoup(resp.text, "html.parser")


def scrape_hitter_list(year: int = 2026, team_code: str = "") -> list:
    """
    Scrape KBO hitter stats from koreabaseball.com list pages.
    Returns list of dicts with batter stats.
    """
    batters = {}

    # Page 1: Basic stats (AVG, PA, AB, H, HR, etc.)
    url1 = f"{BASE_URL}/Record/Player/HitterBasic/Basic1.aspx"
    print(f"Fetching Basic1 stats...")
    soup1 = fetch_page(url1)
    parse_hitter_table(soup1, batters, [
        "rank", "name", "team", "AVG", "G", "PA", "AB",
        "R", "H", "2B", "3B", "HR", "TB", "RBI", "SAC", "SF",
    ])

    # Page 2: OBP, SLG, OPS, BB, SO
    url2 = f"{BASE_URL}/Record/Player/HitterBasic/Basic2.aspx"
    print(f"Fetching Basic2 stats...")
    soup2 = fetch_page(url2)
    parse_hitter_table(soup2, batters, [
        "rank", "name", "team", "AVG", "BB", "IBB", "HBP",
        "SO", "GDP", "SLG", "OBP", "OPS", "MH", "RISP", "PH_BA",
    ])

    # Page 3: Detail stats (GO/AO, BB/K, ISOP, etc.)
    url3 = f"{BASE_URL}/Record/Player/HitterBasic/Detail1.aspx"
    print(f"Fetching Detail1 stats...")
    soup3 = fetch_page(url3)
    parse_hitter_table(soup3, batters, [
        "rank", "name", "team", "AVG", "XBH", "GO", "AO",
        "GO_AO", "GW_RBI", "BB_K", "P_PA", "ISOP", "XR", "GPA",
    ])

    result = list(batters.values())
    print(f"  -> {len(result)} batters scraped")
    return result


def parse_hitter_table(soup: BeautifulSoup, batters: dict, columns: list):
    """Parse a hitter stats table and merge into batters dict."""
    # Find the main stats table
    table = soup.find("table", class_="tData")
    if not table:
        tables = soup.find_all("table")
        for t in tables:
            if t.find("th"):
                table = t
                break

    if not table:
        print("  WARNING: Could not find stats table")
        return

    rows = table.find_all("tr")
    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 4:
            continue

        # Extract player name and link
        name_cell = cells[1] if len(cells) > 1 else None
        if name_cell is None:
            continue

        name_link = name_cell.find("a")
        player_name = name_cell.get_text(strip=True)
        player_id = None

        if name_link and "playerId" in str(name_link.get("href", "")):
            href = name_link["href"]
            match = re.search(r"playerId=(\d+)", href)
            if match:
                player_id = match.group(1)

        if not player_name or player_name == "":
            continue

        # Use name as key for merging
        key = player_name
        if key not in batters:
            batters[key] = {"name": player_name, "playerId": player_id}

        # Parse each column value
        for i, col_name in enumerate(columns):
            if i >= len(cells):
                break
            if col_name in ("rank", "name"):
                continue

            value = cells[i].get_text(strip=True)
            if col_name == "team":
                batters[key]["team"] = value
            else:
                # Try to parse as number
                try:
                    if "." in value:
                        batters[key][col_name] = float(value)
                    else:
                        batters[key][col_name] = int(value)
                except (ValueError, TypeError):
                    batters[key][col_name] = value


def scrape_player_detail(player_id: str) -> dict:
    """Scrape individual player page for bats side info."""
    url = f"{BASE_URL}/Record/Player/HitterDetail/Basic.aspx?playerId={player_id}"
    soup = fetch_page(url)

    info = {}
    # Look for bats info in player profile
    text = soup.get_text()
    for pattern, code in BATS_PATTERNS.items():
        if pattern in text:
            info["bats"] = code
            break

    return info


# ---------------------------------------------------------------------------
# Zone stat simulation
# ---------------------------------------------------------------------------
def simulate_zone_stats(batter: dict) -> dict:
    """
    Generate 14-zone stats from a batter's overall stats.
    Uses AVG, OBP, SLG, OPS, BB, SO, PA, HR, GO/AO, ISOP.
    """
    avg = batter.get("AVG", 0.260)
    obp = batter.get("OBP", 0.330)
    slg = batter.get("SLG", 0.400)
    ops = batter.get("OPS", 0.730)
    pa = batter.get("PA", 400)
    ab = batter.get("AB", 350)
    hr = batter.get("HR", 10)
    bb = batter.get("BB", 30)
    so = batter.get("SO", 80)
    go_ao = batter.get("GO_AO", 1.0) if isinstance(batter.get("GO_AO"), (int, float)) else 1.0
    isop = batter.get("ISOP", 0.140) if isinstance(batter.get("ISOP"), (int, float)) else 0.140

    # Derived metrics
    bb_rate = bb / pa if pa > 0 else 0.08
    k_rate = so / pa if pa > 0 else 0.18
    hr_rate_overall = hr / ab if ab > 0 else 0.03
    # Approximate wOBA from OBP/SLG
    woba_overall = obp * 0.7 + slg * 0.3  # rough approximation

    # Plate discipline factor (0.5 = undisciplined, 1.5 = very disciplined)
    discipline = min(1.5, max(0.5, bb_rate / k_rate)) if k_rate > 0 else 1.0

    # Power factor (higher ISOP = more power)
    power = isop / 0.140  # normalized to league avg

    zones = {}
    for zone_id in [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]:
        # wOBA
        woba = woba_overall * ZONE_WOBA_MULT[zone_id]
        woba = max(0.05, min(0.65, woba))

        # Swing rate (adjusted by discipline)
        swing = ZONE_SWING_BASE[zone_id]
        if zone_id >= 11:
            # Shadow zones: disciplined batters swing less
            swing *= (2.0 - discipline * 0.7)
        swing = max(0.05, min(0.95, swing))

        # Whiff rate (adjusted by K rate)
        whiff = ZONE_WHIFF_BASE[zone_id]
        k_factor = k_rate / 0.18  # normalized to KBO avg
        whiff *= k_factor
        whiff = max(0.03, min(0.65, whiff))

        # Contact rate
        contact = max(0.0, 1.0 - whiff)

        # HR rate (adjusted by power)
        hr_r = hr_rate_overall * ZONE_HR_WEIGHT[zone_id] / 0.08  # normalized
        hr_r *= power
        hr_r = max(0.0, min(0.20, hr_r))

        zones[zone_id] = {
            "wOBA": round(woba, 3),
            "swingRate": round(swing, 3),
            "whiffRate": round(whiff, 3),
            "contactRate": round(contact, 3),
            "hrRate": round(hr_r, 4),
        }

    return zones


def simulate_pitch_type_stats(batter: dict) -> dict:
    """
    Generate pitch-type stats from batter's overall profile.
    High-K batters struggle more vs breaking balls.
    """
    avg = batter.get("AVG", 0.260)
    so = batter.get("SO", 80)
    pa = batter.get("PA", 400)
    k_rate = so / pa if pa > 0 else 0.18

    # Batter quality multiplier (1.0 = average)
    quality = avg / 0.265  # KBO league avg

    # K-rate factor for whiff adjustment
    k_factor = k_rate / 0.18

    stats = {}
    for pitch_code, league in KBO_PITCH_TYPE_LEAGUE.items():
        # BA: adjust by batter quality
        # Fastballs: more quality-dependent, breaking balls: less
        if pitch_code in ("FF", "SI", "FC"):
            ba = league["ba"] * quality
        else:
            ba = league["ba"] * (quality * 0.7 + 0.3)

        # Whiff: adjust by K-rate
        if pitch_code in ("FF", "SI"):
            whiff = league["whiffRate"] * k_factor * 0.8
        else:
            whiff = league["whiffRate"] * k_factor

        stats[pitch_code] = {
            "ba": round(max(0.100, min(0.400, ba)), 3),
            "whiffRate": round(max(0.05, min(0.55, whiff)), 3),
        }

    return stats


def generate_flavor_text(zones: dict, pitch_stats: dict) -> str:
    """Generate Korean flavor text from simulated stats."""
    strike_zones = {z: s for z, s in zones.items() if z <= 9}
    if not strike_zones:
        return ""

    sorted_sz = sorted(strike_zones.items(), key=lambda x: x[1]["wOBA"])
    weakest = sorted_sz[:2]
    strongest = sorted_sz[-1]

    weak_names = "과 ".join(ZONE_NAMES_KO.get(z, f"{z}번 존") for z, _ in weakest)
    strong_name = ZONE_NAMES_KO.get(strongest[0], f"{strongest[0]}번 존")

    # Highest whiff pitch type
    if pitch_stats:
        most_whiff = max(pitch_stats.items(), key=lambda x: x[1]["whiffRate"])
        pt_ko = PITCH_NAMES_KO.get(most_whiff[0], most_whiff[0])
        pitch_part = f"{pt_ko}에 헛스윙이 많다."
    else:
        pitch_part = ""

    return f"{weak_names}에 약하다. {strong_name}은 위험 존. {pitch_part}".strip()


def make_batter_id(name: str) -> str:
    """Generate a URL-safe ID from Korean name."""
    # Simple romanization-style ID
    return re.sub(r"[^a-zA-Z0-9가-힣]", "", name).lower()


# ---------------------------------------------------------------------------
# TypeScript writer
# ---------------------------------------------------------------------------
def write_ts(batters: list, team_filter: str = ""):
    """Write src/data/kboBatterProfiles.ts"""
    out_path = DATA_DIR / "kboBatterProfiles.ts"

    lines = []
    lines.append("import type { BatterProfile, Zone, ZoneStats } from './types';")
    lines.append("")
    lines.append("function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {")
    lines.append("  return { wOBA, swingRate, whiffRate, contactRate, hrRate };")
    lines.append("}")
    lines.append("")
    lines.append("export const KBO_BATTER_PROFILES: Record<string, BatterProfile> = {")

    for batter in batters:
        name = batter["name"]
        team = batter.get("team", "KBO")
        bats = batter.get("bats", "R")
        bid = make_batter_id(name)

        zones = simulate_zone_stats(batter)
        pitch_stats = simulate_pitch_type_stats(batter)
        flavor = generate_flavor_text(zones, pitch_stats)

        lines.append(f"  {bid}: {{")
        lines.append(f"    id: '{bid}',")
        lines.append(f"    name: '{name}',")
        lines.append(f"    nameKo: '{name}',")
        lines.append(f"    bats: '{bats}',")
        lines.append(f"    team: '{team}',")
        lines.append(f"    flavorText: '{flavor}',")
        lines.append(f"    zones: {{")

        zone_comments = {
            1: "high inside", 2: "high middle", 3: "high outside",
            4: "middle inside", 5: "dead center", 6: "middle outside",
            7: "low inside", 8: "low middle", 9: "low outside",
            11: "하이볼", 12: "로우볼", 13: "왼쪽 유인구", 14: "오른쪽 유인구",
        }

        for zone_id in [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]:
            zs = zones[zone_id]
            comment = zone_comments.get(zone_id, "")
            lines.append(
                f"      {zone_id}: z({zs['wOBA']}, {zs['swingRate']}, "
                f"{zs['whiffRate']}, {zs['contactRate']}, {zs['hrRate']}),  "
                f"// {comment}"
            )

        lines.append(f"    }} as Record<Zone, ZoneStats>,")
        lines.append(f"    pitchTypeStats: {{")

        for code in sorted(pitch_stats.keys()):
            ps = pitch_stats[code]
            lines.append(f"      {code}: {{ ba: {ps['ba']}, whiffRate: {ps['whiffRate']} }},")

        lines.append(f"    }},")
        lines.append(f"  }},")
        lines.append("")

    lines.append("};")
    lines.append("")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\nWrote {out_path} ({len(batters)} batters)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Collect KBO batter data")
    parser.add_argument("--team", default="", help="Team filter (e.g., SSG, LG, KIA)")
    parser.add_argument("--year", type=int, default=2026, help="Season year")
    parser.add_argument("--top", type=int, default=15, help="Number of top batters to include")
    args = parser.parse_args()

    print("=" * 60)
    print("  KBO Batter Data Collector")
    print("  Source: koreabaseball.com (public)")
    print("=" * 60)

    # Scrape hitter stats
    all_batters = scrape_hitter_list(year=args.year)

    if not all_batters:
        print("ERROR: No batters scraped. Check network connection.")
        sys.exit(1)

    # Filter by team if specified
    if args.team:
        team_code = TEAM_CODES.get(args.team, args.team)
        filtered = [b for b in all_batters if b.get("team") == args.team]
        if not filtered:
            # Try matching by team code
            filtered = [b for b in all_batters if team_code in str(b.get("team", ""))]
        if filtered:
            all_batters = filtered
            print(f"\nFiltered to {len(all_batters)} batters from {args.team}")
        else:
            print(f"\nWARN: No batters found for team '{args.team}', using all batters")

    # Sort by OPS (or AVG as fallback) and take top N
    all_batters.sort(
        key=lambda x: x.get("OPS", x.get("AVG", 0)),
        reverse=True,
    )
    selected = all_batters[:args.top]

    print(f"\nSelected {len(selected)} batters:")
    for b in selected:
        name = b.get("name", "?")
        team = b.get("team", "?")
        avg = b.get("AVG", 0)
        ops = b.get("OPS", 0)
        print(f"  {name:8s} ({team:4s})  AVG={avg:.3f}  OPS={ops:.3f}")

    # Try to get bats side from detail pages
    for batter in selected:
        pid = batter.get("playerId")
        if pid:
            try:
                detail = scrape_player_detail(pid)
                if "bats" in detail:
                    batter["bats"] = detail["bats"]
            except Exception:
                pass

        # Default to R if unknown
        if "bats" not in batter:
            batter["bats"] = "R"

    # Generate TypeScript
    write_ts(selected, team_filter=args.team)

    print("\nDone! Zone stats are simulated from overall batting stats.")
    print("For more accurate data, consider using Statcast-equivalent")
    print("tracking data if available from KBO Trackman system.")


if __name__ == "__main__":
    main()
