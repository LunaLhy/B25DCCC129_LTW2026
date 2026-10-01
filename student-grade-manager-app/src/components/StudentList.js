import StudentItem from "./StudentItem";

const StudentList = ({ students, onDelete }) => {
  if (students.length === 0) {
    return <p>Không có sinh viên nào.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Họ tên</th>
          <th>Lớp</th>
          <th>Điểm</th>
          <th>Xếp loại</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student, index) => (
          <StudentItem
            key={student.id}
            student={student}
            index={index + 1}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
};

export default StudentList;
