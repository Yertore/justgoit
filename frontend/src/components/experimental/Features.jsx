import "./features.css"
export default function Features() {
    return (
        <section className="features">
            <div className="feature">
                <img src="https://img.icons8.com/color/96/000000/golang.png" alt="Go Icon"/>
                <h3>Вопросы с примерами</h3>
                <p>Разбор вопросов с реальными решениями</p>
            </div>
            <div className="feature">
                <img src="https://img.icons8.com/color/96/000000/code-file.png" alt="Code Icon"/>
                <h3>Алгоритмы и задачи</h3>
                <p>Проверка навыков решения задач</p>
            </div>
            <div className="feature">
                <img src="https://img.icons8.com/color/96/000000/interview.png" alt="Interview Icon"/>
                <h3>Советы по интервью</h3>
                <p>Как уверенно отвечать на вопросы</p>
            </div>
        </section>
    )
}