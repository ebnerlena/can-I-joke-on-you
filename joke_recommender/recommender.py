from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

EPSILON = 1.0
MIN_EPSILON = 0.1
GREEDYNESS_END = 60
JOKES_DATASET = "filtered_jokes_data.csv"
JOKES_CATEGORIES = "filtered_clusters_data.csv"
LEARNING_RATE = 0.1
DISCOUNT_FACTOR = 0.9
GREEDY_CATEGORIES_SPLIT = 0.3

jokes_dataset = pd.read_csv(JOKES_DATASET)
jokes_categories = pd.read_csv(JOKES_CATEGORIES)
n_categories = jokes_categories.shape[0]

greedy_area = int(n_categories * GREEDY_CATEGORIES_SPLIT)
exploratory_area = n_categories - greedy_area

app = Flask(__name__)
CORS(app)

client_profiles = {}


def pick_random_joke_in_category(category):
    jokes_in_category = jokes_dataset[jokes_dataset["Cluster"] == category]
    return jokes_in_category.sample(1)["Joke"].tolist()[0]


# epsilon-greedy Q-table based recommender
def recommend_joke(client_id):
    if client_id not in client_profiles:
        client_profiles[client_id] = {
            "Q-row": np.full(n_categories, 0.5),
            "LastRecoCategory": None,
            "RecoCount": 0,
            "RSdisabled": False
        }

    greedyness_progress = client_profiles[client_id]["RecoCount"] / GREEDYNESS_END
    epsilon = EPSILON - greedyness_progress * (EPSILON - MIN_EPSILON)

    if client_profiles[client_id]["RSdisabled"]:
        random_category_index = np.random.randint(n_categories)
        recommended_category = jokes_categories.iloc[random_category_index][
            "Cluster"
        ]
        client_profiles[client_id]["LastRecoCategory"] = random_category_index
        recommended_joke = pick_random_joke_in_category(recommended_category)        
    elif np.random.rand() < epsilon:
        q_row = client_profiles[client_id]["Q-row"]
        top_indices = np.argsort(q_row)[:exploratory_area]
        ranking_probabilities = np.arange(1, exploratory_area+1)
        probabilities = ranking_probabilities / np.sum(ranking_probabilities)
        recommended_category_index = np.random.choice(top_indices, p=probabilities)

        recommended_category = jokes_categories.iloc[recommended_category_index][
            "Cluster"
        ]
        client_profiles[client_id]["LastRecoCategory"] = recommended_category_index
        recommended_joke = pick_random_joke_in_category(recommended_category)
    else:
        q_row = client_profiles[client_id]["Q-row"]
        top_indices = np.argsort(q_row)[-greedy_area:]
        ranking_probabilities = np.arange(1, greedy_area+1)[::-1]
        probabilities = ranking_probabilities / np.sum(ranking_probabilities)
        recommended_category_index = np.random.choice(top_indices, p=probabilities)

        recommended_category = jokes_categories.iloc[recommended_category_index][
            "Cluster"
        ]
        client_profiles[client_id]["LastRecoCategory"] = recommended_category_index
        recommended_joke = pick_random_joke_in_category(recommended_category)

    client_profiles[client_id]["RecoCount"] += 1

    return recommended_joke


def learn(client_id, rating):
    rating = rating * 2 - 1
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


@app.route("/categories", methods=["POST"])
def qrow():
    client_id = request.json["client_id"]
    if client_id not in client_profiles:
        return jsonify({"error": "Client not found."})
    qrow = client_profiles[client_id]["Q-row"].tolist()
    categories_names = jokes_categories["Top Words"].tolist()

    return jsonify({"status": "success", "scores": qrow, "categories": categories_names})


@app.route("/disable", methods=["POST"])
def disable():
    client_id = request.json["client_id"]
    if client_id not in client_profiles:
        return jsonify({"error": "Client not found."})
    client_profiles[client_id]["RSdisabled"] = True
    return jsonify({"status": "success"})


@app.route("/enable", methods=["POST"])
def enable():
    client_id = request.json["client_id"]
    if client_id not in client_profiles:
        return jsonify({"error": "Client not found."})
    client_profiles[client_id]["RSdisabled"] = False
    return jsonify({"status": "success"})

@app.route("/", methods=["GET"])
def hello():
    return jsonify({"status": "success", "message": "Hello world!"})


if __name__ == "__main__":
    app.run(debug=True)
