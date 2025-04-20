import re
import os
import tkinter as tk
from tkinter import filedialog
from tkinter.simpledialog import askfloat

import json
from tkinter.simpledialog import askstring

TICK_RESOLUTION = 192

GH_COLOR_TO_BEATZ = {
    '0': 'L',  # Green
    '1': 'D',  # Red
    '2': 'U',  # Yellow
    '3': 'R',  # Blue
    '4': 'DR'  # Orange
}

BEATZ_TO_GH_COLOR = {v: k for k, v in GH_COLOR_TO_BEATZ.items()}

def tick_to_ms(tick, bpm):
    return int((tick / TICK_RESOLUTION) * (60000 / bpm))

def ms_to_tick(ms, bpm):
    return int((ms / (60000 / bpm)) * TICK_RESOLUTION)

def parse_chart_to_beatz(chart_path):
    beatz_data = {
        'Song': '',
        'Charter': '',
        'noteMode': '0',
        'BPM': 0.0,
        'noteSpeed': '4.5',
        'noteSpawnY': '270',
        'Notes': []
    }

    with open(chart_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    in_song_section = False
    in_sync_track = False
    in_notes_section = False
    in_events_section = False

    for line in lines:
        line = line.strip()

        if line.startswith('[Song]'):
            in_song_section = True
            in_sync_track = in_notes_section = in_events_section = False
            continue
        elif line.startswith('[SyncTrack]'):
            in_sync_track = True
            in_song_section = in_notes_section = in_events_section = False
            continue
        elif '[ExpertSingle]' in line:
            in_notes_section = True
            in_sync_track = in_song_section = in_events_section = False
            continue
        elif '[Events]' in line:
            in_events_section = True
            in_notes_section = in_sync_track = in_song_section = False
            continue
        elif line.startswith('['):
            in_song_section = in_sync_track = in_notes_section = in_events_section = False
            continue

        if in_song_section and '=' in line:
            key, value = [x.strip() for x in line.split('=', 1)]
            if key == 'Name':
                beatz_data['Song'] = value.strip('"')
                print(f"Song name detected: {beatz_data['Song']}")
            elif key == 'Charter':
                beatz_data['Charter'] = value.strip('"')
                print(f"Charter detected: {beatz_data['Charter']}")
            elif key == 'Resolution':
                global TICK_RESOLUTION
                TICK_RESOLUTION = int(value)
                print(f"Resolution set to: {TICK_RESOLUTION}")

        elif in_sync_track:
            match = re.match(r'(\d+)\s*=\s*B\s+(\d+)', line)
            if match:
                tick, bpm_value = match.groups()
                beatz_data['BPM'] = int(int(bpm_value) / 1000)
                print(f"BPM found at tick {tick}: {beatz_data['BPM']}")

        elif in_notes_section:
            match = re.match(r'(\d+)\s*=\s*N\s+(\d+)\s+(\d+)', line)
            if match:
                tick, color, sustain = match.groups()
                note_type = GH_COLOR_TO_BEATZ.get(color)
                if note_type:
                    current_mode = int(color) + 1
                    if current_mode > int(beatz_data['noteMode']):
                        beatz_data['noteMode'] = str(current_mode)
                        print(f"Updated noteMode to: {beatz_data['noteMode']} due to note color {color}")

                    timestamp = tick_to_ms(int(tick), beatz_data['BPM']) - 896
                    note_str = f"{note_type}/{max(0, timestamp)}"
                    if int(sustain) > 0:
                        hold_ms = tick_to_ms(int(sustain), beatz_data['BPM'])
                        note_str += f"!hold={hold_ms}"
                    beatz_data['Notes'].append(note_str)
                    print(f"Note parsed: {note_str}")

        elif in_events_section:
            match = re.match(r'(\d+)\s*=\s*E\s+(.+)', line)
            if match:
                tick, modifier_line = match.groups()
                timestamp = tick_to_ms(int(tick), beatz_data['BPM']) - 896
                modifiers = []

                parts = [part.strip() for part in modifier_line.split()]
                i = 0
                while i < len(parts):
                    if parts[i] in ['newSpeed', 'newSpawnY', 'newBPM', 'FSinc', 'bpmPulseInc', 'smallFSinc']:
                        if i+2 < len(parts) and parts[i+1] == '=':
                            modifiers.append(f"{parts[i]}={parts[i+2]}")
                            i += 3
                        else:
                            modifiers.append(parts[i])
                            i += 1
                    else:
                        i += 1

                if modifiers:
                    note_str = f"E/{max(0, timestamp)}!{' ; '.join(modifiers)}"
                    beatz_data['Notes'].append(note_str)
                    print(f"Event parsed: {note_str}")

    beatz_output = ""
    for key in ['Song', 'Charter', 'noteMode', 'BPM', 'noteSpeed', 'noteSpawnY']:
        beatz_output += f"{key}: {beatz_data[key]}\\"

    beatz_output += "Notes:" + ",".join(beatz_data['Notes'])
    return beatz_output

def parse_funkin_json_to_beatz(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if 'song' not in data or 'notes' not in data['song']:
        print("Invalid FNF JSON structure.")
        return ""

    song_data = data['song']
    player_choice = askstring("FNF Import", "Which side to import? (player/enemy/both/both_sides)").lower()

    beatz_data = {
        'Song': song_data.get('song', 'Untitled'),
        'Charter': 'FNF_Import',
        'noteMode': '8',
        'BPM': song_data.get('bpm', 120),
        'noteSpeed': '4.5',
        'noteSpawnY': '270',
        'Notes': []
    }

    print(f"Importing FNF chart: {beatz_data['Song']} with BPM {beatz_data['BPM']}")

    note_type_map = {
        0: 'L', 1: 'D', 2: 'U', 3: 'R',
        4: 'L', 5: 'D', 6: 'U', 7: 'R'
    }

    alt_note_map = {
        4: 'UL', 5: 'DL', 6: 'L', 7: 'D',
        0: 'U', 1: 'R', 2: 'DR', 3: 'UR'
    }

    for section in song_data['notes']:
        section_must_hit = section.get('mustHitSection', False)
        notes = section.get('sectionNotes', [])

        for note in notes:
            strum_time, lane, sustain = note[0], note[1], note[2]
            is_player_note = section_must_hit == False  # if section must hit is False, notes are player

            if player_choice == "both":
                note_letter = note_type_map.get(lane)
            elif player_choice == "both_sides":
                note_letter = alt_note_map.get(lane)
            elif player_choice == "player" and is_player_note:
                note_letter = note_type_map.get(lane)
            elif player_choice == "enemy" and not is_player_note:
                note_letter = note_type_map.get(lane)
            else:
                continue

            if not note_letter:
                continue

            timestamp = round(strum_time) - 896
            note_str = f"{note_letter}/{max(0, timestamp)}"
            if sustain > 0:
                note_str += f"!hold={round(sustain)}"
            beatz_data['Notes'].append(note_str)
            print(f"Note parsed: {note_str}")

    # Sort Notes by timestamp before encoding
    def extract_timestamp(note_str):
        timestamp_part = note_str.split("/")[1].split("!")[0]
        return int(timestamp_part)

    beatz_data['Notes'].sort(key=extract_timestamp)

    beatz_output = ""
    for key in ['Song', 'Charter', 'noteMode', 'BPM', 'noteSpeed', 'noteSpawnY']:
        beatz_output += f"{key}: {beatz_data[key]}\\" 
    beatz_output += "Notes:" + ",".join(beatz_data['Notes'])

    return beatz_output


def parse_osu_to_beatz(osu_path, bpm):
    beatz_data = {
        'Song': '',
        'Charter': '',
        'noteMode': '8',
        'BPM': bpm,
        'noteSpeed': '4.5',
        'noteSpawnY': '270',
        'Notes': []
    }

    with open(osu_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    in_metadata_section = False
    in_hitobjects_section = False
    x_positions = []

    for line in lines:
        line = line.strip()

        if line.startswith("[Metadata]"):
            in_metadata_section = True
            in_hitobjects_section = False
            continue
        elif line.startswith("[HitObjects]"):
            in_hitobjects_section = True
            in_metadata_section = False
            continue
        elif line.startswith("["):
            in_metadata_section = in_hitobjects_section = False
            continue

        if in_metadata_section and '=' in line:
            key, value = [x.strip() for x in line.split('=', 1)]
            if key == 'Title':
                beatz_data['Song'] = value.strip('"')
                print(f"Song detected: {beatz_data['Song']}")
            elif key == 'Creator':
                beatz_data['Charter'] = value.strip('"')
                print(f"Charter detected: {beatz_data['Charter']}")

        elif in_hitobjects_section:
            parts = line.split(",")
            if len(parts) < 6:
                continue
            try:
                x = int(parts[0])
            except ValueError:
                continue
            x_positions.append(x)

    unique_x = sorted(set(x_positions))
    num_keys = len(unique_x)
    if num_keys <= 0:
        print("No valid notes detected.")
        return ""

    print(f"Detected key count: {num_keys}")

    def map_x_to_type(x):
        if num_keys == 4:
            if x < 128:
                return 'L'
            elif x < 256:
                return 'D'
            elif x < 384:
                return 'U'
            else:
                return 'R'
        else:
            idx = unique_x.index(min(unique_x, key=lambda ux: abs(ux - x)))
            return ['L', 'D', 'U', 'R', 'DR'][idx % 5]

    in_hitobjects_section = False
    for line in lines:
        line = line.strip()
        if line == "[HitObjects]":
            in_hitobjects_section = True
            continue
        elif line.startswith("["):
            in_hitobjects_section = False
            continue
        if not in_hitobjects_section:
            continue

        parts = line.split(",")
        if len(parts) < 6:
            continue
        try:
            x, y, time = int(parts[0]), int(parts[1]), int(parts[2])
            type_flag = int(parts[3])
            object_params = parts[5]
        except ValueError:
            continue

        if not (type_flag & 1 or type_flag & 128):
            continue

        note_type = map_x_to_type(x)
        timestamp = time - 896
        note_str = f"{note_type}/{max(0, timestamp)}"

        if type_flag & 128 and ':' in object_params:
            hold_end = int(object_params.split(':')[0])
            hold_duration = hold_end - time
            note_str += f"!hold={hold_duration}"

        beatz_data['Notes'].append(note_str)
        print(f"Note parsed: {note_str}")

    beatz_output = ""
    for key in ['Song', 'Charter', 'noteMode', 'BPM', 'noteSpeed', 'noteSpawnY']:
        beatz_output += f"{key}: {beatz_data[key]}\\" 
    beatz_output += "Notes:" + ",".join(beatz_data['Notes'])
    return beatz_output

def parse_beatz_to_chart(beatz_path):
    with open(beatz_path, 'r', encoding='utf-8') as f:
        data = f.read()

    header, notes_line = data.split("Notes:")
    meta = dict(item.split(": ", 1) for item in header.strip("\\").split("\\"))
    bpm = float(meta.get('BPM', 120.0))

    output = []
    output.append("[Song]")
    output.append("{")
    output.append(f'  Name = "{meta.get("Song", "Untitled")}"')
    output.append(f'  Charter = "{meta.get("Charter", "Unknown")}"')
    output.append(f'  Resolution = {TICK_RESOLUTION}')
    output.append("}")
    output.append("")
    output.append("[SyncTrack]")
    output.append("{")
    output.append(f"  0 = B {int(bpm * 1000)}")
    output.append("}")
    output.append("")
    output.append("[Events]")
    output.append("{")

    note_lines = []
    event_lines = []

    for note in notes_line.split(","):
        if note.startswith("E/"):
            raw = note[2:]
            time_mod = raw.split("!", 1)
            ms = int(time_mod[0])
            tick = ms_to_tick(ms + 902, bpm)
            mods = time_mod[1].split(" ; ")
            event_lines.append(f"  {tick} = E {' '.join(mods)}")
        else:
            parts = note.split("/")
            if len(parts) >= 2:
                note_letter = parts[0]
                ms = int(parts[1].split("!")[0])
                hold = 0
                if "!hold=" in parts[1]:
                    hold = int(parts[1].split("!hold=")[1])
                tick = ms_to_tick(ms + 902, bpm)
                sustain = ms_to_tick(hold, bpm)
                note_lines.append(f"  {tick} = N {BEATZ_TO_GH_COLOR[note_letter]} {sustain}")

    output.append("}")
    output.append("")
    output.append("[ExpertSingle]")
    output.append("{")
    output.extend(note_lines)
    output.append("}")
    output[-len(note_lines)-2:-len(note_lines)-2] = event_lines

    return "\n".join(output)

def save_to_same_directory(content, original_filename, new_ext):
    directory = os.path.dirname(original_filename)
    base_name = os.path.splitext(os.path.basename(original_filename))[0]
    new_path = os.path.join(directory, base_name + new_ext)
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"File saved to: {new_path}")  # Debug print

def main():
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(
        title="Select .chart, .osu, .json or .beatz file",
        filetypes=[("Chart, osu or Beatz files", "*.chart *.osu *.beatz *.json")]
    )
    if not file_path:
        print("No file selected.")
        return

    if file_path.endswith(".chart"):
        beatz_content = parse_chart_to_beatz(file_path)
        save_to_same_directory(beatz_content, file_path, ".beatz")
    elif file_path.endswith(".osu"):
        bpm = askfloat("BPM Input", "Enter the BPM for the song:")
        if bpm is None:
            print("BPM not provided. Exiting.")
            return
        beatz_content = parse_osu_to_beatz(file_path, bpm)
        save_to_same_directory(beatz_content, file_path, ".beatz")
    elif file_path.endswith(".beatz"):
        chart_content = parse_beatz_to_chart(file_path)
        save_to_same_directory(chart_content, file_path, ".chart")
    elif file_path.endswith(".json"):
        beatz_content = parse_funkin_json_to_beatz(file_path)
        if beatz_content:
            save_to_same_directory(beatz_content, file_path, ".beatz")
    else:
        print("Unsupported file type.")

if __name__ == "__main__":
    main()
