import numpy as np

def precision_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    if not rec_k:
        return 0
    hits = len(set(rec_k) & set(relevant))
    return hits / k

def recall_at_k(recommended, relevant, k):
    if not relevant:
        return 0
    rec_k = recommended[:k]
    hits = len(set(rec_k) & set(relevant))
    return hits / len(relevant)

def ndcg_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    dcg = sum(1 / np.log2(i + 2) for i, item in enumerate(rec_k) if item in relevant)
    idcg = sum(1 / np.log2(i + 2) for i in range(min(len(relevant), k)))
    return dcg / idcg if idcg > 0 else 0