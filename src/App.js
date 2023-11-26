import React, { useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.png";
import icon from "./icons/logo.png";

function Header() {
  return (
    <header>
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Clima</h1>
    </header>
  );
}

function SearchBox({ setQueryReq, setQueryRes }) {
  return (
    <input
      type="search"
      class="SearchBox"
      placeholder="Nome da cidade..."
      onChange={(e) => {
        setQueryReq(e.target.value);
        e.target.classList.add("filled");
      }}
    />
  );
}

function SearchSelect({ queryRes, setLocation }) {
  return (
    <div class="CityList">
      {queryRes.map((city, key) => (
        <p
          key={key}
          onClick={(e) => {
            e.target.parentElement.parentElement.children[0].value = "";
            setLocation(city);
          }}
        >
          {city.name}, {city.admin1}, {city.country_code}
        </p>
      ))}
    </div>
  );
}

function InfoDia({ forecast }) {
  const date = new Date();
  const iso = date.toISOString();
  const val = iso.replace(iso.slice(-10), "00");
  const key = forecast.hourly.time.indexOf(val);
  console.log(key);

  const code = forecast.current.weathercode;
  const time = forecast.current.is_day ? "dia" : "noite";

  return (
    <div id="MainInfo" class={time}>
      {/* <img src={icon} class="MainIcon" alt=""></img>; */}
      <p>{time}</p>
      <ul class="InfoDia">
        <li>
          <h2>{forecast.current.temperature_2m}°C</h2>
          <h3>Limpo {code}</h3>
          {forecast.daily.temperature_2m_max[key]}°C /{" "}
          {forecast.daily.temperature_2m_min[key]}°C - Sensação de{" "}
          {forecast.current.apparent_temperature}°C
        </li>
        <li>Umidade: {forecast.current.relativehumidity_2m}%</li>
        <li>
          Chance de chuva: {forecast.hourly.precipitation_probability[key]}%
        </li>
      </ul>
    </div>
  );
}

function App() {
  const [isOnLoad, setIsOnload] = useState(true);
  const [queryReq, setQueryReq] = useState("");
  const [queryRes, setQueryRes] = useState([]);
  const [location, setLocation] = useState({});
  const [forecast, setForecast] = useState({});

  async function getLocalGeocodings(queryReq) {
    const req = queryReq.replace(/\s/g, "+");
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${req}&count=5&language=en&format=json`;
    const res = await fetch(url);
    const obj = await res.json();

    setQueryRes(obj.results);
  }

  async function getWeatherForecast(latitude, longitude) {
    setIsOnload(true);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,apparent_temperature,is_day,weathercode&hourly=precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`;
    const res = await fetch(url);
    const obj = await res.json();

    if (obj.current) {
      setForecast(obj);
      setIsOnload(false);
    }
  }

  useEffect(() => {
    getLocalGeocodings(queryReq);
  }, [queryReq]);

  useEffect(() => {
    getWeatherForecast(location.latitude, location.longitude);
    setQueryRes();
  }, [location]);

  return (
    <div class="App">
      <Header></Header>
      <main>
        <div class="Search">
          <SearchBox setQueryReq={setQueryReq} setQueryRes={setQueryRes} />
          {queryRes ? (
            <SearchSelect queryRes={queryRes} setLocation={setLocation} />
          ) : null}
        </div>
        {isOnLoad ? (
          location.name ? (
            <h3>Loading</h3>
          ) : (
            <h3>Selecione uma cidade</h3>
          )
        ) : (
          <div class="Info">
            <h2>
              {[location.name, ", ", location.admin1, " - ", location.country]}
            </h2>
            <InfoDia forecast={forecast}></InfoDia>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
