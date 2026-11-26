import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';
import StandingsTable from './components/StandingsTable';
import { useNotice } from './context/NoticeContext';
import { useTheme } from './context/ThemeContext';
import { MAX_GOALS, RESULT_LABELS, ROUNDS } from './data';
import {
  removeMatch,
  selectMatches,
  setGoals,
  setMatches,
} from './features/matchesSlice';
import { useFetch } from './hooks/useFetch';
import {
  calcMatchStats,
  calcStandings,
  getResult,
  getTeamName,
  isValidGoals,
} from './utils';

const App = () => {
  const { data, loading, error } = useFetch('/data/matches.json');
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const [selectedRound, setSelectedRound] = useState('all');

  useEffect(() => {
    if (data) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

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
    dispatch(
      setGoals({
        id: match.id,
        homeGoals: field === 'homeGoals' ? value : match.homeGoals,
        awayGoals: field === 'awayGoals' ? value : match.awayGoals,
      })
    );
  };

  const handleRemove = (match) => {
    dispatch(removeMatch(match.id));
    showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
  };

  if (loading) {
    return (
      <div className={`app ${theme}`}>
        <p>Đang tải lịch thi đấu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`app ${theme}`}>
        <p>Không tải được lịch thi đấu</p>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <h1>Giải bóng đá khoa</h1>
        <button type="button" className="theme-btn" onClick={toggleTheme}>
          {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
        </button>
      </header>

      <StandingsTable standings={standings} />

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
                      <button type="button" onClick={() => handleRemove(match)}>
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

      <AddMatchForm />

      <GoalPlanner standings={standings} />
    </div>
  );
};

export default App;