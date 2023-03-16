import pandas as pd

data = pd.read_csv("data/processed_teachers.csv", index_col=0)

# data["Full name"] = data["Full name"].str.strip()
# data = data.drop('delete_col', axis=1)

data.to_csv("data/processed_teachers.csv")