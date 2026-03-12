#!/usr/bin/env python3
"""
collect_usa_batters.py

Fetches 2023-2025 Statcast data for USA WBC batters via pybaseball,
computes zone stats, pitch type stats, velocity band stats,
then outputs TypeScript files directly.

Usage:
    source /Users/mksong/Documents/JavaScript/RealTimePitchTracker/.venv/bin/activate
    cd /Users/mksong/Documents/JavaScript/RealTimePitchTracker/NaverBaseballRelay/apps/wbc-catcher-game
    python scripts/collect_usa_batters.py

Output files (relative to wbc-catcher-game/):
    src/data/usaBatterProfiles.ts   - per-batter zone/pitchType stats
    src/data/usaVelocityBands.ts    - velocity band BA/SLG (USA batters only)
"""

import os
import sys
import math
import warnings
import traceback
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent.resolve()
APP_DIR = SCRIPT_DIR.parent  # wbc-catcher-game/
DATA_DIR = APP_DIR / "src" / "data"
CACHE_DIR = SCRIPT_DIR / "cache"

os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Batter registry
# ---------------------------------------------------------------------------
BATTERS = {
    "witt":           {"name": "Bobby Witt Jr.",         "nameKo": "바비 윗 주니어",      "mlbam_id": 677951, "bats": "R", "team": "USA"},
    "henderson":      {"name": "Gunnar Henderson",       "nameKo": "거너 헨더슨",         "mlbam_id": 683002, "bats": "L", "team": "USA"},
    "judge":          {"name": "Aaron Judge",            "nameKo": "애런 저지",           "mlbam_id": 592450, "bats": "R", "team": "USA"},
    "schwarber":      {"name": "Kyle Schwarber",         "nameKo": "카일 슈워버",         "mlbam_id": 656941, "bats": "L", "team": "USA"},
    "w_smith":        {"name": "Will Smith",             "nameKo": "윌 스미스",           "mlbam_id": 669257, "bats": "R", "team": "USA"},
    "anthony":        {"name": "Roman Anthony",          "nameKo": "로만 앤소니",         "mlbam_id": 697036, "bats": "L", "team": "USA"},
    "goldschmidt":    {"name": "Paul Goldschmidt",       "nameKo": "폴 골드슈미트",       "mlbam_id": 502671, "bats": "R", "team": "USA"},
    "clement":        {"name": "Ernie Clement",          "nameKo": "어니 클레멘트",       "mlbam_id": 676391, "bats": "R", "team": "USA"},
    "crow_armstrong": {"name": "Pete Crow-Armstrong",    "nameKo": "피트 크로우-암스트롱", "mlbam_id": 691718, "bats": "L", "team": "USA"},
}

DATA_START = "2023-04-01"
DATA_END   = "2025-10-31"

# ---------------------------------------------------------------------------
# Zone helpers
# ---------------------------------------------------------------------------
ALL_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]
STRIKE_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

SWING_DESCRIPTIONS = {
    "swinging_strike", "swinging_strike_blocked", "foul", "foul_tip",
    "foul_bunt", "hit_into_play", "hit_into_play_no_out",
    "hit_into_play_score", "missed_bunt", "bunt_foul_tip",
}
TAKE_DESCRIPTIONS = {
    "called_strike", "ball", "blocked_ball", "hit_by_pitch", "pitchout",
}
SWINGING_MISS_DESCRIPTIONS = {"swinging_strike", "swinging_strike_blocked"}

AB_EVENTS = {
    "single", "double", "triple", "home_run",
    "strikeout", "strikeout_double_play",
    "field_out", "force_out", "grounded_into_double_play",
    "double_play", "triple_play", "fielders_choice",
    "fielders_choice_out", "sac_fly", "sac_fly_double_play",
    "sac_bunt", "sac_bunt_double_play",
}

# ---------------------------------------------------------------------------
# Velocity bands (3 mph)
# ---------------------------------------------------------------------------
VELOCITY_BANDS = [
    "60-62", "63-65", "66-68", "69-71", "72-74", "75-77",
    "78-80", "81-83", "84-86", "87-89", "90-92", "93-95",
    "96-98", "99-101", "102-105",
]

def velocity_band(velo: float) -> str | None:
    """Return the band label for a given release speed, or None if out of range."""
    if pd.isna(velo):
        return None
    v = float(velo)
    if v < 60 or v > 105:
        return None
    for band in VELOCITY_BANDS:
        parts = band.split("-")
        lo, hi = int(parts[0]), int(parts[1])
        if lo <= v <= hi:
            return band
    return None

# ---------------------------------------------------------------------------
# League-average fallback profile (for batters with no/insufficient data)
# ---------------------------------------------------------------------------
LEAGUE_AVG_ZONE_STATS = {
    1:  {"wOBA": 0.380, "swingRate": 0.72, "whiffRate": 0.25, "contactRate": 0.75, "hrRate": 0.0500},
    2:  {"wOBA": 0.420, "swingRate": 0.80, "whiffRate": 0.20, "contactRate": 0.80, "hrRate": 0.0700},
    3:  {"wOBA": 0.360, "swingRate": 0.68, "whiffRate": 0.22, "contactRate": 0.78, "hrRate": 0.0450},
    4:  {"wOBA": 0.390, "swingRate": 0.75, "whiffRate": 0.22, "contactRate": 0.78, "hrRate": 0.0550},
    5:  {"wOBA": 0.430, "swingRate": 0.82, "whiffRate": 0.18, "contactRate": 0.82, "hrRate": 0.0800},
    6:  {"wOBA": 0.350, "swingRate": 0.70, "whiffRate": 0.20, "contactRate": 0.80, "hrRate": 0.0400},
    7:  {"wOBA": 0.310, "swingRate": 0.65, "whiffRate": 0.28, "contactRate": 0.72, "hrRate": 0.0300},
    8:  {"wOBA": 0.340, "swingRate": 0.70, "whiffRate": 0.25, "contactRate": 0.75, "hrRate": 0.0450},
    9:  {"wOBA": 0.290, "swingRate": 0.60, "whiffRate": 0.30, "contactRate": 0.70, "hrRate": 0.0250},
    11: {"wOBA": 0.320, "swingRate": 0.35, "whiffRate": 0.38, "contactRate": 0.62, "hrRate": 0.0300},
    12: {"wOBA": 0.280, "swingRate": 0.40, "whiffRate": 0.42, "contactRate": 0.58, "hrRate": 0.0200},
    13: {"wOBA": 0.260, "swingRate": 0.30, "whiffRate": 0.45, "contactRate": 0.55, "hrRate": 0.0150},
    14: {"wOBA": 0.260, "swingRate": 0.30, "whiffRate": 0.45, "contactRate": 0.55, "hrRate": 0.0150},
}

LEAGUE_AVG_PITCH_STATS = {
    "FF": {"ba": 0.250, "whiffRate": 0.230},
    "SI": {"ba": 0.255, "whiffRate": 0.190},
    "SL": {"ba": 0.220, "whiffRate": 0.320},
    "CU": {"ba": 0.215, "whiffRate": 0.330},
    "CH": {"ba": 0.230, "whiffRate": 0.290},
    "FC": {"ba": 0.240, "whiffRate": 0.250},
    "ST": {"ba": 0.210, "whiffRate": 0.360},
}

LEAGUE_AVG_VELOCITY = {
    "avgBA": 0.250, "avgSLG": 0.400,
    "bands": {b: {"ba": 0.250, "slg": 0.400} for b in VELOCITY_BANDS},
}

# ---------------------------------------------------------------------------
# Data fetching with cache
# ---------------------------------------------------------------------------
def fetch_batter_data(batter_key: str, mlbam_id: int) -> pd.DataFrame | None:
    """
    Fetch Statcast batter data from cache or pybaseball.
    Returns DataFrame or None if no data available.
    """
    cache_path = CACHE_DIR / f"{mlbam_id}.parquet"

    if cache_path.exists():
        print(f"  [cache] Loading {batter_key} ({mlbam_id}) from {cache_path.name}")
        try:
            df = pd.read_parquet(cache_path)
            print(f"  [cache] {len(df):,} pitches loaded")
            return df
        except Exception as e:
            print(f"  [cache] Read error: {e}. Re-fetching...")

    print(f"  [fetch] Downloading {batter_key} ({mlbam_id}) from pybaseball ...")
    try:
        from pybaseball import statcast_batter
        df = statcast_batter(DATA_START, DATA_END, mlbam_id)
        if df is None or len(df) == 0:
            print(f"  [warn] No data returned for {batter_key}")
            return None
        print(f"  [fetch] {len(df):,} pitches retrieved")
        df.to_parquet(cache_path, index=False)
        return df
    except Exception as e:
        print(f"  [error] Failed to fetch {batter_key}: {e}")
        traceback.print_exc()
        return None

# ---------------------------------------------------------------------------
# Stat computation helpers
# ---------------------------------------------------------------------------
def safe_div(num, denom, default=0.0):
    if denom == 0 or pd.isna(denom):
        return default
    return float(num) / float(denom)

def compute_zone_row(group: pd.DataFrame) -> dict:
    """Compute raw zone stats for a DataFrame slice (all pitches in one zone)."""
    n = len(group)
    if n == 0:
        return None

    # wOBA
    woba_df = group[group["woba_denom"].notna() & (group["woba_denom"] > 0)]
    woba = safe_div(woba_df["woba_value"].sum(), woba_df["woba_denom"].sum(), 0.0)

    # Swing / take
    is_swing = group["description"].isin(SWING_DESCRIPTIONS)
    is_take  = group["description"].isin(TAKE_DESCRIPTIONS)
    is_miss  = group["description"].isin(SWINGING_MISS_DESCRIPTIONS)

    n_swing = is_swing.sum()
    n_take  = is_take.sum()
    total   = n_swing + n_take

    swing_rate   = safe_div(n_swing, total)
    whiff_rate   = safe_div(is_miss.sum(), n_swing)
    contact_rate = 1.0 - whiff_rate if n_swing > 0 else 0.0

    # HR rate: HR events / AB events
    ab_mask = group["events"].isin(AB_EVENTS)
    hr_mask = group["events"] == "home_run"
    n_ab = ab_mask.sum()
    n_hr = hr_mask.sum()
    hr_rate = safe_div(n_hr, n_ab)

    return {
        "n": n,
        "wOBA": round(woba, 3),
        "swingRate": round(swing_rate, 3),
        "whiffRate": round(whiff_rate, 3),
        "contactRate": round(contact_rate, 3),
        "hrRate": round(hr_rate, 4),
    }

def compute_overall_zone_stats(df: pd.DataFrame) -> dict:
    """Compute overall (all zones) stats for shrinkage baseline."""
    return compute_zone_row(df)

def apply_shrinkage(zone_val: float, n: int, overall_val: float, k: int = 30) -> float:
    """Bayesian shrinkage toward overall average when sample is small."""
    return (n * zone_val + k * overall_val) / (n + k)

def compute_zones(df: pd.DataFrame) -> dict:
    """
    Compute zone stats for all 13 zones with Bayesian shrinkage.
    Returns dict mapping zone_int -> ZoneStats dict.
    """
    overall = compute_overall_zone_stats(df)
    if overall is None:
        return {}

    zone_stats = {}
    for zone in ALL_ZONES:
        g = df[df["zone"] == zone]
        raw = compute_zone_row(g)
        if raw is None:
            # No pitches in this zone: use overall with full shrinkage
            zone_stats[zone] = {
                "wOBA":        round(overall["wOBA"], 3),
                "swingRate":   round(overall["swingRate"], 3),
                "whiffRate":   round(overall["whiffRate"], 3),
                "contactRate": round(overall["contactRate"], 3),
                "hrRate":      round(overall["hrRate"], 4),
            }
            continue

        n = raw["n"]
        if n < 30:
            def shrink(field):
                return round(apply_shrinkage(raw[field], n, overall[field], k=30), 3)
            zone_stats[zone] = {
                "wOBA":        shrink("wOBA"),
                "swingRate":   shrink("swingRate"),
                "whiffRate":   shrink("whiffRate"),
                "contactRate": shrink("contactRate"),
                "hrRate":      round(apply_shrinkage(raw["hrRate"], n, overall["hrRate"], k=30), 4),
            }
        else:
            zone_stats[zone] = {
                "wOBA":        raw["wOBA"],
                "swingRate":   raw["swingRate"],
                "whiffRate":   raw["whiffRate"],
                "contactRate": raw["contactRate"],
                "hrRate":      raw["hrRate"],
            }
    return zone_stats

def compute_pitch_type_stats(df: pd.DataFrame) -> dict:
    """
    Compute BA and whiffRate per pitch_type with shrinkage (k=50 pitches).
    League baseline: BA=0.250, whiff=0.25
    """
    LEAGUE_BA    = 0.250
    LEAGUE_WHIFF = 0.250
    K = 50

    results = {}
    for pt, g in df.groupby("pitch_type"):
        if pd.isna(pt) or pt == "" or pt is None:
            continue

        n = len(g)

        # BA
        ab_mask  = g["events"].isin(AB_EVENTS)
        hit_mask = g["events"].isin({"single", "double", "triple", "home_run"})
        n_ab  = ab_mask.sum()
        n_hit = hit_mask.sum()
        ba_raw = safe_div(n_hit, n_ab, LEAGUE_BA)

        # whiff rate
        is_swing = g["description"].isin(SWING_DESCRIPTIONS)
        is_miss  = g["description"].isin(SWINGING_MISS_DESCRIPTIONS)
        n_swing = is_swing.sum()
        n_miss  = is_miss.sum()
        whiff_raw = safe_div(n_miss, n_swing, LEAGUE_WHIFF)

        if n < K:
            ba    = round((n * ba_raw    + K * LEAGUE_BA)    / (n + K), 3)
            whiff = round((n * whiff_raw + K * LEAGUE_WHIFF) / (n + K), 3)
        else:
            ba    = round(ba_raw, 3)
            whiff = round(whiff_raw, 3)

        results[pt] = {"ba": ba, "whiffRate": whiff}

    return results

def compute_velocity_bands(df: pd.DataFrame) -> dict:
    """
    Compute BA and SLG per 3-mph velocity band.
    Returns dict with 'avgBA', 'avgSLG', 'bands'.
    """
    df2 = df.copy()
    df2["vel_band"] = df2["release_speed"].apply(velocity_band)

    def band_stats(g):
        ab_mask  = g["events"].isin(AB_EVENTS)
        n_ab  = ab_mask.sum()
        n_1b  = (g["events"] == "single").sum()
        n_2b  = (g["events"] == "double").sum()
        n_3b  = (g["events"] == "triple").sum()
        n_hr  = (g["events"] == "home_run").sum()
        n_hit = n_1b + n_2b + n_3b + n_hr
        total_bases = n_1b + 2*n_2b + 3*n_3b + 4*n_hr
        ba  = round(safe_div(n_hit, n_ab), 3)
        slg = round(safe_div(total_bases, n_ab), 3)
        return ba, slg

    # Overall avg
    all_ba, all_slg = band_stats(df2)

    bands = {}
    for band in VELOCITY_BANDS:
        g = df2[df2["vel_band"] == band]
        if len(g) == 0:
            bands[band] = {"ba": all_ba, "slg": all_slg}
        else:
            ba, slg = band_stats(g)
            bands[band] = {"ba": ba, "slg": slg}

    return {"avgBA": round(all_ba, 3), "avgSLG": round(all_slg, 3), "bands": bands}

# ---------------------------------------------------------------------------
# Flavor text generator
# ---------------------------------------------------------------------------
ZONE_NAMES_KO = {
    1: "높은 안쪽(1번 존)",   2: "높은 가운데(2번 존)",   3: "높은 바깥쪽(3번 존)",
    4: "중간 안쪽(4번 존)",   5: "중앙(5번 존)",           6: "중간 바깥쪽(6번 존)",
    7: "낮은 안쪽(7번 존)",   8: "낮은 가운데(8번 존)",    9: "낮은 바깥쪽(9번 존)",
    11: "하이볼(11번 존)",    12: "로우볼(12번 존)",
    13: "왼쪽 유인구(13번 존)", 14: "오른쪽 유인구(14번 존)",
}

PITCH_NAMES_KO = {
    "FF": "포심 패스트볼", "SI": "싱커", "SL": "슬라이더",
    "CU": "커브", "CH": "체인지업", "FC": "컷패스트볼",
    "ST": "스위퍼", "FS": "스플리터", "KC": "너클커브",
    "EP": "엡구", "FO": "포크볼", "SC": "스크류볼",
    "CS": "슬로우커브", "KN": "너클볼", "PO": "피치아웃",
}

def generate_flavor_text(zone_stats: dict, pitch_type_stats: dict) -> str:
    """Generate Korean flavor text from computed stats."""
    # Find 2 weakest and 1 strongest strike zones by wOBA
    sz = {z: s for z, s in zone_stats.items() if z in STRIKE_ZONES}
    if not sz:
        return "데이터 부족으로 분석 불가."

    sorted_sz = sorted(sz.items(), key=lambda x: x[1]["wOBA"])
    weakest   = sorted_sz[:2]
    strongest = sorted_sz[-1]

    weak_names  = "과 ".join(ZONE_NAMES_KO.get(z, f"{z}번 존") for z, _ in weakest)
    strong_name = ZONE_NAMES_KO.get(strongest[0], f"{strongest[0]}번 존")

    # Pitch type most susceptible to (highest whiffRate)
    if pitch_type_stats:
        most_whiff = max(pitch_type_stats.items(), key=lambda x: x[1]["whiffRate"])
        pt_ko = PITCH_NAMES_KO.get(most_whiff[0], most_whiff[0])
        pitch_part = f"{pt_ko}에 헛스윙이 많다."
    else:
        pitch_part = ""

    text = f"{weak_names}에 약하다. {strong_name}은 위험 존. {pitch_part}".strip()
    return text

# ---------------------------------------------------------------------------
# Zone comment helper
# ---------------------------------------------------------------------------
def _zone_comment(zone: int) -> str:
    comments = {
        1: "high inside",  2: "high middle",   3: "high outside",
        4: "middle inside", 5: "dead center",  6: "middle outside",
        7: "low inside",   8: "low middle",    9: "low outside",
        11: "하이볼",       12: "로우볼",
        13: "왼쪽 유인구",  14: "오른쪽 유인구",
    }
    return comments.get(zone, "")

# ---------------------------------------------------------------------------
# TypeScript writers
# ---------------------------------------------------------------------------
def write_usa_batter_profiles(profiles: dict):
    """Write src/data/usaBatterProfiles.ts"""
    out_path = DATA_DIR / "usaBatterProfiles.ts"
    lines = []
    lines.append("import type { BatterProfile, Zone, ZoneStats } from './types';")
    lines.append("")
    lines.append("function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {")
    lines.append("  return { wOBA, swingRate, whiffRate, contactRate, hrRate };")
    lines.append("}")
    lines.append("")
    lines.append("export const USA_BATTER_PROFILES: Record<string, BatterProfile> = {")

    for key, meta in BATTERS.items():
        if key not in profiles:
            print(f"  [warn] No profile for {key}, skipping")
            continue

        profile    = profiles[key]
        zone_stats = profile["zones"]
        pitch_stats = profile["pitchTypeStats"]
        flavor     = profile["flavorText"]

        lines.append(f"  {key}: {{")
        lines.append(f"    id: '{key}',")
        lines.append(f"    name: '{meta['name']}',")
        lines.append(f"    nameKo: '{meta['nameKo']}',")
        lines.append(f"    bats: '{meta['bats']}',")
        lines.append(f"    team: 'USA',")
        lines.append(f"    flavorText: '{flavor}',")
        lines.append(f"    zones: {{")

        for zone in ALL_ZONES:
            zs = zone_stats.get(zone)
            if zs is None:
                continue
            comment = _zone_comment(zone)
            lines.append(
                f"      {zone}: z({zs['wOBA']}, {zs['swingRate']}, "
                f"{zs['whiffRate']}, {zs['contactRate']}, {zs['hrRate']}),  // {comment}"
            )

        lines.append(f"    }} as Record<Zone, ZoneStats>,")
        lines.append(f"    pitchTypeStats: {{")

        for pt, ps in sorted(pitch_stats.items()):
            lines.append(f"      {pt}: {{ ba: {ps['ba']}, whiffRate: {ps['whiffRate']} }},")

        lines.append(f"    }},")
        lines.append(f"  }},")
        lines.append("")

    lines.append("};")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[write] {out_path}")


def write_usa_velocity_bands(vel_profiles: dict):
    """Write src/data/usaVelocityBands.ts"""
    out_path = DATA_DIR / "usaVelocityBands.ts"
    lines = []
    lines.append("// Velocity band batting stats for USA WBC batters (3mph bands)")
    lines.append("// Source: pybaseball Statcast 2023-2025 seasons")
    lines.append("// Generated by scripts/collect_usa_batters.py")
    lines.append("")
    lines.append("import type { VelocityBandStats } from './types';")
    lines.append("")
    lines.append("export const USA_VELOCITY_BAND_DATA: Record<string, { avgBA: number; avgSLG: number; bands: Record<string, VelocityBandStats> }> = {")

    for key in BATTERS.keys():
        if key not in vel_profiles:
            print(f"  [warn] No velocity profile for {key}, skipping")
            continue
        vp = vel_profiles[key]
        lines.append(f"  {key}: {{")
        lines.append(f"    avgBA: {vp['avgBA']},")
        lines.append(f"    avgSLG: {vp['avgSLG']},")
        lines.append(f"    bands: {{")
        for band in VELOCITY_BANDS:
            bs = vp["bands"].get(band, {"ba": vp["avgBA"], "slg": vp["avgSLG"]})
            lines.append(f"      '{band}': {{ ba: {bs['ba']}, slg: {bs['slg']} }},")
        lines.append(f"    }},")
        lines.append(f"  }},")

    lines.append("};")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[write] {out_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("collect_usa_batters.py")
    print(f"Period: {DATA_START} to {DATA_END}")
    print(f"Batters: {', '.join(BATTERS.keys())}")
    print("=" * 60)

    profiles     = {}   # key -> {zones, pitchTypeStats, flavorText}
    vel_profiles = {}   # key -> velocity band profile

    for key, meta in BATTERS.items():
        mlbam_id = meta["mlbam_id"]
        print(f"\n[{key}] MLBAM={mlbam_id}  ({meta['name']})")
        df = fetch_batter_data(key, mlbam_id)

        if df is None or len(df) == 0:
            print(f"  [fallback] Using league-average profile for {key}")
            profiles[key] = {
                "zones":          LEAGUE_AVG_ZONE_STATS,
                "pitchTypeStats": LEAGUE_AVG_PITCH_STATS,
                "flavorText":     "데이터 부족 - 리그 평균 기반 프로필. 전체적으로 균형잡힌 타자.",
            }
            vel_profiles[key] = LEAGUE_AVG_VELOCITY
            continue

        # Ensure zone column is numeric
        df = df.copy()
        df["zone"] = pd.to_numeric(df["zone"], errors="coerce")

        print(f"  Computing zone stats ...")
        zone_stats = compute_zones(df)

        # If zone_stats is empty (shouldn't happen but guard anyway), fall back
        if not zone_stats:
            print(f"  [fallback] Zone computation returned empty — using league average")
            zone_stats = LEAGUE_AVG_ZONE_STATS

        print(f"  Computing pitch type stats ...")
        pitch_stats = compute_pitch_type_stats(df)
        if not pitch_stats:
            pitch_stats = LEAGUE_AVG_PITCH_STATS

        print(f"  Computing velocity bands ...")
        vel = compute_velocity_bands(df)
        vel_profiles[key] = vel

        flavor = generate_flavor_text(zone_stats, pitch_stats)
        print(f"  Flavor: {flavor}")

        profiles[key] = {
            "zones":          zone_stats,
            "pitchTypeStats": pitch_stats,
            "flavorText":     flavor,
        }

    print("\n[output] Writing TypeScript files ...")
    write_usa_batter_profiles(profiles)
    write_usa_velocity_bands(vel_profiles)

    print("\nDone.")


if __name__ == "__main__":
    main()
