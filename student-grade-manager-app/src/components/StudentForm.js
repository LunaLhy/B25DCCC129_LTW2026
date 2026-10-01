import { useState } from 'react';

const StudentForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedClass = className.trim();

    if (trimmedName === '' || score.trim() === '' || trimmedClass === '') {
      setError('Vui lòng nhập đầy đủ họ tên, điểm số và lớp.');
      return;
    }

    const scoreNumber = Number(score);
    if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 10) {
      setError('Điểm số phải nằm trong khoảng từ 0 đến 10.');
      return;
    }

    onAdd({ name: trimmedName, score: scoreNumber, class: trimmedClass });
    setName('');
    setScore('');
    setClassName('');
    setError('');
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Họ tên</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="score">Điểm số</label>
        <input
          id="score"
          type="number"
          step="0.1"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="class">Lớp</label>
        <input
          id="class"
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
      </div>
      <button type="submit">Thêm</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default StudentForm;