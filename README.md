# Can I joke on you?

## Team

- Anicet Nougaret
- Lena Ebner
- Jens De Bock

## Idea

A robot that tells jokes to the user. Able to detect the user’s facial expressions, he learns to pick jokes the user seems to like.

## Get Started

- `docker-compose up`

## Content

- [Joke Recommender](./joke_recommender/)
- [Emotion Classifier](./emotion_classification/)
- [Robot UI](./robot_ui/)
- [Presentations](./presentations)

## Links

- [General Document](https://docs.google.com/document/d/1xoBDYfB_tQNx1Hu9t8IMaJoRUrBUHCxZczYuDr3DBCg/edit#heading=h.rekzzaq41cmi)
- [Presentation 01](https://docs.google.com/presentation/d/1JB8wn9jGe2sOnM-HTnyxz9yOSQSLPO_NgbTbA2yuGwo/edit#slide=id.g288f80c3119_0_0)
- [Presentation 02](https://docs.google.com/presentation/d/1NLfo9PPdKefyPbRgMfm4sjhfsPoH3O5106PqlZcwzKk/edit#slide=id.g2963559f8a0_0_93)

## Resources

- https://huggingface.co/docs/transformers.js/index
- https://python.langchain.com/docs/use_cases/tagging
- Joke Dataset: https://www.kaggle.com/datasets/abhinavmoudgil95/short-jokes
- Smile Dataset:
  - https://www.kaggle.com/datasets/ananthu017/emotion-detection-fer
  - https://www.kaggle.com/datasets/chazzer/smiling-or-not-face-data
- Three.js https://threejs.org/examples/#webgl_animation_skinning_morph

## Deployment

VM IP: 193.170.119.173

- Frontend https://joke.servegame.com
- Backend http://joke-api.servegame.com

- install https certificat `sudo certbot --nginx --agree-tos --preferred-challenges http -d joke.servegame.com`
- both were started with pm2 and nginx reverse proxy
  - `pm2 start recommender.py --interpreter python3 --name "recommender"`
  - `pm2 start npm --name "robotui" -- start`
- `pm2 monit`
- `pm2 status`
- `pm2 logs`
