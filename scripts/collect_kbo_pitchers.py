#!/usr/bin/env python3
"""
collect_kbo_pitchers.py

Collect KBO pitcher pitch-type data from statiz.co.kr (login required).
Uses Selenium for browser automation.

Usage:
    pip install selenium webdriver-manager beautifulsoup4
    python scripts/collect_kbo_pitchers.py

The script will:
  1. Open Chrome and navigate to statiz.co.kr login page
  2. Wait for you to log in manually (30 seconds)
  3. Scrape pitch-type data for each pitcher in PITCHERS registry
  4. Output src/data/kboPitcherProfiles.ts
"""

import os
import sys
import json
import time
import re
from pathlib import Path
from collections import OrderedDict

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent.resolve()
APP_DIR = SCRIPT_DIR.parent
DATA_DIR = APP_DIR / "src" / "data"
os.makedirs(DATA_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# KBO Pitcher registry
# Key: internal ID for the game
# p_no: statiz.co.kr player number (from URL /player/?m=pitch_type&p_no=XXXX)
# To find p_no: search the pitcher on statiz.co.kr and check the URL
# ---------------------------------------------------------------------------
PITCHERS = [
    {
        "id": "an-woo-jin",
        "name": "Woo-Jin An",
        "nameKo": "안우진",
        "hand": "R",
        "team": "KIA",
        "style": "KBO 에이스",
        "description": "KBO 대표 에이스. 최고구속 155km/h. 포심+슬라이더+체인지업 삼박자.",
        "p_no": 14033,  # statiz player ID
    },
    {
        "id": "go-woo-suk",
        "name": "Woo-Suk Go",
        "nameKo": "고우석",
        "hand": "R",
        "team": "LG",
        "style": "마무리 투수",
        "description": "국가대표 마무리. 강속구와 슬라이더 조합.",
        "p_no": 14180,
    },
    {
        "id": "ryu-hyun-jin",
        "name": "Hyun-Jin Ryu",
        "nameKo": "류현진",
        "hand": "L",
        "team": "한화",
        "style": "베테랑 좌완",
        "description": "MLB 출신 베테랑. 포심+커터+체인지업+커브 다양한 구종.",
        "p_no": 10371,
    },
    {
        "id": "kim-kwang-hyun",
        "name": "Kwang-Hyun Kim",
        "nameKo": "김광현",
        "hand": "L",
        "team": "SSG",
        "style": "레전드 좌완",
        "description": "KBO 통산 최다승 좌완. 커맨드와 체인지업이 핵심.",
        "p_no": 10059,
    },
    {
        "id": "so-hyeong-jun",
        "name": "Hyeong-Jun So",
        "nameKo": "소형준",
        "hand": "R",
        "team": "NC",
        "style": "선발 에이스",
        "description": "싱커+커터+체인지업. 그라운드볼 유도 장인.",
        "p_no": 14181,
    },
]

# ---------------------------------------------------------------------------
# Pitch code mapping (Korean → MLB pitch code)
# ---------------------------------------------------------------------------
PITCH_CODE_MAP = {
    "포심":     "FF",
    "포심패스트볼": "FF",
    "투심":     "SI",
    "투심패스트볼": "SI",
    "싱커":     "SI",
    "커터":     "FC",
    "컷패스트볼":  "FC",
    "슬라이더":   "SL",
    "커브":     "CU",
    "체인지업":   "CH",
    "스플리터":   "FS",
    "포크":     "FS",
    "포크볼":    "FS",
    "스위퍼":    "ST",
    "너클커브":   "KC",
    "너클볼":    "KN",
    "스크류볼":   "SC",
}

PITCH_NAME_EN = {
    "FF": "Four-Seam",
    "SI": "Sinker",
    "FC": "Cutter",
    "SL": "Slider",
    "CU": "Curveball",
    "CH": "Changeup",
    "FS": "Splitter",
    "ST": "Sweeper",
    "KC": "Knuckle Curve",
    "KN": "Knuckleball",
    "SC": "Screwball",
}

PITCH_NAME_KO = {
    "FF": "포심",
    "SI": "싱커",
    "FC": "커터",
    "SL": "슬라이더",
    "CU": "커브",
    "CH": "체인지업",
    "FS": "스플리터",
    "ST": "스위퍼",
    "KC": "너클커브",
    "KN": "너클볼",
    "SC": "스크류볼",
}

PITCH_MOVEMENT = {
    "FF": "직선 궤도",
    "SI": "횡변화 + 하강",
    "FC": "살짝 가로",
    "SL": "가로 변화",
    "CU": "큰 낙차",
    "CH": "속도 차 + 낙차",
    "FS": "급격한 낙차",
    "ST": "큰 가로 변화",
    "KC": "큰 종 변화",
    "KN": "불규칙 변화",
    "SC": "역방향 변화",
}


def kmh_to_mph(kmh: float) -> int:
    """Convert km/h to mph, rounded to nearest integer."""
    return round(kmh * 0.621371)


# ---------------------------------------------------------------------------
# Selenium scraper
# ---------------------------------------------------------------------------
def scrape_statiz(pitchers: list) -> dict:
    """
    Scrape pitch-type data from statiz.co.kr using Selenium.
    Returns dict: {pitcher_id: [{"code": "FF", "avgSpeed": 95, ...}, ...]}
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from webdriver_manager.chrome import ChromeDriverManager
        from bs4 import BeautifulSoup
    except ImportError:
        print("ERROR: Required packages not installed.")
        print("  pip install selenium webdriver-manager beautifulsoup4")
        sys.exit(1)

    options = Options()
    # Run in headed mode so user can log in manually
    options.add_argument("--window-size=1200,900")

    print("Launching Chrome...")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )

    # Step 1: Navigate to login page
    driver.get("https://statiz.co.kr/member/?m=login")
    print("\n" + "=" * 60)
    print("  Please log in to statiz.co.kr in the browser window.")
    print("  You have 60 seconds to complete login.")
    print("=" * 60 + "\n")

    # Wait for login (check if URL changes away from login page)
    for i in range(60):
        time.sleep(1)
        current_url = driver.current_url
        if "login" not in current_url:
            print(f"  Login detected! (redirected to {current_url})")
            break
        if i % 10 == 9:
            print(f"  Waiting... ({60 - i - 1}s remaining)")
    else:
        # Check if still on login page
        if "login" in driver.current_url:
            print("  WARNING: Login may not have completed. Continuing anyway...")

    time.sleep(2)  # Brief pause after login

    # Step 2: Scrape each pitcher's pitch type page
    results = {}
    for pitcher in pitchers:
        p_no = pitcher["p_no"]
        name = pitcher["nameKo"]
        pid = pitcher["id"]

        url = f"https://statiz.co.kr/player/?m=pitch_type&p_no={p_no}"
        print(f"\nFetching {name} (p_no={p_no})...")
        driver.get(url)
        time.sleep(3)  # Wait for page load

        try:
            soup = BeautifulSoup(driver.page_source, "html.parser")

            # Look for pitch type tables
            # statiz typically uses <table> with pitch type rows
            tables = soup.find_all("table")
            pitch_data = []

            for table in tables:
                headers = []
                for th in table.find_all("th"):
                    headers.append(th.get_text(strip=True))

                # Look for table with pitch type info
                # Common headers: 구종, 비율, 구속, 최고구속, etc.
                header_text = " ".join(headers).lower()
                has_pitch_info = any(kw in header_text for kw in [
                    "구종", "비율", "구속", "속도", "pitch",
                ])

                if not has_pitch_info or len(headers) < 2:
                    continue

                print(f"  Found table with headers: {headers}")

                # Find column indices
                col_type = None
                col_speed = None
                col_max_speed = None
                col_ratio = None

                for i, h in enumerate(headers):
                    h_lower = h.lower()
                    if "구종" in h or "pitch" in h_lower:
                        col_type = i
                    elif "평균" in h and "구속" in h:
                        col_speed = i
                    elif "구속" in h and col_speed is None:
                        col_speed = i
                    elif "최고" in h and "구속" in h:
                        col_max_speed = i
                    elif "비율" in h or "%" in h:
                        col_ratio = i

                if col_type is None:
                    continue

                rows = table.find_all("tr")[1:]  # Skip header row
                for row in rows:
                    cells = row.find_all(["td", "th"])
                    if len(cells) <= col_type:
                        continue

                    pitch_name_raw = cells[col_type].get_text(strip=True)
                    if not pitch_name_raw:
                        continue

                    # Map Korean pitch name to code
                    code = None
                    for ko_name, pitch_code in PITCH_CODE_MAP.items():
                        if ko_name in pitch_name_raw:
                            code = pitch_code
                            break

                    if code is None:
                        print(f"    Unknown pitch type: '{pitch_name_raw}' - skipping")
                        continue

                    # Extract speed (km/h → mph)
                    avg_speed_mph = 0
                    if col_speed is not None and col_speed < len(cells):
                        speed_text = cells[col_speed].get_text(strip=True)
                        speed_match = re.search(r"[\d.]+", speed_text)
                        if speed_match:
                            speed_val = float(speed_match.group())
                            # If > 50, likely km/h; convert to mph
                            if speed_val > 50:
                                avg_speed_mph = kmh_to_mph(speed_val)
                            else:
                                avg_speed_mph = round(speed_val)

                    # Extract usage ratio
                    ratio = 0.0
                    if col_ratio is not None and col_ratio < len(cells):
                        ratio_text = cells[col_ratio].get_text(strip=True)
                        ratio_match = re.search(r"[\d.]+", ratio_text)
                        if ratio_match:
                            ratio = float(ratio_match.group())

                    pitch_data.append({
                        "code": code,
                        "name": PITCH_NAME_EN.get(code, pitch_name_raw),
                        "nameKo": PITCH_NAME_KO.get(code, pitch_name_raw),
                        "avgSpeed": avg_speed_mph,
                        "movement": PITCH_MOVEMENT.get(code, ""),
                        "ratio": ratio,
                    })

            if pitch_data:
                # Sort by usage ratio descending
                pitch_data.sort(key=lambda x: x["ratio"], reverse=True)
                results[pid] = pitch_data
                print(f"  -> {len(pitch_data)} pitch types found:")
                for p in pitch_data:
                    print(f"     {p['code']:>3} ({p['nameKo']}) avg {p['avgSpeed']}mph, usage {p['ratio']}%")
            else:
                print(f"  -> No pitch type data found. Check page structure.")
                # Save page source for debugging
                debug_path = SCRIPT_DIR / f"debug_{pid}.html"
                with open(debug_path, "w", encoding="utf-8") as f:
                    f.write(driver.page_source)
                print(f"  -> Saved page HTML to {debug_path} for debugging")

        except Exception as e:
            print(f"  ERROR: {e}")
            import traceback
            traceback.print_exc()

    driver.quit()
    return results


# ---------------------------------------------------------------------------
# CSV fallback (manual data entry)
# ---------------------------------------------------------------------------
def load_from_csv() -> dict:
    """
    Load pitch data from CSV file as fallback.
    Expected CSV format (scripts/kbo_pitchers.csv):
        pitcher_id,pitch_type_ko,avg_speed_kmh
        an-woo-jin,포심,152
        an-woo-jin,슬라이더,137
        ...
    """
    csv_path = SCRIPT_DIR / "kbo_pitchers.csv"
    if not csv_path.exists():
        return {}

    print(f"\nLoading from CSV: {csv_path}")
    results = {}

    with open(csv_path, "r", encoding="utf-8") as f:
        import csv
        reader = csv.DictReader(f)
        for row in reader:
            pid = row["pitcher_id"]
            pitch_name = row["pitch_type_ko"].strip()
            speed_kmh = float(row["avg_speed_kmh"])

            code = None
            for ko_name, pitch_code in PITCH_CODE_MAP.items():
                if ko_name in pitch_name:
                    code = pitch_code
                    break

            if code is None:
                print(f"  Unknown pitch: '{pitch_name}' for {pid}")
                continue

            if pid not in results:
                results[pid] = []

            results[pid].append({
                "code": code,
                "name": PITCH_NAME_EN.get(code, pitch_name),
                "nameKo": PITCH_NAME_KO.get(code, pitch_name),
                "avgSpeed": kmh_to_mph(speed_kmh),
                "movement": PITCH_MOVEMENT.get(code, ""),
            })

    return results


# ---------------------------------------------------------------------------
# TypeScript writer
# ---------------------------------------------------------------------------
def write_ts(pitchers: list, pitch_data: dict):
    """Write src/data/kboPitcherProfiles.ts"""
    out_path = DATA_DIR / "kboPitcherProfiles.ts"
    lines = []
    lines.append("import type { KorPitcherProfile } from './types';")
    lines.append("")
    lines.append("export const KBO_PITCHERS: KorPitcherProfile[] = [")

    for p in pitchers:
        pid = p["id"]
        pitches = pitch_data.get(pid, [])

        if not pitches:
            print(f"  WARN: No pitch data for {p['nameKo']} ({pid}) - using fallback")
            # Use basic fallback based on known info
            pitches = get_fallback_pitches(p)

        lines.append("  {")
        lines.append(f"    id: '{pid}',")
        lines.append(f"    name: '{p['name']}',")
        lines.append(f"    nameKo: '{p['nameKo']}',")
        lines.append(f"    hand: '{p['hand']}',")
        lines.append(f"    style: '{p['style']}',")
        lines.append(f"    description: '{p['description']}',")
        lines.append(f"    pitches: [")

        for pitch in pitches:
            code = pitch["code"]
            name = pitch["name"]
            nameKo = pitch["nameKo"]
            speed = pitch["avgSpeed"]
            movement = pitch["movement"]
            lines.append(
                f"      {{ code: '{code}', name: '{name}', "
                f"nameKo: '{nameKo}', avgSpeed: {speed}, "
                f"movement: '{movement}' }},"
            )

        lines.append("    ],")
        lines.append("  },")

    lines.append("];")
    lines.append("")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\nWrote {out_path} ({len(pitchers)} pitchers)")


def get_fallback_pitches(pitcher: dict) -> list:
    """Return default pitch repertoire when scraping fails."""
    # Basic repertoire based on handedness
    if pitcher["hand"] == "L":
        return [
            {"code": "FF", "name": "Four-Seam", "nameKo": "포심", "avgSpeed": 91, "movement": "직선 궤도"},
            {"code": "SL", "name": "Slider", "nameKo": "슬라이더", "avgSpeed": 82, "movement": "가로 변화"},
            {"code": "CH", "name": "Changeup", "nameKo": "체인지업", "avgSpeed": 82, "movement": "속도 차 + 낙차"},
            {"code": "CU", "name": "Curveball", "nameKo": "커브", "avgSpeed": 76, "movement": "큰 낙차"},
        ]
    else:
        return [
            {"code": "FF", "name": "Four-Seam", "nameKo": "포심", "avgSpeed": 93, "movement": "직선 궤도"},
            {"code": "SL", "name": "Slider", "nameKo": "슬라이더", "avgSpeed": 84, "movement": "가로 변화"},
            {"code": "CH", "name": "Changeup", "nameKo": "체인지업", "avgSpeed": 84, "movement": "속도 차 + 낙차"},
        ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("  KBO Pitcher Pitch-Type Data Collector")
    print("  Source: statiz.co.kr (login required)")
    print("=" * 60)

    # Try CSV fallback first
    csv_data = load_from_csv()

    if csv_data:
        print(f"\nUsing CSV data ({len(csv_data)} pitchers)")
        pitch_data = csv_data
    else:
        # Try Selenium scraping
        mode = input("\nSelect mode:\n  1) Scrape from statiz.co.kr (Selenium)\n  2) Use fallback defaults\n> ").strip()

        if mode == "1":
            pitch_data = scrape_statiz(PITCHERS)
        else:
            print("\nUsing fallback defaults for all pitchers.")
            pitch_data = {}

    write_ts(PITCHERS, pitch_data)

    print("\nDone! To add more pitchers:")
    print("  1. Find the pitcher on statiz.co.kr")
    print("  2. Get the p_no from the URL (/player/?m=pitch_type&p_no=XXXX)")
    print("  3. Add an entry to the PITCHERS list in this script")
    print("  4. Re-run the script")
    print("\nOr create scripts/kbo_pitchers.csv with columns:")
    print("  pitcher_id,pitch_type_ko,avg_speed_kmh")


if __name__ == "__main__":
    main()
