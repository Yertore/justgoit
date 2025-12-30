import Header from "./Header";
import Footer from "./Footer";
import QuestionCreateForm from "./QuestionCreateForm";
import QuestionList from "./QuestionList";
import Cards from "./Cards";
import "../style.css"

export default function MainPage() {
    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <Header />
            <QuestionCreateForm />
            <QuestionList />
        </div>
        
    )
}