"""Regression checks for the mobile-first Project Command Center dashboard."""
from html.parser import HTMLParser
from pathlib import Path
import unittest


SOURCE = (Path(__file__).resolve().parents[1] / "index.html").read_text(encoding="utf-8")


class FilterButtonParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.buttons = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "button":
            return
        attributes = dict(attrs)
        if "data-filter" in attributes:
            self.buttons.append(attributes)


class DashboardMobileAccessibilityTests(unittest.TestCase):
    def test_filter_buttons_have_touch_targets_and_one_initial_selection(self):
        parser = FilterButtonParser()
        parser.feed(SOURCE)

        self.assertEqual(
            [button.get("data-filter") for button in parser.buttons],
            ["all", "active", "setup", "planned"],
        )
        self.assertEqual(
            [button.get("aria-pressed") for button in parser.buttons],
            ["true", "false", "false", "false"],
        )
        self.assertEqual(SOURCE.count(".filter button{min-height:44px}"), 1)

    def test_filter_selection_updates_accessible_pressed_state(self):
        self.assertIn(
            'x.setAttribute("aria-pressed",String(selected))',
            SOURCE,
        )

    def test_keyboard_focus_is_visible_for_interactive_controls(self):
        self.assertIn(
            "button:focus-visible,a:focus-visible,input:focus-visible",
            SOURCE,
        )
        self.assertIn("outline-offset:3px", SOURCE)


    def test_golden_shield_card_links_current_research_and_holdout_status(self):
        self.assertIn(
            "https://github.com/JastoMk/operation-golden-shield/pull/19",
            SOURCE,
        )
        self.assertIn(
            "https://github.com/JastoMk/operation-golden-shield/actions/runs/41788531719",
            SOURCE,
        )
        self.assertIn("2027-05-03", SOURCE)
        self.assertIn("no forward results yet", SOURCE.lower())
        self.assertIn("research only", SOURCE.lower())
        self.assertIn("paper only", SOURCE.lower())


if __name__ == "__main__":
    unittest.main()
