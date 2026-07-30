import pandas as pd

df = pd.read_csv("ml/data/raw/courses.csv")

print("Shape:", df.shape)
print("\nColumns:", df.columns.tolist())
print("\nFirst 3 rows:\n", df.head(3))
print("\nMissing values per column:\n", df.isnull().sum())