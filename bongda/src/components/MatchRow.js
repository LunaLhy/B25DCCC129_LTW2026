import { memo, useRef } from 'react';
import { MAX_GOALS, RESULT_LABELS } from '../data';
import { getResult, getTeamName, isValidGoals } from '../utils';

const MatchRow = memo(({ match, onGoals, onRemove }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const homeName = getTeamName(match.home);
  const awayName = getTeamName(match.away);
  const result = getResult(match);

  const handleGoalInput = (field, event) => {
    const value = event.target.valueAsNumber;
    if (!isValidGoals(value)) return;
    onGoals(
      match.id,
      field === 'homeGoals' ? value : match.homeGoals,
      field === 'awayGoals' ? value : match.awayGoals
    );
  };

  return (
    <tr className={result === 'draw' ? 'draw-row' : ''}>
      <td>{match.round}</td>
      <td>{homeName}</td>
      <td>
        <input
          type="number"
          min="0"
          max={MAX_GOALS}
          value={match.homeGoals}
          aria-label={`Bàn thắng nhà ${homeName} - ${awayName}`}
          onChange={(e) => handleGoalInput('homeGoals', e)}
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          max={MAX_GOALS}
          value={match.awayGoals}
          aria-label={`Bàn thắng khách ${homeName} - ${awayName}`}
          onChange={(e) => handleGoalInput('awayGoals', e)}
        />
      </td>
      <td>{awayName}</td>
      <td>{RESULT_LABELS[result]}</td>
      <td>{renderCount.current}</td>
      <td>
        <button type="button" onClick={() => onRemove(match)}>
          Xóa
        </button>
      </td>
    </tr>
  );
});

export default MatchRow;