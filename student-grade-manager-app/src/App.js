import { useState } from "react";
import "./App.css";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";

const initialStudents = [
  { id: 1, name: "Nguyễn Đức Duy", score: 8.5, class: "D25CQCC03-B" },
  { id: 2, name: "Phan Lạc Hưng", score: 6.5, class: "D25CQCC03-B" },
  { id: 3, name: "Lại Minh Cường", score: 4.0, class: "D25CQCC03-B" },
  { id: 4, name: "Lê Đức Mạnh", score: 9.0, class: "D25CQCC03-B" },
];

const App = () => {
  const [students, setStudents] = useState(initialStudents);
  const [filter, setFilter] = useState("all");

  const handleAdd = (student) => {
    setStudents((prev) => [...prev, { id: Date.now(), ...student }]);
  };

  const handleDelete = (id) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
  };

  const displayedStudents = students.filter(({ score }) => {
    if (filter === "good") return score >= 8;
    if (filter === "fail") return score < 5;
    return true;
  });

  const total = students.length;
  const average =
    total === 0
      ? 0
      : students.reduce((sum, { score }) => sum + score, 0) / total;

  return (
    <div className="container">
      <h1>Quản lý điểm sinh viên</h1>

      <StudentForm onAdd={handleAdd} />

      <div className="toolbar">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={filter === "good" ? "active" : ""}
          onClick={() => setFilter("good")}
        >
          Loại Giỏi (&gt;= 8)
        </button>
        <button
          className={filter === "fail" ? "active" : ""}
          onClick={() => setFilter("fail")}
        >
          Trượt môn (&lt; 5)
        </button>
      </div>

      <StudentList students={displayedStudents} onDelete={handleDelete} />

      <p className="summary">
        {`Tổng số sinh viên: ${total} | Điểm trung bình toàn lớp: ${average.toFixed(2)}`}
      </p>
    </div>
  );
};

export default App;
