import pandas as pd
import html

# Read the CSV file
data = pd.read_csv('filtered_jokes_data_nourls.csv')

# Function to check for HTML entities in a string
def has_html_entities(text):
    unescaped_text = html.unescape(text)
    return text != unescaped_text

# Filter out rows containing HTML entities in the 'Joke' column
rows_with_html_entities = data[data['Joke'].apply(has_html_entities)]
for index, row in rows_with_html_entities.iterrows():
    print("Joke with weird characters:", row['Joke'])

filtered_data = data[~data['Joke'].apply(has_html_entities)]

# Write the filtered data back to a CSV file
filtered_data.to_csv('filtered_jokes_data_nourls_nowrdchar.csv', index=False)