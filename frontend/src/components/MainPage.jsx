import Header from "./Header";
import Footer from "./Footer";
import QuestionList from "./questions/QuestionList";
import "../index.css"

export default function MainPage() {
    return (
        <>
            <Header />
            <main className="site-main">
                <div className="site-main__inner">
                  <QuestionList />
                </div>
            </main>
            <Footer />
        </>
    )
}