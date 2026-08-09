def generate_explanation(
    content_score,
    collab_score,
    popularity_score,
    difficulty=None,
    user_difficulty=None,
    matched_skills=None,
    top_category=None,
    recency_score=0,
):
    """
    Generate a human-readable explanation from actual scoring signals.
    Where possible, references specific skills/categories rather than generic phrases,
    so explanations vary meaningfully between recommendations.
    """
    reasons = []

    # Recency reasoning — highest priority signal, shown first when strong
    if recency_score > 0.5:
        reasons.append("Similar to what you interacted with most recently")

    # Content-based reasoning — reference actual matched skills when available
    if content_score > 0.5:
        if matched_skills:
            skill_str = ", ".join(matched_skills[:2])
            reasons.append(f"Strongly aligned with your interest in {skill_str}")
        else:
            reasons.append("Closely matches topics you've explored before")
    elif content_score > 0.25:
        if matched_skills:
            reasons.append(f"Touches on {matched_skills[0]}, which you've engaged with")
        else:
            reasons.append("Related to content you've shown interest in")

    # Collaborative reasoning
    if collab_score > 0.5:
        reasons.append("Learners with a similar activity pattern to yours completed this")
    elif collab_score > 0.3:
        reasons.append("Users with overlapping interests also viewed this")

    # Popularity reasoning
    if popularity_score > 0.6:
        reasons.append("One of the most enrolled courses on the platform right now")
    elif popularity_score > 0.35:
        reasons.append("Popular among learners on the platform")

    # Difficulty match
    if user_difficulty and difficulty == user_difficulty:
        reasons.append(f"Matches your current {difficulty.lower()} skill level")

    # Category-based reasoning
    if top_category and content_score > 0.3:
        reasons.append(f"Fits your recent focus on {top_category}")

    if not reasons:
        reasons.append("Recommended based on overall platform trends")

    # Deduplicate while preserving order, cap at 3 for readability
    seen = set()
    unique_reasons = []
    for r in reasons:
        if r not in seen:
            seen.add(r)
            unique_reasons.append(r)

    return unique_reasons[:3]