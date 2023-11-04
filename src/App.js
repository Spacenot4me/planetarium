import './App.css';
import planet1 from "./images/planet1.png"
import planet2 from "./images/planet2.png"
import planet3 from "./images/planet3.png"
import {Carousel, Image} from "react-bootstrap";

function App() {
    return (
        <Carousel variant="dark" fade={true} slide={true} interval={1}>
            <Carousel.Item>
                <div className="carousel-planet-item">
                    <Image src={planet1} className="planet-holder" />

                </div>
            </Carousel.Item>
            <Carousel.Item>
                <div className="carousel-planet-item">
                    <Image src={planet2} className="planet-holder" />

                </div>
            </Carousel.Item>
            <Carousel.Item>
                <div className="carousel-planet-item">
                <Image src={planet3} className="planet-holder" />

                </div>
            </Carousel.Item>
        </Carousel>

    );
}

export default App;
