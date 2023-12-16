import pandas as pd
import re

# Read the CSV file
data = pd.read_csv('filtered_jokes_data.csv')

# Function to check if a string contains a URL
def has_url(text):
    url_regex = r'https?://\S+'
    return bool(re.search(url_regex, text))

# Filter out rows containing URLs in the 'Joke' column
rows_with_urls = data[data['Joke'].apply(has_url)]
for index, row in rows_with_urls.iterrows():
    print("Joke being removed:", row['Joke'])

filtered_data = data[~data['Joke'].apply(has_url)]

# Write the filtered data back to a CSV file
filtered_data.to_csv('filtered_jokes_data_nourls.csv', index=False)
