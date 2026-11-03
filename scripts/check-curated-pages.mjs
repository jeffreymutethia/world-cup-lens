import assert from "node:assert/strict";

// Independently stated expectations, shared by local and explicitly authorized remote checks.
export async function checkCuratedPages(page) {
  const matches = [
    ["mexico-south-africa-2026-06-11", "2026-06-11", "Mexico", "South Africa", "2–0", "Group A", "Mexico City Stadium", false],
    ["usa-paraguay-2026-06-12", "2026-06-12", "USA", "Paraguay", "4–1", "Group D", "Los Angeles Stadium", false],
    ["norway-england-2026-07-11", "2026-07-11", "Norway", "England", "1–2", "Quarter-final", "Miami Stadium", true],
    ["argentina-switzerland-2026-07-11", "2026-07-11", "Argentina", "Switzerland", "3–1", "Quarter-final", "Kansas City Stadium", true],
    ["spain-argentina-2026-07-19", "2026-07-19", "Spain", "Argentina", "1–0", "Final", "New York New Jersey Stadium", true],
  ];
  let { html, status } = await page("/");
  assert.equal(status, 200);
  assert.ok(html.includes("Featured historical match") && html.includes("Norway") && html.includes("Switzerland"));
  assert.ok(html.includes("Not affiliated with, sponsored by or endorsed by FIFA"));
  assert.ok(!html.includes('value="archive"') && !html.includes("Copper Vale"));
  const featured = html.match(/href="(\/matches\/[^\"]+)"/)?.[1]?.replaceAll("&amp;", "&");
  assert.equal(featured, "/matches/norway-england-2026-07-11?mode=curated&date=2026-07-11");
  for (const [id, date, home, away, score, stage, venue, aet] of matches) {
    ({ html, status } = await page(`/?mode=curated&date=${date}`));
    assert.equal(status, 200);
    assert.ok(html.includes(home) && html.includes(away) && html.includes(score) && html.includes(stage) && html.includes(venue), id);
    assert.ok(html.includes(`/matches/${id}?mode=curated&amp;date=${date}`));
    ({ html, status } = await page(`/matches/${id}?mode=curated&date=${date}`));
    assert.equal(status, 200);
    for (const expected of [home, away, score, stage, venue, "Authored retrospective context", "separate from Match Lens", "Sources &amp; provenance", "wcl-curated-2026-v1", "primary source", "Kickoff clock time", "Back to selected matches"]) assert.ok(html.includes(expected), `${id}: ${expected}`);
    assert.ok(html.includes(aet ? "AET (after extra time)" : "normal time"));
    assert.ok(html.includes(`href="/?mode=curated&amp;date=${date}"`));
    assert.ok(!html.includes("Explore cached questions"));
  }
  console.log("PASS five exact curated results, four dates, AET, source attribution, detail/back and unofficial labels");
  for (const [path, expected] of [
    ["/?date=2026-02-30", "Invalid replay selection"],
    ["/?mode=curated&date=2026-07-20", "Invalid replay selection"],
    ["/?mode=curated&date=2026-06-13", "No curated matches for this date"],
    ["/matches/copper-tidal?mode=curated&date=2026-06-11", "Match not found in this selection"],
    ["/matches/norway-england-2026-07-11?mode=curated&date=2026-06-11", "Match not found in this selection"],
    ["/matches/mexico-south-africa-2026-06-11?mode=illustrative&date=2026-06-11", "Match not found in this selection"],
  ]) {
    ({ html, status } = await page(path));
    assert.equal(status, 200);
    assert.ok(html.includes(expected), path);
  }
  console.log("PASS curated invalid/empty states and fictional/history dataset isolation");
}
