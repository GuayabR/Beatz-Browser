import pyperclip

def adjust_timing(input_text, offset, invert_ud):
    adjusted_lines = []
    notes = []

    # Split input into metadata and note data
    if "Notes:" in input_text:
        meta_part, note_data = input_text.split("Notes:", 1)
    else:
        meta_part = ""
        note_data = input_text

    for entry in note_data.split(','):
        try:
            # Check if there are properties with "!"
            if '!' in entry:
                note_part, properties_part = entry.split('!', 1)
            else:
                note_part, properties_part = entry, None

            direction, time = note_part.split('/')
            time = int(time)

            notes.append((direction, time, properties_part))  # Store properties if available
        except ValueError:
            print(f"Invalid entry skipped: {entry}")

    # Invert U and D if requested, without collision
    if invert_ud:
        inverted_notes = []
        for direction, time, properties in notes:
            if direction == "U":
                inverted_notes.append(("TEMP_D", time, properties))
            elif direction == "D":
                inverted_notes.append(("TEMP_U", time, properties))
            else:
                inverted_notes.append((direction, time, properties))
        # Replace temporary placeholders with actual directions
        notes = []
        for direction, time, properties in inverted_notes:
            if direction == "TEMP_D":
                direction = "D"
            elif direction == "TEMP_U":
                direction = "U"
            notes.append((direction, time, properties))

    # Sort so that normal notes come first, then effect notes (E), both sorted by time
    notes.sort(key=lambda x: (x[0] == "E", x[1]))

    # Remove duplicate notes of same type within 20ms
    cleaned_notes = []
    last_seen = {}

    for direction, time, properties in notes:
        if direction in last_seen and time - last_seen[direction] < 35:
            print(f"Duplicate note detected and deleted: ({direction}, {time}, {properties})")
            continue
        last_seen[direction] = time
        cleaned_notes.append((direction, time, properties))

    notes = cleaned_notes

    # Remove notes that are inside the hold duration of the same type
    hold_ranges = []
    for direction, time, properties in notes:
        if properties and properties.startswith("hold="):
            duration = int(properties.split('=')[1])
            hold_ranges.append((direction, time, time + duration))

    filtered_notes = []
    for direction, time, properties in notes:
        if not properties or not properties.startswith("hold="):
            in_hold = False
            for h_dir, h_start, h_end in hold_ranges:
                if direction == h_dir and h_start < time < h_end:
                    print(f"Note inside hold range and removed: ({direction}, {time}, {properties})")
                    in_hold = True
                    break
            if in_hold:
                continue
        filtered_notes.append((direction, time, properties))

    notes = filtered_notes

    # Adjust timing with offset
    for direction, time, properties in notes:
        new_time = max(0, time + offset)  # Prevent negative time
        adjusted_note = f"{direction}/{new_time}"
        if properties:
            adjusted_note += f"!{properties}"
        adjusted_lines.append(adjusted_note)

    # Rebuild the full string with the unchanged metadata
    full_output = f"{meta_part}Notes:{','.join(adjusted_lines)}"
    return full_output

if __name__ == "__main__":
    input_text = input("Paste in your BEATZ X notes: ")
    try:
        offset = int(input("Enter offset in milliseconds (negative = earlier, positive = later): "))
        invert_input = input("Invert U and D notes? (Y/N): ").strip().upper()
        invert_ud = invert_input == "Y"
        result = adjust_timing(input_text, offset, invert_ud)
        pyperclip.copy(result)  # Copy to clipboard
        print("\nAdjusted output has been copied to clipboard!")
        print(result)
    except ValueError:
        print("Invalid offset value. Please enter a valid integer.")
