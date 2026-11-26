import { MAX_GOALS, POINTS, TEAMS } from "./data";

export const getTeamName = (id) => {
  const team = TEAMS.find((t) => t.id === id);
  return team ? team.name : "";
};

export const getResult = (match) => {
  if (match.homeGoals > match.awayGoals) return "home";
  if (match.homeGoals < match.awayGoals) return "away";
  return "draw";
};

export const isValidGoals = (n) =>
  typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= MAX_GOALS;

export const calcStandings = (matches) => {
  const rows = TEAMS.map((team) => ({
    id: team.id,
    name: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    diff: 0,
    points: 0,
  }));

  const rowMap = new Map(rows.map((row) => [row.id, row]));

  matches.forEach((match) => {
    const homeRow = rowMap.get(match.home);
    const awayRow = rowMap.get(match.away);
    if (!homeRow || !awayRow) return;

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.gf += match.homeGoals;
    homeRow.ga += match.awayGoals;
    awayRow.gf += match.awayGoals;
    awayRow.ga += match.homeGoals;

    const result = getResult(match);
    if (result === "home") {
      homeRow.won += 1;
      homeRow.points += POINTS.win;
      awayRow.lost += 1;
      awayRow.points += POINTS.loss;
    } else if (result === "away") {
      awayRow.won += 1;
      awayRow.points += POINTS.win;
      homeRow.lost += 1;
      homeRow.points += POINTS.loss;
    } else {
      homeRow.drawn += 1;
      awayRow.drawn += 1;
      homeRow.points += POINTS.draw;
      awayRow.points += POINTS.draw;
    }
  });

  const computed = rows.map((row) => ({
    ...row,
    diff: row.gf - row.ga,
  }));

  return [...computed].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name, "vi");
  });
};

export const calcMatchStats = (matches) => {
  const count = matches.length;
  const counts = { home: 0, draw: 0, away: 0 };
  let goals = 0;

  matches.forEach((match) => {
    goals += match.homeGoals + match.awayGoals;
    const result = getResult(match);
    counts[result] += 1;
  });

  const average = count === 0 ? 0 : Math.round((goals / count) * 100) / 100;

  return { count, goals, average, counts };
};
