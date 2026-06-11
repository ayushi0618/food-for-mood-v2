function About(){
    return(
        <section className="section">
            <h2>How it works</h2>
            <div className="info-grid">
                <div className="info-card">
                    <h3>Step 1: Describe your situation</h3>
                    <p>Share a mood, event or situation in a few words.</p>
                </div>
                <div className="info-card">
                    <h3>Step 2: AI analyzes context</h3>
                    <p> Gemini understands the emotional context.
                        Our algorithm will suggest recipes tailored to your mood.</p>
                </div>
                <div className="info-card">
                    <h3>Step 3: Get a recommendation </h3>
                    <p>Recieve a comfort food suggestion with reasoning.
                        order the food at lowest price from nearest restuarant"
                    </p>
                </div>
            </div>
        </section>
    );
}
export default About;