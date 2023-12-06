from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

EPSILON = 1.0
MIN_EPSILON = 0.1
GREEDYNESS_END = 30
JOKES_DATASET = "filtered_jokes_data.csv"
JOKES_CATEGORIES = "filtered_clusters_data.csv"
LEARNING_RATE = 0.1
DISCOUNT_FACTOR = 0.9

jokes_dataset = pd.read_csv(JOKES_DATASET)
jokes_categories = pd.read_csv(JOKES_CATEGORIES)
n_categories = jokes_categories.shape[0]

app = Flask(__name__)

client_profiles = {}


def pick_random_joke_in_category(category):
    jokes_in_category = jokes_dataset[jokes_dataset["Cluster"] == category]
    return jokes_in_category.sample(1)["Joke"]


# epsilon-greedy Q-table based recommender
def recommend_joke(client_id):
    if client_id not in client_profiles:
        client_profiles[client_id] = {
            "Q-row": np.random.rand(n_categories),
            "LastRecoCategory": None,
            "RecoCount": 0,
        }

    greedyness_progress = client_profiles[client_id]["RecoCount"] / GREEDYNESS_END
    epsilon = EPSILON - greedyness_progress * (EPSILON - MIN_EPSILON)

    if np.random.rand() < epsilon:
        random_category = jokes_categories.sample(1)["Cluster"]
        random_category_index = jokes_categories.index[
            jokes_categories["Cluster"] == random_category
        ].tolist()[0]
        client_profiles[client_id]["LastRecoCategory"] = random_category_index
        recommended_joke = pick_random_joke_in_category(random_category)
    else:
        recommended_category_index = np.argmax(client_profiles[client_id]["Q-row"])
        recommended_category = jokes_categories.iloc[recommended_category_index][
            "Cluster"
        ]
        client_profiles[client_id]["LastRecoCategory"] = recommended_category_index
        recommended_joke = pick_random_joke_in_category(recommended_category)

    client_profiles[client_id]["RecoCount"] += 1

    return recommended_joke


def learn(client_id, rating):
    recommendation_index = client_profiles[client_id]["LastRecoCategory"]
    old_value = client_profiles[client_id]["Q-row"][recommendation_index]
    new_value = (1 - LEARNING_RATE) * old_value + LEARNING_RATE * (
        rating + DISCOUNT_FACTOR * np.max(client_profiles[client_id]["Q-row"])
    )
    client_profiles[client_id]["Q-row"][recommendation_index] = new_value


@app.route("/recommend", methods=["POST"])
def recommend():
    client_id = request.json["client_id"]
    recommended_joke = recommend_joke(client_id)
    return jsonify({"status": "success", "joke": recommended_joke})


@app.route("/rate", methods=["POST"])
def rate():
    client_id = request.json["client_id"]
    rating = request.json["rating"]

    if client_id not in client_profiles:
        return jsonify({"error": "Client not found."})
    if client_profiles[client_id]["LastRecoCategory"] is None:
        return jsonify({"error": "No recommendation to rate."})

    learn(client_id, rating)
    client_profiles[client_id]["LastRecoCategory"] = None

    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(debug=True)
