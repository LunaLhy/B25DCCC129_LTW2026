import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNotice } from '../context/NoticeContext';
import { ROUNDS, TEAMS } from '../data';
import { addMatch, selectMatches } from '../features/matchesSlice';
import { getTeamName, isValidGoals } from '../utils';

const INITIAL_FORM = {
  round: '1',
  home: '',
  away: '',
  homeGoals: '',
  awayGoals: '',
};

const AddMatchForm = () => {
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const showNotice = useNotice();
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const homeSelectRef = useRef(null);

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

    dispatch(
      addMatch({
        round: Number(form.round),
        home: homeId,
        away: awayId,
        homeGoals: parsedHomeGoals,
        awayGoals: parsedAwayGoals,
      })
    );

    showNotice(`Đã thêm trận ${getTeamName(homeId)} - ${getTeamName(awayId)}`);
    setForm(INITIAL_FORM);
    setFormErrors({});
    if (homeSelectRef.current) {
      homeSelectRef.current.focus();
    }
  };

  return (
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
  );
};

export default AddMatchForm;