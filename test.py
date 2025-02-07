import json

def extract_verses(file_path):
    verse_dict = {}  # Dictionary with integer keys
    book_index = 0  # Track the book index
    book_map = {}  # To map book names to their assigned index
    current_book = None

    with open(file_path, 'r', encoding='utf-8') as file:
        next(file)  # Skip header

        for line in file:
            parts = line.strip().split("\t")  # Split by tab
            if len(parts) == 2:
                book_verse, verse_number = parts
                book_name = " ".join(book_verse.split()[:-1])  # Extract book name

                if book_name not in book_map:
                    book_map[book_name] = book_index  # Assign index to book name
                    verse_dict[book_index] = []  # Initialize list
                    book_index += 1

                try:
                    verse_dict[book_map[book_name]].append(int(verse_number))
                except ValueError:
                    print(f"Skipping invalid line: {line.strip()}")  # Debugging

    return verse_dict  # Return dictionary with integer keys

# Save data to JSON file
file_path = "bible_verses.txt"
verse_data = extract_verses(file_path)

json_path = "bible_verses.json"
with open(json_path, "w", encoding="utf-8") as json_file:
    json.dump(verse_data, json_file, ensure_ascii=False, indent=4)

print(f"Data saved to {json_path}")
