import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddMatchForm from './components/AddMatchForm';
import GoalPlanner from './components/GoalPlanner';
import MatchRow from './components/MatchRow';
import StandingsTable from './components/StandingsTable';
import { useNotice } from './context/NoticeContext';
import { useTheme } from './context/ThemeContext';
import { RESULT_LABELS, ROUNDS } from './data';
import {
  removeMatch,
  selectMatches,
  setGoals,
  setMatches,
} from './features/matchesSlice';
import { useDebounce } from './hooks/useDebounce';
import { useFetch } from './hooks/useFetch';
import { useLocalStorage } from './hooks/useLocalStorage';
import { hasSaved } from './store';
import { calcMatchStats, calcStandings, getTeamName } from './utils';

const BUILD_TAG = 'TH03';

const App = () => {
  const { data, loading, error } = useFetch('/data/matches.json');
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const [selectedRound, setSelectedRound] = useLocalStorage('ltw_bongda_round', 'all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!hasSaved && data) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

  const roundMatches = useMemo(() => {
    if (selectedRound === 'all') return matches;
    const roundNum = Number(selectedRound);
    return matches.filter((match) => match.round === roundNum);
  }, [matches, selectedRound]);

  const visibleMatches = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) return roundMatches;
    return roundMatches.filter((match) => {
      const homeName = getTeamName(match.home).toLowerCase();
      const awayName = getTeamName(match.away).toLowerCase();
      return homeName.includes(keyword) || awayName.includes(keyword);
    });
  }, [roundMatches, debouncedSearch]);

  const standings = useMemo(() => calcStandings(matches), [matches]);

  const stats = useMemo(() => calcMatchStats(roundMatches), [roundMatches]);

  const leaderText = useMemo(() => {
    if (matches.length === 0) return '-';
    const leader = standings[0];
    return `${leader.name} (${leader.points} điểm)`;
  }, [matches.length, standings]);

  useEffect(() => {
    if (matches.length > 0 && standings.length > 0) {
      document.title = `${standings[0].name} dẫn đầu – Giải bóng đá khoa`;
    } else {
      document.title = 'Giải bóng đá khoa';
    }
  }, [matches.length, standings]);

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target;
      const tag = target ? target.tagName : '';
      const isEditing =
        tag === 'INPUT' ||
        tag === 'SELECT' ||
        tag === 'TEXTAREA' ||
        (target && target.isContentEditable);

      if (event.key === '/' && !isEditing) {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else if (
        event.key === 'Escape' &&
        document.activeElement === searchInputRef.current
      ) {
        setSearch('');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleGoals = useCallback(
    (id, homeGoals, awayGoals) => {
      dispatch(setGoals({ id, homeGoals, awayGoals }));
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (match) => {
      dispatch(removeMatch(match.id));
      showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
    },
    [dispatch, showNotice]
  );

  const handleTeamShift = (event) => {
    setSearch(event.target.value);
  };

  const handleReset = () => {
    if (!data) return;
    dispatch(setMatches(data));
    showNotice('Đã đặt lại dữ liệu mẫu');
  };

  if (!hasSaved && loading) {
    return (
      <div className={`app ${theme}`} data-build={BUILD_TAG}>
        <p>Đang tải lịch thi đấu...</p>
      </div>
    );
  }

  if (!hasSaved && error) {
    return (
      <div className={`app ${theme}`} data-build={BUILD_TAG}>
        <p>Không tải được lịch thi đấu</p>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
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

        <h3>Phân bố kết quả</h3>
        <ul className="dist-list">
          {Object.entries(RESULT_LABELS).map(([key, label]) => {
            const count = stats.counts[key];
            return (
              <li key={key} className="dist-item">
                <span>{`${label}: ${count}`}</span>
                <span
                  className="dist-bar"
                  style={{ width: `${count * 24}px` }}
                />
              </li>
            );
          })}
        </ul>
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

          <label htmlFor="team-search">Tìm đội</label>
          <input
            id="team-search"
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={handleTeamShift}
            placeholder="Nhập tên đội (phím /)"
          />
        </div>

        <p className="search-count">{`Tìm thấy ${visibleMatches.length} trận`}</p>

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
                <th>Số lần render</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleMatches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  onGoals={handleGoals}
                  onRemove={handleRemove}
                />
              ))}
            </tbody>
          </table>
        )}

        <div className="table-actions">
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={!data}
          >
            Đặt lại dữ liệu mẫu
          </button>
        </div>
      </section>

      <AddMatchForm />

      <GoalPlanner standings={standings} />
    </div>
  );
};

export default App;