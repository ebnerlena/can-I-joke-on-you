import numpy as np

ranking_probabilities = np.arange(1, 4)[::-1]  # Ranking probabilities [5, 4, 3, 2, 1]
probabilities = ranking_probabilities / np.sum(ranking_probabilities)

print("Ranking Probabilities:", ranking_probabilities)
print("Probabilities:", probabilities)

q_row = np.array([0.1, 0.4, 0.2, 0.3, 0.5])
top_indices = np.argsort(q_row)[:3]

print("Q-row:", q_row)
print("Top Indices:", top_indices)