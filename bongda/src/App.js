import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MAX_GOALS, RESULT_LABELS, ROUNDS, TEAMS, formatDiff } from './data';
import { useFetch } from './hooks/useFetch';
import { matchesReducer } from './matchesReducer';
import { calcMatchStats, calcStandings, getResult, getTeamName, isValidGoals } from './utils';

const INITIAL_FORM = {
  round: '1',
  home: '',
  away: '',
  homeGoals: '',
  awayGoals: '',
};

const App = () => {
  const { data, loading, error } = useFetch('/data/matches.json');
  const [matches, dispatch] = useReducer(matchesReducer, []);
  const [selectedRound, setSelectedRound] = useState('all');
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const homeSelectRef = useRef(null);

  useEffect(() => {
    if (data) {
      dispatch({ type: 'LOAD', payload: data });
    }
  }, [data]);

  const visibleMatches = useMemo(() => {
    if (selectedRound === 'all') return matches;
    const roundNum = Number(selectedRound);
    return matches.filter((match) => match.round === roundNum);
  }, [matches, selectedRound]);

  const standings = useMemo(() => calcStandings(matches), [matches]);

  const stats = useMemo(() => calcMatchStats(visibleMatches), [visibleMatches]);

  const leaderText = useMemo(() => {
    if (matches.length === 0) return '-';
    const leader = standings[0];
    return `${leader.name} (${leader.points} điểm)`;
  }, [matches.length, standings]);

  const handleGoalsChange = (match, field, event) => {
    const value = event.target.valueAsNumber;
    if (!isValidGoals(value)) return;
    dispatch({
      type: 'SET_GOALS',
      payload: {
        id: match.id,
        homeGoals: field === 'homeGoals' ? value : match.homeGoals,
        awayGoals: field === 'awayGoals' ? value : match.awayGoals,
      },
    });
  };

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE', payload: id });
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    const homeId = Number(form.home);
    const awayId = Number(form.away);

    if (!form.home) {
      nextErrors.home = 'Hãy chọn đội nhà';
    }

    if (!form.away) {
      nextErrors.away = 'Hãy chọn đội khách';
    } else if (form.home && form.home === form.away) {
      nextErrors.away = 'Hai đội phải khác nhau';
    } else if (
      form.home &&
      matches.some(
        (m) =>
          (m.home === homeId && m.away === awayId) ||
          (m.home === awayId && m.away === homeId)
      )
    ) {
      nextErrors.away = 'Hai đội đã đá với nhau rồi';
    }

    const parsedHomeGoals = Number(form.homeGoals);
    if (form.homeGoals.trim() === '' || !isValidGoals(parsedHomeGoals)) {
      nextErrors.homeGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }

    const parsedAwayGoals = Number(form.awayGoals);
    if (form.awayGoals.trim() === '' || !isValidGoals(parsedAwayGoals)) {
      nextErrors.awayGoals = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    dispatch({
      type: 'ADD',
      payload: {
        round: Number(form.round),
        home: homeId,
        away: awayId,
        homeGoals: parsedHomeGoals,
        awayGoals: parsedAwayGoals,
      },
    });

    setForm(INITIAL_FORM);
    setFormErrors({});
    if (homeSelectRef.current) {
      homeSelectRef.current.focus();
    }
  };

  if (loading) {
    return (
      <div className="app">
        <p>Đang tải lịch thi đấu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <p>Không tải được lịch thi đấu</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Giải bóng đá khoa</h1>
      </header>

      <section className="section">
        <h2>Bảng xếp hạng</h2>
        <table>
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Đội</th>
              <th>Trận</th>
              <th>Thắng</th>
              <th>Hòa</th>
              <th>Thua</th>
              <th>BT</th>
              <th>BB</th>
              <th>HS</th>
              <th>Điểm</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const isLast = index === standings.length - 1;
              return (
                <tr key={row.id} className={isLast ? 'last-rank' : ''}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td>{formatDiff(row.diff)}</td>
                  <td>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>Thống kê</h2>
        <p>Số trận: {stats.count}</p>
        <p>Tổng số bàn thắng: {stats.goals}</p>
        <p>Bàn thắng mỗi trận: {stats.average.toFixed(2)}</p>
        <p>Đội dẫn đầu: {leaderText}</p>
      </section>

      <section className="section">
        <h2>Lịch thi đấu</h2>
        <div className="controls">
          <label htmlFor="round-filter">Xem vòng</label>
          <select
            id="round-filter"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {ROUNDS.map((round) => (
              <option key={round} value={String(round)}>
                {`Vòng ${round}`}
              </option>
            ))}
          </select>
        </div>

        {visibleMatches.length === 0 ? (
          <p>Chưa có trận đấu nào</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vòng</th>
                <th>Đội nhà</th>
                <th>BT nhà</th>
                <th>BT khách</th>
                <th>Đội khách</th>
                <th>Kết quả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleMatches.map((match) => {
                const homeName = getTeamName(match.home);
                const awayName = getTeamName(match.away);
                const result = getResult(match);
                return (
                  <tr key={match.id} className={result === 'draw' ? 'draw-row' : ''}>
                    <td>{match.round}</td>
                    <td>{homeName}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={MAX_GOALS}
                        value={match.homeGoals}
                        aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
                        onChange={(e) => handleGoalsChange(match, 'homeGoals', e)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={MAX_GOALS}
                        value={match.awayGoals}
                        aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
                        onChange={(e) => handleGoalsChange(match, 'awayGoals', e)}
                      />
                    </td>
                    <td>{awayName}</td>
                    <td>{RESULT_LABELS[result]}</td>
                    <td>
                      <button type="button" onClick={() => handleRemove(match.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <h2>Thêm trận đấu</h2>
        <form onSubmit={handleSubmit} noValidate className="match-form">
          <div className="form-field">
            <label htmlFor="match-round">Vòng</label>
            <select
              id="match-round"
              value={form.round}
              onChange={(e) => handleFormChange('round', e.target.value)}
            >
              {ROUNDS.map((round) => (
                <option key={round} value={String(round)}>
                  {`Vòng ${round}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="match-home">Đội nhà</label>
            <select
              id="match-home"
              ref={homeSelectRef}
              value={form.home}
              onChange={(e) => handleFormChange('home', e.target.value)}
            >
              <option value="">-- Chọn đội --</option>
              {TEAMS.map((team) => (
                <option key={team.id} value={String(team.id)}>
                  {team.name}
                </option>
              ))}
            </select>
            {formErrors.home && (
              <p role="alert" className="error-text">
                {formErrors.home}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="match-away">Đội khách</label>
            <select
              id="match-away"
              value={form.away}
              onChange={(e) => handleFormChange('away', e.target.value)}
            >
              <option value="">-- Chọn đội --</option>
              {TEAMS.map((team) => (
                <option key={team.id} value={String(team.id)}>
                  {team.name}
                </option>
              ))}
            </select>
            {formErrors.away && (
              <p role="alert" className="error-text">
                {formErrors.away}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="match-home-goals">Bàn thắng đội nhà</label>
            <input
              id="match-home-goals"
              type="number"
              value={form.homeGoals}
              onChange={(e) => handleFormChange('homeGoals', e.target.value)}
            />
            {formErrors.homeGoals && (
              <p role="alert" className="error-text">
                {formErrors.homeGoals}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="match-away-goals">Bàn thắng đội khách</label>
            <input
              id="match-away-goals"
              type="number"
              value={form.awayGoals}
              onChange={(e) => handleFormChange('awayGoals', e.target.value)}
            />
            {formErrors.awayGoals && (
              <p role="alert" className="error-text">
                {formErrors.awayGoals}
              </p>
            )}
          </div>

          <button type="submit">Thêm trận</button>
        </form>
      </section>
    </div>
  );
};

export default App;