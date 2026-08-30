import pandas as pd
import numpy as np
df = pd.DataFrame([{"Roll No": "123", "Name": "Alice", "Department": "CS"}])
df.loc[1] = [np.nan, "Bob", None]
df = df.where(pd.notnull(df), None)
print(df.to_dict('records'))

# also check if the column names change
print(df.columns)
