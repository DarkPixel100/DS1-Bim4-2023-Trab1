import React, { useState, useEffect } from "react";
import "./App.css";

function SearchBox({ setQueryReq }) {
  return (
    <input
      type="search"
      id="search"
      placeholder="Search by city name..."
      onChange={(e) => setQueryReq(e.target.value)}
      onBlur={(e) => (e.target.value = "")}/>
  );
}

function SearchSel({ queryRes, setLocation }) {
  return (
    <div>
      {queryRes.map((city) => (
        <div
          onClick={() => setLocation(city)}>
          {city.name}, {city.admin1}, {city.country_code}
        </div>
      ))}
    </div>
  );
}

function WeatherOverview({ location, forecast, icons }) {
  const date = new Date();
  const iso = date.toISOString();
  const val = iso.replace(iso.slice(-10), "00");
  const key = forecast.hourly.time.indexOf(val);

  const code = forecast.current.weathercode;
  const time = forecast.current.is_day ? "day" : "night";

  return (
    <ul>
      <li>{location.name}</li>
      <li>{forecast.current.temperature_2m}</li>
      <li>{forecast.hourly.precipitation_probability[key]}</li>
      <img src={icons[code][time].image} />
    </ul>
  );
}

function App() {
  // const [darkMode, setDarkMode] = useState(false);
  const [isOnLoad, setIsOnload] = useState(true);
  const [queryReq, setQueryReq] = useState("");
  const [queryRes, setQueryRes] = useState([]);
  const [location, setLocation] = useState({});
  const [forecast, setForecast] = useState({});
  const [wmoIcons, setWMOIcons] = useState({});

  async function getLocalGeocodings(queryReq) {
    const req = queryReq.replace(/\s/g, "+");
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${req}&count=5&language=en&format=json`;
    const res = await fetch(url);
    const obj = await res.json();

    setQueryRes(obj.results);
  }

  async function getWeatherForecast(latitude, longitude) {
    setIsOnload(true);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,apparent_temperature,is_day,precipitation,weathercode,windspeed_10m&hourly=temperature_2m,precipitation_probability,weathercode,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo`;
    const res = await fetch(url);
    const obj = await res.json();

    if (obj.current) {
      setForecast(obj);
      setIsOnload(false);
    }
  }

  async function getWeatherIcons() {
    const url =
      "https://gist.githubusercontent.com/stellasphere/9490c195ed2b53c707087c8c2db4ec0c/raw/76b0cb0ef0bfd8a2ec988aa54e30ecd1b483495d/descriptions.json";
    const res = await fetch(url);
    const obj = await res.json();

    setWMOIcons(obj);
  }

  useEffect(() => {
    getLocalGeocodings(queryReq);
  }, [queryReq]);

  useEffect(() => {
    getWeatherForecast(location.latitude, location.longitude);
    setQueryRes();
  }, [location]);

  useEffect(() => {
    getWeatherIcons();
  }, []);

  return (
    <div>
      {/* <button onClick={() => setDarkMode(!darkMode)}>Set dark mode</button> */}
      <div>
        <section>
          <div>
            <SearchBox setQueryReq={setQueryReq} />
            {queryRes ? (
              <SearchSel queryRes={queryRes} setLocation={setLocation} />
            ) : null}
          </div>
          <div>
            {isOnLoad ? (
              location.name ? (
                <p>Loading</p>
              ) : (
                <p>Please select a city</p>
              )
            ) : (
              <WeatherOverview
                location={location}
                forecast={forecast}
                icons={wmoIcons}
              />
            )}
            <article>atigo 2</article>
            <article>atigo 3</article>
          </div>
        </section>
        <aside>aside</aside>
      </div>
    </div>
  );
}

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
*/

export default App;
