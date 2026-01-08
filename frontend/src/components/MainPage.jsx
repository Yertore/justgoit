import Header from "./Header";
import Footer from "./Footer";
import QuestionList from "./questions/QuestionList";
import "../index.css"

export default function MainPage() {
    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <Header />
            <QuestionList />
        </div>
        
    )
}