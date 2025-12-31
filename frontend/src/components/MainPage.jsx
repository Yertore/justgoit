import Header from "./Header";
import Footer from "./Footer";
import QuestionList from "./QuestionList";
import Features from "./Features";
import "../index.css"

export default function MainPage() {
    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <Header />
            <QuestionList />
        </div>
        
    )
}