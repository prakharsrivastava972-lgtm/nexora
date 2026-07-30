import pandas as pd
import numpy as np

np.random.seed(42)

items = pd.read_csv("ml/data/processed/items.csv")
n_users = 500
event_types = ["view", "click", "save", "like", "complete", "dislike"]
weights = [0.5, 0.25, 0.1, 0.08, 0.05, 0.02]

rows = []
for user_id in range(1, n_users + 1):
    n_events = np.random.randint(5, 40)
    item_ids = np.random.choice(items["item_id"], size=n_events, replace=True)
    events = np.random.choice(event_types, size=n_events, p=weights)
    for item_id, event in zip(item_ids, events):
        rows.append([user_id, item_id, event])

df = pd.DataFrame(rows, columns=["user_id", "item_id", "event_type"])
df.to_csv("ml/data/processed/interactions.csv", index=False)
print(f"Generated {len(df)} synthetic interactions across {n_users} users")
print(df.head())
print("\nEvent type distribution:\n", df["event_type"].value_counts())