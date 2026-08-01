from ml.evaluation.metrics import precision_at_k, recall_at_k, ndcg_at_k

def test_precision_at_k_perfect_match():
    recommended = [1, 2, 3, 4, 5]
    relevant = [1, 2, 3, 4, 5]
    assert precision_at_k(recommended, relevant, k=5) == 1.0

def test_precision_at_k_no_match():
    recommended = [1, 2, 3]
    relevant = [4, 5, 6]
    assert precision_at_k(recommended, relevant, k=3) == 0.0

def test_recall_at_k_partial_match():
    recommended = [1, 2, 3]
    relevant = [1, 2, 3, 4, 5]
    assert recall_at_k(recommended, relevant, k=3) == 0.6

def test_ndcg_at_k_perfect_ranking():
    recommended = [1, 2, 3]
    relevant = [1, 2, 3]
    assert ndcg_at_k(recommended, relevant, k=3) == 1.0

def test_ndcg_at_k_reversed_ranking_scores_lower():
    perfect = ndcg_at_k([1, 2, 3], [1, 2, 3], k=3)
    reversed_order = ndcg_at_k([3, 2, 1], [1], k=3)
    assert reversed_order < perfect