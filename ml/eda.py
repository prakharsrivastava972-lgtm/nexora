import pandas as pd
import matplotlib.pyplot as plt

items = pd.read_csv("ml/data/processed/items.csv")
interactions = pd.read_csv("ml/data/processed/interactions.csv")

# 1. Difficulty distribution
items["difficulty"].value_counts().plot(kind="bar", title="Difficulty Distribution")
plt.tight_layout()
plt.savefig("ml/data/processed/eda_difficulty.png")
plt.close()

# 2. Rating distribution
items["rating"].plot(kind="hist", bins=20, title="Rating Distribution")
plt.tight_layout()
plt.savefig("ml/data/processed/eda_rating.png")
plt.close()

# 3. Interaction event type distribution
interactions["event_type"].value_counts().plot(kind="bar", title="Interaction Event Types")
plt.tight_layout()
plt.savefig("ml/data/processed/eda_events.png")
plt.close()

print("EDA charts saved to ml/data/processed/")
print("\nDifficulty counts:\n", items["difficulty"].value_counts())
print("\nRating stats:\n", items["rating"].describe())