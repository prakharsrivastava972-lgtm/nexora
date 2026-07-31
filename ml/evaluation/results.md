# Recommendation Model Evaluation Results

Evaluated on 449 users with held-out relevant interactions (like/save/complete), K=10.
Note: interaction data is synthetically generated (see Phase 4) — see README for context.

| Model          | Precision@10 | Recall@10 | NDCG@10 |
|----------------|--------------|-----------|---------|
| Popularity     | 0.0018       | 0.0122    | 0.0058  |
| Content-Based  | 0.0009       | 0.0058    | 0.0020  |
| Collaborative  | 0.0004       | 0.0033    | 0.0011  |
| Hybrid         | 0.0016       | 0.0106    | 0.0047  |