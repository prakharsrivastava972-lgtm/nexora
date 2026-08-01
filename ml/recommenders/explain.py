def generate_explanation(content_score, collab_score, popularity_score, difficulty=None, user_difficulty=None):
    """
    Generate a human-readable explanation from actual scoring signals.
    Thresholds are tuned loosely based on our normalized 0-1 score ranges.
    """
    reasons = []

    if content_score > 0.5:
        reasons.append("Closely matches topics you've explored before")
    elif content_score > 0.25:
        reasons.append("Related to content you've shown interest in")

    if collab_score > 0.5:
        reasons.append("Users with similar activity patterns engaged with this")

    if popularity_score > 0.6:
        reasons.append("Popular among learners on the platform")

    if user_difficulty and difficulty == user_difficulty:
        reasons.append(f"Matches your {difficulty.lower()} skill level")

    if not reasons:
        reasons.append("Recommended based on overall platform trends")

    return reasons