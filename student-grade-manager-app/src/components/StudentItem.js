const getRank = (score) => {
  if (score >= 8) return 'Giỏi';
  if (score >= 6.5) return 'Khá';
  if (score >= 5) return 'Trung bình';
  return 'Yếu';
};

const StudentItem = ({ student, index, onDelete }) => {
  const { id, name, score, class: className } = student;

  return (
    <tr>
      <td>{index}</td>
      <td>{name}</td>
      <td>{className}</td>
      <td>{`${score.toFixed(1)}`}</td>
      <td>{getRank(score)}</td>
      <td>
        <button onClick={() => onDelete(id)}>Xóa</button>
      </td>
    </tr>
  );
};

export default StudentItem;