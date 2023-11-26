import React, { useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.png";
import loading from "./imgs/Loading.svg";
import icons from "./jsons/climas.json";

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

function InfoDia({ previsao, icones }) {
  const date = new Date();
  const iso = date.toISOString();
  const day = iso.substring(0, 10);
  const hour = iso.replace(iso.slice(-10), "00");
  const dayKey = previsao.daily.time.indexOf(day);
  const hourKey = previsao.hourly.time.indexOf(hour);

  const code = previsao.current.weathercode;
  const turno = previsao.current.is_day ? "dia" : "noite";

  console.log(icons[code][turno].image);
  return (
    <div id="MainInfo" class={turno}>
      <img src={icons[code][turno].image} class="MainIcon" alt="" />
      <ul class="InfoDia">
        <li>
          <h2>{previsao.current.temperature_2m}°C</h2>
          <h3>{icons[code][turno].descricao}</h3>
          {previsao.daily.temperature_2m_max[dayKey]}°C /{" "}
          {previsao.daily.temperature_2m_min[dayKey]}°C - Sensação de{" "}
          {previsao.current.apparent_temperature}°C
        </li>
        <li>Umidade: {previsao.current.relativehumidity_2m}%</li>
        <li>
          Chance de chuva: {previsao.hourly.precipitation_probability[hourKey]}%
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
  const [previsao, setPrevisao] = useState({});

  async function getLocalGeocodings(queryReq) {
    const req = queryReq.replace(/\s/g, "+");
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${req}&count=5&language=en&format=json`;
    const res = await fetch(url);
    const obj = await res.json();

    setQueryRes(obj.results);
  }

  async function getPrevisaoTempo(latitude, longitude) {
    setIsOnload(true);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,apparent_temperature,is_day,weathercode&hourly=precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`;
    const res = await fetch(url);
    const obj = await res.json();

    if (obj.current) {
      setPrevisao(obj);
      setIsOnload(false);
    }
  }

  useEffect(() => {
    getLocalGeocodings(queryReq);
  }, [queryReq]);

  useEffect(() => {
    getPrevisaoTempo(location.latitude, location.longitude);
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
            <img class="loading" src={loading} alt="" />
          ) : (
            <h3>Selecione uma cidade</h3>
          )
        ) : (
          <div class="Info">
            <h2>
              {[location.name, ", ", location.admin1, " - ", location.country]}
            </h2>
            <InfoDia previsao={previsao}></InfoDia>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
